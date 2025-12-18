export type PlayerRank = 'adormecido' | 'desperto' | 'peregrino' | 'soberano' | 'arauto' | 'singularidade';
export type BookStatus = 'active' | 'paused' | 'completed' | 'dropped';
export type BattleType = 'minion' | 'boss';
export type BattleResult = 'victory' | 'defeat' | 'abandoned';

export interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  level: number;
  rank: PlayerRank;
  xp_intelligence: number;
  xp_vitality: number;
  xp_discipline: number;
  gold: number;
  total_pages_read: number;
  total_battles_won: number;
  total_water_ml: number;
  streak_days: number;
  last_active_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface Book {
  id: string;
  user_id: string;
  title: string;
  author: string | null;
  total_pages: number;
  pages_read: number;
  status: BookStatus;
  category: string | null;
  image_url: string | null;
  target_date: string | null;
  xp_earned: number;
  created_at: string;
  updated_at: string;
}

export interface BattleSession {
  id: string;
  user_id: string;
  battle_type: BattleType;
  duration_minutes: number;
  result: BattleResult;
  interruptions: number;
  xp_earned: number;
  gold_earned: number;
  grimoire_text: string | null;
  grimoire_audio_url: string | null;
  started_at: string;
  ended_at: string | null;
}

export interface VitalityLog {
  id: string;
  user_id: string;
  water_ml: number;
  workout_completed: boolean;
  workout_type: string | null;
  xp_earned: number;
  logged_at: string;
}

export const RANK_CONFIG: Record<PlayerRank, { label: string; minLevel: number; maxLevel: number; color: string; aura: string }> = {
  adormecido: { label: 'Adormecido', minLevel: 1, maxLevel: 10, color: 'text-slate-400', aura: 'from-slate-500/20' },
  desperto: { label: 'Desperto', minLevel: 11, maxLevel: 25, color: 'text-blue-400', aura: 'from-blue-500/20' },
  peregrino: { label: 'Peregrino', minLevel: 26, maxLevel: 45, color: 'text-emerald-400', aura: 'from-emerald-500/20' },
  soberano: { label: 'Soberano', minLevel: 46, maxLevel: 70, color: 'text-amber-400', aura: 'from-amber-500/20' },
  arauto: { label: 'Arauto', minLevel: 71, maxLevel: 99, color: 'text-purple-400', aura: 'from-purple-500/20' },
  singularidade: { label: 'Singularidade', minLevel: 100, maxLevel: 999, color: 'text-rose-400', aura: 'from-rose-500/20' },
};

export const XP_MULTIPLIER = 1.15; // 15% increase per level
export const BASE_XP_PER_LEVEL = 100;

export function calculateXPForLevel(level: number): number {
  return Math.floor(BASE_XP_PER_LEVEL * Math.pow(XP_MULTIPLIER, level - 1));
}

export function getTotalXP(profile: Profile): number {
  return profile.xp_intelligence + profile.xp_vitality + profile.xp_discipline;
}

export function getRankFromLevel(level: number): PlayerRank {
  if (level >= 100) return 'singularidade';
  if (level >= 71) return 'arauto';
  if (level >= 46) return 'soberano';
  if (level >= 26) return 'peregrino';
  if (level >= 11) return 'desperto';
  return 'adormecido';
}
