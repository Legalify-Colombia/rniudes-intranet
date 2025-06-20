
-- Crear tabla para tipos de documentos preconfigurados
CREATE TABLE IF NOT EXISTS snies_document_types (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Crear tabla para sexo biológico
CREATE TABLE IF NOT EXISTS snies_biological_sex (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Crear tabla para estado civil
CREATE TABLE IF NOT EXISTS snies_marital_status (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Crear tabla para países
CREATE TABLE IF NOT EXISTS snies_countries (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  alpha_3 TEXT,
  alpha_2 TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Crear tabla para municipios
CREATE TABLE IF NOT EXISTS snies_municipalities (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  country_id TEXT REFERENCES snies_countries(id),
  department_code TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Crear tabla para plantillas de reportes SNIES
CREATE TABLE IF NOT EXISTS snies_report_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Crear tabla para campos de plantillas SNIES
CREATE TABLE IF NOT EXISTS snies_template_fields (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID REFERENCES snies_report_templates(id) ON DELETE CASCADE,
  field_name TEXT NOT NULL,
  field_label TEXT NOT NULL,
  field_type TEXT NOT NULL CHECK (field_type IN ('text', 'numeric', 'relation')),
  relation_table TEXT, -- Para campos de relación (ej: snies_countries)
  relation_id_field TEXT, -- Campo ID de la relación
  relation_display_field TEXT, -- Campo a mostrar de la relación
  is_required BOOLEAN DEFAULT false,
  field_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Crear tabla para reportes SNIES de gestores
CREATE TABLE IF NOT EXISTS snies_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID REFERENCES snies_report_templates(id),
  manager_id UUID NOT NULL,
  title TEXT NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'reviewed')),
  submitted_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Crear tabla para datos de reportes SNIES
CREATE TABLE IF NOT EXISTS snies_report_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id UUID REFERENCES snies_reports(id) ON DELETE CASCADE,
  row_index INTEGER NOT NULL,
  field_data JSONB NOT NULL, -- Almacena todos los campos como JSON
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Crear tabla para reportes consolidados
CREATE TABLE IF NOT EXISTS snies_consolidated_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID REFERENCES snies_report_templates(id),
  title TEXT NOT NULL,
  consolidation_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  total_records INTEGER DEFAULT 0,
  participating_managers INTEGER DEFAULT 0,
  file_url TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS en todas las tablas
ALTER TABLE snies_document_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE snies_biological_sex ENABLE ROW LEVEL SECURITY;
ALTER TABLE snies_marital_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE snies_countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE snies_municipalities ENABLE ROW LEVEL SECURITY;
ALTER TABLE snies_report_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE snies_template_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE snies_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE snies_report_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE snies_consolidated_reports ENABLE ROW LEVEL SECURITY;

-- Políticas para las tablas de configuración (solo lectura para todos, escritura para admins)
CREATE POLICY "Everyone can view snies config tables" ON snies_document_types FOR SELECT USING (true);
CREATE POLICY "Everyone can view snies config tables" ON snies_biological_sex FOR SELECT USING (true);
CREATE POLICY "Everyone can view snies config tables" ON snies_marital_status FOR SELECT USING (true);
CREATE POLICY "Everyone can view snies config tables" ON snies_countries FOR SELECT USING (true);
CREATE POLICY "Everyone can view snies config tables" ON snies_municipalities FOR SELECT USING (true);

-- Políticas para plantillas (todos pueden ver, solo admins pueden crear/editar)
CREATE POLICY "Everyone can view templates" ON snies_report_templates FOR SELECT USING (true);
CREATE POLICY "Admins can manage templates" ON snies_report_templates FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'Administrador')
);

CREATE POLICY "Everyone can view template fields" ON snies_template_fields FOR SELECT USING (true);
CREATE POLICY "Admins can manage template fields" ON snies_template_fields FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'Administrador')
);

-- Políticas para reportes (gestores pueden ver/crear sus propios reportes, admins pueden ver todos)
CREATE POLICY "Users can view own reports" ON snies_reports FOR SELECT USING (
  manager_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('Administrador', 'Coordinador'))
);

CREATE POLICY "Managers can create reports" ON snies_reports FOR INSERT WITH CHECK (
  manager_id = auth.uid() AND 
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'Gestor')
);

CREATE POLICY "Managers can update own reports" ON snies_reports FOR UPDATE USING (
  manager_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('Administrador', 'Coordinador'))
);

-- Políticas para datos de reportes
CREATE POLICY "Users can view own report data" ON snies_report_data FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM snies_reports sr 
    WHERE sr.id = report_id AND (
      sr.manager_id = auth.uid() OR 
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('Administrador', 'Coordinador'))
    )
  )
);

