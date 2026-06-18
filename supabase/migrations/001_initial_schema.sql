-- Drop existing tables (order matters due to FK constraints)
DROP TABLE IF EXISTS public.user_progress CASCADE;
DROP TABLE IF EXISTS public.saved_posts CASCADE;
DROP TABLE IF EXISTS public.lessons CASCADE;
DROP TABLE IF EXISTS public.courses CASCADE;
DROP TABLE IF EXISTS public.posts CASCADE;
DROP TABLE IF EXISTS public.mentors CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Drop existing types
DROP TYPE IF EXISTS public.user_role CASCADE;
DROP TYPE IF EXISTS public.difficulty_level CASCADE;

-- ─── Types ───────────────────────────────────────────────────────────────────
CREATE TYPE public.user_role AS ENUM ('student', 'staff', 'admin');
CREATE TYPE public.difficulty_level AS ENUM ('beginner', 'intermediate', 'advanced');

-- ─── users ───────────────────────────────────────────────────────────────────
CREATE TABLE public.users (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  email        TEXT NOT NULL,
  full_name    TEXT,
  avatar_url   TEXT,
  role         public.user_role NOT NULL DEFAULT 'student',
  grade        INT CHECK (grade BETWEEN 8 AND 11),
  interests    TEXT[] DEFAULT '{}',
  goals        TEXT[] DEFAULT '{}'
);

-- ─── mentors ─────────────────────────────────────────────────────────────────
CREATE TABLE public.mentors (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id      UUID REFERENCES public.users(id) ON DELETE CASCADE,
  full_name    TEXT NOT NULL,
  avatar_url   TEXT,
  university   TEXT,
  speciality   TEXT,
  bio          TEXT,
  is_active    BOOLEAN NOT NULL DEFAULT TRUE
);

-- ─── posts ───────────────────────────────────────────────────────────────────
CREATE TABLE public.posts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by   UUID REFERENCES public.users(id) ON DELETE SET NULL,
  title        TEXT NOT NULL,
  description  TEXT,
  image_url    TEXT,
  deadline_date DATE,
  tags         TEXT[] DEFAULT '{}',
  category     TEXT,
  grade_range  INT[] DEFAULT '{}',
  location     TEXT,
  summary_ru   TEXT,
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  saves_count  INT NOT NULL DEFAULT 0
);

-- ─── courses ─────────────────────────────────────────────────────────────────
CREATE TABLE public.courses (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by   UUID REFERENCES public.users(id) ON DELETE SET NULL,
  title        TEXT NOT NULL,
  description  TEXT,
  image_url    TEXT,
  category     TEXT,
  difficulty   public.difficulty_level NOT NULL DEFAULT 'beginner',
  grade_range  INT[] DEFAULT '{}',
  is_published BOOLEAN NOT NULL DEFAULT FALSE
);

-- ─── lessons ─────────────────────────────────────────────────────────────────
CREATE TABLE public.lessons (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id    UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  description  TEXT,
  video_url    TEXT,
  order_index  INT NOT NULL DEFAULT 0
);

-- ─── saved_posts ─────────────────────────────────────────────────────────────
CREATE TABLE public.saved_posts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  post_id      UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);

-- ─── user_progress ───────────────────────────────────────────────────────────
CREATE TABLE public.user_progress (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  lesson_id    UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- ─── Indexes ─────────────────────────────────────────────────────────────────
CREATE INDEX idx_posts_is_published ON public.posts(is_published);
CREATE INDEX idx_posts_deadline ON public.posts(deadline_date);
CREATE INDEX idx_posts_created_at ON public.posts(created_at DESC);
CREATE INDEX idx_courses_is_published ON public.courses(is_published);
CREATE INDEX idx_lessons_course_id ON public.lessons(course_id);
CREATE INDEX idx_saved_posts_user_id ON public.saved_posts(user_id);

-- ─── RLS: Enable ─────────────────────────────────────────────────────────────
ALTER TABLE public.users        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentors      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_posts  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

-- ─── Helper: get current user role ───────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS public.user_role
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$;

-- ─── RLS: users ──────────────────────────────────────────────────────────────
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT USING (id = auth.uid() OR public.current_user_role() = 'admin');

CREATE POLICY "users_insert_self" ON public.users
  FOR INSERT WITH CHECK (id = auth.uid());

CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (id = auth.uid() OR public.current_user_role() = 'admin');

-- ─── RLS: mentors ────────────────────────────────────────────────────────────
CREATE POLICY "mentors_select_all" ON public.mentors
  FOR SELECT USING (is_active = TRUE OR public.current_user_role() IN ('staff','admin'));

CREATE POLICY "mentors_manage_admin" ON public.mentors
  FOR ALL USING (public.current_user_role() = 'admin');

-- ─── RLS: posts ──────────────────────────────────────────────────────────────
-- students see only published
CREATE POLICY "posts_select_published" ON public.posts
  FOR SELECT USING (
    is_published = TRUE
    OR created_by = auth.uid()
    OR public.current_user_role() IN ('staff','admin')
  );

-- staff can insert their own posts
CREATE POLICY "posts_insert_staff" ON public.posts
  FOR INSERT WITH CHECK (
    public.current_user_role() IN ('staff','admin')
    AND created_by = auth.uid()
  );

-- staff can update only their own; admin can update all
CREATE POLICY "posts_update_own_or_admin" ON public.posts
  FOR UPDATE USING (
    (public.current_user_role() = 'staff' AND created_by = auth.uid())
    OR public.current_user_role() = 'admin'
  );

CREATE POLICY "posts_delete_admin" ON public.posts
  FOR DELETE USING (public.current_user_role() = 'admin');

-- ─── RLS: courses ────────────────────────────────────────────────────────────
CREATE POLICY "courses_select_published" ON public.courses
  FOR SELECT USING (
    is_published = TRUE
    OR created_by = auth.uid()
    OR public.current_user_role() IN ('staff','admin')
  );

CREATE POLICY "courses_insert_staff" ON public.courses
  FOR INSERT WITH CHECK (
    public.current_user_role() IN ('staff','admin')
    AND created_by = auth.uid()
  );

CREATE POLICY "courses_update_own_or_admin" ON public.courses
  FOR UPDATE USING (
    (public.current_user_role() = 'staff' AND created_by = auth.uid())
    OR public.current_user_role() = 'admin'
  );

CREATE POLICY "courses_delete_admin" ON public.courses
  FOR DELETE USING (public.current_user_role() = 'admin');

-- ─── RLS: lessons ────────────────────────────────────────────────────────────
CREATE POLICY "lessons_select" ON public.lessons
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id = course_id
        AND (c.is_published = TRUE OR public.current_user_role() IN ('staff','admin'))
    )
  );

CREATE POLICY "lessons_manage_staff" ON public.lessons
  FOR ALL USING (public.current_user_role() IN ('staff','admin'));

-- ─── RLS: saved_posts ────────────────────────────────────────────────────────
CREATE POLICY "saved_select_own" ON public.saved_posts
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "saved_insert_own" ON public.saved_posts
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "saved_delete_own" ON public.saved_posts
  FOR DELETE USING (user_id = auth.uid());

-- ─── RLS: user_progress ──────────────────────────────────────────────────────
CREATE POLICY "progress_select_own" ON public.user_progress
  FOR SELECT USING (user_id = auth.uid() OR public.current_user_role() = 'admin');

CREATE POLICY "progress_insert_own" ON public.user_progress
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- ─── Trigger: auto-insert user row on auth signup ────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
