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

export interface SniesDocumentType {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
}

export interface SniesCountry {
  id: string;
  name: string;
  alpha_3?: string;
  alpha_2?: string;
  is_active: boolean;
  created_at: string;
}

export interface SniesMunicipality {
  id: string;
  name: string;
  country_id?: string;
  department_code?: string;
  is_active: boolean;
  created_at: string;
}

export interface SniesReportTemplate {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface SniesTemplateField {
  id: string;
  template_id: string;
  field_name: string;
  field_label: string;
  field_type: 'text' | 'numeric' | 'relation';
  relation_table?: string;
  relation_id_field?: string;
  relation_display_field?: string;
  is_required: boolean;
  field_order: number;
  created_at: string;
}

export interface SniesReport {
  id: string;
  template_id: string;
  manager_id: string;
  title: string;
  status: 'draft' | 'submitted' | 'reviewed';
  submitted_date?: string;
  created_at: string;
  updated_at: string;
}

export const useSupabaseData = () => {
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

  const updateStrategicAxis = async (id: string, axisData: Partial<StrategicAxis>): Promise<Result<StrategicAxis>> => {
    const { data, error } = await supabase
      .from('strategic_axes')
      .update(axisData)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  };

  const deleteStrategicAxis = async (id: string): Promise<Result<null>> => {
    const { data, error } = await supabase
      .from('strategic_axes')
      .delete()
      .eq('id', id);
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

  const updateAction = async (id: string, actionData: Partial<Action>): Promise<Result<Action>> => {
    const { data, error } = await supabase
      .from('actions')
      .update(actionData)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  };

  const deleteAction = async (id: string): Promise<Result<null>> => {
    const { data, error } = await supabase
      .from('actions')
      .delete()
      .eq('id', id);
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

  const updateProduct = async (id: string, productData: Partial<Product>): Promise<Result<Product>> => {
    const { data, error } = await supabase
      .from('products')
      .update(productData)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  };

  const deleteProduct = async (id: string): Promise<Result<null>> => {
    const { data, error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
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

  // Managers Management
  const fetchManagers = async (): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        campus:campus(*),
        academic_programs:academic_programs(
          *,
          campus:campus(*),
          faculty:faculties(*)
        )
      `)
      .eq('role', 'Gestor')
      .order('full_name');
    return { data: data || [], error };
  };

  const fetchManagersByCampus = async (campusIds?: string[]): Promise<Result<any[]>> => {
    let query = supabase
      .from('profiles')
      .select(`
        *,
        campus:campus(*),
        academic_programs:academic_programs(
          *,
          campus:campus(*),
          faculty:faculties(*)
        )
      `)
      .eq('role', 'Gestor');

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

  // Users Management
  const fetchUsers = async (): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        campus:campus(*)
      `)
      .order('full_name');
    return { data: data || [], error };
  };

  const fetchUsersByCampus = async (campusIds?: string[]): Promise<Result<any[]>> => {
    let query = supabase
      .from('profiles')
      .select(`
        *,
        campus:campus(*)
      `);

    if (campusIds && campusIds.length > 0) {
      query = query.in('campus_id', campusIds);
    }

    const { data, error } = await query.order('full_name');
    return { data: data || [], error };
  };

  const updateUser = async (id: string, userData: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from('profiles')
      .update(userData)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  };

  const updateUserCampusAccess = async (userId: string, campusIds: string[]): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from('profiles')
      .update({ managed_campus_ids: campusIds })
      .eq('id', userId)
      .select()
      .single();
    return { data, error };
  };

  const deleteUser = async (id: string): Promise<Result<null>> => {
    const { data, error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id);
    return { data, error };
  };

  // File Upload
  const uploadFile = async (file: File, bucket: string, fileName?: string): Promise<Result<{ publicUrl: string }>> => {
    const fileNameToUse = fileName || `${Date.now()}_${file.name}`;
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileNameToUse, file);

    if (error) {
      return { data: null, error };
    }

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileNameToUse);

    return { data: { publicUrl }, error: null };
  };

  // Document Templates
  const fetchDocumentTemplates = async (): Promise<Result<DocumentTemplate[]>> => {
    const { data, error } = await supabase
      .from('document_templates')
      .select('*')
      .eq('is_active', true)
      .order('name');
    return { data: (data || []).map(item => ({ ...item, template_type: item.template_type as 'pdf' | 'doc' })), error };
  };

