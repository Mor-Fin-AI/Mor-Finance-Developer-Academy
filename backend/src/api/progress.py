"""
Progress Tracking API — GET and POST user progress.
Integrates with the MongoDB database store.
"""
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Query
from src.services.db import get_or_create_user, save_user_progress, complete_lesson_for_user

router = APIRouter()

@router.get("/{user_id}")
async def get_progress(user_id: str):
    """Retrieve progress for a user. Creates a default record if not found in MongoDB."""
    user = await get_or_create_user(user_id)
    return user

@router.post("/reset")
async def reset_progress(user_id: str = Query(...)):
    """Reset all learning progress for a user."""
    from src.services.db import get_collection, get_or_create_user
    coll = get_collection()
    await coll.delete_one({"_id": user_id})
    new_user = await get_or_create_user(user_id)
    return {"status": "ok", "user_progress": new_user}

@router.post("/track")
async def update_active_track(user_id: str = Query(...), track: str = Query(...)):
    """Update active learning track for a user (Fundamentals, Ethereum, Arbitrum, etc.)."""
    track = track.lower().strip()
    SUPPORTED_TRACKS = {
        "fundamentals", "ethereum", "arbitrum", "optimism", "polygon", 
        "base", "solana", "avalanche", "polkadot", "substrate", "starknet", "aptos",
        "fullstack"
    }
    if track not in SUPPORTED_TRACKS:
        raise HTTPException(status_code=400, detail=f"Unsupported track '{track}'. Supported: {sorted(list(SUPPORTED_TRACKS))}")
        
    from src.services.db import get_collection, get_or_create_user, build_user_levels
    coll = get_collection()
    user = await get_or_create_user(user_id)
    completed_ids = user.get("completed_lesson_ids", [])
    
    levels, overall_pct = build_user_levels(track, completed_ids)
            
    await coll.update_one(
        {"_id": user_id},
        {"$set": {"active_track": track, "levels": levels, "overall_pct": overall_pct}}
    )
    
    updated_user = await get_or_create_user(user_id)
    return updated_user

@router.post("/{user_id}")
async def update_progress(user_id: str, level_id: int, completed_lessons: int, xp_gained: int):
    """Directly update lesson completion and XP for a given level in MongoDB."""
    user = await get_or_create_user(user_id)
    levels = user.get("levels", [])
    level = next((l for l in levels if l["level_id"] == level_id), None)
    if not level:
        raise HTTPException(status_code=404, detail=f"Level {level_id} not found")
    if not level["is_unlocked"]:
        raise HTTPException(status_code=403, detail=f"Level {level_id} is locked")

    # Set completion counts
    level["completed_lessons"] = min(completed_lessons, level["total_lessons"])
    if level["completed_lessons"] >= level["total_lessons"] and not level.get("completed_at"):
        level["completed_at"] = datetime.now(timezone.utc)
    
    # Recalculate derived fields
    total_lessons = sum(l["total_lessons"] for l in levels)
    done_lessons = sum(l["completed_lessons"] for l in levels)
    overall_pct = round(done_lessons / total_lessons * 100, 1) if total_lessons > 0 else 0.0
    
    for i in range(len(levels)):
        if i == 0:
            levels[i]["is_unlocked"] = True
        else:
            prev = levels[i-1]
            if prev["completed_lessons"] >= prev["total_lessons"]:
                levels[i]["is_unlocked"] = True
                
    unlocked_levels = [lvl["level_id"] for lvl in levels if lvl["is_unlocked"]]
    current_level = max(unlocked_levels) if unlocked_levels else 1

    update_payload = {
        "levels": levels,
        "overall_pct": overall_pct,
        "current_level": current_level,
        "last_active": datetime.now(timezone.utc),
        "xp": user.get("xp", 0) + xp_gained
    }
    
    await save_user_progress(user_id, update_payload)
    return await get_or_create_user(user_id)
