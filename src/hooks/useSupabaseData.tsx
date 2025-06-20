
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface Result<T> {
  data: T | null;
  error: any;
}

export interface Campus {
  id: string;
  name: string;
  address: string;
  created_at: string;
  updated_at: string;
}

export interface Faculty {
  id: string;
  name: string;
  dean_name: string;
  campus_id: string;
  created_at: string;
  updated_at: string;
  campus?: Campus;
  faculty_campus?: Array<{
    campus: Campus;
  }>;
}

export interface AcademicProgram {
  id: string;
  name: string;
  campus_id: string;
  faculty_id: string;
  director_name: string;
  director_email: string;
  manager_id?: string;
  created_at: string;
  updated_at: string;
  campus?: Campus;
  faculty?: Faculty;
  manager?: {
    id: string;
    full_name: string;
  };
}

export interface StrategicAxis {
  id: string;
  code: string;
  name: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Action {
  id: string;
  code: string;
  name: string;
  strategic_axis_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  strategic_axis?: StrategicAxis;
}

export interface Product {
  id: string;
  name: string;
  action_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  action?: Action & {
    strategic_axis?: StrategicAxis;
  };
}

export interface ReportTemplate {
  id: string;
  name: string;
  description?: string;
  strategic_axis_id?: string;
  action_id?: string;
  product_id?: string;
  strategic_axes_ids?: string[];
  actions_ids?: string[];
  products_ids?: string[];
  sharepoint_base_url?: string;
  max_versions: number;
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ManagerReportVersion {
  id: string;
  manager_report_id?: string;
  template_id?: string;
  version_number: number;
  progress_percentage?: number;
  observations?: string;
  evidence_links?: string[];
  sharepoint_folder_url?: string;
  submitted_at?: string;
  created_at: string;
  updated_at: string;
}

export interface DocumentTemplate {
  id: string;
  name: string;
  description?: string;
  template_type: 'pdf' | 'doc';
  template_content: string;
  file_url?: string;
  file_name?: string;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export function useSupabaseData() {
  const { profile } = useAuth();

  // Strategic Axes
  const fetchStrategicAxes = async (): Promise<Result<StrategicAxis[]>> => {
    const { data, error } = await supabase
      .from('strategic_axes')
      .select('*')
      .order('code');
    return { data: data || [], error };
  };

  const createStrategicAxis = async (axisData: Omit<StrategicAxis, 'id' | 'created_at' | 'updated_at'>): Promise<Result<StrategicAxis>> => {
    const { data, error } = await supabase
      .from('strategic_axes')
      .insert({
        ...axisData,
        created_by: profile?.id || ''
      })
      .select()
      .single();
    return { data, error };
  };

  // Actions
  const fetchActions = async (): Promise<Result<Action[]>> => {
    const { data, error } = await supabase
      .from('actions')
      .select(`
        *,
        strategic_axis:strategic_axes(*)
      `)
      .order('code');
    return { data: data || [], error };
  };

  const createAction = async (actionData: Omit<Action, 'id' | 'created_at' | 'updated_at'>): Promise<Result<Action>> => {
    const { data, error } = await supabase
      .from('actions')
      .insert({
        ...actionData,
        created_by: profile?.id || ''
      })
      .select()
      .single();
    return { data, error };
  };

  // Products
  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        action:actions(
          *,
          strategic_axis:strategic_axes(*)
        )
      `)
      .order('name');
    return { data: data || [], error };
  };

  const createProduct = async (productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Result<Product>> => {
    const { data, error } = await supabase
      .from('products')
      .insert({
        ...productData,
        created_by: profile?.id || ''
      })
      .select()
      .single();
    return { data, error };
  };

  // Campus Management
  const fetchCampus = async (): Promise<Result<Campus[]>> => {
    const { data, error } = await supabase
      .from('campus')
      .select('*')
      .order('name');
    return { data: data || [], error };
  };

  const createCampus = async (campusData: Omit<Campus, 'id' | 'created_at' | 'updated_at'>): Promise<Result<Campus>> => {
    const { data, error } = await supabase
      .from('campus')
      .insert(campusData)
      .select()
      .single();
    return { data, error };
  };

  const updateCampus = async (id: string, campusData: Partial<Campus>): Promise<Result<Campus>> => {
    const { data, error } = await supabase
      .from('campus')
      .update(campusData)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  };

  const deleteCampus = async (id: string): Promise<Result<null>> => {
    const { data, error } = await supabase
      .from('campus')
      .delete()
      .eq('id', id);
    return { data, error };
  };

  // Faculty Management
  const fetchFaculties = async (): Promise<Result<Faculty[]>> => {
    const { data, error } = await supabase
      .from('faculties')
      .select(`
        *,
        campus:campus(*),
        faculty_campus:faculty_campus(
          campus:campus(*)
        )
      `)
      .order('name');
    return { data: data || [], error };
  };

  const fetchFacultiesByCampus = async (campusIds?: string[]): Promise<Result<Faculty[]>> => {
    let query = supabase
      .from('faculties')
      .select(`
        *,
        campus:campus(*),
        faculty_campus:faculty_campus(
          campus:campus(*)
        )
      `);

    if (campusIds && campusIds.length > 0) {
      query = query.in('campus_id', campusIds);
    }

    const { data, error } = await query.order('name');
    return { data: data || [], error };
  };

  const createFaculty = async (facultyData: Omit<Faculty, 'id' | 'created_at' | 'updated_at'>): Promise<Result<Faculty>> => {
    const { data, error } = await supabase
      .from('faculties')
      .insert(facultyData)
      .select()
      .single();
    return { data, error };
  };

  const updateFaculty = async (id: string, facultyData: Partial<Faculty>): Promise<Result<Faculty>> => {
    const { data, error } = await supabase
      .from('faculties')
      .update(facultyData)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  };

  const deleteFaculty = async (id: string): Promise<Result<null>> => {
    const { data, error } = await supabase
      .from('faculties')
      .delete()
      .eq('id', id);
    return { data, error };
  };

  // Academic Programs
  const fetchAcademicPrograms = async (): Promise<Result<AcademicProgram[]>> => {
    const { data, error } = await supabase
      .from('academic_programs')
      .select(`
        *,
        campus:campus(*),
        faculty:faculties(*),
        manager:profiles(id, full_name)
      `)
      .order('name');
    return { data: data || [], error };
  };

  const fetchAcademicProgramsByCampus = async (campusIds?: string[]): Promise<Result<AcademicProgram[]>> => {
    let query = supabase
      .from('academic_programs')
      .select(`
        *,
        campus:campus(*),
        faculty:faculties(*),
        manager:profiles(id, full_name)
      `);

    if (campusIds && campusIds.length > 0) {
      query = query.in('campus_id', campusIds);
    }

    const { data, error } = await query.order('name');
    return { data: data || [], error };
  };

  const createAcademicProgram = async (programData: Omit<AcademicProgram, 'id' | 'created_at' | 'updated_at'>): Promise<Result<AcademicProgram>> => {
    const { data, error } = await supabase
      .from('academic_programs')
      .insert(programData)
      .select()
      .single();
    return { data, error };
  };

  const updateAcademicProgram = async (id: string, programData: Partial<AcademicProgram>): Promise<Result<AcademicProgram>> => {
    const { data, error } = await supabase
      .from('academic_programs')
      .update(programData)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  };

  const deleteAcademicProgram = async (id: string): Promise<Result<null>> => {
    const { data, error } = await supabase
      .from('academic_programs')
      .delete()
      .eq('id', id);
    return { data, error };
  };

  // User Management
  const fetchUsers = async (): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('full_name');
    return { data: data || [], error };
  };

  const fetchManagers = async (): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'Gestor')
      .order('full_name');
    return { data: data || [], error };
  };

  const fetchManagersByCampus = async (campusIds?: string[]): Promise<Result<any[]>> => {
    let query = supabase
      .from('profiles')
      .select('*');

    if (campusIds && campusIds.length > 0) {
      query = query.in('campus_id', campusIds);
    }

    const { data, error } = await query.order('full_name');
    return { data: data || [], error };
  };

  const updateManagerHours = async (managerId: string, weeklyHours: number, numberOfWeeks: number): Promise<Result<any>> => {
    const totalHours = weeklyHours * numberOfWeeks;
    const { data, error } = await supabase
      .from('profiles')
      .update({
        weekly_hours: weeklyHours,
        number_of_weeks: numberOfWeeks,
        total_hours: totalHours
      })
      .eq('id', managerId)
      .select()
      .single();
    return { data, error };
  };

  const getUserManagedCampus = async (userId: string): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('campus_id, managed_campus_ids')
      .eq('id', userId)
      .single();
    return { data, error };
  };

  // File Upload
  const uploadFile = async (file: File, folder: string): Promise<Result<string>> => {
    const fileName = `${Date.now()}_${file.name}`;
    const { data, error } = await supabase.storage
      .from('documents')
      .upload(`${folder}/${fileName}`, file);

    if (error) return { data: null, error };

    const { data: { publicUrl } } = supabase.storage
      .from('documents')
      .getPublicUrl(`${folder}/${fileName}`);

    return { data: publicUrl, error: null };
  };

  // Document Templates
  const fetchDocumentTemplates = async (): Promise<Result<DocumentTemplate[]>> => {
    const { data, error } = await supabase
      .from('document_templates')
      .select('*')
      .eq('is_active', true)
      .order('name');
    return { data: data || [], error };
  };

  const createDocumentTemplate = async (templateData: Omit<DocumentTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<Result<DocumentTemplate>> => {
    const { data, error } = await supabase
      .from('document_templates')
      .insert(templateData)
      .select()
      .single();
    return { data, error };
  };

  const updateDocumentTemplate = async (id: string, templateData: Partial<DocumentTemplate>): Promise<Result<DocumentTemplate>> => {
    const { data, error } = await supabase
      .from('document_templates')
      .update(templateData)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  };

  const deleteDocumentTemplate = async (id: string): Promise<Result<null>> => {
    const { data, error } = await supabase
      .from('document_templates')
      .update({ is_active: false })
      .eq('id', id);
    return { data, error };
  };

  // Report Periods
  const fetchReportPeriods = async (): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from('report_periods')
      .select('*')
      .eq('is_active', true)
      .order('start_date', { ascending: false });
    return { data: data || [], error };
  };

  const createReportPeriod = async (periodData: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from('report_periods')
      .insert({
        ...periodData,
        created_by: profile?.id || ''
      })
      .select()
      .single();
    return { data, error };
  };

  const updateReportPeriod = async (id: string, periodData: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from('report_periods')
      .update(periodData)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  };

  const deleteReportPeriod = async (id: string): Promise<Result<null>> => {
    const { data, error } = await supabase
      .from('report_periods')
      .update({ is_active: false })
      .eq('id', id);
    return { data, error };
  };

  // Report System Config
  const fetchReportSystemConfig = async (): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from('report_system_config')
      .select('*')
      .single();
    return { data, error };
  };

  const updateReportSystemConfig = async (configData: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from('report_system_config')
      .update(configData)
      .eq('id', configData.id)
      .select()
      .single();
    return { data, error };
  };

  // Report Templates
  const fetchReportTemplates = async (): Promise<Result<ReportTemplate[]>> => {
    const { data, error } = await supabase
      .from('report_templates')
      .select('*')
      .eq('is_active', true)
      .order('name');
    return { data: data || [], error };
  };

  const createReportTemplate = async (templateData: Omit<ReportTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<Result<ReportTemplate>> => {
    const { data, error } = await supabase
      .from('report_templates')
      .insert({
        ...templateData,
        created_by: profile?.id || ''
      })
      .select()
      .single();
    return { data, error };
  };

  const updateReportTemplate = async (id: string, templateData: Partial<ReportTemplate>): Promise<Result<ReportTemplate>> => {
    const { data, error } = await supabase
      .from('report_templates')
      .update(templateData)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  };

  const deleteReportTemplate = async (id: string): Promise<Result<null>> => {
    const { data, error } = await supabase
      .from('report_templates')
      .update({ is_active: false })
      .eq('id', id);
    return { data, error };
  };

  // Manager Report Versions
  const createManagerReportVersion = async (versionData: Omit<ManagerReportVersion, 'id' | 'created_at' | 'updated_at'>): Promise<Result<ManagerReportVersion>> => {
    const { data, error } = await supabase
      .from('manager_report_versions')
      .insert(versionData)
      .select()
      .single();
    return { data, error };
  };

  const updateManagerReportVersion = async (id: string, versionData: Partial<ManagerReportVersion>): Promise<Result<ManagerReportVersion>> => {
    const { data, error } = await supabase
      .from('manager_report_versions')
      .update(versionData)
      .eq('id', id)
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
    return { data: data || 1, error };
  };

  // Work Plans
  const fetchWorkPlans = async (): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from('work_plans')
      .select('*')
      .order('created_at', { ascending: false });
    return { data: data || [], error };
  };

  const createWorkPlan = async (workPlanData: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from('work_plans')
      .insert(workPlanData)
      .select()
      .single();
    return { data, error };
  };

  const updateWorkPlan = async (id: string, workPlanData: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from('work_plans')
      .update(workPlanData)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  };

  const fetchPendingWorkPlans = async (): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from('work_plans_with_manager')
      .select('*')
      .eq('status', 'submitted')
      .order('submitted_date', { ascending: false });
    return { data: data || [], error };
  };

  const approveWorkPlan = async (id: string, approvalData: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from('work_plans')
      .update({
        ...approvalData,
        status: 'approved',
        approved_date: new Date().toISOString(),
        approved_by: profile?.id
      })
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  };

  const fetchWorkPlanDetails = async (id: string): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from('work_plans')
      .select(`
        *,
        work_plan_assignments:work_plan_assignments(
          *,
          product:products(
            *,
            action:actions(
              *,
              strategic_axis:strategic_axes(*)
            )
          )
        )
      `)
      .eq('id', id)
      .single();
    return { data, error };
  };

  const upsertWorkPlanAssignment = async (assignmentData: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from('work_plan_assignments')
      .upsert(assignmentData, { onConflict: 'work_plan_id,product_id' })
      .select()
      .single();
    return { data, error };
  };

  // Manager Reports
  const fetchManagerReports = async (): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from('manager_reports')
      .select('*')
      .order('created_at', { ascending: false });
    return { data: data || [], error };
  };

  const fetchProductProgressReports = async (): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from('product_progress_reports')
      .select('*')
      .order('created_at', { ascending: false });
    return { data: data || [], error };
  };

  const deleteProductProgressReport = async (id: string): Promise<Result<null>> => {
    const { data, error } = await supabase
      .from('product_progress_reports')
      .delete()
      .eq('id', id);
    return { data, error };
  };

  // Template Based Reports
  const fetchTemplateBasedReports = async (): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from('template_based_reports_with_details')
      .select('*')
      .order('created_at', { ascending: false });
    return { data: data || [], error };
  };

  const createTemplateBasedReport = async (reportData: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from('template_based_reports')
      .insert(reportData)
      .select()
      .single();
    return { data, error };
  };

  const fetchTemplateReportResponses = async (reportId: string): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from('template_report_responses')
      .select('*')
      .eq('template_report_id', reportId)
      .order('created_at');
    return { data: data || [], error };
  };

  const upsertTemplateReportResponse = async (responseData: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from('template_report_responses')
      .upsert(responseData, { 
        onConflict: 'template_report_id,strategic_axis_id,action_id,product_id' 
      })
      .select()
      .single();
    return { data, error };
  };

  return {
    fetchStrategicAxes,
    createStrategicAxis,
    fetchActions,
    createAction,
    fetchProducts,
    createProduct,
    fetchCampus,
    createCampus,
    updateCampus,
    deleteCampus,
    fetchFaculties,
    fetchFacultiesByCampus,
    createFaculty,
    updateFaculty,
    deleteFaculty,
    fetchAcademicPrograms,
    fetchAcademicProgramsByCampus,
    createAcademicProgram,
    updateAcademicProgram,
    deleteAcademicProgram,
    fetchUsers,
    fetchManagers,
    fetchManagersByCampus,
    updateManagerHours,
    getUserManagedCampus,
    uploadFile,
    fetchDocumentTemplates,
    createDocumentTemplate,
    updateDocumentTemplate,
    deleteDocumentTemplate,
    fetchReportPeriods,
    createReportPeriod,
    updateReportPeriod,
    deleteReportPeriod,
    fetchReportSystemConfig,
    updateReportSystemConfig,
    fetchReportTemplates,
    createReportTemplate,
    updateReportTemplate,
    deleteReportTemplate,
    createManagerReportVersion,
    updateManagerReportVersion,
    getNextVersionNumber,
    fetchWorkPlans,
    createWorkPlan,
    updateWorkPlan,
    fetchPendingWorkPlans,
    approveWorkPlan,
    fetchWorkPlanDetails,
    upsertWorkPlanAssignment,
    fetchManagerReports,
    fetchProductProgressReports,
    deleteProductProgressReport,
    fetchTemplateBasedReports,
    createTemplateBasedReport,
    fetchTemplateReportResponses,
    upsertTemplateReportResponse,
  };
}
