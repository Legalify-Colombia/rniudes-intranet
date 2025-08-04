import { supabase } from "@/integrations/supabase/client";
import type { Result } from "@/types/supabase";
import type { Database } from "@/integrations/supabase/types";

export function useWorkPlanAssignments() {
  const fetchWorkPlanAssignments = async (customPlanId: string): Promise<Result<any[]>> => {
    // La consulta ha sido corregida para traer las relaciones anidadas
    const { data, error } = await supabase
      .from("custom_plan_assignments")
      .select(`
        *,
        product:products (
          *,
          action:actions (
            *,
            strategic_axis:strategic_axes (*)
          )
        )
      `)
      .eq("custom_plan_id", customPlanId)
      .order("created_at", { ascending: true });
    return { data, error };
  };

  const fetchProductProgressReports = async (reportId: string): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from("product_progress_reports")
      .select(`
        *,
        product:products(*),
        work_plan_assignment:custom_plan_assignments(*)
      `)
      .eq("manager_report_id", reportId)
      .order("created_at", { ascending: false });
    return { data, error };
  };

  const upsertProductProgressReport = async (report: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("product_progress_reports")
      .upsert(report)
      .select()
      .single();
    return { data, error };
  };

  const deleteProductProgressReport = async (id: string): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("product_progress_reports")
      .delete()
      .eq("id", id);
    return { data, error };
  };

  const fetchManagerReportsByManager = async (managerId: string): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from("manager_reports")
      .select(`
        *,
        report_period:report_periods(*),
        work_plan:custom_plans!manager_reports_work_plan_id_fkey(*)
      `)
      .eq("manager_id", managerId)
      .order("created_at", { ascending: false });
    return { data, error };
  };

  // CORRECCIÓN: La función para guardar asignaciones ahora apunta a la tabla correcta
  const upsertCustomPlanAssignment = async (assignment: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("custom_plan_assignments") // Tabla corregida
      .upsert(assignment)
      .select()
      .single();
    return { data, error };
  };

  // NUEVA FUNCIÓN: Elimina una asignación de plan
  const deleteCustomPlanAssignment = async (planId: string, productId: string): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("custom_plan_assignments") // Tabla corregida
      .delete()
      .eq("custom_plan_id", planId)
      .eq("product_id", productId);
    return { data, error };
  };

  return {
    fetchWorkPlanAssignments,
    fetchProductProgressReports,
    upsertProductProgressReport,
    deleteProductProgressReport,
    fetchManagerReportsByManager,
    upsertCustomPlanAssignment, // Exponemos la función corregida
    deleteCustomPlanAssignment, // Exponemos la nueva función
  };
}
