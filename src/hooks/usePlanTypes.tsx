
import { supabase } from "@/integrations/supabase/client";
import type { Result } from "@/types/supabase";
import type { Database } from "@/integrations/supabase/types";

export function usePlanTypes() {
  const fetchPlanTypes = async (): Promise<Result<any[]>> => {
    const { data, error } = await supabase.from("plan_types").select("*").order("name");
    return { data, error };
  };

  const createPlanType = async (planType: Omit<Database["public"]["Tables"]["plan_types"]["Insert"], "created_by"> & { created_by?: string }): Promise<Result<any>> => {
    // Ensure created_by is set to a default value if not provided
    const planTypeWithCreatedBy = {
      ...planType,
      created_by: planType.created_by || "system"
    };
    const { data, error } = await supabase.from("plan_types").insert(planTypeWithCreatedBy).select().single();
    return { data, error };
  };

  const updatePlanType = async (id: string, updates: Database["public"]["Tables"]["plan_types"]["Update"]): Promise<Result<any>> => {
    const { data, error } = await supabase.from("plan_types").update(updates).eq("id", id).select().single();
    return { data, error };
  };

  const deletePlanType = async (id: string): Promise<Result<any>> => {
    const { data, error } = await supabase.from("plan_types").delete().eq("id", id);
    return { data, error };
  };

  const fetchPlanFields = async (planTypeId: string): Promise<Result<any[]>> => {
    const { data, error } = await supabase.from("plan_fields").select("*").eq("plan_type_id", planTypeId).order("field_order");
    return { data, error };
  };

  const createPlanField = async (planField: Database["public"]["Tables"]["plan_fields"]["Insert"]): Promise<Result<any>> => {
    const { data, error } = await supabase.from("plan_fields").insert(planField).select().single();
    return { data, error };
  };

  const updatePlanField = async (id: string, updates: Database["public"]["Tables"]["plan_fields"]["Update"]): Promise<Result<any>> => {
    const { data, error } = await supabase.from("plan_fields").update(updates).eq("id", id).select().single();
    return { data, error };
  };

  const deletePlanField = async (id: string): Promise<Result<any>> => {
    const { data, error } = await supabase.from("plan_fields").delete().eq("id", id);
    return { data, error };
  };

  const configurePlanTypeElements = async (planTypeId: string, config: any): Promise<Result<any>> => {
    try {
      // Delete existing configurations
      await supabase.from("plan_type_strategic_axes").delete().eq("plan_type_id", planTypeId);
      await supabase.from("plan_type_actions").delete().eq("plan_type_id", planTypeId);
      await supabase.from("plan_type_products").delete().eq("plan_type_id", planTypeId);

      // Insert new configurations
      if (config.strategicAxes?.length > 0) {
        const axesInserts = config.strategicAxes.map((axisId: string) => ({
          plan_type_id: planTypeId,
          strategic_axis_id: axisId,
          is_required: config.requiredStrategicAxes?.includes(axisId) || false
        }));
        await supabase.from("plan_type_strategic_axes").insert(axesInserts);
      }

      if (config.actions?.length > 0) {
        const actionsInserts = config.actions.map((actionId: string) => ({
          plan_type_id: planTypeId,
          action_id: actionId,
          is_required: config.requiredActions?.includes(actionId) || false
        }));
        await supabase.from("plan_type_actions").insert(actionsInserts);
      }

      if (config.products?.length > 0) {
        const productsInserts = config.products.map((productId: string) => ({
          plan_type_id: planTypeId,
          product_id: productId,
          is_required: config.requiredProducts?.includes(productId) || false
        }));
        await supabase.from("plan_type_products").insert(productsInserts);
      }

      return { data: { success: true }, error: null };
    } catch (error) {
      return { data: null, error };
    }
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
    configurePlanTypeElements,
  };
}
