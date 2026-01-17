export interface StudySkill {
  id: string;
  user_id: string;
  name: string;
  target_days: number;
  current_day: number;
  is_completed: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface StudySkillLog {
  id: string;
  user_id: string;
  skill_id: string;
  day_number: number;
  title: string;
  content: string;
  log_date: string;
  created_at: string;
  skill?: StudySkill;
}
