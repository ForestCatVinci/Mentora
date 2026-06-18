from fastapi import APIRouter, HTTPException, UploadFile, File, Form, BackgroundTasks
from typing import Optional
import uuid

from backend.database import get_supabase
from backend.services.openai_tagging import tag_post

router = APIRouter(prefix="/posts", tags=["posts"])


async def _apply_ai_tags(post_id: str, title: str, description: str):
    sb = get_supabase()
    try:
        ai = await tag_post(title, description)
        sb.table("posts").update({
            "tags": ai.tags,
            "category": ai.category,
            "grade_range": ai.grade_range,
            "location": ai.location,
            "summary_ru": ai.summary_ru,
        }).eq("id", post_id).execute()
    except Exception:
        pass


@router.get("")
async def list_posts(
    category: Optional[str] = None,
    grade: Optional[int] = None,
    search: Optional[str] = None,
    user_id: Optional[str] = None,
):
    sb = get_supabase()
    query = sb.table("posts").select("*").eq("is_published", True)
    if category:
        query = query.eq("category", category)
    if search:
        query = query.or_(f"title.ilike.%{search}%,description.ilike.%{search}%")
    result = query.order("created_at", desc=True).execute()
    posts = result.data or []
    if grade:
        posts = [p for p in posts if grade in (p.get("grade_range") or [])]

    if user_id:
        saved_res = sb.table("saved_posts").select("post_id").eq("user_id", user_id).execute()
        saved_ids = {r["post_id"] for r in (saved_res.data or [])}
        for p in posts:
            p["is_saved"] = p["id"] in saved_ids
    else:
        for p in posts:
            p["is_saved"] = False

    return posts


@router.post("")
async def create_post(
    background_tasks: BackgroundTasks,
    title: str = Form(...),
    description: str = Form(...),
    deadline_date: Optional[str] = Form(None),
    end_date: Optional[str] = Form(None),
    link: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
    created_by: str = Form(...),
):
    sb = get_supabase()
    image_url = None

    if image and image.filename:
        try:
            content = await image.read()
            ext = image.filename.rsplit(".", 1)[-1]
            path = f"posts/{uuid.uuid4()}.{ext}"
            sb.storage.from_("post-images").upload(
                path, content, {"content-type": image.content_type}
            )
            image_url = sb.storage.from_("post-images").get_public_url(path)
        except Exception as img_err:
            print(f"[WARN] Image upload failed, continuing without image: {img_err}")
            image_url = None

    payload = {
        "title": title,
        "description": description,
        "image_url": image_url,
        "deadline_date": deadline_date,
        "end_date": end_date,
        "link": link,
        "created_by": created_by,
        "tags": [],
        "category": None,
        "grade_range": [],
        "location": None,
        "summary_ru": None,
        "is_published": True,
    }

    result = sb.table("posts").insert(payload).execute()
    if not result.data:
        raise HTTPException(500, "Failed to create post")

    post = result.data[0]
    background_tasks.add_task(_apply_ai_tags, post["id"], title, description)

    return post


@router.patch("/{post_id}")
async def update_post(post_id: str, payload: dict):
    sb = get_supabase()
    allowed = {"title", "description", "deadline_date", "end_date", "link", "image_url"}
    update = {k: v for k, v in payload.items() if k in allowed}
    result = sb.table("posts").update(update).eq("id", post_id).execute()
    if not result.data:
        raise HTTPException(404, "Post not found")
    return result.data[0]


@router.delete("/{post_id}")
async def delete_post(post_id: str):
    sb = get_supabase()
    sb.table("saved_posts").delete().eq("post_id", post_id).execute()
    sb.table("posts").delete().eq("id", post_id).execute()
    return {"deleted": True}


@router.post("/{post_id}/save")
async def save_post(post_id: str, user_id: str):
    sb = get_supabase()
    sb.table("saved_posts").insert({"user_id": user_id, "post_id": post_id}).execute()
    sb.rpc("increment_saves", {"pid": post_id}).execute()
    post = sb.table("posts").select("saves_count").eq("id", post_id).single().execute()
    if post.data:
        sb.table("posts").update({"saves_count": post.data["saves_count"] + 1}).eq("id", post_id).execute()
    return {"saved": True}


@router.delete("/{post_id}/save")
async def unsave_post(post_id: str, user_id: str):
    sb = get_supabase()
    sb.table("saved_posts").delete().eq("user_id", user_id).eq("post_id", post_id).execute()
    post = sb.table("posts").select("saves_count").eq("id", post_id).single().execute()
    if post.data and post.data["saves_count"] > 0:
        sb.table("posts").update({"saves_count": post.data["saves_count"] - 1}).eq("id", post_id).execute()
    return {"saved": False}
