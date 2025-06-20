
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
  ProductProgressReport,
  User
} from "@/types";

// Tipos para las inserciones y actualizaciones, omitiendo campos generados por la BD
type Insert<T extends { id: any, created_at: any, updated_at?: any }> = Omit<T, 'id' | 'created_at' | 'updated_at'>;
type Update<T> = Partial<T>;


export const useSupabaseData = () => {
    // --- Fetch (Read) Operations ---

    // Corregido: Usa la tabla 'academic_programs' y realiza un join para obtener detalles.
    const fetchAcademicPrograms = async () => {
        return await supabase.from('academic_programs').select('*, campus(*), faculty(*)');
    };

    const fetchStrategicAxes = async () => await supabase.from('strategic_axes').select('*');
    const fetchActions = async () => await supabase.from('actions').select('*, strategic_axis:strategic_axes(*)');
    const fetchProducts = async () => await supabase.from('products').select('*, action:actions(*, strategic_axis:strategic_axes(*))');
    const fetchCampus = async () => await supabase.from('campus').select('*');
    
    // Corregido: Usa la tabla 'faculties' y realiza un join para obtener el campus.
    const fetchFaculties = async () => {
        return await supabase.from('faculties').select('*, campus(*), faculty_campus(*, campus(*))');
    };

    const fetchReportPeriods = async () => await supabase.from('report_periods').select('*');
    const fetchSpecificLines = async () => await supabase.from('specific_lines').select('*');
    const fetchIndicators = async () => await supabase.from('indicators').select('*');
    
    // Corregido: Obtiene perfiles con su campus asociado.
    const fetchProfiles = async () => {
        return await supabase.from('profiles').select('*, campus:campus_id(*)');
    };
    
    const fetchManagers = async () => {
        return await supabase.from('profiles').select('*, campus:campus_id(*), academic_programs(*, campus(*), faculty(*))').eq('role', 'Gestor');
    };

    const fetchReportTemplates = async () => await supabase.from('report_templates').select('*');
    const fetchWorkPlans = async () => await supabase.from('work_plans').select('*');
    const fetchManagerReports = async () => await supabase.from('manager_reports').select('*, manager:profiles(*), work_plan:work_plans(*), report_period:report_periods(*)');
    const fetchWorkPlanAssignments = async (workPlanId: string) => await supabase.from('work_plan_assignments').select('*, product:products(*, action:actions(*, strategic_axis:strategic_axes(*)))').eq('work_plan_id', workPlanId);
    const fetchProductProgressReports = async (managerReportId: string) => await supabase.from('product_progress_reports').select('*').eq('manager_report_id', managerReportId);
    const fetchDocumentTemplates = async () => await supabase.from('document_templates').select('*');
    const fetchTemplateBasedReports = async (managerId: string) => await supabase.from('template_based_reports_with_details').select('*').eq('manager_id', managerId);
    const fetchReportSystemConfig = async () => await supabase.from('report_system_config').select('*').single();
    const fetchInternationalizationProjects = async () => await supabase.from('internationalization_projects').select('*');
    const fetchTemplateReportResponses = async (templateReportId: string) => await supabase.from('template_report_responses').select('*').eq('template_report_id', templateReportId);
    const fetchPendingWorkPlans = async () => await supabase.from('work_plans_with_manager').select('*').eq('status', 'submitted');
    const fetchWorkPlanDetails = async (workPlanId: string) => await supabase.from('work_plans').select('*, manager:profiles(*), program:academic_programs(*, campus(*), faculty(*)), work_plan_assignments(*,product:products(*))').eq('id', workPlanId).single();

    const fetchUsersByCampus = async (campusIds?: string[]) => {
        let query = supabase.from('profiles').select('*, campus:campus_id(id, name)');
        if (campusIds && campusIds.length > 0) {
            query = query.in('campus_id', campusIds);
        }
        return query;
    };
    
    const getUserManagedCampus = async (userId: string) => await supabase.from('profiles').select('managed_campus_ids, campus_id').eq('id', userId).single();
    
    // --- Create, Update, Delete Operations ---

    const uploadFile = async (file: File, bucket: string = 'reports', folder?: string) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = folder ? `${folder}/${fileName}` : fileName;
        const { data, error } = await supabase.storage.from(bucket).upload(filePath, file);
        if (error) return { data: null, error };
        const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(filePath);
        return { data: { ...data, publicUrl }, error: null };
    };

    // Generic CRUD functions
    const createRecord = <T extends { id: any; created_at: any; updated_at?: any; }>(table: string, data: Insert<T>) => supabase.from(table).insert(data).select().single();
    const updateRecord = <T>(table: string, id: string, data: Update<T>) => supabase.from(table).update(data).eq('id', id).select().single();
    const deleteRecord = (table: string, id: string) => supabase.from(table).delete().eq('id', id);
    const upsertRecord = <T extends { id: any; created_at: any; updated_at?: any; }>(table: string, data: Insert<T>) => supabase.from(table).upsert(data).select().single();

    return {
        // Fetch
        fetchAcademicPrograms, fetchStrategicAxes, fetchActions, fetchProducts, fetchCampus, fetchFaculties, fetchReportPeriods, fetchSpecificLines, fetchIndicators, fetchProfiles, fetchManagers, fetchReportTemplates, fetchWorkPlans, fetchManagerReports, fetchWorkPlanAssignments, fetchProductProgressReports, fetchDocumentTemplates, fetchTemplateBasedReports, fetchReportSystemConfig, fetchInternationalizationProjects, fetchTemplateReportResponses, fetchPendingWorkPlans, fetchWorkPlanDetails, fetchUsersByCampus, getUserManagedCampus,
        // CUD
        uploadFile,
        createCampus: (d: Insert<Campus>) => createRecord('campus', d),
        updateCampus: (id: string, d: Update<Campus>) => updateRecord('campus', id, d),
        deleteCampus: (id: string) => deleteRecord('campus', id),
        
        createFaculty: (d: Insert<Faculty>) => createRecord('faculties', d),
        updateFaculty: (id: string, d: Update<Faculty>) => updateRecord('faculties', id, d),
        deleteFaculty: (id: string) => deleteRecord('faculties', id),

        createAcademicProgram: (d: Insert<AcademicProgram>) => createRecord('academic_programs', d),
        updateAcademicProgram: (id: string, d: Update<AcademicProgram>) => updateRecord('academic_programs', id, d),
        deleteAcademicProgram: (id: string) => deleteRecord('academic_programs', id),

        createReportPeriod: (d: Insert<ReportPeriod>) => createRecord('report_periods', d),
        updateReportPeriod: (id: string, d: Update<ReportPeriod>) => updateRecord('report_periods', id, d),
        deleteReportPeriod: (id: string) => deleteRecord('report_periods', id),

        createSpecificLine: (d: Insert<SpecificLine>) => createRecord('specific_lines', d),
        updateSpecificLine: (id: string, d: Update<SpecificLine>) => updateRecord('specific_lines', id, d),
        deleteSpecificLine: (id: string) => deleteRecord('specific_lines', id),

        createIndicator: (d: Insert<Indicator>) => createRecord('indicators', d),
        updateIndicator: (id: string, d: Update<Indicator>) => updateRecord('indicators', id, d),
        deleteIndicator: (id: string) => deleteRecord('indicators', id),

        createStrategicAxis: (d: Insert<StrategicAxis>) => createRecord('strategic_axes', { ...d, usage_type: d.usage_type || ['work_plan'] }),
        updateStrategicAxisUsage: (id: string, usageType: string[]) => updateRecord('strategic_axes', id, { usage_type: usageType }),
        
        createAction: (d: Insert<Action>) => createRecord('actions', { ...d, usage_type: d.usage_type || ['work_plan'] }),
        updateActionUsage: (id: string, usageType: string[]) => updateRecord('actions', id, { usage_type: usageType }),

        createProduct: (d: Insert<Product>) => createRecord('products', { ...d, usage_type: d.usage_type || ['work_plan'] }),
        updateProductUsage: (id: string, usageType: string[]) => updateRecord('products', id, { usage_type: usageType }),

        createWorkPlan: (d: Insert<WorkPlan>) => createRecord('work_plans', d),
        updateWorkPlan: (id: string, d: Update<WorkPlan>) => updateRecord('work_plans', id, d),
        upsertWorkPlanAssignment: (d: Insert<WorkPlanAssignment>) => upsertRecord('work_plan_assignments', d),

        createManagerReport: (d: Insert<ManagerReport>) => createRecord('manager_reports', d),
        updateManagerReport: (id: string, d: Update<ManagerReport>) => updateRecord('manager_reports', id, d),
        upsertProductProgressReport: (d: Insert<ProductProgressReport>) => upsertRecord('product_progress_reports', d),

        createDocumentTemplate: (d: Insert<DocumentTemplate>) => createRecord('document_templates', d),
        updateDocumentTemplate: (id: string, d: Update<DocumentTemplate>) => updateRecord('document_templates', id, d),
        deleteDocumentTemplate: (id: string) => deleteRecord('document_templates', id),
        
        createReportTemplate: (d: Insert<ReportTemplate>) => createRecord('report_templates', d),
        updateReportTemplate: (id: string, d: Update<ReportTemplate>) => updateRecord('report_templates', id, d),
        deleteReportTemplate: (id: string) => deleteRecord('report_templates', id),
        
        createTemplateBasedReport: (d: Insert<TemplateBasedReport>) => createRecord('template_based_reports', d),
        updateTemplateBasedReport: (id: string, d: Update<TemplateBasedReport>) => updateRecord('template_based_reports', id, d),
        deleteTemplateBasedReport: (id: string) => deleteRecord('template_based_reports', id),
        upsertTemplateReportResponse: (d: Insert<TemplateReportResponse>) => upsertRecord('template_report_responses', d),

        approveWorkPlan: (workPlanId: string, status: 'approved' | 'rejected', comments?: string) => updateRecord('work_plans', workPlanId, { status, approval_comments: comments, approved_date: new Date().toISOString() }),
        updateManagerHours: (managerId: string, weeklyHours: number, numberOfWeeks: number) => updateRecord('profiles', managerId, { weekly_hours: weeklyHours, number_of_weeks: numberOfWeeks, total_hours: weeklyHours * numberOfWeeks }),
        updateUserCampusAccess: (userId: string, campusIds: string[]) => updateRecord('profiles', userId, { managed_campus_ids: campusIds }),
        createInternationalizationProject: (d: Insert<InternationalizationProject>) => createRecord('internationalization_projects', d),
        createPartnerInstitution: (d: Insert<ProjectPartnerInstitution>) => createRecord('project_partner_institutions', d),
        createInternationalizationReport: (d: Insert<InternationalizationReport>) => createRecord('internationalization_reports', d),
        
        // Faltantes de la versión original
        checkReportEditPermission: async (reportId: string) => supabase.rpc('is_period_active', { period_id: reportId }),
        updateReportSystemConfig: async (data: Update<ReportSystemConfig>) => updateRecord('report_system_config', data.id!, data),
        createManagerReportVersion: async (data: Insert<ManagerReportVersion>) => createRecord('manager_report_versions', data),
        updateManagerReportVersion: async (id: string, data: Update<ManagerReportVersion>) => updateRecord('manager_report_versions', id, data),
        getNextVersionNumber: async (managerReportId: string, templateId: string) => supabase.rpc('get_next_version_number', { p_manager_report_id: managerReportId, p_template_id: templateId }),

    };
};
