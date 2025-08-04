-- Remove notifications table dependencies and fix JSONB handling
-- First, drop triggers that reference notifications table

DROP TRIGGER IF EXISTS notify_campus_coordinator_on_approval ON custom_plans;
DROP FUNCTION IF EXISTS notify_campus_coordinator_on_approval();

-- Update the custom_plan_responses table to handle JSONB properly
ALTER TABLE custom_plan_responses 
ALTER COLUMN response_value TYPE jsonb USING 
  CASE 
    WHEN response_value IS NULL THEN NULL
    WHEN response_value::text ~ '^[0-9]+$' THEN response_value::text::jsonb
    WHEN response_value::text ~ '^".*"$' THEN response_value::jsonb
    WHEN response_value::text = 'true' OR response_value::text = 'false' THEN response_value::text::jsonb
    ELSE to_jsonb(response_value::text)
  END;

-- Ensure proper indexing for performance
CREATE INDEX IF NOT EXISTS idx_custom_plan_responses_plan_field 
ON custom_plan_responses (custom_plan_id, plan_field_id);

-- Update the plan submission trigger to only send emails (remove notifications)
CREATE OR REPLACE FUNCTION notify_plan_submitted()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  manager_data record;
  coordinators record;
  config_exists boolean;
BEGIN
  -- Solo ejecutar cuando se cambia el estado a 'submitted'
  IF NEW.status = 'submitted' AND (OLD.status IS NULL OR OLD.status != 'submitted') THEN
    
    -- Verificar si existe configuración de email activa para el campus del gestor
    SELECT EXISTS(
      SELECT 1 FROM email_configurations ec
      JOIN profiles p ON (ec.campus_id = p.campus_id OR ec.campus_id IS NULL)
      WHERE p.id = NEW.manager_id 
      AND ec.is_active = true 
      AND ec.resend_api_key IS NOT NULL
    ) INTO config_exists;
    
    -- Solo proceder si hay configuración de email
    IF config_exists THEN
      -- Obtener datos del gestor y campus
      SELECT 
        p.full_name as manager_name,
        p.email as manager_email,
        p.campus_id,
        c.name as campus_name,
        pt.name as plan_type_name
      INTO manager_data
      FROM custom_plans cp
      JOIN profiles p ON cp.manager_id = p.id
      LEFT JOIN campus c ON p.campus_id = c.id
      LEFT JOIN plan_types pt ON cp.plan_type_id = pt.id
      WHERE cp.id = NEW.id;
      
      -- Notificar a coordinadores del campus vía email
      FOR coordinators IN 
        SELECT coordinator_id, coordinator_email, coordinator_name
        FROM get_campus_coordinators(manager_data.campus_id)
      LOOP
        -- Llamar función de edge function para enviar notificación
        PERFORM net.http_post(
          url := 'https://fdfovqfvisrtzdtkgcdj.supabase.co/functions/v1/send-email-notification',
          headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.service_role_key', true) || '"}'::jsonb,
          body := json_build_object(
            'templateType', 'plan_submitted',
            'recipientEmails', ARRAY[coordinators.coordinator_email],
            'variables', json_build_object(
              'manager_name', manager_data.manager_name,
              'plan_title', NEW.title,
              'plan_type_name', manager_data.plan_type_name,
              'campus_name', manager_data.campus_name,
              'submitted_date', NEW.submitted_date::text
            ),
            'campusId', manager_data.campus_id,
            'relatedEntityType', 'custom_plan',
            'relatedEntityId', NEW.id
          )::jsonb
        );
      END LOOP;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Recreate the trigger for plan submissions
DROP TRIGGER IF EXISTS custom_plans_submitted_trigger ON custom_plans;
CREATE TRIGGER custom_plans_submitted_trigger
  AFTER UPDATE ON custom_plans
  FOR EACH ROW
  EXECUTE FUNCTION notify_plan_submitted();

-- Update the plan status change trigger to only send emails
CREATE OR REPLACE FUNCTION notify_plan_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  manager_data record;
  template_type text;
  config_exists boolean;
BEGIN
  -- Solo ejecutar cuando se cambia el estado a 'approved' o 'rejected'
  IF (NEW.status = 'approved' OR NEW.status = 'rejected') AND OLD.status != NEW.status THEN
    
    -- Verificar si existe configuración de email activa
    SELECT EXISTS(
      SELECT 1 FROM email_configurations ec
      JOIN profiles p ON (ec.campus_id = p.campus_id OR ec.campus_id IS NULL)
      WHERE p.id = NEW.manager_id 
      AND ec.is_active = true 
      AND ec.resend_api_key IS NOT NULL
    ) INTO config_exists;
    
    -- Solo proceder si hay configuración de email
    IF config_exists THEN
      -- Determinar tipo de plantilla
      template_type := CASE 
        WHEN NEW.status = 'approved' THEN 'plan_approved'
        WHEN NEW.status = 'rejected' THEN 'plan_rejected'
      END;
      
      -- Obtener datos del gestor
      SELECT 
        p.full_name as manager_name,
        p.email as manager_email,
        p.campus_id
      INTO manager_data
      FROM custom_plans cp
      JOIN profiles p ON cp.manager_id = p.id
      WHERE cp.id = NEW.id;
      
      -- Notificar al gestor vía email
      PERFORM net.http_post(
        url := 'https://fdfovqfvisrtzdtkgcdj.supabase.co/functions/v1/send-email-notification',
        headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.service_role_key', true) || '"}'::jsonb,
        body := json_build_object(
          'templateType', template_type,
          'recipientEmails', ARRAY[manager_data.manager_email],
          'variables', json_build_object(
            'manager_name', manager_data.manager_name,
            'plan_title', NEW.title,
            'approval_comments', COALESCE(NEW.approval_comments, 'Sin comentarios')
          ),
          'campusId', manager_data.campus_id,
          'relatedEntityType', 'custom_plan',
          'relatedEntityId', NEW.id
        )::jsonb
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Recreate the trigger for plan status changes
DROP TRIGGER IF EXISTS custom_plans_status_change_trigger ON custom_plans;
CREATE TRIGGER custom_plans_status_change_trigger
  AFTER UPDATE ON custom_plans
  FOR EACH ROW
  EXECUTE FUNCTION notify_plan_status_change();