
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

  const fetchManagerReportsByManager = async (managerId: string): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from("manager_reports")
      .select(`
        *,
        manager:profiles!manager_reports_manager_id_fkey(*),
        report_period:report_periods(*)
      `)
      .eq("manager_id", managerId)
      .order("created_at", { ascending: false });
    return { data, error };
  };

  const createManagerReport = async (report: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("manager_reports")
      .insert(report)
      .select()
      .single();
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

  const fetchReportSystemConfig = async (): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("report_system_config")
      .select("*")
      .single();
    return { data, error };
  };

  const updateReportSystemConfig = async (config: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("report_system_config")
      .upsert(config)
      .select()
      .single();
    return { data, error };
  };

  const checkPeriodActive = async (periodId: string): Promise<Result<boolean>> => {
    const { data, error } = await supabase
      .rpc('is_period_active', { period_id: periodId });
    return { data, error };
  };

  // Report Templates
  const fetchReportTemplates = async (): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from("report_templates")
      .select("*")
      .eq("is_active", true)
      .order("name");
    return { data, error };
  };

  const createReportTemplate = async (template: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("report_templates")
      .insert(template)
      .select()
      .single();
    return { data, error };
  };

  const updateReportTemplate = async (id: string, updates: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("report_templates")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    return { data, error };
  };

  const deleteReportTemplate = async (id: string): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("report_templates")
      .delete()
      .eq("id", id);
    return { data, error };
  };

  // Manager Report Versions
  const createManagerReportVersion = async (version: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("manager_report_versions")
      .insert(version)
      .select()
      .single();
    return { data, error };
  };

  const updateManagerReportVersion = async (id: string, updates: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("manager_report_versions")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    return { data, error };
  };

  const getNextVersionNumber = async (managerReportId: string, templateId: string): Promise<Result<number>> => {
    const { data, error } = await supabase
      .rpc('get_next_version_number', {
        p_manager_report_id: managerReportId,
        p_template_id: templateId
      });
    return { data, error };
  };

  return {
    fetchManagerReports,
    fetchManagerReportsByManager,
    createManagerReport,
    updateManagerReport,
    fetchReportPeriods,
    createReportPeriod,
    updateReportPeriod,
    deleteReportPeriod,
    fetchReportSystemConfig,
    updateReportSystemConfig,
    checkPeriodActive,
    fetchReportTemplates,
    createReportTemplate,
    updateReportTemplate,
    deleteReportTemplate,
    createManagerReportVersion,
    updateManagerReportVersion,
    getNextVersionNumber,
  };
}
