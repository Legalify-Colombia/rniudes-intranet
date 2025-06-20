
-- Agregar campo para definir el tipo de uso de ejes estratégicos, acciones y productos
ALTER TABLE strategic_axes 
ADD COLUMN usage_type text[] DEFAULT ARRAY['work_plan']::text[],
ADD COLUMN description text;

ALTER TABLE actions 
ADD COLUMN usage_type text[] DEFAULT ARRAY['work_plan']::text[],
ADD COLUMN description text;

ALTER TABLE products 
ADD COLUMN usage_type text[] DEFAULT ARRAY['work_plan']::text[],
ADD COLUMN description text;

-- Crear tabla para líneas específicas de internacionalización
CREATE TABLE public.specific_lines (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    description text,
    is_active boolean DEFAULT true,
    created_by uuid NOT NULL REFERENCES public.profiles(id),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Crear tabla para indicadores configurables
CREATE TABLE public.indicators (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    data_type text NOT NULL CHECK (data_type IN ('numeric', 'short_text', 'long_text', 'file', 'link')),
    is_active boolean DEFAULT true,
    created_by uuid NOT NULL REFERENCES public.profiles(id),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Crear tabla para proyectos de internacionalización
CREATE TABLE public.internationalization_projects (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    manager_id uuid NOT NULL REFERENCES public.profiles(id),
    program_id uuid NOT NULL REFERENCES public.academic_programs(id),
    -- Datos básicos del gestor y programa (se tomarán de relaciones)
    schedule_description text, -- horario destinado al proyecto
    
    -- Datos del proyecto
    project_title text NOT NULL,
    strategic_axis_id uuid REFERENCES public.strategic_axes(id),
    specific_line_id uuid REFERENCES public.specific_lines(id),
    duration_months integer,
    
    -- Resumen e introducción
    project_summary text CHECK (char_length(project_summary) BETWEEN 150 AND 200),
    introduction text CHECK (char_length(introduction) BETWEEN 250 AND 300),
    
    -- Objetivos
    general_objective text,
    specific_objectives text[],
    
    -- Implementación
    methodology text CHECK (char_length(methodology) <= 1000),
    activities_schedule text CHECK (char_length(activities_schedule) <= 1000),
    
    -- Resultados e impacto
    results text CHECK (char_length(results) BETWEEN 150 AND 500),
    indicators_text text CHECK (char_length(indicators_text) BETWEEN 150 AND 500),
    impact text CHECK (char_length(impact) BETWEEN 100 AND 800),
    
    -- Referencias
    bibliography text,
    
    -- Archivos
    participation_letter_url text, -- Carta de participación (obligatorio)
    participation_letter_name text,
    
    -- Estados
    status text DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'rejected')),
    submitted_date timestamp with time zone,
    approved_date timestamp with time zone,
    approved_by uuid REFERENCES public.profiles(id),
    approval_comments text,
    
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Crear tabla para instituciones aliadas del proyecto
CREATE TABLE public.project_partner_institutions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id uuid NOT NULL REFERENCES public.internationalization_projects(id) ON DELETE CASCADE,
    institution_name text NOT NULL,
    country text NOT NULL,
    contact_professor_name text NOT NULL,
    contact_professor_email text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

-- Crear tabla para informes de proyectos de internacionalización
CREATE TABLE public.internationalization_reports (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id uuid NOT NULL REFERENCES public.internationalization_projects(id),
    manager_id uuid NOT NULL REFERENCES public.profiles(id),
    report_period_id uuid NOT NULL REFERENCES public.report_periods(id),
    
    -- 2. Desarrollo del Proyecto
    objectives_achieved text CHECK (char_length(objectives_achieved) BETWEEN 100 AND 1000),
    activities_executed text CHECK (char_length(activities_executed) BETWEEN 100 AND 1000),
    activities_in_progress text CHECK (char_length(activities_in_progress) BETWEEN 100 AND 1000),
    
    -- 3. Avance del Proyecto
    project_timing text CHECK (project_timing IN ('ahead', 'on_time', 'delayed')),
    difficulties text[], -- Array de dificultades (cada una máximo 180 palabras)
    project_status text CHECK (project_status IN ('normal', 'abnormal')),
    abnormal_reason text CHECK (char_length(abnormal_reason) <= 250),
    
    status text DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'reviewed')),
    submitted_date timestamp with time zone,
    reviewed_date timestamp with time zone,
    reviewed_by uuid REFERENCES public.profiles(id),
    
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    UNIQUE(project_id, report_period_id)
);

