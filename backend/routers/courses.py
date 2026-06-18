from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from typing import Optional
import uuid, json

from backend.database import get_supabase

router = APIRouter(prefix="/courses", tags=["courses"])


@router.get("/my")
async def my_courses(user_id: str):
    sb = get_supabase()
    try:
        result = (
            sb.table("courses")
            .select("*, sections(*, lessons(*))")
            .eq("created_by", user_id)
            .order("created_at", desc=True)
            .execute()
        )
    except Exception as e:
        raise HTTPException(500, f"DB error: {e}")
    courses = result.data or []
    for c in courses:
        _sort_sections(c)
    return courses


@router.get("")
async def list_courses(user_id: Optional[str] = None):
    sb = get_supabase()
    try:
        result = (
            sb.table("courses")
            .select("*, sections(*, lessons(*))")
            .eq("is_published", True)
            .order("created_at", desc=True)
            .execute()
        )
    except Exception as e:
        raise HTTPException(500, f"DB error: {e}")
    courses = result.data or []
    for c in courses:
        _sort_sections(c)

    if user_id:
        enrolled_res = sb.table("enrollments").select("course_id").eq("user_id", user_id).execute()
        enrolled_ids = {e["course_id"] for e in (enrolled_res.data or [])}
        progress_res = sb.table("user_progress").select("lesson_id").eq("user_id", user_id).execute()
        completed_ids = {p["lesson_id"] for p in (progress_res.data or [])}
        for c in courses:
            c["enrolled"] = c["id"] in enrolled_ids
            all_lesson_ids = [l["id"] for s in c.get("sections", []) for l in s.get("lessons", [])]
            c["completed_lessons"] = [lid for lid in all_lesson_ids if lid in completed_ids]
    else:
        for c in courses:
            c["enrolled"] = False
            c["completed_lessons"] = []

    return courses


@router.get("/{course_id}")
async def get_course(course_id: str, user_id: Optional[str] = None):
    sb = get_supabase()
    try:
        result = (
            sb.table("courses")
            .select("*, sections(*, lessons(*))")
            .eq("id", course_id)
            .single()
            .execute()
        )
    except Exception as e:
        raise HTTPException(500, f"DB error: {e}")
    if not result.data:
        raise HTTPException(404, "Course not found")

    course = result.data
    _sort_sections(course)

    if user_id:
        enrolled_res = sb.table("enrollments").select("id").eq("user_id", user_id).eq("course_id", course_id).execute()
        course["enrolled"] = bool(enrolled_res.data)
        progress_res = sb.table("user_progress").select("lesson_id").eq("user_id", user_id).execute()
        completed_ids = {p["lesson_id"] for p in (progress_res.data or [])}
        all_lesson_ids = [l["id"] for s in course.get("sections", []) for l in s.get("lessons", [])]
        course["completed_lessons"] = [lid for lid in all_lesson_ids if lid in completed_ids]
    else:
        course["enrolled"] = False
        course["completed_lessons"] = []

    return course


@router.post("")
async def create_course(
    title: str = Form(...),
    description: Optional[str] = Form(None),
    category: Optional[str] = Form(None),
    difficulty: str = Form("beginner"),
    grade_range: Optional[str] = Form(None),
    created_by: str = Form(...),
    image: Optional[UploadFile] = File(None),
):
    sb = get_supabase()
    image_url = None

    if image and image.filename:
        try:
            content = await image.read()
            ext = image.filename.rsplit(".", 1)[-1]
            path = f"courses/{uuid.uuid4()}.{ext}"
            sb.storage.from_("course-images").upload(path, content, {"content-type": image.content_type})
            image_url = sb.storage.from_("course-images").get_public_url(path)
        except Exception:
            pass

    grade_range_list = json.loads(grade_range) if grade_range else []

    payload = {
        "title": title,
        "description": description,
        "image_url": image_url,
        "category": category,
        "difficulty": difficulty,
        "grade_range": grade_range_list,
        "created_by": created_by,
        "is_published": False,
    }
    result = sb.table("courses").insert(payload).execute()
    if not result.data:
        raise HTTPException(500, "Failed to create course")
    course = result.data[0]
    course["sections"] = []
    course["enrolled"] = False
    course["completed_lessons"] = []
    return course


@router.patch("/{course_id}")
async def update_course(course_id: str, payload: dict):
    sb = get_supabase()
    allowed = {"title", "description", "category", "difficulty", "grade_range", "is_published", "image_url"}
    update = {k: v for k, v in payload.items() if k in allowed}
    result = sb.table("courses").update(update).eq("id", course_id).execute()
    if not result.data:
        raise HTTPException(404, "Course not found")
    return result.data[0]


@router.delete("/{course_id}")
async def delete_course(course_id: str):
    sb = get_supabase()
    sb.table("courses").delete().eq("id", course_id).execute()
    return {"deleted": True}


# ── Sections ──────────────────────────────────────────────────────────────────

