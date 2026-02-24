-- Migration to ensure 'packages' table has all required columns mapping to api.ts

ALTER TABLE IF EXISTS packages
ADD COLUMN IF NOT EXISTS days INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS group_size TEXT DEFAULT 'Family',
ADD COLUMN IF NOT EXISTS remaining_seats INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS theme TEXT DEFAULT 'Tour',
ADD COLUMN IF NOT EXISTS overview TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Active',
ADD COLUMN IF NOT EXISTS offer_end_time TEXT,
ADD COLUMN IF NOT EXISTS included JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS not_included JSONB DEFAULT '[]'::jsonb;

-- Force PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
