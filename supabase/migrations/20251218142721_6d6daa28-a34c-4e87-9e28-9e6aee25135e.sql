-- Create enum for book status
CREATE TYPE book_status AS ENUM ('active', 'paused', 'completed', 'dropped');

-- Create enum for battle type
CREATE TYPE battle_type AS ENUM ('minion', 'boss');

-- Create enum for battle result
CREATE TYPE battle_result AS ENUM ('victory', 'defeat', 'abandoned');

-- Create enum for ranks
CREATE TYPE player_rank AS ENUM ('adormecido', 'desperto', 'peregrino', 'soberano', 'arauto', 'singularidade');

-- Profiles table with RPG stats
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  level INTEGER NOT NULL DEFAULT 1,
  rank player_rank NOT NULL DEFAULT 'adormecido',
  xp_intelligence INTEGER NOT NULL DEFAULT 0,
  xp_vitality INTEGER NOT NULL DEFAULT 0,
  xp_discipline INTEGER NOT NULL DEFAULT 0,
  gold INTEGER NOT NULL DEFAULT 0,
  total_pages_read INTEGER NOT NULL DEFAULT 0,
  total_battles_won INTEGER NOT NULL DEFAULT 0,
  total_water_ml INTEGER NOT NULL DEFAULT 0,
  streak_days INTEGER NOT NULL DEFAULT 0,
  last_active_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Books (Quests) table
CREATE TABLE public.books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  author TEXT,
  total_pages INTEGER NOT NULL,
  pages_read INTEGER NOT NULL DEFAULT 0,
  status book_status NOT NULL DEFAULT 'active',
  category TEXT,
  image_url TEXT,
  target_date DATE,
  xp_earned INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Reading sessions (GPS tracking)
CREATE TABLE public.reading_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  pages_read INTEGER NOT NULL,
  xp_earned INTEGER NOT NULL DEFAULT 0,
  reading_speed DECIMAL(5,2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Battle sessions (Pomodoro)
CREATE TABLE public.battle_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  battle_type battle_type NOT NULL,
  duration_minutes INTEGER NOT NULL,
  result battle_result NOT NULL DEFAULT 'abandoned',
  interruptions INTEGER NOT NULL DEFAULT 0,
  xp_earned INTEGER NOT NULL DEFAULT 0,
  gold_earned INTEGER NOT NULL DEFAULT 0,
  grimoire_text TEXT,
  grimoire_audio_url TEXT,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE
);

-- Vitality logs (water + workouts)
CREATE TABLE public.vitality_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  water_ml INTEGER NOT NULL DEFAULT 0,
  workout_completed BOOLEAN NOT NULL DEFAULT false,
  workout_type TEXT,
  xp_earned INTEGER NOT NULL DEFAULT 0,
  logged_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Shop items
CREATE TABLE public.shop_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  cost_gold INTEGER NOT NULL,
  icon TEXT,
  is_consumable BOOLEAN NOT NULL DEFAULT true,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Purchase history
CREATE TABLE public.purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES public.shop_items(id) ON DELETE CASCADE,
  gold_spent INTEGER NOT NULL,
  purchased_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reading_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.battle_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vitality_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Books policies
CREATE POLICY "Users can view own books" ON public.books FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own books" ON public.books FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own books" ON public.books FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own books" ON public.books FOR DELETE USING (auth.uid() = user_id);

-- Reading sessions policies
CREATE POLICY "Users can view own reading sessions" ON public.reading_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own reading sessions" ON public.reading_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Battle sessions policies
CREATE POLICY "Users can view own battles" ON public.battle_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own battles" ON public.battle_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own battles" ON public.battle_sessions FOR UPDATE USING (auth.uid() = user_id);

-- Vitality logs policies
CREATE POLICY "Users can view own vitality logs" ON public.vitality_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own vitality logs" ON public.vitality_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Shop items are public to view
CREATE POLICY "Anyone can view shop items" ON public.shop_items FOR SELECT USING (true);

-- Purchases policies
CREATE POLICY "Users can view own purchases" ON public.purchases FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own purchases" ON public.purchases FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (new.id, COALESCE(new.raw_user_meta_data ->> 'display_name', 'Aventureiro'));
  RETURN new;
END;
$$;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_books_updated_at BEFORE UPDATE ON public.books FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();