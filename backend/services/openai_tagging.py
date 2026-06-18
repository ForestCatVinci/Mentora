import json
import os
from openai import AsyncOpenAI
from backend.models import AITags

_client: AsyncOpenAI | None = None

def _get_client() -> AsyncOpenAI:
    global _client
    if _client is None:
        _client = AsyncOpenAI(api_key=os.environ["OPENAI_API_KEY"])
    return _client

SYSTEM_PROMPT = (
    "You are a content tagger for an educational platform for students "
    "grades 8-11 in Kazakhstan and CIS. Return ONLY valid JSON, no markdown, "
    "no explanation."
)

USER_TEMPLATE = """Tag this educational post.
Title: {title}
Description: {description}

Return exactly this JSON:
{{
  "tags": [],
  "category": "",
  "grade_range": [],
  "location": "",
  "summary_ru": ""
}}

Rules:
- tags: 3-6 specific keywords e.g. ["robotics", "MIT", "research"]
- category: one of competition, event, scholarship, summer_program, internship, research, hackathon, olympiad, course, other
- grade_range: applicable grades from [8, 9, 10, 11]
- location: one of online, kazakhstan, international
- summary_ru: 1-2 sentence summary in Russian for the student feed card"""


async def tag_post(title: str, description: str) -> AITags:
    client = _get_client()
    response = await client.chat.completions.create(
        model="gpt-4o-mini",
        temperature=0,
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": USER_TEMPLATE.format(title=title, description=description)},
        ],
    )
    data = json.loads(response.choices[0].message.content)
    return AITags(**data)