-- Agregar campo para controlar edición de informes por fecha de período
ALTER TABLE manager_reports 
ADD COLUMN can_edit boolean DEFAULT true;

-- Habilitar RLS en nuevas tablas
ALTER TABLE public.specific_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internationalization_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_partner_institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internationalization_reports ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para specific_lines
CREATE POLICY "Users can view specific lines" ON public.specific_lines
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage specific lines" ON public.specific_lines
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role = 'Administrador'
        )
    );

-- Políticas RLS para indicators
CREATE POLICY "Users can view indicators" ON public.indicators
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage indicators" ON public.indicators
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role = 'Administrador'
        )
    );

-- Políticas RLS para internationalization_projects
CREATE POLICY "Managers can view their projects" ON public.internationalization_projects
    FOR SELECT USING (
        manager_id = auth.uid() 
        OR EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role IN ('Administrador', 'Coordinador')
        )
    );

CREATE POLICY "Managers can create projects" ON public.internationalization_projects
    FOR INSERT WITH CHECK (manager_id = auth.uid());

CREATE POLICY "Managers can update their projects" ON public.internationalization_projects
    FOR UPDATE USING (
        manager_id = auth.uid() 
        AND status IN ('draft', 'rejected')
    );

-- Políticas RLS para project_partner_institutions
CREATE POLICY "Access partner institutions via project" ON public.project_partner_institutions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.internationalization_projects ip
            WHERE ip.id = project_id 
            AND (
                ip.manager_id = auth.uid() 
                OR EXISTS (
                    SELECT 1 FROM public.profiles 
                    WHERE id = auth.uid() 
                    AND role IN ('Administrador', 'Coordinador')
                )
            )
        )
    );

-- Políticas RLS para internationalization_reports
CREATE POLICY "Managers can view their internationalization reports" ON public.internationalization_reports
    FOR SELECT USING (
        manager_id = auth.uid() 
        OR EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role IN ('Administrador', 'Coordinador')
        )
    );

CREATE POLICY "Managers can create internationalization reports" ON public.internationalization_reports
    FOR INSERT WITH CHECK (manager_id = auth.uid());

CREATE POLICY "Managers can update their internationalization reports" ON public.internationalization_reports
    FOR UPDATE USING (manager_id = auth.uid());

-- Crear índices para optimizar consultas
CREATE INDEX idx_specific_lines_active ON public.specific_lines(is_active);
CREATE INDEX idx_indicators_active ON public.indicators(is_active);
CREATE INDEX idx_internationalization_projects_manager ON public.internationalization_projects(manager_id);
CREATE INDEX idx_internationalization_projects_status ON public.internationalization_projects(status);
CREATE INDEX idx_project_partner_institutions_project ON public.project_partner_institutions(project_id);
CREATE INDEX idx_internationalization_reports_manager ON public.internationalization_reports(manager_id);
CREATE INDEX idx_internationalization_reports_period ON public.internationalization_reports(report_period_id);

-- Función para verificar si un período está activo
CREATE OR REPLACE FUNCTION public.is_period_active(period_id uuid)
RETURNS boolean
LANGUAGE plpgsql
AS $$
DECLARE
    period_end date;
BEGIN
    SELECT end_date INTO period_end
    FROM public.report_periods
    WHERE id = period_id AND is_active = true;
    
    RETURN period_end >= CURRENT_DATE;
END;
$$;

-- Trigger para actualizar can_edit basado en la fecha del período
CREATE OR REPLACE FUNCTION public.update_report_edit_permission()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.can_edit = CASE 
        WHEN NEW.report_period_id IS NOT NULL THEN 
            public.is_period_active(NEW.report_period_id)
        ELSE true 
    END;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_report_edit_permission
    BEFORE INSERT OR UPDATE ON manager_reports
    FOR EACH ROW
    EXECUTE FUNCTION update_report_edit_permission();
