-- Insert 'documents' bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access (so images can be viewed in the UI)
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'documents' );

-- Allow authenticated users to upload files
CREATE POLICY "Auth Upload" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK ( bucket_id = 'documents' );

-- Allow authenticated users to update their files
CREATE POLICY "Auth Update" 
ON storage.objects FOR UPDATE 
TO authenticated 
USING ( bucket_id = 'documents' );

-- Allow authenticated users to delete files
CREATE POLICY "Auth Delete" 
ON storage.objects FOR DELETE 
TO authenticated 
USING ( bucket_id = 'documents' );
