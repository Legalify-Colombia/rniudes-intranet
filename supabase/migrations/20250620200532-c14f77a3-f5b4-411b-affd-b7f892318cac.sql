
-- Crear tablas adicionales para criterios SNIES
CREATE TABLE public.snies_academic_levels (
  id text NOT NULL PRIMARY KEY,
  name text NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.snies_program_types (
  id text NOT NULL PRIMARY KEY,
  name text NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.snies_recognition_types (
  id text NOT NULL PRIMARY KEY,
  name text NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.snies_departments (
  id text NOT NULL PRIMARY KEY,
  name text NOT NULL,
  country_id text REFERENCES public.snies_countries(id),
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- Agregar campo para opciones del campo en las plantillas
ALTER TABLE public.snies_template_fields 
ADD COLUMN field_options jsonb;

-- Crear índices para mejor rendimiento
CREATE INDEX idx_snies_academic_levels_active ON public.snies_academic_levels(is_active);
CREATE INDEX idx_snies_program_types_active ON public.snies_program_types(is_active);
CREATE INDEX idx_snies_recognition_types_active ON public.snies_recognition_types(is_active);
CREATE INDEX idx_snies_departments_active ON public.snies_departments(is_active);
CREATE INDEX idx_snies_departments_country ON public.snies_departments(country_id);

-- RLS policies para las nuevas tablas
ALTER TABLE public.snies_academic_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.snies_program_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.snies_recognition_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.snies_departments ENABLE ROW LEVEL SECURITY;

-- Políticas para permitir lectura a usuarios autenticados
CREATE POLICY "Allow authenticated users to read academic levels" ON public.snies_academic_levels
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to read program types" ON public.snies_program_types
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to read recognition types" ON public.snies_recognition_types
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to read departments" ON public.snies_departments
  FOR SELECT TO authenticated USING (true);

-- Políticas para permitir modificaciones solo a administradores
CREATE POLICY "Allow admins to manage academic levels" ON public.snies_academic_levels
  FOR ALL TO authenticated 
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Administrador'));

CREATE POLICY "Allow admins to manage program types" ON public.snies_program_types
  FOR ALL TO authenticated 
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Administrador'));

CREATE POLICY "Allow admins to manage recognition types" ON public.snies_recognition_types
  FOR ALL TO authenticated 
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Administrador'));

CREATE POLICY "Allow admins to manage departments" ON public.snies_departments
  FOR ALL TO authenticated 
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Administrador'));
