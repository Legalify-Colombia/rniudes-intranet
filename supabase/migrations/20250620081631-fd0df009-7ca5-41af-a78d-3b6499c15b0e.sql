
-- Add campus_id to profiles table to associate users with campus
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS campus_id uuid REFERENCES public.campus(id);

-- Add managed_campus_ids array to allow admins to manage multiple campus
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS managed_campus_ids uuid[] DEFAULT NULL;

-- Add index for better performance on campus queries
CREATE INDEX IF NOT EXISTS idx_profiles_campus_id ON public.profiles(campus_id);
CREATE INDEX IF NOT EXISTS idx_profiles_managed_campus_ids ON public.profiles USING GIN(managed_campus_ids);

-- Update the handle_new_user function to include campus_id
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, document_number, email, position, role, weekly_hours, number_of_weeks, total_hours, campus_id)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'full_name', ''),
    COALESCE(new.raw_user_meta_data ->> 'document_number', ''),
    new.email,
    COALESCE(new.raw_user_meta_data ->> 'position', ''),
    COALESCE(new.raw_user_meta_data ->> 'role', ''),
    COALESCE((new.raw_user_meta_data ->> 'weekly_hours')::integer, NULL),
    COALESCE((new.raw_user_meta_data ->> 'number_of_weeks')::integer, 16),
    COALESCE((new.raw_user_meta_data ->> 'total_hours')::integer, NULL),
    COALESCE((new.raw_user_meta_data ->> 'campus_id')::uuid, NULL)
  );
  RETURN new;
END;
$$;

-- Add a function to check if an admin can manage a specific campus
CREATE OR REPLACE FUNCTION public.can_manage_campus(admin_id uuid, target_campus_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_role text;
  admin_managed_campus_ids uuid[];
BEGIN
  SELECT role, managed_campus_ids 
  INTO admin_role, admin_managed_campus_ids
  FROM public.profiles 
  WHERE id = admin_id;
  
  -- Super admin can manage all campus
  IF admin_role = 'Administrador' AND admin_managed_campus_ids IS NULL THEN
    RETURN true;
  END IF;
  
  -- Check if the campus is in the managed list
  IF admin_role = 'Administrador' AND target_campus_id = ANY(admin_managed_campus_ids) THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;
