-- CareerLens Database Schema
-- User profiles table (linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Resume analyses table
CREATE TABLE IF NOT EXISTS public.resume_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT,
  raw_text TEXT,
  ats_score INTEGER,
  overall_score INTEGER,
  analysis_data JSONB,
  suggestions JSONB,
  skills_extracted JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Portfolio/Link evaluations table
CREATE TABLE IF NOT EXISTS public.portfolio_evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  evaluation_type TEXT NOT NULL, -- 'linkedin', 'github', 'portfolio', 'other'
  score INTEGER,
  evaluation_data JSONB,
  suggestions JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_evaluations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_own" ON public.profiles;

CREATE POLICY "profiles_select_own" ON public.profiles 
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles 
  FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles 
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_delete_own" ON public.profiles 
  FOR DELETE USING (auth.uid() = id);

-- Drop and recreate resume_analyses policies
DROP POLICY IF EXISTS "resume_analyses_select_own" ON public.resume_analyses;
DROP POLICY IF EXISTS "resume_analyses_insert_own" ON public.resume_analyses;
DROP POLICY IF EXISTS "resume_analyses_update_own" ON public.resume_analyses;
DROP POLICY IF EXISTS "resume_analyses_delete_own" ON public.resume_analyses;

CREATE POLICY "resume_analyses_select_own" ON public.resume_analyses 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "resume_analyses_insert_own" ON public.resume_analyses 
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "resume_analyses_update_own" ON public.resume_analyses 
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "resume_analyses_delete_own" ON public.resume_analyses 
  FOR DELETE USING (auth.uid() = user_id);

-- Drop and recreate portfolio_evaluations policies
DROP POLICY IF EXISTS "portfolio_evaluations_select_own" ON public.portfolio_evaluations;
DROP POLICY IF EXISTS "portfolio_evaluations_insert_own" ON public.portfolio_evaluations;
DROP POLICY IF EXISTS "portfolio_evaluations_update_own" ON public.portfolio_evaluations;
DROP POLICY IF EXISTS "portfolio_evaluations_delete_own" ON public.portfolio_evaluations;

CREATE POLICY "portfolio_evaluations_select_own" ON public.portfolio_evaluations 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "portfolio_evaluations_insert_own" ON public.portfolio_evaluations 
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "portfolio_evaluations_update_own" ON public.portfolio_evaluations 
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "portfolio_evaluations_delete_own" ON public.portfolio_evaluations 
  FOR DELETE USING (auth.uid() = user_id);

-- Trigger to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'full_name', NULL)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
