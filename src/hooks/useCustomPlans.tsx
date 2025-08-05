import { supabase } from "@/integrations/supabase/client";
import type { Result } from "@/types/supabase";
import type { Database } from "@/integrations/supabase/types";

export function useCustomPlans() {
  const fetchCustomPlans = async (): Promise<Result<any[]>> => {
    try {
      const { data, error } = await supabase
        .from("custom_plans")
        .select(`
          *,
          plan_type:plan_types(*),
          profiles:manager_id(*)
        `)
        .order("created_at", { ascending: false });
      
      return { 
        data: data || [], 
        error 
      };
    } catch (error) {
      console.error("Error fetching custom plans:", error);
      return { 
        data: [], 
        error: error as any 
      };
    }
  };

  const fetchCustomPlansByManager = async (managerId: string): Promise<Result<any[]>> => {
    try {
      if (!managerId) {
        return { data: [], error: null };
      }
      
      const { data, error } = await supabase
        .from("custom_plans")
        .select(`
          *,
          plan_type:plan_types(*)
        `)
        .eq("manager_id", managerId)
        .order("created_at", { ascending: false });
      
      return { 
        data: data || [], 
        error 
      };
    } catch (error) {
      console.error("Error fetching custom plans by manager:", error);
      return { 
        data: [], 
        error: error as any 
      };
    }
  };

  const fetchCustomPlanDetails = async (planId: string): Promise<Result<any>> => {
    try {
      if (!planId) {
        return { data: null, error: new Error("Plan ID is required") };
      }
      
      const { data, error } = await supabase
        .from("custom_plans")
        .select(`
          *,
          plan_type:plan_type_id(*),
          responses:custom_plan_responses(*),
          assignments:custom_plan_assignments(*)
        `)
        .eq("id", planId)
        .single();
      
      if (error) {
        console.error("Supabase error fetching custom plan details:", error);
        return { data: null, error };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error("Error fetching custom plan details:", error);
      return { 
        data: null, 
        error: error as any 
      };
    }
  };

  const createCustomPlan = async (plan: Database["public"]["Tables"]["custom_plans"]["Insert"]): Promise<Result<any>> => {
    try {
      if (!plan.manager_id || !plan.plan_type_id) {
        return { 
          data: null, 
          error: new Error("Manager ID and Plan Type ID are required") 
        };
      }
      
      const { data, error } = await supabase
        .from("custom_plans")
        .insert(plan)
        .select()
        .single();
      
      return { data, error };
    } catch (error) {
      console.error("Error creating custom plan:", error);
      return { 
        data: null, 
        error: error as any 
      };
    }
  };

  const updateCustomPlan = async (id: string, updates: Database["public"]["Tables"]["custom_plans"]["Update"]): Promise<Result<any>> => {
    try {
      if (!id) {
        return { data: null, error: new Error("Plan ID is required") };
      }
      
      const { data, error } = await supabase
        .from("custom_plans")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      return { data, error };
    } catch (error) {
      console.error("Error updating custom plan:", error);
      return { 
        data: null, 
        error: error as any 
      };
    }
  };

  const submitCustomPlan = async (id: string): Promise<Result<any>> => {
    try {
      if (!id) {
        return { data: null, error: new Error("Plan ID is required") };
      }
      
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
    } catch (error) {
      console.error("Error submitting custom plan:", error);
      return { 
        data: null, 
        error: error as any 
      };
    }
  };

  const upsertCustomPlanResponse = async (response: Database["public"]["Tables"]["custom_plan_responses"]["Insert"]): Promise<Result<any>> => {
    try {
      if (!response.custom_plan_id || !response.plan_field_id) {
        return { 
          data: null, 
          error: new Error("Custom plan ID and plan field ID are required") 
        };
      }
      
      // Handle JSONB properly - database now expects proper JSON
      let processedValue = response.response_value;
      
      // Convert to proper JSONB format if needed
      if (typeof processedValue === 'string' && processedValue !== '') {
        try {
          // Try to parse as JSON first
          JSON.parse(processedValue);
          // If successful, keep as is (it's already valid JSON string)
        } catch {
          // If not valid JSON, wrap in quotes to make it a JSON string
          processedValue = JSON.stringify(processedValue);
        }
      } else if (typeof processedValue === 'object' && processedValue !== null) {
        // Convert object to JSON string
        processedValue = JSON.stringify(processedValue);
      } else if (processedValue === null || processedValue === undefined) {
        processedValue = null;
      }
      
      const { data, error } = await supabase
        .from("custom_plan_responses")
        .upsert({ 
          ...response, 
          response_value: processedValue 
        }, {
          onConflict: "custom_plan_id,plan_field_id"
        })
        .select()
        .single();
      
      if (error) {
        console.error('Supabase error in upsertCustomPlanResponse:', error);
        return { data: null, error };
      }
      
      console.log('Response upserted successfully:', data);
      return { data, error: null };
    } catch (error) {
      console.error("Error upserting custom plan response:", error);
      return { 
        data: null, 
        error: error as any 
      };
    }
  };

  const upsertCustomPlanAssignment = async (assignment: Database["public"]["Tables"]["custom_plan_assignments"]["Insert"]): Promise<Result<any>> => {
    try {
      if (!assignment.custom_plan_id || !assignment.product_id) {
        return { 
          data: null, 
          error: new Error("Custom plan ID and product ID are required") 
        };
      }
      
      const { data, error } = await supabase
        .from("custom_plan_assignments")
        .upsert(assignment, {
          onConflict: "custom_plan_id,product_id"
        })
        .select()
        .single();
      
      if (error) {
        console.error('Supabase error in upsertCustomPlanAssignment:', error);
        return { data: null, error };
      }
      
      console.log('Assignment upserted successfully:', data);
      return { data, error: null };
    } catch (error) {
      console.error("Error upserting custom plan assignment:", error);
      return { 
        data: null, 
        error: error as any 
      };
    }
  };
  
  const deleteCustomPlanAssignment = async (customPlanId: string, productId: string): Promise<Result<any>> => {
    try {
      if (!customPlanId || !productId) {
        return { 
          data: null, 
          error: new Error("Custom plan ID and product ID are required") 
        };
      }
      
      const { data, error } = await supabase
        .from("custom_plan_assignments")
        .delete()
        .eq("custom_plan_id", customPlanId)
        .eq("product_id", productId);
      
      return { data, error };
    } catch (error) {
      console.error("Error deleting custom plan assignment:", error);
      return { 
        data: null, 
        error: error as any 
      };
    }
  };

  const fetchCustomPlanAssignments = async (planId: string): Promise<Result<any[]>> => {
    try {
      // 💡 CAMBIO APLICADO AQUÍ
      if (!planId) {
        console.warn("DEBUG: planId es nulo o indefinido. No se realizará la consulta.");
        return { data: [], error: null };
      }
      
      const { data, error } = await supabase
        .from("custom_plan_assignments")
        .select(`
          *,
          product:product_id(
            *,
            action:action_id(
              *,
              strategic_axis:strategic_axis_id(*)
            )
          )
        `)
        .eq("custom_plan_id", planId);
      
      return { data: data || [], error };
    } catch (error) {
      console.error("Error fetching custom plan assignments:", error);
      return { 
        data: [], 
        error: error as any 
      };
    }
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
    fetchCustomPlanAssignments,
  };
}
