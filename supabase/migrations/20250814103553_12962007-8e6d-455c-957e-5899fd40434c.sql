-- Drop and recreate the notify_custom_plan_submitted function with proper NULL handling
DROP FUNCTION IF EXISTS public.notify_custom_plan_submitted();

CREATE OR REPLACE FUNCTION public.notify_custom_plan_submitted()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  manager_data record;
  program_data record;
  director_profile record;
  coordinator_data record;
  admin_data record;
BEGIN
  -- Only proceed if status changed to 'submitted'
  IF NEW.status = 'submitted' AND (OLD.status IS NULL OR OLD.status <> 'submitted') THEN
    
    -- Get manager and plan info with proper NULL handling
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

    -- Skip if no manager data found
    IF manager_data IS NULL THEN
      RAISE LOG 'No manager data found for custom plan %', NEW.id;
      RETURN NEW;
    END IF;

    -- Try to find academic program and its coordinator
    SELECT ap.id as program_id, ap.coordinador_id
    INTO program_data
    FROM academic_programs ap
    WHERE ap.manager_id = NEW.manager_id
    LIMIT 1;

    -- Try to notify program coordinator first
    IF program_data.coordinador_id IS NOT NULL THEN
      SELECT id, email, full_name
      INTO director_profile
      FROM profiles
      WHERE id = program_data.coordinador_id;

      IF director_profile.email IS NOT NULL AND director_profile.email != '' THEN
        BEGIN
          PERFORM net.http_post(
            url := 'https://fdfovqfvisrtzdtkgcdj.supabase.co/functions/v1/send-email-notification',
            headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.service_role_key', true) || '"}'::jsonb,
            body := json_build_object(
              'templateType', 'plan_submitted',
              'recipientEmails', ARRAY[director_profile.email],
              'variables', json_build_object(
                'manager_name', COALESCE(manager_data.manager_name, 'Usuario'),
                'plan_title', COALESCE(NEW.title, 'Plan de trabajo'),
                'plan_type_name', COALESCE(manager_data.plan_type_name, 'Tipo de plan'),
                'campus_name', COALESCE(manager_data.campus_name, 'Campus'),
                'submitted_date', COALESCE(NOW()::text, '')
              ),
              'campusId', manager_data.campus_id,
              'relatedEntityType', 'custom_plan',
              'relatedEntityId', NEW.id::text
            )::jsonb
          );
          RAISE LOG 'Email sent to program coordinator: %', director_profile.email;
          RETURN NEW;
        EXCEPTION WHEN OTHERS THEN
          RAISE LOG 'Failed to send email to program coordinator %: %', director_profile.email, SQLERRM;
        END;
      END IF;
    END IF;

    -- Fallback: Try to notify campus coordinators
    FOR coordinator_data IN 
      SELECT coordinator_id, coordinator_email, coordinator_name
      FROM get_campus_coordinators(manager_data.campus_id)
      WHERE coordinator_email IS NOT NULL AND coordinator_email != ''
      LIMIT 3
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
              'submitted_date', COALESCE(NOW()::text, '')
            ),
            'campusId', manager_data.campus_id,
            'relatedEntityType', 'custom_plan',
            'relatedEntityId', NEW.id::text
          )::jsonb
        );
        RAISE LOG 'Email sent to campus coordinator: %', coordinator_data.coordinator_email;
        RETURN NEW;
      EXCEPTION WHEN OTHERS THEN
        RAISE LOG 'Failed to send email to campus coordinator %: %', coordinator_data.coordinator_email, SQLERRM;
        CONTINUE;
      END;
    END LOOP;

    -- Final fallback: Notify administrators
    FOR admin_data IN 
      SELECT admin_id, admin_email, admin_name
      FROM get_administrators()
      WHERE admin_email IS NOT NULL AND admin_email != ''
      LIMIT 2
    LOOP
      BEGIN
        PERFORM net.http_post(
          url := 'https://fdfovqfvisrtzdtkgcdj.supabase.co/functions/v1/send-email-notification',
          headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.service_role_key', true) || '"}'::jsonb,
          body := json_build_object(
            'templateType', 'plan_submitted',
            'recipientEmails', ARRAY[admin_data.admin_email],
            'variables', json_build_object(
              'manager_name', COALESCE(manager_data.manager_name, 'Usuario'),
              'plan_title', COALESCE(NEW.title, 'Plan de trabajo'),
              'plan_type_name', COALESCE(manager_data.plan_type_name, 'Tipo de plan'),
              'campus_name', COALESCE(manager_data.campus_name, 'Campus'),
              'submitted_date', COALESCE(NOW()::text, '')
            ),
            'campusId', manager_data.campus_id,
            'relatedEntityType', 'custom_plan',
            'relatedEntityId', NEW.id::text
          )::jsonb
        );
        RAISE LOG 'Email sent to administrator: %', admin_data.admin_email;
        RETURN NEW;
      EXCEPTION WHEN OTHERS THEN
        RAISE LOG 'Failed to send email to administrator %: %', admin_data.admin_email, SQLERRM;
        CONTINUE;
      END;
    END LOOP;

    RAISE LOG 'No valid recipients found for custom plan notification %', NEW.id;
  END IF;
  
  RETURN NEW;
END;
$function$;