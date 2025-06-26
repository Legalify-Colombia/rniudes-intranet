
import { supabase } from "@/integrations/supabase/client";
import type { Result } from "@/types/supabase";

export interface ManagerReportVersion {
  id: string;
  manager_report_id: string;
  template_id: string;
  version_number: number;
  progress_percentage: number;
  sharepoint_folder_url?: string;
  evidence_links: string[];
  observations?: string;
  created_at: string;
  updated_at: string;
}

export function useReportSystem() {
  const fetchReportSystemConfig = async (): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("report_system_config")
      .select("*")
      .single();
    return { data, error };
  };

  const updateReportSystemConfig = async (updates: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("report_system_config")
      .update(updates)
      .select()
      .single();
    return { data, error };
  };

  const createManagerReportVersion = async (version: Omit<ManagerReportVersion, 'id' | 'created_at' | 'updated_at'>): Promise<Result<ManagerReportVersion>> => {
    const { data, error } = await supabase
      .from("manager_report_versions")
      .insert(version)
      .select()
      .single();
    return { data, error };
  };

  const fetchManagerReportVersions = async (reportId: string): Promise<Result<ManagerReportVersion[]>> => {
    const { data, error } = await supabase
      .from("manager_report_versions")
      .select("*")
      .eq("manager_report_id", reportId)
      .order("version_number", { ascending: false });
    return { data, error };
  };

  const updateManagerReportVersion = async (id: string, updates: Partial<ManagerReportVersion>): Promise<Result<ManagerReportVersion>> => {
    const { data, error } = await supabase
      .from("manager_report_versions")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    return { data, error };
  };

  const fetchReportPeriods = async (): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from("report_periods")
      .select("*")
      .order("start_date", { ascending: false });
    return { data, error };
  };

  const createReportPeriod = async (period: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("report_periods")
      .insert(period)
      .select()
      .single();
    return { data, error };
  };

  const updateReportPeriod = async (id: string, updates: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("report_periods")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    return { data, error };
  };

  const deleteReportPeriod = async (id: string): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("report_periods")
      .delete()
      .eq("id", id);
    return { data, error };
  };

  const createTemplateBasedReport = async (report: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("template_based_reports")
      .insert(report)
      .select()
      .single();
    return { data, error };
  };

  const fetchTemplateBasedReportDetails = async (reportId: string): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("template_based_reports")
      .select(`
        *,
        profiles:manager_id(*),
        report_periods:report_period_id(*)
      `)
      .eq("id", reportId)
      .single();
    return { data, error };
  };

  const updateTemplateBasedReport = async (id: string, updates: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("template_based_reports")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
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

  const fetchWorkPlanDetails = async (planId: string): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("work_plans")
      .select(`
        *,
        profiles:manager_id(*)
      `)
      .eq("id", planId)
      .single();
    return { data, error };
  };

  const updateWorkPlan = async (id: string, updates: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("work_plans")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    return { data, error };
  };

  const fetchIndicatorReport = async (reportId: string): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("indicator_reports")
      .select(`
        *,
        profiles:manager_id(*)
      `)
      .eq("id", reportId)
      .single();
    return { data, error };
  };

  const updateIndicatorReport = async (id: string, updates: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("indicator_reports")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    return { data, error };
  };

  const submitIndicatorReport = async (reportId: string): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("indicator_reports")
      .update({ 
        status: 'submitted',
        submitted_date: new Date().toISOString()
      })
      .eq("id", reportId)
      .select()
      .single();
    return { data, error };
  };

  const checkPeriodActive = async (periodId: string): Promise<boolean> => {
    const { data } = await supabase
      .rpc('is_period_active', { period_id: periodId });
    return data || false;
  };

  return {
    fetchReportSystemConfig,
    updateReportSystemConfig,
    createManagerReportVersion,
    fetchManagerReportVersions,
    updateManagerReportVersion,
    fetchReportPeriods,
    createReportPeriod,
    updateReportPeriod,
    deleteReportPeriod,
    createTemplateBasedReport,
    fetchTemplateBasedReportDetails,
    updateTemplateBasedReport,
    submitTemplateBasedReport,
    fetchWorkPlanDetails,
    updateWorkPlan,
    fetchIndicatorReport,
    updateIndicatorReport,
    submitIndicatorReport,
    checkPeriodActive
  };
}
