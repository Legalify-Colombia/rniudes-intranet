

import { supabase } from "@/integrations/supabase/client";
import type { Result } from "@/types/supabase";

export function usePlanTypes() {
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

  const configurePlanTypeElements = async (planTypeId: string, elements: any): Promise<Result<any>> => {
    // Implementation for configuring plan type elements
    return { data: null, error: null };
  };

  return {
    createPlanType,
    updatePlanType,
    deletePlanType,
    createPlanField,
    updatePlanField,
    deletePlanField,
    configurePlanTypeElements,
  };
}

