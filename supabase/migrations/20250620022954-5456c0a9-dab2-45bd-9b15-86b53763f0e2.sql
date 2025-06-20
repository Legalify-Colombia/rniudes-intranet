
-- Crear tabla para los informes de gestores
CREATE TABLE public.manager_reports (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    manager_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    work_plan_id uuid NOT NULL REFERENCES public.work_plans(id) ON DELETE CASCADE,
    title text NOT NULL,
    description text,
    general_report_url text,
    general_report_file_name text,
    status text DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'reviewed')),
    submitted_date timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    UNIQUE(work_plan_id)
);

-- Crear tabla para las respuestas a productos específicos
CREATE TABLE public.product_responses (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    report_id uuid NOT NULL REFERENCES public.manager_reports(id) ON DELETE CASCADE,
    product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    response_text text,
    file_url text,
    file_name text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    UNIQUE(report_id, product_id)
);

-- Crear bucket para archivos de informes si no existe
INSERT INTO storage.buckets (id, name, public)
VALUES ('manager-reports', 'manager-reports', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de storage para manager-reports
CREATE POLICY "Usuarios autenticados pueden ver archivos" ON storage.objects
    FOR SELECT USING (bucket_id = 'manager-reports' AND auth.role() = 'authenticated');

CREATE POLICY "Gestores pueden subir archivos" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'manager-reports' 
        AND auth.role() = 'authenticated'
        AND EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role IN ('Gestor', 'Administrador', 'Coordinador')
        )
    );

CREATE POLICY "Gestores pueden actualizar sus archivos" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'manager-reports' 
        AND auth.role() = 'authenticated'
        AND EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role IN ('Gestor', 'Administrador', 'Coordinador')
        )
    );

CREATE POLICY "Gestores pueden eliminar sus archivos" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'manager-reports' 
        AND auth.role() = 'authenticated'
        AND EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role IN ('Gestor', 'Administrador', 'Coordinador')
        )
    );

-- Habilitar RLS en las nuevas tablas
ALTER TABLE public.manager_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_responses ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para manager_reports
CREATE POLICY "Gestores pueden ver sus informes" ON public.manager_reports
    FOR SELECT USING (
        manager_id = auth.uid() 
        OR EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role IN ('Administrador', 'Coordinador')
        )
    );

CREATE POLICY "Gestores pueden crear informes" ON public.manager_reports
    FOR INSERT WITH CHECK (
        manager_id = auth.uid() 
        AND EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role = 'Gestor'
        )
    );

CREATE POLICY "Gestores pueden actualizar sus informes" ON public.manager_reports
    FOR UPDATE USING (
        manager_id = auth.uid() 
        OR EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role IN ('Administrador', 'Coordinador')
        )
    );

-- Políticas RLS para product_responses
CREATE POLICY "Acceso a respuestas según permisos del informe" ON public.product_responses
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.manager_reports mr
            WHERE mr.id = product_responses.report_id
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
