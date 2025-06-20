
-- Agregar la clave foránea faltante entre snies_reports y profiles
ALTER TABLE public.snies_reports 
ADD CONSTRAINT snies_reports_manager_id_fkey 
FOREIGN KEY (manager_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Verificar que la clave foránea para template_id existe, si no, crearla
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'snies_reports_template_id_fkey' 
        AND table_name = 'snies_reports'
    ) THEN
        ALTER TABLE public.snies_reports 
        ADD CONSTRAINT snies_reports_template_id_fkey 
        FOREIGN KEY (template_id) REFERENCES public.snies_report_templates(id) ON DELETE CASCADE;
    END IF;
END
$$;
