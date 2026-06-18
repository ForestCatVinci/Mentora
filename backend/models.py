from pydantic import BaseModel, UUID4
from typing import Optional
from datetime import date, datetime
from enum import Enum


class UserRole(str, Enum):
    student = "student"
    staff = "staff"
    admin = "admin"


class Difficulty(str, Enum):
    beginner = "beginner"
    intermediate = "intermediate"
    advanced = "advanced"


class User(BaseModel):
    id: UUID4
    email: str
    full_name: Optional[str]
    avatar_url: Optional[str]
    role: UserRole
    grade: Optional[int]
    interests: list[str] = []
    goals: list[str] = []


class PostCreate(BaseModel):
    title: str
    description: str
    deadline_date: Optional[date] = None


class AITags(BaseModel):
    tags: list[str]
    category: str
    grade_range: list[int]
    location: str
    summary_ru: str


class Post(BaseModel):
    id: UUID4
    created_at: datetime
    created_by: Optional[UUID4]
    title: str
    description: Optional[str]
    image_url: Optional[str]
    deadline_date: Optional[date]
    tags: list[str]
    category: Optional[str]
    grade_range: list[int]
    location: Optional[str]
    summary_ru: Optional[str]
    is_published: bool
    saves_count: int
    score: Optional[float] = None
    is_saved: Optional[bool] = None


class CourseCreate(BaseModel):
    title: str
    description: Optional[str]
    category: Optional[str]
    difficulty: Difficulty = Difficulty.beginner
    grade_range: list[int] = []


class Course(BaseModel):
    id: UUID4
    created_at: datetime
    title: str
    description: Optional[str]
    image_url: Optional[str]
    category: Optional[str]
    difficulty: Difficulty
    grade_range: list[int]
    is_published: bool
    lessons: list[dict] = []
