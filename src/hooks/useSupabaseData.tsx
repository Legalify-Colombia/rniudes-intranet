
import { supabase } from "@/integrations/supabase/client";
import type { StrategicAxis, Action, Product, Result } from "@/types/supabase";
import type { Database } from "@/integrations/supabase/types";

export interface DocumentTemplate {
  id: string;
  name: string;
  description?: string;
  template_content: string;
  template_type: string;
  file_name?: string;
  file_url?: string;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ReportTemplate {
  id: string;
  name: string;
  description?: string;
  template_content: string;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ManagerReportVersion {
  id: string;
  manager_report_id: string;
  template_id: string;
  version_number: number;
  content: any;
  created_at: string;
}

export interface SniesReportTemplate {
  id: string;
  name: string;
  description?: string;
  template_structure: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

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

  // Campus
  const fetchCampus = async (): Promise<Result<any[]>> => {
    const { data, error } = await supabase.from("campus").select("*").order("name");
    return { data, error };
  };

  // Faculties
  const fetchFaculties = async (): Promise<Result<any[]>> => {
    const { data, error } = await supabase.from("faculties").select("*").order("name");
    return { data, error };
  };

  // Manager Reports
  const fetchManagerReports = async (): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from("manager_reports")
      .select(`
        *,
        manager:profiles!manager_reports_manager_id_fkey(*),
        report_period:report_periods(*)
      `)
      .order("created_at", { ascending: false });
    return { data, error };
  };

  const fetchManagerReportsByManager = async (managerId: string): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from("manager_reports")
      .select(`
        *,
        manager:profiles!manager_reports_manager_id_fkey(*),
        report_period:report_periods(*)
      `)
      .eq("manager_id", managerId)
      .order("created_at", { ascending: false });
    return { data, error };
  };

  const createManagerReport = async (report: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("manager_reports")
      .insert(report)
      .select()
      .single();
    return { data, error };
  };

  const updateManagerReport = async (reportId: string, updates: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("manager_reports")
      .update(updates)
      .eq("id", reportId)
      .select()
      .single();
    return { data, error };
  };

