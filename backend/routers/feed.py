from fastapi import APIRouter, HTTPException
from backend.database import get_supabase
from backend.services.matching import rank_feed

router = APIRouter(prefix="/feed", tags=["feed"])


@router.get("/{user_id}")
async def get_feed(user_id: str):
    sb = get_supabase()

    user_res = sb.table("users").select("*").eq("id", user_id).single().execute()
    if not user_res.data:
        raise HTTPException(404, "User not found")
    user = user_res.data

    posts_res = sb.table("posts").select("*").eq("is_published", True).execute()
    posts = posts_res.data or []

    # attach is_saved for this user
    saved_res = sb.table("saved_posts").select("post_id").eq("user_id", user_id).execute()
    saved_ids = {r["post_id"] for r in (saved_res.data or [])}
    for p in posts:
        p["is_saved"] = p["id"] in saved_ids

    ranked = rank_feed(posts, user)
    return ranked
