
-- Primero habilitar RLS en la tabla snies_reports si no está habilitado
ALTER TABLE public.snies_reports ENABLE ROW LEVEL SECURITY;

-- Crear política para permitir a los gestores leer sus propios reportes (si no existe)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'snies_reports' 
        AND policyname = 'Allow gestores to read their own snies reports'
    ) THEN
        CREATE POLICY "Allow gestores to read their own snies reports" ON public.snies_reports
          FOR SELECT TO authenticated 
          USING (
            manager_id = auth.uid() 
            OR EXISTS (
              SELECT 1 FROM public.profiles 
              WHERE id = auth.uid() 
              AND role IN ('Administrador', 'Coordinador')
            )
          );
    END IF;
END
$$;

-- Crear política para permitir a los gestores actualizar sus propios reportes en borrador (si no existe)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'snies_reports' 
        AND policyname = 'Allow gestores to update their own draft snies reports'
    ) THEN
        CREATE POLICY "Allow gestores to update their own draft snies reports" ON public.snies_reports
          FOR UPDATE TO authenticated 
          USING (
            manager_id = auth.uid() 
            AND status = 'draft'
            AND EXISTS (
              SELECT 1 FROM public.profiles 
              WHERE id = auth.uid() 
              AND role = 'Gestor'
            )
          );
    END IF;
END
$$;

-- Habilitar RLS en snies_report_data y crear política (si no existe)
ALTER TABLE public.snies_report_data ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'snies_report_data' 
        AND policyname = 'Allow gestores to manage their report data'
    ) THEN
        CREATE POLICY "Allow gestores to manage their report data" ON public.snies_report_data
          FOR ALL TO authenticated 
          USING (
            EXISTS (
              SELECT 1 FROM public.snies_reports sr
              WHERE sr.id = report_id
              AND sr.manager_id = auth.uid()
            )
          );
    END IF;
END
$$;
