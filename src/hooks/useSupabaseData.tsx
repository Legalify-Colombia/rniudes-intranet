
import { supabase } from '@/integrations/supabase/client';
import {
  AcademicProgram,
  StrategicAxis,
  Action,
  Product,
  Profile,
  ReportPeriod,
  ProductProgressReport,
  ManagerReport,
  InternationalizationProject,
  ProjectPartnerInstitution,
  InternationalizationReport
} from '@/types';

interface SpecificLine {
  id: string;
  title: string;
  description: string;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface Indicator {
  id: string;
  name: string;
  data_type: 'numeric' | 'short_text' | 'long_text' | 'file' | 'link';
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// Export additional interfaces needed by other components
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
}

export interface DocumentTemplate {
  id: string;
  name: string;
  description?: string;
  template_type: string;
  template_content: string;
  file_url?: string;
  file_name?: string;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export { AcademicProgram };

export const useSupabaseData = () => {
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

      return { data: data as AcademicProgram[], error };
    } catch (error) {
      console.error('Error fetching academic programs:', error);
      return { data: null, error };
    }
  };

  const fetchStrategicAxes = async () => {
    try {
      const { data, error } = await supabase
        .from('strategic_axes')
        .select('*')
        .order('name');

      return { data: data as StrategicAxis[], error };
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

      return { data: data as StrategicAxis, error };
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

      return { data: data as StrategicAxis, error };
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

  const fetchActions = async () => {
    try {
      const { data, error } = await supabase
        .from('actions')
        .select('*')
        .order('name');

      return { data: data as Action[], error };
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

      return { data: data as Action, error };
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

      return { data: data as Action, error };
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

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name');

      return { data: data as Product[], error };
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

      return { data: data as Product, error };
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

      return { data: data as Product, error };
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

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          campus(*)
        `)
        .order('full_name');

      return { data: data as Profile[], error };
    } catch (error) {
      console.error('Error fetching profiles:', error);
      return { data: null, error };
    }
  };

  const fetchUsersByCampus = async (campusIds?: string[]) => {
    try {
      let query = supabase
        .from('profiles')
        .select(`
          *,
          campus(*)
        `)
        .order('full_name');
  
      if (campusIds && campusIds.length > 0) {
        query = query.in('campus_id', campusIds);
      }
  
      const { data, error } = await query;
  
      return { data: data as Profile[], error };
    } catch (error) {
      console.error('Error fetching users by campus:', error);
      return { data: null, error };
    }
  };

  const fetchCampus = async () => {
    try {
      const { data, error } = await supabase
        .from('campus')
        .select('*')
        .order('name');

      return { data: data as Campus[], error };
    } catch (error) {
      console.error('Error fetching campus:', error);
      return { data: null, error };
    }
  };

  const fetchReportPeriods = async () => {
    try {
      const { data, error } = await supabase
        .from('report_periods')
        .select('*')
        .order('start_date', { ascending: false });

      return { data: data as ReportPeriod[], error };
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

      return { data: data as ReportPeriod, error };
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

      return { data: data as ReportPeriod, error };
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

  const fetchProductProgressReports = async (managerReportId: string) => {
    try {
      const { data, error } = await supabase
        .from('product_progress_reports')
        .select('*')
        .eq('manager_report_id', managerReportId);

      return { data: data as ProductProgressReport[], error };
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

      return { data: data as ProductProgressReport, error };
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

      return { data: data as ProductProgressReport, error };
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

  const fetchManagerReports = async (managerId?: string) => {
    try {
      let query = supabase
        .from('manager_reports')
        .select(`
          *,
          report_periods(*)
        `)
        .order('created_at', { ascending: false });

      if (managerId) {
        query = query.eq('manager_id', managerId);
      }

      const { data, error } = await query;

      return { data: data as ManagerReport[], error };
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

      return { data: data as ManagerReport, error };
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

      return { data: data as ManagerReport, error };
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

  const uploadFile = async (file: File, folder: string, fileName?: string) => {
    try {
      const filePath = fileName || `${folder}/${file.name}`;
      const { data, error } = await supabase.storage
        .from('files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Error uploading file:', error);
        return { data: null, error };
      }

      const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/files/${data.path}`;
      return { data: { ...data, publicUrl }, error: null };
    } catch (error) {
      console.error('Error uploading file:', error);
      return { data: null, error };
    }
  };

  // Missing functions from other components
  const fetchFaculties = async () => {
    try {
      const { data, error } = await supabase
        .from('faculties')
        .select('*')
        .order('name');

      return { data: data as Faculty[], error };
    } catch (error) {
      console.error('Error fetching faculties:', error);
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

      return { data: data as Profile[], error };
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

      return { data: data as DocumentTemplate[], error };
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

      return { data: data as DocumentTemplate, error };
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

      return { data: data as DocumentTemplate, error };
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

  // Campus management functions
  const createCampus = async (campusData: Omit<Campus, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('campus')
        .insert([campusData])
        .select()
        .single();

      return { data: data as Campus, error };
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

      return { data: data as Campus, error };
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

  const fetchFacultiesByCampus = async (campusId: string) => {
    try {
      const { data, error } = await supabase
        .from('faculties')
        .select('*')
        .eq('campus_id', campusId)
        .order('name');

      return { data: data as Faculty[], error };
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

      return { data: data as Faculty, error };
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

      return { data: data as Faculty, error };
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

  const fetchAcademicProgramsByCampus = async (campusId: string) => {
    try {
      const { data, error } = await supabase
        .from('academic_programs')
        .select(`
          *,
          campus(*),
          faculties(*)
        `)
        .eq('campus_id', campusId)
        .order('name');

      return { data: data as AcademicProgram[], error };
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

      return { data: data as AcademicProgram, error };
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

      return { data: data as AcademicProgram, error };
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

  const fetchManagersByCampus = async (campusId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'Gestor')
        .eq('campus_id', campusId)
        .order('full_name');

      return { data: data as Profile[], error };
    } catch (error) {
      console.error('Error fetching managers by campus:', error);
      return { data: null, error };
    }
  };

  const updateManagerHours = async (managerId: string, updates: { weekly_hours?: number; number_of_weeks?: number; total_hours?: number }) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', managerId)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error updating manager hours:', error);
      return { data: null, error };
    }
  };

  // Nuevas funciones para líneas específicas e indicadores
  const fetchSpecificLines = async () => {
    try {
      const { data, error } = await supabase
        .from('specific_lines')
        .select('*')
        .eq('is_active', true)
        .order('title');

      return { data: data as SpecificLine[], error };
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

      return { data: data as SpecificLine, error };
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

      return { data: data as SpecificLine, error };
    } catch (error) {
      console.error('Error updating specific line:', error);
      return { data: null, error };
    }
  };

  const deleteSpecificLine = async (id: string) => {
    try {
      const { error } = await supabase
        .from('specific_lines')
        .update({ is_active: false })
        .eq('id', id);

      return { error };
    } catch (error) {
      console.error('Error deleting specific line:', error);
      return { error };
    }
  };

  const fetchIndicators = async () => {
    try {
      const { data, error } = await supabase
        .from('indicators')
        .select('*')
        .eq('is_active', true)
        .order('name');

      return { data: data as Indicator[], error };
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

      return { data: data as Indicator, error };
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

      return { data: data as Indicator, error };
    } catch (error) {
      console.error('Error updating indicator:', error);
      return { data: null, error };
    }
  };

  const deleteIndicator = async (id: string) => {
    try {
      const { error } = await supabase
        .from('indicators')
        .update({ is_active: false })
        .eq('id', id);

      return { error };
    } catch (error) {
      console.error('Error deleting indicator:', error);
      return { error };
    }
  };

  // Funciones para proyectos de internacionalización
  const fetchInternationalizationProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('internationalization_projects')
        .select(`
          *,
          strategic_axes(*),
          specific_lines(*),
          academic_programs(*, campus(*), faculties(*))
        `)
        .order('created_at', { ascending: false });

      return { data: data as InternationalizationProject[], error };
    } catch (error) {
      console.error('Error fetching internationalization projects:', error);
      return { data: null, error };
    }
  };

  const createInternationalizationProject = async (projectData: Omit<InternationalizationProject, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('internationalization_projects')
        .insert([projectData])
        .select()
        .single();

      return { data: data as InternationalizationProject, error };
    } catch (error) {
      console.error('Error creating internationalization project:', error);
      return { data: null, error };
    }
  };

  const updateInternationalizationProject = async (id: string, updates: Partial<InternationalizationProject>) => {
    try {
      const { data, error } = await supabase
        .from('internationalization_projects')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      return { data: data as InternationalizationProject, error };
    } catch (error) {
      console.error('Error updating internationalization project:', error);
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

      return { data: data as ProjectPartnerInstitution, error };
    } catch (error) {
      console.error('Error creating partner institution:', error);
      return { data: null, error };
    }
  };

  // Funciones para informes de internacionalización
  const fetchInternationalizationReports = async () => {
    try {
      const { data, error } = await supabase
        .from('internationalization_reports')
        .select(`
          *,
          internationalization_projects(*),
          report_periods(*)
        `)
        .order('created_at', { ascending: false });

      return { data: data as InternationalizationReport[], error };
    } catch (error) {
      console.error('Error fetching internationalization reports:', error);
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

      return { data: data as InternationalizationReport, error };
    } catch (error) {
      console.error('Error creating internationalization report:', error);
      return { data: null, error };
    }
  };

  const updateInternationalizationReport = async (id: string, updates: Partial<InternationalizationReport>) => {
    try {
      const { data, error } = await supabase
        .from('internationalization_reports')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      return { data: data as InternationalizationReport, error };
    } catch (error) {
      console.error('Error updating internationalization report:', error);
      return { data: null, error };
    }
  };

  // Función para actualizar acceso a campus del administrador
  const updateUserCampusAccess = async (userId: string, campusIds: string[]) => {
    try {
      const updates = {
        managed_campus_ids: campusIds.length > 0 ? campusIds : null,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error updating user campus access:', error);
      return { data: null, error };
    }
  };

  // Función para obtener campus gestionados por un usuario
  const getUserManagedCampus = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('managed_campus_ids, campus_id')
        .eq('id', userId)
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error fetching user managed campus:', error);
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
    
    // Missing functions restored
    fetchFaculties,
    fetchManagers,
    fetchWorkPlans,
    fetchWorkPlanAssignments,
    upsertProductProgressReport,
    fetchDocumentTemplates,
    createDocumentTemplate,
    updateDocumentTemplate,
    deleteDocumentTemplate,
    createCampus,
    updateCampus,
    deleteCampus,
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
    
    // Nuevas funciones
    fetchSpecificLines,
    createSpecificLine,
    updateSpecificLine,
    deleteSpecificLine,
    fetchIndicators,
    createIndicator,
    updateIndicator,
    deleteIndicator,
    fetchInternationalizationProjects,
    createInternationalizationProject,
    updateInternationalizationProject,
    createPartnerInstitution,
    fetchInternationalizationReports,
    createInternationalizationReport,
    updateInternationalizationReport,
    updateUserCampusAccess,
    getUserManagedCampus
  };
};
