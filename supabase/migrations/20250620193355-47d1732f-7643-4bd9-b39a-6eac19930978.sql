
-- Drop the incorrect INSERT policies first
DROP POLICY IF EXISTS "Admins can insert snies config tables" ON snies_countries;
DROP POLICY IF EXISTS "Admins can insert snies config tables" ON snies_municipalities;
DROP POLICY IF EXISTS "Admins can insert snies config tables" ON snies_document_types;
DROP POLICY IF EXISTS "Admins can insert snies config tables" ON snies_biological_sex;
DROP POLICY IF EXISTS "Admins can insert snies config tables" ON snies_marital_status;

-- Create correct INSERT policies with WITH CHECK
CREATE POLICY "Admins can insert snies config tables" ON snies_countries FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'Administrador')
);

CREATE POLICY "Admins can insert snies config tables" ON snies_municipalities FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'Administrador')
);

CREATE POLICY "Admins can insert snies config tables" ON snies_document_types FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'Administrador')
);

CREATE POLICY "Admins can insert snies config tables" ON snies_biological_sex FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'Administrador')
);

CREATE POLICY "Admins can insert snies config tables" ON snies_marital_status FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'Administrador')
);

-- Create the new tables and policies correctly
CREATE TABLE IF NOT EXISTS snies_education_levels (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS snies_modalities (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS snies_methodologies (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS snies_knowledge_areas (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  parent_area_id TEXT REFERENCES snies_knowledge_areas(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS snies_institutions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT,
  address TEXT,
  municipality_id TEXT REFERENCES snies_municipalities(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE snies_education_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE snies_modalities ENABLE ROW LEVEL SECURITY;
ALTER TABLE snies_methodologies ENABLE ROW LEVEL SECURITY;
ALTER TABLE snies_knowledge_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE snies_institutions ENABLE ROW LEVEL SECURITY;

-- Policies for new tables (read for everyone, write for admins)
CREATE POLICY "Everyone can view snies education levels" ON snies_education_levels FOR SELECT USING (true);
CREATE POLICY "Admins can insert snies education levels" ON snies_education_levels FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'Administrador')
);
CREATE POLICY "Admins can update snies education levels" ON snies_education_levels FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'Administrador')
);
CREATE POLICY "Admins can delete snies education levels" ON snies_education_levels FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'Administrador')
);

CREATE POLICY "Everyone can view snies modalities" ON snies_modalities FOR SELECT USING (true);
CREATE POLICY "Admins can insert snies modalities" ON snies_modalities FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'Administrador')
);
CREATE POLICY "Admins can update snies modalities" ON snies_modalities FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'Administrador')
);
CREATE POLICY "Admins can delete snies modalities" ON snies_modalities FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'Administrador')
);

CREATE POLICY "Everyone can view snies methodologies" ON snies_methodologies FOR SELECT USING (true);
CREATE POLICY "Admins can insert snies methodologies" ON snies_methodologies FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'Administrador')
);
CREATE POLICY "Admins can update snies methodologies" ON snies_methodologies FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'Administrador')
);
CREATE POLICY "Admins can delete snies methodologies" ON snies_methodologies FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'Administrador')
);

CREATE POLICY "Everyone can view snies knowledge areas" ON snies_knowledge_areas FOR SELECT USING (true);
CREATE POLICY "Admins can insert snies knowledge areas" ON snies_knowledge_areas FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'Administrador')
);
CREATE POLICY "Admins can update snies knowledge areas" ON snies_knowledge_areas FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'Administrador')
);
CREATE POLICY "Admins can delete snies knowledge areas" ON snies_knowledge_areas FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'Administrador')
);

CREATE POLICY "Everyone can view snies institutions" ON snies_institutions FOR SELECT USING (true);
CREATE POLICY "Admins can insert snies institutions" ON snies_institutions FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'Administrador')
);
CREATE POLICY "Admins can update snies institutions" ON snies_institutions FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'Administrador')
);
CREATE POLICY "Admins can delete snies institutions" ON snies_institutions FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'Administrador')
);

-- Insert initial data for new tables
INSERT INTO snies_education_levels (id, name, description) VALUES
('TC', 'Técnico Profesional', 'Técnico Profesional'),
('TL', 'Tecnológico', 'Tecnológico'),
('UN', 'Universitario', 'Universitario'),
('ES', 'Especialización', 'Especialización'),
('MA', 'Maestría', 'Maestría'),
('DO', 'Doctorado', 'Doctorado')
ON CONFLICT (id) DO NOTHING;

INSERT INTO snies_modalities (id, name, description) VALUES
('PR', 'Presencial', 'Presencial'),
('DI', 'Distancia', 'A Distancia'),
('VI', 'Virtual', 'Virtual')
ON CONFLICT (id) DO NOTHING;

INSERT INTO snies_methodologies (id, name, description) VALUES
('PR', 'Propia', 'Propia'),
('CO', 'Convenio', 'Convenio'),
('EX', 'Extensión', 'Extensión')
ON CONFLICT (id) DO NOTHING;

INSERT INTO snies_knowledge_areas (id, name, description) VALUES
('01', 'AGRONOMÍA, VETERINARIA Y AFINES', 'Agronomía, Veterinaria y afines'),
('02', 'BELLAS ARTES', 'Bellas Artes'),
('03', 'CIENCIAS DE LA EDUCACIÓN', 'Ciencias de la Educación'),
('04', 'CIENCIAS DE LA SALUD', 'Ciencias de la Salud'),
('05', 'CIENCIAS SOCIALES Y HUMANAS', 'Ciencias Sociales y Humanas'),
('06', 'ECONOMÍA, ADMINISTRACIÓN, CONTADURÍA Y AFINES', 'Economía, Administración, Contaduría y afines'),
('07', 'INGENIERÍA, ARQUITECTURA, URBANISMO Y AFINES', 'Ingeniería, Arquitectura, Urbanismo y afines'),
('08', 'MATEMÁTICAS Y CIENCIAS NATURALES', 'Matemáticas y Ciencias Naturales')
ON CONFLICT (id) DO NOTHING;
