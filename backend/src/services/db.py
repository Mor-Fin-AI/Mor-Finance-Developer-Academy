"""
MongoDB Database Service — coordinates connections and handles user progress storage,
quiz logging, exercise submissions, certificate generation, and KPI calculations.
"""
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional
from motor.motor_asyncio import AsyncIOMotorClient
from src.config import settings

# Level definitions metadata for seeding
LEVEL_META = [
    {"level_id": 1, "title": "Blockchain Fundamentals", "total_lessons": 2},
    {"level_id": 2, "title": "Wallet Development",       "total_lessons": 2},
    {"level_id": 3, "title": "Smart Contract Development","total_lessons": 2},
    {"level_id": 4, "title": "DeFi Fundamentals",        "total_lessons": 1},
    {"level_id": 5, "title": "DAO Governance",            "total_lessons": 1},
    {"level_id": 6, "title": "MOR Finance Protocols",    "total_lessons": 1},
    {"level_id": 7, "title": "Ecosystem Track",           "total_lessons": 20},
]

class Database:
    client: Optional[AsyncIOMotorClient] = None
    db: Any = None

db_instance = Database()

def get_collection():
    """Retrieve the primary user data collection."""
    if db_instance.db is None:
        raise RuntimeError("Database not initialized")
    return db_instance.db["developer_academy_users"]

def get_forum_collection():
    """Retrieve the forum threads collection."""
    if db_instance.db is None:
        raise RuntimeError("Database not initialized")
    return db_instance.db["developer_academy_forum"]

def get_hackathons_collection():
    """Retrieve the hackathons collection."""
    if db_instance.db is None:
        raise RuntimeError("Database not initialized")
    return db_instance.db["developer_academy_hackathons"]

async def connect_to_mongo():
    """Initialize the MongoDB client connection."""
    print("🔌 Connecting to MongoDB...")
    db_instance.client = AsyncIOMotorClient(settings.mongodb_uri)
    # Parse DB name from URI (falls back to 'devjobs' or 'developer_academy')
    db_name = "devjobs"
    if "/" in settings.mongodb_uri.split("://")[1]:
        path = settings.mongodb_uri.split("://")[1].split("/")[1]
        if "?" in path:
            db_name = path.split("?")[0]
        elif path:
            db_name = path
    db_instance.db = db_instance.client[db_name]
    print(f"✅ Connected to MongoDB. Database: '{db_name}'")
    await seed_forum_threads()
    await seed_hackathons()


async def close_mongo_connection():
    """Close the MongoDB client connection."""
    if db_instance.client:
        db_instance.client.close()
        print("🛑 Closed MongoDB connection.")

def create_default_user_dict(user_id: str, auth_type: str) -> Dict[str, Any]:
    """Generate the initial schema for a new user."""
    levels = [
        {
            "level_id": m["level_id"],
            "title": m["title"],
            "completed_lessons": 0,
            "total_lessons": m["total_lessons"],
            "is_unlocked": (m["level_id"] == 1),
            "completed_at": None,
        }
        for m in LEVEL_META
    ]
    return {
        "_id": user_id,
        "user_id": user_id,
        "auth_type": auth_type,
        "xp": 0,
        "streak_days": 0,
        "current_level": 1,
        "overall_pct": 0.0,
        "active_track": "ethereum",
        "levels": levels,
        "last_active": datetime.now(timezone.utc),
        "registered_at": datetime.now(timezone.utc),
        "certificates": [],
        "quiz_attempts": [],
        "exercises_submitted": [],
        "github_activities": [],
        "mentor_chat_sessions": [],
        "hackathons_registered": [],
        "hackathon_submissions": {}
    }

