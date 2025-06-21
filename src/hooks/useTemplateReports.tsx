
import { supabase } from "@/integrations/supabase/client";
import type { Result } from "@/types/supabase";

export function useTemplateReports() {
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
      .select("*")
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

  const fetchWorkPlanDetails = async (workPlanId: string): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("custom_plans")
      .select(`
        *,
        plan_type:plan_types(*),
        responses:custom_plan_responses(*)
      `)
      .eq("id", workPlanId)
      .single();
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
        status: "submitted",
        submitted_date: new Date().toISOString()
      })
      .eq("id", reportId)
      .select()
      .single();
    return { data, error };
  };

  const fetchUnifiedReports = async (managerId: string): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from("unified_reports")
      .select("*")
      .eq("manager_id", managerId)
      .order("created_at", { ascending: false });
    return { data, error };
  };

  return {
    createTemplateBasedReport,
    fetchTemplateBasedReportDetails,
    updateTemplateBasedReport,
    fetchWorkPlanDetails,
    deleteTemplateBasedReport,
    submitTemplateBasedReport,
    fetchUnifiedReports,
  };
}
