
import { supabase } from "@/integrations/supabase/client";
import type { Result } from "@/types/supabase";
import type { Database } from "@/integrations/supabase/types";

export function useCustomPlans() {
  const fetchCustomPlans = async (): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from("custom_plans")
      .select(`
        *,
        plan_type:plan_types(*),
        profiles:manager_id(*)
      `)
      .order("created_at", { ascending: false });
    return { data, error };
  };

  const fetchCustomPlansByManager = async (managerId: string): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from("custom_plans")
      .select(`
        *,
        plan_type:plan_types(*)
      `)
      .eq("manager_id", managerId)
      .order("created_at", { ascending: false });
    return { data, error };
  };

  const fetchCustomPlanDetails = async (planId: string): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("custom_plans")
      .select(`
        *,
        plan_type:plan_types(*),
        responses:custom_plan_responses(*),
        assignments:custom_plan_assignments(*)
      `)
      .eq("id", planId)
      .single();
    return { data, error };
  };

  const createCustomPlan = async (plan: Database["public"]["Tables"]["custom_plans"]["Insert"]): Promise<Result<any>> => {
    const { data, error } = await supabase.from("custom_plans").insert(plan).select().single();
    return { data, error };
  };

  const updateCustomPlan = async (id: string, updates: Database["public"]["Tables"]["custom_plans"]["Update"]): Promise<Result<any>> => {
    const { data, error } = await supabase.from("custom_plans").update(updates).eq("id", id).select().single();
    return { data, error };
  };

  const submitCustomPlan = async (id: string): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("custom_plans")
      .update({ 
        status: "submitted",
        submitted_date: new Date().toISOString()
      })
      .eq("id", id)
      .select()
      .single();
    return { data, error };
  };

  const upsertCustomPlanResponse = async (response: Database["public"]["Tables"]["custom_plan_responses"]["Insert"]): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("custom_plan_responses")
      .upsert(response, {
        onConflict: "custom_plan_id,plan_field_id"
      })
      .select()
      .single();
    return { data, error };
  };

  const upsertCustomPlanAssignment = async (assignment: Database["public"]["Tables"]["custom_plan_assignments"]["Insert"]): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("custom_plan_assignments")
      .upsert(assignment, {
        onConflict: "custom_plan_id,product_id"
      })
      .select()
      .single();
    return { data, error };
  };

  const deleteCustomPlanAssignment = async (customPlanId: string, productId: string): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("custom_plan_assignments")
      .delete()
      .eq("custom_plan_id", customPlanId)
      .eq("product_id", productId);
    return { data, error };
  };

  return {
    fetchCustomPlans,
    fetchCustomPlansByManager,
    fetchCustomPlanDetails,
    createCustomPlan,
    updateCustomPlan,
    submitCustomPlan,
    upsertCustomPlanResponse,
    upsertCustomPlanAssignment,
    deleteCustomPlanAssignment,
  };
}
