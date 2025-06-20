
-- Hacer el campo campus_id opcional en la tabla faculties
ALTER TABLE public.faculties ALTER COLUMN campus_id DROP NOT NULL;

-- Actualizar la tabla faculty_campus para asegurar que tiene todas las relaciones existentes
INSERT INTO public.faculty_campus (faculty_id, campus_id)
SELECT f.id, f.campus_id 
FROM public.faculties f
WHERE f.campus_id IS NOT NULL 
AND NOT EXISTS (
    SELECT 1 FROM public.faculty_campus fc 
    WHERE fc.faculty_id = f.id AND fc.campus_id = f.campus_id
);

-- Opcional: Limpiar el campo campus_id de la tabla faculties ya que ahora usamos la relación
-- UPDATE public.faculties SET campus_id = NULL;
