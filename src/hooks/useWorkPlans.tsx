
import { supabase } from "@/integrations/supabase/client";
import type { CustomPlan, Result } from "@/types/supabase";

export function useWorkPlans() {
  const fetchPendingWorkPlans = async (): Promise<Result<CustomPlan[]>> => {
    const { data, error } = await supabase
      .from("custom_plans")
      .select(`
        *,
        profiles:manager_id(*)
      `)
      .eq("status", "submitted")
      .order("submitted_date", { ascending: false });
    return { data, error };
  };

  const approveWorkPlan = async (planId: string, approvedBy: string, comments?: string): Promise<Result<CustomPlan>> => {
    const { data, error } = await supabase
      .from("custom_plans")
      .update({
        status: "approved",
        approved_by: approvedBy,
        approved_date: new Date().toISOString(),
        approval_comments: comments
      })
      .eq("id", planId)
      .select()
      .single();
    return { data, error };
  };

  const createWorkPlan = async (workPlan: any): Promise<Result<CustomPlan>> => {
    const { data, error } = await supabase
      .from("custom_plans")
      .insert(workPlan)
      .select()
      .single();
    return { data, error };
  };

  const updateWorkPlan = async (id: string, updates: any): Promise<Result<CustomPlan>> => {
    const { data, error } = await supabase
      .from("custom_plans")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    return { data, error };
  };

  const upsertWorkPlanAssignment = async (assignment: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("custom_plan_assignments")
      .upsert(assignment)
      .select()
      .single();
    return { data, error };
  };

  return {
    fetchPendingWorkPlans,
    approveWorkPlan,
    createWorkPlan,
    updateWorkPlan,
    upsertWorkPlanAssignment,
  };
}
