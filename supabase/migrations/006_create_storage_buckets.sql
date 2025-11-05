-- Migration: Create storage buckets for resume files
-- Description: Set up storage buckets with RLS for secure file uploads

-- Create the resumes bucket (if not exists)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'resumes',
  'resumes',
  false, -- Private bucket
  52428800, -- 50MB limit
  ARRAY['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword', 'text/plain']
)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS policies for resumes bucket

-- Policy: Users can upload their own files
CREATE POLICY "Users can upload own resumes"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'resumes' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users can view their own files
CREATE POLICY "Users can view own resumes"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'resumes' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users can update their own files
CREATE POLICY "Users can update own resumes"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'resumes' AND
  auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'resumes' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users can delete their own files
CREATE POLICY "Users can delete own resumes"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'resumes' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Create function to get signed URLs (optional - for server-side URL generation)
CREATE OR REPLACE FUNCTION get_resume_url(file_path text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  signed_url text;
BEGIN
  -- Only allow users to get URLs for their own files
  IF auth.uid()::text != (string_to_array(file_path, '/'))[1] THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Generate a signed URL valid for 1 hour
  SELECT storage.get_signed_url('resumes', file_path, 3600) INTO signed_url;
  RETURN signed_url;
END;
$$;

-- Comment for documentation
COMMENT ON FUNCTION get_resume_url IS 'Generates signed URL for resume files with 1-hour expiry';