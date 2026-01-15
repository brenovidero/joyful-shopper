export type ExerciseCategory = 
  | 'chest' | 'back' | 'shoulders' | 'biceps' | 'triceps' | 'forearms'
  | 'quadriceps' | 'hamstrings' | 'glutes' | 'calves' | 'abs' | 'obliques'
  | 'lower_back' | 'traps' | 'lats';

export type CardioType = 
  | 'treadmill' | 'bike' | 'elliptical' | 'rowing' | 'stairs' 
  | 'free_run' | 'free_walk' | 'free_cycle';

export type WorkoutDay = 
  | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface StrengthExercise {
  id: string;
  name: string;
  category: ExerciseCategory;
  description: string | null;
  gif_url: string | null;
  video_url: string | null;
  muscle_primary: string;
  muscles_secondary: string[] | null;
  equipment: string[] | null;
  difficulty: number;
  is_custom: boolean;
  created_by: string | null;
  created_at: string;
}

export interface UserCustomExercise {
  id: string;
  user_id: string;
  name: string;
  category: ExerciseCategory;
  description: string | null;
  gif_url: string | null;
  muscle_primary: string;
  muscles_secondary: string[] | null;
  equipment: string[] | null;
  created_at: string;
}

export interface WorkoutPlan {
  id: string;
  user_id: string;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface WorkoutPlanDay {
  id: string;
  plan_id: string;
  day_of_week: WorkoutDay;
  name: string | null;
  target_muscles: ExerciseCategory[] | null;
  rest_seconds_between: number;
  created_at: string;
  exercises?: WorkoutPlanExercise[];
}

export interface WorkoutPlanExercise {
  id: string;
  plan_day_id: string;
  exercise_id: string | null;
  custom_exercise_id: string | null;
  order_index: number;
  sets: number;
  reps: number;
  weight_kg: number | null;
  rest_seconds: number;
  notes: string | null;
  created_at: string;
  exercise?: StrengthExercise;
  custom_exercise?: UserCustomExercise;
}

export interface StrengthSession {
  id: string;
  user_id: string;
  plan_day_id: string | null;
  started_at: string;
  ended_at: string | null;
  duration_minutes: number | null;
  exercises_completed: number;
  total_sets: number;
  total_reps: number;
  total_weight_kg: number;
  xp_earned: number;
  notes: string | null;
}

export interface CardioSession {
  id: string;
  user_id: string;
  cardio_type: CardioType;
  started_at: string;
  ended_at: string | null;
  duration_minutes: number | null;
  distance_meters: number | null;
  calories_burned: number | null;
  avg_speed_kmh: number | null;
  max_speed_kmh: number | null;
  avg_heart_rate: number | null;
  max_heart_rate: number | null;
  route_polyline: string | null;
  route_start_lat: number | null;
  route_start_lng: number | null;
  route_end_lat: number | null;
  route_end_lng: number | null;
  steps_count: number | null;
  xp_earned: number;
  notes: string | null;
}

export interface YogaPose {
  id: string;
  name: string;
  name_sanskrit: string | null;
  description: string | null;
  benefits: string[] | null;
  difficulty: number;
  duration_seconds: number;
  image_url: string | null;
  video_url: string | null;
  category: string | null;
  created_at: string;
}

export interface YogaSession {
  id: string;
  user_id: string;
  started_at: string;
  ended_at: string | null;
  duration_minutes: number | null;
  poses_completed: number;
  session_type: string | null;
  xp_earned: number;
  notes: string | null;
}

export interface MartialArtsStyle {
  id: string;
  name: string;
  description: string | null;
  origin_country: string | null;
  image_url: string | null;
  techniques: string[] | null;
  equipment: string[] | null;
  created_at: string;
}

export interface MartialArtsSession {
  id: string;
  user_id: string;
  style_id: string | null;
  started_at: string;
  ended_at: string | null;
  duration_minutes: number | null;
  rounds_completed: number;
  techniques_practiced: string[] | null;
  intensity: number;
  sparring: boolean;
  xp_earned: number;
  notes: string | null;
  style?: MartialArtsStyle;
}

export interface SwimmingStyle {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  muscles_worked: string[] | null;
  difficulty: number;
  created_at: string;
}

export interface SwimmingSession {
  id: string;
  user_id: string;
  style_id: string | null;
  started_at: string;
  ended_at: string | null;
  duration_minutes: number | null;
  laps_completed: number;
  pool_length_meters: number;
  total_distance_meters: number | null;
  calories_burned: number | null;
  xp_earned: number;
  notes: string | null;
  style?: SwimmingStyle;
}

export interface OtherExercise {
  id: string;
  name: string;
  category: string;
  description: string | null;
  image_url: string | null;
  video_url: string | null;
  equipment: string[] | null;
  muscles_worked: string[] | null;
  difficulty: number;
  created_at: string;
}

export interface OtherExerciseSession {
  id: string;
  user_id: string;
  exercise_id: string | null;
  custom_name: string | null;
  started_at: string;
  ended_at: string | null;
  duration_minutes: number | null;
  sets_completed: number | null;
  reps_completed: number | null;
  xp_earned: number;
  notes: string | null;
  exercise?: OtherExercise;
}

export const EXERCISE_CATEGORY_LABELS: Record<ExerciseCategory, string> = {
  chest: 'Peito',
  back: 'Costas',
  shoulders: 'Ombros',
  biceps: 'Bíceps',
  triceps: 'Tríceps',
  forearms: 'Antebraços',
  quadriceps: 'Quadríceps',
  hamstrings: 'Posterior de Coxa',
  glutes: 'Glúteos',
  calves: 'Panturrilha',
  abs: 'Abdômen',
  obliques: 'Oblíquos',
  lower_back: 'Lombar',
  traps: 'Trapézio',
  lats: 'Latíssimo',
};

export const WORKOUT_DAY_LABELS: Record<WorkoutDay, string> = {
  monday: 'Segunda',
  tuesday: 'Terça',
  wednesday: 'Quarta',
  thursday: 'Quinta',
  friday: 'Sexta',
  saturday: 'Sábado',
  sunday: 'Domingo',
};

export const CARDIO_TYPE_LABELS: Record<CardioType, { label: string; icon: string }> = {
  treadmill: { label: 'Esteira', icon: '🏃' },
  bike: { label: 'Bicicleta', icon: '🚴' },
  elliptical: { label: 'Elíptico', icon: '🏋️' },
  rowing: { label: 'Remo', icon: '🚣' },
  stairs: { label: 'Escada', icon: '🪜' },
  free_run: { label: 'Corrida Livre', icon: '🏃‍♂️' },
  free_walk: { label: 'Caminhada Livre', icon: '🚶' },
  free_cycle: { label: 'Ciclismo Livre', icon: '🚵' },
};
