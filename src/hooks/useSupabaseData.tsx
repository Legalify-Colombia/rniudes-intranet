
import { supabase } from "@/integrations/supabase/client";
import type { Result } from "@/types/supabase";

export function useSupabaseData() {
  // Strategic Axes
  const fetchStrategicAxes = async (): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from("strategic_axes")
      .select("*")
      .order("created_at");
    return { data, error };
  };

  // Actions
  const fetchActions = async (): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from("actions")
      .select("*")
      .order("created_at");
    return { data, error };
  };

  // Products
  const fetchProducts = async (): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at");
    return { data, error };
  };

  // Custom Plans
  const fetchCustomPlans = async (): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from("custom_plans")
      .select(`
        *,
        profiles:manager_id(*),
        plan_type:plan_type_id(*)
      `)
      .order("created_at", { ascending: false });
    return { data, error };
  };

  // Manager Reports
  const fetchManagerReports = async (): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from("manager_reports")
      .select(`
        *,
        manager:profiles!manager_reports_manager_id_fkey(*),
        report_period:report_periods(*),
        work_plan:custom_plans!manager_reports_work_plan_id_fkey(*)
      `)
      .order("created_at", { ascending: false });
    return { data, error };
  };

  // Managers
  const fetchManagers = async (): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", "Gestor")
      .order("full_name");
    return { data, error };
  };

  // Academic Programs
  const fetchAcademicPrograms = async (): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from("academic_programs")
      .select("*")
      .order("name");
    return { data, error };
  };

  // Campus
  const fetchCampus = async (): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from("campus")
      .select("*")
      .order("name");
    return { data, error };
  };

  // Faculties
  const fetchFaculties = async (): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from("faculties")
      .select("*")
      .order("name");
    return { data, error };
  };

  // Work Plans
  const fetchWorkPlans = async (): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from("custom_plans")
      .select(`
        *,
        profiles:manager_id(*),
        plan_type:plan_type_id(*)
      `)
      .order("created_at", { ascending: false });
    return { data, error };
  };

  // Create Manager Report
  const createManagerReport = async (report: any): Promise<Result<any>> => {
    // Validate work plan exists
    if (report.work_plan_id) {
      const { data: workPlan, error: workPlanError } = await supabase
        .from("custom_plans")
        .select("id")
        .eq("id", report.work_plan_id)
        .single();

      if (workPlanError || !workPlan) {
        console.error('Work plan validation failed:', workPlanError);
        return { 
          data: null, 
          error: { 
            message: 'Plan de trabajo no encontrado. Debe crear un plan antes de crear el informe.' 
          } 
        };
      }
    }

    const { data, error } = await supabase
      .from("manager_reports")
      .insert(report)
      .select(`
        *,
        manager:profiles!manager_reports_manager_id_fkey(*),
        work_plan:custom_plans!manager_reports_work_plan_id_fkey(*)
      `)
      .single();
    return { data, error };
  };

  // Work Plan Assignments
  const fetchWorkPlanAssignments = async (workPlanId: string): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from("custom_plan_assignments")
      .select(`
        *,
        strategic_axis:strategic_axes(*),
        action:actions(*),
        product:products(*)
      `)
      .eq("custom_plan_id", workPlanId)
      .order("created_at");
    return { data, error };
  };

  // Product Progress Reports
  const fetchProductProgressReports = async (reportId: string): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from("product_progress_reports")
      .select(`
        *,
        product:products(*),
        work_plan_assignment:custom_plan_assignments(*)
      `)
      .eq("manager_report_id", reportId)
      .order("created_at");
    return { data, error };
  };

  return {
    fetchStrategicAxes,
    fetchActions,
    fetchProducts,
    fetchCustomPlans,
    fetchManagerReports,
    fetchManagers,
    fetchAcademicPrograms,
    fetchCampus,
    fetchFaculties,
    fetchWorkPlans,
    createManagerReport,
    fetchWorkPlanAssignments,
    fetchProductProgressReports
  };
}
