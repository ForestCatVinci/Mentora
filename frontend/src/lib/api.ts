const API = import.meta.env.VITE_API_URL as string

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, options)
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export const api = {
  register: (data: { email: string; password: string; full_name: string; mentor_code?: string }) =>
    request<{ id: string; role: string }>('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),

  getMentorProfile: (userId: string) =>
    request<Mentor | null>(`/mentors/me/${userId}`),

  saveMentorProfile: (data: { user_id: string; full_name: string; university?: string; speciality?: string; bio?: string; telegram?: string; phone?: string; contact_email?: string }) =>
    request<Mentor>('/mentors/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),

  getFeed: (userId: string) => request<Post[]>(`/feed/${userId}`),

  getPosts: (params?: { category?: string; grade?: number; search?: string; userId?: string }) => {
    const q = new URLSearchParams()
    if (params?.category) q.set('category', params.category)
    if (params?.grade) q.set('grade', String(params.grade))
    if (params?.search) q.set('search', params.search)
    if (params?.userId) q.set('user_id', params.userId)
    return request<Post[]>(`/posts?${q}`)
  },

  createPost: (form: FormData) =>
    request<Post>('/posts', { method: 'POST', body: form }),

  updatePost: (postId: string, data: Partial<Pick<Post, 'title' | 'description' | 'deadline_date' | 'end_date' | 'link'>>) =>
    request<Post>(`/posts/${postId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),

  deletePost: (postId: string) =>
    request<{ deleted: boolean }>(`/posts/${postId}`, { method: 'DELETE' }),

  savePost: (postId: string, userId: string) =>
    request(`/posts/${postId}/save?user_id=${userId}`, { method: 'POST' }),

  unsavePost: (postId: string, userId: string) =>
    request(`/posts/${postId}/save?user_id=${userId}`, { method: 'DELETE' }),

  // ── Courses ────────────────────────────────────────────────────────────────

  getCourses: (userId?: string) => {
    const q = userId ? `?user_id=${userId}` : ''
    return request<Course[]>(`/courses${q}`)
  },

  getMyCourses: (userId: string) =>
    request<Course[]>(`/courses/my?user_id=${userId}`),

  getCourse: (courseId: string, userId?: string) => {
    const q = userId ? `?user_id=${userId}` : ''
    return request<Course>(`/courses/${courseId}${q}`)
  },

  createCourse: (form: FormData) =>
    request<Course>('/courses', { method: 'POST', body: form }),

  updateCourse: (courseId: string, data: Partial<Pick<Course, 'title' | 'description' | 'category' | 'difficulty' | 'grade_range' | 'is_published'>>) =>
    request<Course>(`/courses/${courseId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),

  deleteCourse: (courseId: string) =>
    request<{ deleted: boolean }>(`/courses/${courseId}`, { method: 'DELETE' }),

  createSection: (courseId: string, title: string) =>
    request<Section>(`/courses/${courseId}/sections`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    }),

  updateSection: (courseId: string, sectionId: string, data: Partial<Pick<Section, 'title' | 'order_index'>>) =>
    request<Section>(`/courses/${courseId}/sections/${sectionId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),

  deleteSection: (courseId: string, sectionId: string) =>
    request<{ deleted: boolean }>(`/courses/${courseId}/sections/${sectionId}`, { method: 'DELETE' }),

  createLesson: (courseId: string, sectionId: string, data: Partial<Pick<Lesson, 'title' | 'description' | 'video_url'>>) =>
    request<Lesson>(`/courses/${courseId}/sections/${sectionId}/lessons`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),

  updateLesson: (lessonId: string, data: Partial<Pick<Lesson, 'title' | 'description' | 'video_url' | 'order_index'>>) =>
    request<Lesson>(`/courses/lessons/${lessonId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),

  deleteLesson: (lessonId: string) =>
    request<{ deleted: boolean }>(`/courses/lessons/${lessonId}`, { method: 'DELETE' }),

  enrollCourse: (courseId: string, userId: string) =>
    request(`/courses/${courseId}/enroll`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId }),
    }),

  unenrollCourse: (courseId: string, userId: string) =>
    request(`/courses/${courseId}/enroll?user_id=${userId}`, { method: 'DELETE' }),

  completeLesson: (courseId: string, lessonId: string, userId: string) =>
    request(`/courses/${courseId}/lessons/${lessonId}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId }),
    }),

  uncompleteLesson: (courseId: string, lessonId: string, userId: string) =>
    request(`/courses/${courseId}/lessons/${lessonId}/complete?user_id=${userId}`, { method: 'DELETE' }),

  getMentors: () => request<Mentor[]>('/mentors'),

  getMe: (userId: string) => request<UserProfile>(`/auth/me/${userId}`),

  updateOnboarding: (userId: string, payload: Partial<UserProfile>) =>
    request<UserProfile>(`/auth/me/${userId}/onboarding`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }),
}

export interface Post {
  id: string
  created_at: string
  created_by: string
  title: string
  description: string
  image_url: string | null
  deadline_date: string | null
  end_date: string | null
  link: string | null
  tags: string[]
  category: string | null
  grade_range: number[]
  location: string | null
  summary_ru: string | null
  is_published: boolean
  saves_count: number
  score?: number
  is_saved?: boolean
}

export interface Section {
  id: string
  course_id: string
  title: string
  order_index: number
  lessons: Lesson[]
}

export interface Course {
  id: string
  created_at: string
  created_by: string
  title: string
  description: string | null
  image_url: string | null
  category: string | null
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  grade_range: number[]
  is_published: boolean
  sections: Section[]
  enrolled?: boolean
  completed_lessons?: string[]
}

export interface Lesson {
  id: string
  course_id: string
  section_id: string | null
  title: string
  description: string | null
  video_url: string | null
  order_index: number
}

export interface Mentor {
  id: string
  user_id: string | null
  full_name: string
  avatar_url: string | null
  university: string | null
  speciality: string | null
  bio: string | null
  telegram: string | null
  phone: string | null
  contact_email: string | null
  is_active: boolean
}

export interface UserProfile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: 'student' | 'staff' | 'admin' | 'mentor'
  grade: number | null
  interests: string[]
  goals: string[]
}
