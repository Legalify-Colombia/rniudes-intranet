
-- Crear el tipo work_plan_status si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'work_plan_status') THEN
        CREATE TYPE work_plan_status AS ENUM ('draft', 'submitted', 'pending', 'approved', 'rejected');
    END IF;
END $$;

-- Actualizar la tabla work_plans para incluir campos de aprobación
ALTER TABLE work_plans 
ADD COLUMN IF NOT EXISTS approval_comments TEXT,
ADD COLUMN IF NOT EXISTS approved_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS submitted_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS objectives TEXT;

-- Crear vista para obtener planes de trabajo con información del gestor
CREATE OR REPLACE VIEW work_plans_with_manager AS
SELECT 
    wp.*,
    p.full_name as manager_name,
    p.email as manager_email,
    p.position as manager_position,
    ap.name as program_name,
    c.name as campus_name,
    f.name as faculty_name
FROM work_plans wp
LEFT JOIN profiles p ON wp.manager_id = p.id
LEFT JOIN academic_programs ap ON wp.program_id = ap.id
LEFT JOIN campus c ON ap.campus_id = c.id
LEFT JOIN faculties f ON ap.faculty_id = f.id;
