-- Enum para tipos de exercício
CREATE TYPE public.exercise_category AS ENUM (
  'chest', 'back', 'shoulders', 'biceps', 'triceps', 'forearms',
  'quadriceps', 'hamstrings', 'glutes', 'calves', 'abs', 'obliques',
  'lower_back', 'traps', 'lats'
);

CREATE TYPE public.cardio_type AS ENUM ('treadmill', 'bike', 'elliptical', 'rowing', 'stairs', 'free_run', 'free_walk', 'free_cycle');

CREATE TYPE public.workout_day AS ENUM ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday');

-- Tabela de exercícios de musculação (catálogo global)
CREATE TABLE public.strength_exercises (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category exercise_category NOT NULL,
  description TEXT,
  gif_url TEXT,
  video_url TEXT,
  muscle_primary TEXT NOT NULL,
  muscles_secondary TEXT[],
  equipment TEXT[],
  difficulty INTEGER DEFAULT 1 CHECK (difficulty >= 1 AND difficulty <= 5),
  is_custom BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Exercícios customizados do usuário
CREATE TABLE public.user_custom_exercises (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users,
  name TEXT NOT NULL,
  category exercise_category NOT NULL,
  description TEXT,
  gif_url TEXT,
  muscle_primary TEXT NOT NULL,
  muscles_secondary TEXT[],
  equipment TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Plano de treino semanal do usuário
CREATE TABLE public.workout_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users,
  name TEXT NOT NULL DEFAULT 'Meu Treino',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Treinos por dia da semana
CREATE TABLE public.workout_plan_days (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id UUID NOT NULL REFERENCES public.workout_plans ON DELETE CASCADE,
  day_of_week workout_day NOT NULL,
  name TEXT,
  target_muscles exercise_category[],
  rest_seconds_between INTEGER DEFAULT 60,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(plan_id, day_of_week)
);

-- Exercícios dentro de um dia de treino
CREATE TABLE public.workout_plan_exercises (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_day_id UUID NOT NULL REFERENCES public.workout_plan_days ON DELETE CASCADE,
  exercise_id UUID REFERENCES public.strength_exercises,
  custom_exercise_id UUID REFERENCES public.user_custom_exercises,
  order_index INTEGER NOT NULL DEFAULT 0,
  sets INTEGER NOT NULL DEFAULT 3,
  reps INTEGER NOT NULL DEFAULT 12,
  weight_kg DECIMAL,
  rest_seconds INTEGER DEFAULT 60,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CHECK (exercise_id IS NOT NULL OR custom_exercise_id IS NOT NULL)
);

-- Sessões de treino de musculação completadas
CREATE TABLE public.strength_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users,
  plan_day_id UUID REFERENCES public.workout_plan_days,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER,
  exercises_completed INTEGER DEFAULT 0,
  total_sets INTEGER DEFAULT 0,
  total_reps INTEGER DEFAULT 0,
  total_weight_kg DECIMAL DEFAULT 0,
  xp_earned INTEGER DEFAULT 0,
  notes TEXT
);

-- Log de cada exercício feito na sessão
CREATE TABLE public.strength_session_exercises (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.strength_sessions ON DELETE CASCADE,
  exercise_id UUID REFERENCES public.strength_exercises,
  custom_exercise_id UUID REFERENCES public.user_custom_exercises,
  set_number INTEGER NOT NULL,
  reps_done INTEGER NOT NULL,
  weight_kg DECIMAL,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT
);

-- Sessões de cardio
CREATE TABLE public.cardio_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users,
  cardio_type cardio_type NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER,
  distance_meters DECIMAL,
  calories_burned INTEGER,
  avg_speed_kmh DECIMAL,
  max_speed_kmh DECIMAL,
  avg_heart_rate INTEGER,
  max_heart_rate INTEGER,
  route_polyline TEXT,
  route_start_lat DECIMAL,
  route_start_lng DECIMAL,
  route_end_lat DECIMAL,
  route_end_lng DECIMAL,
  steps_count INTEGER,
  xp_earned INTEGER DEFAULT 0,
  notes TEXT
);

-- Catálogo de exercícios de yoga
CREATE TABLE public.yoga_poses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  name_sanskrit TEXT,
  description TEXT,
  benefits TEXT[],
  difficulty INTEGER DEFAULT 1 CHECK (difficulty >= 1 AND difficulty <= 5),
  duration_seconds INTEGER DEFAULT 30,
  image_url TEXT,
  video_url TEXT,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Sessões de yoga
CREATE TABLE public.yoga_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER,
  poses_completed INTEGER DEFAULT 0,
  session_type TEXT,
  xp_earned INTEGER DEFAULT 0,
  notes TEXT
);

-- Poses feitas em cada sessão de yoga
CREATE TABLE public.yoga_session_poses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.yoga_sessions ON DELETE CASCADE,
  pose_id UUID NOT NULL REFERENCES public.yoga_poses,
  duration_seconds INTEGER,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tipos de luta/artes marciais
CREATE TABLE public.martial_arts_styles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  origin_country TEXT,
  image_url TEXT,
  techniques TEXT[],
  equipment TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Sessões de luta
