-- Corregir funciones de seguridad agregando search_path
DROP FUNCTION IF EXISTS public.log_agreement_change() CASCADE;
DROP FUNCTION IF EXISTS public.add_agreement_observation(UUID, TEXT) CASCADE;

-- Función para crear entradas de bitácora automáticamente (con security definer y search_path)
CREATE OR REPLACE FUNCTION public.log_agreement_change()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
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
$$;

-- Función para agregar observaciones manuales a la bitácora (con security definer y search_path)
CREATE OR REPLACE FUNCTION public.add_agreement_observation(
  p_agreement_id UUID,
  p_comment TEXT
)
RETURNS UUID 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
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
$$;

-- Recrear trigger
DROP TRIGGER IF EXISTS agreement_audit_trigger ON public.agreements;
CREATE TRIGGER agreement_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.agreements
  FOR EACH ROW
  EXECUTE FUNCTION public.log_agreement_change();

-- Función para obtener estadísticas de convenios
CREATE OR REPLACE FUNCTION public.get_agreements_stats()
RETURNS TABLE(
  total_agreements BIGINT,
  active_agreements BIGINT,
  expiring_soon BIGINT,
  international_agreements BIGINT,
  national_agreements BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;