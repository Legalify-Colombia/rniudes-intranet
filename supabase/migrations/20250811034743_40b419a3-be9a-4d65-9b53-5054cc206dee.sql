-- Allow admins and coordinators to create custom plans for any manager
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'custom_plans' 
      AND policyname = 'Admins and coordinators can create any custom plan'
  ) THEN
    CREATE POLICY "Admins and coordinators can create any custom plan"
    ON public.custom_plans
    FOR INSERT
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM public.profiles p 
        WHERE p.id = auth.uid() 
          AND p.role IN ('Administrador','Coordinador')
      )
    );
  END IF;
END $$;
