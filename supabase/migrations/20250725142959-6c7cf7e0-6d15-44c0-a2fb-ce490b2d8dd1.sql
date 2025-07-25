-- Crear función para obtener planes pendientes con detalles completos
CREATE OR REPLACE FUNCTION public.get_pending_work_plans_with_details()
RETURNS TABLE (
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
  SELECT DISTINCT
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
  WHERE cp.status = 'submitted'
  GROUP BY 
    cp.id, cp.title, cp.manager_id, cp.plan_type_id, cp.status, 
    cp.created_at, cp.updated_at, cp.submitted_date, cp.approved_date,
    cp.approved_by, cp.approval_comments, p.full_name, p.email, 
    p.position, pt.name, c.name, p.campus_id
  ORDER BY cp.submitted_date DESC;
END;
$$;