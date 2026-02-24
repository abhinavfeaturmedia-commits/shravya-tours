-- Migration to add 'builder_data' column to 'packages' table
-- This allows saving raw Itinerary Builder state for editing

ALTER TABLE IF EXISTS packages
ADD COLUMN IF NOT EXISTS builder_data JSONB;

-- Force PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
