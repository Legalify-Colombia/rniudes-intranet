-- Create storage bucket for evidence files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('evidence-files', 'evidence-files', false);

-- Create RLS policies for evidence files bucket
CREATE POLICY "Users can upload their own evidence files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'evidence-files' 
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can view their own evidence files" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'evidence-files' 
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own evidence files" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'evidence-files' 
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own evidence files" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'evidence-files' 
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Coordinators and Admins can view all evidence files
CREATE POLICY "Coordinators and Admins can view all evidence files" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'evidence-files' 
  AND auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('Coordinador', 'Administrador')
  )
);