CREATE TABLE public.martial_arts_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users,
  style_id UUID REFERENCES public.martial_arts_styles,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER,
  rounds_completed INTEGER DEFAULT 0,
  techniques_practiced TEXT[],
  intensity INTEGER DEFAULT 3 CHECK (intensity >= 1 AND intensity <= 5),
  sparring BOOLEAN DEFAULT false,
  xp_earned INTEGER DEFAULT 0,
  notes TEXT
);

-- Estilos de natação
CREATE TABLE public.swimming_styles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  muscles_worked TEXT[],
  difficulty INTEGER DEFAULT 1 CHECK (difficulty >= 1 AND difficulty <= 5),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Sessões de natação
CREATE TABLE public.swimming_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users,
  style_id UUID REFERENCES public.swimming_styles,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER,
  laps_completed INTEGER DEFAULT 0,
  pool_length_meters INTEGER DEFAULT 25,
  total_distance_meters INTEGER,
  calories_burned INTEGER,
  xp_earned INTEGER DEFAULT 0,
  notes TEXT
);

-- Catálogo de outros exercícios
CREATE TABLE public.other_exercises (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  video_url TEXT,
  equipment TEXT[],
  muscles_worked TEXT[],
  difficulty INTEGER DEFAULT 1 CHECK (difficulty >= 1 AND difficulty <= 5),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Sessões de outros exercícios
CREATE TABLE public.other_exercise_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users,
  exercise_id UUID REFERENCES public.other_exercises,
  custom_name TEXT,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER,
  sets_completed INTEGER,
  reps_completed INTEGER,
  xp_earned INTEGER DEFAULT 0,
  notes TEXT
);

-- Enable RLS on all tables
ALTER TABLE public.strength_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_custom_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_plan_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_plan_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.strength_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.strength_session_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cardio_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.yoga_poses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.yoga_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.yoga_session_poses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.martial_arts_styles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.martial_arts_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.swimming_styles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.swimming_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.other_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.other_exercise_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies (corrigida ordem dos argumentos has_role)

-- strength_exercises: todos podem ver, apenas admins podem criar
CREATE POLICY "Anyone can view strength exercises" ON public.strength_exercises FOR SELECT USING (true);
CREATE POLICY "Only admins can insert strength exercises" ON public.strength_exercises FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- user_custom_exercises: usuário pode CRUD próprios
CREATE POLICY "Users can view own custom exercises" ON public.user_custom_exercises FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own custom exercises" ON public.user_custom_exercises FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own custom exercises" ON public.user_custom_exercises FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own custom exercises" ON public.user_custom_exercises FOR DELETE USING (auth.uid() = user_id);

-- workout_plans: usuário pode CRUD próprios
CREATE POLICY "Users can view own workout plans" ON public.workout_plans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own workout plans" ON public.workout_plans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own workout plans" ON public.workout_plans FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own workout plans" ON public.workout_plans FOR DELETE USING (auth.uid() = user_id);

-- workout_plan_days: acesso via plano do usuário
CREATE POLICY "Users can view own plan days" ON public.workout_plan_days FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.workout_plans WHERE id = workout_plan_days.plan_id AND user_id = auth.uid()));
CREATE POLICY "Users can create own plan days" ON public.workout_plan_days FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.workout_plans WHERE id = workout_plan_days.plan_id AND user_id = auth.uid()));
CREATE POLICY "Users can update own plan days" ON public.workout_plan_days FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM public.workout_plans WHERE id = workout_plan_days.plan_id AND user_id = auth.uid()));
CREATE POLICY "Users can delete own plan days" ON public.workout_plan_days FOR DELETE 
  USING (EXISTS (SELECT 1 FROM public.workout_plans WHERE id = workout_plan_days.plan_id AND user_id = auth.uid()));

-- workout_plan_exercises: acesso via dia do plano
CREATE POLICY "Users can view own plan exercises" ON public.workout_plan_exercises FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.workout_plan_days wpd 
    JOIN public.workout_plans wp ON wpd.plan_id = wp.id 
    WHERE wpd.id = workout_plan_exercises.plan_day_id AND wp.user_id = auth.uid()
  ));
CREATE POLICY "Users can create own plan exercises" ON public.workout_plan_exercises FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.workout_plan_days wpd 
    JOIN public.workout_plans wp ON wpd.plan_id = wp.id 
    WHERE wpd.id = workout_plan_exercises.plan_day_id AND wp.user_id = auth.uid()
  ));
CREATE POLICY "Users can update own plan exercises" ON public.workout_plan_exercises FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM public.workout_plan_days wpd 
    JOIN public.workout_plans wp ON wpd.plan_id = wp.id 
    WHERE wpd.id = workout_plan_exercises.plan_day_id AND wp.user_id = auth.uid()
  ));
CREATE POLICY "Users can delete own plan exercises" ON public.workout_plan_exercises FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM public.workout_plan_days wpd 
    JOIN public.workout_plans wp ON wpd.plan_id = wp.id 
    WHERE wpd.id = workout_plan_exercises.plan_day_id AND wp.user_id = auth.uid()
  ));

