
-- Primero verificar si existe el tipo field_type y crearlo si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'field_type') THEN
        CREATE TYPE field_type AS ENUM (
            'numeric', 
            'short_text', 
            'long_text', 
            'dropdown', 
            'file'
        );
    END IF;
END $$;

-- Ahora agregar los nuevos valores al enum existente
ALTER TYPE field_type ADD VALUE IF NOT EXISTS 'section';
ALTER TYPE field_type ADD VALUE IF NOT EXISTS 'manager_name';
ALTER TYPE field_type ADD VALUE IF NOT EXISTS 'campus_name';
ALTER TYPE field_type ADD VALUE IF NOT EXISTS 'program_director';
ALTER TYPE field_type ADD VALUE IF NOT EXISTS 'strategic_axes';

-- Agregar columnas para configuración de visibilidad por horas
ALTER TABLE plan_types ADD COLUMN IF NOT EXISTS min_weekly_hours INTEGER DEFAULT 0;
ALTER TABLE plan_types ADD COLUMN IF NOT EXISTS max_weekly_hours INTEGER DEFAULT NULL;
ALTER TABLE plan_types ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT true;

-- Agregar índice para optimizar consultas por horas (solo si no existe)
CREATE INDEX IF NOT EXISTS idx_plan_types_hours ON plan_types(min_weekly_hours, max_weekly_hours);

-- Función para obtener tipos de plan según horas del gestor
CREATE OR REPLACE FUNCTION get_available_plan_types_for_manager(manager_profile_id UUID)
RETURNS TABLE (
    id UUID,
    name TEXT,
    description TEXT,
    min_weekly_hours INTEGER,
    max_weekly_hours INTEGER,
    field_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pt.id,
        pt.name,
        pt.description,
        pt.min_weekly_hours,
        pt.max_weekly_hours,
        COUNT(pf.id) as field_count
    FROM plan_types pt
    LEFT JOIN plan_fields pf ON pt.id = pf.plan_type_id
    WHERE pt.is_active = true 
    AND pt.is_visible = true
    AND (
        pt.min_weekly_hours IS NULL 
        OR pt.min_weekly_hours <= COALESCE((
            SELECT weekly_hours 
            FROM profiles 
            WHERE id = manager_profile_id
        ), 0)
    )
    AND (
        pt.max_weekly_hours IS NULL 
        OR pt.max_weekly_hours > COALESCE((
            SELECT weekly_hours 
            FROM profiles 
            WHERE id = manager_profile_id
        ), 0)
    )
    GROUP BY pt.id, pt.name, pt.description, pt.min_weekly_hours, pt.max_weekly_hours
    ORDER BY pt.name;
END;
$$ LANGUAGE plpgsql;
