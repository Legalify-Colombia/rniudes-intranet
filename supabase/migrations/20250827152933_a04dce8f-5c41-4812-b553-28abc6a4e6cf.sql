-- Primero, eliminar triggers duplicados y funciones obsoletas
DROP TRIGGER IF EXISTS trg_notify_custom_plan_submitted ON custom_plans;
DROP TRIGGER IF EXISTS notify_custom_plan_submitted_trigger ON custom_plans;

-- Eliminar función obsoleta
DROP FUNCTION IF EXISTS notify_program_director_plan_submitted();

-- Recrear función mejorada para notificar al director específico del programa
CREATE OR REPLACE FUNCTION public.notify_custom_plan_submitted()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  manager_data record;
  program_data record;
  director_email_to_use text;
  director_name_to_use text;
BEGIN
  -- Solo proceder si el estado cambió a 'submitted'
  IF NEW.status = 'submitted' AND (OLD.status IS NULL OR OLD.status <> 'submitted') THEN
    
    -- Obtener información del gestor y plan
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

    -- Log para debugging
    RAISE LOG 'Processing plan submission for plan %, manager %', NEW.id, manager_data.manager_name;

    -- Buscar programa académico específico del gestor con sus datos de director
    SELECT 
      ap.id as program_id, 
      ap.coordinador_id, 
      ap.name as program_name,
      ap.director_email,
      ap.director_name
    INTO program_data
    FROM academic_programs ap
    WHERE ap.manager_id = NEW.manager_id
    LIMIT 1;

    IF program_data.program_id IS NOT NULL THEN
      -- Intentar usar el director específico del programa (coordinador_id primero)
      IF program_data.coordinador_id IS NOT NULL THEN
        SELECT email, full_name
        INTO director_email_to_use, director_name_to_use
        FROM profiles
        WHERE id = program_data.coordinador_id
        AND email IS NOT NULL AND email != '';
        
        RAISE LOG 'Found program director from profiles: % (%)' , director_name_to_use, director_email_to_use;
      END IF;

      -- Si no hay coordinador_id válido, usar director_email de la tabla de programas
      IF director_email_to_use IS NULL OR director_email_to_use = '' THEN
        IF program_data.director_email IS NOT NULL AND program_data.director_email != '' THEN
          director_email_to_use := program_data.director_email;
          director_name_to_use := COALESCE(program_data.director_name, 'Director del Programa');
          
          RAISE LOG 'Using program director email from academic_programs table: % (%)' , director_name_to_use, director_email_to_use;
        END IF;
      END IF;

      -- Si tenemos un director válido, enviar la notificación
      IF director_email_to_use IS NOT NULL AND director_email_to_use != '' THEN
        BEGIN
          PERFORM net.http_post(
            url := 'https://fdfovqfvisrtzdtkgcdj.supabase.co/functions/v1/send-email-notification',
            headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.service_role_key', true) || '"}'::jsonb,
            body := json_build_object(
              'templateType', 'plan_submitted',
              'recipientEmails', ARRAY[director_email_to_use],
              'variables', json_build_object(
                'manager_name', COALESCE(manager_data.manager_name, 'Usuario'),
                'plan_title', COALESCE(NEW.title, 'Plan de trabajo'),
                'plan_type_name', COALESCE(manager_data.plan_type_name, 'Tipo de plan'),
                'campus_name', COALESCE(manager_data.campus_name, 'Campus'),
                'program_name', COALESCE(program_data.program_name, 'Programa'),
                'director_name', COALESCE(director_name_to_use, 'Director'),
                'submitted_date', COALESCE(NEW.submitted_date::text, NOW()::text)
              ),
              'campusId', manager_data.campus_id,
              'relatedEntityType', 'custom_plan',
              'relatedEntityId', NEW.id::text
            )::jsonb
          );
          RAISE LOG 'Email sent successfully to program director: % (%) for program: %', director_name_to_use, director_email_to_use, program_data.program_name;
          RETURN NEW;
        EXCEPTION WHEN OTHERS THEN
          RAISE LOG 'Failed to send email to program director % (%): %', director_name_to_use, director_email_to_use, SQLERRM;
        END;
      ELSE
        RAISE LOG 'No valid director email found for program: %', program_data.program_name;
      END IF;
    ELSE
      RAISE LOG 'No academic program found for manager: %', NEW.manager_id;
    END IF;

    -- Si no se pudo enviar al director del programa, usar fallback a coordinadores de campus
    DECLARE
      coordinator_data record;
    BEGIN
      FOR coordinator_data IN 
        SELECT coordinator_id, coordinator_email, coordinator_name
        FROM get_campus_coordinators(manager_data.campus_id)
        WHERE coordinator_email IS NOT NULL AND coordinator_email != ''
        LIMIT 2
      LOOP
        BEGIN
          PERFORM net.http_post(
            url := 'https://fdfovqfvisrtzdtkgcdj.supabase.co/functions/v1/send-email-notification',
            headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.service_role_key', true) || '"}'::jsonb,
            body := json_build_object(
              'templateType', 'plan_submitted',
              'recipientEmails', ARRAY[coordinator_data.coordinator_email],
              'variables', json_build_object(
                'manager_name', COALESCE(manager_data.manager_name, 'Usuario'),
                'plan_title', COALESCE(NEW.title, 'Plan de trabajo'),
                'plan_type_name', COALESCE(manager_data.plan_type_name, 'Tipo de plan'),
                'campus_name', COALESCE(manager_data.campus_name, 'Campus'),
                'program_name', COALESCE(program_data.program_name, 'Programa no específico'),
                'director_name', COALESCE(coordinator_data.coordinator_name, 'Coordinador'),
                'submitted_date', COALESCE(NEW.submitted_date::text, NOW()::text)
              ),
              'campusId', manager_data.campus_id,
              'relatedEntityType', 'custom_plan',
              'relatedEntityId', NEW.id::text
            )::jsonb
          );
          RAISE LOG 'Fallback: Email sent to campus coordinator: %', coordinator_data.coordinator_email;
          RETURN NEW;
        EXCEPTION WHEN OTHERS THEN
          RAISE LOG 'Failed to send email to campus coordinator %: %', coordinator_data.coordinator_email, SQLERRM;
          CONTINUE;
        END;
      END LOOP;
    END;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Crear el trigger
