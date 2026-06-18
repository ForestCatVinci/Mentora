-- Add mentor to role enum
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'mentor';

-- Mentors can insert/update their own mentors row
CREATE POLICY "mentors_insert_own" ON public.mentors
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "mentors_update_own" ON public.mentors
  FOR UPDATE USING (user_id = auth.uid());

-- Allow mentors to create and update their own posts
CREATE POLICY "posts_insert_mentor" ON public.posts
  FOR INSERT WITH CHECK (
    public.current_user_role() = 'mentor'
    AND created_by = auth.uid()
  );

CREATE POLICY "posts_update_mentor_own" ON public.posts
  FOR UPDATE USING (
    public.current_user_role() = 'mentor' AND created_by = auth.uid()
  );
