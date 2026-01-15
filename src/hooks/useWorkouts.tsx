import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useProfile } from './useProfile';
import {
  StrengthExercise,
  UserCustomExercise,
  WorkoutPlan,
  WorkoutPlanDay,
  WorkoutPlanExercise,
  StrengthSession,
  CardioSession,
  YogaPose,
  YogaSession,
  MartialArtsStyle,
  MartialArtsSession,
  SwimmingStyle,
  SwimmingSession,
  OtherExercise,
  OtherExerciseSession,
  ExerciseCategory,
  WorkoutDay,
  CardioType,
} from '@/types/workout';

const XP_PER_STRENGTH_SET = 5;
const XP_PER_CARDIO_MINUTE = 2;
const XP_PER_YOGA_POSE = 10;
const XP_PER_MARTIAL_ROUND = 15;
const XP_PER_SWIMMING_LAP = 8;
const XP_PER_OTHER_SET = 5;

export function useStrengthExercises() {
  const [exercises, setExercises] = useState<StrengthExercise[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExercises();
  }, []);

  const fetchExercises = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('strength_exercises')
      .select('*')
      .order('category', { ascending: true })
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching exercises:', error);
    } else {
      setExercises(data as unknown as StrengthExercise[]);
    }
    setLoading(false);
  };

  const getExercisesByCategory = (category: ExerciseCategory) => {
    return exercises.filter(e => e.category === category);
  };

  return { exercises, loading, fetchExercises, getExercisesByCategory };
}

export function useCustomExercises() {
  const { user } = useAuth();
  const [customExercises, setCustomExercises] = useState<UserCustomExercise[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchCustomExercises();
    }
  }, [user]);

  const fetchCustomExercises = async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('user_custom_exercises')
      .select('*')
      .eq('user_id', user.id)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching custom exercises:', error);
    } else {
      setCustomExercises(data as unknown as UserCustomExercise[]);
    }
    setLoading(false);
  };

  const createCustomExercise = async (exercise: Omit<UserCustomExercise, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('user_custom_exercises')
      .insert({ ...exercise, user_id: user.id })
      .select()
      .single();

    if (error) {
      console.error('Error creating custom exercise:', error);
      return null;
    }

    await fetchCustomExercises();
    return data as unknown as UserCustomExercise;
  };

  const deleteCustomExercise = async (id: string) => {
    const { error } = await supabase
      .from('user_custom_exercises')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting custom exercise:', error);
      return false;
    }

    await fetchCustomExercises();
    return true;
  };

  return { customExercises, loading, fetchCustomExercises, createCustomExercise, deleteCustomExercise };
}

