
import { supabase } from "@/integrations/supabase/client";
import type { Result } from "@/types/supabase";

export function useSupabaseData() {
  const fetchStrategicAxes = async (): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from("strategic_axes")
      .select("*")
      .order("created_at");
    return { data, error };
  };

  const fetchActions = async (): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from("actions")
      .select("*")
      .order("created_at");
    return { data, error };
  };

  const fetchProducts = async (): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at");
    return { data, error };
  };

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

  const fetchManagers = async (): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", "Gestor")
      .order("full_name");
    return { data, error };
  };

  const fetchAcademicPrograms = async (): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from("academic_programs")
      .select("*")
      .order("name");
    return { data, error };
  };

  const fetchCampus = async (): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from("campus")
      .select("*")
      .order("name");
    return { data, error };
  };

  const fetchFaculties = async (): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from("faculties")
      .select("*")
      .order("name");
    return { data, error };
  };

  const fetchReportPeriods = async (): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from("report_periods")
      .select("*")
      .order("created_at", { ascending: false });
    return { data, error };
  };

  const fetchIndicators = async (): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from("indicators")
      .select("*")
      .order("name");
    return { data, error };
  };

  const fetchIndicatorReport = async (reportId: string): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("indicator_reports")
      .select("*")
      .eq("id", reportId)
      .single();
    return { data, error };
  };

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

  const fetchCustomPlanDetails = async (planId: string): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("custom_plans")
      .select(`
        *,
        profiles:manager_id(*),
        plan_type:plan_type_id(*)
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

  const fetchPlanTypes = async (): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from("plan_types")
      .select("*")
      .eq("is_active", true)
      .order("name");
    return { data, error };
  };

  const fetchDocumentTemplates = async (): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from("document_templates")
      .select("*")
      .order("created_at", { ascending: false });
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

  const updateCustomPlan = async (id: string, updates: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("custom_plans")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    return { data, error };
  };

  const createAction = async (action: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("actions")
      .insert(action)
      .select()
      .single();
    return { data, error };
  };

  const updateAction = async (id: string, updates: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("actions")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    return { data, error };
  };

  const deleteAction = async (id: string): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("actions")
      .delete()
      .eq("id", id);
    return { data, error };
  };

  const createDocumentTemplate = async (template: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("document_templates")
      .insert(template)
      .select()
      .single();
    return { data, error };
  };

  const updateDocumentTemplate = async (id: string, updates: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("document_templates")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    return { data, error };
  };

  const deleteDocumentTemplate = async (id: string): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("document_templates")
      .delete()
      .eq("id", id);
    return { data, error };
  };

  const submitCustomPlan = async (planId: string): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("custom_plans")
      .update({ 
        status: 'submitted',
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

  const updateManagerReport = async (id: string, updates: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("manager_reports")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
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

  const uploadFile = async (file: File, bucket: string, fileName: string): Promise<Result<any>> => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file);
    
    if (error) return { data: null, error };
    
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);
    
    return { data: { publicUrl }, error: null };
  };

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

  const upsertWorkPlanAssignment = async (assignment: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("custom_plan_assignments")
      .upsert(assignment)
      .select()
      .single();
    return { data, error };
  };

  const fetchSniesReports = async (): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from("snies_reports")
      .select(`
        *,
        template:snies_report_templates(*),
        manager:profiles(*)
      `)
      .order("created_at", { ascending: false });
    return { data, error };
  };

  const fetchSniesReportTemplates = async (): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from("snies_report_templates")
      .select("*")
      .order("name");
    return { data, error };
  };

  const createSniesReport = async (report: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("snies_reports")
      .insert(report)
      .select()
      .single();
    return { data, error };
  };

  const updateSniesReport = async (id: string, updates: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("snies_reports")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    return { data, error };
  };

  const fetchSniesReportData = async (reportId: string): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from("snies_report_data")
      .select("*")
      .eq("report_id", reportId)
      .order("row_index");
    return { data, error };
  };

  const upsertSniesReportData = async (reportData: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("snies_report_data")
      .upsert(reportData)
      .select()
      .single();
    return { data, error };
  };

  const fetchSniesTemplateFields = async (templateId: string): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from("snies_template_fields")
      .select("*")
      .eq("template_id", templateId)
      .order("field_order");
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
    fetchReportPeriods,
    fetchIndicators,
    fetchIndicatorReport,
    fetchWorkPlans,
    fetchCustomPlanDetails,
    fetchPlanFields,
    fetchPlanTypes,
    fetchDocumentTemplates,
    createCustomPlan,
    updateCustomPlan,
    createAction,
    updateAction,
    deleteAction,
    createDocumentTemplate,
    updateDocumentTemplate,
    deleteDocumentTemplate,
    submitCustomPlan,
    upsertCustomPlanResponse,
    updateManagerReport,
    upsertProductProgressReport,
    deleteProductProgressReport,
    uploadFile,
    createManagerReport,
    fetchWorkPlanAssignments,
    upsertWorkPlanAssignment,
    fetchSniesReports,
    fetchSniesReportTemplates,
    createSniesReport,
    updateSniesReport,
    fetchSniesReportData,
    upsertSniesReportData,
    fetchSniesTemplateFields,
    fetchProductProgressReports
  };
}
