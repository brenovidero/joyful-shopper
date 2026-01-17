-- Create skills table for tracking learning goals
CREATE TABLE public.study_skills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  target_days INTEGER NOT NULL DEFAULT 100,
  current_day INTEGER NOT NULL DEFAULT 0,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create skill daily logs table
CREATE TABLE public.study_skill_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  skill_id UUID NOT NULL REFERENCES public.study_skills(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.study_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_skill_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for study_skills
CREATE POLICY "Users can view their own skills"
ON public.study_skills FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own skills"
ON public.study_skills FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own skills"
ON public.study_skills FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own skills"
ON public.study_skills FOR DELETE
USING (auth.uid() = user_id);

-- RLS policies for study_skill_logs
CREATE POLICY "Users can view their own skill logs"
ON public.study_skill_logs FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own skill logs"
ON public.study_skill_logs FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own skill logs"
ON public.study_skill_logs FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own skill logs"
ON public.study_skill_logs FOR DELETE
USING (auth.uid() = user_id);

-- Update trigger for study_skills
CREATE TRIGGER update_study_skills_updated_at
BEFORE UPDATE ON public.study_skills
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Index for faster queries
CREATE INDEX idx_study_skills_user_id ON public.study_skills(user_id);
CREATE INDEX idx_study_skill_logs_skill_id ON public.study_skill_logs(skill_id);
CREATE INDEX idx_study_skills_completed ON public.study_skills(user_id, is_completed);