export function useWorkoutPlans() {
  const { user } = useAuth();
  const { addXP } = useProfile();
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [activePlan, setActivePlan] = useState<WorkoutPlan | null>(null);
  const [planDays, setPlanDays] = useState<WorkoutPlanDay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchPlans();
    }
  }, [user]);

  const fetchPlans = async () => {
    if (!user) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('workout_plans')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching plans:', error);
    } else {
      const plansData = data as unknown as WorkoutPlan[];
      setPlans(plansData);
      const active = plansData.find(p => p.is_active);
      setActivePlan(active || null);
      
      if (active) {
        await fetchPlanDays(active.id);
      }
    }
    setLoading(false);
  };

  const fetchPlanDays = async (planId: string) => {
    const { data: daysData, error: daysError } = await supabase
      .from('workout_plan_days')
      .select('*')
      .eq('plan_id', planId)
      .order('day_of_week', { ascending: true });

    if (daysError) {
      console.error('Error fetching plan days:', daysError);
      return;
    }

    const days = daysData as unknown as WorkoutPlanDay[];

    // Fetch exercises for each day
    for (const day of days) {
      const { data: exercisesData } = await supabase
        .from('workout_plan_exercises')
        .select(`
          *,
          exercise:strength_exercises(*),
          custom_exercise:user_custom_exercises(*)
        `)
        .eq('plan_day_id', day.id)
        .order('order_index', { ascending: true });

      day.exercises = (exercisesData as unknown as WorkoutPlanExercise[]) || [];
    }

    setPlanDays(days);
  };

  const createPlan = async (name: string) => {
    if (!user) return null;

    // Deactivate other plans
    await supabase
      .from('workout_plans')
      .update({ is_active: false })
      .eq('user_id', user.id);

    const { data, error } = await supabase
      .from('workout_plans')
      .insert({ user_id: user.id, name, is_active: true })
      .select()
      .single();

    if (error) {
      console.error('Error creating plan:', error);
      return null;
    }

    await fetchPlans();
    return data as unknown as WorkoutPlan;
  };

  const addDayToPlan = async (planId: string, dayOfWeek: WorkoutDay, name: string, targetMuscles: ExerciseCategory[]) => {
    const { data, error } = await supabase
      .from('workout_plan_days')
      .insert({ 
        plan_id: planId, 
        day_of_week: dayOfWeek, 
        name,
        target_muscles: targetMuscles 
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding day to plan:', error);
      return null;
    }

    await fetchPlanDays(planId);
    return data as unknown as WorkoutPlanDay;
  };

  const addExerciseToDay = async (
    planDayId: string,
    exerciseId: string | null,
    customExerciseId: string | null,
    sets: number,
    reps: number,
    weightKg?: number
  ) => {
    // Get current max order index
    const { data: existingExercises } = await supabase
      .from('workout_plan_exercises')
      .select('order_index')
      .eq('plan_day_id', planDayId)
      .order('order_index', { ascending: false })
      .limit(1);

    const orderIndex = existingExercises && existingExercises.length > 0 
      ? (existingExercises[0].order_index + 1) 
      : 0;

    const { error } = await supabase
      .from('workout_plan_exercises')
      .insert({
        plan_day_id: planDayId,
        exercise_id: exerciseId,
        custom_exercise_id: customExerciseId,
        order_index: orderIndex,
        sets,
        reps,
        weight_kg: weightKg,
      });

    if (error) {
      console.error('Error adding exercise to day:', error);
      return false;
    }

    if (activePlan) {
      await fetchPlanDays(activePlan.id);
    }
    return true;
  };

  const removeExerciseFromDay = async (exerciseId: string) => {
    const { error } = await supabase
      .from('workout_plan_exercises')
      .delete()
      .eq('id', exerciseId);

    if (error) {
      console.error('Error removing exercise:', error);
      return false;
    }

    if (activePlan) {
      await fetchPlanDays(activePlan.id);
    }
    return true;
  };

  const removeDayFromPlan = async (dayId: string) => {
    const { error } = await supabase
      .from('workout_plan_days')
      .delete()
      .eq('id', dayId);

    if (error) {
      console.error('Error removing day:', error);
      return false;
    }

    if (activePlan) {
      await fetchPlanDays(activePlan.id);
    }
    return true;
  };

  const startStrengthSession = async (planDayId?: string) => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('strength_sessions')
      .insert({
        user_id: user.id,
        plan_day_id: planDayId,
      })
      .select()
      .single();

    if (error) {
      console.error('Error starting session:', error);
      return null;
    }

    return data as unknown as StrengthSession;
  };

  const endStrengthSession = async (
    sessionId: string,
    totalSets: number,
    totalReps: number,
    totalWeightKg: number
  ) => {
    const xpEarned = totalSets * XP_PER_STRENGTH_SET;
    const now = new Date().toISOString();

    const { data: session } = await supabase
      .from('strength_sessions')
      .select('started_at')
      .eq('id', sessionId)
      .single();

    const durationMinutes = session 
      ? Math.round((new Date(now).getTime() - new Date(session.started_at).getTime()) / 60000)
      : 0;

    const { error } = await supabase
      .from('strength_sessions')
      .update({
        ended_at: now,
        duration_minutes: durationMinutes,
        total_sets: totalSets,
        total_reps: totalReps,
        total_weight_kg: totalWeightKg,
        xp_earned: xpEarned,
      })
      .eq('id', sessionId);

    if (error) {
      console.error('Error ending session:', error);
      return 0;
    }

    await addXP('vitality', xpEarned);
    return xpEarned;
  };

  return {
    plans,
    activePlan,
    planDays,
    loading,
    fetchPlans,
    fetchPlanDays,
    createPlan,
    addDayToPlan,
    addExerciseToDay,
    removeExerciseFromDay,
    removeDayFromPlan,
    startStrengthSession,
    endStrengthSession,
  };
}

