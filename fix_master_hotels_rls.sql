-- Migration to enable Row Level Security (RLS) and add policies for master_hotels

-- Enable RLS
ALTER TABLE master_hotels ENABLE ROW LEVEL SECURITY;

-- Allow public read access (so app can fetch hotels)
CREATE POLICY "Enable read access for all users" 
ON master_hotels FOR SELECT 
USING (true);

-- Allow authenticated users to create, update, and delete hotels
CREATE POLICY "Enable all access for authenticated users" 
ON master_hotels FOR ALL 
TO authenticated 
USING (true) WITH CHECK (true);

-- Force PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
