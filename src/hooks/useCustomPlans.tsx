
import { supabase } from "@/integrations/supabase/client";
import type { Result } from "@/types/supabase";

export function useCustomPlans() {
  const fetchCustomPlanDetails = async (planId: string): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("custom_plans")
      .select(`
        *,
        profiles:manager_id(*),
        plan_type:plan_type_id(*)
      `)
      .eq("id", planId)
      .single();
    return { data, error };
  };

  const fetchPlanFields = async (planTypeId: string): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from("plan_fields")
      .select("*")
      .eq("plan_type_id", planTypeId)
      .order("field_order");
    return { data, error };
  };

  const updateCustomPlan = async (id: string, updates: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("custom_plans")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    return { data, error };
  };

  const submitCustomPlan = async (planId: string): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("custom_plans")
      .update({ 
        status: 'submitted',
        submitted_date: new Date().toISOString()
      })
      .eq("id", planId)
      .select()
      .single();
    return { data, error };
  };

  const upsertCustomPlanResponse = async (response: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("custom_plan_responses")
      .upsert(response)
      .select()
      .single();
    return { data, error };
  };

  const createCustomPlan = async (plan: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("custom_plans")
      .insert(plan)
      .select()
      .single();
    return { data, error };
  };

  const fetchCustomPlansByManager = async (managerId: string): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from("custom_plans")
      .select("*")
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

  const deleteCustomPlanAssignment = async (id: string): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("custom_plan_assignments")
      .delete()
      .eq("id", id);
    return { data, error };
  };

  const fetchCustomPlanAssignments = async (planId: string): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from("custom_plan_assignments")
      .select("*")
      .eq("custom_plan_id", planId);
    return { data, error };
  };

  // Alias for compatibility with WorkPlanForm
  const upsertWorkPlanAssignment = upsertCustomPlanAssignment;

  return {
    fetchCustomPlanDetails,
    fetchPlanFields,
    updateCustomPlan,
    submitCustomPlan,
    upsertCustomPlanResponse,
    createCustomPlan,
    fetchCustomPlansByManager,
    upsertCustomPlanAssignment,
    deleteCustomPlanAssignment,
    fetchCustomPlanAssignments,
    upsertWorkPlanAssignment
  };
}
