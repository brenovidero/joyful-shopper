import { useCallback, useRef } from 'react';
import { useToast } from './use-toast';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

type AlertType = 
  | 'welcome_back'
  | 'first_registration'
  | 'quest_completed'
  | 'level_up'
  | 'task_completed'
  | 'reading_logged'
  | 'workout_logged'
  | 'battle_victory'
  | 'battle_defeat'
  | 'daily_goal_completed'
  | 'study_session_completed';

interface AlertConfig {
  message: string;
  showToast?: boolean;
}

const alertMessages: Record<AlertType, (data?: any) => AlertConfig> = {
  welcome_back: (data) => ({
    message: `[SISTEMA] Jogador ${data?.name || 'Caçador'} detectado. Bem-vindo de volta. O tempo não espera. Continue evoluindo.`,
    showToast: true
  }),
  first_registration: (data) => ({
    message: `[SISTEMA] Novo Caçador registrado. ${data?.name || 'Jogador'}, sua jornada começa agora. Prove seu valor.`,
    showToast: true
  }),
  quest_completed: (data) => ({
    message: `[AVISO: QUEST CONCLUÍDA] +${data?.xp || 100} XP adicionados ao jogador ${data?.name || 'Caçador'}. Continue.`,
    showToast: true
  }),
  level_up: (data) => ({
    message: `[NÍVEL AUMENTADO] Jogador ${data?.name || 'Caçador'} alcançou Nível ${data?.level || '?'}. Novos desafios aguardam.`,
    showToast: true
  }),
  task_completed: (data) => ({
    message: `[MISSÃO CONCLUÍDA] Tarefa "${data?.task || 'desconhecida'}" finalizada. +${data?.xp || 50} XP. +${data?.gold || 10} Gold.`,
    showToast: true
  }),
  reading_logged: (data) => ({
    message: `[SISTEMA] ${data?.pages || 0} páginas registradas. +${data?.xp || 0} XP Inteligência.`,
    showToast: false
  }),
  workout_logged: (data) => ({
    message: `[SISTEMA] Treino ${data?.type || ''} registrado. +${data?.xp || 50} XP Vitalidade.`,
    showToast: false
  }),
  battle_victory: (data) => ({
    message: `[VITÓRIA] Batalha ${data?.type === 'boss' ? 'contra BOSS' : ''} concluída. +${data?.xp || 100} XP. +${data?.gold || 25} Gold. ${data?.type === 'boss' ? 'O Sistema reconhece sua força.' : 'Oponente eliminado.'}`,
    showToast: true
  }),
  battle_defeat: (data) => ({
    message: `[DERROTA] Batalha abandonada. Sem recompensas. ${data?.message || 'Fraqueza detectada. Melhore.'}`,
    showToast: true
  }),
  daily_goal_completed: (data) => ({
    message: `[META DIÁRIA ATINGIDA] ${data?.goal || 'Meta'} concluída. +${data?.xp || 75} XP bônus. O Sistema aprova sua disciplina.`,
    showToast: true
  }),
  study_session_completed: (data) => ({
    message: `[ESTUDO CONCLUÍDO] Sessão de ${data?.duration || '?'} minutos. +${data?.xp || 50} XP Inteligência. Conhecimento é poder.`,
    showToast: true
  })
};

export function useSystemAlerts() {
  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isSpeakingRef = useRef(false);

  const speak = useCallback(async (text: string) => {
    if (isSpeakingRef.current) {
      console.log('[ALERT] Already speaking, skipping...');
      return;
    }

    try {
      isSpeakingRef.current = true;
      console.log('[ALERT] Calling TTS for:', text.substring(0, 50) + '...');
      
      const response = await fetch(`${SUPABASE_URL}/functions/v1/system-tts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        },
        body: JSON.stringify({ text })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[ALERT] TTS failed:', response.status, errorText);
        isSpeakingRef.current = false;
        return;
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      if (audioRef.current) {
        audioRef.current.pause();
        URL.revokeObjectURL(audioRef.current.src);
      }

      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        isSpeakingRef.current = false;
      };

      audio.onerror = () => {
        URL.revokeObjectURL(audioUrl);
        isSpeakingRef.current = false;
      };

      await audio.play();
      console.log('[ALERT] Audio playing...');
    } catch (error) {
      console.error('[ALERT] Error speaking:', error);
      isSpeakingRef.current = false;
    }
  }, []);

  const triggerAlert = useCallback(async (type: AlertType, data?: any) => {
    const config = alertMessages[type](data);
    console.log('[ALERT] Triggering:', type, config.message);
    
    if (config.showToast) {
      toast({
        title: '[SISTEMA]',
        description: config.message
      });
    }

    // Always speak the alert
    await speak(config.message);
  }, [toast, speak]);

  const welcomeBack = useCallback((name?: string) => {
    triggerAlert('welcome_back', { name });
  }, [triggerAlert]);

  const welcomeNew = useCallback((name?: string) => {
    triggerAlert('first_registration', { name });
  }, [triggerAlert]);

  const questCompleted = useCallback((name?: string, xp = 100) => {
    triggerAlert('quest_completed', { name, xp });
  }, [triggerAlert]);

  const levelUp = useCallback((name?: string, level?: number) => {
    triggerAlert('level_up', { name, level });
  }, [triggerAlert]);

  const taskCompleted = useCallback((task: string, xp = 50, gold = 10) => {
    triggerAlert('task_completed', { task, xp, gold });
  }, [triggerAlert]);

  const battleVictory = useCallback((type: 'minion' | 'boss', xp: number, gold: number) => {
    triggerAlert('battle_victory', { type, xp, gold });
  }, [triggerAlert]);

  const battleDefeat = useCallback((message?: string) => {
    triggerAlert('battle_defeat', { message });
  }, [triggerAlert]);

  const dailyGoalCompleted = useCallback((goal: string, xp = 75) => {
    triggerAlert('daily_goal_completed', { goal, xp });
  }, [triggerAlert]);

  const studySessionCompleted = useCallback((duration: number, xp = 50) => {
    triggerAlert('study_session_completed', { duration, xp });
  }, [triggerAlert]);

  return {
    triggerAlert,
    welcomeBack,
    welcomeNew,
    questCompleted,
    levelUp,
    taskCompleted,
    battleVictory,
    battleDefeat,
    dailyGoalCompleted,
    studySessionCompleted,
    speak
  };
}