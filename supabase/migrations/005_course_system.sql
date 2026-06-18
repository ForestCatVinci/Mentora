-- Sections table
CREATE TABLE IF NOT EXISTS public.sections (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id   UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  order_index INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add section_id to lessons
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS section_id UUID REFERENCES public.sections(id) ON DELETE SET NULL;

-- Enrollments table
CREATE TABLE IF NOT EXISTS public.enrollments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  course_id   UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_sections_course_id   ON public.sections(course_id);
CREATE INDEX IF NOT EXISTS idx_lessons_section_id   ON public.lessons(section_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course   ON public.enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_user     ON public.enrollments(user_id);

-- RLS
ALTER TABLE public.sections    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sections_select"  ON public.sections FOR SELECT USING (true);
CREATE POLICY "sections_manage"  ON public.sections FOR ALL   USING (public.current_user_role() IN ('staff','admin','mentor'));

CREATE POLICY "enrollments_select_own"  ON public.enrollments FOR SELECT USING (user_id = auth.uid() OR public.current_user_role() IN ('staff','admin'));
CREATE POLICY "enrollments_insert_own"  ON public.enrollments FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "enrollments_delete_own"  ON public.enrollments FOR DELETE USING (user_id = auth.uid());

-- Allow mentors to manage lessons
CREATE POLICY "lessons_manage_mentor" ON public.lessons FOR ALL USING (public.current_user_role() = 'mentor');
