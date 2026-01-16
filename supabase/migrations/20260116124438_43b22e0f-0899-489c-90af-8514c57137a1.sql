-- Create study_courses table
CREATE TABLE public.study_courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  total_lessons INTEGER NOT NULL DEFAULT 1,
  current_lesson INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.study_courses ENABLE ROW LEVEL SECURITY;

-- RLS policies for study_courses
CREATE POLICY "Users can view their own courses"
ON public.study_courses FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own courses"
ON public.study_courses FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own courses"
ON public.study_courses FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own courses"
ON public.study_courses FOR DELETE
USING (auth.uid() = user_id);

-- Create study_diary_entries table
CREATE TABLE public.study_diary_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  course_id UUID NOT NULL REFERENCES public.study_courses(id) ON DELETE CASCADE,
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  subject TEXT NOT NULL,
  summary TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.study_diary_entries ENABLE ROW LEVEL SECURITY;

-- RLS policies for study_diary_entries
CREATE POLICY "Users can view their own diary entries"
ON public.study_diary_entries FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own diary entries"
ON public.study_diary_entries FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own diary entries"
ON public.study_diary_entries FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own diary entries"
ON public.study_diary_entries FOR DELETE
USING (auth.uid() = user_id);

-- Create study_questions table
CREATE TABLE public.study_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  diary_entry_id UUID NOT NULL REFERENCES public.study_diary_entries(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT,
  is_favorite BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.study_questions ENABLE ROW LEVEL SECURITY;

-- RLS policies for study_questions
CREATE POLICY "Users can view their own questions"
ON public.study_questions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own questions"
ON public.study_questions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own questions"
ON public.study_questions FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own questions"
ON public.study_questions FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for updated_at on study_courses
CREATE TRIGGER update_study_courses_updated_at
BEFORE UPDATE ON public.study_courses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();