import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useProfile } from './useProfile';
import { BattleType, BattleResult, BattleSession } from '@/types/rpg';

export interface BattleState {
  isActive: boolean;
  isPaused: boolean;
  battleType: BattleType | null;
  timeRemaining: number; // in seconds
  totalTime: number; // in seconds
  interruptions: number;
  currentSession: BattleSession | null;
}

const BATTLE_CONFIG = {
  minion: {
    duration: 25 * 60, // 25 minutes in seconds
    baseXP: 25,
    baseGold: 10,
    label: 'Minion',
    description: 'Sessão de foco de 25 minutos',
  },
  boss: {
    duration: 50 * 60, // 50 minutes in seconds
    baseXP: 60,
    baseGold: 30,
    label: 'Boss',
    description: 'Sessão intensa de 50 minutos',
  },
};

export function useBattle() {
  const { user } = useAuth();
  const { addXP, addGold, fetchProfile } = useProfile();
  const [state, setState] = useState<BattleState>({
    isActive: false,
    isPaused: false,
    battleType: null,
    timeRemaining: 0,
    totalTime: 0,
    interruptions: 0,
    currentSession: null,
  });
  const [history, setHistory] = useState<BattleSession[]>([]);
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch battle history
  const fetchHistory = useCallback(async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('battle_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('started_at', { ascending: false })
      .limit(20);

    if (!error && data) {
      setHistory(data as unknown as BattleSession[]);
    }
  }, [user]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Timer logic
  useEffect(() => {
    if (state.isActive && !state.isPaused && state.timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setState((prev) => {
          const newTime = prev.timeRemaining - 1;
          if (newTime <= 0) {
            // Battle completed!
            return { ...prev, timeRemaining: 0 };
          }
          return { ...prev, timeRemaining: newTime };
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [state.isActive, state.isPaused]);

  // Check for victory when timer reaches 0
  useEffect(() => {
    if (state.isActive && state.timeRemaining === 0 && state.battleType) {
      endBattle('victory');
    }
  }, [state.timeRemaining, state.isActive]);

  const startBattle = async (type: BattleType) => {
    if (!user) return;
    setLoading(true);

    const config = BATTLE_CONFIG[type];
    
    // Create battle session in database
    const { data, error } = await supabase
      .from('battle_sessions')
      .insert({
        user_id: user.id,
        battle_type: type,
        duration_minutes: config.duration / 60,
        result: 'abandoned' as BattleResult,
        interruptions: 0,
        xp_earned: 0,
        gold_earned: 0,
      })
      .select()
      .single();

    if (error) {
      console.error('Error starting battle:', error);
      setLoading(false);
      return;
    }

    setState({
      isActive: true,
      isPaused: false,
      battleType: type,
      timeRemaining: config.duration,
      totalTime: config.duration,
      interruptions: 0,
      currentSession: data as unknown as BattleSession,
    });

    setLoading(false);
  };

  const pauseBattle = () => {
    if (!state.isActive) return;
    
    setState((prev) => ({
      ...prev,
      isPaused: true,
      interruptions: prev.interruptions + 1,
    }));
  };

  const resumeBattle = () => {
    if (!state.isActive) return;
    
    setState((prev) => ({
      ...prev,
      isPaused: false,
    }));
  };

  const endBattle = async (result: BattleResult) => {
    if (!user || !state.currentSession || !state.battleType) return;
    setLoading(true);

    const config = BATTLE_CONFIG[state.battleType];
    let xpEarned = 0;
    let goldEarned = 0;

    if (result === 'victory') {
      // Calculate rewards based on interruptions
      const interruptionPenalty = Math.max(0, 1 - state.interruptions * 0.1);
      xpEarned = Math.floor(config.baseXP * interruptionPenalty);
      goldEarned = Math.floor(config.baseGold * interruptionPenalty);
    } else if (result === 'defeat') {
      // Partial rewards for defeat (gave up but fought)
      const progress = (state.totalTime - state.timeRemaining) / state.totalTime;
      xpEarned = Math.floor(config.baseXP * progress * 0.3);
      goldEarned = Math.floor(config.baseGold * progress * 0.2);
    }

    // Update battle session
    await supabase
      .from('battle_sessions')
      .update({
        result,
        interruptions: state.interruptions,
        xp_earned: xpEarned,
        gold_earned: goldEarned,
        ended_at: new Date().toISOString(),
      })
      .eq('id', state.currentSession.id);

    // Award XP and gold
    if (xpEarned > 0) {
      await addXP('discipline', xpEarned);
    }
    if (goldEarned > 0) {
      await addGold(goldEarned);
    }

    // Update profile battles won
    if (result === 'victory') {
      await supabase
        .from('profiles')
        .update({ total_battles_won: supabase.rpc ? undefined : undefined })
        .eq('id', user.id);
      
      // Increment battles won manually
      const { data: profile } = await supabase
        .from('profiles')
        .select('total_battles_won')
        .eq('id', user.id)
        .single();
      
      if (profile) {
        await supabase
          .from('profiles')
          .update({ total_battles_won: profile.total_battles_won + 1 })
          .eq('id', user.id);
      }
    }

    await fetchProfile();
    await fetchHistory();

    // Reset state
    setState({
      isActive: false,
      isPaused: false,
      battleType: null,
      timeRemaining: 0,
      totalTime: 0,
      interruptions: 0,
      currentSession: null,
    });

    setLoading(false);

    return { xpEarned, goldEarned, result };
  };

  const abandonBattle = () => endBattle('abandoned');
  const defeatBattle = () => endBattle('defeat');

  return {
    state,
    history,
    loading,
    config: BATTLE_CONFIG,
    startBattle,
    pauseBattle,
    resumeBattle,
    endBattle,
    abandonBattle,
    defeatBattle,
  };
}