-- Sessions: usuário pode CRUD próprios
CREATE POLICY "Users can view own strength sessions" ON public.strength_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own strength sessions" ON public.strength_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own strength sessions" ON public.strength_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own strength sessions" ON public.strength_sessions FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own session exercises" ON public.strength_session_exercises FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.strength_sessions WHERE id = strength_session_exercises.session_id AND user_id = auth.uid()));
CREATE POLICY "Users can create own session exercises" ON public.strength_session_exercises FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.strength_sessions WHERE id = strength_session_exercises.session_id AND user_id = auth.uid()));

CREATE POLICY "Users can view own cardio sessions" ON public.cardio_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own cardio sessions" ON public.cardio_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own cardio sessions" ON public.cardio_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own cardio sessions" ON public.cardio_sessions FOR DELETE USING (auth.uid() = user_id);

-- Yoga poses: todos podem ver
CREATE POLICY "Anyone can view yoga poses" ON public.yoga_poses FOR SELECT USING (true);
CREATE POLICY "Only admins can insert yoga poses" ON public.yoga_poses FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view own yoga sessions" ON public.yoga_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own yoga sessions" ON public.yoga_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own yoga sessions" ON public.yoga_sessions FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own yoga session poses" ON public.yoga_session_poses FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.yoga_sessions WHERE id = yoga_session_poses.session_id AND user_id = auth.uid()));
CREATE POLICY "Users can create own yoga session poses" ON public.yoga_session_poses FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.yoga_sessions WHERE id = yoga_session_poses.session_id AND user_id = auth.uid()));

-- Martial arts styles: todos podem ver
CREATE POLICY "Anyone can view martial arts styles" ON public.martial_arts_styles FOR SELECT USING (true);
CREATE POLICY "Only admins can insert martial arts styles" ON public.martial_arts_styles FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view own martial arts sessions" ON public.martial_arts_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own martial arts sessions" ON public.martial_arts_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own martial arts sessions" ON public.martial_arts_sessions FOR UPDATE USING (auth.uid() = user_id);

-- Swimming styles: todos podem ver
CREATE POLICY "Anyone can view swimming styles" ON public.swimming_styles FOR SELECT USING (true);
CREATE POLICY "Only admins can insert swimming styles" ON public.swimming_styles FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view own swimming sessions" ON public.swimming_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own swimming sessions" ON public.swimming_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own swimming sessions" ON public.swimming_sessions FOR UPDATE USING (auth.uid() = user_id);

-- Other exercises: todos podem ver
CREATE POLICY "Anyone can view other exercises" ON public.other_exercises FOR SELECT USING (true);
CREATE POLICY "Only admins can insert other exercises" ON public.other_exercises FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view own other exercise sessions" ON public.other_exercise_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own other exercise sessions" ON public.other_exercise_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own other exercise sessions" ON public.other_exercise_sessions FOR UPDATE USING (auth.uid() = user_id);