  // Report Periods
  const fetchReportPeriods = async (): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from("report_periods")
      .select("*")
      .order("start_date", { ascending: false });
    return { data, error };
  };

  const createReportPeriod = async (period: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("report_periods")
      .insert(period)
      .select()
      .single();
    return { data, error };
  };

  const updateReportPeriod = async (id: string, updates: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("report_periods")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    return { data, error };
  };

  const deleteReportPeriod = async (id: string): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("report_periods")
      .delete()
      .eq("id", id);
    return { data, error };
  };

  const fetchReportSystemConfig = async (): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("report_system_config")
      .select("*")
      .single();
    return { data, error };
  };

  const updateReportSystemConfig = async (config: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("report_system_config")
      .upsert(config)
      .select()
      .single();
    return { data, error };
  };

  // Product Progress Reports
  const fetchProductProgressReports = async (reportId: string): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from("product_progress_reports")
      .select(`
        *,
        product:products(*),
        work_plan_assignment:work_plan_assignments(*)
      `)
      .eq("manager_report_id", reportId)
      .order("created_at");
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

  // File Upload - Fixed to match expected signature
  const uploadFile = async (file: File, bucket: string, fileName?: string): Promise<Result<any>> => {
    const finalFileName = fileName || `${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(finalFileName, file);
    
    if (error) return { data: null, error };
    
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(finalFileName);
    
    return { data: { ...data, publicUrl }, error: null };
  };

  // Indicators
  const fetchIndicators = async (): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from("indicators")
      .select("*")
      .eq("is_active", true)
      .order("name");
    return { data, error };
  };

  const createIndicator = async (indicator: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("indicators")
      .insert(indicator)
      .select()
      .single();
    return { data, error };
  };

  const updateIndicator = async (id: string, updates: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("indicators")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    return { data, error };
  };

  const deleteIndicator = async (id: string): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("indicators")
      .delete()
      .eq("id", id);
    return { data, error };
  };

  const fetchIndicatorReport = async (reportId: string): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("indicator_reports")
      .select(`
        *,
        responses:indicator_responses(*)
      `)
      .eq("id", reportId)
      .single();
    return { data, error };
  };

  const createIndicatorReport = async (report: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("indicator_reports")
      .insert(report)
      .select()
      .single();
    return { data, error };
  };

  const updateIndicatorReport = async (id: string, updates: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("indicator_reports")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    return { data, error };
  };

  const submitIndicatorReport = async (reportId: string): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("indicator_reports")
      .update({ 
        status: "submitted",
        submitted_date: new Date().toISOString()
      })
      .eq("id", reportId)
      .select()
      .single();
    return { data, error };
  };

  const deleteIndicatorReport = async (id: string): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("indicator_reports")
      .delete()
      .eq("id", id);
    return { data, error };
  };

  // Document Templates
  const fetchDocumentTemplates = async (): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from("document_templates")
      .select("*")
      .eq("is_active", true)
      .order("name");
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

  // Template Based Reports
  const fetchUnifiedReports = async (managerId: string): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from("unified_reports")
      .select("*")
      .eq("manager_id", managerId)
      .order("created_at", { ascending: false });
    return { data, error };
  };

  const deleteTemplateBasedReport = async (id: string): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("template_based_reports")
      .delete()
      .eq("id", id);
    return { data, error };
  };

  const submitTemplateBasedReport = async (reportId: string): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("template_based_reports")
      .update({ 
        status: "submitted",
        submitted_date: new Date().toISOString()
      })
      .eq("id", reportId)
      .select()
      .single();
    return { data, error };
  };

  const checkPeriodActive = async (periodId: string): Promise<Result<boolean>> => {
    const { data, error } = await supabase
      .rpc('is_period_active', { period_id: periodId });
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

  const fetchWorkPlans = async (): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from("custom_plans")
      .select(`
        *,
        manager:profiles!custom_plans_manager_id_fkey(*),
        plan_type:plan_types(*)
      `)
      .order("created_at", { ascending: false });
    return { data, error };
  };

  const fetchWorkPlanAssignments = async (workPlanId: string): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from("work_plan_assignments")
      .select(`
        *,
        product:products!work_plan_assignments_product_id_fkey(
          *,
          action:actions!products_action_id_fkey(
            *,
            strategic_axis:strategic_axes!actions_strategic_axis_id_fkey(*)
          )
        )
      `)
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

  // Plan Types Management
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

  const configurePlanTypeElements = async (planTypeId: string, config: any): Promise<Result<any>> => {
    // This would be a more complex function that configures strategic axes, actions, and products for a plan type
    // For now, just return a placeholder
    return { data: null, error: null };
  };

  // Report Templates
  const fetchReportTemplates = async (): Promise<Result<ReportTemplate[]>> => {
    const { data, error } = await supabase
      .from("report_templates")
      .select("*")
      .eq("is_active", true)
      .order("name");
    return { data, error };
  };

  const createReportTemplate = async (template: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("report_templates")
      .insert(template)
      .select()
      .single();
    return { data, error };
  };

  const updateReportTemplate = async (id: string, updates: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("report_templates")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    return { data, error };
  };

  const deleteReportTemplate = async (id: string): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("report_templates")
      .delete()
      .eq("id", id);
    return { data, error };
  };

  // Manager Report Versions
  const createManagerReportVersion = async (version: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("manager_report_versions")
      .insert(version)
      .select()
      .single();
    return { data, error };
  };

  const updateManagerReportVersion = async (id: string, updates: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("manager_report_versions")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    return { data, error };
  };

  const getNextVersionNumber = async (managerReportId: string, templateId: string): Promise<Result<number>> => {
    const { data, error } = await supabase
      .rpc('get_next_version_number', {
        p_manager_report_id: managerReportId,
        p_template_id: templateId
      });
    return { data, error };
  };

  // SNIES functions
  const fetchSniesCountries = async (): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from("snies_countries")
      .select("*")
      .order("name");
    return { data, error };
  };

  const fetchSniesMunicipalities = async (): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from("snies_municipalities")
      .select("*")
      .order("name");
    return { data, error };
  };

  const fetchSniesDocumentTypes = async (): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from("snies_document_types")
      .select("*")
      .order("name");
    return { data, error };
  };

  const fetchSniesBiologicalSex = async (): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from("snies_biological_sex")
      .select("*")
      .order("name");
    return { data, error };
  };

  const fetchSniesMaritalStatus = async (): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from("snies_marital_status")
      .select("*")
      .order("name");
    return { data, error };
  };

  const createSniesCountry = async (country: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("snies_countries")
      .insert(country)
      .select()
      .single();
    return { data, error };
  };

  const createSniesMunicipality = async (municipality: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("snies_municipalities")
      .insert(municipality)
      .select()
      .single();
    return { data, error };
  };

  const bulkCreateSniesCountries = async (countries: any[]): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from("snies_countries")
      .insert(countries)
      .select();
    return { data, error };
  };

  const bulkCreateSniesMunicipalities = async (municipalities: any[]): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from("snies_municipalities")
      .insert(municipalities)
      .select();
    return { data, error };
  };

  const fetchSniesReportTemplates = async (): Promise<Result<SniesReportTemplate[]>> => {
    const { data, error } = await supabase
      .from("snies_report_templates")
      .select("*")
      .eq("is_active", true)
      .order("name");
    return { data, error };
  };

  const consolidateSniesReports = async (templateId: string, periodId: string): Promise<Result<any>> => {
    // This would be a complex function to consolidate SNIES reports
    // For now, just return a placeholder
    return { data: null, error: null };
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
    // Campus
    fetchCampus,
    // Faculties
    fetchFaculties,
    // Manager Reports
    fetchManagerReports,
    fetchManagerReportsByManager,
    createManagerReport,
    updateManagerReport,
    // Report Periods
    fetchReportPeriods,
    createReportPeriod,
    updateReportPeriod,
    deleteReportPeriod,
    fetchReportSystemConfig,
    updateReportSystemConfig,
    // Product Progress Reports
    fetchProductProgressReports,
    upsertProductProgressReport,
    deleteProductProgressReport,
    // File Upload
    uploadFile,
    // Indicators
    fetchIndicators,
    createIndicator,
    updateIndicator,
    deleteIndicator,
    fetchIndicatorReport,
    createIndicatorReport,
    updateIndicatorReport,
    submitIndicatorReport,
    deleteIndicatorReport,
    // Document Templates
    fetchDocumentTemplates,
    createDocumentTemplate,
    updateDocumentTemplate,
    deleteDocumentTemplate,
    // Template Based Reports
    fetchUnifiedReports,
    deleteTemplateBasedReport,
    submitTemplateBasedReport,
    checkPeriodActive,
    // Managers
    fetchManagers,
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
    // Plan Types Management
    createPlanType,
    updatePlanType,
    deletePlanType,
    createPlanField,
    updatePlanField,
    deletePlanField,
    configurePlanTypeElements,
    // Report Templates
    fetchReportTemplates,
    createReportTemplate,
    updateReportTemplate,
    deleteReportTemplate,
    // Manager Report Versions
    createManagerReportVersion,
    updateManagerReportVersion,
    getNextVersionNumber,
    // SNIES functions
    fetchSniesCountries,
    fetchSniesMunicipalities,
    fetchSniesDocumentTypes,
    fetchSniesBiologicalSex,
    fetchSniesMaritalStatus,
    createSniesCountry,
    createSniesMunicipality,
    bulkCreateSniesCountries,
    bulkCreateSniesMunicipalities,
    fetchSniesReportTemplates,
    consolidateSniesReports,
  };
}
