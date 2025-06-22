
-- Agregar políticas RLS para plan_types
ALTER TABLE public.plan_types ENABLE ROW LEVEL SECURITY;

-- Política para que todos puedan ver tipos de plan activos y visibles
CREATE POLICY "Anyone can view active plan types" 
  ON public.plan_types 
  FOR SELECT 
  USING (is_active = true AND is_visible = true);

-- Política para que solo administradores puedan crear tipos de plan
CREATE POLICY "Only admins can create plan types" 
  ON public.plan_types 
  FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'Administrador'
  ));

-- Política para que solo administradores puedan actualizar tipos de plan
CREATE POLICY "Only admins can update plan types" 
  ON public.plan_types 
  FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'Administrador'
  ));

-- Política para que solo administradores puedan eliminar tipos de plan
CREATE POLICY "Only admins can delete plan types" 
  ON public.plan_types 
  FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'Administrador'
  ));

-- Agregar políticas RLS para custom_plans
ALTER TABLE public.custom_plans ENABLE ROW LEVEL SECURITY;

-- Política para que gestores puedan ver sus propios planes
CREATE POLICY "Managers can view their own plans" 
  ON public.custom_plans 
  FOR SELECT 
  USING (manager_id = auth.uid());

-- Política para que administradores puedan ver todos los planes
CREATE POLICY "Admins can view all plans" 
  ON public.custom_plans 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'Administrador'
  ));

-- Política para que gestores puedan crear sus propios planes
CREATE POLICY "Managers can create their own plans" 
  ON public.custom_plans 
  FOR INSERT 
  WITH CHECK (manager_id = auth.uid());

-- Política para que gestores puedan actualizar sus propios planes (solo en estado draft)
CREATE POLICY "Managers can update their own draft plans" 
  ON public.custom_plans 
  FOR UPDATE 
  USING (manager_id = auth.uid() AND status = 'draft');

-- Política para que administradores puedan actualizar cualquier plan
CREATE POLICY "Admins can update any plan" 
  ON public.custom_plans 
  FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'Administrador'
  ));

-- Agregar políticas RLS para custom_plan_assignments
ALTER TABLE public.custom_plan_assignments ENABLE ROW LEVEL SECURITY;

-- Política para que gestores puedan ver las asignaciones de sus planes
CREATE POLICY "Managers can view their plan assignments" 
  ON public.custom_plan_assignments 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.custom_plans 
    WHERE id = custom_plan_assignments.custom_plan_id 
    AND manager_id = auth.uid()
  ));

-- Política para que administradores puedan ver todas las asignaciones
CREATE POLICY "Admins can view all plan assignments" 
  ON public.custom_plan_assignments 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'Administrador'
  ));

-- Política para que gestores puedan crear asignaciones en sus planes
CREATE POLICY "Managers can create assignments in their plans" 
  ON public.custom_plan_assignments 
  FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.custom_plans 
    WHERE id = custom_plan_assignments.custom_plan_id 
    AND manager_id = auth.uid()
  ));

-- Política para que gestores puedan actualizar asignaciones en sus planes
CREATE POLICY "Managers can update assignments in their plans" 
  ON public.custom_plan_assignments 
  FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM public.custom_plans 
    WHERE id = custom_plan_assignments.custom_plan_id 
    AND manager_id = auth.uid()
  ));

-- Política para que gestores puedan eliminar asignaciones en sus planes
CREATE POLICY "Managers can delete assignments in their plans" 
  ON public.custom_plan_assignments 
  FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM public.custom_plans 
    WHERE id = custom_plan_assignments.custom_plan_id 
    AND manager_id = auth.uid()
  ));

-- Agregar políticas RLS para custom_plan_responses
ALTER TABLE public.custom_plan_responses ENABLE ROW LEVEL SECURITY;

-- Política para que gestores puedan ver las respuestas de sus planes
CREATE POLICY "Managers can view their plan responses" 
  ON public.custom_plan_responses 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.custom_plans 
    WHERE id = custom_plan_responses.custom_plan_id 
    AND manager_id = auth.uid()
  ));

-- Política para que administradores puedan ver todas las respuestas
CREATE POLICY "Admins can view all plan responses" 
  ON public.custom_plan_responses 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'Administrador'
  ));

-- Política para que gestores puedan crear respuestas en sus planes
CREATE POLICY "Managers can create responses in their plans" 
  ON public.custom_plan_responses 
  FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.custom_plans 
    WHERE id = custom_plan_responses.custom_plan_id 
    AND manager_id = auth.uid()
  ));

-- Política para que gestores puedan actualizar respuestas en sus planes
CREATE POLICY "Managers can update responses in their plans" 
  ON public.custom_plan_responses 
  FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM public.custom_plans 
    WHERE id = custom_plan_responses.custom_plan_id 
    AND manager_id = auth.uid()
  ));
