from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.routers import posts, courses, auth, feed, mentors, chat

app = FastAPI(title="Mentoria Hub API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(posts.router)
app.include_router(courses.router)
app.include_router(feed.router)
app.include_router(mentors.router)
app.include_router(chat.router)


@app.get("/health")
async def health():
    return {"status": "ok"}
