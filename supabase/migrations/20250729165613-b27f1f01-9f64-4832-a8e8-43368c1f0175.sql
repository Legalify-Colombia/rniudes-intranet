-- Corregir función de seguridad con search_path apropiado
CREATE OR REPLACE FUNCTION can_edit_custom_plan(plan_id uuid, user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;