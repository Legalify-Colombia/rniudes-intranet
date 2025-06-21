
-- Crear tabla para relacionar tipos de plan con ejes estratégicos
CREATE TABLE IF NOT EXISTS public.plan_type_strategic_axes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_type_id UUID NOT NULL REFERENCES public.plan_types(id) ON DELETE CASCADE,
  strategic_axis_id UUID NOT NULL REFERENCES public.strategic_axes(id) ON DELETE CASCADE,
  is_required BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(plan_type_id, strategic_axis_id)
);

-- Crear tabla para relacionar tipos de plan con acciones
CREATE TABLE IF NOT EXISTS public.plan_type_actions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_type_id UUID NOT NULL REFERENCES public.plan_types(id) ON DELETE CASCADE,
  action_id UUID NOT NULL REFERENCES public.actions(id) ON DELETE CASCADE,
  is_required BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(plan_type_id, action_id)
);

-- Crear tabla para relacionar tipos de plan con productos
CREATE TABLE IF NOT EXISTS public.plan_type_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_type_id UUID NOT NULL REFERENCES public.plan_types(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  is_required BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(plan_type_id, product_id)
);

-- Modificar la tabla custom_plan_assignments para incluir horas asignadas
ALTER TABLE public.custom_plan_assignments 
ADD COLUMN IF NOT EXISTS assigned_hours INTEGER DEFAULT 0;

-- Agregar índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_plan_type_strategic_axes_plan_type_id ON public.plan_type_strategic_axes(plan_type_id);
CREATE INDEX IF NOT EXISTS idx_plan_type_actions_plan_type_id ON public.plan_type_actions(plan_type_id);
CREATE INDEX IF NOT EXISTS idx_plan_type_products_plan_type_id ON public.plan_type_products(plan_type_id);
