
-- Crear tabla para reportes de indicadores
CREATE TABLE public.indicator_reports (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    manager_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    report_period_id UUID NOT NULL REFERENCES public.report_periods(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'reviewed')),
    submitted_date TIMESTAMP WITH TIME ZONE,
    reviewed_date TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(manager_id, report_period_id)
);

-- Crear tabla para las respuestas a indicadores específicos
CREATE TABLE public.indicator_responses (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    indicator_report_id UUID NOT NULL REFERENCES public.indicator_reports(id) ON DELETE CASCADE,
    indicator_id UUID NOT NULL REFERENCES public.indicators(id) ON DELETE CASCADE,
    numeric_value NUMERIC,
    text_value TEXT,
    file_url TEXT,
    file_name TEXT,
    link_value TEXT,
    observations TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(indicator_report_id, indicator_id)
);

-- Habilitar RLS en las nuevas tablas
ALTER TABLE public.indicator_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.indicator_responses ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para indicator_reports
CREATE POLICY "Gestores pueden ver sus reportes de indicadores" ON public.indicator_reports
    FOR SELECT USING (
        manager_id = auth.uid() 
        OR EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role IN ('Administrador', 'Coordinador')
        )
    );

CREATE POLICY "Gestores pueden crear reportes de indicadores" ON public.indicator_reports
    FOR INSERT WITH CHECK (
        manager_id = auth.uid() 
        AND EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role = 'Gestor'
        )
    );

CREATE POLICY "Gestores pueden actualizar sus reportes de indicadores" ON public.indicator_reports
    FOR UPDATE USING (
        manager_id = auth.uid() 
        OR EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role IN ('Administrador', 'Coordinador')
        )
    );

-- Políticas RLS para indicator_responses
CREATE POLICY "Acceso a respuestas de indicadores según permisos del reporte" ON public.indicator_responses
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.indicator_reports ir
            WHERE ir.id = indicator_responses.indicator_report_id
            AND (
                ir.manager_id = auth.uid() 
                OR EXISTS (
                    SELECT 1 FROM public.profiles 
                    WHERE id = auth.uid() 
                    AND role IN ('Administrador', 'Coordinador')
                )
            )
        )
    );

-- Crear vista unificada para todos los tipos de informes
CREATE OR REPLACE VIEW public.unified_reports AS
SELECT 
    'work_plan' as report_type,
    mr.id,
    mr.manager_id,
    mr.title,
    mr.description,
    mr.status,
    mr.submitted_date,
    mr.created_at,
    mr.updated_at,
    null as report_period_id,
    'Informe Plan de Trabajo' as type_display_name
FROM public.manager_reports mr

UNION ALL

SELECT 
    'template' as report_type,
    tbr.id,
    tbr.manager_id,
    tbr.title,
    tbr.description,
    tbr.status,
    tbr.submitted_date,
    tbr.created_at,
    tbr.updated_at,
    tbr.report_period_id,
    'Informe por Plantilla' as type_display_name
FROM public.template_based_reports tbr

UNION ALL

SELECT 
    'indicators' as report_type,
    ir.id,
    ir.manager_id,
    ir.title,
    ir.description,
    ir.status,
    ir.submitted_date,
    ir.created_at,
    ir.updated_at,
    ir.report_period_id,
    'Informe de Indicadores' as type_display_name
FROM public.indicator_reports ir;

-- Crear índices para optimizar consultas
CREATE INDEX idx_indicator_reports_manager ON public.indicator_reports(manager_id);
CREATE INDEX idx_indicator_reports_period ON public.indicator_reports(report_period_id);
CREATE INDEX idx_indicator_responses_report ON public.indicator_responses(indicator_report_id);
CREATE INDEX idx_indicator_responses_indicator ON public.indicator_responses(indicator_id);
