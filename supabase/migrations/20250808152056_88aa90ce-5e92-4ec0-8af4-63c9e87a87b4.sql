-- Enable RLS and add policies to allow gestores (managers) to access and edit their own reports and assignments

-- 1) custom_plans: managers can view their own plans
DO $$ BEGIN
  EXECUTE 'ALTER TABLE public.custom_plans ENABLE ROW LEVEL SECURITY';
EXCEPTION WHEN others THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Managers can view their own custom plans"
    ON public.custom_plans
    FOR SELECT
    USING (manager_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2) manager_reports: managers can create, view and update their own draft reports
DO $$ BEGIN
  EXECUTE 'ALTER TABLE public.manager_reports ENABLE ROW LEVEL SECURITY';
EXCEPTION WHEN others THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Managers can view their own manager reports"
    ON public.manager_reports
    FOR SELECT
    USING (manager_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Managers can create their own manager reports"
    ON public.manager_reports
    FOR INSERT
    WITH CHECK (manager_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Managers can update their own draft manager reports"
    ON public.manager_reports
    FOR UPDATE
    USING (manager_id = auth.uid() AND status = 'draft')
    WITH CHECK (manager_id = auth.uid() AND status = 'draft');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 3) custom_plan_assignments: managers can view assignments for their own plans
DO $$ BEGIN
  EXECUTE 'ALTER TABLE public.custom_plan_assignments ENABLE ROW LEVEL SECURITY';
EXCEPTION WHEN others THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Managers can view assignments of their custom plans"
    ON public.custom_plan_assignments
    FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM public.custom_plans cp
        WHERE cp.id = custom_plan_id AND cp.manager_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 4) product_progress_reports: managers can manage product progress for their own reports while draft
DO $$ BEGIN
  EXECUTE 'ALTER TABLE public.product_progress_reports ENABLE ROW LEVEL SECURITY';
EXCEPTION WHEN others THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Managers can view their product progress reports"
    ON public.product_progress_reports
    FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM public.manager_reports mr
        WHERE mr.id = manager_report_id AND mr.manager_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Managers can insert their product progress reports (when report is draft)"
    ON public.product_progress_reports
    FOR INSERT
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM public.manager_reports mr
        WHERE mr.id = manager_report_id AND mr.manager_id = auth.uid() AND mr.status = 'draft'
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Managers can update their product progress reports (when report is draft)"
    ON public.product_progress_reports
    FOR UPDATE
    USING (
      EXISTS (
        SELECT 1 FROM public.manager_reports mr
        WHERE mr.id = manager_report_id AND mr.manager_id = auth.uid() AND mr.status = 'draft'
      )
    )
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM public.manager_reports mr
        WHERE mr.id = manager_report_id AND mr.manager_id = auth.uid() AND mr.status = 'draft'
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;