-- Inserir exercícios de musculação padrão
INSERT INTO public.strength_exercises (name, category, muscle_primary, muscles_secondary, equipment, difficulty, gif_url, description) VALUES
-- PEITO (chest)
('Supino Reto com Barra', 'chest', 'Peitoral Maior', ARRAY['Tríceps', 'Deltóide Anterior'], ARRAY['Barra', 'Banco'], 2, 'https://media.giphy.com/media/3oEdva9BUHPIs2SkGk/giphy.gif', 'Deite no banco, desça a barra até o peito e empurre para cima'),
('Supino Inclinado com Halteres', 'chest', 'Peitoral Superior', ARRAY['Tríceps', 'Deltóide Anterior'], ARRAY['Halteres', 'Banco Inclinado'], 2, 'https://media.giphy.com/media/l0HlvtIPzPdt2usKs/giphy.gif', 'Incline o banco a 30-45 graus, desça os halteres e empurre'),
('Crucifixo com Halteres', 'chest', 'Peitoral Maior', ARRAY['Deltóide Anterior'], ARRAY['Halteres', 'Banco'], 2, 'https://media.giphy.com/media/3o7TKDEhaLxYCqb3a0/giphy.gif', 'Abra os braços em arco até sentir o alongamento no peito'),
('Flexão de Braço', 'chest', 'Peitoral Maior', ARRAY['Tríceps', 'Core'], ARRAY['Peso Corporal'], 1, 'https://media.giphy.com/media/UoLt6Tm8wlSnWGfSFs/giphy.gif', 'Mantenha o corpo reto, desça o peito até o chão'),
('Crossover na Polia', 'chest', 'Peitoral Maior', ARRAY['Deltóide Anterior'], ARRAY['Polia'], 2, 'https://media.giphy.com/media/3ohzdMk3uz9WSpdTvW/giphy.gif', 'Puxe os cabos para baixo e para frente, cruzando na altura do peito'),
('Supino Declinado', 'chest', 'Peitoral Inferior', ARRAY['Tríceps'], ARRAY['Barra', 'Banco Declinado'], 3, 'https://media.giphy.com/media/l378plFwSe6x8JChy/giphy.gif', 'Decline o banco, desça a barra até o peito inferior'),
-- COSTAS (back)
('Puxada Frontal', 'back', 'Latíssimo do Dorso', ARRAY['Bíceps', 'Romboides'], ARRAY['Polia Alta'], 2, 'https://media.giphy.com/media/SsKdClETfocCI6kegv/giphy.gif', 'Puxe a barra até a altura do queixo, contraindo as costas'),
('Remada Curvada', 'back', 'Latíssimo do Dorso', ARRAY['Bíceps', 'Romboides', 'Trapézio'], ARRAY['Barra'], 3, 'https://media.giphy.com/media/3oEjI5VtIhHvK37WYo/giphy.gif', 'Incline o tronco, puxe a barra até o abdômen'),
('Remada Unilateral com Halter', 'back', 'Latíssimo do Dorso', ARRAY['Bíceps', 'Romboides'], ARRAY['Halter', 'Banco'], 2, 'https://media.giphy.com/media/l0HlPtbGpcnqa0fja/giphy.gif', 'Apoie um joelho no banco, puxe o halter até a cintura'),
('Pulldown na Polia', 'back', 'Latíssimo do Dorso', ARRAY['Bíceps'], ARRAY['Polia Alta'], 1, 'https://media.giphy.com/media/SsKdClETfocCI6kegv/giphy.gif', 'Puxe a barra para baixo até o peito'),
('Barra Fixa', 'back', 'Latíssimo do Dorso', ARRAY['Bíceps', 'Core'], ARRAY['Barra Fixa'], 4, 'https://media.giphy.com/media/od5TcLZ3pXOta/giphy.gif', 'Puxe o corpo até o queixo passar a barra'),
-- OMBROS (shoulders)
('Desenvolvimento com Halteres', 'shoulders', 'Deltóide Anterior', ARRAY['Tríceps', 'Trapézio'], ARRAY['Halteres'], 2, 'https://media.giphy.com/media/26u4kr1okRrXoKVoI/giphy.gif', 'Empurre os halteres acima da cabeça'),
('Elevação Lateral', 'shoulders', 'Deltóide Lateral', ARRAY['Trapézio'], ARRAY['Halteres'], 2, 'https://media.giphy.com/media/3oEjI5VtIhHvK37WYo/giphy.gif', 'Eleve os halteres lateralmente até a altura dos ombros'),
('Elevação Frontal', 'shoulders', 'Deltóide Anterior', ARRAY[]::TEXT[], ARRAY['Halteres'], 1, 'https://media.giphy.com/media/26u4kr1okRrXoKVoI/giphy.gif', 'Eleve os halteres à frente até a altura dos ombros'),
('Desenvolvimento Militar', 'shoulders', 'Deltóide Anterior', ARRAY['Tríceps', 'Core'], ARRAY['Barra'], 3, 'https://media.giphy.com/media/26u4kr1okRrXoKVoI/giphy.gif', 'Empurre a barra acima da cabeça em pé'),
('Face Pull', 'shoulders', 'Deltóide Posterior', ARRAY['Trapézio', 'Romboides'], ARRAY['Polia'], 2, 'https://media.giphy.com/media/l0HlPtbGpcnqa0fja/giphy.gif', 'Puxe a corda em direção ao rosto'),
-- BÍCEPS
('Rosca Direta com Barra', 'biceps', 'Bíceps Braquial', ARRAY['Braquial'], ARRAY['Barra'], 2, 'https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif', 'Flexione os cotovelos, mantendo-os junto ao corpo'),
('Rosca Alternada com Halteres', 'biceps', 'Bíceps Braquial', ARRAY['Braquial'], ARRAY['Halteres'], 1, 'https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif', 'Alterne os braços, girando o pulso durante o movimento'),
('Rosca Martelo', 'biceps', 'Braquiorradial', ARRAY['Bíceps Braquial'], ARRAY['Halteres'], 1, 'https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif', 'Mantenha os halteres em posição neutra'),
('Rosca Concentrada', 'biceps', 'Bíceps Braquial', ARRAY[]::TEXT[], ARRAY['Halter'], 2, 'https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif', 'Apoie o cotovelo na parte interna da coxa'),
('Rosca Scott', 'biceps', 'Bíceps Braquial', ARRAY['Braquial'], ARRAY['Barra W', 'Banco Scott'], 2, 'https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif', 'Use o banco Scott para isolar o bíceps'),
-- TRÍCEPS
('Tríceps Pulley', 'triceps', 'Tríceps Braquial', ARRAY[]::TEXT[], ARRAY['Polia'], 1, 'https://media.giphy.com/media/l3vR1JaLJT9hwPTZS/giphy.gif', 'Empurre a barra para baixo, estendendo os cotovelos'),
('Tríceps Testa', 'triceps', 'Tríceps Braquial', ARRAY[]::TEXT[], ARRAY['Barra W', 'Banco'], 2, 'https://media.giphy.com/media/l3vR1JaLJT9hwPTZS/giphy.gif', 'Deite no banco e estenda os braços acima da testa'),
('Tríceps Francês', 'triceps', 'Tríceps Braquial', ARRAY[]::TEXT[], ARRAY['Halter'], 2, 'https://media.giphy.com/media/l3vR1JaLJT9hwPTZS/giphy.gif', 'Segure o halter atrás da cabeça e estenda'),
('Mergulho no Banco', 'triceps', 'Tríceps Braquial', ARRAY['Deltóide Anterior', 'Peitoral'], ARRAY['Banco'], 2, 'https://media.giphy.com/media/l3vR1JaLJT9hwPTZS/giphy.gif', 'Apoie as mãos no banco e desça o corpo'),
('Tríceps Corda', 'triceps', 'Tríceps Braquial', ARRAY[]::TEXT[], ARRAY['Polia', 'Corda'], 1, 'https://media.giphy.com/media/l3vR1JaLJT9hwPTZS/giphy.gif', 'Use a corda e separe as pontas no final do movimento'),
-- QUADRÍCEPS
('Agachamento Livre', 'quadriceps', 'Quadríceps', ARRAY['Glúteos', 'Isquiotibiais', 'Core'], ARRAY['Barra'], 3, 'https://media.giphy.com/media/1qfKN8Dt0CRdCRxz9q/giphy.gif', 'Desça até as coxas ficarem paralelas ao chão'),
('Leg Press', 'quadriceps', 'Quadríceps', ARRAY['Glúteos', 'Isquiotibiais'], ARRAY['Leg Press'], 2, 'https://media.giphy.com/media/1qfKN8Dt0CRdCRxz9q/giphy.gif', 'Empurre a plataforma sem travar os joelhos'),
('Agachamento Hack', 'quadriceps', 'Quadríceps', ARRAY['Glúteos'], ARRAY['Máquina Hack'], 2, 'https://media.giphy.com/media/1qfKN8Dt0CRdCRxz9q/giphy.gif', 'Use a máquina hack para isolar os quadríceps'),
('Cadeira Extensora', 'quadriceps', 'Quadríceps', ARRAY[]::TEXT[], ARRAY['Cadeira Extensora'], 1, 'https://media.giphy.com/media/1qfKN8Dt0CRdCRxz9q/giphy.gif', 'Estenda os joelhos completamente'),
('Avanço com Halteres', 'quadriceps', 'Quadríceps', ARRAY['Glúteos', 'Isquiotibiais'], ARRAY['Halteres'], 2, 'https://media.giphy.com/media/1qfKN8Dt0CRdCRxz9q/giphy.gif', 'Dê um passo à frente e desça o joelho de trás'),
-- ISQUIOTIBIAIS (hamstrings)
('Mesa Flexora', 'hamstrings', 'Isquiotibiais', ARRAY[]::TEXT[], ARRAY['Mesa Flexora'], 1, 'https://media.giphy.com/media/l378plFwSe6x8JChy/giphy.gif', 'Flexione os joelhos, puxando os calcanhares'),
('Stiff', 'hamstrings', 'Isquiotibiais', ARRAY['Glúteos', 'Lombar'], ARRAY['Barra', 'Halteres'], 3, 'https://media.giphy.com/media/l378plFwSe6x8JChy/giphy.gif', 'Mantenha as pernas quase retas e incline o tronco'),
('Levantamento Terra', 'hamstrings', 'Isquiotibiais', ARRAY['Glúteos', 'Lombar', 'Trapézio'], ARRAY['Barra'], 4, 'https://media.giphy.com/media/l378plFwSe6x8JChy/giphy.gif', 'Levante a barra do chão mantendo as costas retas'),
('Good Morning', 'hamstrings', 'Isquiotibiais', ARRAY['Lombar', 'Glúteos'], ARRAY['Barra'], 3, 'https://media.giphy.com/media/l378plFwSe6x8JChy/giphy.gif', 'Incline o tronco para frente com a barra nos ombros'),
-- GLÚTEOS
('Hip Thrust', 'glutes', 'Glúteo Máximo', ARRAY['Isquiotibiais'], ARRAY['Barra', 'Banco'], 2, 'https://media.giphy.com/media/3oEjHV0z8S7WM4MwnK/giphy.gif', 'Apoie as costas no banco e empurre o quadril para cima'),
('Elevação Pélvica', 'glutes', 'Glúteo Máximo', ARRAY['Isquiotibiais'], ARRAY['Peso Corporal'], 1, 'https://media.giphy.com/media/3oEjHV0z8S7WM4MwnK/giphy.gif', 'Deite no chão e eleve o quadril'),
('Abdução de Quadril', 'glutes', 'Glúteo Médio', ARRAY['Glúteo Mínimo'], ARRAY['Máquina', 'Elástico'], 1, 'https://media.giphy.com/media/3oEjHV0z8S7WM4MwnK/giphy.gif', 'Abra as pernas contra a resistência'),
('Afundo Búlgaro', 'glutes', 'Glúteo Máximo', ARRAY['Quadríceps', 'Isquiotibiais'], ARRAY['Halteres', 'Banco'], 3, 'https://media.giphy.com/media/3oEjHV0z8S7WM4MwnK/giphy.gif', 'Apoie o pé de trás no banco e desça'),
-- PANTURRILHA (calves)
('Panturrilha em Pé', 'calves', 'Gastrocnêmio', ARRAY['Sóleo'], ARRAY['Máquina', 'Step'], 1, 'https://media.giphy.com/media/xT1Ra3IAQCP7Gu9gTS/giphy.gif', 'Fique na ponta dos pés e desça lentamente'),
('Panturrilha Sentado', 'calves', 'Sóleo', ARRAY['Gastrocnêmio'], ARRAY['Máquina Sentado'], 1, 'https://media.giphy.com/media/xT1Ra3IAQCP7Gu9gTS/giphy.gif', 'Sentado, eleve os calcanhares'),
('Panturrilha no Leg Press', 'calves', 'Gastrocnêmio', ARRAY['Sóleo'], ARRAY['Leg Press'], 1, 'https://media.giphy.com/media/xT1Ra3IAQCP7Gu9gTS/giphy.gif', 'Use apenas a ponta dos pés na plataforma'),
-- ABDÔMEN (abs)
('Abdominal Crunch', 'abs', 'Reto Abdominal', ARRAY[]::TEXT[], ARRAY['Peso Corporal'], 1, 'https://media.giphy.com/media/xT8qB5sar8diGfy2AM/giphy.gif', 'Eleve os ombros do chão contraindo o abdômen'),
('Prancha', 'abs', 'Core', ARRAY['Reto Abdominal', 'Oblíquos'], ARRAY['Peso Corporal'], 2, 'https://media.giphy.com/media/xT8qB5sar8diGfy2AM/giphy.gif', 'Mantenha o corpo reto apoiado nos antebraços'),
('Abdominal Infra', 'abs', 'Reto Abdominal Inferior', ARRAY[]::TEXT[], ARRAY['Peso Corporal'], 2, 'https://media.giphy.com/media/xT8qB5sar8diGfy2AM/giphy.gif', 'Eleve as pernas mantendo as costas no chão'),
('Abdominal na Máquina', 'abs', 'Reto Abdominal', ARRAY[]::TEXT[], ARRAY['Máquina'], 1, 'https://media.giphy.com/media/xT8qB5sar8diGfy2AM/giphy.gif', 'Use a resistência da máquina para intensificar'),
-- OBLÍQUOS
('Abdominal Oblíquo', 'obliques', 'Oblíquos', ARRAY['Reto Abdominal'], ARRAY['Peso Corporal'], 2, 'https://media.giphy.com/media/xT8qB5sar8diGfy2AM/giphy.gif', 'Torça o tronco levando o cotovelo ao joelho oposto'),
('Prancha Lateral', 'obliques', 'Oblíquos', ARRAY['Core'], ARRAY['Peso Corporal'], 3, 'https://media.giphy.com/media/xT8qB5sar8diGfy2AM/giphy.gif', 'Apoie-se de lado em um antebraço'),
('Russian Twist', 'obliques', 'Oblíquos', ARRAY['Reto Abdominal'], ARRAY['Peso Corporal', 'Medicine Ball'], 2, 'https://media.giphy.com/media/xT8qB5sar8diGfy2AM/giphy.gif', 'Gire o tronco de lado a lado'),
-- LOMBAR (lower_back)
('Hiperextensão', 'lower_back', 'Eretores da Espinha', ARRAY['Glúteos', 'Isquiotibiais'], ARRAY['Banco Romano'], 2, 'https://media.giphy.com/media/3oEjHV0z8S7WM4MwnK/giphy.gif', 'Incline o tronco para baixo e suba contraindo a lombar'),
('Superman', 'lower_back', 'Eretores da Espinha', ARRAY['Glúteos'], ARRAY['Peso Corporal'], 1, 'https://media.giphy.com/media/3oEjHV0z8S7WM4MwnK/giphy.gif', 'Deite de bruços e eleve braços e pernas'),
-- TRAPÉZIO (traps)
('Encolhimento com Halteres', 'traps', 'Trapézio Superior', ARRAY[]::TEXT[], ARRAY['Halteres'], 1, 'https://media.giphy.com/media/SsKdClETfocCI6kegv/giphy.gif', 'Eleve os ombros em direção às orelhas'),
('Encolhimento com Barra', 'traps', 'Trapézio Superior', ARRAY[]::TEXT[], ARRAY['Barra'], 2, 'https://media.giphy.com/media/SsKdClETfocCI6kegv/giphy.gif', 'Segure a barra à frente e encolha os ombros'),
-- LATÍSSIMO (lats)
('Pullover', 'lats', 'Latíssimo do Dorso', ARRAY['Peitoral', 'Tríceps'], ARRAY['Halter', 'Banco'], 2, 'https://media.giphy.com/media/SsKdClETfocCI6kegv/giphy.gif', 'Deite no banco e leve o halter atrás da cabeça'),
-- ANTEBRAÇOS (forearms)
('Rosca de Punho', 'forearms', 'Flexores do Antebraço', ARRAY[]::TEXT[], ARRAY['Barra', 'Halteres'], 1, 'https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif', 'Apoie os antebraços e flexione os punhos'),
('Rosca de Punho Inversa', 'forearms', 'Extensores do Antebraço', ARRAY[]::TEXT[], ARRAY['Barra', 'Halteres'], 1, 'https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif', 'Apoie os antebraços com palmas para baixo');

