
-- Crear tabla para los informes basados en plantillas
CREATE TABLE public.template_based_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    manager_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    report_template_id UUID NOT NULL REFERENCES public.report_templates(id) ON DELETE CASCADE,
    report_period_id UUID NOT NULL REFERENCES public.report_periods(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'reviewed')),
    submitted_date TIMESTAMP WITH TIME ZONE,
    reviewed_date TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    -- Un gestor solo puede crear un informe por plantilla por período
    UNIQUE(manager_id, report_template_id, report_period_id)
);

-- Crear tabla para las respuestas de los informes basados en plantillas
CREATE TABLE public.template_report_responses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    template_report_id UUID NOT NULL REFERENCES public.template_based_reports(id) ON DELETE CASCADE,
    strategic_axis_id UUID REFERENCES public.strategic_axes(id),
    action_id UUID REFERENCES public.actions(id),
    product_id UUID REFERENCES public.products(id),
    response_text TEXT,
    evidence_files TEXT[], -- Array de URLs de archivos
    evidence_file_names TEXT[], -- Array de nombres de archivos
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    observations TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS en las nuevas tablas
ALTER TABLE public.template_based_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_report_responses ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para template_based_reports
CREATE POLICY "Gestores pueden ver sus informes de plantillas" ON public.template_based_reports
    FOR SELECT USING (
        manager_id = auth.uid() 
        OR EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role IN ('Administrador', 'Coordinador')
        )
    );

CREATE POLICY "Gestores pueden crear informes de plantillas" ON public.template_based_reports
    FOR INSERT WITH CHECK (
        manager_id = auth.uid() 
        AND EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role = 'Gestor'
        )
    );

CREATE POLICY "Gestores pueden actualizar sus informes de plantillas" ON public.template_based_reports
    FOR UPDATE USING (
        manager_id = auth.uid() 
        OR EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role IN ('Administrador', 'Coordinador')
        )
    );

CREATE POLICY "Administradores pueden eliminar informes de plantillas" ON public.template_based_reports
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role IN ('Administrador', 'Coordinador')
        )
    );

-- Políticas RLS para template_report_responses
CREATE POLICY "Acceso a respuestas según permisos del informe de plantilla" ON public.template_report_responses
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.template_based_reports tbr
            WHERE tbr.id = template_report_responses.template_report_id
            AND (
                tbr.manager_id = auth.uid() 
                OR EXISTS (
                    SELECT 1 FROM public.profiles 
                    WHERE id = auth.uid() 
                    AND role IN ('Administrador', 'Coordinador')
                )
            )
        )
    );

-- Crear índices para mejorar rendimiento
CREATE INDEX idx_template_based_reports_manager ON public.template_based_reports(manager_id);
CREATE INDEX idx_template_based_reports_template ON public.template_based_reports(report_template_id);
CREATE INDEX idx_template_based_reports_period ON public.template_based_reports(report_period_id);
CREATE INDEX idx_template_report_responses_report ON public.template_report_responses(template_report_id);

-- Crear vista para obtener informes de plantillas con información completa
CREATE OR REPLACE VIEW template_based_reports_with_details AS
SELECT 
    tbr.*,
    p.full_name as manager_name,
    p.email as manager_email,
    rt.name as template_name,
    rt.description as template_description,
    rp.name as period_name,
    rp.start_date as period_start,
    rp.end_date as period_end,
    reviewer.full_name as reviewed_by_name
FROM template_based_reports tbr
LEFT JOIN profiles p ON tbr.manager_id = p.id
LEFT JOIN report_templates rt ON tbr.report_template_id = rt.id
LEFT JOIN report_periods rp ON tbr.report_period_id = rp.id
LEFT JOIN profiles reviewer ON tbr.reviewed_by = reviewer.id;
