-- Actualizar políticas RLS para custom_plans para permitir que gestores editen sus planes
-- Eliminar las políticas existentes restrictivas y crear nuevas más permisivas

-- Política para que gestores puedan actualizar sus propios planes (incluso si están en submitted)
DROP POLICY IF EXISTS "Gestores pueden actualizar sus planes" ON custom_plans;
CREATE POLICY "Gestores pueden actualizar sus planes" 
ON custom_plans 
FOR UPDATE 
USING (
  manager_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = ANY(ARRAY['Administrador', 'Coordinador'])
  )
);

-- Política para que gestores puedan acceder a custom_plan_responses de sus planes
DROP POLICY IF EXISTS "Gestores pueden gestionar respuestas de sus planes" ON custom_plan_responses;
CREATE POLICY "Gestores pueden gestionar respuestas de sus planes" 
ON custom_plan_responses 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM custom_plans cp 
    WHERE cp.id = custom_plan_responses.custom_plan_id 
    AND (cp.manager_id = auth.uid() OR 
         EXISTS (
           SELECT 1 FROM profiles 
           WHERE id = auth.uid() 
           AND role = ANY(ARRAY['Administrador', 'Coordinador'])
         )
    )
  )
);