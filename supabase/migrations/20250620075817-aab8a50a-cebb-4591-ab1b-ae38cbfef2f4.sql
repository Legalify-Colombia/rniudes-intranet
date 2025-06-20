
-- Agregar columnas faltantes a la tabla report_templates para soportar múltiples elementos
ALTER TABLE report_templates 
ADD COLUMN IF NOT EXISTS strategic_axes_ids TEXT[],
ADD COLUMN IF NOT EXISTS actions_ids TEXT[],
ADD COLUMN IF NOT EXISTS products_ids TEXT[];

-- Crear tabla para plantillas de documentos PDF/DOC
CREATE TABLE IF NOT EXISTS document_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  template_type TEXT NOT NULL CHECK (template_type IN ('pdf', 'doc')),
  template_content TEXT NOT NULL, -- Contenido de la plantilla con placeholders
  file_url TEXT, -- URL del archivo original si se sube
  file_name TEXT,
  is_active BOOLEAN DEFAULT true,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS en document_templates
ALTER TABLE document_templates ENABLE ROW LEVEL SECURITY;

-- Políticas para document_templates
CREATE POLICY "Users can view document templates" 
  ON document_templates 
  FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can create document templates" 
  ON document_templates 
  FOR INSERT 
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own document templates" 
  ON document_templates 
  FOR UPDATE 
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own document templates" 
  ON document_templates 
  FOR DELETE 
  USING (auth.uid() = created_by);

-- Crear tabla para mapear plantillas de documentos con plantillas de informes
CREATE TABLE IF NOT EXISTS report_document_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  report_template_id UUID REFERENCES report_templates(id) ON DELETE CASCADE,
  document_template_id UUID REFERENCES document_templates(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(report_template_id, document_template_id)
);

-- Habilitar RLS en report_document_templates
ALTER TABLE report_document_templates ENABLE ROW LEVEL SECURITY;

-- Políticas para report_document_templates
CREATE POLICY "Users can view report document templates" 
  ON report_document_templates 
  FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can manage report document templates" 
  ON report_document_templates 
  FOR ALL 
  USING (auth.uid() IS NOT NULL);
