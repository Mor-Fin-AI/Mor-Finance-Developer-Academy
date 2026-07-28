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
    # await seed_forum_threads()
    # await seed_hackathons()


async def close_mongo_connection():
    """Close the MongoDB client connection."""
    if db_instance.client:
        db_instance.client.close()
        print("🛑 Closed MongoDB connection.")

def build_user_levels(active_track: str, completed_ids: List[str]):
    t_id = (active_track or "fundamentals").lower().strip()
    from src.services.lessons import LESSONS_DB, get_track_lessons
    
    computed_levels = []
    
    if t_id == "fundamentals":
        gen_levels_meta = [
            (1, "Blockchain Fundamentals & Web3 Core"),
            (2, "Smart Contract Architecture"),
            (3, "Token Standards & Asset Engineering"),
            (4, "Protocol Security & Vulnerability Audits"),
            (5, "DeFi Fundamentals & Liquidity Mechanics"),
            (6, "MOR Finance Protocols & Governance"),
        ]
        for lvl_id, title in gen_levels_meta:
            lvl_lessons = [l for l in LESSONS_DB.values() if l.level_id == lvl_id]
            completed_cnt = sum(1 for l in lvl_lessons if l.id in completed_ids)
            computed_levels.append({
                "level_id": lvl_id,
                "title": title,
                "total_lessons": len(lvl_lessons),
                "completed_lessons": completed_cnt,
                "is_unlocked": False,
                "completed_at": datetime.now(timezone.utc) if completed_cnt >= len(lvl_lessons) and len(lvl_lessons) > 0 else None
            })
    else:
        chain_name = t_id.capitalize()
        t_lessons = get_track_lessons(t_id)
        
        chain_levels_meta = [
            (1, f"{chain_name} Architecture & Core Principles", [t_lessons[0]] if len(t_lessons) > 0 else []),
            (2, f"{chain_name} Environment Setup & Tooling", [t_lessons[1]] if len(t_lessons) > 1 else []),
            (3, f"{chain_name} Starter Project 1 (GitHub Repo)", [t_lessons[2]] if len(t_lessons) > 2 else []),
            (4, f"{chain_name} Starter Project 2 (Full-Stack DApp)", [t_lessons[3]] if len(t_lessons) > 3 else []),
        ]
        for lvl_id, title, lvl_lessons in chain_levels_meta:
            completed_cnt = sum(1 for l in lvl_lessons if l.id in completed_ids)
            computed_levels.append({
                "level_id": lvl_id,
                "title": title,
                "total_lessons": len(lvl_lessons),
                "completed_lessons": completed_cnt,
                "is_unlocked": False,
                "completed_at": datetime.now(timezone.utc) if completed_cnt >= len(lvl_lessons) and len(lvl_lessons) > 0 else None
            })
            
    for i in range(len(computed_levels)):
        if i == 0:
            computed_levels[i]["is_unlocked"] = True
        else:
            prev = computed_levels[i-1]
            if prev["completed_lessons"] >= prev["total_lessons"] and prev["total_lessons"] > 0:
                computed_levels[i]["is_unlocked"] = True

    total_lessons_curriculum = sum(l["total_lessons"] for l in computed_levels)
    total_completed_lessons = sum(l["completed_lessons"] for l in computed_levels)
    overall_pct = round(total_completed_lessons / total_lessons_curriculum * 100, 1) if total_lessons_curriculum > 0 else 0.0

    return computed_levels, overall_pct

