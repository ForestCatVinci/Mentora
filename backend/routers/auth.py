from fastapi import APIRouter, HTTPException
from backend.database import get_supabase

router = APIRouter(prefix="/auth", tags=["auth"])

MENTOR_CODE = "6767"


@router.post("/register")
async def register(payload: dict):
    sb = get_supabase()
    is_mentor = payload.get("mentor_code") == MENTOR_CODE
    try:
        response = sb.auth.admin.create_user({
            "email": payload["email"],
            "password": payload["password"],
            "user_metadata": {"full_name": payload.get("full_name", "")},
            "email_confirm": True,
        })
        user_id = str(response.user.id)
        if is_mentor:
            sb.table("users").update({"role": "mentor"}).eq("id", user_id).execute()
        return {"id": user_id, "email": response.user.email, "role": "mentor" if is_mentor else "student"}
    except Exception as e:
        raise HTTPException(400, str(e))


@router.get("/me/{user_id}")
async def get_me(user_id: str):
    sb = get_supabase()
    result = sb.table("users").select("*").eq("id", user_id).single().execute()
    if not result.data:
        raise HTTPException(404, "User not found")
    return result.data


@router.patch("/me/{user_id}/onboarding")
async def complete_onboarding(user_id: str, payload: dict):
    sb = get_supabase()
    allowed = {"grade", "interests", "goals", "full_name"}
    update = {k: v for k, v in payload.items() if k in allowed}
    result = sb.table("users").update(update).eq("id", user_id).execute()
    if not result.data:
        raise HTTPException(404, "User not found")
    return result.data[0]