CREATE TRIGGER notify_custom_plan_submitted_trigger
    AFTER UPDATE ON custom_plans
    FOR EACH ROW
    EXECUTE FUNCTION notify_custom_plan_submitted();

-- Actualizar la plantilla de email para incluir más variables
UPDATE email_templates 
SET html_content = '<h1>Plan de Trabajo Presentado</h1>
   <p>Estimado/a {{director_name}},</p>
   <p>El gestor <strong>{{manager_name}}</strong> ha presentado un nuevo plan de trabajo del programa <strong>{{program_name}}</strong>:</p>
   <ul>
     <li><strong>Título:</strong> {{plan_title}}</li>
     <li><strong>Tipo de Plan:</strong> {{plan_type_name}}</li>
     <li><strong>Campus:</strong> {{campus_name}}</li>
     <li><strong>Programa:</strong> {{program_name}}</li>
     <li><strong>Fecha de Presentación:</strong> {{submitted_date}}</li>
   </ul>
   <p>Por favor, revise el plan en el sistema para proceder con la evaluación correspondiente.</p>
   <p>Saludos cordiales,<br>Sistema de Gestión Universitaria</p>',
    variables = '["manager_name", "plan_title", "plan_type_name", "campus_name", "program_name", "director_name", "submitted_date"]'::jsonb,
    subject = 'Nuevo Plan de Trabajo Presentado - {{program_name}} - {{plan_title}}'
WHERE template_type = 'plan_submitted';