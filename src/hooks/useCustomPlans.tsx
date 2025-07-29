
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
      
      // Usar la función optimizada de base de datos
      const { data, error } = await supabase.rpc("get_complete_work_plan_details", {
        plan_id: planId
      });
      
      if (error) return { data: null, error };
      
      // Retornar el primer resultado ya que la función devuelve una tabla
      const planDetails = data && data.length > 0 ? data[0] : null;
      return { data: planDetails, error: null };
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
      
      const { data, error } = await supabase
        .from("custom_plan_responses")
        .upsert(response, {
          onConflict: "custom_plan_id,plan_field_id"
        })
        .select()
        .single();
      
      return { data, error };
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
      
      console.log('Attempting to upsert assignment:', assignment);
      
      // Usar la constraint única correcta que acabamos de crear
      const { data, error } = await supabase
        .from("custom_plan_assignments")
        .upsert(assignment, {
          onConflict: "custom_plan_id,product_id"
        })
        .select()
        .single();
      
      if (error) {
        console.error('Supabase error in upsertCustomPlanAssignment:', error);
        
        // Si hay error de constraint, intentar con INSERT/UPDATE manual
        if (error.code === "42P10") {
          console.log('Fallback: trying manual insert/update');
          
          // Primero intentar actualizar
          const { data: updateData, error: updateError } = await supabase
            .from("custom_plan_assignments")
            .update({ assigned_hours: assignment.assigned_hours })
            .eq("custom_plan_id", assignment.custom_plan_id)
            .eq("product_id", assignment.product_id)
            .select()
            .single();
          
          if (updateError && updateError.code === "PGRST116") {
            // No existe, crear nuevo
            const { data: insertData, error: insertError } = await supabase
              .from("custom_plan_assignments")
              .insert(assignment)
              .select()
              .single();
            
            if (insertError) {
              console.error('Insert fallback failed:', insertError);
              return { data: null, error: insertError };
            }
            
            console.log('Assignment created via fallback:', insertData);
            return { data: insertData, error: null };
          } else if (updateError) {
            console.error('Update fallback failed:', updateError);
            return { data: null, error: updateError };
          } else {
            console.log('Assignment updated via fallback:', updateData);
            return { data: updateData, error: null };
          }
        }
        
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
      if (!planId) {
        return { data: [], error: new Error("Plan ID is required") };
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
