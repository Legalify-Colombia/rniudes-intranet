import { supabase } from "@/integrations/supabase/client";
import type { Result } from "@/types/supabase";
import type { Database } from "@/integrations/supabase/types";

export function usePlanTypes() {
  const fetchPlanTypes = async (): Promise<Result<any[]>> => {
    const { data, error } = await supabase.from("plan_types").select("*").order("name");
    return { data, error };
  };

  const createPlanType = async (planType: Omit<Database["public"]["Tables"]["plan_types"]["Insert"], "created_by"> & { 
    created_by?: string;
    uses_structured_elements?: boolean;
    allow_custom_fields?: boolean;
    allow_structured_elements?: boolean;
  }): Promise<Result<any>> => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { data: null, error: new Error("Usuario no autenticado") };
    }

    const planTypeWithCreatedBy = {
      ...planType,
      created_by: user.id
    };
    
    const { data, error } = await supabase.from("plan_types").insert(planTypeWithCreatedBy).select().single();
    return { data, error };
  };

  const updatePlanType = async (id: string, updates: Database["public"]["Tables"]["plan_types"]["Update"] & { 
    uses_structured_elements?: boolean;
    allow_custom_fields?: boolean;
    allow_structured_elements?: boolean;
  }): Promise<Result<any>> => {
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

  const fetchPlanTypeElements = async (planTypeId: string): Promise<Result<any>> => {
    try {
      const [axesResult, actionsResult, productsResult] = await Promise.all([
        supabase.from("plan_type_strategic_axes")
          .select("*, strategic_axes(*)")
          .eq("plan_type_id", planTypeId),
        supabase.from("plan_type_actions")
          .select("*, actions(*)")
          .eq("plan_type_id", planTypeId),
        supabase.from("plan_type_products")
          .select("*, products(*)")
          .eq("plan_type_id", planTypeId)
      ]);

    return {
      data: {
        strategicAxes: axesResult.data || [],
        actions: actionsResult.data || [],
        products: productsResult.data || []
      },
      error: axesResult.error || actionsResult.error || productsResult.error
    };
    } catch (error) {
      return { data: null, error };
    }
  };

  const configurePlanTypeElements = async (planTypeId: string, config: {
    strategicAxes: string[];
    actions: string[];
    products: string[];
    requiredStrategicAxes?: string[];
    requiredActions?: string[];
    requiredProducts?: string[];
  }): Promise<Result<any>> => {
    try {
      await Promise.all([
        supabase.from("plan_type_strategic_axes").delete().eq("plan_type_id", planTypeId),
        supabase.from("plan_type_actions").delete().eq("plan_type_id", planTypeId),
        supabase.from("plan_type_products").delete().eq("plan_type_id", planTypeId)
      ]);

      const insertPromises = [];

      if (config.strategicAxes?.length > 0) {
        const axesInserts = config.strategicAxes.map((axisId: string) => ({
          plan_type_id: planTypeId,
          strategic_axis_id: axisId,
          is_required: config.requiredStrategicAxes?.includes(axisId) || false
        }));
        insertPromises.push(supabase.from("plan_type_strategic_axes").insert(axesInserts));
      }

      if (config.actions?.length > 0) {
        const actionsInserts = config.actions.map((actionId: string) => ({
          plan_type_id: planTypeId,
          action_id: actionId,
          is_required: config.requiredActions?.includes(actionId) || false
        }));
        insertPromises.push(supabase.from("plan_type_actions").insert(actionsInserts));
      }

      if (config.products?.length > 0) {
        const productsInserts = config.products.map((productId: string) => ({
          plan_type_id: planTypeId,
          product_id: productId,
          is_required: config.requiredProducts?.includes(productId) || false
        }));
        insertPromises.push(supabase.from("plan_type_products").insert(productsInserts));
      }

      if (insertPromises.length > 0) {
        await Promise.all(insertPromises);
      }

      return { data: { success: true }, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  // NUEVA FUNCIÓN: Obtiene los tipos de planes disponibles para un gestor
  const getAvailablePlanTypesForManager = async (managerId: string): Promise<Result<any[]>> => {
    try {
      const { data: managerProfiles, error: profilesError } = await supabase
        .from("profiles")
        .select("academic_program_id")
        .eq("id", managerId)
        .single();
    
      if (profilesError) {
        console.error("Error fetching manager profiles:", profilesError);
        return { data: [], error: profilesError };
      }
    
      if (!managerProfiles || !managerProfiles.academic_program_id) {
        return { data: [], error: null };
      }
    
      const { data: planTypes, error: planTypesError } = await supabase
        .from("plan_type_academic_programs")
        .select(`
          plan_types (
            id,
            name,
            uses_structured_elements
          )
        `)
        .eq("academic_program_id", managerProfiles.academic_program_id);
    
      if (planTypesError) {
        console.error("Error fetching available plan types:", planTypesError);
        return { data: [], error: planTypesError };
      }

      const formattedData = planTypes.map(item => item.plan_types);
    
      return { data: formattedData, error: null };
    } catch (error) {
      console.error("Unexpected error in getAvailablePlanTypesForManager:", error);
      return { data: [], error: { message: "Unexpected error", details: "Could not fetch plan types." } };
    }
  };

  const fetchPlanTypeTemplateFields = async (planTypeId: string, templateId: string): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from("plan_type_template_fields")
      .select("*")
      .eq("plan_type_id", planTypeId)
      .eq("template_id", templateId)
      .order("field_order");
    return { data, error };
  };

  const upsertPlanTypeTemplateField = async (field: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("plan_type_template_fields")
      .upsert(field)
      .select()
      .single();
    return { data, error };
  };

  const deletePlanTypeTemplateField = async (fieldId: string): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("plan_type_template_fields")
      .delete()
      .eq("id", fieldId);
    return { data, error };
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
    configurePlanTypeElements,
    getAvailablePlanTypesForManager, // Exponemos la nueva función
    fetchPlanTypeTemplateFields,
    upsertPlanTypeTemplateField,
    deletePlanTypeTemplateField,
  };
}