export function useCardioSessions() {
  const { user } = useAuth();
  const { addXP } = useProfile();
  const [sessions, setSessions] = useState<CardioSession[]>([]);
  const [activeSession, setActiveSession] = useState<CardioSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSessions();
    }
  }, [user]);

  const fetchSessions = async () => {
    if (!user) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('cardio_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('started_at', { ascending: false })
      .limit(30);

    if (error) {
      console.error('Error fetching cardio sessions:', error);
    } else {
      setSessions(data as unknown as CardioSession[]);
    }
    setLoading(false);
  };

  const startSession = async (cardioType: CardioType) => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('cardio_sessions')
      .insert({
        user_id: user.id,
        cardio_type: cardioType,
      })
      .select()
      .single();

    if (error) {
      console.error('Error starting cardio session:', error);
      return null;
    }

    const session = data as unknown as CardioSession;
    setActiveSession(session);
    return session;
  };

  const updateSession = async (
    sessionId: string,
    updates: Partial<CardioSession>
  ) => {
    const { error } = await supabase
      .from('cardio_sessions')
      .update(updates)
      .eq('id', sessionId);

    if (error) {
      console.error('Error updating cardio session:', error);
      return false;
    }

    return true;
  };

  const endSession = async (
    sessionId: string,
    durationMinutes: number,
    distanceMeters?: number,
    caloriesBurned?: number
  ) => {
    const xpEarned = durationMinutes * XP_PER_CARDIO_MINUTE;
    const now = new Date().toISOString();

    const { error } = await supabase
      .from('cardio_sessions')
      .update({
        ended_at: now,
        duration_minutes: durationMinutes,
        distance_meters: distanceMeters,
        calories_burned: caloriesBurned,
        xp_earned: xpEarned,
      })
      .eq('id', sessionId);

    if (error) {
      console.error('Error ending cardio session:', error);
      return 0;
    }

    setActiveSession(null);
    await addXP('vitality', xpEarned);
    await fetchSessions();
    return xpEarned;
  };

  return {
    sessions,
    activeSession,
    loading,
    fetchSessions,
    startSession,
    updateSession,
    endSession,
    setActiveSession,
  };
}

export function useYogaSessions() {
  const { user } = useAuth();
  const { addXP } = useProfile();
  const [poses, setPoses] = useState<YogaPose[]>([]);
  const [sessions, setSessions] = useState<YogaSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPoses();
    if (user) {
      fetchSessions();
    }
  }, [user]);

  const fetchPoses = async () => {
    const { data, error } = await supabase
      .from('yoga_poses')
      .select('*')
      .order('difficulty', { ascending: true })
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching yoga poses:', error);
    } else {
      setPoses(data as unknown as YogaPose[]);
    }
  };

  const fetchSessions = async () => {
    if (!user) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('yoga_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('started_at', { ascending: false })
      .limit(30);

    if (error) {
      console.error('Error fetching yoga sessions:', error);
    } else {
      setSessions(data as unknown as YogaSession[]);
    }
    setLoading(false);
  };

  const startSession = async (sessionType: string) => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('yoga_sessions')
      .insert({
        user_id: user.id,
        session_type: sessionType,
      })
      .select()
      .single();

    if (error) {
      console.error('Error starting yoga session:', error);
      return null;
    }

    return data as unknown as YogaSession;
  };

  const endSession = async (sessionId: string, posesCompleted: number, durationMinutes: number) => {
    const xpEarned = posesCompleted * XP_PER_YOGA_POSE;
    const now = new Date().toISOString();

    const { error } = await supabase
      .from('yoga_sessions')
      .update({
        ended_at: now,
        duration_minutes: durationMinutes,
        poses_completed: posesCompleted,
        xp_earned: xpEarned,
      })
      .eq('id', sessionId);

    if (error) {
      console.error('Error ending yoga session:', error);
      return 0;
    }

    await addXP('vitality', xpEarned);
    await fetchSessions();
    return xpEarned;
  };

  return { poses, sessions, loading, fetchPoses, fetchSessions, startSession, endSession };
}

export function useMartialArtsSessions() {
  const { user } = useAuth();
  const { addXP } = useProfile();
  const [styles, setStyles] = useState<MartialArtsStyle[]>([]);
  const [sessions, setSessions] = useState<MartialArtsSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStyles();
    if (user) {
      fetchSessions();
    }
  }, [user]);

  const fetchStyles = async () => {
    const { data, error } = await supabase
      .from('martial_arts_styles')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching martial arts styles:', error);
    } else {
      setStyles(data as unknown as MartialArtsStyle[]);
    }
  };

  const fetchSessions = async () => {
    if (!user) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('martial_arts_sessions')
      .select('*, style:martial_arts_styles(*)')
      .eq('user_id', user.id)
      .order('started_at', { ascending: false })
      .limit(30);

    if (error) {
      console.error('Error fetching martial arts sessions:', error);
    } else {
      setSessions(data as unknown as MartialArtsSession[]);
    }
    setLoading(false);
  };

  const logSession = async (
    styleId: string,
    durationMinutes: number,
    roundsCompleted: number,
    intensity: number,
    sparring: boolean,
    techniquesPracticed?: string[]
  ) => {
    if (!user) return 0;

    const xpEarned = roundsCompleted * XP_PER_MARTIAL_ROUND + (sparring ? 20 : 0);
    const now = new Date().toISOString();

    const { error } = await supabase
      .from('martial_arts_sessions')
      .insert({
        user_id: user.id,
        style_id: styleId,
        started_at: now,
        ended_at: now,
        duration_minutes: durationMinutes,
        rounds_completed: roundsCompleted,
        intensity,
        sparring,
        techniques_practiced: techniquesPracticed,
        xp_earned: xpEarned,
      });

    if (error) {
      console.error('Error logging martial arts session:', error);
      return 0;
    }

    await addXP('vitality', xpEarned);
    await fetchSessions();
    return xpEarned;
  };

  return { styles, sessions, loading, fetchStyles, fetchSessions, logSession };
}