  const createDocumentTemplate = async (templateData: Omit<DocumentTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<Result<DocumentTemplate>> => {
    const { data, error } = await supabase
      .from('document_templates')
      .insert(templateData)
      .select()
      .single();
    return { data: data ? { ...data, template_type: data.template_type as 'pdf' | 'doc' } : null, error };
  };

  const updateDocumentTemplate = async (id: string, templateData: Partial<DocumentTemplate>): Promise<Result<DocumentTemplate>> => {
    const { data, error } = await supabase
      .from('document_templates')
      .update(templateData)
      .eq('id', id)
      .select()
      .single();
    return { data: data ? { ...data, template_type: data.template_type as 'pdf' | 'doc' } : null, error };
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
      .from('work_plans_with_manager')
      .select('*')
      .order('created_at', { ascending: false });
    return { data: data || [], error };
  };

  const fetchPendingWorkPlans = async (): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from('work_plans_with_manager')
      .select('*')
      .eq('status', 'submitted')
      .order('submitted_date', { ascending: true });
    return { data: data || [], error };
  };

  const fetchWorkPlanDetails = async (workPlanId: string): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from('work_plans')
      .select(`
        *,
        program:academic_programs(
          *,
          campus:campus(*),
          faculty:faculties(*)
        ),
        manager:profiles(*)
      `)
      .eq('id', workPlanId)
      .single();
    return { data, error };
  };

  const fetchWorkPlanAssignments = async (workPlanId: string): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from('work_plan_assignments')
      .select(`
        *,
        product:products(
          *,
          action:actions(
            *,
            strategic_axis:strategic_axes(*)
          )
        )
      `)
      .eq('work_plan_id', workPlanId)
      .order('created_at');
    return { data: data || [], error };
  };

  const createWorkPlan = async (workPlanData: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from('work_plans')
      .insert({
        ...workPlanData,
        manager_id: profile?.id || ''
      })
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

  const approveWorkPlan = async (id: string, status: 'approved' | 'rejected', comments?: string): Promise<Result<any>> => {
    const updateData: any = {
      status,
      approved_by: profile?.id,
      approved_date: new Date().toISOString()
    };
    
    if (comments) {
      updateData.approval_comments = comments;
    }
    
    const { data, error } = await supabase
      .from('work_plans')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  };

  const upsertWorkPlanAssignment = async (assignmentData: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from('work_plan_assignments')
      .upsert(assignmentData)
      .select()
      .single();
    return { data, error };
  };

  // Manager Reports
  const fetchManagerReports = async (): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from('manager_reports')
      .select(`
        *,
        manager:profiles(*),
        work_plan:work_plans(*),
        report_period:report_periods(*)
      `)
      .order('created_at', { ascending: false });
    return { data: data || [], error };
  };

  const fetchManagerReportsByManager = async (managerId: string): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from('manager_reports')
      .select(`
        *,
        manager:profiles(*),
        work_plan:work_plans(*),
        report_period:report_periods(*)
      `)
      .eq('manager_id', managerId)
      .order('created_at', { ascending: false });
    return { data: data || [], error };
  };

  const createManagerReport = async (reportData: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from('manager_reports')
      .insert({
        ...reportData,
        manager_id: profile?.id || ''
      })
      .select()
      .single();
    return { data, error };
  };

  const updateManagerReport = async (id: string, reportData: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from('manager_reports')
      .update(reportData)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  };

  // Product Progress Reports
  const fetchProductProgressReports = async (managerReportId: string): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from('product_progress_reports')
      .select('*')
      .eq('manager_report_id', managerReportId);
    return { data: data || [], error };
  };

  const upsertProductProgressReport = async (reportData: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from('product_progress_reports')
      .upsert(reportData)
      .select()
      .single();
    return { data, error };
  };

  const deleteProductProgressReport = async (id: string): Promise<Result<null>> => {
    const { data, error } = await supabase
      .from('product_progress_reports')
      .delete()
      .eq('id', id);
    return { data, error };
  };

  // Template Based Reports
  const fetchTemplateBasedReports = async (managerId?: string): Promise<Result<any[]>> => {
    let query = supabase
      .from('template_based_reports_with_details')
      .select('*');
    
    if (managerId) {
      query = query.eq('manager_id', managerId);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    return { data: data || [], error };
  };

  const fetchTemplateBasedReportsByManager = async (managerId: string): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from('template_based_reports_with_details')
      .select('*')
      .eq('manager_id', managerId)
      .order('created_at', { ascending: false });
    return { data: data || [], error };
  };

  const createTemplateBasedReport = async (reportData: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from('template_based_reports')
      .insert({
        ...reportData,
        manager_id: profile?.id || ''
      })
      .select()
      .single();
    return { data, error };
  };

  const updateTemplateBasedReport = async (id: string, reportData: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from('template_based_reports')
      .update(reportData)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  };

  const deleteTemplateBasedReport = async (id: string): Promise<Result<null>> => {
    const { data, error } = await supabase
      .from('template_based_reports')
      .delete()
      .eq('id', id);
    return { data, error };
  };

  // Template Report Responses
  const fetchTemplateReportResponses = async (templateReportId: string): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from('template_report_responses')
      .select('*')
      .eq('template_report_id', templateReportId);
    return { data: data || [], error };
  };

  const upsertTemplateReportResponse = async (responseData: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from('template_report_responses')
      .upsert(responseData)
      .select()
      .single();
    return { data, error };
  };

  // Indicators
  const fetchIndicators = async () => {
    return await supabase
      .from('indicators')
      .select('*')
      .order('created_at', { ascending: false });
  };

  const createIndicator = async (data: any) => {
    return await supabase
      .from('indicators')
      .insert(data)
      .select()
      .single();
  };

  const updateIndicator = async (id: string, data: any) => {
    return await supabase
      .from('indicators')
      .update(data)
      .eq('id', id)
      .select()
      .single();
  };

  const deleteIndicator = async (id: string) => {
    return await supabase
      .from('indicators')
      .delete()
      .eq('id', id);
  };

  // Indicator Reports functions
  const fetchUnifiedReports = async (managerId: string) => {
    try {
      const { data, error } = await supabase
        .from('unified_reports')
        .select('*')
        .eq('manager_id', managerId)
        .order('created_at', { ascending: false });

      return { data, error };
    } catch (error) {
      console.error('Error fetching unified reports:', error);
      return { data: null, error };
    }
  };

  const fetchIndicatorReports = async (managerId?: string) => {
    try {
      let query = supabase
        .from('indicator_reports')
        .select(`
          *,
          report_periods:report_period_id(name, start_date, end_date)
        `);

      if (managerId) {
        query = query.eq('manager_id', managerId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      return { data, error };
    } catch (error) {
      console.error('Error fetching indicator reports:', error);
      return { data: null, error };
    }
  };

  const fetchIndicatorReport = async (reportId: string) => {
    try {
      const { data, error } = await supabase
        .from('indicator_reports')
        .select(`
          *,
          indicator_responses(*)
        `)
        .eq('id', reportId)
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error fetching indicator report:', error);
      return { data: null, error };
    }
  };

  const createIndicatorReport = async (reportData: any) => {
    try {
      const { data, error } = await supabase
        .from('indicator_reports')
        .insert(reportData)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error creating indicator report:', error);
      return { data: null, error };
    }
  };

  const updateIndicatorReport = async (reportId: string, reportData: any) => {
    try {
      const { responses, ...reportFields } = reportData;

      // Update report
      const { data: reportResult, error: reportError } = await supabase
        .from('indicator_reports')
        .update(reportFields)
        .eq('id', reportId)
        .select()
        .single();

      if (reportError) throw reportError;

      // Update responses
      if (responses && Array.isArray(responses)) {
        for (const response of responses) {
          const { error: responseError } = await supabase
            .from('indicator_responses')
            .upsert({
              ...response,
              indicator_report_id: reportId,
            });

          if (responseError) throw responseError;
        }
      }

      return { data: reportResult, error: null };
    } catch (error) {
      console.error('Error updating indicator report:', error);
      return { data: null, error };
    }
  };

  const submitIndicatorReport = async (reportId: string) => {
    try {
      const { data, error } = await supabase
        .from('indicator_reports')
        .update({
          status: 'submitted',
          submitted_date: new Date().toISOString(),
        })
        .eq('id', reportId)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error submitting indicator report:', error);
      return { data: null, error };
    }
  };

  const deleteIndicatorReport = async (reportId: string) => {
    try {
      const { error } = await supabase
        .from('indicator_reports')
        .delete()
        .eq('id', reportId);

      return { error };
    } catch (error) {
      console.error('Error deleting indicator report:', error);
      return { error };
    }
  };

  const checkPeriodActive = async (periodId: string) => {
    try {
      const { data, error } = await supabase
        .from('report_periods')
        .select('end_date, is_active')
        .eq('id', periodId)
        .single();

      if (error) return false;

      const isActive = data.is_active && new Date(data.end_date) >= new Date();
      return isActive;
    } catch (error) {
      console.error('Error checking period status:', error);
      return false;
    }
  };

  const submitTemplateBasedReport = async (reportId: string) => {
    try {
      const { data, error } = await supabase
        .from('template_based_reports')
        .update({
          status: 'submitted',
          submitted_date: new Date().toISOString(),
        })
        .eq('id', reportId)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error submitting template based report:', error);
      return { data: null, error };
    }
  };

  // Template-based report details
  const fetchTemplateBasedReportDetails = async (reportId: string): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from('template_based_reports')
      .select(`
        *,
        report_template:report_templates(*),
        manager:profiles(*)
      `)
      .eq('id', reportId)
      .single();
    return { data, error };
  };

  // Custom plan details
  const fetchCustomPlanDetails = async (planId: string): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from('custom_plans')
      .select(`
        *,
        plan_type:plan_types(*),
        responses:custom_plan_responses(
          *,
          plan_field:plan_fields(*)
        ),
        assignments:custom_plan_assignments(
          *,
          strategic_axis:strategic_axes(*),
          action:actions(*),
          product:products(*)
        )
      `)
      .eq('id', planId)
      .single();
    return { data, error };
  };

  // Plan Types Management with new fields
  const fetchPlanTypes = async (): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from('plan_types')
      .select('*')
      .eq('is_active', true)
      .order('name');
    return { data: data || [], error };
  };

  const createPlanType = async (planTypeData: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from('plan_types')
      .insert({
        ...planTypeData,
        created_by: profile?.id || ''
      })
      .select()
      .single();
    return { data, error };
  };

  const updatePlanType = async (id: string, planTypeData: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from('plan_types')
      .update(planTypeData)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  };

  const deletePlanType = async (id: string): Promise<Result<null>> => {
    const { data, error } = await supabase
      .from('plan_types')
      .update({ is_active: false })
      .eq('id', id);
    return { data, error };
  };

  // Plan Fields Management with improved validation
  const fetchPlanFields = async (planTypeId: string): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from('plan_fields')
      .select('*')
      .eq('plan_type_id', planTypeId)
      .order('field_order');
    return { data: data || [], error };
  };

  const createPlanField = async (fieldData: any): Promise<Result<any>> => {
    try {
      // Clean and validate field data
      const cleanedData = {
        plan_type_id: fieldData.plan_type_id,
        field_name: fieldData.field_name?.trim(),
        field_type: fieldData.field_type,
        is_required: Boolean(fieldData.is_required),
        field_order: fieldData.field_order || 0,
        dropdown_options: fieldData.field_type === 'dropdown' && fieldData.dropdown_options 
          ? fieldData.dropdown_options.filter((opt: string) => opt?.trim())
          : null
      };

      console.log('Creating field with cleaned data:', cleanedData);

      const { data, error } = await supabase
        .from('plan_fields')
        .insert(cleanedData)
        .select()
        .single();

      if (error) {
        console.error('Supabase error creating field:', error);
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error in createPlanField:', error);
      return { data: null, error };
    }
  };

  const updatePlanField = async (id: string, fieldData: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from('plan_fields')
      .update(fieldData)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  };

  const deletePlanField = async (id: string): Promise<Result<null>> => {
    const { data, error } = await supabase
      .from('plan_fields')
      .delete()
      .eq('id', id);
    return { data, error };
  };

  // Function to get available plan types for manager based on hours
  const getAvailablePlanTypesForManager = async (managerId: string): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .rpc('get_available_plan_types_for_manager', {
        manager_profile_id: managerId
      });
    return { data: data || [], error };
  };

  // Plan Type Configuration
  const configurePlanTypeElements = async (planTypeId: string, elements: any): Promise<Result<null>> => {
    try {
      // Clear existing associations
      await Promise.all([
        supabase.from('plan_type_strategic_axes').delete().eq('plan_type_id', planTypeId),
        supabase.from('plan_type_actions').delete().eq('plan_type_id', planTypeId),
        supabase.from('plan_type_products').delete().eq('plan_type_id', planTypeId)
      ]);

      // Insert new associations
      const promises = [];

      if (elements.strategic_axes.length > 0) {
        const axesData = elements.strategic_axes.map((axisId: string) => ({
          plan_type_id: planTypeId,
          strategic_axis_id: axisId
        }));
        promises.push(supabase.from('plan_type_strategic_axes').insert(axesData));
      }

      if (elements.actions.length > 0) {
        const actionsData = elements.actions.map((actionId: string) => ({
          plan_type_id: planTypeId,
          action_id: actionId
        }));
        promises.push(supabase.from('plan_type_actions').insert(actionsData));
      }

      if (elements.products.length > 0) {
        const productsData = elements.products.map((productId: string) => ({
          plan_type_id: planTypeId,
          product_id: productId
        }));
        promises.push(supabase.from('plan_type_products').insert(productsData));
      }

      await Promise.all(promises);
      return { data: null, error: null };
    } catch (error) {
      console.error('Error configuring plan type elements:', error);
      return { data: null, error };
    }
  };

  // Custom Plans Management
  const fetchCustomPlans = async (managerId?: string): Promise<Result<any[]>> => {
    let query = supabase
      .from('custom_plans')
      .select(`
        *,
        plan_type:plan_types(*)
      `);

    if (managerId) {
      query = query.eq('manager_id', managerId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    return { data: data || [], error };
  };

  const createCustomPlan = async (planData: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from('custom_plans')
      .insert({
        ...planData,
        manager_id: profile?.id || ''
      })
      .select()
      .single();
    return { data, error };
  };

  const updateCustomPlan = async (id: string, planData: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from('custom_plans')
      .update(planData)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  };

  const submitCustomPlan = async (id: string): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from('custom_plans')
      .update({
        status: 'submitted',
        submitted_date: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  };

  const deleteCustomPlan = async (id: string): Promise<Result<null>> => {
    const { data, error } = await supabase
      .from('custom_plans')
      .delete()
      .eq('id', id);
    return { data, error };
  };

  // Custom Plan Responses
  const fetchCustomPlanResponses = async (planId: string): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from('custom_plan_responses')
      .select(`
        *,
        plan_field:plan_fields(*)
      `)
      .eq('custom_plan_id', planId);
    return { data: data || [], error };
  };

  const upsertCustomPlanResponse = async (responseData: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from('custom_plan_responses')
      .upsert(responseData)
      .select()
      .single();
    return { data, error };
  };

  // Custom Plan Assignments
  const fetchCustomPlanAssignments = async (planId: string): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from('custom_plan_assignments')
      .select(`
        *,
        strategic_axis:strategic_axes(*),
        action:actions(*),
        product:products(*)
      `)
      .eq('custom_plan_id', planId);
    return { data: data || [], error };
  };

  const upsertCustomPlanAssignment = async (assignmentData: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from('custom_plan_assignments')
      .upsert(assignmentData)
      .select()
      .single();
    return { data, error };
  };

  // SNIES Configuration Management
  const fetchSniesDocumentTypes = async (): Promise<Result<SniesDocumentType[]>> => {
    const { data, error } = await supabase
      .from('snies_document_types')
      .select('*')
      .eq('is_active', true)
      .order('name');
    return { data: data || [], error };
  };

  const fetchSniesCountries = async (): Promise<Result<SniesCountry[]>> => {
    const { data, error } = await supabase
      .from('snies_countries')
      .select('*')
      .eq('is_active', true)
      .order('name');
    return { data: data || [], error };
  };

  const fetchSniesMunicipalities = async (): Promise<Result<SniesMunicipality[]>> => {
    const { data, error } = await supabase
      .from('snies_municipalities')
      .select('*')
      .eq('is_active', true)
      .order('name');
    return { data: data || [], error };
  };

  const fetchSniesBiologicalSex = async (): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from('snies_biological_sex')
      .select('*')
      .eq('is_active', true)
      .order('name');
    return { data: data || [], error };
  };

  const fetchSniesMaritalStatus = async (): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from('snies_marital_status')
      .select('*')
      .eq('is_active', true)
      .order('name');
    return { data: data || [], error };
  };

  const createSniesCountry = async (countryData: Partial<SniesCountry>): Promise<Result<SniesCountry>> => {
    const { data, error } = await supabase
      .from('snies_countries')
      .insert(countryData)
      .select()
      .single();
    return { data, error };
  };

  const bulkCreateSniesCountries = async (countries: Partial<SniesCountry>[]): Promise<Result<SniesCountry[]>> => {
    const { data, error } = await supabase
      .from('snies_countries')
      .insert(countries)
      .select();
    return { data: data || [], error };
  };

  const createSniesMunicipality = async (municipalityData: Partial<SniesMunicipality>): Promise<Result<SniesMunicipality>> => {
    const { data, error } = await supabase
      .from('snies_municipalities')
      .insert(municipalityData)
      .select()
      .single();
    return { data, error };
  };

  const bulkCreateSniesMunicipalities = async (municipalities: Partial<SniesMunicipality>[]): Promise<Result<SniesMunicipality[]>> => {
    const { data, error } = await supabase
      .from('snies_municipalities')
      .insert(municipalities)
      .select();
    return { data: data || [], error };
  };

  // SNIES Report Templates Management
  const fetchSniesReportTemplates = async (): Promise<Result<SniesReportTemplate[]>> => {
    const { data, error } = await supabase
      .from('snies_report_templates')
      .select('*')
      .eq('is_active', true)
      .order('name');
    return { data: data || [], error };
  };

  const createSniesReportTemplate = async (templateData: Partial<SniesReportTemplate>): Promise<Result<SniesReportTemplate>> => {
    const { data, error } = await supabase
      .from('snies_report_templates')
      .insert({
        ...templateData,
        created_by: profile?.id
      })
      .select()
      .single();
    return { data, error };
  };

  const updateSniesReportTemplate = async (id: string, templateData: Partial<SniesReportTemplate>): Promise<Result<SniesReportTemplate>> => {
    const { data, error } = await supabase
      .from('snies_report_templates')
      .update(templateData)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  };

  const deleteSniesReportTemplate = async (id: string): Promise<Result<null>> => {
    const { data, error } = await supabase
      .from('snies_report_templates')
      .delete()
      .eq('id', id);
    return { data, error };
  };

  // SNIES Template Fields Management
  const fetchSniesTemplateFields = async (templateId: string): Promise<Result<SniesTemplateField[]>> => {
    const { data, error } = await supabase
      .from('snies_template_fields')
      .select('*')
      .eq('template_id', templateId)
      .order('field_order');
    return { data: data || [], error };
  };

  const createSniesTemplateField = async (fieldData: Partial<SniesTemplateField>): Promise<Result<SniesTemplateField>> => {
    const { data, error } = await supabase
      .from('snies_template_fields')
      .insert(fieldData)
      .select()
      .single();
    return { data, error };
  };

  const updateSniesTemplateField = async (id: string, fieldData: Partial<SniesTemplateField>): Promise<Result<SniesTemplateField>> => {
    const { data, error } = await supabase
      .from('snies_template_fields')
      .update(fieldData)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  };

  const deleteSniesTemplateField = async (id: string): Promise<Result<null>> => {
    const { data, error } = await supabase
      .from('snies_template_fields')
      .delete()
      .eq('id', id);
    return { data, error };
  };

  // SNIES Reports Management
  const fetchSniesReports = async (): Promise<Result<SniesReport[]>> => {
    const { data, error } = await supabase
      .from('snies_reports')
      .select(`
        *,
        template:snies_report_templates(name),
        manager:profiles(full_name, email)
      `)
      .order('created_at', { ascending: false });
    return { data: data || [], error };
  };

  const createSniesReport = async (reportData: Partial<SniesReport>): Promise<Result<SniesReport>> => {
    const { data, error } = await supabase
      .from('snies_reports')
      .insert({
        ...reportData,
        manager_id: profile?.id
      })
      .select()
      .single();
    return { data, error };
  };

  const updateSniesReport = async (id: string, reportData: Partial<SniesReport>): Promise<Result<SniesReport>> => {
    const { data, error } = await supabase
      .from('snies_reports')
      .update(reportData)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  };

  // SNIES Report Data Management
  const fetchSniesReportData = async (reportId: string): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from('snies_report_data')
      .select('*')
      .eq('report_id', reportId)
      .order('row_index');
    return { data: data || [], error };
  };

  const saveSniesReportData = async (reportId: string, reportData: any[]): Promise<Result<any[]>> => {
    // First delete existing data
    await supabase
      .from('snies_report_data')
      .delete()
      .eq('report_id', reportId);

    // Then insert new data
    const dataToInsert = reportData.map((row, index) => ({
      report_id: reportId,
      row_index: index,
      field_data: row
    }));

    const { data, error } = await supabase
      .from('snies_report_data')
      .insert(dataToInsert)
      .select();

    return { data: data || [], error };
  };

  const consolidateSniesReports = async (templateId: string, title: string): Promise<Result<any>> => {
    // Get all submitted reports for this template
    const { data: reports, error: reportsError } = await supabase
      .from('snies_reports')
      .select(`
        id,
        manager_id,
        snies_report_data(*)
      `)
      .eq('template_id', templateId)
      .eq('status', 'submitted');

    if (reportsError) return { data: null, error: reportsError };

    // Consolidate all data
    let consolidatedData: any[] = [];
    reports?.forEach(report => {
      if (report.snies_report_data) {
        report.snies_report_data.forEach((dataRow: any) => {
          consolidatedData.push(dataRow.field_data);
        });
      }
    });

    // Create consolidated report record
    const { data, error } = await supabase
      .from('snies_consolidated_reports')
      .insert({
        template_id: templateId,
        title,
        total_records: consolidatedData.length,
        participating_managers: reports?.length || 0,
        created_by: profile?.id
      })
      .select()
      .single();

    return { data: { ...data, consolidated_data: consolidatedData }, error };
  };

  return {
    fetchStrategicAxes,
    createStrategicAxis,
    updateStrategicAxis,
    deleteStrategicAxis,
    fetchActions,
    createAction,
    updateAction,
    deleteAction,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
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
    fetchManagers,
    fetchManagersByCampus,
    updateManagerHours,
    getUserManagedCampus,
    fetchUsers,
    fetchUsersByCampus,
    updateUser,
    updateUserCampusAccess,
    deleteUser,
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
    fetchPendingWorkPlans,
    fetchWorkPlanDetails,
    fetchWorkPlanAssignments,
    createWorkPlan,
    updateWorkPlan,
    approveWorkPlan,
    upsertWorkPlanAssignment,
    fetchManagerReports,
    fetchManagerReportsByManager,
    createManagerReport,
    updateManagerReport,
    fetchProductProgressReports,
    upsertProductProgressReport,
    deleteProductProgressReport,
    fetchTemplateBasedReports,
    fetchTemplateBasedReportsByManager,
    createTemplateBasedReport,
    updateTemplateBasedReport,
    deleteTemplateBasedReport,
    fetchTemplateReportResponses,
    upsertTemplateReportResponse,
    fetchIndicators,
    createIndicator,
    updateIndicator,
    deleteIndicator,
    fetchUnifiedReports,
    fetchIndicatorReports,
    fetchIndicatorReport,
    createIndicatorReport,
    updateIndicatorReport,
    submitIndicatorReport,
    deleteIndicatorReport,
    checkPeriodActive,
    submitTemplateBasedReport,
    
    // Plan Types functions
    fetchPlanTypes,
    createPlanType,
    updatePlanType,
    deletePlanType,
    fetchPlanFields,
    createPlanField,
    updatePlanField,
    deletePlanField,
    getAvailablePlanTypesForManager,
    configurePlanTypeElements,
    
    // Custom Plans functions
    fetchCustomPlans,
    createCustomPlan,
    updateCustomPlan,
    submitCustomPlan,
    deleteCustomPlan,
    fetchCustomPlanResponses,
    upsertCustomPlanResponse,
    fetchCustomPlanAssignments,
    upsertCustomPlanAssignment,
    
    // Template-based report details
    fetchTemplateBasedReportDetails,
    
    // Custom plan details
    fetchCustomPlanDetails,
    
    // SNIES functions
    fetchSniesDocumentTypes,
    fetchSniesCountries,
    fetchSniesMunicipalities,
    fetchSniesBiologicalSex,
    fetchSniesMaritalStatus,
    createSniesCountry,
    bulkCreateSniesCountries,
    createSniesMunicipality,
    bulkCreateSniesMunicipalities,
    fetchSniesReportTemplates,
    createSniesReportTemplate,
    updateSniesReportTemplate,
    deleteSniesReportTemplate,
    fetchSniesTemplateFields,
    createSniesTemplateField,
    updateSniesTemplateField,
    deleteSniesTemplateField,
    fetchSniesReports,
    createSniesReport,
    updateSniesReport,
    fetchSniesReportData,
    saveSniesReportData,
    consolidateSniesReports,
  };
};
