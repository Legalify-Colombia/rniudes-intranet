import { supabase } from '@/integrations/supabase/client';
import type { 
  AcademicProgram, 
  StrategicAxis, 
  Action, 
  Product, 
  Profile, 
  Campus, 
  Faculty, 
  ReportPeriod, 
  ManagerReport, 
  ProductProgressReport, 
  DocumentTemplate,
  SpecificLine,
  Indicator,
  InternationalizationProject,
  ProjectPartnerInstitution,
  InternationalizationReport,
  ReportTemplate,
  ManagerReportVersion,
  TemplateBasedReport,
  TemplateReportResponse,
  ReportSystemConfig,
  WorkPlan,
  WorkPlanAssignment
} from '@/types';

export type { 
  AcademicProgram, 
  StrategicAxis, 
  Action, 
  Product, 
  Profile, 
  Campus, 
  Faculty, 
  ReportPeriod, 
  ManagerReport, 
  ProductProgressReport, 
  DocumentTemplate,
  SpecificLine,
  Indicator,
  InternationalizationProject,
  ProjectPartnerInstitution,
  InternationalizationReport,
  ReportTemplate,
  ManagerReportVersion,
  TemplateBasedReport,
  TemplateReportResponse,
  ReportSystemConfig,
  WorkPlan,
  WorkPlanAssignment
};

