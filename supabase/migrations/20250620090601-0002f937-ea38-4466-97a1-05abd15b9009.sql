
-- Crear bucket para reportes si no existe
INSERT INTO storage.buckets (id, name, public)
VALUES ('reports', 'reports', true)
ON CONFLICT (id) DO NOTHING;

-- Crear políticas para el bucket de reportes
CREATE POLICY "Allow authenticated users to upload report files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'reports');

CREATE POLICY "Allow authenticated users to view report files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'reports');

CREATE POLICY "Allow authenticated users to delete their report files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'reports' AND auth.uid()::text = (storage.foldername(name))[1]);
