-- Migration to ensure 'packages' table has all required columns mapping to api.ts

-- Create table if it entirely doesn't exist
CREATE TABLE IF NOT EXISTS packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Safely add all possible columns it could be missing
ALTER TABLE packages
ADD COLUMN IF NOT EXISTS title TEXT,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS price NUMERIC,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS days INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS image TEXT,
ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS remaining_seats INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS group_size TEXT DEFAULT 'Family',
ADD COLUMN IF NOT EXISTS theme TEXT DEFAULT 'Tour',
ADD COLUMN IF NOT EXISTS overview TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Active',
ADD COLUMN IF NOT EXISTS offer_end_time TEXT,
ADD COLUMN IF NOT EXISTS included JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS not_included JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS builder_data JSONB;

-- Force PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
