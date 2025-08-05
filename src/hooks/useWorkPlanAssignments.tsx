import { supabase } from "@/integrations/supabase/client";
import type { Result } from "@/types/supabase";
import type { Database } from "@/integrations/supabase/types";

export function useCustomPlanAssignments() {
  const fetchCustomPlanAssignments = async (customPlanId: string): Promise<Result<any[]>> => {
    console.log("DEBUG: Fetching custom plan assignments for customPlanId:", customPlanId);
    
    try {
      const { data, error } = await supabase
        .from("custom_plan_assignments")
        .select(`
          *,
          product:products (
            id, 
            name,
            action:actions (
              id, 
              name, 
              code,
              strategic_axis:strategic_axes (id, name, code)
            )
          )
        `)
        .eq("custom_plan_id", customPlanId)
        .order("created_at", { ascending: true });
      
      console.log("DEBUG: Supabase query result:", { data, error });

      if (error) {
        console.error("DEBUG: Supabase query error:", error);
      } else if (!data || data.length === 0) {
        console.warn("DEBUG: No assignments found for this customPlanId.");
      }

      return { data, error };
    } catch (e) {
      console.error("DEBUG: Unexpected error during fetchCustomPlanAssignments:", e);
      return { data: null, error: { message: "Unexpected error" } };
    }
  };

  const fetchProductProgressReports = async (reportId: string): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from("product_progress_reports")
      .select(`
        *,
        product:products(*)
      `)
      .eq("manager_report_id", reportId)
      .order("created_at", { ascending: false });
    return { data, error };
  };

  const upsertProductProgressReport = async (report: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("product_progress_reports")
      .upsert(report)
      .select()
      .single();
    return { data, error };
  };

  const deleteProductProgressReport = async (id: string): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("product_progress_reports")
      .delete()
      .eq("id", id);
    return { data, error };
  };

  const fetchManagerReportsByManager = async (managerId: string): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from("manager_reports")
      .select(`
        *,
        report_period:report_periods(*),
        work_plan:custom_plans!manager_reports_work_plan_id_fkey(*)
      `)
      .eq("manager_id", managerId)
      .order("created_at", { ascending: false });
    return { data, error };
  };

  const upsertCustomPlanAssignment = async (assignment: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("custom_plan_assignments")
      .upsert(assignment)
      .select()
      .single();
    return { data, error };
  };

  const deleteCustomPlanAssignment = async (planId: string, productId: string): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("custom_plan_assignments")
      .delete()
      .eq("custom_plan_id", planId)
      .eq("product_id", productId);
    return { data, error };
  };

  return {
    fetchCustomPlanAssignments,
    fetchWorkPlanAssignments: fetchCustomPlanAssignments, // Alias for backward compatibility
    fetchProductProgressReports,
    upsertProductProgressReport,
    deleteProductProgressReport,
    fetchManagerReportsByManager,
    upsertCustomPlanAssignment,
    upsertWorkPlanAssignment: upsertCustomPlanAssignment, // Alias for backward compatibility
    deleteCustomPlanAssignment,
  };
}
