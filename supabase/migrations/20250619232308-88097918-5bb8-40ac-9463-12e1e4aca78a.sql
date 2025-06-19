
-- Crear tabla de perfiles de usuario
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  document_number TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  position TEXT NOT NULL,
  role TEXT NOT NULL,
  weekly_hours INTEGER,
  number_of_weeks INTEGER DEFAULT 16,
  total_hours INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de campus
CREATE TABLE public.campus (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  address TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de facultades
CREATE TABLE public.faculties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  dean_name TEXT NOT NULL,
  campus_id UUID NOT NULL REFERENCES public.campus(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de programas académicos
CREATE TABLE public.academic_programs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  campus_id UUID NOT NULL REFERENCES public.campus(id) ON DELETE CASCADE,
  faculty_id UUID NOT NULL REFERENCES public.faculties(id) ON DELETE CASCADE,
  director_name TEXT NOT NULL,
  director_email TEXT NOT NULL,
  manager_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de ejes estratégicos (solo admin puede crear)
CREATE TABLE public.strategic_axes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de acciones (solo admin puede crear)
CREATE TABLE public.actions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  strategic_axis_id UUID NOT NULL REFERENCES public.strategic_axes(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de productos (solo admin puede crear)
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  action_id UUID NOT NULL REFERENCES public.actions(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de planes de trabajo
CREATE TABLE public.work_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  manager_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  program_id UUID NOT NULL REFERENCES public.academic_programs(id) ON DELETE CASCADE,
  total_hours_assigned INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'rejected')),
  comments TEXT,
  coordinator_approval_date TIMESTAMP WITH TIME ZONE,
  coordinator_comments TEXT,
  approved_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de asignación de horas por producto (gestor asigna horas)
CREATE TABLE public.work_plan_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  work_plan_id UUID NOT NULL REFERENCES public.work_plans(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  assigned_hours INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(work_plan_id, product_id)
);

-- Habilitar RLS en todas las tablas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.strategic_axes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_plan_assignments ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can create profiles" ON public.profiles FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Administrador')
);
CREATE POLICY "Admins can delete profiles" ON public.profiles FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Administrador')
);

-- Políticas para campus (solo admins)
CREATE POLICY "Everyone can view campus" ON public.campus FOR SELECT USING (true);
CREATE POLICY "Admins can manage campus" ON public.campus FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Administrador')
);

-- Políticas para facultades (solo admins)
CREATE POLICY "Everyone can view faculties" ON public.faculties FOR SELECT USING (true);
CREATE POLICY "Admins can manage faculties" ON public.faculties FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Administrador')
);

-- Políticas para programas académicos (solo admins)
CREATE POLICY "Everyone can view programs" ON public.academic_programs FOR SELECT USING (true);
CREATE POLICY "Admins can manage programs" ON public.academic_programs FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Administrador')
);

-- Políticas para ejes estratégicos (solo admins pueden crear/editar)
CREATE POLICY "Everyone can view strategic axes" ON public.strategic_axes FOR SELECT USING (true);
CREATE POLICY "Admins can manage strategic axes" ON public.strategic_axes FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Administrador')
);

-- Políticas para acciones (solo admins pueden crear/editar)
CREATE POLICY "Everyone can view actions" ON public.actions FOR SELECT USING (true);
CREATE POLICY "Admins can manage actions" ON public.actions FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Administrador')
);

-- Políticas para productos (solo admins pueden crear/editar)
CREATE POLICY "Everyone can view products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Admins can manage products" ON public.products FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Administrador')
);

-- Políticas para planes de trabajo
CREATE POLICY "Users can view related work plans" ON public.work_plans FOR SELECT USING (
  auth.uid() = manager_id OR 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('Administrador', 'Coordinador'))
);
CREATE POLICY "Managers can create their work plans" ON public.work_plans FOR INSERT WITH CHECK (auth.uid() = manager_id);
CREATE POLICY "Managers can update their work plans" ON public.work_plans FOR UPDATE USING (auth.uid() = manager_id);
CREATE POLICY "Coordinators can approve work plans" ON public.work_plans FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Coordinador')
);

-- Políticas para asignaciones de planes de trabajo
CREATE POLICY "Users can view related assignments" ON public.work_plan_assignments FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.work_plans WHERE id = work_plan_id AND (manager_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('Administrador', 'Coordinador'))))
);
CREATE POLICY "Managers can manage their assignments" ON public.work_plan_assignments FOR ALL USING (
  EXISTS (SELECT 1 FROM public.work_plans WHERE id = work_plan_id AND manager_id = auth.uid())
);

-- Función para manejar nuevos usuarios
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, document_number, email, position, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'full_name', ''),
    COALESCE(new.raw_user_meta_data ->> 'document_number', ''),
    new.email,
    COALESCE(new.raw_user_meta_data ->> 'position', ''),
    COALESCE(new.raw_user_meta_data ->> 'role', '')
  );
  RETURN new;
END;
$$;

-- Trigger para crear perfil automáticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