export const useSupabaseData = () => {
  // Academic Programs
  const fetchAcademicPrograms = async () => {
    try {
      const { data, error } = await supabase
        .from('academic_programs')
        .select(`
          *,
          campus(*),
          faculties(*)
        `)
        .order('name');
      return { data, error };
    } catch (error) {
      console.error('Error fetching academic programs:', error);
      return { data: null, error };
    }
  };

  // Strategic Axes
  const fetchStrategicAxes = async () => {
    try {
      const { data, error } = await supabase
        .from('strategic_axes')
        .select('*')
        .order('name');
      return { data, error };
    } catch (error) {
      console.error('Error fetching strategic axes:', error);
      return { data: null, error };
    }
  };

  const createStrategicAxis = async (axisData: Omit<StrategicAxis, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('strategic_axes')
        .insert([axisData])
        .select()
        .single();
      return { data, error };
    } catch (error) {
      console.error('Error creating strategic axis:', error);
      return { data: null, error };
    }
  };

  const updateStrategicAxis = async (id: string, updates: Partial<StrategicAxis>) => {
    try {
      const { data, error } = await supabase
        .from('strategic_axes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      return { data, error };
    } catch (error) {
      console.error('Error updating strategic axis:', error);
      return { data: null, error };
    }
  };

  const deleteStrategicAxis = async (id: string) => {
    try {
      const { error } = await supabase
        .from('strategic_axes')
        .delete()
        .eq('id', id);
      return { error };
    } catch (error) {
      console.error('Error deleting strategic axis:', error);
      return { error };
    }
  };

  // Actions
  const fetchActions = async () => {
    try {
      const { data, error } = await supabase
        .from('actions')
        .select(`
          *,
          strategic_axes(*)
        `)
        .order('name');
      return { data, error };
    } catch (error) {
      console.error('Error fetching actions:', error);
      return { data: null, error };
    }
  };

  const createAction = async (actionData: Omit<Action, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('actions')
        .insert([actionData])
        .select()
        .single();
      return { data, error };
    } catch (error) {
      console.error('Error creating action:', error);
      return { data: null, error };
    }
  };

  const updateAction = async (id: string, updates: Partial<Action>) => {
    try {
      const { data, error } = await supabase
        .from('actions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      return { data, error };
    } catch (error) {
      console.error('Error updating action:', error);
      return { data: null, error };
    }
  };

  const deleteAction = async (id: string) => {
    try {
      const { error } = await supabase
        .from('actions')
        .delete()
        .eq('id', id);
      return { error };
    } catch (error) {
      console.error('Error deleting action:', error);
      return { error };
    }
  };

  // Products
  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          actions(
            *,
            strategic_axes(*)
          )
        `)
        .order('name');
      return { data, error };
    } catch (error) {
      console.error('Error fetching products:', error);
      return { data: null, error };
    }
  };

  const createProduct = async (productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([productData])
        .select()
        .single();
      return { data, error };
    } catch (error) {
      console.error('Error creating product:', error);
      return { data: null, error };
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      return { data, error };
    } catch (error) {
      console.error('Error updating product:', error);
      return { data: null, error };
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      return { error };
    } catch (error) {
      console.error('Error deleting product:', error);
      return { error };
    }
  };

  // Profiles
  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          campus(*)
        `)
        .order('full_name');
      return { data, error };
    } catch (error) {
      console.error('Error fetching profiles:', error);
      return { data: null, error };
    }
  };

  const fetchUsersByCampus = async (campusId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('campus_id', campusId)
        .order('full_name');
      return { data, error };
    } catch (error) {
      console.error('Error fetching users by campus:', error);
      return { data: null, error };
    }
  };

  // Campus
  const fetchCampus = async () => {
    try {
      const { data, error } = await supabase
        .from('campus')
        .select('*')
        .order('name');
      return { data, error };
    } catch (error) {
      console.error('Error fetching campus:', error);
      return { data: null, error };
    }
  };

  // Report Periods
  const fetchReportPeriods = async () => {
    try {
      const { data, error } = await supabase
        .from('report_periods')
        .select('*')
        .order('start_date', { ascending: false });
      return { data, error };
    } catch (error) {
      console.error('Error fetching report periods:', error);
      return { data: null, error };
    }
  };

  const createReportPeriod = async (periodData: Omit<ReportPeriod, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('report_periods')
        .insert([periodData])
        .select()
        .single();
      return { data, error };
    } catch (error) {
      console.error('Error creating report period:', error);
      return { data: null, error };
    }
  };

  const updateReportPeriod = async (id: string, updates: Partial<ReportPeriod>) => {
    try {
      const { data, error } = await supabase
        .from('report_periods')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      return { data, error };
    } catch (error) {
      console.error('Error updating report period:', error);
      return { data: null, error };
    }
  };

  const deleteReportPeriod = async (id: string) => {
    try {
      const { error } = await supabase
        .from('report_periods')
        .delete()
        .eq('id', id);
      return { error };
    } catch (error) {
      console.error('Error deleting report period:', error);
      return { error };
    }
  };

  // Product Progress Reports
  const fetchProductProgressReports = async (managerReportId?: string) => {
    try {
      let query = supabase
        .from('product_progress_reports')
        .select(`
          *,
          manager_reports(*),
          products(*)
        `)
        .order('created_at', { ascending: false });

      if (managerReportId) {
        query = query.eq('manager_report_id', managerReportId);
      }

      const { data, error } = await query;
      return { data, error };
    } catch (error) {
      console.error('Error fetching product progress reports:', error);
      return { data: null, error };
    }
  };

  const createProductProgressReport = async (reportData: Omit<ProductProgressReport, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('product_progress_reports')
        .insert([reportData])
        .select()
        .single();
      return { data, error };
    } catch (error) {
      console.error('Error creating product progress report:', error);
      return { data: null, error };
    }
  };

  const updateProductProgressReport = async (id: string, updates: Partial<ProductProgressReport>) => {
    try {
      const { data, error } = await supabase
        .from('product_progress_reports')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      return { data, error };
    } catch (error) {
      console.error('Error updating product progress report:', error);
      return { data: null, error };
    }
  };

  const deleteProductProgressReport = async (id: string) => {
    try {
      const { error } = await supabase
        .from('product_progress_reports')
        .delete()
        .eq('id', id);
      return { error };
    } catch (error) {
      console.error('Error deleting product progress report:', error);
      return { error };
    }
  };

  // Manager Reports
  const fetchManagerReports = async () => {
    try {
      const { data, error } = await supabase
        .from('manager_reports')
        .select(`
          *,
          report_periods(*),
          manager:profiles(*),
          work_plan:work_plans(*)
        `)
        .order('created_at', { ascending: false });
      return { data, error };
    } catch (error) {
      console.error('Error fetching manager reports:', error);
      return { data: null, error };
    }
  };

  const createManagerReport = async (reportData: Omit<ManagerReport, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('manager_reports')
        .insert([reportData])
        .select()
        .single();
      return { data, error };
    } catch (error) {
      console.error('Error creating manager report:', error);
      return { data: null, error };
    }
  };

  const updateManagerReport = async (id: string, updates: Partial<ManagerReport>) => {
    try {
      const { data, error } = await supabase
        .from('manager_reports')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      return { data, error };
    } catch (error) {
      console.error('Error updating manager report:', error);
      return { data: null, error };
    }
  };

  const deleteManagerReport = async (id: string) => {
    try {
      const { error } = await supabase
        .from('manager_reports')
        .delete()
        .eq('id', id);
      return { error };
    } catch (error) {
      console.error('Error deleting manager report:', error);
      return { error };
    }
  };

  // File Upload
  const uploadFile = async (file: File, bucket: string, path: string) => {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file);
      return { data, error };
    } catch (error) {
      console.error('Error uploading file:', error);
      return { data: null, error };
    }
  };

  // Campus management functions
  const createCampus = async (campusData: Omit<Campus, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('campus')
        .insert([campusData])
        .select()
        .single();
      return { data, error };
    } catch (error) {
      console.error('Error creating campus:', error);
      return { data: null, error };
    }
  };

  const updateCampus = async (id: string, updates: Partial<Campus>) => {
    try {
      const { data, error } = await supabase
        .from('campus')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      return { data, error };
    } catch (error) {
      console.error('Error updating campus:', error);
      return { data: null, error };
    }
  };

  const deleteCampus = async (id: string) => {
    try {
      const { error } = await supabase
        .from('campus')
        .delete()
        .eq('id', id);
      return { error };
    } catch (error) {
      console.error('Error deleting campus:', error);
      return { error };
    }
  };

  const fetchFaculties = async () => {
    try {
      const { data, error } = await supabase
        .from('faculties')
        .select(`
          *,
          campus(*),
          faculty_campus(
            campus(*)
          )
        `)
        .order('name');
      return { data, error };
    } catch (error) {
      console.error('Error fetching faculties:', error);
      return { data: null, error };
    }
  };

  const fetchFacultiesByCampus = async (campusIds?: string[]) => {
    try {
      let query = supabase
        .from('faculties')
        .select(`
          *,
          campus(*),
          faculty_campus(
            campus(*)
          )
        `)
        .order('name');

      if (campusIds && campusIds.length > 0) {
        query = query.in('campus_id', campusIds);
      }

      const { data, error } = await query;
      return { data, error };
    } catch (error) {
      console.error('Error fetching faculties by campus:', error);
      return { data: null, error };
    }
  };

  const createFaculty = async (facultyData: Omit<Faculty, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('faculties')
        .insert([facultyData])
        .select()
        .single();
      return { data, error };
    } catch (error) {
      console.error('Error creating faculty:', error);
      return { data: null, error };
    }
  };

  const updateFaculty = async (id: string, updates: Partial<Faculty>) => {
    try {
      const { data, error } = await supabase
        .from('faculties')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      return { data, error };
    } catch (error) {
      console.error('Error updating faculty:', error);
      return { data: null, error };
    }
  };

  const deleteFaculty = async (id: string) => {
    try {
      const { error } = await supabase
        .from('faculties')
        .delete()
        .eq('id', id);
      return { error };
    } catch (error) {
      console.error('Error deleting faculty:', error);
      return { error };
    }
  };

  const fetchAcademicProgramsByCampus = async (campusIds?: string[]) => {
    try {
      let query = supabase
        .from('academic_programs')
        .select(`
          *,
          campus(*),
          faculties(*),
          manager:profiles(*)
        `)
        .order('name');

      if (campusIds && campusIds.length > 0) {
        query = query.in('campus_id', campusIds);
      }

      const { data, error } = await query;
      return { data, error };
    } catch (error) {
      console.error('Error fetching academic programs by campus:', error);
      return { data: null, error };
    }
  };

  const createAcademicProgram = async (programData: Omit<AcademicProgram, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('academic_programs')
        .insert([programData])
        .select()
        .single();
      return { data, error };
    } catch (error) {
      console.error('Error creating academic program:', error);
      return { data: null, error };
    }
  };

  const updateAcademicProgram = async (id: string, updates: Partial<AcademicProgram>) => {
    try {
      const { data, error } = await supabase
        .from('academic_programs')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      return { data, error };
    } catch (error) {
      console.error('Error updating academic program:', error);
      return { data: null, error };
    }
  };

  const deleteAcademicProgram = async (id: string) => {
    try {
      const { error } = await supabase
        .from('academic_programs')
        .delete()
        .eq('id', id);
      return { error };
    } catch (error) {
      console.error('Error deleting academic program:', error);
      return { error };
    }
  };

  const fetchManagersByCampus = async (campusIds?: string[]) => {
    try {
      let query = supabase
        .from('profiles')
        .select('*')
        .eq('role', 'Gestor')
        .order('full_name');

      if (campusIds && campusIds.length > 0) {
        query = query.in('campus_id', campusIds);
      }

      const { data, error } = await query;
      return { data, error };
    } catch (error) {
      console.error('Error fetching managers by campus:', error);
      return { data: null, error };
    }
  };

  const updateManagerHours = async (managerId: string, weeklyHours: number, numberOfWeeks: number) => {
    try {
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
    } catch (error) {
      console.error('Error updating manager hours:', error);
      return { data: null, error };
    }
  };

  const fetchManagers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'Gestor')
        .order('full_name');
      return { data, error };
    } catch (error) {
      console.error('Error fetching managers:', error);
      return { data: null, error };
    }
  };

  const fetchWorkPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('work_plans')
        .select('*')
        .order('created_at', { ascending: false });
      return { data, error };
    } catch (error) {
      console.error('Error fetching work plans:', error);
      return { data: null, error };
    }
  };

  const fetchWorkPlanAssignments = async (workPlanId: string) => {
    try {
      const { data, error } = await supabase
        .from('work_plan_assignments')
        .select(`
          *,
          product:products(*)
        `)
        .eq('work_plan_id', workPlanId);
      return { data, error };
    } catch (error) {
      console.error('Error fetching work plan assignments:', error);
      return { data: null, error };
    }
  };

  const upsertProductProgressReport = async (reportData: any) => {
    try {
      const { data, error } = await supabase
        .from('product_progress_reports')
        .upsert(reportData)
        .select()
        .single();
      return { data, error };
    } catch (error) {
      console.error('Error upserting product progress report:', error);
      return { data: null, error };
    }
  };

  const fetchDocumentTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('document_templates')
        .select('*')
        .order('name');
      return { data, error };
    } catch (error) {
      console.error('Error fetching document templates:', error);
      return { data: null, error };
    }
  };

  const createDocumentTemplate = async (templateData: Omit<DocumentTemplate, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('document_templates')
        .insert([templateData])
        .select()
        .single();
      return { data, error };
    } catch (error) {
      console.error('Error creating document template:', error);
      return { data: null, error };
    }
  };

  const updateDocumentTemplate = async (id: string, updates: Partial<DocumentTemplate>) => {
    try {
      const { data, error } = await supabase
        .from('document_templates')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      return { data, error };
    } catch (error) {
      console.error('Error updating document template:', error);
      return { data: null, error };
    }
  };

  const deleteDocumentTemplate = async (id: string) => {
    try {
      const { error } = await supabase
        .from('document_templates')
        .delete()
        .eq('id', id);
      return { error };
    } catch (error) {
      console.error('Error deleting document template:', error);
      return { error };
    }
  };

  // Specific lines functions
  const fetchSpecificLines = async () => {
    try {
      const { data, error } = await supabase
        .from('specific_lines')
        .select('*')
        .eq('is_active', true)
        .order('title');
      return { data, error };
    } catch (error) {
      console.error('Error fetching specific lines:', error);
      return { data: null, error };
    }
  };

  const createSpecificLine = async (lineData: Omit<SpecificLine, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('specific_lines')
        .insert([lineData])
        .select()
        .single();
      return { data, error };
    } catch (error) {
      console.error('Error creating specific line:', error);
      return { data: null, error };
    }
  };

  const updateSpecificLine = async (id: string, updates: Partial<SpecificLine>) => {
    try {
      const { data, error } = await supabase
        .from('specific_lines')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      return { data, error };
    } catch (error) {
      console.error('Error updating specific line:', error);
      return { data: null, error };
    }
  };

  const deleteSpecificLine = async (id: string) => {
    try {
      const { error } = await supabase
        .from('specific_lines')
        .delete()
        .eq('id', id);
      return { error };
    } catch (error) {
      console.error('Error deleting specific line:', error);
      return { error };
    }
  };

  // Indicators functions
  const fetchIndicators = async () => {
    try {
      const { data, error } = await supabase
        .from('indicators')
        .select('*')
        .eq('is_active', true)
        .order('name');
      return { data, error };
    } catch (error) {
      console.error('Error fetching indicators:', error);
      return { data: null, error };
    }
  };

  const createIndicator = async (indicatorData: Omit<Indicator, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('indicators')
        .insert([indicatorData])
        .select()
        .single();
      return { data, error };
    } catch (error) {
      console.error('Error creating indicator:', error);
      return { data: null, error };
    }
  };

  const updateIndicator = async (id: string, updates: Partial<Indicator>) => {
    try {
      const { data, error } = await supabase
        .from('indicators')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      return { data, error };
    } catch (error) {
      console.error('Error updating indicator:', error);
      return { data: null, error };
    }
  };

  const deleteIndicator = async (id: string) => {
    try {
      const { error } = await supabase
        .from('indicators')
        .delete()
        .eq('id', id);
      return { error };
    } catch (error) {
      console.error('Error deleting indicator:', error);
      return { error };
    }
  };

  // Internationalization functions
  const createInternationalizationProject = async (projectData: Omit<InternationalizationProject, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('internationalization_projects')
        .insert([projectData])
        .select()
        .single();
      return { data, error };
    } catch (error) {
      console.error('Error creating internationalization project:', error);
      return { data: null, error };
    }
  };

  const createProjectPartnerInstitution = async (institutionData: Omit<ProjectPartnerInstitution, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('project_partner_institutions')
        .insert([institutionData])
        .select()
        .single();
      return { data, error };
    } catch (error) {
      console.error('Error creating project partner institution:', error);
      return { data: null, error };
    }
  };

  const createInternationalizationReport = async (reportData: Omit<InternationalizationReport, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('internationalization_reports')
        .insert([reportData])
        .select()
        .single();
      return { data, error };
    } catch (error) {
      console.error('Error creating internationalization report:', error);
      return { data: null, error };
    }
  };

  // User management functions
  const updateProfile = async (id: string, updates: Partial<Profile>) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      return { data, error };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { data: null, error };
    }
  };

  const getUserManagedCampus = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('managed_campus_ids, campus_id')
        .eq('id', userId)
        .single();
      return { data, error };
    } catch (error) {
      console.error('Error getting user managed campus:', error);
      return { data: null, error };
    }
  };

  // Usage update functions
  const updateStrategicAxisUsage = async (id: string, usageType: string[]) => {
    try {
      const { data, error } = await supabase
        .from('strategic_axes')
        .update({ usage_type: usageType })
        .eq('id', id)
        .select()
        .single();
      return { data, error };
    } catch (error) {
      console.error('Error updating strategic axis usage:', error);
      return { data: null, error };
    }
  };

  const updateActionUsage = async (id: string, usageType: string[]) => {
    try {
      const { data, error } = await supabase
        .from('actions')
        .update({ usage_type: usageType })
        .eq('id', id)
        .select()
        .single();
      return { data, error };
    } catch (error) {
      console.error('Error updating action usage:', error);
      return { data: null, error };
    }
  };

  const updateProductUsage = async (id: string, usageType: string[]) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .update({ usage_type: usageType })
        .eq('id', id)
        .select()
        .single();
      return { data, error };
    } catch (error) {
      console.error('Error updating product usage:', error);
      return { data: null, error };
    }
  };

  // Template report functions
  const fetchReportTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('report_templates')
        .select('*')
        .order('name');
      return { data, error };
    } catch (error) {
      console.error('Error fetching report templates:', error);
      return { data: null, error };
    }
  };

  const createTemplateBasedReport = async (reportData: any) => {
    try {
      const { data, error } = await supabase
        .from('template_based_reports')
        .insert([reportData])
        .select()
        .single();
      return { data, error };
    } catch (error) {
      console.error('Error creating template based report:', error);
      return { data: null, error };
    }
  };

  const updateTemplateBasedReport = async (id: string, updates: any) => {
    try {
      const { data, error } = await supabase
        .from('template_based_reports')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      return { data, error };
    } catch (error) {
      console.error('Error updating template based report:', error);
      return { data: null, error };
    }
  };

  const fetchTemplateReportResponses = async (templateReportId: string) => {
    try {
      const { data, error } = await supabase
        .from('template_report_responses')
        .select('*')
        .eq('template_report_id', templateReportId);
      return { data, error };
    } catch (error) {
      console.error('Error fetching template report responses:', error);
      return { data: null, error };
    }
  };

  const upsertTemplateReportResponse = async (responseData: any) => {
    try {
      const { data, error } = await supabase
        .from('template_report_responses')
        .upsert(responseData)
        .select()
        .single();
      return { data, error };
    } catch (error) {
      console.error('Error upserting template report response:', error);
      return { data: null, error };
    }
  };

  const checkReportEditPermission = async (reportId: string) => {
    try {
      const { data, error } = await supabase
        .from('manager_reports')
        .select('can_edit, report_period_id')
        .eq('id', reportId)
        .single();
      return { data, error };
    } catch (error) {
      console.error('Error checking report edit permission:', error);
      return { data: null, error };
    }
  };

  const createPartnerInstitution = async (institutionData: Omit<ProjectPartnerInstitution, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('project_partner_institutions')
        .insert([institutionData])
        .select()
        .single();
      return { data, error };
    } catch (error) {
      console.error('Error creating partner institution:', error);
      return { data: null, error };
    }
  };

  const fetchInternationalizationProjects = async (managerId?: string) => {
    try {
      let query = supabase
        .from('internationalization_projects')
        .select(`
          *,
          strategic_axes(*),
          specific_lines(*),
          academic_programs(*)
        `)
        .order('created_at', { ascending: false });

      if (managerId) {
        query = query.eq('manager_id', managerId);
      }

      const { data, error } = await query;
      return { data, error };
    } catch (error) {
      console.error('Error fetching internationalization projects:', error);
      return { data: null, error };
    }
  };

  const fetchManagerReportsByManager = async (managerId: string) => {
    try {
      const { data, error } = await supabase
        .from('manager_reports')
        .select(`
          *,
          report_periods(*),
          work_plan:work_plans(*)
        `)
        .eq('manager_id', managerId)
        .order('created_at', { ascending: false });
      return { data, error };
    } catch (error) {
      console.error('Error fetching manager reports by manager:', error);
      return { data: null, error };
    }
  };

  const fetchTemplateBasedReports = async (managerId?: string) => {
    try {
      let query = supabase
        .from('template_based_reports')
        .select(`
          *,
          report_template:report_templates(*),
          report_period:report_periods(*),
          manager:profiles(*)
        `)
        .order('created_at', { ascending: false });

      if (managerId) {
        query = query.eq('manager_id', managerId);
      }

      const { data, error } = await query;
      return { data, error };
    } catch (error) {
      console.error('Error fetching template based reports:', error);
      return { data: null, error };
    }
  };

  const deleteTemplateBasedReport = async (id: string) => {
    try {
      const { error } = await supabase
        .from('template_based_reports')
        .delete()
        .eq('id', id);
      return { error };
    } catch (error) {
      console.error('Error deleting template based report:', error);
      return { error };
    }
  };

  const fetchReportSystemConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('report_system_config')
        .select('*')
        .single();
      return { data, error };
    } catch (error) {
      console.error('Error fetching report system config:', error);
      return { data: null, error };
    }
  };

  const updateReportSystemConfig = async (id: string, updates: Partial<ReportSystemConfig>) => {
    try {
      const { data, error } = await supabase
        .from('report_system_config')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      return { data, error };
    } catch (error) {
      console.error('Error updating report system config:', error);
      return { data: null, error };
    }
  };

  const createManagerReportVersion = async (versionData: Omit<ManagerReportVersion, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('manager_report_versions')
        .insert([versionData])
        .select()
        .single();
      return { data, error };
    } catch (error) {
      console.error('Error creating manager report version:', error);
      return { data: null, error };
    }
  };

  const updateManagerReportVersion = async (id: string, updates: Partial<ManagerReportVersion>) => {
    try {
      const { data, error } = await supabase
        .from('manager_report_versions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      return { data, error };
    } catch (error) {
      console.error('Error updating manager report version:', error);
      return { data: null, error };
    }
  };

  const getNextVersionNumber = async (managerReportId: string, templateId: string) => {
    try {
      const { data, error } = await supabase
        .rpc('get_next_version_number', {
          p_manager_report_id: managerReportId,
          p_template_id: templateId
        });
      return { data, error };
    } catch (error) {
      console.error('Error getting next version number:', error);
      return { data: null, error };
    }
  };

  const createReportTemplate = async (templateData: Omit<ReportTemplate, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('report_templates')
        .insert([templateData])
        .select()
        .single();
      return { data, error };
    } catch (error) {
      console.error('Error creating report template:', error);
      return { data: null, error };
    }
  };

  const updateReportTemplate = async (id: string, updates: Partial<ReportTemplate>) => {
    try {
      const { data, error } = await supabase
        .from('report_templates')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      return { data, error };
    } catch (error) {
      console.error('Error updating report template:', error);
      return { data: null, error };
    }
  };

  const deleteReportTemplate = async (id: string) => {
    try {
      const { error } = await supabase
        .from('report_templates')
        .delete()
        .eq('id', id);
      return { error };
    } catch (error) {
      console.error('Error deleting report template:', error);
      return { error };
    }
  };

  // Work plan functions
  const createWorkPlan = async (workPlanData: Omit<WorkPlan, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('work_plans')
        .insert([workPlanData])
        .select()
        .single();
      return { data, error };
    } catch (error) {
      console.error('Error creating work plan:', error);
      return { data: null, error };
    }
  };

  const updateWorkPlan = async (id: string, updates: Partial<WorkPlan>) => {
    try {
      const { data, error } = await supabase
        .from('work_plans')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      return { data, error };
    } catch (error) {
      console.error('Error updating work plan:', error);
      return { data: null, error };
    }
  };

  const upsertWorkPlanAssignment = async (assignmentData: Omit<WorkPlanAssignment, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('work_plan_assignments')
        .upsert(assignmentData)
        .select()
        .single();
      return { data, error };
    } catch (error) {
      console.error('Error upserting work plan assignment:', error);
      return { data: null, error };
    }
  };

  const fetchWorkPlanDetails = async (workPlanId: string) => {
    try {
      const { data, error } = await supabase
        .from('work_plans')
        .select(`
          *,
          work_plan_assignments(
            *,
            product:products(*)
          )
        `)
        .eq('id', workPlanId)
        .single();
      return { data, error };
    } catch (error) {
      console.error('Error fetching work plan details:', error);
      return { data: null, error };
    }
  };

  const fetchPendingWorkPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('work_plans')
        .select('*')
        .eq('status', 'submitted')
        .order('submitted_date', { ascending: false });
      return { data, error };
    } catch (error) {
      console.error('Error fetching pending work plans:', error);
      return { data: null, error };
    }
  };

  const approveWorkPlan = async (id: string, approvalData: any) => {
    try {
      const { data, error } = await supabase
        .from('work_plans')
        .update(approvalData)
        .eq('id', id)
        .select()
        .single();
      return { data, error };
    } catch (error) {
      console.error('Error approving work plan:', error);
      return { data: null, error };
    }
  };

  const updateUserCampusAccess = async (userId: string, campusIds: string[]) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ managed_campus_ids: campusIds })
        .eq('id', userId)
        .select()
        .single();
      return { data, error };
    } catch (error) {
      console.error('Error updating user campus access:', error);
      return { data: null, error };
    }
  };

  return {
    fetchAcademicPrograms,
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
    fetchProfiles,
    fetchUsersByCampus,
    fetchCampus,
    fetchReportPeriods,
    createReportPeriod,
    updateReportPeriod,
    deleteReportPeriod,
    fetchProductProgressReports,
    createProductProgressReport,
    updateProductProgressReport,
    deleteProductProgressReport,
    fetchManagerReports,
    createManagerReport,
    updateManagerReport,
    deleteManagerReport,
    uploadFile,
    // Campus management
    createCampus,
    updateCampus,
    deleteCampus,
    fetchFaculties,
    fetchFacultiesByCampus,
    createFaculty,
    updateFaculty,
    deleteFaculty,
    fetchAcademicProgramsByCampus,
    createAcademicProgram,
    updateAcademicProgram,
    deleteAcademicProgram,
    fetchManagersByCampus,
    updateManagerHours,
    fetchManagers,
    fetchWorkPlans,
    fetchWorkPlanAssignments,
    upsertProductProgressReport,
    // Document templates
    fetchDocumentTemplates,
    createDocumentTemplate,
    updateDocumentTemplate,
    deleteDocumentTemplate,
    // Specific lines
    fetchSpecificLines,
    createSpecificLine,
    updateSpecificLine,
    deleteSpecificLine,
    // Indicators
    fetchIndicators,
    createIndicator,
    updateIndicator,
    deleteIndicator,
    // Internationalization
    createInternationalizationProject,
    createProjectPartnerInstitution,
    createInternationalizationReport,
    // User management
    updateProfile,
    getUserManagedCampus,
    // Usage updates
    updateStrategicAxisUsage,
    updateActionUsage,
    updateProductUsage,
    // Template reports
    fetchReportTemplates,
    createTemplateBasedReport,
    updateTemplateBasedReport,
    fetchTemplateReportResponses,
    upsertTemplateReportResponse,
    checkReportEditPermission,
    createPartnerInstitution,
    fetchInternationalizationProjects,
    fetchManagerReportsByManager,
    fetchTemplateBasedReports,
    deleteTemplateBasedReport,
    fetchReportSystemConfig,
    updateReportSystemConfig,
    createManagerReportVersion,
    updateManagerReportVersion,
    getNextVersionNumber,
    createReportTemplate,
    updateReportTemplate,
    deleteReportTemplate,
    // Work plan functions
    createWorkPlan,
    updateWorkPlan,
    upsertWorkPlanAssignment,
    fetchWorkPlanDetails,
    fetchPendingWorkPlans,
    approveWorkPlan,
    updateUserCampusAccess
  };
};
