-- Secure auto-report generation on plan approval and allow approvers to update plans

-- 1) Ensure the trigger function runs with elevated privileges and correct search_path
CREATE OR REPLACE FUNCTION public.generate_auto_reports_on_plan_approval()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
    -- Only generate when status turns to 'approved'
    IF NEW.status = 'approved' AND OLD.status IS DISTINCT FROM NEW.status THEN
        -- Insert auto-generated reports for configured templates and active periods
        INSERT INTO auto_generated_reports (custom_plan_id, template_id, manager_id, report_period_id, due_date)
        SELECT 
            NEW.id,
            rt.id,
            NEW.manager_id,
            rp.id,
            (NOW() + INTERVAL '30 days')::TIMESTAMP WITH TIME ZONE
        FROM report_templates rt
        CROSS JOIN report_periods rp
        WHERE rt.linked_plan_type_id = NEW.plan_type_id
          AND rt.auto_generate_on_approval = true
          AND rp.is_active = true
          AND rp.end_date >= CURRENT_DATE
        ON CONFLICT (custom_plan_id, template_id) DO NOTHING;
    END IF;
    
    RETURN NEW;
END;
$function$;

-- 2) Attach (or re-attach) the trigger to custom_plans updates
DROP TRIGGER IF EXISTS trg_generate_auto_reports_on_approval ON public.custom_plans;
CREATE TRIGGER trg_generate_auto_reports_on_approval
AFTER UPDATE ON public.custom_plans
FOR EACH ROW
EXECUTE FUNCTION public.generate_auto_reports_on_plan_approval();

-- 3) Add policy to allow legitimate approvers (admins/coordinators/directors per function) to update custom plans
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='custom_plans' AND policyname='Approvers can update custom plans'
  ) THEN
    CREATE POLICY "Approvers can update custom plans"
    ON public.custom_plans
    FOR UPDATE
    USING (public.can_approve_custom_plan(id, auth.uid()))
    WITH CHECK (public.can_approve_custom_plan(id, auth.uid()));
  END IF;
END $$;