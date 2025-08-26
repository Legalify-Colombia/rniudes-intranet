-- Fix infinite recursion in profiles RLS policies

-- Drop problematic policies that cause infinite recursion
DROP POLICY IF EXISTS "Administrators can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Coordinators can view profiles in their managed campus" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage profiles" ON public.profiles;

-- Create simple, non-recursive policies for profiles table

-- Allow users to view their own profile
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

-- Allow users to update their own profile  
CREATE POLICY "Users can update own profile"
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Allow users to insert their own profile during registration
CREATE POLICY "Users can insert own profile"
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Create a simple function to check if current user is admin (without table lookup)
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT COALESCE((auth.jwt() ->> 'user_role')::text = 'Administrador', false);
$$;

-- Admin policy using JWT claim instead of table lookup to avoid recursion
CREATE POLICY "Admins can view all profiles via JWT"
ON public.profiles 
FOR SELECT 
USING (is_current_user_admin());

CREATE POLICY "Admins can update all profiles via JWT"
ON public.profiles 
FOR UPDATE 
USING (is_current_user_admin())
WITH CHECK (is_current_user_admin());

CREATE POLICY "Admins can delete profiles via JWT"
ON public.profiles 
FOR DELETE 
USING (is_current_user_admin());