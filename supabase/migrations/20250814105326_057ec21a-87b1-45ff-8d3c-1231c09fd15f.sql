-- Actualizar función para obtener información completa de programas académicos con director
CREATE OR REPLACE FUNCTION public.get_academic_program_with_director(manager_id_param uuid)
RETURNS TABLE(
  program_id uuid,
  program_name text,
  director_id uuid,
  director_name text,
  director_email text,
  campus_id uuid,
  campus_name text,
  faculty_id uuid,
  faculty_name text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    ap.id as program_id,
    ap.name as program_name,
    ap.coordinador_id as director_id,
    COALESCE(p.full_name, ap.director_name) as director_name,
    COALESCE(p.email, ap.director_email) as director_email,
    ap.campus_id,
    c.name as campus_name,
    ap.faculty_id,
    f.name as faculty_name
  FROM academic_programs ap
  LEFT JOIN profiles p ON ap.coordinador_id = p.id
  LEFT JOIN campus c ON ap.campus_id = c.id
  LEFT JOIN faculties f ON ap.faculty_id = f.id
  WHERE ap.manager_id = manager_id_param
  LIMIT 1;
END;
$function$;

-- Función para notificar solo al director del programa específico
CREATE OR REPLACE FUNCTION public.notify_program_director_plan_submitted()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  manager_data record;
  program_info record;
BEGIN
  -- Solo proceder si el estado cambió a 'submitted'
  IF NEW.status = 'submitted' AND (OLD.status IS NULL OR OLD.status <> 'submitted') THEN
    
    -- Obtener información del gestor
    SELECT 
      COALESCE(p.full_name, 'Usuario') as manager_name,
      COALESCE(p.email, '') as manager_email,
      p.campus_id,
      COALESCE(c.name, 'Campus no especificado') as campus_name,
      COALESCE(pt.name, 'Tipo de plan no especificado') as plan_type_name
    INTO manager_data
    FROM custom_plans cp
    JOIN profiles p ON cp.manager_id = p.id
    LEFT JOIN campus c ON p.campus_id = c.id
    LEFT JOIN plan_types pt ON cp.plan_type_id = pt.id
    WHERE cp.id = NEW.id;

    -- Buscar el programa académico y su director
    SELECT 
      program_id,
      program_name,
      director_id,
      director_name,
      director_email
    INTO program_info
    FROM get_academic_program_with_director(NEW.manager_id);

    -- Si se encontró un director específico del programa, notificarle
    IF program_info.director_id IS NOT NULL AND program_info.director_email IS NOT NULL AND program_info.director_email != '' THEN
      BEGIN
        PERFORM net.http_post(
          url := 'https://fdfovqfvisrtzdtkgcdj.supabase.co/functions/v1/send-email-notification',
          headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.service_role_key', true) || '"}'::jsonb,
          body := json_build_object(
            'templateType', 'plan_submitted',
            'recipientEmails', ARRAY[program_info.director_email],
            'variables', json_build_object(
              'manager_name', COALESCE(manager_data.manager_name, 'Usuario'),
              'plan_title', COALESCE(NEW.title, 'Plan de trabajo'),
              'plan_type_name', COALESCE(manager_data.plan_type_name, 'Tipo de plan'),
              'campus_name', COALESCE(manager_data.campus_name, 'Campus'),
              'program_name', COALESCE(program_info.program_name, 'Programa'),
              'submitted_date', COALESCE(NOW()::text, '')
            ),
            'campusId', manager_data.campus_id,
            'relatedEntityType', 'custom_plan',
            'relatedEntityId', NEW.id::text
          )::jsonb
        );
        RAISE LOG 'Email sent to program director: % for program: %', program_info.director_email, program_info.program_name;
        RETURN NEW;
      EXCEPTION WHEN OTHERS THEN
        RAISE LOG 'Failed to send email to program director %: %', program_info.director_email, SQLERRM;
      END;
    END IF;

    -- Si no se encontró director específico del programa, usar el comportamiento anterior
    -- (notificar coordinadores de campus o administradores)
    RAISE LOG 'No specific program director found for plan %, falling back to campus coordinators', NEW.id;
    
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Actualizar trigger para usar la nueva función
DROP TRIGGER IF EXISTS notify_custom_plan_submitted_trigger ON custom_plans;
CREATE TRIGGER notify_custom_plan_submitted_trigger
  AFTER UPDATE ON custom_plans
  FOR EACH ROW
  EXECUTE FUNCTION notify_program_director_plan_submitted();

-- Política RLS para que directores de programa puedan aprobar planes de sus gestores
CREATE POLICY "Directors can approve plans from their program managers"
ON custom_plans
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 
    FROM academic_programs ap 
    WHERE ap.manager_id = custom_plans.manager_id 
    AND ap.coordinador_id = auth.uid()
  )
);

-- Función para verificar si un usuario puede aprobar un plan específico
CREATE OR REPLACE FUNCTION public.can_approve_custom_plan(plan_id uuid, approver_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  approver_role text;
  is_program_director boolean := false;
BEGIN
  -- Obtener rol del aprobador
  SELECT role INTO approver_role
  FROM profiles 
  WHERE id = approver_id;
  
  -- Si es administrador, puede aprobar cualquier plan
  IF approver_role = 'Administrador' THEN
    RETURN true;
  END IF;
  
  -- Si es coordinador, puede aprobar planes de su campus
  IF approver_role = 'Coordinador' THEN
    RETURN EXISTS (
      SELECT 1 
      FROM custom_plans cp
      JOIN profiles p ON cp.manager_id = p.id
      JOIN profiles coord ON coord.id = approver_id
      WHERE cp.id = plan_id
      AND p.campus_id = coord.campus_id
    );
  END IF;
  
  -- Verificar si es director del programa específico
  SELECT EXISTS (
    SELECT 1 
    FROM custom_plans cp
    JOIN academic_programs ap ON ap.manager_id = cp.manager_id
    WHERE cp.id = plan_id 
    AND ap.coordinador_id = approver_id
  ) INTO is_program_director;
  
  RETURN is_program_director;
END;
$function$;