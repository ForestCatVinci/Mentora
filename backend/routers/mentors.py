from fastapi import APIRouter, HTTPException
from backend.database import get_supabase

router = APIRouter(prefix="/mentors", tags=["mentors"])


@router.get("")
async def list_mentors():
    sb = get_supabase()
    result = sb.table("mentors").select("*").eq("is_active", True).execute()
    return result.data or []


@router.get("/me/{user_id}")
async def get_mentor_profile(user_id: str):
    sb = get_supabase()
    result = sb.table("mentors").select("*").eq("user_id", user_id).execute()
    return result.data[0] if result.data else None


@router.post("/profile")
async def save_mentor_profile(payload: dict):
    sb = get_supabase()
    user_id = payload.get("user_id")
    if not user_id:
        raise HTTPException(400, "user_id required")

    data = {
        "user_id": user_id,
        "full_name": payload.get("full_name", ""),
        "university": payload.get("university"),
        "speciality": payload.get("speciality"),
        "bio": payload.get("bio"),
        "telegram": payload.get("telegram"),
        "phone": payload.get("phone"),
        "contact_email": payload.get("contact_email"),
        "is_active": True,
    }

    existing = sb.table("mentors").select("id").eq("user_id", user_id).execute()
    if existing.data:
        result = sb.table("mentors").update(data).eq("user_id", user_id).execute()
    else:
        result = sb.table("mentors").insert(data).execute()

    if not result.data:
        raise HTTPException(500, "Failed to save mentor profile")
    return result.data[0]