-- Inserir poses de yoga padrão
INSERT INTO public.yoga_poses (name, name_sanskrit, category, difficulty, duration_seconds, benefits, description, image_url) VALUES
('Postura da Montanha', 'Tadasana', 'Standing', 1, 30, ARRAY['Melhora a postura', 'Fortalece as pernas', 'Aumenta a consciência corporal'], 'Fique em pé com os pés juntos, braços ao lado do corpo, distribuindo o peso igualmente.', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400'),
('Postura do Cão Olhando para Baixo', 'Adho Mukha Svanasana', 'Inversion', 2, 45, ARRAY['Alonga a coluna', 'Fortalece braços e pernas', 'Alivia dor nas costas'], 'Forme um V invertido com o corpo, mãos e pés no chão.', 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400'),
('Postura da Criança', 'Balasana', 'Seated', 1, 60, ARRAY['Relaxamento profundo', 'Alonga a coluna', 'Alivia tensão'], 'Sente sobre os calcanhares, incline-se para frente com os braços estendidos.', 'https://images.unsplash.com/photo-1552196563-55cd4e45efb3?w=400'),
('Postura do Guerreiro I', 'Virabhadrasana I', 'Standing', 2, 30, ARRAY['Fortalece pernas', 'Abre o peito', 'Melhora equilíbrio'], 'Perna da frente flexionada, perna de trás estendida, braços para cima.', 'https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?w=400'),
('Postura do Guerreiro II', 'Virabhadrasana II', 'Standing', 2, 30, ARRAY['Fortalece pernas', 'Abre os quadris', 'Aumenta resistência'], 'Pernas abertas, uma flexionada, braços paralelos ao chão.', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400'),
('Postura da Árvore', 'Vrksasana', 'Balance', 2, 45, ARRAY['Melhora equilíbrio', 'Fortalece tornozelos', 'Aumenta foco'], 'Em pé, apoie um pé na coxa oposta, mãos unidas acima da cabeça.', 'https://images.unsplash.com/photo-1510894347713-fc3ed6fdf539?w=400'),
('Postura do Gato-Vaca', 'Marjaryasana-Bitilasana', 'Seated', 1, 45, ARRAY['Flexibilidade da coluna', 'Alivia tensão nas costas', 'Aquece o corpo'], 'De quatro, alterne entre arquear e curvar as costas.', 'https://images.unsplash.com/photo-1599447421416-3414500d18a5?w=400'),
('Postura da Cobra', 'Bhujangasana', 'Prone', 2, 30, ARRAY['Fortalece a coluna', 'Abre o peito', 'Melhora a digestão'], 'Deitado de bruços, eleve o tronco mantendo os quadris no chão.', 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400'),
('Postura do Cadáver', 'Savasana', 'Supine', 1, 300, ARRAY['Relaxamento total', 'Reduz estresse', 'Integra a prática'], 'Deite de costas, braços ao lado, relaxe completamente.', 'https://images.unsplash.com/photo-1552196563-55cd4e45efb3?w=400'),
('Postura Sentada com Torção', 'Ardha Matsyendrasana', 'Seated', 3, 30, ARRAY['Torce a coluna', 'Estimula órgãos', 'Alivia dor nas costas'], 'Sentado, cruze uma perna sobre a outra e torça o tronco.', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400');

-- Inserir estilos de artes marciais
INSERT INTO public.martial_arts_styles (name, description, origin_country, techniques, equipment, image_url) VALUES
('Boxe', 'Arte marcial que utiliza apenas os punhos para atacar e defender', 'Inglaterra', ARRAY['Jab', 'Cross', 'Hook', 'Uppercut', 'Slip', 'Bob and Weave'], ARRAY['Luvas de boxe', 'Bandagens', 'Saco de pancadas'], 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=400'),
('Muay Thai', 'Arte marcial tailandesa que usa punhos, cotovelos, joelhos e canelas', 'Tailândia', ARRAY['Teep', 'Roundhouse Kick', 'Elbow Strike', 'Knee Strike', 'Clinch'], ARRAY['Luvas', 'Caneleiras', 'Saco de pancadas'], 'https://images.unsplash.com/photo-1555597673-b21d5c935865?w=400'),
('Jiu-Jitsu Brasileiro', 'Arte marcial focada em técnicas de chão e finalizações', 'Brasil', ARRAY['Guard', 'Mount', 'Armbar', 'Triangle Choke', 'Rear Naked Choke', 'Sweep'], ARRAY['Kimono', 'Faixa'], 'https://images.unsplash.com/photo-1564415315949-7a0c4c73aab4?w=400'),
('Kickboxing', 'Combinação de boxe com chutes das artes marciais orientais', 'Japão/EUA', ARRAY['Jab', 'Cross', 'Front Kick', 'Roundhouse Kick', 'Side Kick'], ARRAY['Luvas', 'Caneleiras'], 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=400'),
('Capoeira', 'Arte marcial brasileira que combina luta, dança e música', 'Brasil', ARRAY['Ginga', 'Meia Lua', 'Armada', 'Queixada', 'Esquiva'], ARRAY['Berimbau', 'Atabaque'], 'https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?w=400'),
('Karatê', 'Arte marcial japonesa focada em golpes com mãos e pés', 'Japão', ARRAY['Kata', 'Kumite', 'Mae Geri', 'Mawashi Geri', 'Seiken'], ARRAY['Kimono', 'Faixa', 'Protetor bucal'], 'https://images.unsplash.com/photo-1555597673-b21d5c935865?w=400'),
('Judô', 'Arte marcial japonesa focada em quedas e imobilizações', 'Japão', ARRAY['O-soto-gari', 'Ippon-seoi-nage', 'Uchi-mata', 'Kesa-gatame', 'Juji-gatame'], ARRAY['Judogi', 'Faixa'], 'https://images.unsplash.com/photo-1564415315949-7a0c4c73aab4?w=400'),
('Taekwondo', 'Arte marcial coreana conhecida por chutes elaborados', 'Coreia do Sul', ARRAY['Dollyo Chagi', 'Ap Chagi', 'Naeryo Chagi', 'Yeop Chagi', 'Dwi Chagi'], ARRAY['Dobok', 'Proteções'], 'https://images.unsplash.com/photo-1555597673-b21d5c935865?w=400');

-- Inserir estilos de natação
INSERT INTO public.swimming_styles (name, description, muscles_worked, difficulty, image_url) VALUES
('Crawl (Nado Livre)', 'Estilo mais rápido e eficiente, com braçadas alternadas e batida de pernas', ARRAY['Dorsais', 'Deltoides', 'Tríceps', 'Core', 'Quadríceps'], 2, 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=400'),
('Costas', 'Nado de barriga para cima com braçadas alternadas', ARRAY['Dorsais', 'Tríceps', 'Core', 'Glúteos'], 2, 'https://images.unsplash.com/photo-1519315901367-f34ff9154487?w=400'),
('Peito', 'Estilo simétrico com braçadas e pernadas simultâneas', ARRAY['Peitorais', 'Dorsais', 'Adutores', 'Isquiotibiais'], 3, 'https://images.unsplash.com/photo-1560090995-01632a28895b?w=400'),
('Borboleta', 'Estilo mais exigente com movimento ondulado do corpo', ARRAY['Dorsais', 'Deltoides', 'Peitorais', 'Core', 'Quadríceps'], 5, 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=400'),
('Nado Medley', 'Combinação dos quatro estilos em sequência', ARRAY['Corpo todo'], 4, 'https://images.unsplash.com/photo-1519315901367-f34ff9154487?w=400');

-- Inserir outros exercícios
INSERT INTO public.other_exercises (name, category, description, muscles_worked, equipment, difficulty, image_url) VALUES
('Burpee', 'functional', 'Exercício de corpo inteiro que combina agachamento, flexão e salto', ARRAY['Peitorais', 'Core', 'Quadríceps', 'Glúteos'], ARRAY['Peso Corporal'], 4, 'https://images.unsplash.com/photo-1599058917765-a780eda07a3e?w=400'),
('Kettlebell Swing', 'functional', 'Movimento explosivo de quadril com kettlebell', ARRAY['Glúteos', 'Isquiotibiais', 'Core', 'Deltoides'], ARRAY['Kettlebell'], 3, 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=400'),
('Box Jump', 'functional', 'Salto explosivo sobre uma caixa', ARRAY['Quadríceps', 'Glúteos', 'Panturrilhas'], ARRAY['Caixa pliométrica'], 3, 'https://images.unsplash.com/photo-1599058917765-a780eda07a3e?w=400'),
('Battle Ropes', 'functional', 'Ondulação de cordas pesadas', ARRAY['Deltoides', 'Core', 'Bíceps', 'Dorsais'], ARRAY['Cordas de batalha'], 3, 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=400'),
('TRX Row', 'calisthenics', 'Remada com suspensão', ARRAY['Dorsais', 'Bíceps', 'Core'], ARRAY['TRX'], 2, 'https://images.unsplash.com/photo-1599058917765-a780eda07a3e?w=400'),
('Pistol Squat', 'calisthenics', 'Agachamento unilateral avançado', ARRAY['Quadríceps', 'Glúteos', 'Core'], ARRAY['Peso Corporal'], 5, 'https://images.unsplash.com/photo-1599058917765-a780eda07a3e?w=400'),
('Muscle Up', 'calisthenics', 'Combinação de barra fixa com mergulho', ARRAY['Dorsais', 'Peitorais', 'Tríceps', 'Core'], ARRAY['Barra Fixa'], 5, 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=400'),
('Clean and Jerk', 'crossfit', 'Levantamento olímpico completo', ARRAY['Quadríceps', 'Glúteos', 'Deltoides', 'Core'], ARRAY['Barra', 'Anilhas'], 5, 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=400'),
('Snatch', 'crossfit', 'Arranco olímpico', ARRAY['Quadríceps', 'Glúteos', 'Deltoides', 'Trapézio'], ARRAY['Barra', 'Anilhas'], 5, 'https://images.unsplash.com/photo-1599058917765-a780eda07a3e?w=400'),
('Wall Ball', 'crossfit', 'Agachamento com arremesso de medicine ball', ARRAY['Quadríceps', 'Glúteos', 'Deltoides', 'Core'], ARRAY['Medicine Ball'], 3, 'https://images.unsplash.com/photo-1599058917765-a780eda07a3e?w=400'),
('Pilates Roll Up', 'pilates', 'Movimento de enrolar a coluna', ARRAY['Core', 'Reto Abdominal'], ARRAY['Mat'], 2, 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400'),
('Pilates Hundred', 'pilates', 'Exercício clássico de core do Pilates', ARRAY['Core', 'Reto Abdominal'], ARRAY['Mat'], 2, 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400'),
('Pular Corda', 'cardio', 'Exercício cardiovascular com corda', ARRAY['Panturrilhas', 'Core', 'Antebraços'], ARRAY['Corda'], 2, 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=400');

-- Triggers para updated_at
CREATE TRIGGER update_workout_plans_updated_at
BEFORE UPDATE ON public.workout_plans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();