CREATE POLICY "Managers can manage own report data" ON snies_report_data FOR ALL USING (
  EXISTS (
    SELECT 1 FROM snies_reports sr 
    WHERE sr.id = report_id AND sr.manager_id = auth.uid()
  )
);

-- Políticas para reportes consolidados
CREATE POLICY "Everyone can view consolidated reports" ON snies_consolidated_reports FOR SELECT USING (true);
CREATE POLICY "Admins can manage consolidated reports" ON snies_consolidated_reports FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'Administrador')
);

-- Insertar datos iniciales para tipos de documento
INSERT INTO snies_document_types (id, name, description) VALUES
('PS', 'Pasaporte', 'Pasaporte'),
('CC', 'Cédula de Ciudadanía', 'Cédula de Ciudadanía'),
('TI', 'Tarjeta de Identidad', 'Tarjeta de Identidad'),
('DE', 'Documento de Extranjería', 'Documento de Extranjería'),
('CE', 'Cédula de Extranjería', 'Cédula de Extranjería'),
('CA', 'Carné de Aprendiz', 'Carné de Aprendiz'),
('PT', 'Permiso Temporal', 'Permiso Temporal de Permanencia')
ON CONFLICT (id) DO NOTHING;

-- Insertar datos iniciales para sexo biológico
INSERT INTO snies_biological_sex (id, name) VALUES
('M', 'Masculino'),
('F', 'Femenino')
ON CONFLICT (id) DO NOTHING;

-- Insertar datos iniciales para estado civil
INSERT INTO snies_marital_status (id, name) VALUES
('S', 'Soltero(a)'),
('C', 'Casado(a)'),
('D', 'Divorciado(a)'),
('V', 'Viudo(a)'),
('U', 'Unión Libre')
ON CONFLICT (id) DO NOTHING;

-- Crear plantilla predefinida "Participante"
INSERT INTO snies_report_templates (name, description, created_by) 
SELECT 
  'Participante',
  'Plantilla predefinida para reportes SNIES de participantes',
  (SELECT id FROM profiles WHERE role = 'Administrador' LIMIT 1)
WHERE NOT EXISTS (
  SELECT 1 FROM snies_report_templates WHERE name = 'Participante'
);

-- Agregar campos a la plantilla "Participante"
INSERT INTO snies_template_fields (template_id, field_name, field_label, field_type, relation_table, relation_id_field, relation_display_field, field_order)
SELECT t.id, 'ID_TIPO_DOCUMENTO', 'Tipo de Documento', 'relation', 'snies_document_types', 'id', 'name', 1
FROM snies_report_templates t WHERE t.name = 'Participante'
AND NOT EXISTS (SELECT 1 FROM snies_template_fields WHERE template_id = t.id AND field_name = 'ID_TIPO_DOCUMENTO');

INSERT INTO snies_template_fields (template_id, field_name, field_label, field_type, field_order)
SELECT t.id, 'NUM_DOCUMENTO', 'Número de Documento', 'text', 2
FROM snies_report_templates t WHERE t.name = 'Participante'
AND NOT EXISTS (SELECT 1 FROM snies_template_fields WHERE template_id = t.id AND field_name = 'NUM_DOCUMENTO');

INSERT INTO snies_template_fields (template_id, field_name, field_label, field_type, field_order)
SELECT t.id, 'FECHA_EXPEDICION', 'Fecha de Expedición', 'text', 3
FROM snies_report_templates t WHERE t.name = 'Participante'
AND NOT EXISTS (SELECT 1 FROM snies_template_fields WHERE template_id = t.id AND field_name = 'FECHA_EXPEDICION');

INSERT INTO snies_template_fields (template_id, field_name, field_label, field_type, field_order)
SELECT t.id, 'PRIMER_NOMBRE', 'Primer Nombre', 'text', 4
FROM snies_report_templates t WHERE t.name = 'Participante'
AND NOT EXISTS (SELECT 1 FROM snies_template_fields WHERE template_id = t.id AND field_name = 'PRIMER_NOMBRE');

INSERT INTO snies_template_fields (template_id, field_name, field_label, field_type, field_order)
SELECT t.id, 'SEGUNDO_NOMBRE', 'Segundo Nombre', 'text', 5
FROM snies_report_templates t WHERE t.name = 'Participante'
AND NOT EXISTS (SELECT 1 FROM snies_template_fields WHERE template_id = t.id AND field_name = 'SEGUNDO_NOMBRE');

INSERT INTO snies_template_fields (template_id, field_name, field_label, field_type, field_order)
SELECT t.id, 'PRIMER_APELLIDO', 'Primer Apellido', 'text', 6
FROM snies_report_templates t WHERE t.name = 'Participante'
AND NOT EXISTS (SELECT 1 FROM snies_template_fields WHERE template_id = t.id AND field_name = 'PRIMER_APELLIDO');

