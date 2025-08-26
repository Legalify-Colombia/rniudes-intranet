-- Security Fix: Update remaining functions to have secure search_path
-- This addresses the Function Search Path Mutable warnings

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_agreement_comments_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_campus_coordinators(target_campus_id uuid)
RETURNS TABLE(coordinator_id uuid, coordinator_email text, coordinator_name text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.email,
    p.full_name
  FROM profiles p
  WHERE p.role = 'Coordinador'
  AND (
    p.managed_campus_ids IS NULL OR 
    target_campus_id = ANY(p.managed_campus_ids)
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_administrators()
RETURNS TABLE(admin_id uuid, admin_email text, admin_name text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.email,
    p.full_name
  FROM profiles p
  WHERE p.role = 'Administrador';
END;
$function$;

CREATE OR REPLACE FUNCTION public.log_agreement_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  user_profile RECORD;
  action_type_val TEXT := 'update';
BEGIN
  -- Obtener información del usuario
  SELECT full_name INTO user_profile 
  FROM profiles 
  WHERE id = auth.uid();

  -- Determinar el tipo de acción
  IF TG_OP = 'INSERT' THEN
    action_type_val := 'creation';
  ELSIF OLD.current_status IS DISTINCT FROM NEW.current_status THEN
    action_type_val := 'status_change';
  END IF;

  -- Crear entrada en la bitácora
  INSERT INTO agreement_audit_log (
    agreement_id,
    action_type,
    previous_status,
    new_status,
    user_id,
    user_name
  ) VALUES (
    COALESCE(NEW.id, OLD.id),
    action_type_val,
    OLD.current_status,
    NEW.current_status,
    auth.uid(),
    COALESCE(user_profile.full_name, 'Usuario')
  );

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$function$;

CREATE OR REPLACE FUNCTION public.add_agreement_observation(p_agreement_id uuid, p_comment text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  user_profile RECORD;
  audit_id UUID;
BEGIN
  -- Obtener información del usuario
  SELECT full_name INTO user_profile 
  FROM profiles 
  WHERE id = auth.uid();

  -- Crear entrada en la bitácora
  INSERT INTO agreement_audit_log (
    agreement_id,
    action_type,
    comment,
    user_id,
    user_name
  ) VALUES (
    p_agreement_id,
    'observation',
    p_comment,
    auth.uid(),
    COALESCE(user_profile.full_name, 'Usuario')
  )
  RETURNING id INTO audit_id;

  RETURN audit_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_agreements_stats()
RETURNS TABLE(total_agreements bigint, active_agreements bigint, expiring_soon bigint, international_agreements bigint, national_agreements bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_agreements,
    COUNT(*) FILTER (WHERE current_status = 'active') as active_agreements,
    COUNT(*) FILTER (WHERE current_status = 'active' AND termination_date <= CURRENT_DATE + INTERVAL '90 days') as expiring_soon,
    COUNT(*) FILTER (WHERE is_international = true) as international_agreements,
    COUNT(*) FILTER (WHERE is_international = false OR is_international IS NULL) as national_agreements
  FROM agreements;
END;
$function$;

CREATE OR REPLACE FUNCTION public.is_campus_coordinator(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM profiles 
    WHERE id = user_id 
    AND position = 'Coordinador de Campus'
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.is_program_director(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM profiles 
    WHERE id = user_id 
    AND position = 'Director de Programa'
  );
END;
$function$;