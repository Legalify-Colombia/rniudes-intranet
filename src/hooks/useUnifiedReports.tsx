
import { supabase } from "@/integrations/supabase/client";
import type { Result } from "@/types/supabase";

export function useUnifiedReports() {
  const fetchUnifiedReports = async (managerId: string): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from("unified_reports")
      .select("*")
      .eq("manager_id", managerId)
      .order("created_at", { ascending: false });
    return { data, error };
  };

  const fetchManagerReportsByManager = async (managerId: string): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from("manager_reports")
      .select(`
        *,
        manager:profiles!manager_reports_manager_id_fkey(*),
        report_period:report_periods(*),
        work_plan:custom_plans!manager_reports_work_plan_id_fkey(*)
      `)
      .eq("manager_id", managerId)
      .order("created_at", { ascending: false });
    return { data, error };
  };

  const deleteTemplateBasedReport = async (id: string): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("template_based_reports")
      .delete()
      .eq("id", id);
    return { data, error };
  };

  const submitTemplateBasedReport = async (reportId: string): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("template_based_reports")
      .update({ 
        status: 'submitted',
        submitted_date: new Date().toISOString()
      })
      .eq("id", reportId)
      .select()
      .single();
    return { data, error };
  };

  const checkPeriodActive = async (periodId: string): Promise<Result<boolean>> => {
    const { data, error } = await supabase
      .rpc('is_period_active', { period_id: periodId });
    return { data, error };
  };

  return {
    fetchUnifiedReports,
    fetchManagerReportsByManager,
    deleteTemplateBasedReport,
    submitTemplateBasedReport,
    checkPeriodActive
  };
}
