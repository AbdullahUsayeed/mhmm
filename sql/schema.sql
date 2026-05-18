-- ============================================
-- MyWorld.app - Database Schema
-- Run this in Supabase SQL Editor (https://supabase.com/dashboard)
-- ============================================

-- Drop old tables (warning: removes existing data)
DROP TABLE IF EXISTS photos CASCADE;

-- ============================================
-- GLOBES TABLE
-- Each globe represents one birthday gift
-- ============================================
CREATE TABLE globes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  partner_name TEXT NOT NULL,
  creator_name TEXT NOT NULL,
  birth_day INT NOT NULL CHECK (birth_day BETWEEN 1 AND 31),
  birth_month INT NOT NULL CHECK (birth_month BETWEEN 1 AND 12),
  birth_year INT NOT NULL,
  theme TEXT NOT NULL DEFAULT 'pink' CHECK (theme IN ('pink','blue','purple','emerald','dark','sunset')),
  custom_message TEXT DEFAULT 'You are my world.',
  is_premium BOOLEAN DEFAULT false,
  views INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PHOTOS TABLE
-- Photos added to globes, placed on continents
-- ============================================
CREATE TABLE photos (
  id TEXT PRIMARY KEY,
  globe_id UUID REFERENCES globes(id) ON DELETE CASCADE NOT NULL,
  data_url TEXT NOT NULL,
  lat FLOAT8 NOT NULL,
  lng FLOAT8 NOT NULL,
  year_key TEXT NOT NULL,
  continent TEXT,
  added_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PROFILES TABLE
-- Extended user profile data
-- ============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Globes: anyone can view (public link), only creator can manage
ALTER TABLE globes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read globes" ON globes FOR SELECT USING (true);
CREATE POLICY "Creators can insert globes" ON globes FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Creators can update their globes" ON globes FOR UPDATE USING (auth.uid() = creator_id);
CREATE POLICY "Creators can delete their globes" ON globes FOR DELETE USING (auth.uid() = creator_id);

-- Photos: anyone can view, creators manage via globe ownership
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read photos" ON photos FOR SELECT USING (true);
CREATE POLICY "Creators can insert photos" ON photos FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM globes WHERE globes.id = photos.globe_id AND globes.creator_id = auth.uid()));
CREATE POLICY "Creators can delete photos" ON photos FOR DELETE
  USING (EXISTS (SELECT 1 FROM globes WHERE globes.id = photos.globe_id AND globes.creator_id = auth.uid()));

-- Profiles: only owner can read/write
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_globes_slug ON globes(slug);
CREATE INDEX idx_globes_creator ON globes(creator_id);
CREATE INDEX idx_photos_globe ON photos(globe_id);
CREATE INDEX idx_photos_year_key ON photos(year_key);

-- ============================================
-- STORAGE BUCKET
-- For uploaded photos (alternative to base64)
-- ============================================
-- Run this via Storage UI or uncomment when service_role available:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('photos', 'photos', true);
-- CREATE POLICY "Public read photos bucket" ON storage.objects FOR SELECT USING (bucket_id = 'photos');
-- CREATE POLICY "Auth insert photos bucket" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'photos' AND auth.role() = 'authenticated');
