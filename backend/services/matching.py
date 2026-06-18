from datetime import date
from backend.models import Post, User


GOALS_CATEGORY_MAP = {
    "university_abroad": ["scholarship", "summer_program", "research"],
    "olympiads": ["olympiad", "competition"],
    "startup": ["hackathon", "event"],
    "research": ["research", "internship"],
}


def score_post(post: dict, user: dict, today: date) -> int | None:
    score = 0

    # expired posts are filtered out
    if post.get("deadline_date"):
        deadline = post["deadline_date"]
        if isinstance(deadline, str):
            deadline = date.fromisoformat(deadline)
        days_left = (deadline - today).days
        if days_left < 0:
            return None
        elif days_left <= 14:
            score += 4
        elif days_left <= 42:
            score += 2

    # tag relevance
    post_tags = set(post.get("tags") or [])
    user_interests = set(user.get("interests") or [])
    score += len(post_tags & user_interests) * 3

    # grade match
    grade = user.get("grade")
    grade_range = post.get("grade_range") or []
    if grade and grade in grade_range:
        score += 4

    # goals match
    post_category = post.get("category") or ""
    for goal in (user.get("goals") or []):
        if post_category in GOALS_CATEGORY_MAP.get(goal, []):
            score += 3
            break

    # freshness
    created_at = post.get("created_at")
    if created_at:
        if isinstance(created_at, str):
            from datetime import datetime
            created_at = datetime.fromisoformat(created_at.replace("Z", "+00:00")).date()
        days_old = (today - created_at).days
        if days_old < 3:
            score += 3
        elif days_old < 7:
            score += 1

    return score


def rank_feed(posts: list[dict], user: dict) -> list[dict]:
    today = date.today()
    scored = []
    for post in posts:
        s = score_post(post, user, today)
        if s is not None:
            post["score"] = s
            scored.append(post)
    scored.sort(key=lambda p: (p["score"], p.get("saves_count", 0)), reverse=True)
    return scored
