
-- Eliminar las tablas que no se usan
DROP TABLE IF EXISTS public.snies_departments CASCADE;
DROP TABLE IF EXISTS public.snies_academic_levels CASCADE;
DROP TABLE IF EXISTS public.snies_program_types CASCADE;
DROP TABLE IF EXISTS public.snies_recognition_types CASCADE;

-- Modificar la tabla de municipios para la nueva estructura
-- Primero eliminar la tabla existente y crear la nueva
DROP TABLE IF EXISTS public.snies_municipalities CASCADE;

CREATE TABLE public.snies_municipalities (
  id text NOT NULL PRIMARY KEY,
  department_id text NOT NULL,
  name text NOT NULL,
  country_id text REFERENCES public.snies_countries(id),
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- Crear índices para mejor rendimiento
CREATE INDEX idx_snies_municipalities_active ON public.snies_municipalities(is_active);
CREATE INDEX idx_snies_municipalities_country ON public.snies_municipalities(country_id);
CREATE INDEX idx_snies_municipalities_department ON public.snies_municipalities(department_id);

-- Habilitar RLS
ALTER TABLE public.snies_municipalities ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para municipios
CREATE POLICY "Everyone can view snies municipalities" ON public.snies_municipalities
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert snies municipalities" ON public.snies_municipalities
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Administrador')
  );

CREATE POLICY "Admins can update snies municipalities" ON public.snies_municipalities
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Administrador')
  );

CREATE POLICY "Admins can delete snies municipalities" ON public.snies_municipalities
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Administrador')
  );
