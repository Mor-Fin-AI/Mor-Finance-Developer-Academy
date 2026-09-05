"""
Certificates API Router — serves certificates earned by the user.
"""
from fastapi import APIRouter
from src.services.db import get_or_create_user

router = APIRouter()

@router.get("/{user_id}")
async def get_user_certificates(user_id: str):
    """Retrieve certificates earned by a specific user."""
    try:
        user = await get_or_create_user(user_id)
        return user.get("certificates", [])
    except Exception as e:
        print(f"⚠️ Error retrieving certificates for {user_id}: {e}")
        return []