export function useSwimmingSessions() {
  const { user } = useAuth();
  const { addXP } = useProfile();
  const [styles, setStyles] = useState<SwimmingStyle[]>([]);
  const [sessions, setSessions] = useState<SwimmingSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStyles();
    if (user) {
      fetchSessions();
    }
  }, [user]);

  const fetchStyles = async () => {
    const { data, error } = await supabase
      .from('swimming_styles')
      .select('*')
      .order('difficulty', { ascending: true });

    if (error) {
      console.error('Error fetching swimming styles:', error);
    } else {
      setStyles(data as unknown as SwimmingStyle[]);
    }
  };

  const fetchSessions = async () => {
    if (!user) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('swimming_sessions')
      .select('*, style:swimming_styles(*)')
      .eq('user_id', user.id)
      .order('started_at', { ascending: false })
      .limit(30);

    if (error) {
      console.error('Error fetching swimming sessions:', error);
    } else {
      setSessions(data as unknown as SwimmingSession[]);
    }
    setLoading(false);
  };

  const logSession = async (
    styleId: string,
    durationMinutes: number,
    lapsCompleted: number,
    poolLengthMeters: number
  ) => {
    if (!user) return 0;

    const xpEarned = lapsCompleted * XP_PER_SWIMMING_LAP;
    const totalDistanceMeters = lapsCompleted * poolLengthMeters;
    const now = new Date().toISOString();

    const { error } = await supabase
      .from('swimming_sessions')
      .insert({
        user_id: user.id,
        style_id: styleId,
        started_at: now,
        ended_at: now,
        duration_minutes: durationMinutes,
        laps_completed: lapsCompleted,
        pool_length_meters: poolLengthMeters,
        total_distance_meters: totalDistanceMeters,
        xp_earned: xpEarned,
      });

    if (error) {
      console.error('Error logging swimming session:', error);
      return 0;
    }

    await addXP('vitality', xpEarned);
    await fetchSessions();
    return xpEarned;
  };

  return { styles, sessions, loading, fetchStyles, fetchSessions, logSession };
}

export function useOtherExercises() {
  const { user } = useAuth();
  const { addXP } = useProfile();
  const [exercises, setExercises] = useState<OtherExercise[]>([]);
  const [sessions, setSessions] = useState<OtherExerciseSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExercises();
    if (user) {
      fetchSessions();
    }
  }, [user]);

  const fetchExercises = async () => {
    const { data, error } = await supabase
      .from('other_exercises')
      .select('*')
      .order('category', { ascending: true })
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching other exercises:', error);
    } else {
      setExercises(data as unknown as OtherExercise[]);
    }
  };

  const fetchSessions = async () => {
    if (!user) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('other_exercise_sessions')
      .select('*, exercise:other_exercises(*)')
      .eq('user_id', user.id)
      .order('started_at', { ascending: false })
      .limit(30);

    if (error) {
      console.error('Error fetching other exercise sessions:', error);
    } else {
      setSessions(data as unknown as OtherExerciseSession[]);
    }
    setLoading(false);
  };

  const logSession = async (
    exerciseId: string | null,
    customName: string | null,
    durationMinutes: number,
    setsCompleted?: number,
    repsCompleted?: number
  ) => {
    if (!user) return 0;

    const xpEarned = (setsCompleted || 1) * XP_PER_OTHER_SET;
    const now = new Date().toISOString();

    const { error } = await supabase
      .from('other_exercise_sessions')
      .insert({
        user_id: user.id,
        exercise_id: exerciseId,
        custom_name: customName,
        started_at: now,
        ended_at: now,
        duration_minutes: durationMinutes,
        sets_completed: setsCompleted,
        reps_completed: repsCompleted,
        xp_earned: xpEarned,
      });

    if (error) {
      console.error('Error logging other exercise session:', error);
      return 0;
    }

    await addXP('vitality', xpEarned);
    await fetchSessions();
    return xpEarned;
  };

  return { exercises, sessions, loading, fetchExercises, fetchSessions, logSession };
}