async def get_or_create_user(user_id: str, auth_type: str = "demo") -> Dict[str, Any]:
    """Retrieve an existing user by direct ID, linked GitHub, or linked wallet, or create one if not found."""
    coll = get_collection()
    
    # 1. Try finding by matching _id directly
    user = await coll.find_one({"_id": user_id})
    
    # 2. If not found, try searching on linked fields
    if not user:
        if user_id.startswith("wallet-"):
            addr = user_id.replace("wallet-", "").lower()
            user = await coll.find_one({"wallet_address": addr})
        elif user_id.startswith("gh-"):
            uname = user_id.replace("gh-", "")
            user = await coll.find_one({"github_username": uname})
            
    # 3. Create if still not found
    if not user:
        user = create_default_user_dict(user_id, auth_type)
        if user_id.startswith("wallet-"):
            user["wallet_address"] = user_id.replace("wallet-", "").lower()
        elif user_id.startswith("gh-"):
            user["github_username"] = user_id.replace("gh-", "")
        await coll.insert_one(user)
    else:
        # Backward compatibility / link updates
        updated = False
        updates = {}
        if "hackathons_registered" not in user:
            user["hackathons_registered"] = []
            updates["hackathons_registered"] = []
            updated = True
        if "hackathon_submissions" not in user:
            user["hackathon_submissions"] = {}
            updates["hackathon_submissions"] = {}
            updated = True
        if user_id.startswith("wallet-") and "wallet_address" not in user:
            user["wallet_address"] = user_id.replace("wallet-", "").lower()
            updates["wallet_address"] = user_id.replace("wallet-", "").lower()
            updated = True
        elif user_id.startswith("gh-") and "github_username" not in user:
            user["github_username"] = user_id.replace("gh-", "")
            updates["github_username"] = user_id.replace("gh-", "")
            updated = True
        if "active_track" not in user:
            user["active_track"] = "ethereum"
            updates["active_track"] = "ethereum"
            updated = True
        if not any(l["level_id"] == 7 for l in user.get("levels", [])):
            lvl_meta_7 = next(m for m in LEVEL_META if m["level_id"] == 7)
            new_lvl_7 = {
                "level_id": 7,
                "title": f"{user.get('active_track', 'ethereum').capitalize()} Track",
                "completed_lessons": 0,
                "total_lessons": lvl_meta_7["total_lessons"],
                "is_unlocked": False,
                "completed_at": None,
            }
            user["levels"] = user.get("levels", []) + [new_lvl_7]
            updates["levels"] = user["levels"]
            updated = True
        
        # Self-healing: ensure all levels (1-7) have accurate total_lessons, completed_lessons, and overall_pct
        levels_list = user.get("levels", [])
        completed_ids = user.get("completed_lesson_ids", [])
        track = user.get("active_track", "ethereum")
        from src.services.lessons import LESSONS_DB, get_track_lessons
        
        for lvl in levels_list:
            if lvl["level_id"] == 7:
                t_lessons = get_track_lessons(track)
                lvl["title"] = f"{track.capitalize()} Track"
                lvl["total_lessons"] = len(t_lessons)
                lvl["completed_lessons"] = sum(1 for l in t_lessons if l.id in completed_ids)
            else:
                l_lessons = [l for l in LESSONS_DB.values() if l.level_id == lvl["level_id"]]
                lvl["total_lessons"] = len(l_lessons)
                lvl["completed_lessons"] = sum(1 for l in l_lessons if l.id in completed_ids)

        total_lessons_curriculum = sum(l["total_lessons"] for l in levels_list)
        total_completed_lessons = sum(l["completed_lessons"] for l in levels_list)
        overall_pct = round(total_completed_lessons / total_lessons_curriculum * 100, 1) if total_lessons_curriculum > 0 else 0.0
        
        user["levels"] = levels_list
        user["overall_pct"] = overall_pct
        updates["levels"] = levels_list
        updates["overall_pct"] = overall_pct
        updated = True

        if updated:
            await coll.update_one({"_id": user["_id"]}, {"$set": updates})
            
    return user

async def save_user_progress(user_id: str, progress_update: Dict[str, Any]):
    """Update progress metrics in the user document."""
    coll = get_collection()
    await coll.update_one(
        {"_id": user_id},
        {"$set": progress_update}
    )

