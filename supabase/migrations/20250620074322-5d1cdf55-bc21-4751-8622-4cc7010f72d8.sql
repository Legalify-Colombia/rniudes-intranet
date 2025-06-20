
-- Crear tabla para las plantillas de informe
CREATE TABLE public.report_templates (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    strategic_axis_id UUID REFERENCES public.strategic_axes(id),
    action_id UUID REFERENCES public.actions(id),
    product_id UUID REFERENCES public.products(id),
    sharepoint_base_url TEXT,
    max_versions INTEGER DEFAULT 4,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Crear tabla para las versiones de informe del gestor
CREATE TABLE public.manager_report_versions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    manager_report_id UUID REFERENCES public.manager_reports(id),
    template_id UUID REFERENCES public.report_templates(id),
    version_number INTEGER NOT NULL DEFAULT 1,
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    sharepoint_folder_url TEXT,
    evidence_links TEXT[], -- Array de links a documentos
    observations TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(manager_report_id, template_id, version_number)
);

-- Crear índices para mejorar rendimiento
CREATE INDEX idx_report_templates_strategic_axis ON public.report_templates(strategic_axis_id);
CREATE INDEX idx_report_templates_action ON public.report_templates(action_id);
CREATE INDEX idx_report_templates_product ON public.report_templates(product_id);
CREATE INDEX idx_manager_report_versions_report ON public.manager_report_versions(manager_report_id);
CREATE INDEX idx_manager_report_versions_template ON public.manager_report_versions(template_id);

-- Habilitar RLS en las nuevas tablas
ALTER TABLE public.report_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manager_report_versions ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para report_templates
CREATE POLICY "Users can view report templates" ON public.report_templates
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage report templates" ON public.report_templates
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role = 'Administrador'
        )
    );

-- Políticas RLS para manager_report_versions
CREATE POLICY "Managers can view their own report versions" ON public.manager_report_versions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.manager_reports mr
            WHERE mr.id = manager_report_id 
            AND mr.manager_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role IN ('Administrador', 'Coordinador')
        )
    );

CREATE POLICY "Managers can create their own report versions" ON public.manager_report_versions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.manager_reports mr
            WHERE mr.id = manager_report_id 
            AND mr.manager_id = auth.uid()
        )
    );

CREATE POLICY "Managers can update their own report versions" ON public.manager_report_versions
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.manager_reports mr
            WHERE mr.id = manager_report_id 
            AND mr.manager_id = auth.uid()
        )
    );

-- Función para obtener el siguiente número de versión
CREATE OR REPLACE FUNCTION public.get_next_version_number(
    p_manager_report_id UUID,
    p_template_id UUID
) RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    next_version INTEGER;
BEGIN
    SELECT COALESCE(MAX(version_number), 0) + 1
    INTO next_version
    FROM public.manager_report_versions
    WHERE manager_report_id = p_manager_report_id
    AND template_id = p_template_id;
    
    RETURN next_version;
END;
$$;