@router.post("/{course_id}/sections")
async def create_section(course_id: str, payload: dict):
    sb = get_supabase()
    existing = (
        sb.table("sections").select("order_index")
        .eq("course_id", course_id)
        .order("order_index", desc=True)
        .limit(1)
        .execute()
    )
    next_idx = (existing.data[0]["order_index"] + 1) if existing.data else 0
    data = {
        "course_id": course_id,
        "title": payload.get("title", "Новый раздел"),
        "order_index": payload.get("order_index", next_idx),
    }
    result = sb.table("sections").insert(data).execute()
    if not result.data:
        raise HTTPException(500, "Failed to create section")
    section = result.data[0]
    section["lessons"] = []
    return section


@router.patch("/{course_id}/sections/{section_id}")
async def update_section(course_id: str, section_id: str, payload: dict):
    sb = get_supabase()
    allowed = {"title", "order_index"}
    update = {k: v for k, v in payload.items() if k in allowed}
    result = sb.table("sections").update(update).eq("id", section_id).execute()
    if not result.data:
        raise HTTPException(404, "Section not found")
    return result.data[0]


@router.delete("/{course_id}/sections/{section_id}")
async def delete_section(course_id: str, section_id: str):
    sb = get_supabase()
    sb.table("sections").delete().eq("id", section_id).execute()
    return {"deleted": True}


# ── Lessons ───────────────────────────────────────────────────────────────────

@router.post("/{course_id}/sections/{section_id}/lessons")
async def create_lesson(course_id: str, section_id: str, payload: dict):
    sb = get_supabase()
    existing = (
        sb.table("lessons").select("order_index")
        .eq("section_id", section_id)
        .order("order_index", desc=True)
        .limit(1)
        .execute()
    )
    next_idx = (existing.data[0]["order_index"] + 1) if existing.data else 0
    data = {
        "course_id": course_id,
        "section_id": section_id,
        "title": payload.get("title", "Новый урок"),
        "description": payload.get("description"),
        "video_url": payload.get("video_url"),
        "order_index": payload.get("order_index", next_idx),
    }
    result = sb.table("lessons").insert(data).execute()
    if not result.data:
        raise HTTPException(500, "Failed to create lesson")
    return result.data[0]


@router.patch("/lessons/{lesson_id}")
async def update_lesson(lesson_id: str, payload: dict):
    sb = get_supabase()
    allowed = {"title", "description", "video_url", "order_index", "section_id"}
    update = {k: v for k, v in payload.items() if k in allowed}
    result = sb.table("lessons").update(update).eq("id", lesson_id).execute()
    if not result.data:
        raise HTTPException(404, "Lesson not found")
    return result.data[0]


@router.delete("/lessons/{lesson_id}")
async def delete_lesson(lesson_id: str):
    sb = get_supabase()
    sb.table("lessons").delete().eq("id", lesson_id).execute()
    return {"deleted": True}


# ── Enrollment ────────────────────────────────────────────────────────────────

@router.post("/{course_id}/enroll")
async def enroll(course_id: str, payload: dict):
    sb = get_supabase()
    user_id = payload.get("user_id")
    if not user_id:
        raise HTTPException(400, "user_id required")
    try:
        result = sb.table("enrollments").insert({"user_id": user_id, "course_id": course_id}).execute()
        return result.data[0] if result.data else {"enrolled": True}
    except Exception:
        return {"enrolled": True}


@router.delete("/{course_id}/enroll")
async def unenroll(course_id: str, user_id: str):
    sb = get_supabase()
    sb.table("enrollments").delete().eq("user_id", user_id).eq("course_id", course_id).execute()
    return {"unenrolled": True}


# ── Progress ──────────────────────────────────────────────────────────────────

@router.post("/{course_id}/lessons/{lesson_id}/complete")
async def complete_lesson(course_id: str, lesson_id: str, payload: dict):
    sb = get_supabase()
    user_id = payload.get("user_id")
    if not user_id:
        raise HTTPException(400, "user_id required")
    existing = sb.table("user_progress").select("id").eq("user_id", user_id).eq("lesson_id", lesson_id).execute()
    if not existing.data:
        sb.table("user_progress").insert({"user_id": user_id, "lesson_id": lesson_id}).execute()
    return {"completed": True}


@router.delete("/{course_id}/lessons/{lesson_id}/complete")
async def uncomplete_lesson(course_id: str, lesson_id: str, user_id: str):
    sb = get_supabase()
    sb.table("user_progress").delete().eq("user_id", user_id).eq("lesson_id", lesson_id).execute()
    return {"completed": False}


# ── Helpers ───────────────────────────────────────────────────────────────────

def _sort_sections(course: dict):
    sections = sorted(course.get("sections") or [], key=lambda s: s.get("order_index", 0))
    for s in sections:
        s["lessons"] = sorted(s.get("lessons") or [], key=lambda l: l.get("order_index", 0))
    course["sections"] = sections