async def log_quiz_attempt(user_id: str, lesson_id: str, score: float, level_id: int):
    """Add a quiz completion record and award XP."""
    coll = get_collection()
    attempt = {
        "lesson_id": lesson_id,
        "level_id": level_id,
        "score": score,
        "attempted_at": datetime.now(timezone.utc)
    }
    
    # Fetch user to calculate XP reward (e.g. 50 XP for completing a quiz)
    user = await get_or_create_user(user_id)
    # Check if they already attempted this lesson's quiz
    previous_attempt = next((q for q in user.get("quiz_attempts", []) if q["lesson_id"] == lesson_id), None)
    xp_to_add = 0
    if not previous_attempt and score >= 70.0: # passed
        xp_to_add = 50

    await coll.update_one(
        {"_id": user_id},
        {
            "$push": {"quiz_attempts": attempt},
            "$inc": {"xp": xp_to_add},
            "$set": {"last_active": datetime.now(timezone.utc)}
        }
    )
    if score >= 70.0:
        await complete_lesson_for_user(user_id, level_id, lesson_id)

async def log_exercise_submission(user_id: str, lesson_id: str, code: str, passed: bool, level_id: int):
    """Add a coding exercise submission record and award XP."""
    coll = get_collection()
    submission = {
        "lesson_id": lesson_id,
        "level_id": level_id,
        "code": code,
        "passed": passed,
        "submitted_at": datetime.now(timezone.utc)
    }
    
    # Fetch user to check if this is their first passed attempt for this exercise
    user = await get_or_create_user(user_id)
    previous_pass = next((s for s in user.get("exercises_submitted", []) if s["lesson_id"] == lesson_id and s["passed"]), None)
    xp_to_add = 0
    if not previous_pass and passed:
        xp_to_add = 100 # 100 XP for coding exercise completion

    await coll.update_one(
        {"_id": user_id},
        {
            "$push": {"exercises_submitted": submission},
            "$inc": {"xp": xp_to_add},
            "$set": {"last_active": datetime.now(timezone.utc)}
        }
    )
    if passed:
        await complete_lesson_for_user(user_id, level_id, lesson_id)

async def issue_certificate(user_id: str, level_id: int, title: str):
    """Issue a completed level certificate."""
    coll = get_collection()
    
    # Check if certificate already exists
    user = await get_or_create_user(user_id)
    exists = any(c["level_id"] == level_id for c in user.get("certificates", []))
    if exists:
        return

    cert = {
        "certificate_id": f"cert-{level_id}-{int(datetime.now(timezone.utc).timestamp())}",
        "level_id": level_id,
        "level_title": title,
        "issued_at": datetime.now(timezone.utc),
        "recipient": user_id
    }
    await coll.update_one(
        {"_id": user_id},
        {"$push": {"certificates": cert}}
    )

async def log_github_activity(user_id: str, message: str, commit_sha: str):
    """Log simulated or fetched Github activity."""
    coll = get_collection()
    activity = {
        "commit_sha": commit_sha,
        "message": message,
        "committed_at": datetime.now(timezone.utc)
    }
    await coll.update_one(
        {"_id": user_id},
        {
            "$push": {"github_activities": activity},
            "$set": {"last_active": datetime.now(timezone.utc)}
        }
    )

async def log_mentor_chat(user_id: str, session_id: str):
    """Update AI mentor chat interactions logs."""
    coll = get_collection()
    user = await get_or_create_user(user_id)
    sessions = user.get("mentor_chat_sessions", [])
    
    existing = next((s for s in sessions if s["session_id"] == session_id), None)
    if existing:
        await coll.update_one(
            {"_id": user_id, "mentor_chat_sessions.session_id": session_id},
            {
                "$inc": {"mentor_chat_sessions.$.messages_count": 1},
                "$set": {
                    "mentor_chat_sessions.$.last_chat_at": datetime.now(timezone.utc),
                    "last_active": datetime.now(timezone.utc)
                }
            }
        )
    else:
        new_session = {
            "session_id": session_id,
            "messages_count": 1,
            "last_chat_at": datetime.now(timezone.utc)
        }
        await coll.update_one(
            {"_id": user_id},
            {
                "$push": {"mentor_chat_sessions": new_session},
                "$set": {"last_active": datetime.now(timezone.utc)}
            }
        )

