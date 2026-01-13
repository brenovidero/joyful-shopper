import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { startOfWeek, endOfWeek, eachDayOfInterval, format, subDays } from 'date-fns';

interface DailyActivity {
  date: string;
  pages: number;
  battles: number;
  water: number;
  workouts: number;
}

interface WeeklyStats {
  totalPages: number;
  totalBattles: number;
  totalWater: number;
  totalWorkouts: number;
  battlesWon: number;
}

export function useStats() {
  const { user } = useAuth();
  const [dailyActivity, setDailyActivity] = useState<DailyActivity[]>([]);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats>({
    totalPages: 0,
    totalBattles: 0,
    totalWater: 0,
    totalWorkouts: 0,
    battlesWon: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    if (!user) return;
    
    setLoading(true);
    
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
    const last30Days = subDays(now, 30);

    // Fetch reading sessions for last 30 days
    const { data: readingSessions } = await supabase
      .from('reading_sessions')
      .select('pages_read, created_at')
      .eq('user_id', user.id)
      .gte('created_at', last30Days.toISOString());

    // Fetch battle sessions for last 30 days
    const { data: battleSessions } = await supabase
      .from('battle_sessions')
      .select('result, started_at, duration_minutes')
      .eq('user_id', user.id)
      .gte('started_at', last30Days.toISOString());

    // Fetch vitality logs for last 30 days
    const { data: vitalityLogs } = await supabase
      .from('vitality_logs')
      .select('water_ml, workout_completed, logged_at')
      .eq('user_id', user.id)
      .gte('logged_at', last30Days.toISOString());

    // Build daily activity map
    const days = eachDayOfInterval({ start: last30Days, end: now });
    const activityMap: Record<string, DailyActivity> = {};

    days.forEach(day => {
      const key = format(day, 'yyyy-MM-dd');
      activityMap[key] = { date: key, pages: 0, battles: 0, water: 0, workouts: 0 };
    });

    // Aggregate reading
    readingSessions?.forEach(session => {
      const key = format(new Date(session.created_at), 'yyyy-MM-dd');
      if (activityMap[key]) {
        activityMap[key].pages += session.pages_read;
      }
    });

    // Aggregate battles
    battleSessions?.forEach(session => {
      const key = format(new Date(session.started_at), 'yyyy-MM-dd');
      if (activityMap[key]) {
        activityMap[key].battles += 1;
      }
    });

    // Aggregate vitality
    vitalityLogs?.forEach(log => {
      const key = format(new Date(log.logged_at), 'yyyy-MM-dd');
      if (activityMap[key]) {
        activityMap[key].water += log.water_ml;
        if (log.workout_completed) {
          activityMap[key].workouts += 1;
        }
      }
    });

    setDailyActivity(Object.values(activityMap).sort((a, b) => a.date.localeCompare(b.date)));

    // Calculate weekly stats
    const weekStartStr = format(weekStart, 'yyyy-MM-dd');
    const weekEndStr = format(weekEnd, 'yyyy-MM-dd');
    
    const weeklyPages = readingSessions?.filter(s => {
      const d = format(new Date(s.created_at), 'yyyy-MM-dd');
      return d >= weekStartStr && d <= weekEndStr;
    }).reduce((sum, s) => sum + s.pages_read, 0) || 0;

    const weeklyBattles = battleSessions?.filter(s => {
      const d = format(new Date(s.started_at), 'yyyy-MM-dd');
      return d >= weekStartStr && d <= weekEndStr;
    }) || [];

    const weeklyVitality = vitalityLogs?.filter(l => {
      const d = format(new Date(l.logged_at), 'yyyy-MM-dd');
      return d >= weekStartStr && d <= weekEndStr;
    }) || [];

    setWeeklyStats({
      totalPages: weeklyPages,
      totalBattles: weeklyBattles.length,
      battlesWon: weeklyBattles.filter(b => b.result === 'victory').length,
      totalWater: weeklyVitality.reduce((sum, l) => sum + l.water_ml, 0),
      totalWorkouts: weeklyVitality.filter(l => l.workout_completed).length,
    });

    setLoading(false);
  };

  return {
    dailyActivity,
    weeklyStats,
    loading,
    refetch: fetchStats,
  };
}
