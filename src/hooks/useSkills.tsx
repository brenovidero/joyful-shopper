import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { StudySkill, StudySkillLog } from '@/types/skill';

export function useSkills() {
  const { user } = useAuth();
  const [skills, setSkills] = useState<StudySkill[]>([]);
  const [logs, setLogs] = useState<StudySkillLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSkills = useCallback(async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('study_skills')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching skills:', error);
    } else {
      setSkills(data as StudySkill[]);
    }
  }, [user]);

  const fetchLogs = useCallback(async (skillId?: string) => {
    if (!user) return;
    
    let query = supabase
      .from('study_skill_logs')
      .select('*, skill:study_skills(*)')
      .eq('user_id', user.id)
      .order('day_number', { ascending: false });

    if (skillId) {
      query = query.eq('skill_id', skillId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching skill logs:', error);
    } else {
      setLogs(data as StudySkillLog[]);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchSkills();
      fetchLogs();
    } else {
      setSkills([]);
      setLogs([]);
    }
    setLoading(false);
  }, [user, fetchSkills, fetchLogs]);

  const createSkill = async (name: string, targetDays: number) => {
    if (!user) return { error: new Error('Not authenticated') };

    const { error } = await supabase
      .from('study_skills')
      .insert({
        user_id: user.id,
        name,
        target_days: targetDays,
      });

    if (!error) {
      await fetchSkills();
    }
    return { error };
  };

  const addSkillLog = async (
    skillId: string,
    title: string,
    content: string
  ) => {
    if (!user) return { error: new Error('Not authenticated') };

    // Get current day number for this skill
    const skill = skills.find(s => s.id === skillId);
    if (!skill) return { error: new Error('Skill not found') };

    const newDayNumber = skill.current_day + 1;
    const isCompleting = newDayNumber >= skill.target_days;

    // Insert the log
    const { error: logError } = await supabase
      .from('study_skill_logs')
      .insert({
        user_id: user.id,
        skill_id: skillId,
        day_number: newDayNumber,
        title,
        content,
      });

    if (logError) return { error: logError };

    // Update skill progress
    const updateData: Partial<StudySkill> = {
      current_day: newDayNumber,
    };

    if (isCompleting) {
      updateData.is_completed = true;
      updateData.completed_at = new Date().toISOString();
    }

    const { error: updateError } = await supabase
      .from('study_skills')
      .update(updateData)
      .eq('id', skillId)
      .eq('user_id', user.id);

    if (!updateError) {
      await fetchSkills();
      await fetchLogs(skillId);
    }

    return { error: updateError, isCompleted: isCompleting };
  };

  const deleteSkill = async (skillId: string) => {
    if (!user) return { error: new Error('Not authenticated') };

    const { error } = await supabase
      .from('study_skills')
      .delete()
      .eq('id', skillId)
      .eq('user_id', user.id);

    if (!error) {
      await fetchSkills();
    }
    return { error };
  };

  const deleteLog = async (logId: string, skillId: string) => {
    if (!user) return { error: new Error('Not authenticated') };

    const { error } = await supabase
      .from('study_skill_logs')
      .delete()
      .eq('id', logId)
      .eq('user_id', user.id);

    if (!error) {
      await fetchLogs(skillId);
    }
    return { error };
  };

  const completedSkills = skills.filter(s => s.is_completed);
  const activeSkills = skills.filter(s => !s.is_completed);

  return {
    skills,
    logs,
    loading,
    activeSkills,
    completedSkills,
    fetchSkills,
    fetchLogs,
    createSkill,
    addSkillLog,
    deleteSkill,
    deleteLog,
  };
}