async def get_kpis() -> Dict[str, Any]:
    """Aggregate core metrics across the entire developer_academy_users collection."""
    coll = get_collection()
    
    # 1. Registered Users
    registered_users = await coll.count_documents({})
    
    # 2. Active Learners (last 7 days)
    seven_days_ago = datetime.now(timezone.utc) - timedelta(days=7)
    active_learners = await coll.count_documents({"last_active": {"$gte": seven_days_ago}})
    
    # 3. Course Completions (Users with overall_pct >= 100%)
    course_completions = await coll.count_documents({"overall_pct": {"$gte": 100.0}})
    
    # 4. Quiz Scores (Average of all passing quiz attempts)
    pipeline_quizzes = [
        {"$unwind": "$quiz_attempts"},
        {"$group": {"_id": None, "avg_score": {"$avg": "$quiz_attempts.score"}}}
    ]
    cursor_quizzes = coll.aggregate(pipeline_quizzes)
    quizzes_res = await cursor_quizzes.to_list(length=1)
    avg_quiz_score = round(quizzes_res[0]["avg_score"], 1) if quizzes_res else 0.0
    
    # 5. Coding Exercises Submitted (Total count)
    pipeline_exercises = [
        {"$project": {"count": {"$size": {"$ifNull": ["$exercises_submitted", []]}}}},
        {"$group": {"_id": None, "total": {"$sum": "$count"}}}
    ]
    cursor_exercises = coll.aggregate(pipeline_exercises)
    exercises_res = await cursor_exercises.to_list(length=1)
    coding_exercises = exercises_res[0]["total"] if exercises_res else 0
    
    # 6. Certificates Generated (Total count)
    pipeline_certs = [
        {"$project": {"count": {"$size": {"$ifNull": ["$certificates", []]}}}},
        {"$group": {"_id": None, "total": {"$sum": "$count"}}}
    ]
    cursor_certs = coll.aggregate(pipeline_certs)
    certs_res = await cursor_certs.to_list(length=1)
    certificates_issued = certs_res[0]["total"] if certs_res else 0
    
    # 7. GitHub Activity (Total count)
    pipeline_github = [
        {"$project": {"count": {"$size": {"$ifNull": ["$github_activities", []]}}}},
        {"$group": {"_id": None, "total": {"$sum": "$count"}}}
    ]
    cursor_github = coll.aggregate(pipeline_github)
    github_res = await cursor_github.to_list(length=1)
    github_activity = github_res[0]["total"] if github_res else 0
    
    # 8. AI Mentor Sessions (Total sessions count)
    pipeline_sessions = [
        {"$project": {"count": {"$size": {"$ifNull": ["$mentor_chat_sessions", []]}}}},
        {"$group": {"_id": None, "total": {"$sum": "$count"}}}
    ]
    cursor_sessions = coll.aggregate(pipeline_sessions)
    sessions_res = await cursor_sessions.to_list(length=1)
    ai_mentor_sessions = sessions_res[0]["total"] if sessions_res else 0
    
    return {
        "registered_users": registered_users,
        "active_learners": active_learners,
        "course_completion": course_completions,
        "avg_quiz_score": avg_quiz_score,
        "coding_exercises": coding_exercises,
        "certificates_issued": certificates_issued,
        "github_activity": github_activity,
        "ai_mentor_sessions": ai_mentor_sessions
    }



