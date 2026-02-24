-- Migration to ensure 'master_hotels' table has all required columns mapping to api.ts

-- Create table if it entirely doesn't exist
CREATE TABLE IF NOT EXISTS master_hotels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Safely add all possible columns it could be missing
ALTER TABLE master_hotels
ADD COLUMN IF NOT EXISTS name TEXT,
ADD COLUMN IF NOT EXISTS location_id UUID, -- Assuming it links to master_locations
ADD COLUMN IF NOT EXISTS rating NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS amenities JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS price_per_night NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS image TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Active';

-- Force PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
