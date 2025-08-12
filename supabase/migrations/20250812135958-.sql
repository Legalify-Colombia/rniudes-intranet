-- Policy to allow program directors to update custom plans of their assigned managers
CREATE POLICY "Program directors can update their managers' plans"
ON public.custom_plans
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM public.academic_programs ap
    WHERE ap.manager_id = custom_plans.manager_id
      AND ap.coordinador_id = auth.uid()
  )
);

-- Notify when a custom plan is submitted: email program director
CREATE OR REPLACE FUNCTION public.notify_custom_plan_submitted()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  manager_data record;
  program_data record;
  director_profile record;
BEGIN
  IF NEW.status = 'submitted' AND (OLD.status IS NULL OR OLD.status <> 'submitted') THEN
    -- Gather manager and plan info
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

    -- Find the academic program and its director (coordinator)
    SELECT ap.id as program_id, ap.coordinador_id
    INTO program_data
    FROM academic_programs ap
    WHERE ap.manager_id = NEW.manager_id
    LIMIT 1;

    IF program_data.coordinador_id IS NOT NULL THEN
      SELECT id, email, full_name
      INTO director_profile
      FROM profiles
      WHERE id = program_data.coordinador_id;

      PERFORM net.http_post(
        url := 'https://fdfovqfvisrtzdtkgcdj.supabase.co/functions/v1/send-email-notification',
        headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.service_role_key', true) || '"}'::jsonb,
        body := json_build_object(
          'templateType', 'plan_submitted',
          'recipientEmails', ARRAY[director_profile.email],
          'variables', json_build_object(
            'manager_name', manager_data.manager_name,
            'plan_title', NEW.title,
            'plan_type_name', manager_data.plan_type_name,
            'campus_name', manager_data.campus_name,
            'submitted_date', NOW()::text
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
$$;

DROP TRIGGER IF EXISTS trg_notify_custom_plan_submitted ON public.custom_plans;
CREATE TRIGGER trg_notify_custom_plan_submitted
AFTER UPDATE ON public.custom_plans
FOR EACH ROW
EXECUTE FUNCTION public.notify_custom_plan_submitted();

-- Send welcome email when a new profile is created
CREATE OR REPLACE FUNCTION public.notify_user_created()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  campus_name text;
BEGIN
  SELECT name INTO campus_name FROM campus WHERE id = NEW.campus_id;

  PERFORM net.http_post(
    url := 'https://fdfovqfvisrtzdtkgcdj.supabase.co/functions/v1/send-email-notification',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.service_role_key', true) || '"}'::jsonb,
    body := json_build_object(
      'templateType', 'user_creation',
      'recipientEmails', ARRAY[NEW.email],
      'variables', json_build_object(
        'user_name', NEW.full_name,
        'user_email', NEW.email,
        'role', NEW.role,
        'campus_name', campus_name
      ),
      'campusId', NEW.campus_id,
      'relatedEntityType', 'profile',
      'relatedEntityId', NEW.id
    )::jsonb
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_user_created ON public.profiles;
CREATE TRIGGER trg_notify_user_created
AFTER INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.notify_user_created();