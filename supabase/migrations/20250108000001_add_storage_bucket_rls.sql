-- Add RLS policies for storage.objects (publications bucket)
-- Created: 2025-01-08
-- Note: RLS should already be enabled on storage.objects by default

-- ============================================================================
-- STORAGE BUCKET RLS POLICIES
-- ============================================================================

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Authenticated users can upload to publications bucket" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update publications" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete publications" ON storage.objects;
DROP POLICY IF EXISTS "Public read access to publications bucket" ON storage.objects;

-- Allow authenticated users to upload files to publications bucket
CREATE POLICY "Authenticated users can upload to publications bucket" 
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'publications'
  );

-- Allow authenticated users to update files in publications bucket
CREATE POLICY "Authenticated users can update publications" 
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'publications')
  WITH CHECK (bucket_id = 'publications');

-- Allow authenticated users to delete files from publications bucket
CREATE POLICY "Authenticated users can delete publications" 
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'publications');

-- Public read access for publications bucket (since it's a public bucket)
CREATE POLICY "Public read access to publications bucket" 
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'publications');

