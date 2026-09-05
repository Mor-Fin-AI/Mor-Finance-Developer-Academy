"""
Courses and Lessons API Routers — retrieves structured courses list and individual lessons.
"""
from fastapi import APIRouter, HTTPException
from src.services.lessons import get_courses_list, get_track_lessons, LESSONS_DB

SUPPORTED_TRACKS = {
    "fundamentals", "ethereum", "arbitrum", "optimism", "polygon", 
    "base", "solana", "avalanche", "polkadot", "substrate", "starknet", "aptos",
    "fullstack"
}

def validate_track(track: str) -> str:
    track_lower = track.lower().strip()
    if track_lower not in SUPPORTED_TRACKS:
        raise HTTPException(status_code=400, detail=f"Unsupported track '{track}'. Supported: {sorted(list(SUPPORTED_TRACKS))}")
    return track_lower

router = APIRouter()

@router.get("")
async def list_courses(track: str = "ethereum"):
    """Retrieve all levels and their nested lessons list."""
    track = validate_track(track)
    return get_courses_list(track)

@router.get("/lessons/{lesson_id}")
async def get_lesson(lesson_id: str, track: str = "ethereum"):
    """Retrieve detailed content for a single lesson (including quiz and exercise meta)."""
    track = validate_track(track)
    if lesson_id in LESSONS_DB:
        return LESSONS_DB[lesson_id]
        
    track_lessons = get_track_lessons(track)
    for l in track_lessons:
        if l.id == lesson_id:
            return l

    for tr in SUPPORTED_TRACKS:
        for l in get_track_lessons(tr):
            if l.id == lesson_id:
                return l

    raise HTTPException(status_code=404, detail=f"Lesson '{lesson_id}' not found")
