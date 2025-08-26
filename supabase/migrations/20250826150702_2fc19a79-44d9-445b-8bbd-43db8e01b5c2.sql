-- Final security hardening: Fix remaining function search paths and add missing RLS policies

-- Update remaining functions with search_path
CREATE OR REPLACE FUNCTION public.can_edit_custom_plan(plan_id uuid, user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  plan_record custom_plans%ROWTYPE;
  user_role text;
BEGIN
  -- Obtener el plan
  SELECT * INTO plan_record FROM custom_plans WHERE id = plan_id;
  
  -- Obtener el rol del usuario
  SELECT role INTO user_role FROM profiles WHERE id = user_id;
  
  -- Un plan puede ser editado si:
  -- 1. El usuario es el manager del plan Y el plan está en draft o rejected
  -- 2. El usuario es administrador o coordinador
  IF (plan_record.manager_id = user_id AND plan_record.status IN ('draft', 'rejected')) OR
     (user_role IN ('Administrador', 'Coordinador')) THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$function$;

CREATE OR REPLACE FUNCTION public.can_approve_custom_plan(plan_id uuid, approver_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
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

CREATE OR REPLACE FUNCTION public.simple_update_progress()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
    -- Solo hacer el update sin triggers adicionales
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        UPDATE manager_reports 
        SET total_progress_percentage = (
            SELECT COALESCE(AVG(progress_percentage), 0)
            FROM product_progress_reports 
            WHERE manager_report_id = NEW.manager_report_id
        )
        WHERE id = NEW.manager_report_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE manager_reports 
        SET total_progress_percentage = (
            SELECT COALESCE(AVG(progress_percentage), 0)
            FROM product_progress_reports 
            WHERE manager_report_id = OLD.manager_report_id
        )
        WHERE id = OLD.manager_report_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$function$;

-- Add missing RLS policy for role_change_audit table inserts
CREATE POLICY "System can insert role changes" 
ON public.role_change_audit 
FOR INSERT 
WITH CHECK (true);

-- Add policy for plan_observations inserts and updates  
CREATE POLICY "Coordinators and directors can create/update observations" 
ON public.plan_observations 
FOR ALL
USING (
  is_campus_coordinator(auth.uid()) OR 
  is_program_director(auth.uid()) OR 
  is_current_user_admin()
)
WITH CHECK (
  observer_id = auth.uid() AND (
    is_campus_coordinator(auth.uid()) OR 
    is_program_director(auth.uid()) OR 
    is_current_user_admin()
  )
);