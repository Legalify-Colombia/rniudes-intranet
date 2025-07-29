-- Crear tabla para campos de plantillas SNIES
CREATE TABLE IF NOT EXISTS public.snies_template_fields (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID NOT NULL REFERENCES public.snies_report_templates(id) ON DELETE CASCADE,
  field_name TEXT NOT NULL,
  field_label TEXT NOT NULL,
  field_type TEXT NOT NULL CHECK (field_type IN ('text', 'numeric', 'date', 'relation')),
  field_order INTEGER NOT NULL DEFAULT 0,
  is_required BOOLEAN NOT NULL DEFAULT false,
  relation_table TEXT,
  relation_id_field TEXT DEFAULT 'id',
  relation_display_field TEXT DEFAULT 'name',
  field_options JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.snies_template_fields ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Admins can manage template fields" ON public.snies_template_fields
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'Administrador'
    )
  );

CREATE POLICY "Everyone can view template fields" ON public.snies_template_fields
  FOR SELECT USING (true);

-- Índices para mejor rendimiento
CREATE INDEX idx_snies_template_fields_template_id ON public.snies_template_fields(template_id);
CREATE INDEX idx_snies_template_fields_order ON public.snies_template_fields(template_id, field_order);

-- Crear tabla para datos de reportes SNIES
CREATE TABLE IF NOT EXISTS public.snies_report_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  snies_report_id UUID NOT NULL REFERENCES public.snies_reports(id) ON DELETE CASCADE,
  participant_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.snies_report_data ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para datos de reportes
CREATE POLICY "Managers can access their report data" ON public.snies_report_data
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM snies_reports sr
      WHERE sr.id = snies_report_data.snies_report_id 
      AND (sr.manager_id = auth.uid() OR EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role IN ('Administrador', 'Coordinador')
      ))
    )
  );

-- Índices
CREATE INDEX idx_snies_report_data_report_id ON public.snies_report_data(snies_report_id);