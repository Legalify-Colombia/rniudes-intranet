
-- Crear tabla intermedia para la relación muchos a muchos entre facultades y campus
CREATE TABLE public.faculty_campus (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  faculty_id UUID NOT NULL REFERENCES public.faculties(id) ON DELETE CASCADE,
  campus_id UUID NOT NULL REFERENCES public.campus(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(faculty_id, campus_id)
);

-- Habilitar RLS en la tabla intermedia
ALTER TABLE public.faculty_campus ENABLE ROW LEVEL SECURITY;

-- Política para ver las relaciones facultad-campus
CREATE POLICY "Everyone can view faculty-campus relations" ON public.faculty_campus FOR SELECT USING (true);

-- Política para que solo admins gestionen las relaciones
CREATE POLICY "Admins can manage faculty-campus relations" ON public.faculty_campus FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Administrador')
);

-- Actualizar tabla de perfiles para incluir horas semanales y total cuando se asigna como gestor
-- Estos campos ya existen en la tabla profiles, solo necesitamos asegurar que se usen correctamente

-- Migrar datos existentes: crear relaciones en faculty_campus basadas en campus_id actual
INSERT INTO public.faculty_campus (faculty_id, campus_id)
SELECT id, campus_id FROM public.faculties
WHERE campus_id IS NOT NULL;
