-- Permitir que los gestores puedan enviar sus planes para aprobación
-- Reemplazar la política restrictiva con una que permita el envío

DROP POLICY IF EXISTS "Managers can update their draft or rejected plans" ON public.custom_plans;

-- Nueva política que permite a los gestores:
-- 1. Actualizar sus planes draft/rejected (edición)
-- 2. Cambiar status de draft a submitted (envío para aprobación)
CREATE POLICY "Managers can update and submit their plans" 
ON public.custom_plans 
FOR UPDATE 
USING (
  manager_id = auth.uid() AND 
  (
    -- Pueden editar si está en draft o rejected
    (status = ANY (ARRAY['draft'::text, 'rejected'::text])) OR
    -- Pueden enviar para aprobación si está en draft
    (status = 'draft'::text AND EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'Gestor'
    ))
  )
);

-- Asegurar que existe la función get_campus_coordinators_for_manager
CREATE OR REPLACE FUNCTION public.get_campus_coordinators_for_manager(manager_id uuid)
RETURNS TABLE(coordinator_id uuid, coordinator_email text, coordinator_name text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p1.id,
    p1.email,
    p1.full_name
  FROM profiles p1
  JOIN profiles p2 ON p1.campus_id = p2.campus_id
  WHERE p1.role = 'Coordinador'
  AND p2.id = manager_id;
END;
$$;

-- Completar la implementación del sistema de notificaciones por email
-- Crear tabla para configuración de email si no existe
CREATE TABLE IF NOT EXISTS public.email_configurations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  campus_id uuid REFERENCES public.campus(id),
  resend_api_key text,
  from_email text NOT NULL DEFAULT 'no-reply@universidad.edu.co',
  from_name text NOT NULL DEFAULT 'Sistema Universitario',
  test_email text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- RLS para email_configurations
ALTER TABLE public.email_configurations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Coordinadores pueden gestionar configuración de su campus" 
ON public.email_configurations 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() 
    AND (
      p.role = 'Administrador' OR 
      (p.role = 'Coordinador' AND (
        p.managed_campus_ids IS NULL OR 
        campus_id = ANY(p.managed_campus_ids)
      ))
    )
  )
);

-- Crear tabla para plantillas de email si no existe
CREATE TABLE IF NOT EXISTS public.email_templates (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  template_type text NOT NULL, -- 'plan_submitted', 'plan_approved', 'plan_rejected', etc.
  subject text NOT NULL,
  html_content text NOT NULL,
  variables jsonb DEFAULT '[]'::jsonb,
  campus_id uuid REFERENCES public.campus(id), -- NULL = global template
  is_active boolean DEFAULT true,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- RLS para email_templates
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Coordinadores pueden gestionar plantillas de su campus" 
ON public.email_templates 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() 
    AND (
      p.role = 'Administrador' OR 
      (p.role = 'Coordinador' AND (
        campus_id IS NULL OR 
        p.managed_campus_ids IS NULL OR 
        campus_id = ANY(p.managed_campus_ids)
      ))
    )
  )
);

-- Crear tabla para historial de notificaciones enviadas si no existe
CREATE TABLE IF NOT EXISTS public.email_notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id uuid REFERENCES public.email_templates(id),
  recipient_email text NOT NULL,
  recipient_name text,
  subject text NOT NULL,
  content text NOT NULL,
  status text DEFAULT 'pending', -- 'pending', 'sent', 'failed'
  sent_at timestamp with time zone,
  error_message text,
  related_entity_type text, -- 'custom_plan', 'template_report', etc.
  related_entity_id uuid,
  campus_id uuid REFERENCES public.campus(id),
  created_at timestamp with time zone DEFAULT now()
);

-- RLS para email_notifications
ALTER TABLE public.email_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Coordinadores pueden ver notificaciones de su campus" 
ON public.email_notifications 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() 
    AND (
      p.role = 'Administrador' OR 
      (p.role = 'Coordinador' AND (
        p.managed_campus_ids IS NULL OR 
        campus_id = ANY(p.managed_campus_ids)
      ))
    )
  )
);

-- Crear triggers para envío automático de notificaciones

-- Trigger para notificar cuando se envía un plan
CREATE OR REPLACE FUNCTION public.notify_plan_submitted()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  manager_data record;
  coordinators record;
BEGIN
  -- Solo ejecutar cuando se cambia el estado a 'submitted'
  IF NEW.status = 'submitted' AND (OLD.status IS NULL OR OLD.status != 'submitted') THEN
    
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
    
    -- Notificar a coordinadores del campus
    FOR coordinators IN 
      SELECT coordinator_id, coordinator_email, coordinator_name
      FROM get_campus_coordinators_for_manager(manager_data.manager_id)
    LOOP
      -- Llamar función de edge function para enviar notificación
      PERFORM net.http_post(
        url := 'https://fdfovqfvisrtzdtkgcdj.supabase.co/functions/v1/send-email-notification',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || current_setting('app.service_role_key', true)
        ),
        body := jsonb_build_object(
          'templateType', 'plan_submitted',
          'recipientEmails', array[coordinators.coordinator_email],
          'variables', jsonb_build_object(
            'manager_name', manager_data.manager_name,
            'plan_title', NEW.title,
            'plan_type_name', manager_data.plan_type_name,
            'campus_name', manager_data.campus_name,
            'submitted_date', NEW.submitted_date::text
          ),
          'campusId', manager_data.campus_id,
          'relatedEntityType', 'custom_plan',
          'relatedEntityId', NEW.id
        )
      );
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger para notificar cuando se aprueba/rechaza un plan
CREATE OR REPLACE FUNCTION public.notify_plan_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  manager_data record;
  template_type text;
BEGIN
  -- Solo ejecutar cuando se cambia el estado a 'approved' o 'rejected'
  IF (NEW.status = 'approved' OR NEW.status = 'rejected') AND OLD.status != NEW.status THEN
    
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
    
    -- Notificar al gestor
    PERFORM net.http_post(
      url := 'https://fdfovqfvisrtzdtkgcdj.supabase.co/functions/v1/send-email-notification',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.service_role_key', true)
      ),
      body := jsonb_build_object(
        'templateType', template_type,
        'recipientEmails', array[manager_data.manager_email],
        'variables', jsonb_build_object(
          'manager_name', manager_data.manager_name,
          'plan_title', NEW.title,
          'approval_comments', COALESCE(NEW.approval_comments, 'Sin comentarios')
        ),
        'campusId', manager_data.campus_id,
        'relatedEntityType', 'custom_plan',
        'relatedEntityId', NEW.id
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Aplicar triggers
DROP TRIGGER IF EXISTS trigger_notify_plan_submitted ON public.custom_plans;
CREATE TRIGGER trigger_notify_plan_submitted
  AFTER UPDATE ON public.custom_plans
  FOR EACH ROW EXECUTE FUNCTION notify_plan_submitted();

DROP TRIGGER IF EXISTS trigger_notify_plan_status_change ON public.custom_plans;
CREATE TRIGGER trigger_notify_plan_status_change
  AFTER UPDATE ON public.custom_plans
  FOR EACH ROW EXECUTE FUNCTION notify_plan_status_change();