def create_default_user_dict(user_id: str, auth_type: str) -> Dict[str, Any]:
    """Generate the initial schema for a new user."""
    completed_ids: List[str] = []
    levels, overall_pct = build_user_levels("fundamentals", completed_ids)
    return {
        "_id": user_id,
        "user_id": user_id,
        "auth_type": auth_type,
        "xp": 0,
        "streak_days": 1,
        "current_level": 1,
        "overall_pct": overall_pct,
        "active_track": "fundamentals",
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
            user["active_track"] = "fundamentals"
            updates["active_track"] = "fundamentals"
            updated = True

        # Build dynamic levels matching active track
        completed_ids = user.get("completed_lesson_ids", [])
        track = user.get("active_track", "fundamentals")
        levels_list, overall_pct = build_user_levels(track, completed_ids)
        
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
    
    # Recalculate level progress dynamically based on active_track
    active_track = user.get("active_track", "fundamentals")
    from src.services.lessons import LESSONS_DB, get_track_lessons
    
    computed_levels = []
    
    if active_track.lower() == "fundamentals":
        # 6 General Core Web3 Chapters
        gen_levels_meta = [
            (1, "Blockchain Fundamentals & Web3 Core"),
            (2, "Smart Contract Architecture"),
            (3, "Token Standards & Asset Engineering"),
            (4, "Protocol Security & Vulnerability Audits"),
            (5, "DeFi Fundamentals & Liquidity Mechanics"),
            (6, "MOR Finance Protocols & Governance"),
        ]
        for lvl_id, title in gen_levels_meta:
            lvl_lessons = [l for l in LESSONS_DB.values() if l.level_id == lvl_id]
            completed_cnt = sum(1 for l in lvl_lessons if l.id in completed_ids)
            computed_levels.append({
                "level_id": lvl_id,
                "title": title,
                "total_lessons": len(lvl_lessons),
                "completed_lessons": completed_cnt,
                "is_unlocked": False,
                "completed_at": datetime.now(timezone.utc) if completed_cnt >= len(lvl_lessons) and len(lvl_lessons) > 0 else None
            })
    else:
        # Dedicated Chain Chapters (ONLY Chain-Specific Modules!)
        chain_name = active_track.capitalize()
        t_lessons = get_track_lessons(active_track)
        
        chain_levels_meta = [
            (1, f"{chain_name} Architecture & Core Principles", [t_lessons[0]] if len(t_lessons) > 0 else []),
            (2, f"{chain_name} Environment Setup & Tooling", [t_lessons[1]] if len(t_lessons) > 1 else []),
            (3, f"{chain_name} Starter Project 1 (GitHub Repo)", [t_lessons[2]] if len(t_lessons) > 2 else []),
            (4, f"{chain_name} Starter Project 2 (Full-Stack DApp)", [t_lessons[3]] if len(t_lessons) > 3 else []),
        ]
        for lvl_id, title, lvl_lessons in chain_levels_meta:
            completed_cnt = sum(1 for l in lvl_lessons if l.id in completed_ids)
            computed_levels.append({
                "level_id": lvl_id,
                "title": title,
                "total_lessons": len(lvl_lessons),
                "completed_lessons": completed_cnt,
                "is_unlocked": False,
                "completed_at": datetime.now(timezone.utc) if completed_cnt >= len(lvl_lessons) and len(lvl_lessons) > 0 else None
            })
            
    # Calculate unlock statuses: first level unlocked, subsequent unlocked if previous completed
    for i in range(len(computed_levels)):
        if i == 0:
            computed_levels[i]["is_unlocked"] = True
        else:
            prev = computed_levels[i-1]
            if prev["completed_lessons"] >= prev["total_lessons"] and prev["total_lessons"] > 0:
                computed_levels[i]["is_unlocked"] = True

    total_lessons_curriculum = sum(l["total_lessons"] for l in computed_levels)
    total_completed_lessons = sum(l["completed_lessons"] for l in computed_levels)
    overall_pct = round(total_completed_lessons / total_lessons_curriculum * 100, 1) if total_lessons_curriculum > 0 else 0.0
    levels = computed_levels
    
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
    """Seed initial threads for May - July 2026 developer cohort discussions."""
    coll = get_forum_collection()
    await coll.delete_many({})
    print("🌱 Seeding May–July 2026 forum threads in MongoDB...")
    threads = [
            {
                "_id": "thread-1",
                "thread_id": "thread-1",
                "title": "Understanding P2P Node Discovery & Cryptographic Hashing (Keccak256)",
                "author": "Alex.Mutua",
                "category": "Question",
                "content": "Hi everyone! Working through Level 1 of the Fundamentals track. Can someone explain why Keccak-256 is preferred over SHA-256 for EVM state Hashing?",
                "tags": ["fundamentals", "cryptography", "keccak256", "evm"],
                "replies_count": 2,
                "views_count": 184,
                "likes_count": 29,
                "created_at": "2026-05-04T12:00:00Z",
                "comments": [
                    {
                        "comment_id": "comment-1-1",
                        "author": "Lucas Meyer",
                        "content": "SHA-256 was used in Bitcoin, but Ethereum chose Keccak-256 because it provides higher security resistance against length-extension attacks without requiring extra HMAC padding.",
                        "created_at": "2026-05-04T14:30:00Z"
                    },
                    {
                        "comment_id": "comment-1-2",
                        "author": "Josephat Kiptoo",
                        "content": "Also, Keccak-256 is hardware-friendly when constructing Merkle Patricia Trie proofs inside Ethereum execution clients like Geth and Besu.",
                        "created_at": "2026-05-04T15:45:00Z"
                    }
                ]
            },
            {
                "_id": "thread-2",
                "thread_id": "thread-2",
                "title": "Avalanche Custom Subnet Genesis Configuration & Snow Consensus",
                "author": "Collins Omondi",
                "category": "Discussion",
                "content": "Successfully deployed a custom EVM Subnet using Avalanche CLI! Here is a breakdown on setting custom gas tokens and allocation parameters in your genesis.json file.",
                "tags": ["avalanche", "subnet", "consensus", "genesis"],
                "replies_count": 1,
                "views_count": 142,
                "likes_count": 22,
                "created_at": "2026-05-14T09:15:00Z",
                "comments": [
                    {
                        "comment_id": "comment-2-1",
                        "author": "Chloe Bennett",
                        "content": "Great write-up Collins! Are you utilizing Avalanche Warp Messaging (AWM) to bridge assets back to the C-Chain?",
                        "created_at": "2026-05-14T11:20:00Z"
                    }
                ]
            },
            {
                "_id": "thread-3",
                "thread_id": "thread-3",
                "title": "Base Sepolia Faucet & Build-Onchain-Apps Starter Kit Workflow",
                "author": "Naomi Wairimu",
                "category": "Showcase",
                "content": "Check out my first deployed counter dApp on Base Sepolia using Coinbase Build-Onchain-Apps! Faucet speed was under 2 seconds and frontend hooked up seamlessly with Wagmi.",
                "tags": ["base", "coinbase", "starter-kit", "frontend"],
                "replies_count": 2,
                "views_count": 198,
                "likes_count": 45,
                "created_at": "2026-05-22T10:00:00Z",
                "comments": [
                    {
                        "comment_id": "comment-3-1",
                        "author": "Gabriel Dupont",
                        "content": "Congrats Naomi! Coinbase Build-Onchain-Apps is super clean. Next step is linking Coinbase Smart Wallet Paymaster for gasless transactions.",
                        "created_at": "2026-05-22T12:10:00Z"
                    },
                    {
                        "comment_id": "comment-3-2",
                        "author": "Andrew Mwangi",
                        "content": "Submitting my Base Paymaster PR today as well! Let's collaborate on the frontend UI components.",
                        "created_at": "2026-05-22T13:40:00Z"
                    }
                ]
            },
            {
                "_id": "thread-4",
                "thread_id": "thread-4",
                "title": "Polygon CDK Validium Devnet Setup with Kurtosis",
                "author": "Ethan Brooks",
                "category": "Announcement",
                "content": "For anyone running Polygon CDK nodes locally, use Kurtosis-CDK package instead of manual Docker compose. Saves 20+ mins during local environment setup.",
                "tags": ["polygon", "cdk", "validium", "kurtosis"],
                "replies_count": 1,
                "views_count": 165,
                "likes_count": 31,
                "created_at": "2026-05-28T16:20:00Z",
                "comments": [
                    {
                        "comment_id": "comment-4-1",
                        "author": "Dennis Njuguna",
                        "content": "Thanks Ethan! Just tested this on Ubuntu 24.04 and the devnet spun up in under 3 minutes.",
                        "created_at": "2026-05-28T17:45:00Z"
                    }
                ]
            },
            {
                "_id": "thread-5",
                "thread_id": "thread-5",
                "title": "OP Stack Cross-Domain Messenger & Superchain State Interop",
                "author": "Patrick Muriithi",
                "category": "Discussion",
                "content": "Exploring cross-chain message passing on Optimism Sepolia. How are you handling L1-to-L2 gas buffer estimation in production contracts?",
                "tags": ["optimism", "op-stack", "superchain", "interop"],
                "replies_count": 2,
                "views_count": 210,
                "likes_count": 38,
                "created_at": "2026-06-05T14:10:00Z",
                "comments": [
                    {
                        "comment_id": "comment-5-1",
                        "author": "Ruth Nduta",
                        "content": "Always query the L1Block oracle contract (`0x4200000000000000000000000000000000000015`) for dynamic overhead fees before broadcasting state updates.",
                        "created_at": "2026-06-05T15:30:00Z"
                    },
                    {
                        "comment_id": "comment-5-2",
                        "author": "Mercy Wanjiru",
                        "content": "Agreed! That prevents transaction reverts during L1 congestion spikes.",
                        "created_at": "2026-06-05T16:50:00Z"
                    }
                ]
            },
            {
                "_id": "thread-6",
                "thread_id": "thread-6",
                "title": "Solana Anchor CPI Reentrancy Security & Account Validation",
                "author": "Yuki Takahashi",
                "category": "Question",
                "content": "When invoking CPIs in Anchor, what is the best practice for validating AccountInfo owners before data deserialization?",
                "tags": ["solana", "anchor", "rust", "security"],
                "replies_count": 2,
                "views_count": 255,
                "likes_count": 49,
                "created_at": "2026-06-12T11:00:00Z",
                "comments": [
                    {
                        "comment_id": "comment-6-1",
                        "author": "Godwin Otieno",
                        "content": "Use Anchor's typed `Account<'info, MyData>` constraint instead of raw `AccountInfo`. Anchor automatically enforces discriminator & program ID checks for you.",
                        "created_at": "2026-06-12T12:45:00Z"
                    },
                    {
                        "comment_id": "comment-6-2",
                        "author": "Ian Korir",
                        "content": "Also ensure you add `has_one` checks for authority keys so unauthorized users cannot spoof signers during cross-program invocation.",
                        "created_at": "2026-06-12T14:15:00Z"
                    }
                ]
            },
            {
                "_id": "thread-7",
                "thread_id": "thread-7",
                "title": "Arbitrum Nitro Execution Engine vs Stylus Rust Wasm Benchmarks",
                "author": "Victor Kipchirchir",
                "category": "Showcase",
                "content": "Benchmarked Stylus Rust against standard Solidity EVM bytecode for heavy array sorting. Stylus achieved 9.4x lower gas execution fees on Arbitrum Sepolia!",
                "tags": ["arbitrum", "stylus", "rust", "wasm", "benchmarks"],
                "replies_count": 2,
                "views_count": 320,
                "likes_count": 67,
                "created_at": "2026-06-18T15:30:00Z",
                "comments": [
                    {
                        "comment_id": "comment-7-1",
                        "author": "Godwin Otieno",
                        "content": "Incredible benchmark Victor! Stylus Wasm host I/O pricing is a game-changer for complex computational dApps.",
                        "created_at": "2026-06-18T16:50:00Z"
                    },
                    {
                        "comment_id": "comment-7-2",
                        "author": "Mei-Ling Wang",
                        "content": "Are you using the official Offchain Labs `stylus-hello-world` starter template for the Wasm target builds?",
                        "created_at": "2026-06-18T18:10:00Z"
                    }
                ]
            },
            {
                "_id": "thread-8",
                "thread_id": "thread-8",
                "title": "ERC-4337 Account Abstraction Paymasters & UserOp Bundlers",
                "author": "Eric Kimani",
                "category": "Discussion",
                "content": "Sharing our team's paymaster integration experience on Ethereum testnet. Gasless transactions & session keys dramatically increase Web3 user onboarding retention!",
                "tags": ["ethereum", "erc4337", "account-abstraction", "paymaster"],
                "replies_count": 2,
                "views_count": 289,
                "likes_count": 52,
                "created_at": "2026-06-24T08:45:00Z",
                "comments": [
                    {
                        "comment_id": "comment-8-1",
                        "author": "Faith Chebet",
                        "content": "ERC-4337 combined with passkey signatures makes dApps feel identical to Web2 social apps. Outstanding progress!",
                        "created_at": "2026-06-24T10:15:00Z"
                    },
                    {
                        "comment_id": "comment-8-2",
                        "author": "Andrew Mwangi",
                        "content": "We implemented this on Base Sepolia as well! Works seamlessly with Coinbase Smart Wallet.",
                        "created_at": "2026-06-24T11:30:00Z"
                    }
                ]
            },
            {
                "_id": "thread-9",
                "thread_id": "thread-9",
                "title": "Solana SPL-20 High-Throughput Token Program Deployment",
                "author": "Ian Korir",
                "category": "Showcase",
                "content": "Deployed an open-source SPL-20 token engine on Solana Devnet with Program Derived Addresses (PDAs) for automated vault locking.",
                "tags": ["solana", "spl20", "anchor", "pda"],
                "replies_count": 2,
                "views_count": 274,
                "likes_count": 58,
                "created_at": "2026-07-03T10:15:00Z",
                "comments": [
                    {
                        "comment_id": "comment-9-1",
                        "author": "Sheila Cherono",
                        "content": "Tested your Devnet deployment script Ian! The PDA seed verification passed with zero errors.",
                        "created_at": "2026-07-03T11:40:00Z"
                    },
                    {
                        "comment_id": "comment-9-2",
                        "author": "Brian Kiprop",
                        "content": "Solid work! Parallel execution speed is impressive on Sealevel runtime.",
                        "created_at": "2026-07-03T13:00:00Z"
                    }
                ]
            },
            {
                "_id": "thread-10",
                "thread_id": "thread-10",
                "title": "Coinbase Smart Wallet Paymaster & OnchainKit Integration on Base",
                "author": "Andrew Mwangi",
                "category": "Showcase",
                "content": "We just deployed the MOR Vault API with Coinbase Smart Wallet Paymaster on Base Sepolia. Passkey authentication feels indistinguishable from Web2 login!",
                "tags": ["base", "coinbase", "onchainkit", "paymaster"],
                "replies_count": 2,
                "views_count": 390,
                "likes_count": 84,
                "created_at": "2026-07-11T14:20:00Z",
                "comments": [
                    {
                        "comment_id": "comment-10-1",
                        "author": "Cynthia Achieng",
                        "content": "Tried out the live demo on Base Sepolia! The passkey popup authenticated in 1.2 seconds.",
                        "created_at": "2026-07-11T16:00:00Z"
                    },
                    {
                        "comment_id": "comment-10-2",
                        "author": "Tariq Al-Hassan",
                        "content": "Awesome job Andrew! This is going to be super useful for onboarding non-crypto native developers.",
                        "created_at": "2026-07-11T17:25:00Z"
                    }
                ]
            },
            {
                "_id": "thread-11",
                "thread_id": "thread-11",
                "title": "Arbitrum Stylus Rust Wasm Production Credential Claimed",
                "author": "Godwin Otieno",
                "category": "Announcement",
                "content": "Extremely excited to announce that I have passed the Arbitrum Stylus Rust Wasm audit assessment and claimed my verified MOR Developer Credential on-chain!",
                "tags": ["arbitrum", "stylus", "certification", "credential"],
                "replies_count": 2,
                "views_count": 412,
                "likes_count": 96,
                "created_at": "2026-07-19T09:30:00Z",
                "comments": [
                    {
                        "comment_id": "comment-11-1",
                        "author": "Alex Chen",
                        "content": "Huge congratulations Godwin! Well deserved certification.",
                        "created_at": "2026-07-19T11:00:00Z"
                    },
                    {
                        "comment_id": "comment-11-2",
                        "author": "Victor Kipchirchir",
                        "content": "Congrats bro! The Stylus Rust track is tough, impressive achievement.",
                        "created_at": "2026-07-19T12:15:00Z"
                    }
                ]
            },
            {
                "_id": "thread-12",
                "thread_id": "thread-12",
                "title": "Zero-Knowledge Plonky2 & EVM State Proof Verification",
                "author": "Lars Lindqvist",
                "category": "Discussion",
                "content": "Here is a breakdown of our ZK state proof verifier contract written for Ethereum and Polygon zkEVM. Feedback and peer reviews welcomed!",
                "tags": ["ethereum", "polygon", "zkproofs", "plonky2"],
                "replies_count": 2,
                "views_count": 315,
                "likes_count": 62,
                "created_at": "2026-07-26T16:00:00Z",
                "comments": [
                    {
                        "comment_id": "comment-12-1",
                        "author": "Brenda Adhiambo",
                        "content": "Reviewed the verifier logic! The constraint checks match Plonky2 specs cleanly.",
                        "created_at": "2026-07-26T17:30:00Z"
                    },
                    {
                        "comment_id": "comment-12-2",
                        "author": "Oliver Hudson",
                        "content": "Tested proof generation locally—verifies in under 450ms.",
                        "created_at": "2026-07-26T18:45:00Z"
                    }
                ]
            },
            {
                "_id": "thread-13",
                "thread_id": "thread-13",
                "title": "Arbitrum Orbit L3 Chain Node Integration with Foundry Test Suite",
                "author": "Zoe Martinez",
                "category": "Showcase",
                "content": "Integrated an Arbitrum Orbit L3 chain node with our Foundry unit test suite. Gas benchmarks run in under 800ms!",
                "tags": ["arbitrum", "orbit", "foundry", "testing"],
                "replies_count": 2,
                "views_count": 298,
                "likes_count": 55,
                "created_at": "2026-07-20T14:15:00Z",
                "comments": [
                    {
                        "comment_id": "comment-13-1",
                        "author": "Alex Chen",
                        "content": "Awesome integration Zoe! Are you running Stylus host I/O hooks inside the test suite?",
                        "created_at": "2026-07-20T15:30:00Z"
                    },
                    {
                        "comment_id": "comment-13-2",
                        "author": "Victor Kipchirchir",
                        "content": "Foundry speed for Orbit L3s is game changing compared to older Hardhat setups.",
                        "created_at": "2026-07-20T16:45:00Z"
                    }
                ]
            },
            {
                "_id": "thread-14",
                "thread_id": "thread-14",
                "title": "Anchor CPI Security Reentrancy Audit Passed & Merged to Main",
                "author": "Devon Wright",
                "category": "Announcement",
                "content": "Passed Anchor CPI Security Reentrancy Audit on Solana Devnet and merged our pull request for automated liquid staking pools!",
                "tags": ["solana", "anchor", "security", "audit"],
                "replies_count": 2,
                "views_count": 340,
                "likes_count": 72,
                "created_at": "2026-07-22T10:00:00Z",
                "comments": [
                    {
                        "comment_id": "comment-14-1",
                        "author": "Brian Kiprop",
                        "content": "Huge milestone Devon! Reentrancy protection on Solana Sealevel runtime is crucial.",
                        "created_at": "2026-07-22T11:20:00Z"
                    },
                    {
                        "comment_id": "comment-14-2",
                        "author": "Yuki Takahashi",
                        "content": "Super clean PR! Just reviewed the Anchor CPI constraints.",
                        "created_at": "2026-07-22T12:30:00Z"
                    }
                ]
            },
            {
                "_id": "thread-15",
                "thread_id": "thread-15",
                "title": "Passed Smart Contract Architecture & Solidity Syntax Assessment (100% Score)",
                "author": "Alex.Mutua",
                "category": "Discussion",
                "content": "Just completed Level 2 Smart Contract Architecture with a 100% quiz score! Huge thanks to OpenClaw AI mentor for walking through modifier ordering.",
                "tags": ["fundamentals", "solidity", "architecture", "education"],
                "replies_count": 2,
                "views_count": 420,
                "likes_count": 88,
                "created_at": "2026-07-25T11:30:00Z",
                "comments": [
                    {
                        "comment_id": "comment-15-1",
                        "author": "Andrew Mwangi",
                        "content": "Congrats Alex! Level 3 Token Standards is next, see you in the Base track!",
                        "created_at": "2026-07-25T12:45:00Z"
                    },
                    {
                        "comment_id": "comment-15-2",
                        "author": "Tariq Al-Hassan",
                        "content": "OpenClaw mentor is super helpful for clarifying modifier execution order. Keep going!",
                        "created_at": "2026-07-25T14:00:00Z"
                    }
                ]
            },
            {
                "_id": "thread-16",
                "thread_id": "thread-16",
                "title": "Deployed Coinbase Smart Wallet Paymaster & Account Abstraction Vault on Base Sepolia",
                "author": "Andrew Mwangi",
                "category": "Showcase",
                "content": "Deployed our final Base Sepolia Account Abstraction Paymaster contract. Gasless transactions are live for all cohort testers!",
                "tags": ["base", "coinbase", "paymaster", "account-abstraction"],
                "replies_count": 2,
                "views_count": 465,
                "likes_count": 104,
                "created_at": "2026-07-27T09:00:00Z",
                "comments": [
                    {
                        "comment_id": "comment-16-1",
                        "author": "Cynthia Achieng",
                        "content": "Tested the live Paymaster call on Base Sepolia—gasless tx confirmed in 1 block!",
                        "created_at": "2026-07-27T10:15:00Z"
                    },
                    {
                        "comment_id": "comment-16-2",
                        "author": "Gabriel Dupont",
                        "content": "Passkey onboarding on Base is extremely smooth. Great work Andrew!",
                        "created_at": "2026-07-27T11:30:00Z"
                    }
                ]
            },
            {
                "_id": "thread-17",
                "thread_id": "thread-17",
                "title": "Avalanche Warp Messaging (AWM) Inter-Subnet Liquidity Vault Live",
                "author": "Ananya Sharma",
                "category": "Discussion",
                "content": "Deployed Teleporter cross-subnet messaging bridge for instant liquidity settlement between custom Avalanche EVM Subnets.",
                "tags": ["avalanche", "awm", "teleporter", "subnets"],
                "replies_count": 2,
                "views_count": 310,
                "likes_count": 68,
                "created_at": "2026-07-28T08:00:00Z",
                "comments": [
                    {
                        "comment_id": "comment-17-1",
                        "author": "Kevin Ochieng",
                        "content": "Subnet teleporter contract executed cross-subnet swap in 1.4s! Outstanding implementation.",
                        "created_at": "2026-07-28T08:45:00Z"
                    },
                    {
                        "comment_id": "comment-17-2",
                        "author": "Collins Omondi",
                        "content": "AWM is definitely the most efficient cross-subnet bridging protocol for Avalanche.",
                        "created_at": "2026-07-28T09:30:00Z"
                    }
                ]
            }
        ]
    await coll.insert_many(threads)
    print("🌱 Seeding May–July 2026 forum threads complete.")

async def seed_hackathons():
    """Seed initial hackathons in MongoDB."""
    coll = get_hackathons_collection()
    await coll.delete_many({})
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

