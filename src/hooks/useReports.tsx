
import { supabase } from "@/integrations/supabase/client";
import type { ManagerReport, ReportPeriod, Result } from "@/types/supabase";
import type { Database } from "@/integrations/supabase/types";

export function useReports() {
  // Manager Reports
  const fetchManagerReports = async (): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from("manager_reports")
      .select(`
        *,
        manager:profiles!manager_reports_manager_id_fkey(*),
        report_period:report_periods(*),
        work_plan:custom_plans!manager_reports_work_plan_id_fkey(*)
      `)
      .order("created_at", { ascending: false });
    return { data, error };
  };

  const updateManagerReport = async (id: string, updates: Database["public"]["Tables"]["manager_reports"]["Update"]): Promise<Result<ManagerReport>> => {
    const { data, error } = await supabase
      .from("manager_reports")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    return { data, error };
  };

  // Report Periods
  const fetchReportPeriods = async (): Promise<Result<ReportPeriod[]>> => {
    const { data, error } = await supabase
      .from("report_periods")
      .select("*")
      .order("start_date", { ascending: false });
    return { data, error };
  };

  const createReportPeriod = async (period: Database["public"]["Tables"]["report_periods"]["Insert"]): Promise<Result<ReportPeriod>> => {
    const { data, error } = await supabase.from("report_periods").insert(period).select().single();
    return { data, error };
  };

  const updateReportPeriod = async (id: string, updates: Database["public"]["Tables"]["report_periods"]["Update"]): Promise<Result<ReportPeriod>> => {
    const { data, error } = await supabase.from("report_periods").update(updates).eq("id", id).select().single();
    return { data, error };
  };

  const deleteReportPeriod = async (id: string): Promise<Result<any>> => {
    const { data, error } = await supabase.from("report_periods").delete().eq("id", id);
    return { data, error };
  };

  return {
    fetchManagerReports,
    updateManagerReport,
    fetchReportPeriods,
    createReportPeriod,
    updateReportPeriod,
    deleteReportPeriod,
  };
}
