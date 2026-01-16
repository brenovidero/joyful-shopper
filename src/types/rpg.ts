export type PlayerRank = 'adormecido' | 'desperto' | 'peregrino' | 'soberano' | 'arauto' | 'singularidade';
export type BookStatus = 'active' | 'paused' | 'completed' | 'dropped';
export type BattleType = 'minion' | 'boss';
export type BattleResult = 'victory' | 'defeat' | 'abandoned';

export interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  cover_url?: string | null;
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

// ============= SISTEMA DE PROGRESSÃO =============

// Constantes para nível de personagem (mais fácil)
export const CHARACTER_BASE_XP = 100;
export const CHARACTER_XP_MULTIPLIER = 1.12; // 12% de aumento por nível

// Constantes para níveis de skill (mais difícil)
export const SKILL_BASE_XP = 150;
export const SKILL_XP_MULTIPLIER = 1.18; // 18% de aumento por nível (mais difícil)

/**
 * Calcula o XP necessário para subir do nível atual para o próximo (Personagem)
 * Fórmula: BASE_XP * MULTIPLIER^(level-1)
 */
export function calculateCharacterXPForLevel(level: number): number {
  return Math.floor(CHARACTER_BASE_XP * Math.pow(CHARACTER_XP_MULTIPLIER, level - 1));
}

/**
 * Calcula o XP total acumulado até um nível (Personagem)
 */
export function getTotalXPForCharacterLevel(level: number): number {
  let total = 0;
  for (let i = 1; i < level; i++) {
    total += calculateCharacterXPForLevel(i);
  }
  return total;
}

/**
 * Calcula o XP necessário para subir do nível atual para o próximo (Skill)
 * Skills são mais difíceis de subir que o nível geral
 */
export function calculateSkillXPForLevel(level: number): number {
  return Math.floor(SKILL_BASE_XP * Math.pow(SKILL_XP_MULTIPLIER, level - 1));
}

/**
 * Calcula o XP total acumulado até um nível (Skill)
 */
export function getTotalXPForSkillLevel(level: number): number {
  let total = 0;
  for (let i = 1; i < level; i++) {
    total += calculateSkillXPForLevel(i);
  }
  return total;
}

/**
 * Dado um XP total de skill, calcula o nível atual e o progresso para o próximo
 */
export function getSkillLevelFromXP(totalXP: number): {
  level: number;
  currentLevelXP: number;
  xpForNextLevel: number;
  progress: number;
} {
  let level = 1;
  let accumulatedXP = 0;
  
  while (true) {
    const xpNeeded = calculateSkillXPForLevel(level);
    if (accumulatedXP + xpNeeded > totalXP) {
      // Ainda neste nível
      const currentLevelXP = totalXP - accumulatedXP;
      const progress = (currentLevelXP / xpNeeded) * 100;
      return {
        level,
        currentLevelXP,
        xpForNextLevel: xpNeeded,
        progress: Math.min(progress, 100),
      };
    }
    accumulatedXP += xpNeeded;
    level++;
    
    // Limite de segurança
    if (level > 999) break;
  }
  
  return { level: 999, currentLevelXP: 0, xpForNextLevel: 1, progress: 100 };
}

/**
 * Dado o XP total de todas as skills, calcula o nível do personagem e progresso
 * O nível do personagem é baseado na média ponderada dos níveis das skills
 */
export function getCharacterLevelFromXP(totalXP: number): {
  level: number;
  currentLevelXP: number;
  xpForNextLevel: number;
  progress: number;
} {
  let level = 1;
  let accumulatedXP = 0;
  
  while (true) {
    const xpNeeded = calculateCharacterXPForLevel(level);
    if (accumulatedXP + xpNeeded > totalXP) {
      const currentLevelXP = totalXP - accumulatedXP;
      const progress = (currentLevelXP / xpNeeded) * 100;
      return {
        level,
        currentLevelXP,
        xpForNextLevel: xpNeeded,
        progress: Math.min(progress, 100),
      };
    }
    accumulatedXP += xpNeeded;
    level++;
    
    if (level > 999) break;
  }
  
  return { level: 999, currentLevelXP: 0, xpForNextLevel: 1, progress: 100 };
}

/**
 * Retorna o XP total de todas as skills
 */
export function getTotalXP(profile: Profile): number {
  return profile.xp_intelligence + profile.xp_vitality + profile.xp_discipline;
}

/**
 * Calcula o nível do personagem baseado no XP total
 */
export function calculateCharacterLevel(profile: Profile): number {
  const totalXP = getTotalXP(profile);
  return getCharacterLevelFromXP(totalXP).level;
}

// Mantido para compatibilidade
export const XP_MULTIPLIER = CHARACTER_XP_MULTIPLIER;
export const BASE_XP_PER_LEVEL = CHARACTER_BASE_XP;

export function calculateXPForLevel(level: number): number {
  return calculateCharacterXPForLevel(level);
}

export function getRankFromLevel(level: number): PlayerRank {
  if (level >= 100) return 'singularidade';
  if (level >= 71) return 'arauto';
  if (level >= 46) return 'soberano';
  if (level >= 26) return 'peregrino';
  if (level >= 11) return 'desperto';
  return 'adormecido';
}
