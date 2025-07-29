-- Crear la constraint única que falta en custom_plan_assignments
ALTER TABLE public.custom_plan_assignments 
ADD CONSTRAINT unique_custom_plan_product 
UNIQUE (custom_plan_id, product_id);

-- Verificar que la tabla tenga RLS habilitado
ALTER TABLE public.custom_plan_assignments ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para custom_plan_assignments
DROP POLICY IF EXISTS "Users can manage assignments in their plans" ON public.custom_plan_assignments;

CREATE POLICY "Users can manage assignments in their plans" ON public.custom_plan_assignments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM custom_plans cp
      WHERE cp.id = custom_plan_assignments.custom_plan_id 
      AND (cp.manager_id = auth.uid() OR EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role IN ('Administrador', 'Coordinador')
      ))
    )
  );

-- Agregar tabla para configurar orden de elementos del plan
CREATE TABLE IF NOT EXISTS public.plan_type_element_order (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_type_id UUID NOT NULL REFERENCES public.plan_types(id) ON DELETE CASCADE,
  element_type TEXT NOT NULL CHECK (element_type IN ('strategic_axis', 'action', 'product')),
  element_id UUID NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(plan_type_id, element_type, element_id)
);

-- RLS para order table
ALTER TABLE public.plan_type_element_order ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Coordinators can manage element order" ON public.plan_type_element_order
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('Administrador', 'Coordinador')
    )
  );

CREATE POLICY "Everyone can view element order" ON public.plan_type_element_order
  FOR SELECT USING (true);