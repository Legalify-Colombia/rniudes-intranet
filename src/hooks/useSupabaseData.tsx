import { supabase } from "@/integrations/supabase/client";
import {
  AcademicProgram,
  Action,
  Campus,
  Faculty,
  Indicator,
  InternationalizationProject,
  ManagerReport,
  Product,
  Profile,
  ReportPeriod,
  ReportTemplate,
  SpecificLine,
  TemplateBasedReport,
  TemplateReportResponse,
  WorkPlan,
  WorkPlanAssignment,
  ReportSystemConfig,
  ManagerReportVersion,
  ProjectPartnerInstitution,
  InternationalizationReport,
  StrategicAxis,
  DocumentTemplate,
  ProductProgressReport
} from "@/types";

export const useSupabaseData = () => {
  const fetchAcademicPrograms = async () => {
    return await supabase.from('academic_programs_with_details').select('*');
  };

  const fetchStrategicAxes = async () => {
    return await supabase.from('strategic_axes').select('*');
  };

  const fetchActions = async () => {
    return await supabase.from('actions').select('*');
  };

  const fetchProducts = async () => {
    return await supabase.from('products').select('*');
  };

  const fetchCampus = async () => {
    return await supabase.from('campus').select('*');
  };

  const fetchFaculties = async () => {
    return await supabase.from('faculties_with_campus').select('*');
  };

  const fetchReportPeriods = async () => {
    return await supabase.from('report_periods').select('*');
  };

  const fetchSpecificLines = async () => {
    return await supabase.from('specific_lines').select('*');
  };

  const fetchIndicators = async () => {
    return await supabase.from('indicators').select('*');
  };

  const fetchProfiles = async () => {
    return await supabase.from('profiles').select('*');
  };

  const fetchReportTemplates = async () => {
    return await supabase.from('report_templates').select('*');
  };

  // Missing functions that components are expecting
  const fetchManagers = async () => {
    return await supabase.from('profiles').select('*').eq('role', 'Gestor');
  };

  const fetchWorkPlans = async () => {
    return await supabase.from('work_plans').select('*');
  };

  const fetchManagerReports = async () => {
    return await supabase.from('manager_reports').select('*');
  };

  const updateManagerReport = async (id: string, data: Partial<ManagerReport>) => {
    return await supabase.from('manager_reports').update(data).eq('id', id).select().single();
  };

  const fetchFacultiesByCampus = async (campusIds?: string[]) => {
    if (!campusIds || campusIds.length === 0) {
      return await supabase.from('faculties').select('*');
    }
    return await supabase.from('faculties').select('*').in('campus_id', campusIds);
  };

  const fetchAcademicProgramsByCampus = async (campusIds?: string[]) => {
    if (!campusIds || campusIds.length === 0) {
      return await supabase.from('academic_programs').select('*');
    }
    return await supabase.from('academic_programs').select('*').in('campus_id', campusIds);
  };

  const fetchManagersByCampus = async (campusIds?: string[]) => {
    if (!campusIds || campusIds.length === 0) {
      return await supabase.from('profiles').select('*').eq('role', 'Gestor');
    }
    return await supabase.from('profiles').select('*').eq('role', 'Gestor').in('campus_id', campusIds);
  };

  const updateManagerHours = async (managerId: string, hours: number) => {
    return await supabase.from('profiles').update({ weekly_hours: hours }).eq('id', managerId).select().single();
  };

  const getUserManagedCampus = async (userId: string) => {
    return await supabase.from('profiles').select('managed_campus_ids, campus_id').eq('id', userId).single();
  };

  const fetchWorkPlanAssignments = async (workPlanId: string) => {
    return await supabase.from('work_plan_assignments').select('*').eq('work_plan_id', workPlanId);
  };

  const fetchProductProgressReports = async (managerReportId: string) => {
    return await supabase.from('product_progress_reports').select('*').eq('manager_report_id', managerReportId);
  };

  const upsertProductProgressReport = async (data: Omit<ProductProgressReport, 'id' | 'created_at' | 'updated_at'>) => {
    return await supabase.from('product_progress_reports').upsert(data).select().single();
  };

  const deleteProductProgressReport = async (id: string) => {
    return await supabase.from('product_progress_reports').delete().eq('id', id);
  };

  const fetchDocumentTemplates = async () => {
    return await supabase.from('document_templates').select('*');
  };

  const createDocumentTemplate = async (data: Omit<DocumentTemplate, 'id' | 'created_at' | 'updated_at'>) => {
    return await supabase.from('document_templates').insert(data).select().single();
  };

  const updateDocumentTemplate = async (id: string, data: Partial<DocumentTemplate>) => {
    return await supabase.from('document_templates').update(data).eq('id', id).select().single();
  };

  const deleteDocumentTemplate = async (id: string) => {
    return await supabase.from('document_templates').delete().eq('id', id);
  };

  const createCampus = async (data: Omit<Campus, 'id' | 'created_at' | 'updated_at'>) => {
    return await supabase.from('campus').insert(data).select().single();
  };

  const updateCampus = async (id: string, data: Partial<Campus>) => {
    return await supabase.from('campus').update(data).eq('id', id).select().single();
  };

  const deleteCampus = async (id: string) => {
    return await supabase.from('campus').delete().eq('id', id);
  };

  const createFaculty = async (data: Omit<Faculty, 'id' | 'created_at' | 'updated_at'>) => {
    return await supabase.from('faculties').insert(data).select().single();
  };

  const updateFaculty = async (id: string, data: Partial<Faculty>) => {
    return await supabase.from('faculties').update(data).eq('id', id).select().single();
  };

  const deleteFaculty = async (id: string) => {
    return await supabase.from('faculties').delete().eq('id', id);
  };

  const createAcademicProgram = async (data: Omit<AcademicProgram, 'id' | 'created_at' | 'updated_at'>) => {
    return await supabase.from('academic_programs').insert(data).select().single();
  };

  const updateAcademicProgram = async (id: string, data: Partial<AcademicProgram>) => {
    return await supabase.from('academic_programs').update(data).eq('id', id).select().single();
  };

  const deleteAcademicProgram = async (id: string) => {
    return await supabase.from('academic_programs').delete().eq('id', id);
  };

  const createReportPeriod = async (data: Omit<ReportPeriod, 'id' | 'created_at' | 'updated_at'>) => {
    return await supabase.from('report_periods').insert(data).select().single();
  };

  const updateReportPeriod = async (id: string, data: Partial<ReportPeriod>) => {
    return await supabase.from('report_periods').update(data).eq('id', id).select().single();
  };

  const deleteReportPeriod = async (id: string) => {
    return await supabase.from('report_periods').delete().eq('id', id);
  };

  const createSpecificLine = async (data: Omit<SpecificLine, 'id' | 'created_at' | 'updated_at'>) => {
    return await supabase.from('specific_lines').insert(data).select().single();
  };

  const updateSpecificLine = async (id: string, data: Partial<SpecificLine>) => {
    return await supabase.from('specific_lines').update(data).eq('id', id).select().single();
  };

  const deleteSpecificLine = async (id: string) => {
    return await supabase.from('specific_lines').delete().eq('id', id);
  };

  const createIndicator = async (data: Omit<Indicator, 'id' | 'created_at' | 'updated_at'>) => {
    return await supabase.from('indicators').insert(data).select().single();
  };

  const updateIndicator = async (id: string, data: Partial<Indicator>) => {
    return await supabase.from('indicators').update(data).eq('id', id).select().single();
  };

  const deleteIndicator = async (id: string) => {
    return await supabase.from('indicators').delete().eq('id', id);
  };

  const createProfile = async (data: Omit<Profile, 'id' | 'created_at' | 'updated_at'>) => {
    return await supabase.from('profiles').insert(data).select().single();
  };

  const deleteProfile = async (id: string) => {
    return await supabase.from('profiles').delete().eq('id', id);
  };

  const createStrategicAxis = async (data: Omit<StrategicAxis, 'id' | 'created_at' | 'updated_at'>) => {
    const axisData = {
      ...data,
      usage_type: data.usage_type || ['work_plan']
    };
    return await supabase.from('strategic_axes').insert(axisData).select().single();
  };

  const updateStrategicAxis = async (id: string, data: Partial<StrategicAxis>) => {
    return await supabase.from('strategic_axes').update(data).eq('id', id).select().single();
  };

  const deleteStrategicAxis = async (id: string) => {
    return await supabase.from('strategic_axes').delete().eq('id', id);
  };

  const updateStrategicAxisUsage = async (id: string, usageType: string[]) => {
    return await supabase.from('strategic_axes').update({ usage_type: usageType }).eq('id', id).select().single();
  };

  const createAction = async (data: Omit<Action, 'id' | 'created_at' | 'updated_at'>) => {
    const actionData = {
      ...data,
      usage_type: data.usage_type || ['work_plan']
    };
    return await supabase.from('actions').insert(actionData).select().single();
  };

  const updateAction = async (id: string, data: Partial<Action>) => {
    return await supabase.from('actions').update(data).eq('id', id).select().single();
  };

  const deleteAction = async (id: string) => {
    return await supabase.from('actions').delete().eq('id', id);
  };

  const updateActionUsage = async (id: string, usageType: string[]) => {
    return await supabase.from('actions').update({ usage_type: usageType }).eq('id', id).select().single();
  };

  const createProduct = async (data: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
    const productData = {
      ...data,
      usage_type: data.usage_type || ['work_plan']
    };
    return await supabase.from('products').insert(productData).select().single();
  };

  const updateProduct = async (id: string, data: Partial<Product>) => {
    return await supabase.from('products').update(data).eq('id', id).select().single();
  };

  const deleteProduct = async (id: string) => {
    return await supabase.from('products').delete().eq('id', id);
  };

  const updateProductUsage = async (id: string, usageType: string[]) => {
    return await supabase.from('products').update({ usage_type: usageType }).eq('id', id).select().single();
  };

  const uploadFile = async (file: File, bucket: string = 'reports', folder?: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = folder ? `${folder}/${fileName}` : fileName;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (error) {
      return { data: null, error };
    }

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return { data: { ...data, publicUrl }, error: null };
  };

  const createTemplateBasedReport = async (data: Omit<TemplateBasedReport, 'id' | 'created_at' | 'updated_at'>) => {
    return await supabase.from('template_based_reports').insert(data).select().single();
  };

  const updateTemplateBasedReport = async (id: string, data: Partial<TemplateBasedReport>) => {
    return await supabase.from('template_based_reports').update(data).eq('id', id).select().single();
  };

  const fetchTemplateReportResponses = async (templateReportId: string) => {
    return await supabase.from('template_report_responses').select('*').eq('template_report_id', templateReportId);
  };

  const upsertTemplateReportResponse = async (data: Omit<TemplateReportResponse, 'id' | 'created_at' | 'updated_at'>) => {
    return await supabase.from('template_report_responses').upsert(data).select().single();
  };

  const createWorkPlan = async (data: Omit<WorkPlan, 'id' | 'created_at' | 'updated_at'>) => {
    return await supabase.from('work_plans').insert(data).select().single();
  };

  const updateWorkPlan = async (id: string, data: Partial<WorkPlan>) => {
    return await supabase.from('work_plans').update(data).eq('id', id).select().single();
  };

  const fetchPendingWorkPlans = async () => {
    return await supabase
      .from('work_plans_with_manager')
      .select('*')
      .eq('status', 'submitted');
  };

  const approveWorkPlan = async (workPlanId: string, status: 'approved' | 'rejected', comments?: string) => {
    const updateData: any = {
      status,
      approval_comments: comments,
      approved_date: new Date().toISOString()
    };

    return await supabase
      .from('work_plans')
      .update(updateData)
      .eq('id', workPlanId)
      .select()
      .single();
  };

  const upsertWorkPlanAssignment = async (data: Omit<WorkPlanAssignment, 'id' | 'created_at' | 'updated_at'>) => {
    return await supabase.from('work_plan_assignments').upsert(data).select().single();
  };

  const fetchWorkPlanDetails = async (workPlanId: string) => {
    return await supabase
      .from('work_plans')
      .select(`
        *,
        work_plan_assignments (
          *,
          product:products (*)
        )
      `)
      .eq('id', workPlanId)
      .single();
  };

  // Internationalization functions
  const createInternationalizationProject = async (data: Omit<InternationalizationProject, 'id' | 'created_at' | 'updated_at'>) => {
    const projectData = {
      ...data,
      justification: data.justification || '',
      beneficiaries_description: data.beneficiaries_description || ''
    };
    return await supabase.from('internationalization_projects').insert(projectData).select().single();
  };

  const fetchInternationalizationProjects = async () => {
    return await supabase.from('internationalization_projects').select('*');
  };

  const createPartnerInstitution = async (data: Omit<ProjectPartnerInstitution, 'id' | 'created_at'>) => {
    const institutionData = {
      ...data,
      institution_country: data.country,
      contact_person: data.contact_professor_name,
      contact_email: data.contact_professor_email,
      collaboration_type: 'academic'
    };
    return await supabase.from('project_partner_institutions').insert(institutionData).select().single();
  };

  const createInternationalizationReport = async (data: Omit<InternationalizationReport, 'id' | 'created_at' | 'updated_at'>) => {
    const reportData = {
      ...data,
      next_period_activities: data.next_period_activities || ''
    };
    return await supabase.from('internationalization_reports').insert(reportData).select().single();
  };

  // Report functions
  const createManagerReport = async (data: Omit<ManagerReport, 'id' | 'created_at' | 'updated_at'>) => {
    return await supabase.from('manager_reports').insert(data).select().single();
  };

  const fetchManagerReportsByManager = async (managerId: string) => {
    return await supabase
      .from('manager_reports')
      .select('*')
      .eq('manager_id', managerId);
  };

  // Template based reports
  const fetchTemplateBasedReports = async () => {
    return await supabase.from('template_based_reports_with_details').select('*');
  };

  const deleteTemplateBasedReport = async (id: string) => {
    return await supabase.from('template_based_reports').delete().eq('id', id);
  };

  const checkReportEditPermission = async (reportId: string) => {
    return await supabase.rpc('is_period_active', { period_id: reportId });
  };

  // System config functions
  const fetchReportSystemConfig = async () => {
    return await supabase.from('report_system_config').select('*').single();
  };

  const updateReportSystemConfig = async (data: Partial<ReportSystemConfig>) => {
    return await supabase.from('report_system_config').update(data).eq('id', data.id).select().single();
  };

  // User management
  const updateUserCampusAccess = async (userId: string, campusIds: string[]) => {
    return await supabase
      .from('profiles')
      .update({ managed_campus_ids: campusIds })
      .eq('id', userId)
      .select()
      .single();
  };

  const updateProfile = async (id: string, data: Partial<Profile>) => {
    return await supabase.from('profiles').update(data).eq('id', id).select().single();
  };

  // Version and template functions
  const createManagerReportVersion = async (data: Omit<ManagerReportVersion, 'id' | 'created_at' | 'updated_at'>) => {
    return await supabase.from('manager_report_versions').insert(data).select().single();
  };

  const updateManagerReportVersion = async (id: string, data: Partial<ManagerReportVersion>) => {
    return await supabase.from('manager_report_versions').update(data).eq('id', id).select().single();
  };

  const getNextVersionNumber = async (managerReportId: string, templateId: string) => {
    const { data } = await supabase.rpc('get_next_version_number', {
      p_manager_report_id: managerReportId,
      p_template_id: templateId
    });
    return { data, error: null };
  };

  const createReportTemplate = async (data: Omit<ReportTemplate, 'id' | 'created_at' | 'updated_at'>) => {
    return await supabase.from('report_templates').insert(data).select().single();
  };

  const updateReportTemplate = async (id: string, data: Partial<ReportTemplate>) => {
    return await supabase.from('report_templates').update(data).eq('id', id).select().single();
  };

  const deleteReportTemplate = async (id: string) => {
    return await supabase.from('report_templates').delete().eq('id', id);
  };

  const fetchUsersByCampus = async (campusIds?: string[]) => {
    if (!campusIds || campusIds.length === 0) {
      return await supabase.from('profiles').select('*');
    }
    return await supabase.from('profiles').select('*').in('campus_id', campusIds);
  };

  return {
    fetchAcademicPrograms,
    fetchStrategicAxes,
    fetchActions,
    fetchProducts,
    fetchCampus,
    fetchFaculties,
    fetchReportPeriods,
    fetchSpecificLines,
    fetchIndicators,
    fetchProfiles,
    fetchReportTemplates,
    fetchManagers,
    fetchWorkPlans,
    fetchManagerReports,
    updateManagerReport,
    fetchFacultiesByCampus,
    fetchAcademicProgramsByCampus,
    fetchManagersByCampus,
    updateManagerHours,
    getUserManagedCampus,
    fetchWorkPlanAssignments,
    fetchProductProgressReports,
    upsertProductProgressReport,
    deleteProductProgressReport,
    fetchDocumentTemplates,
    createDocumentTemplate,
    updateDocumentTemplate,
    deleteDocumentTemplate,
    createStrategicAxis,
    updateStrategicAxis,
    deleteStrategicAxis,
    updateStrategicAxisUsage,
    createAction,
    updateAction,
    deleteAction,
    updateActionUsage,
    createProduct,
    updateProduct,
    deleteProduct,
    updateProductUsage,
    createCampus,
    updateCampus,
    deleteCampus,
    createFaculty,
    updateFaculty,
    deleteFaculty,
    createAcademicProgram,
    updateAcademicProgram,
    deleteAcademicProgram,
    createReportPeriod,
    updateReportPeriod,
    deleteReportPeriod,
    createSpecificLine,
    updateSpecificLine,
    deleteSpecificLine,
    createIndicator,
    updateIndicator,
    deleteIndicator,
    createProfile,
    updateProfile,
    deleteProfile,
    uploadFile,
    createTemplateBasedReport,
    updateTemplateBasedReport,
    fetchTemplateReportResponses,
    upsertTemplateReportResponse,
    createWorkPlan,
    updateWorkPlan,
    upsertWorkPlanAssignment,
    fetchPendingWorkPlans,
    approveWorkPlan,
    fetchWorkPlanDetails,
    createInternationalizationProject,
    fetchInternationalizationProjects,
    createPartnerInstitution,
    createInternationalizationReport,
    createManagerReport,
    fetchManagerReportsByManager,
    fetchTemplateBasedReports,
    deleteTemplateBasedReport,
    checkReportEditPermission,
    fetchReportSystemConfig,
    updateReportSystemConfig,
    updateUserCampusAccess,
    createManagerReportVersion,
    updateManagerReportVersion,
    getNextVersionNumber,
    createReportTemplate,
    updateReportTemplate,
    deleteReportTemplate,
    fetchUsersByCampus
  };
};

// Re-export types for convenience
export type {
  AcademicProgram,
  Action,
  Campus,
  Faculty,
  Indicator,
  InternationalizationProject,
  ManagerReport,
  Product,
  Profile,
  ReportPeriod,
  ReportTemplate,
  SpecificLine,
  TemplateBasedReport,
  TemplateReportResponse,
  WorkPlan,
  WorkPlanAssignment,
  ReportSystemConfig,
  ManagerReportVersion,
  ProjectPartnerInstitution,
  InternationalizationReport,
  StrategicAxis,
  DocumentTemplate,
  ProductProgressReport
};
