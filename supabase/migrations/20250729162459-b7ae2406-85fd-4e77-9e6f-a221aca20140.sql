-- Mejorar función para obtener detalles completos de planes pendientes
CREATE OR REPLACE FUNCTION public.get_complete_work_plan_details(plan_id uuid)
RETURNS TABLE(
  id uuid, 
  title text, 
  manager_id uuid, 
  plan_type_id uuid, 
  status text, 
  created_at timestamp with time zone, 
  updated_at timestamp with time zone, 
  submitted_date timestamp with time zone, 
  approved_date timestamp with time zone, 
  approved_by uuid, 
  approval_comments text,
  manager_name text, 
  manager_email text, 
  manager_position text, 
  manager_campus_id uuid,
  plan_type_name text, 
  total_hours_assigned bigint, 
  program_name text, 
  campus_name text, 
  faculty_name text, 
  objectives text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cp.id,
    cp.title,
    cp.manager_id,
    cp.plan_type_id,
    cp.status,
    cp.created_at,
    cp.updated_at,
    cp.submitted_date,
    cp.approved_date,
    cp.approved_by,
    cp.approval_comments,
    p.full_name as manager_name,
    p.email as manager_email,
    p.position as manager_position,
    p.campus_id as manager_campus_id,
    pt.name as plan_type_name,
    COALESCE(SUM(cpa.assigned_hours), 0) as total_hours_assigned,
    COALESCE((
      SELECT ap.name 
      FROM academic_programs ap 
      WHERE ap.campus_id = p.campus_id 
      LIMIT 1
    ), 'N/A') as program_name,
    COALESCE(c.name, 'N/A') as campus_name,
    COALESCE((
      SELECT f.name 
      FROM academic_programs ap2
      JOIN faculties f ON ap2.faculty_id = f.id
      WHERE ap2.campus_id = p.campus_id 
      LIMIT 1
    ), 'N/A') as faculty_name,
    COALESCE((
      SELECT cpr.response_value->>'text'
      FROM custom_plan_responses cpr
      JOIN plan_fields pf ON cpr.plan_field_id = pf.id
      WHERE cpr.custom_plan_id = cp.id 
      AND pf.field_type = 'textarea'
      AND pf.label ILIKE '%objetivo%'
      LIMIT 1
    ), '') as objectives
  FROM custom_plans cp
  LEFT JOIN profiles p ON cp.manager_id = p.id
  LEFT JOIN plan_types pt ON cp.plan_type_id = pt.id
  LEFT JOIN campus c ON p.campus_id = c.id
  LEFT JOIN custom_plan_assignments cpa ON cp.id = cpa.custom_plan_id
  WHERE cp.id = plan_id
  GROUP BY 
    cp.id, cp.title, cp.manager_id, cp.plan_type_id, cp.status, 
    cp.created_at, cp.updated_at, cp.submitted_date, cp.approved_date,
    cp.approved_by, cp.approval_comments, p.full_name, p.email, 
    p.position, p.campus_id, pt.name, c.name
  LIMIT 1;
END;
$$;

-- Función para notificar coordinadores de campus cuando un plan es aprobado
CREATE OR REPLACE FUNCTION public.notify_campus_coordinator_on_approval()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  coordinator_id uuid;
  manager_name text;
  plan_title text;
  campus_name text;
BEGIN
  -- Solo ejecutar cuando se aprueba un plan
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    -- Obtener datos del manager y campus
    SELECT 
      p.full_name,
      cp.title,
      c.name
    INTO manager_name, plan_title, campus_name
    FROM custom_plans cp
    JOIN profiles p ON cp.manager_id = p.id
    JOIN campus c ON p.campus_id = c.id
    WHERE cp.id = NEW.id;
    
    -- Buscar coordinador del campus
    SELECT p.id
    INTO coordinator_id
    FROM profiles p
    WHERE p.role = 'Coordinador' 
    AND (
      p.managed_campus_ids IS NULL OR 
      (SELECT c.id FROM custom_plans cp2 
       JOIN profiles p2 ON cp2.manager_id = p2.id 
       JOIN campus c ON p2.campus_id = c.id 
       WHERE cp2.id = NEW.id) = ANY(p.managed_campus_ids)
    )
    LIMIT 1;
    
    -- Crear notificación si se encontró coordinador
    IF coordinator_id IS NOT NULL THEN
      INSERT INTO notifications (
        user_id, 
        title, 
        message, 
        type, 
        related_entity_type, 
        related_entity_id
      )
      VALUES (
        coordinator_id,
        'Plan de Trabajo Aprobado',
        'El plan de trabajo "' || plan_title || '" del gestor ' || manager_name || ' en ' || campus_name || ' ha sido aprobado.',
        'approval',
        'custom_plan',
        NEW.id
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Crear trigger para notificaciones
DROP TRIGGER IF EXISTS notify_campus_coordinator_trigger ON custom_plans;
CREATE TRIGGER notify_campus_coordinator_trigger
  AFTER UPDATE ON custom_plans
  FOR EACH ROW
  EXECUTE FUNCTION notify_campus_coordinator_on_approval();