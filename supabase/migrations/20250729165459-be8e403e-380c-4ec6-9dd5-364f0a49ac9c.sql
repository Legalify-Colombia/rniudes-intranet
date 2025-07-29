-- Crear campos básicos para el tipo de plan "Anexo 2. Plan de Trabajo Internacionalización"
INSERT INTO plan_fields (
  plan_type_id, 
  field_name, 
  field_type, 
  field_order, 
  is_required
) VALUES 
(
  '606bd119-dcfd-4831-851f-18342806a0cf',
  'objetivos_generales',
  'textarea',
  1,
  true
),
(
  '606bd119-dcfd-4831-851f-18342806a0cf',
  'objetivos_especificos',
  'textarea',
  2,
  true
),
(
  '606bd119-dcfd-4831-851f-18342806a0cf',
  'metodologia',
  'textarea',
  3,
  true
),
(
  '606bd119-dcfd-4831-851f-18342806a0cf',
  'cronograma',
  'textarea',
  4,
  true
),
(
  '606bd119-dcfd-4831-851f-18342806a0cf',
  'recursos_necesarios',
  'textarea',
  5,
  false
),
(
  '606bd119-dcfd-4831-851f-18342806a0cf',
  'resultados_esperados',
  'textarea',
  6,
  true
),
(
  '606bd119-dcfd-4831-851f-18342806a0cf',
  'indicadores',
  'textarea',
  7,
  false
);

-- Actualizar planes rechazados para permitir su edición
UPDATE custom_plans 
SET status = 'draft',
    updated_at = now()
WHERE status = 'rejected';

-- Crear función para validar si un plan puede ser editado
CREATE OR REPLACE FUNCTION can_edit_custom_plan(plan_id uuid, user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
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