async def complete_lesson_for_user(user_id: str, level_id: int, lesson_id: str):
    """
    Mark a lesson as completed for the user, update completed_lessons counts per level,
    recalculate overall_pct, unlock next levels, and issue certificates.
    """
    coll = get_collection()
    user = await get_or_create_user(user_id)
    
    # We will track completed lesson ids in a field `completed_lesson_ids`.
    completed_ids = user.get("completed_lesson_ids", [])
    if lesson_id in completed_ids:
        return user # Already completed
    
    completed_ids.append(lesson_id)
    
    # Recalculate level progress
    levels = user.get("levels", [])
    total_lessons_curriculum = 0
    total_completed_lessons = 0
    
    active_track = user.get("active_track", "ethereum")
    from src.services.lessons import LESSONS_DB, get_track_lessons
    
    for lvl in levels:
        if lvl["level_id"] == 7:
            level_lessons = get_track_lessons(active_track)
            lvl["title"] = f"{active_track.capitalize()} Track"
        else:
            level_lessons = [l for l in LESSONS_DB.values() if l.level_id == lvl["level_id"]]
        
        lvl["total_lessons"] = len(level_lessons)
        
        # Count how many of these level lessons are completed
        lvl_completed_count = sum(1 for l in level_lessons if l.id in completed_ids)
        lvl["completed_lessons"] = lvl_completed_count
        
        total_lessons_curriculum += lvl["total_lessons"]
        total_completed_lessons += lvl["completed_lessons"]
        
        # Mark completed_at if all lessons completed
        if lvl_completed_count >= lvl["total_lessons"] and lvl["total_lessons"] > 0:
            if not lvl.get("completed_at"):
                lvl["completed_at"] = datetime.now(timezone.utc)
        
    # Unlock levels: a level is unlocked if the previous level is complete
    for i in range(len(levels)):
        if i == 0:
            levels[i]["is_unlocked"] = True
        else:
            prev_lvl = levels[i-1]
            if prev_lvl["completed_lessons"] >= prev_lvl["total_lessons"] and prev_lvl["total_lessons"] > 0:
                levels[i]["is_unlocked"] = True
                
    # Calculate overall percent
    overall_pct = round(total_completed_lessons / total_lessons_curriculum * 100, 1) if total_lessons_curriculum > 0 else 0.0
    
    # Find current level: highest unlocked level
    unlocked_levels = [lvl["level_id"] for lvl in levels if lvl["is_unlocked"]]
    current_level = max(unlocked_levels) if unlocked_levels else 1
    
    # Update fields in DB
    await coll.update_one(
        {"_id": user_id},
        {
            "$set": {
                "completed_lesson_ids": completed_ids,
                "levels": levels,
                "overall_pct": overall_pct,
                "current_level": current_level,
                "last_active": datetime.now(timezone.utc)
            }
        }
    )
    
    # If they completed this level, issue a certificate!
    current_lvl_obj = next((l for l in levels if l["level_id"] == level_id), None)
    if current_lvl_obj and current_lvl_obj["completed_lessons"] >= current_lvl_obj["total_lessons"]:
        await issue_certificate(user_id, level_id, current_lvl_obj["title"])

async def seed_forum_threads():
    """Seed initial threads if collection is empty."""
    coll = get_forum_collection()
    count = await coll.count_documents({})
    if count == 0:
        print("🌱 Seeding forum threads in MongoDB...")
        threads = [
            {
                "_id": "thread-1",
                "thread_id": "thread-1",
                "title": "How to optimize gas in Solidity?",
                "author": "AliceDev",
                "category": "Question",
                "content": "I am working on a DeFi protocol and the gas costs are higher than expected. What are some effective techniques to optimize gas usage in Solidity smart contracts? Any tips, resources, or examples would be greatly appreciated.",
                "tags": ["solidity", "gas", "optimization", "performance"],
                "replies_count": 2,
                "views_count": 156,
                "likes_count": 34,
                "created_at": "2026-07-11T12:00:00Z",
                "comments": [
                    {
                        "comment_id": "comment-1-1",
                        "author": "BlockMaster",
                        "content": "Here are key strategies:\n1. Use appropriate data types (uint256 vs uint8).\n2. Pack storage variables.\n3. Use calldata instead of memory for external functions.\n4. Optimize loops and avoid redundant computations.\n5. Use events instead of storing data.",
                        "created_at": "2026-07-11T14:30:00Z"
                    },
                    {
                        "comment_id": "comment-1-2",
                        "author": "SmartBuilder",
                        "content": "Also, consider caching state variables in memory when reading them multiple times inside a loop. That alone saves significant gas.",
                        "created_at": "2026-07-11T15:45:00Z"
                    }
                ]
            },
            {
                "_id": "thread-2",
                "thread_id": "thread-2",
                "title": "Best practices for smart contract security",
                "author": "Web3Learner",
                "category": "Discussion",
                "content": "Let's share smart contract security check lists. I'll start: always use reentrancy guards, validate all input arguments, and perform thorough unit testing. What else should be standard practice?",
                "tags": ["security", "solidity", "audit"],
                "replies_count": 1,
                "views_count": 89,
                "likes_count": 18,
                "created_at": "2026-07-10T09:15:00Z",
                "comments": [
                    {
                        "comment_id": "comment-2-1",
                        "author": "AliceDev",
                        "content": "Don't forget to avoid using block.timestamp for randomness, as miners can manipulate it to some extent. Use Chainlink VRF for secure on-chain randomness instead!",
                        "created_at": "2026-07-10T11:20:00Z"
                    }
                ]
            },
            {
                "_id": "thread-3",
                "thread_id": "thread-3",
                "title": "My First DeFi Project - Feedback Needed!",
                "author": "StakingPro",
                "category": "Showcase",
                "content": "Just finished building a staking contract where users receive reward tokens proportional to time locked. Please look at the code and let me know if there are structural issues.",
                "tags": ["defi", "staking", "feedback"],
                "replies_count": 0,
                "views_count": 42,
                "likes_count": 8,
                "created_at": "2026-07-12T10:00:00Z",
                "comments": []
            }
        ]
        await coll.insert_many(threads)
        print("🌱 Seeding forum threads complete.")