INSERT INTO snies_template_fields (template_id, field_name, field_label, field_type, field_order)
SELECT t.id, 'SEGUNDO_APELLIDO', 'Segundo Apellido', 'text', 7
FROM snies_report_templates t WHERE t.name = 'Participante'
AND NOT EXISTS (SELECT 1 FROM snies_template_fields WHERE template_id = t.id AND field_name = 'SEGUNDO_APELLIDO');

INSERT INTO snies_template_fields (template_id, field_name, field_label, field_type, relation_table, relation_id_field, relation_display_field, field_order)
SELECT t.id, 'ID_SEXO_BIOLOGICO', 'Sexo Biológico', 'relation', 'snies_biological_sex', 'id', 'name', 8
FROM snies_report_templates t WHERE t.name = 'Participante'
AND NOT EXISTS (SELECT 1 FROM snies_template_fields WHERE template_id = t.id AND field_name = 'ID_SEXO_BIOLOGICO');

INSERT INTO snies_template_fields (template_id, field_name, field_label, field_type, relation_table, relation_id_field, relation_display_field, field_order)
SELECT t.id, 'ID_ESTADO_CIVIL', 'Estado Civil', 'relation', 'snies_marital_status', 'id', 'name', 9
FROM snies_report_templates t WHERE t.name = 'Participante'
AND NOT EXISTS (SELECT 1 FROM snies_template_fields WHERE template_id = t.id AND field_name = 'ID_ESTADO_CIVIL');

INSERT INTO snies_template_fields (template_id, field_name, field_label, field_type, field_order)
SELECT t.id, 'FECHA_NACIMIENTO', 'Fecha de Nacimiento', 'text', 10
FROM snies_report_templates t WHERE t.name = 'Participante'
AND NOT EXISTS (SELECT 1 FROM snies_template_fields WHERE template_id = t.id AND field_name = 'FECHA_NACIMIENTO');

INSERT INTO snies_template_fields (template_id, field_name, field_label, field_type, relation_table, relation_id_field, relation_display_field, field_order)
SELECT t.id, 'ID_PAIS', 'País', 'relation', 'snies_countries', 'id', 'name', 11
FROM snies_report_templates t WHERE t.name = 'Participante'
AND NOT EXISTS (SELECT 1 FROM snies_template_fields WHERE template_id = t.id AND field_name = 'ID_PAIS');

INSERT INTO snies_template_fields (template_id, field_name, field_label, field_type, relation_table, relation_id_field, relation_display_field, field_order)
SELECT t.id, 'ID_MUNICIPIO', 'Municipio', 'relation', 'snies_municipalities', 'id', 'name', 12
FROM snies_report_templates t WHERE t.name = 'Participante'
AND NOT EXISTS (SELECT 1 FROM snies_template_fields WHERE template_id = t.id AND field_name = 'ID_MUNICIPIO');

INSERT INTO snies_template_fields (template_id, field_name, field_label, field_type, field_order)
SELECT t.id, 'TELEFONO_CONTACTO', 'Teléfono de Contacto', 'text', 13
FROM snies_report_templates t WHERE t.name = 'Participante'
AND NOT EXISTS (SELECT 1 FROM snies_template_fields WHERE template_id = t.id AND field_name = 'TELEFONO_CONTACTO');

INSERT INTO snies_template_fields (template_id, field_name, field_label, field_type, field_order)
SELECT t.id, 'EMAIL_PERSONAL', 'Email Personal', 'text', 14
FROM snies_report_templates t WHERE t.name = 'Participante'
AND NOT EXISTS (SELECT 1 FROM snies_template_fields WHERE template_id = t.id AND field_name = 'EMAIL_PERSONAL');

INSERT INTO snies_template_fields (template_id, field_name, field_label, field_type, field_order)
SELECT t.id, 'EMAIL_INSTITUCIONAL', 'Email Institucional', 'text', 15
FROM snies_report_templates t WHERE t.name = 'Participante'
AND NOT EXISTS (SELECT 1 FROM snies_template_fields WHERE template_id = t.id AND field_name = 'EMAIL_INSTITUCIONAL');

INSERT INTO snies_template_fields (template_id, field_name, field_label, field_type, field_order)
SELECT t.id, 'DIRECCION_INSTITUCIONAL', 'Dirección Institucional', 'text', 16
FROM snies_report_templates t WHERE t.name = 'Participante'
AND NOT EXISTS (SELECT 1 FROM snies_template_fields WHERE template_id = t.id AND field_name = 'DIRECCION_INSTITUCIONAL');
