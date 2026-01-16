export interface StudyCourse {
  id: string;
  user_id: string;
  name: string;
  total_lessons: number;
  current_lesson: number;
  created_at: string;
  updated_at: string;
}

export interface StudyDiaryEntry {
  id: string;
  user_id: string;
  course_id: string;
  entry_date: string;
  subject: string;
  summary: string;
  created_at: string;
  course?: StudyCourse;
}

export interface StudyQuestion {
  id: string;
  user_id: string;
  diary_entry_id: string;
  question: string;
  answer: string | null;
  is_favorite: boolean;
  created_at: string;
  diary_entry?: StudyDiaryEntry;
}
