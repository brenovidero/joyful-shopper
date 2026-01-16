import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { StudyCourse, StudyDiaryEntry, StudyQuestion } from '@/types/study';

export function useStudy() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<StudyCourse[]>([]);
  const [diaryEntries, setDiaryEntries] = useState<StudyDiaryEntry[]>([]);
  const [questions, setQuestions] = useState<StudyQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCourses = useCallback(async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('study_courses')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching courses:', error);
    } else {
      setCourses(data as StudyCourse[]);
    }
  }, [user]);

  const fetchDiaryEntries = useCallback(async (courseId?: string) => {
    if (!user) return;
    
    let query = supabase
      .from('study_diary_entries')
      .select('*, course:study_courses(*)')
      .eq('user_id', user.id)
      .order('entry_date', { ascending: false });

    if (courseId) {
      query = query.eq('course_id', courseId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching diary entries:', error);
    } else {
      setDiaryEntries(data as StudyDiaryEntry[]);
    }
  }, [user]);

  const fetchQuestions = useCallback(async (favoritesOnly = false) => {
    if (!user) return;
    
    let query = supabase
      .from('study_questions')
      .select('*, diary_entry:study_diary_entries(*, course:study_courses(*))')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (favoritesOnly) {
      query = query.eq('is_favorite', true);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching questions:', error);
    } else {
      setQuestions(data as StudyQuestion[]);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchCourses();
      fetchDiaryEntries();
      fetchQuestions();
    } else {
      setCourses([]);
      setDiaryEntries([]);
      setQuestions([]);
    }
    setLoading(false);
  }, [user, fetchCourses, fetchDiaryEntries, fetchQuestions]);

  const createCourse = async (name: string, totalLessons: number) => {
    if (!user) return { error: new Error('Not authenticated') };

    const { error } = await supabase
      .from('study_courses')
      .insert({
        user_id: user.id,
        name,
        total_lessons: totalLessons,
        current_lesson: 0,
      });

    if (!error) {
      await fetchCourses();
    }
    return { error };
  };

  const updateCourse = async (courseId: string, updates: Partial<StudyCourse>) => {
    if (!user) return { error: new Error('Not authenticated') };

    const { error } = await supabase
      .from('study_courses')
      .update(updates)
      .eq('id', courseId)
      .eq('user_id', user.id);

    if (!error) {
      await fetchCourses();
    }
    return { error };
  };

  const deleteCourse = async (courseId: string) => {
    if (!user) return { error: new Error('Not authenticated') };

    const { error } = await supabase
      .from('study_courses')
      .delete()
      .eq('id', courseId)
      .eq('user_id', user.id);

    if (!error) {
      await fetchCourses();
    }
    return { error };
  };

  const createDiaryEntry = async (
    courseId: string,
    subject: string,
    summary: string,
    entryDate?: string
  ) => {
    if (!user) return { error: new Error('Not authenticated') };

    const { error } = await supabase
      .from('study_diary_entries')
      .insert({
        user_id: user.id,
        course_id: courseId,
        subject,
        summary,
        entry_date: entryDate || new Date().toISOString().split('T')[0],
      });

    if (!error) {
      await fetchDiaryEntries();
    }
    return { error };
  };

  const deleteDiaryEntry = async (entryId: string) => {
    if (!user) return { error: new Error('Not authenticated') };

    const { error } = await supabase
      .from('study_diary_entries')
      .delete()
      .eq('id', entryId)
      .eq('user_id', user.id);

    if (!error) {
      await fetchDiaryEntries();
    }
    return { error };
  };

  const saveQuestions = async (diaryEntryId: string, questionsList: string[]) => {
    if (!user) return { error: new Error('Not authenticated') };

    const questionsToInsert = questionsList.map((q) => ({
      user_id: user.id,
      diary_entry_id: diaryEntryId,
      question: q,
    }));

    const { error } = await supabase
      .from('study_questions')
      .insert(questionsToInsert);

    if (!error) {
      await fetchQuestions();
    }
    return { error };
  };

  const toggleFavorite = async (questionId: string, isFavorite: boolean) => {
    if (!user) return { error: new Error('Not authenticated') };

    const { error } = await supabase
      .from('study_questions')
      .update({ is_favorite: isFavorite })
      .eq('id', questionId)
      .eq('user_id', user.id);

    if (!error) {
      await fetchQuestions();
    }
    return { error };
  };

  const deleteQuestion = async (questionId: string) => {
    if (!user) return { error: new Error('Not authenticated') };

    const { error } = await supabase
      .from('study_questions')
      .delete()
      .eq('id', questionId)
      .eq('user_id', user.id);

    if (!error) {
      await fetchQuestions();
    }
    return { error };
  };

  return {
    courses,
    diaryEntries,
    questions,
    loading,
    fetchCourses,
    fetchDiaryEntries,
    fetchQuestions,
    createCourse,
    updateCourse,
    deleteCourse,
    createDiaryEntry,
    deleteDiaryEntry,
    saveQuestions,
    toggleFavorite,
    deleteQuestion,
  };
}
