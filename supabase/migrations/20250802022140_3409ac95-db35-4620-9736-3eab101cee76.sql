-- Corregir política para permitir envío de planes
DROP POLICY IF EXISTS "Managers can update their draft or rejected plans" ON public.custom_plans;

-- Nueva política que permite a los gestores enviar planes para aprobación
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