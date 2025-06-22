
-- Eliminar la política existente que solo permite a gestores crear sus propios planes
DROP POLICY IF EXISTS "Managers can create their own plans" ON public.custom_plans;

-- Crear nueva política que permite a gestores crear sus propios planes
CREATE POLICY "Managers can create their own plans" 
  ON public.custom_plans 
  FOR INSERT 
  WITH CHECK (manager_id = auth.uid());

-- Crear nueva política que permite a administradores crear planes para cualquier gestor
CREATE POLICY "Admins can create plans for any manager" 
  ON public.custom_plans 
  FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'Administrador'
  ));

-- También necesitamos permitir que los administradores creen asignaciones para cualquier plan
DROP POLICY IF EXISTS "Managers can create assignments in their plans" ON public.custom_plan_assignments;

CREATE POLICY "Managers can create assignments in their plans" 
  ON public.custom_plan_assignments 
  FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.custom_plans 
    WHERE id = custom_plan_assignments.custom_plan_id 
    AND manager_id = auth.uid()
  ));

CREATE POLICY "Admins can create assignments in any plan" 
  ON public.custom_plan_assignments 
  FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'Administrador'
  ));
