-- Run this in Supabase SQL Editor to enable photo uploads
-- https://supabase.com/dashboard/project/ykpsbzbwyctburjesrod/sql/new

-- Allow public/anonymous photo uploads
ALTER TABLE photos DISABLE ROW LEVEL SECURITY;

-- Allow public globe creation
ALTER TABLE globes DISABLE ROW LEVEL SECURITY;

-- Create Raisa's globe (if not already created)
ALTER TABLE globes ALTER COLUMN creator_id DROP NOT NULL;
INSERT INTO globes (slug, partner_name, creator_name, birth_day, birth_month, birth_year, theme, custom_message, is_premium)
VALUES ('raisa', 'Raisa', 'Your Love', 23, 10, 2006, 'pink', 'You are my world, Raisa!', true)
ON CONFLICT (slug) DO NOTHING;
