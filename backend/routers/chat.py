import os
import json
from datetime import date
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from openai import AsyncOpenAI

from backend.database import get_supabase

router = APIRouter(prefix="/chat", tags=["chat"])

_client: AsyncOpenAI | None = None


def _get_client() -> AsyncOpenAI:
    global _client
    if _client is None:
        _client = AsyncOpenAI(api_key=os.environ["OPENAI_API_KEY"])
    return _client


def _build_system_prompt(user: dict, posts: list, courses: list) -> str:
    today = date.today().strftime("%d.%m.%Y")
    name = user.get("full_name") or "Студент"
    grade = f"{user.get('grade')} класс" if user.get("grade") else "не указан"
    interests = ", ".join(user.get("interests") or []) or "не указаны"
    goals_map = {
        "university_abroad": "поступление за рубеж",
        "olympiads": "олимпиады",
        "startup": "стартап",
        "research": "исследования",
    }
    goals = ", ".join(goals_map.get(g, g) for g in (user.get("goals") or [])) or "не указаны"

    # Sort posts: upcoming deadlines first, then no deadline
    upcoming = sorted(
        [p for p in posts if p.get("deadline_date")],
        key=lambda p: p["deadline_date"],
    )[:20]
    no_deadline = [p for p in posts if not p.get("deadline_date")][:5]

    post_lines = []
    for p in upcoming:
        dl = p["deadline_date"]
        end = f"–{p['end_date']}" if p.get("end_date") else ""
        cat = p.get("category") or "другое"
        tags = ", ".join(p.get("tags") or [])
        desc = p.get("description", "")[:120] if p.get("description") else ""
        line = f"• [{cat}] {p['title']} | дедлайн: {dl}{end}"
        if tags:
            line += f" | теги: {tags}"
        if desc:
            line += f"\n  {desc}"
        post_lines.append(line)
    for p in no_deadline:
        cat = p.get("category") or "другое"
        post_lines.append(f"• [{cat}] {p['title']}")

    course_lines = []
    for c in courses[:12]:
        diff_ru = {"beginner": "начальный", "intermediate": "средний", "advanced": "продвинутый"}
        diff = diff_ru.get(c.get("difficulty", ""), c.get("difficulty", ""))
        cat = c.get("category") or ""
        desc = c.get("description", "")[:100] if c.get("description") else ""
        line = f"• {c['title']}" + (f" [{cat}]" if cat else "") + f" | уровень: {diff}"
        if desc:
            line += f"\n  {desc}"
        course_lines.append(line)

    posts_text = "\n".join(post_lines) or "Пока нет доступных возможностей."
    courses_text = "\n".join(course_lines) or "Пока нет доступных курсов."

    return f"""Ты — Ментора, AI-помощник платформы Mentoria Hub. Платформа помогает школьникам 8-11 классов в Казахстане и СНГ находить возможности для развития: олимпиады, конкурсы, стипендии, стажировки, летние программы, а также проходить курсы и общаться с менторами.

ПРОФИЛЬ ПОЛЬЗОВАТЕЛЯ:
- Имя: {name}
- Класс: {grade}
- Интересы: {interests}
- Цели: {goals}

СЕГОДНЯШНЯЯ ДАТА: {today}

АКТУАЛЬНЫЕ ВОЗМОЖНОСТИ НА ПЛАТФОРМЕ:
{posts_text}

ДОСТУПНЫЕ КУРСЫ:
{courses_text}

КАК ОТВЕЧАТЬ:
- Пиши на том языке, на котором написал пользователь (русский, казахский или английский)
- Будь дружелюбным, мотивирующим, конкретным
- Учитывай класс, интересы и цели пользователя при рекомендациях
- При упоминании возможностей обязательно указывай дедлайн если он есть
- Отвечай кратко (2-4 предложения), если не просят подробностей
- Если вопрос не по теме платформы — всё равно отвечай полезно
- Форматируй ответ читаемо: используй переносы строк, не пиши сплошным текстом"""


@router.post("/stream")
async def chat_stream(payload: dict):
    sb = get_supabase()
    user_id = payload.get("user_id", "")
    message = payload.get("message", "")
    history = payload.get("history", [])  # [{"role": "user"|"assistant", "content": "..."}]

    if not message:
        async def empty():
            yield "data: [DONE]\n\n"
        return StreamingResponse(empty(), media_type="text/event-stream")

    # Fetch context
    user = {}
    if user_id:
        u = sb.table("users").select("*").eq("id", user_id).single().execute()
        user = u.data or {}

    posts_res = sb.table("posts").select("*").eq("is_published", True).order("created_at", desc=True).limit(30).execute()
    posts = posts_res.data or []

    courses_res = sb.table("courses").select("id,title,description,category,difficulty").eq("is_published", True).execute()
    courses = courses_res.data or []

    system_prompt = _build_system_prompt(user, posts, courses)

    messages = [{"role": "system", "content": system_prompt}]
    for msg in history[-12:]:
        if msg.get("role") in ("user", "assistant") and msg.get("content"):
            messages.append({"role": msg["role"], "content": msg["content"]})
    messages.append({"role": "user", "content": message})

    client = _get_client()

    async def generate():
        try:
            stream = await client.chat.completions.create(
                model="gpt-4o-mini",
                messages=messages,
                temperature=0.7,
                max_tokens=600,
                stream=True,
            )
            async for chunk in stream:
                delta = chunk.choices[0].delta.content
                if delta:
                    yield f"data: {json.dumps({'delta': delta})}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
        finally:
            yield "data: [DONE]\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream")
