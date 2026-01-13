import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useProfile } from './useProfile';
import { VitalityLog } from '@/types/rpg';

const XP_PER_WATER_250ML = 5;
const XP_PER_WORKOUT = 50;

export function useVitality() {
  const { user } = useAuth();
  const { addXP, updateProfile, profile } = useProfile();
  const [todayLog, setTodayLog] = useState<VitalityLog | null>(null);
  const [history, setHistory] = useState<VitalityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchTodayLog();
      fetchHistory();
    }
  }, [user]);

  const getTodayStart = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today.toISOString();
  };

  const fetchTodayLog = async () => {
    if (!user) return;
    
    setLoading(true);
    const todayStart = getTodayStart();
    
    const { data, error } = await supabase
      .from('vitality_logs')
      .select('*')
      .eq('user_id', user.id)
      .gte('logged_at', todayStart)
      .order('logged_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error fetching today log:', error);
    } else {
      setTodayLog(data as VitalityLog | null);
    }
    setLoading(false);
  };

  const fetchHistory = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('vitality_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('logged_at', { ascending: false })
      .limit(30);

    if (error) {
      console.error('Error fetching vitality history:', error);
    } else {
      setHistory(data as VitalityLog[]);
    }
  };

  const addWater = async (ml: number = 250) => {
    if (!user) return;

    const xpEarned = Math.floor(ml / 250) * XP_PER_WATER_250ML;
    const todayStart = getTodayStart();

    // Check if we have a log for today
    const { data: existingLog } = await supabase
      .from('vitality_logs')
      .select('*')
      .eq('user_id', user.id)
      .gte('logged_at', todayStart)
      .limit(1)
      .maybeSingle();

    if (existingLog) {
      // Update existing log
      const newWaterMl = existingLog.water_ml + ml;
      const newXp = existingLog.xp_earned + xpEarned;
      
      const { error } = await supabase
        .from('vitality_logs')
        .update({ 
          water_ml: newWaterMl, 
          xp_earned: newXp 
        })
        .eq('id', existingLog.id);

      if (error) {
        console.error('Error updating water:', error);
        return;
      }
    } else {
      // Create new log
      const { error } = await supabase
        .from('vitality_logs')
        .insert({
          user_id: user.id,
          water_ml: ml,
          xp_earned: xpEarned,
        });

      if (error) {
        console.error('Error adding water:', error);
        return;
      }
    }

    // Update profile total water
    if (profile) {
      await updateProfile({ total_water_ml: profile.total_water_ml + ml });
    }
    
    // Add XP
    await addXP('vitality', xpEarned);
    await fetchTodayLog();
    await fetchHistory();
  };

  const logWorkout = async (workoutType: string) => {
    if (!user) return;

    const todayStart = getTodayStart();
    const xpEarned = XP_PER_WORKOUT;

    // Check if we have a log for today
    const { data: existingLog } = await supabase
      .from('vitality_logs')
      .select('*')
      .eq('user_id', user.id)
      .gte('logged_at', todayStart)
      .limit(1)
      .maybeSingle();

    if (existingLog) {
      // Update existing log
      const newXp = existingLog.xp_earned + xpEarned;
      
      const { error } = await supabase
        .from('vitality_logs')
        .update({ 
          workout_completed: true,
          workout_type: workoutType,
          xp_earned: newXp 
        })
        .eq('id', existingLog.id);

      if (error) {
        console.error('Error updating workout:', error);
        return;
      }
    } else {
      // Create new log
      const { error } = await supabase
        .from('vitality_logs')
        .insert({
          user_id: user.id,
          workout_completed: true,
          workout_type: workoutType,
          xp_earned: xpEarned,
        });

      if (error) {
        console.error('Error logging workout:', error);
        return;
      }
    }

    // Add XP
    await addXP('vitality', xpEarned);
    await fetchTodayLog();
    await fetchHistory();
  };

  return {
    todayLog,
    history,
    loading,
    addWater,
    logWorkout,
    fetchTodayLog,
    fetchHistory,
  };
}
