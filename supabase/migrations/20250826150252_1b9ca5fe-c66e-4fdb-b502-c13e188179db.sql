-- Security Fix 1: Secure Profiles Table Access
-- Remove overly permissive policies and implement role-based access

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Everyone can view profiles" ON public.profiles;

-- Create secure role-based access policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (id = auth.uid());

CREATE POLICY "Administrators can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'Administrador'
  )
);

CREATE POLICY "Coordinators can view profiles in their managed campus" 
ON public.profiles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles coordinator
    WHERE coordinator.id = auth.uid() 
    AND coordinator.role = 'Coordinador'
    AND (
      coordinator.managed_campus_ids IS NULL OR 
      profiles.campus_id = ANY(coordinator.managed_campus_ids) OR
      profiles.campus_id = coordinator.campus_id
    )
  )
);

-- Security Fix 2: Add missing RLS policies for tables without policies
-- Add RLS policy for plan_observations table if missing
CREATE POLICY "Users can view plan observations" 
ON public.plan_observations 
FOR SELECT 
USING (
  observer_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.custom_plans cp 
    WHERE cp.id = plan_observations.plan_id 
    AND cp.manager_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('Administrador', 'Coordinador')
  )
);

-- Security Fix 3: Create secure function for role checking to prevent RLS recursion
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT 
LANGUAGE SQL 
SECURITY DEFINER 
STABLE
SET search_path = 'public'
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- Security Fix 4: Create secure function for checking admin status
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS BOOLEAN 
LANGUAGE SQL 
SECURITY DEFINER 
STABLE
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'Administrador'
  );
$$;

-- Security Fix 5: Add role change audit logging
CREATE TABLE IF NOT EXISTS public.role_change_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  old_role TEXT,
  new_role TEXT NOT NULL,
  changed_by UUID NOT NULL,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reason TEXT,
  ip_address TEXT
);

ALTER TABLE public.role_change_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view role change audit" 
ON public.role_change_audit 
FOR SELECT 
USING (public.is_current_user_admin());

-- Security Fix 6: Create secure role change function with audit logging
CREATE OR REPLACE FUNCTION public.change_user_role(
  target_user_id UUID,
  new_role TEXT,
  reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  old_role TEXT;
  current_user_role TEXT;
BEGIN
  -- Get current user role
  SELECT role INTO current_user_role FROM public.profiles WHERE id = auth.uid();
  
  -- Only administrators can change roles
  IF current_user_role != 'Administrador' THEN
    RAISE EXCEPTION 'Solo los administradores pueden cambiar roles de usuario';
  END IF;
  
  -- Get old role for audit
  SELECT role INTO old_role FROM public.profiles WHERE id = target_user_id;
  
  -- Validate new role
  IF new_role NOT IN ('Administrador', 'Coordinador', 'Gestor') THEN
    RAISE EXCEPTION 'Rol inválido: %', new_role;
  END IF;
  
  -- Update role
  UPDATE public.profiles 
  SET role = new_role, updated_at = NOW()
  WHERE id = target_user_id;
  
  -- Log the change
  INSERT INTO public.role_change_audit (
    user_id, old_role, new_role, changed_by, reason
  ) VALUES (
    target_user_id, old_role, new_role, auth.uid(), reason
  );
  
  RETURN TRUE;
END;
$$;

-- Security Fix 7: Fix database functions search_path (apply to critical functions)
-- Update existing functions to be more secure
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = 'public'
AS $function$
BEGIN
  RETURN (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'Administrador';
END;
$function$;

CREATE OR REPLACE FUNCTION public.can_manage_campus(admin_id uuid, target_campus_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = 'public'
AS $function$
DECLARE
  admin_role text;
  admin_managed_campus_ids uuid[];
BEGIN
  SELECT role, managed_campus_ids 
  INTO admin_role, admin_managed_campus_ids
  FROM public.profiles 
  WHERE id = admin_id;
  
  IF admin_role = 'Administrador' AND admin_managed_campus_ids IS NULL THEN
    RETURN true;
  END IF;
  
  IF admin_role = 'Administrador' AND target_campus_id = ANY(admin_managed_campus_ids) THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$function$;