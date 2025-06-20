import { supabase } from "@/integrations/supabase/client";
import type { StrategicAxis, Action, Product, Result } from "@/types/supabase";
import type { Database } from "@/integrations/supabase/types";

export function useSupabaseData() {
  // Strategic Axes
  const fetchStrategicAxes = async (): Promise<Result<StrategicAxis[]>> => {
    const { data, error } = await supabase.from("strategic_axes").select("*").order("name");
    return { data, error };
  };

  const createStrategicAxis = async (axis: Database["public"]["Tables"]["strategic_axes"]["Insert"]): Promise<Result<StrategicAxis>> => {
    const { data, error } = await supabase.from("strategic_axes").insert(axis).select().single();
    return { data, error };
  };

  const updateStrategicAxis = async (id: string, updates: Database["public"]["Tables"]["strategic_axes"]["Update"]): Promise<Result<StrategicAxis>> => {
    const { data, error } = await supabase.from("strategic_axes").update(updates).eq("id", id).select().single();
    return { data, error };
  };

  const deleteStrategicAxis = async (id: string): Promise<Result<any>> => {
    const { data, error } = await supabase.from("strategic_axes").delete().eq("id", id);
    return { data, error };
  };

  // Actions
  const fetchActions = async (): Promise<Result<Action[]>> => {
    const { data, error } = await supabase.from("actions").select("*").order("name");
    return { data, error };
  };

  const createAction = async (action: Database["public"]["Tables"]["actions"]["Insert"]): Promise<Result<Action>> => {
    const { data, error } = await supabase.from("actions").insert(action).select().single();
    return { data, error };
  };

  const updateAction = async (id: string, updates: Database["public"]["Tables"]["actions"]["Update"]): Promise<Result<Action>> => {
    const { data, error } = await supabase.from("actions").update(updates).eq("id", id).select().single();
    return { data, error };
  };

  const deleteAction = async (id: string): Promise<Result<any>> => {
    const { data, error } = await supabase.from("actions").delete().eq("id", id);
    return { data, error };
  };

  // Products
  const fetchProducts = async (): Promise<Result<Product[]>> => {
    const { data, error } = await supabase.from("products").select("*").order("name");
    return { data, error };
  };

  const createProduct = async (product: Database["public"]["Tables"]["products"]["Insert"]): Promise<Result<Product>> => {
    const { data, error } = await supabase.from("products").insert(product).select().single();
    return { data, error };
  };

  const updateProduct = async (id: string, updates: Database["public"]["Tables"]["products"]["Update"]): Promise<Result<Product>> => {
    const { data, error } = await supabase.from("products").update(updates).eq("id", id).select().single();
    return { data, error };
  };

  const deleteProduct = async (id: string): Promise<Result<any>> => {
    const { data, error } = await supabase.from("products").delete().eq("id", id);
    return { data, error };
  };

  const fetchWorkPlans = async (): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from("custom_plans")
      .select(`
        *,
        manager:profiles!custom_plans_manager_id_fkey(*)
      `)
      .order("created_at", { ascending: false });
    return { data, error };
  };

  const fetchWorkPlanAssignments = async (workPlanId: string): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from("work_plan_assignments")
      .select("*")
      .eq("work_plan_id", workPlanId);
    return { data, error };
  };

  const createWorkPlan = async (plan: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("custom_plans")
      .insert(plan)
      .select()
      .single();
    return { data, error };
  };

  const updateWorkPlan = async (planId: string, updates: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("custom_plans")
      .update(updates)
      .eq("id", planId)
      .select()
      .single();
    return { data, error };
  };

  const upsertWorkPlanAssignment = async (assignment: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("work_plan_assignments")
      .upsert(assignment)
      .select()
      .single();
    return { data, error };
  };

  const fetchAcademicPrograms = async (): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from("academic_programs")
      .select("*")
      .order("name");
    return { data, error };
  };

  // Custom Plans functions
  const fetchCustomPlanDetails = async (planId: string): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("custom_plans")
      .select(`
        *,
        plan_type:plan_types(*),
        responses:custom_plan_responses(*)
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

  const updateCustomPlan = async (planId: string, updates: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("custom_plans")
      .update(updates)
      .eq("id", planId)
      .select()
      .single();
    return { data, error };
  };

  const submitCustomPlan = async (planId: string): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("custom_plans")
      .update({ 
        status: "submitted",
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

  const fetchPlanTypes = async (): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from("plan_types")
      .select("*")
      .eq("is_active", true)
      .eq("is_visible", true)
      .order("name");
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

  return {
    // Strategic Axes
    fetchStrategicAxes,
    createStrategicAxis,
    updateStrategicAxis,
    deleteStrategicAxis,
    // Actions
    fetchActions,
    createAction,
    updateAction,
    deleteAction,
    // Products
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    fetchWorkPlans,
    fetchWorkPlanAssignments,
    createWorkPlan,
    updateWorkPlan,
    upsertWorkPlanAssignment,
    fetchAcademicPrograms,
    fetchCustomPlanDetails,
    fetchPlanFields,
    updateCustomPlan,
    submitCustomPlan,
    upsertCustomPlanResponse,
    fetchPlanTypes,
    createCustomPlan,
  };
}
