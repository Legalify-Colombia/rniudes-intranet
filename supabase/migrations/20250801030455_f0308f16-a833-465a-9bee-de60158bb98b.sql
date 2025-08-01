-- Primero, limpiar las políticas RLS conflictivas y crear políticas más claras
DROP POLICY IF EXISTS "Admins can create plans for any manager" ON public.custom_plans;
DROP POLICY IF EXISTS "Admins can update any plan" ON public.custom_plans;
DROP POLICY IF EXISTS "Admins can view all plans" ON public.custom_plans;
DROP POLICY IF EXISTS "Gestores pueden actualizar sus planes y admins/coordinadores to" ON public.custom_plans;
DROP POLICY IF EXISTS "Gestores pueden crear planes" ON public.custom_plans;
DROP POLICY IF EXISTS "Gestores pueden ver sus planes y admins/coordinadores todos" ON public.custom_plans;
DROP POLICY IF EXISTS "Managers can create their own plans" ON public.custom_plans;
DROP POLICY IF EXISTS "Managers can update their own draft plans" ON public.custom_plans;
DROP POLICY IF EXISTS "Managers can view their own plans" ON public.custom_plans;
DROP POLICY IF EXISTS "Managers can approve/reject custom plans" ON public.custom_plans;
DROP POLICY IF EXISTS "Managers can view their custom plans" ON public.custom_plans;
DROP POLICY IF EXISTS "Solo directores de programa pueden aprobar planes" ON public.custom_plans;
DROP POLICY IF EXISTS "Gestores pueden actualizar sus planes" ON public.custom_plans;
DROP POLICY IF EXISTS "Managers can update their own plans and admins can update all p" ON public.custom_plans;
DROP POLICY IF EXISTS "Managers can view their plans and admins can view all plans" ON public.custom_plans;

-- Crear políticas RLS más claras y sin conflictos

-- 1. Políticas para SELECT (ver planes)
CREATE POLICY "Users can view custom plans based on role"
ON public.custom_plans FOR SELECT
USING (
  -- Gestores pueden ver sus propios planes
  (manager_id = auth.uid()) OR
  -- Administradores pueden ver todos los planes
  (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'Administrador')) OR
  -- Coordinadores de campus pueden ver planes de gestores en su campus
  (EXISTS (
    SELECT 1 FROM profiles p1
    JOIN profiles p2 ON p1.campus_id = p2.campus_id
    WHERE p1.id = auth.uid() 
    AND p1.role = 'Coordinador'
    AND p2.id = custom_plans.manager_id
  )) OR
  -- Directores de programa pueden ver planes
  (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND position = 'Director de Programa'))
);

-- 2. Políticas para INSERT (crear planes)
CREATE POLICY "Managers can create their own plans"
ON public.custom_plans FOR INSERT
WITH CHECK (
  manager_id = auth.uid() AND
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'Gestor')
);

CREATE POLICY "Admins can create plans for any manager"
ON public.custom_plans FOR INSERT
WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'Administrador')
);

-- 3. Políticas para UPDATE (actualizar planes)
CREATE POLICY "Managers can update their draft or rejected plans"
ON public.custom_plans FOR UPDATE
USING (
  manager_id = auth.uid() AND 
  status IN ('draft', 'rejected')
);

CREATE POLICY "Coordinators can approve submitted plans from their campus"
ON public.custom_plans FOR UPDATE
USING (
  status = 'submitted' AND
  (
    -- Coordinadores de campus pueden aprobar planes de su campus
    (EXISTS (
      SELECT 1 FROM profiles p1
      JOIN profiles p2 ON p1.campus_id = p2.campus_id
      WHERE p1.id = auth.uid() 
      AND p1.role = 'Coordinador'
      AND p2.id = custom_plans.manager_id
    )) OR
    -- Directores de programa pueden aprobar
    (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND position = 'Director de Programa')) OR
    -- Administradores pueden aprobar
    (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'Administrador'))
  )
);

CREATE POLICY "Admins can update any plan"
ON public.custom_plans FOR UPDATE
USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'Administrador')
);

-- Actualizar la función de coordinadores de campus para que sea más específica
CREATE OR REPLACE FUNCTION public.get_campus_coordinators_for_manager(manager_id uuid)
RETURNS TABLE(coordinator_id uuid, coordinator_email text, coordinator_name text)
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
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
$function$;