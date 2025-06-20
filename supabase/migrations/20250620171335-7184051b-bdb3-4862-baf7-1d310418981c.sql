
-- Crear tabla para tipos de planes configurables
CREATE TABLE public.plan_types (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    min_weekly_hours INTEGER DEFAULT 0,
    max_weekly_hours INTEGER,
    is_visible BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    created_by UUID NOT NULL REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Crear tabla para campos de planes configurables
CREATE TABLE public.plan_fields (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    plan_type_id UUID NOT NULL REFERENCES public.plan_types(id) ON DELETE CASCADE,
    field_name TEXT NOT NULL,
    field_type TEXT NOT NULL CHECK (field_type IN (
        'numeric', 
        'short_text', 
        'long_text', 
        'dropdown', 
        'file', 
        'section', 
        'manager_name', 
        'campus_name', 
        'program_director', 
        'strategic_axes'
    )),
    dropdown_options JSONB, -- Para opciones de dropdown
    is_required BOOLEAN DEFAULT false,
    field_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Crear tabla para asociar ejes estratégicos a tipos de plan
CREATE TABLE public.plan_type_strategic_axes (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    plan_type_id UUID NOT NULL REFERENCES public.plan_types(id) ON DELETE CASCADE,
    strategic_axis_id UUID NOT NULL REFERENCES public.strategic_axes(id) ON DELETE CASCADE,
    is_required BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(plan_type_id, strategic_axis_id)
);

-- Crear tabla para asociar acciones a tipos de plan
CREATE TABLE public.plan_type_actions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    plan_type_id UUID NOT NULL REFERENCES public.plan_types(id) ON DELETE CASCADE,
    action_id UUID NOT NULL REFERENCES public.actions(id) ON DELETE CASCADE,
    is_required BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(plan_type_id, action_id)
);

-- Crear tabla para asociar productos a tipos de plan
CREATE TABLE public.plan_type_products (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    plan_type_id UUID NOT NULL REFERENCES public.plan_types(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    is_required BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(plan_type_id, product_id)
);

-- Crear tabla para instancias de planes creados por gestores
CREATE TABLE public.custom_plans (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    plan_type_id UUID NOT NULL REFERENCES public.plan_types(id),
    manager_id UUID NOT NULL REFERENCES public.profiles(id),
    title TEXT NOT NULL,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'rejected')),
    submitted_date TIMESTAMP WITH TIME ZONE,
    approved_date TIMESTAMP WITH TIME ZONE,
    approved_by UUID REFERENCES public.profiles(id),
    approval_comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Crear tabla para respuestas a campos de planes
CREATE TABLE public.custom_plan_responses (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    custom_plan_id UUID NOT NULL REFERENCES public.custom_plans(id) ON DELETE CASCADE,
    plan_field_id UUID NOT NULL REFERENCES public.plan_fields(id) ON DELETE CASCADE,
    response_value JSONB, -- Almacena el valor de la respuesta en formato flexible
    file_url TEXT,
    file_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(custom_plan_id, plan_field_id)
);

-- Crear tabla para asignación de elementos estratégicos a planes
CREATE TABLE public.custom_plan_assignments (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    custom_plan_id UUID NOT NULL REFERENCES public.custom_plans(id) ON DELETE CASCADE,
    strategic_axis_id UUID REFERENCES public.strategic_axes(id),
    action_id UUID REFERENCES public.actions(id),
    product_id UUID REFERENCES public.products(id),
    assigned_hours INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS en las nuevas tablas
ALTER TABLE public.plan_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_type_strategic_axes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_type_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_type_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_plan_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_plan_assignments ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para plan_types (solo admins pueden crear/editar)
CREATE POLICY "Todos pueden ver tipos de plan activos" ON public.plan_types
    FOR SELECT USING (is_active = true);

CREATE POLICY "Solo administradores pueden gestionar tipos de plan" ON public.plan_types
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role = 'Administrador'
        )
    );

-- Políticas RLS para plan_fields
CREATE POLICY "Todos pueden ver campos de plan" ON public.plan_fields
    FOR SELECT USING (true);

CREATE POLICY "Solo administradores pueden gestionar campos de plan" ON public.plan_fields
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role = 'Administrador'
        )
    );

-- Políticas similares para las demás tablas de configuración
CREATE POLICY "Todos pueden ver configuración de ejes" ON public.plan_type_strategic_axes
    FOR SELECT USING (true);

CREATE POLICY "Solo administradores pueden gestionar configuración de ejes" ON public.plan_type_strategic_axes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role = 'Administrador'
        )
    );

CREATE POLICY "Todos pueden ver configuración de acciones" ON public.plan_type_actions
    FOR SELECT USING (true);

CREATE POLICY "Solo administradores pueden gestionar configuración de acciones" ON public.plan_type_actions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role = 'Administrador'
        )
    );

CREATE POLICY "Todos pueden ver configuración de productos" ON public.plan_type_products
    FOR SELECT USING (true);

CREATE POLICY "Solo administradores pueden gestionar configuración de productos" ON public.plan_type_products
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role = 'Administrador'
        )
    );

-- Políticas para custom_plans
CREATE POLICY "Gestores pueden ver sus planes y admins/coordinadores todos" ON public.custom_plans
    FOR SELECT USING (
        manager_id = auth.uid() 
        OR EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role IN ('Administrador', 'Coordinador')
        )
    );

CREATE POLICY "Gestores pueden crear planes" ON public.custom_plans
    FOR INSERT WITH CHECK (
        manager_id = auth.uid() 
        AND EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role = 'Gestor'
        )
    );

CREATE POLICY "Gestores pueden actualizar sus planes y admins/coordinadores todos" ON public.custom_plans
    FOR UPDATE USING (
        manager_id = auth.uid() 
        OR EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role IN ('Administrador', 'Coordinador')
        )
    );

-- Políticas para custom_plan_responses
CREATE POLICY "Acceso a respuestas según permisos del plan" ON public.custom_plan_responses
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.custom_plans cp
            WHERE cp.id = custom_plan_responses.custom_plan_id
            AND (
                cp.manager_id = auth.uid() 
                OR EXISTS (
                    SELECT 1 FROM public.profiles 
                    WHERE id = auth.uid() 
                    AND role IN ('Administrador', 'Coordinador')
                )
            )
        )
    );

-- Políticas para custom_plan_assignments
CREATE POLICY "Acceso a asignaciones según permisos del plan" ON public.custom_plan_assignments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.custom_plans cp
            WHERE cp.id = custom_plan_assignments.custom_plan_id
            AND (
                cp.manager_id = auth.uid() 
                OR EXISTS (
                    SELECT 1 FROM public.profiles 
                    WHERE id = auth.uid() 
                    AND role IN ('Administrador', 'Coordinador')
                )
            )
        )
    );

-- Insertar tipo de plan predeterminado para Plan de Trabajo
INSERT INTO public.plan_types (name, description, created_by) 
SELECT 'Plan de Trabajo', 'Plan de trabajo tradicional con ejes, acciones, productos y horas', id
FROM public.profiles WHERE role = 'Administrador' LIMIT 1;

-- Crear índices para optimizar consultas
CREATE INDEX idx_plan_fields_type ON public.plan_fields(plan_type_id);
CREATE INDEX idx_custom_plans_manager ON public.custom_plans(manager_id);
CREATE INDEX idx_custom_plans_type ON public.custom_plans(plan_type_id);
CREATE INDEX idx_custom_plan_responses_plan ON public.custom_plan_responses(custom_plan_id);
CREATE INDEX idx_custom_plan_assignments_plan ON public.custom_plan_assignments(custom_plan_id);
