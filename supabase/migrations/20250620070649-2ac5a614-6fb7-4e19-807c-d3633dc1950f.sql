
-- Crear tabla para configurar períodos de reportes
CREATE TABLE public.report_periods (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    description text,
    start_date date NOT NULL,
    end_date date NOT NULL,
    is_active boolean DEFAULT true,
    created_by uuid NOT NULL REFERENCES public.profiles(id),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Crear tabla para los informes de progreso de productos
CREATE TABLE public.product_progress_reports (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    manager_report_id uuid NOT NULL REFERENCES public.manager_reports(id) ON DELETE CASCADE,
    product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    work_plan_assignment_id uuid NOT NULL REFERENCES public.work_plan_assignments(id) ON DELETE CASCADE,
    progress_percentage integer NOT NULL DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    observations text,
    evidence_files text[], -- Array de URLs de archivos de evidencia
    evidence_file_names text[], -- Array de nombres de archivos
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    UNIQUE(manager_report_id, product_id)
);

-- Actualizar tabla manager_reports para incluir período de reporte
ALTER TABLE public.manager_reports 
ADD COLUMN IF NOT EXISTS report_period_id uuid REFERENCES public.report_periods(id),
ADD COLUMN IF NOT EXISTS total_progress_percentage numeric(5,2) DEFAULT 0.00;

-- Crear tabla de configuración del sistema de reportes
CREATE TABLE public.report_system_config (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    max_reports_per_period integer NOT NULL DEFAULT 4,
    reports_enabled boolean DEFAULT true,
    auto_calculate_progress boolean DEFAULT true,
    require_evidence boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Insertar configuración por defecto
INSERT INTO public.report_system_config (max_reports_per_period, reports_enabled) 
VALUES (4, true)
ON CONFLICT DO NOTHING;

-- Habilitar RLS en las nuevas tablas
ALTER TABLE public.report_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_progress_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_system_config ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para report_periods
CREATE POLICY "Todos pueden ver períodos activos" ON public.report_periods
    FOR SELECT USING (is_active = true OR EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND role IN ('Administrador', 'Coordinador')
    ));

CREATE POLICY "Solo admin puede crear períodos" ON public.report_periods
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role = 'Administrador'
        )
    );

CREATE POLICY "Solo admin puede actualizar períodos" ON public.report_periods
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role = 'Administrador'
        )
    );

-- Políticas RLS para product_progress_reports
CREATE POLICY "Acceso a reportes de progreso según permisos del informe" ON public.product_progress_reports
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.manager_reports mr
            WHERE mr.id = product_progress_reports.manager_report_id
            AND (
                mr.manager_id = auth.uid() 
                OR EXISTS (
                    SELECT 1 FROM public.profiles 
                    WHERE id = auth.uid() 
                    AND role IN ('Administrador', 'Coordinador')
                )
            )
        )
    );

-- Políticas RLS para report_system_config
CREATE POLICY "Todos pueden ver configuración" ON public.report_system_config
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "Solo admin puede modificar configuración" ON public.report_system_config
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role = 'Administrador'
        )
    );

-- Crear índices para optimizar consultas
CREATE INDEX idx_report_periods_active ON public.report_periods(is_active, start_date, end_date);
CREATE INDEX idx_product_progress_reports_manager_report ON public.product_progress_reports(manager_report_id);
CREATE INDEX idx_product_progress_reports_product ON public.product_progress_reports(product_id);
CREATE INDEX idx_manager_reports_period ON public.manager_reports(report_period_id);

-- Función para calcular el progreso total de un informe
CREATE OR REPLACE FUNCTION calculate_total_progress(report_id uuid)
RETURNS numeric AS $$
DECLARE
    total_progress numeric := 0;
    total_assignments integer := 0;
BEGIN
    SELECT 
        COALESCE(AVG(ppr.progress_percentage), 0),
        COUNT(*)
    INTO total_progress, total_assignments
    FROM product_progress_reports ppr
    WHERE ppr.manager_report_id = report_id;
    
    RETURN COALESCE(total_progress, 0);
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar automáticamente el progreso total
CREATE OR REPLACE FUNCTION update_total_progress_trigger()
RETURNS trigger AS $$
BEGIN
    UPDATE manager_reports 
    SET 
        total_progress_percentage = calculate_total_progress(
            CASE 
                WHEN TG_OP = 'DELETE' THEN OLD.manager_report_id
                ELSE NEW.manager_report_id
            END
        ),
        updated_at = now()
    WHERE id = CASE 
        WHEN TG_OP = 'DELETE' THEN OLD.manager_report_id
        ELSE NEW.manager_report_id
    END;
    
    RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_total_progress
    AFTER INSERT OR UPDATE OR DELETE ON product_progress_reports
    FOR EACH ROW
    EXECUTE FUNCTION update_total_progress_trigger();