async def seed_hackathons():
    """Seed initial hackathons if collection is empty."""
    coll = get_hackathons_collection()
    # Drop old mock ones to ensure we seed the new diverse ones
    await coll.delete_many({"hackathon_id": {"$in": ["hack-1", "hack-2", "hack-3"]}})
    count = await coll.count_documents({})
    if count == 0:
        print("🌱 Seeding hackathons in MongoDB...")
        hacks = [
            {
                "_id": "hack-1",
                "hackathon_id": "hack-1",
                "title": "MOR Finance DeFi Innovation Hack",
                "description": "Build the next generation of DeFi protocols that solve real-world problems. Build protocols, yield optimizers, or dApps that advance the DeFi ecosystem.",
                "prize_pool": "$25,000",
                "start_date": "2026-08-15",
                "end_date": "2026-08-17",
                "status": "ongoing",
                "ecosystems": ["Ethereum", "Arbitrum", "Optimism"],
                "rules": [
                    "Teams can have 1 to 5 members.",
                    "Code must be submitted on a public GitHub repo before the deadline.",
                    "All smart contracts must be deployed to a testnet.",
                    "Include a 3-minute video presentation."
                ],
                "tracks": ["DeFi Protocols", "Yield Optimization", "Lending & Borrowing", "Derivatives"],
                "milestones": [
                    {"title": "Registration Opens", "date": "2026-07-15"},
                    {"title": "Registration Closes", "date": "2026-08-14"},
                    {"title": "Hackathon Starts", "date": "2026-08-15 9:00 AM UTC"},
                    {"title": "Hackathon Ends", "date": "2026-08-17 9:00 AM UTC"},
                    {"title": "Winners Announced", "date": "2026-08-20"}
                ]
            },
            {
                "_id": "hack-2",
                "hackathon_id": "hack-2",
                "title": "MOR Agentic AI Hackathon",
                "description": "Build autonomous AI agents that run on top of Morpheus decentralized compute networks. Design custom agent logic, wallets, or inference pools.",
                "prize_pool": "$50,000",
                "start_date": "2026-08-25",
                "end_date": "2026-08-28",
                "status": "ongoing",
                "ecosystems": ["Solana", "Arbitrum", "Base"],
                "rules": [
                    "Must be fully functional on testnet.",
                    "Must include integration with Morpheus smart contracts.",
                    "Open to teams of up to 4 members."
                ],
                "tracks": ["AI Agent Logic", "Compute Proofs", "Agent Wallets"],
                "milestones": [
                    {"title": "Registration Opens", "date": "2026-08-01"},
                    {"title": "Hackathon Starts", "date": "2026-08-25"},
                    {"title": "Hackathon Ends", "date": "2026-08-28"}
                ]
            },
            {
                "_id": "hack-3",
                "hackathon_id": "hack-3",
                "title": "Base Build in Public Hack",
                "description": "Create consumer dApps on Base. Focus on social integrations, identity, or gaming tools that leverage Base layer-2 scaling.",
                "prize_pool": "$20,000",
                "start_date": "2026-08-01",
                "end_date": "2026-08-10",
                "status": "ongoing",
                "ecosystems": ["Base", "Optimism"],
                "rules": [
                    "Must deploy to Base Goerli / Sepolia.",
                    "Project must be open source."
                ],
                "tracks": ["Social dApps", "Consumer Tech", "NFTs & Gaming"],
                "milestones": [
                    {"title": "Hackathon Starts", "date": "2026-08-01"},
                    {"title": "Hackathon Ends", "date": "2026-08-10"}
                ]
            },
            {
                "_id": "hack-4",
                "hackathon_id": "hack-4",
                "title": "Web3 Student Challenge",
                "description": "A beginner-friendly hackathon for students worldwide to build dApps using HTML, CSS, JavaScript, and Solidity.",
                "prize_pool": "$15,000",
                "start_date": "2026-09-01",
                "end_date": "2026-09-15",
                "status": "upcoming",
                "ecosystems": ["Polygon", "Base", "Solana"],
                "rules": [
                    "Must be a student or recent graduate.",
                    "Individual submissions only.",
                    "Submission must be fully functional."
                ],
                "tracks": ["Social dApps", "NFTs & Gaming", "Public Goods"],
                "milestones": [
                    {"title": "Registration Opens", "date": "2026-08-01"},
                    {"title": "Hackathon Starts", "date": "2026-09-01"},
                    {"title": "Hackathon Ends", "date": "2026-09-15"}
                ]
            },
            {
                "_id": "hack-5",
                "hackathon_id": "hack-5",
                "title": "NFT Builders Jam",
                "description": "Focus on building new NFT utility, dynamic metadata, or gaming assets using the ERC-721 and ERC-1155 standards.",
                "prize_pool": "$10,000",
                "start_date": "2026-09-20",
                "end_date": "2026-09-22",
                "status": "upcoming",
                "ecosystems": ["Avalanche", "Solana", "Ethereum"],
                "rules": [
                    "Open to anyone.",
                    "Up to 3 members per team.",
                    "Must use ERC-721A or custom ERC-1155."
                ],
                "tracks": ["NFT Utilities", "On-chain Games", "Dynamic Metadata"],
                "milestones": [
                    {"title": "Registration Opens", "date": "2026-08-20"},
                    {"title": "Hackathon Starts", "date": "2026-09-20"},
                    {"title": "Hackathon Ends", "date": "2026-09-22"}
                ]
            },
            {
                "_id": "hack-6",
                "hackathon_id": "hack-6",
                "title": "Arbitrum Orbit Hyperchain Jam",
                "description": "Deploy Orbit chains and build high-frequency DeFi applications on custom execution layer-3 nodes.",
                "prize_pool": "$40,000",
                "start_date": "2026-06-10",
                "end_date": "2026-06-12",
                "status": "completed",
                "ecosystems": ["Arbitrum"],
                "rules": [
                    "Must deploy a custom Orbit node.",
                    "Submission must include throughput metric charts."
                ],
                "tracks": ["Orbit Deployments", "Custom Gas Tokens", "Layer 3 Apps"],
                "milestones": [
                    {"title": "Hackathon Starts", "date": "2026-06-10"},
                    {"title": "Winners Announced", "date": "2026-06-15"}
                ]
            },
            {
                "_id": "hack-7",
                "hackathon_id": "hack-7",
                "title": "Solana Speedrun Game Jam",
                "description": "Build fast, on-chain games using Anchor, Rust, and Solana high-throughput transactions.",
                "prize_pool": "$30,000",
                "start_date": "2026-05-15",
                "end_date": "2026-05-17",
                "status": "completed",
                "ecosystems": ["Solana"],
                "rules": [
                    "Open-source Rust programs.",
                    "Must include a playable web build."
                ],
                "tracks": ["On-chain Arcade", "Dynamic Game State", "Solana Composability"],
                "milestones": [
                    {"title": "Hackathon Starts", "date": "2026-05-15"},
                    {"title": "Winners Announced", "date": "2026-05-20"}
                ]
            }
        ]
        await coll.insert_many(hacks)
        print("🌱 Seeding hackathons complete.")

