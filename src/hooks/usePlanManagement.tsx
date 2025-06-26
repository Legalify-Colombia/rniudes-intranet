
import { supabase } from "@/integrations/supabase/client";
import type { Result } from "@/types/supabase";

export function usePlanManagement() {
  const fetchPlanTypes = async (): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from("plan_types")
      .select("*")
      .eq("is_active", true)
      .order("name");
    return { data, error };
  };

  const createPlanType = async (planType: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("plan_types")
      .insert(planType)
      .select()
      .single();
    return { data, error };
  };

  const updatePlanType = async (id: string, updates: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("plan_types")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    return { data, error };
  };

  const deletePlanType = async (id: string): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("plan_types")
      .delete()
      .eq("id", id);
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

  const createPlanField = async (field: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("plan_fields")
      .insert(field)
      .select()
      .single();
    return { data, error };
  };

  const updatePlanField = async (id: string, updates: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("plan_fields")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    return { data, error };
  };

  const deletePlanField = async (id: string): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("plan_fields")
      .delete()
      .eq("id", id);
    return { data, error };
  };

  const fetchPlanTypeElements = async (planTypeId: string): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("plan_types")
      .select(`
        *,
        plan_type_strategic_axes(*),
        plan_type_actions(*),
        plan_type_products(*)
      `)
      .eq("id", planTypeId)
      .single();
    return { data, error };
  };

  const configurePlanTypeElements = async (planTypeId: string, elements: any): Promise<Result<any>> => {
    // This would need to be implemented based on your specific requirements
    // For now, returning a placeholder
    return { data: null, error: null };
  };

  return {
    fetchPlanTypes,
    createPlanType,
    updatePlanType,
    deletePlanType,
    fetchPlanFields,
    createPlanField,
    updatePlanField,
    deletePlanField,
    fetchPlanTypeElements,
    configurePlanTypeElements
  };
}
