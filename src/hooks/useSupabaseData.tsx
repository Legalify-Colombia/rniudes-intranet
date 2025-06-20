
import { PostgrestError } from "@supabase/supabase-js";
import { v4 as uuidv4 } from 'uuid';

import { supabase } from "@/integrations/supabase/client";

interface Result<T> {
  data: T | null;
  error: PostgrestError | Error | null;
}

// Export types for use in components
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
  action?: Action & { strategic_axis?: StrategicAxis };
}

// Types for campus management
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
}

export interface AcademicProgram {
  id: string;
  name: string;
  director_name: string;
  director_email: string;
  faculty_id: string;
  campus_id: string;
  manager_id?: string;
  created_at: string;
  updated_at: string;
  faculty?: Faculty;
  campus?: Campus;
  manager?: any;
}

// Document template interface
export interface DocumentTemplate {
  id: string;
  name: string;
  description?: string;
  template_type: "pdf" | "doc";
  template_content: string;
  file_url?: string;
  file_name?: string;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// Report template interface
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
  is_active: boolean;
  max_versions?: number;
  sharepoint_base_url?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

// Manager report version interface
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

export function useSupabaseData() {
  const fetchStrategicAxes = async (): Promise<Result<StrategicAxis[]>> => {
    try {
      const { data, error } = await supabase
        .from('strategic_axes')
        .select('*')
        .order('code');

      if (error) {
        console.error("Error fetching strategic axes:", error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error("Unexpected error fetching strategic axes:", error);
      return { data: null, error: error instanceof Error ? error : new Error(String(error)) };
    }
  };

  const fetchActions = async (): Promise<Result<Action[]>> => {
    try {
      const { data, error } = await supabase
        .from('actions')
        .select('*, strategic_axes!inner(id, code, name)')
        .order('code');

      if (error) {
        console.error("Error fetching actions:", error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error("Unexpected error fetching actions:", error);
      return { data: null, error: error instanceof Error ? error : new Error(String(error)) };
    }
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, actions!inner(id, code, name, strategic_axes(id, code, name))')
        .order('name');

      if (error) {
        console.error("Error fetching products:", error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error("Unexpected error fetching products:", error);
      return { data: null, error: error instanceof Error ? error : new Error(String(error)) };
    }
  };

  const fetchWorkPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('work_plans')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching work plans:", error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error("Unexpected error fetching work plans:", error);
      return { data: null, error: error instanceof Error ? error : new Error(String(error)) };
    }
  };

  const fetchWorkPlanAssignments = async (workPlanId: string) => {
    try {
      const { data, error } = await supabase
        .from('work_plan_assignments')
        .select('*, products(id, name, actions(id, strategic_axes(id)))')
        .eq('work_plan_id', workPlanId);

      if (error) {
        console.error("Error fetching work plan assignments:", error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error("Unexpected error fetching work plan assignments:", error);
      return { data: null, error: error instanceof Error ? error : new Error(String(error)) };
    }
  };

  const fetchManagerReports = async () => {
    try {
      const { data, error } = await supabase
        .from('manager_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching manager reports:", error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error("Unexpected error fetching manager reports:", error);
      return { data: null, error: error instanceof Error ? error : new Error(String(error)) };
    }
  };

  const fetchManagerReportsByManager = async (managerId: string) => {
    try {
      const { data, error } = await supabase
        .from('manager_reports')
        .select('*')
        .eq('manager_id', managerId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching manager reports by manager:", error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error("Unexpected error fetching manager reports by manager:", error);
      return { data: null, error: error instanceof Error ? error : new Error(String(error)) };
    }
  };

  const createManagerReport = async (reportData: any) => {
    try {
      const { data, error } = await supabase
        .from('manager_reports')
        .insert(reportData)
        .select()
        .single();

      if (error) {
        console.error("Error creating manager report:", error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error("Unexpected error creating manager report:", error);
      return { data: null, error: error instanceof Error ? error : new Error(String(error)) };
    }
  };

  const updateManagerReport = async (reportId: string, updates: any) => {
    try {
      const { data, error } = await supabase
        .from('manager_reports')
        .update(updates)
        .eq('id', reportId)
        .select()
        .single();

      if (error) {
        console.error("Error updating manager report:", error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error("Unexpected error updating manager report:", error);
      return { data: null, error: error instanceof Error ? error : new Error(String(error)) };
    }
  };

  const fetchProductProgressReports = async (managerReportId: string) => {
    try {
      const { data, error } = await supabase
        .from('product_progress_reports')
        .select('*')
        .eq('manager_report_id', managerReportId);

      if (error) {
        console.error("Error fetching product progress reports:", error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error("Unexpected error fetching product progress reports:", error);
      return { data: null, error: error instanceof Error ? error : new Error(String(error)) };
    }
  };

  const upsertProductProgressReport = async (reportData: any) => {
    try {
      const { data, error } = await supabase
        .from('product_progress_reports')
        .upsert(reportData, {
          onConflict: 'manager_report_id,product_id'
        })
        .select()
        .single();

      if (error) {
        console.error("Error upserting product progress report:", error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error("Unexpected error upserting product progress report:", error);
      return { data: null, error: error instanceof Error ? error : new Error(String(error)) };
    }
  };

  const uploadEvidenceFile = async (file: File, productId: string, reportId: string) => {
    const fileName = `${uuidv4()}-${file.name}`;
    const filePath = `reports/${reportId}/${productId}/${fileName}`;

    try {
      const { data, error } = await supabase
        .storage
        .from('evidences')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error("Error uploading file:", error);
        return { data: null, error };
      }

      return { data: { path: filePath, fileName }, error: null };
    } catch (error) {
      console.error("Unexpected error uploading file:", error);
      return { data: null, error: error instanceof Error ? error : new Error(String(error)) };
    }
  };

  const deleteEvidenceFile = async (filePath: string) => {
    try {
      const { error } = await supabase
        .storage
        .from('evidences')
        .remove([filePath]);

      if (error) {
        console.error("Error deleting file:", error);
        return { error };
      }

      return { error: null };
    } catch (error) {
      console.error("Unexpected error deleting file:", error);
      return { error: error instanceof Error ? error : new Error(String(error)) };
    }
  };

  // User management functions
  const fetchManagers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*, campus(id, name)')
        .eq('role', 'Gestor')
        .order('full_name');

      if (error) {
        console.error("Error fetching managers:", error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error("Unexpected error fetching managers:", error);
      return { data: null, error: error instanceof Error ? error : new Error(String(error)) };
    }
  };

  const fetchManagersByCampus = async (campusIds: string | string[]) => {
    try {
      const ids = Array.isArray(campusIds) ? campusIds : [campusIds];
      const { data, error } = await supabase
        .from('profiles')
        .select('*, campus(id, name)')
        .eq('role', 'Gestor')
        .in('campus_id', ids)
        .order('full_name');

      if (error) {
        console.error("Error fetching managers by campus:", error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error("Unexpected error fetching managers by campus:", error);
      return { data: null, error: error instanceof Error ? error : new Error(String(error)) };
    }
  };

  const fetchUsersByCampus = async (campusIds?: string[]) => {
    try {
      let query = supabase
        .from('profiles')
        .select('*, campus(id, name)')
        .order('full_name');

      if (campusIds && campusIds.length > 0) {
        query = query.in('campus_id', campusIds);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching users by campus:", error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error("Unexpected error fetching users by campus:", error);
      return { data: null, error: error instanceof Error ? error : new Error(String(error)) };
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

      if (error) {
        console.error("Error updating manager hours:", error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error("Unexpected error updating manager hours:", error);
      return { data: null, error: error instanceof Error ? error : new Error(String(error)) };
    }
  };

  const getUserManagedCampus = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('campus_id, managed_campus_ids')
        .eq('id', userId)
        .single();

      if (error) {
        console.error("Error fetching user managed campus:", error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error("Unexpected error fetching user managed campus:", error);
      return { data: null, error: error instanceof Error ? error : new Error(String(error)) };
    }
  };

  const updateUserCampusAccess = async (userId: string, campusIds: string[]) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ managed_campus_ids: campusIds.length > 0 ? campusIds : null })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error("Error updating user campus access:", error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error("Unexpected error updating user campus access:", error);
      return { data: null, error: error instanceof Error ? error : new Error(String(error)) };
    }
  };

  // File upload functions
  const uploadFile = async (file: File, bucket: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error("Error uploading file:", error);
        return { data: null, error };
      }

      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      return { data: { ...data, publicUrl: urlData.publicUrl }, error: null };
    } catch (error) {
      console.error("Unexpected error uploading file:", error);
      return { data: null, error: error instanceof Error ? error : new Error(String(error)) };
    }
  };

  const deleteProductProgressReport = async (reportId: string) => {
    try {
      const { error } = await supabase
        .from('product_progress_reports')
        .delete()
        .eq('id', reportId);

      if (error) {
        console.error("Error deleting product progress report:", error);
        return { error };
      }

      return { error: null };
    } catch (error) {
      console.error("Unexpected error deleting product progress report:", error);
      return { error: error instanceof Error ? error : new Error(String(error)) };
    }
  };

  // Document template functions
  const fetchDocumentTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('document_templates')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error("Error fetching document templates:", error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error("Unexpected error fetching document templates:", error);
      return { data: null, error: error instanceof Error ? error : new Error(String(error)) };
    }
  };

  const createDocumentTemplate = async (templateData: Omit<DocumentTemplate, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('document_templates')
        .insert(templateData)
        .select()
        .single();

      if (error) {
        console.error("Error creating document template:", error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error("Unexpected error creating document template:", error);
      return { data: null, error: error instanceof Error ? error : new Error(String(error)) };
    }
  };

  const updateDocumentTemplate = async (templateId: string, updates: Partial<DocumentTemplate>) => {
    try {
      const { data, error } = await supabase
        .from('document_templates')
        .update(updates)
        .eq('id', templateId)
        .select()
        .single();

      if (error) {
        console.error("Error updating document template:", error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error("Unexpected error updating document template:", error);
      return { data: null, error: error instanceof Error ? error : new Error(String(error)) };
    }
  };

  const deleteDocumentTemplate = async (templateId: string) => {
    try {
      const { error } = await supabase
        .from('document_templates')
        .delete()
        .eq('id', templateId);

      if (error) {
        console.error("Error deleting document template:", error);
        return { error };
      }

      return { error: null };
    } catch (error) {
      console.error("Unexpected error deleting document template:", error);
      return { error: error instanceof Error ? error : new Error(String(error)) };
    }
  };

  // Campus management functions
  const fetchCampus = async () => {
    try {
      const { data, error } = await supabase
        .from('campus')
        .select('*')
        .order('name');

      if (error) {
        console.error("Error fetching campus:", error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error("Unexpected error fetching campus:", error);
      return { data: null, error: error instanceof Error ? error : new Error(String(error)) };
    }
  };

  const createCampus = async (campusData: { name: string; address: string }) => {
    try {
      const { data, error } = await supabase
        .from('campus')
        .insert(campusData)
        .select()
        .single();

      if (error) {
        console.error("Error creating campus:", error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error("Unexpected error creating campus:", error);
      return { data: null, error: error instanceof Error ? error : new Error(String(error)) };
    }
  };

  const updateCampus = async (campusId: string, updates: { name?: string; address?: string }) => {
    try {
      const { data, error } = await supabase
        .from('campus')
        .update(updates)
        .eq('id', campusId)
        .select()
        .single();

      if (error) {
        console.error("Error updating campus:", error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error("Unexpected error updating campus:", error);
      return { data: null, error: error instanceof Error ? error : new Error(String(error)) };
    }
  };

  const deleteCampus = async (campusId: string) => {
    try {
      const { error } = await supabase
        .from('campus')
        .delete()
        .eq('id', campusId);

      if (error) {
        console.error("Error deleting campus:", error);
        return { error };
      }

      return { error: null };
    } catch (error) {
      console.error("Unexpected error deleting campus:", error);
      return { error: error instanceof Error ? error : new Error(String(error)) };
    }
  };

  const fetchFaculties = async () => {
    try {
      const { data, error } = await supabase
        .from('faculties')
        .select('*, campus(id, name)')
        .order('name');

      if (error) {
        console.error("Error fetching faculties:", error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error("Unexpected error fetching faculties:", error);
      return { data: null, error: error instanceof Error ? error : new Error(String(error)) };
    }
  };

  const fetchFacultiesByCampus = async (campusIds?: string | string[]) => {
    try {
      let query = supabase
        .from('faculties')
        .select('*, campus(id, name)')
        .order('name');

      if (campusIds) {
        const ids = Array.isArray(campusIds) ? campusIds : [campusIds];
        query = query.in('campus_id', ids);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching faculties by campus:", error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error("Unexpected error fetching faculties by campus:", error);
      return { data: null, error: error instanceof Error ? error : new Error(String(error)) };
    }
  };

  const createFaculty = async (facultyData: { name: string; dean_name: string; campus_id: string }) => {
    try {
      const { data, error } = await supabase
        .from('faculties')
        .insert(facultyData)
        .select()
        .single();

      if (error) {
        console.error("Error creating faculty:", error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error("Unexpected error creating faculty:", error);
      return { data: null, error: error instanceof Error ? error : new Error(String(error)) };
    }
  };

  const updateFaculty = async (facultyId: string, updates: { name?: string; dean_name?: string; campus_id?: string }) => {
    try {
      const { data, error } = await supabase
        .from('faculties')
        .update(updates)
        .eq('id', facultyId)
        .select()
        .single();

      if (error) {
        console.error("Error updating faculty:", error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error("Unexpected error updating faculty:", error);
      return { data: null, error: error instanceof Error ? error : new Error(String(error)) };
    }
  };

  const deleteFaculty = async (facultyId: string) => {
    try {
      const { error } = await supabase
        .from('faculties')
        .delete()
        .eq('id', facultyId);

      if (error) {
        console.error("Error deleting faculty:", error);
        return { error };
      }

      return { error: null };
    } catch (error) {
      console.error("Unexpected error deleting faculty:", error);
      return { error: error instanceof Error ? error : new Error(String(error)) };
    }
  };

  const fetchAcademicPrograms = async () => {
    try {
      const { data, error } = await supabase
        .from('academic_programs')
        .select('*, faculties(id, name, campus(id, name))')
        .order('name');

      if (error) {
        console.error("Error fetching academic programs:", error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error("Unexpected error fetching academic programs:", error);
      return { data: null, error: error instanceof Error ? error : new Error(String(error)) };
    }
  };

  const fetchAcademicProgramsByCampus = async (campusIds?: string | string[]) => {
    try {
      let query = supabase
        .from('academic_programs')
        .select('*, faculties(id, name), campus(id, name)')
        .order('name');

      if (campusIds) {
        const ids = Array.isArray(campusIds) ? campusIds : [campusIds];
        query = query.in('campus_id', ids);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching academic programs by campus:", error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error("Unexpected error fetching academic programs by campus:", error);
      return { data: null, error: error instanceof Error ? error : new Error(String(error)) };
    }
  };

  const createAcademicProgram = async (programData: { 
    name: string; 
    director_name: string; 
    director_email: string; 
    faculty_id: string; 
    campus_id: string; 
    manager_id?: string 
  }) => {
    try {
      const { data, error } = await supabase
        .from('academic_programs')
        .insert(programData)
        .select()
        .single();

      if (error) {
        console.error("Error creating academic program:", error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error("Unexpected error creating academic program:", error);
      return { data: null, error: error instanceof Error ? error : new Error(String(error)) };
    }
  };

  const updateAcademicProgram = async (programId: string, updates: { 
    name?: string; 
    director_name?: string; 
    director_email?: string; 
    faculty_id?: string; 
    campus_id?: string; 
    manager_id?: string 
  }) => {
    try {
      const { data, error } = await supabase
        .from('academic_programs')
        .update(updates)
        .eq('id', programId)
        .select()
        .single();

      if (error) {
        console.error("Error updating academic program:", error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error("Unexpected error updating academic program:", error);
      return { data: null, error: error instanceof Error ? error : new Error(String(error)) };
    }
  };

  const deleteAcademicProgram = async (programId: string) => {
    try {
      const { error } = await supabase
        .from('academic_programs')
        .delete()
        .eq('id', programId);

      if (error) {
        console.error("Error deleting academic program:", error);
        return { error };
      }

      return { error: null };
    } catch (error) {
      console.error("Unexpected error deleting academic program:", error);
      return { error: error instanceof Error ? error : new Error(String(error)) };
    }
  };

  // Template-based reports functions
  const fetchReportTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('report_templates')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching report templates:', error);
      return { data: null, error };
    }
  };

  const createReportTemplate = async (templateData: Omit<ReportTemplate, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('report_templates')
        .insert(templateData)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error creating report template:', error);
      return { data: null, error };
    }
  };

  const updateReportTemplate = async (templateId: string, updates: Partial<ReportTemplate>) => {
    try {
      const { data, error } = await supabase
        .from('report_templates')
        .update(updates)
        .eq('id', templateId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating report template:', error);
      return { data: null, error };
    }
  };

  const deleteReportTemplate = async (templateId: string) => {
    try {
      const { error } = await supabase
        .from('report_templates')
        .delete()
        .eq('id', templateId);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error deleting report template:', error);
      return { error };
    }
  };

  const fetchReportPeriods = async () => {
    try {
      const { data, error } = await supabase
        .from('report_periods')
        .select('*')
        .eq('is_active', true)
        .order('start_date', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching report periods:', error);
      return { data: null, error };
    }
  };

  const createReportPeriod = async (periodData: any) => {
    try {
      const { data, error } = await supabase
        .from('report_periods')
        .insert(periodData)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error creating report period:', error);
      return { data: null, error };
    }
  };

  const updateReportPeriod = async (periodId: string, updates: any) => {
    try {
      const { data, error } = await supabase
        .from('report_periods')
        .update(updates)
        .eq('id', periodId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating report period:', error);
      return { data: null, error };
    }
  };

  const deleteReportPeriod = async (periodId: string) => {
    try {
      const { error } = await supabase
        .from('report_periods')
        .delete()
        .eq('id', periodId);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error deleting report period:', error);
      return { error };
    }
  };

  const fetchReportSystemConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('report_system_config')
        .select('*')
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching report system config:', error);
      return { data: null, error };
    }
  };

  const updateReportSystemConfig = async (updates: any) => {
    try {
      const { data, error } = await supabase
        .from('report_system_config')
        .update(updates)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating report system config:', error);
      return { data: null, error };
    }
  };

  const fetchTemplateBasedReports = async (managerId?: string) => {
    try {
      let query = supabase
        .from('template_based_reports_with_details')
        .select('*')
        .order('created_at', { ascending: false });

      if (managerId) {
        query = query.eq('manager_id', managerId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching template-based reports:', error);
      return { data: null, error };
    }
  };

  const createTemplateBasedReport = async (reportData: {
    manager_id: string;
    report_template_id: string;
    report_period_id: string;
    title: string;
    description?: string;
  }) => {
    try {
      const { data, error } = await supabase
        .from('template_based_reports')
        .insert(reportData)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error creating template-based report:', error);
      return { data: null, error };
    }
  };

  const updateTemplateBasedReport = async (reportId: string, updates: any) => {
    try {
      const { data, error } = await supabase
        .from('template_based_reports')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', reportId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating template-based report:', error);
      return { data: null, error };
    }
  };

  const deleteTemplateBasedReport = async (reportId: string) => {
    try {
      const { error } = await supabase
        .from('template_based_reports')
        .delete()
        .eq('id', reportId);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error deleting template-based report:', error);
      return { error };
    }
  };

  const fetchTemplateReportResponses = async (templateReportId: string) => {
    try {
      const { data, error } = await supabase
        .from('template_report_responses')
        .select(`
          *,
          strategic_axes(id, code, name),
          actions(id, code, name),
          products(id, name)
        `)
        .eq('template_report_id', templateReportId)
        .order('created_at');

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching template report responses:', error);
      return { data: null, error };
    }
  };

  const upsertTemplateReportResponse = async (responseData: any) => {
    try {
      const { data, error } = await supabase
        .from('template_report_responses')
        .upsert(responseData, {
          onConflict: 'template_report_id,strategic_axis_id,action_id,product_id'
        })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error upserting template report response:', error);
      return { data: null, error };
    }
  };

  // Manager report version functions
  const createManagerReportVersion = async (versionData: Omit<ManagerReportVersion, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('manager_report_versions')
        .insert(versionData)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error creating manager report version:', error);
      return { data: null, error };
    }
  };

  const updateManagerReportVersion = async (versionId: string, updates: Partial<ManagerReportVersion>) => {
    try {
      const { data, error } = await supabase
        .from('manager_report_versions')
        .update(updates)
        .eq('id', versionId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
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

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error getting next version number:', error);
      return { data: null, error };
    }
  };

  // Strategic configuration functions
  const createStrategicAxis = async (axisData: { code: string; name: string; created_by: string }) => {
    try {
      const { data, error } = await supabase
        .from('strategic_axes')
        .insert(axisData)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error creating strategic axis:', error);
      return { data: null, error };
    }
  };

  const createAction = async (actionData: { code: string; name: string; strategic_axis_id: string; created_by: string }) => {
    try {
      const { data, error } = await supabase
        .from('actions')
        .insert(actionData)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error creating action:', error);
      return { data: null, error };
    }
  };

  const createProduct = async (productData: { name: string; action_id: string; created_by: string }) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert(productData)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error creating product:', error);
      return { data: null, error };
    }
  };

  // Work plan functions
  const fetchPendingWorkPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('work_plans_with_manager')
        .select('*')
        .in('status', ['pending', 'submitted'])
        .order('submitted_date', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching pending work plans:', error);
      return { data: null, error };
    }
  };

  const approveWorkPlan = async (workPlanId: string, status: 'approved' | 'rejected', comments?: string) => {
    try {
      const updateData: any = {
        status,
        approval_comments: comments,
        approved_date: status === 'approved' ? new Date().toISOString() : null
      };

      const { data, error } = await supabase
        .from('work_plans')
        .update(updateData)
        .eq('id', workPlanId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error approving work plan:', error);
      return { data: null, error };
    }
  };

  const createWorkPlan = async (workPlanData: any) => {
    try {
      const { data, error } = await supabase
        .from('work_plans')
        .insert(workPlanData)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error creating work plan:', error);
      return { data: null, error };
    }
  };

  const updateWorkPlan = async (workPlanId: string, updates: any) => {
    try {
      const { data, error } = await supabase
        .from('work_plans')
        .update(updates)
        .eq('id', workPlanId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating work plan:', error);
      return { data: null, error };
    }
  };

  const upsertWorkPlanAssignment = async (assignmentData: any) => {
    try {
      const { data, error } = await supabase
        .from('work_plan_assignments')
        .upsert(assignmentData, {
          onConflict: 'work_plan_id,product_id'
        })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
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
          manager:profiles(id, full_name, email),
          program:academic_programs(
            id, 
            name, 
            faculty:faculties(id, name),
            campus(id, name)
          )
        `)
        .eq('id', workPlanId)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching work plan details:', error);
      return { data: null, error };
    }
  };

  return {
    fetchStrategicAxes,
    fetchActions,
    fetchProducts,
    fetchWorkPlans,
    fetchWorkPlanAssignments,
    fetchManagerReports,
    fetchManagerReportsByManager,
    createManagerReport,
    updateManagerReport,
    fetchProductProgressReports,
    upsertProductProgressReport,
    uploadEvidenceFile,
    deleteEvidenceFile,
    deleteProductProgressReport,
    uploadFile,
    // User management
    fetchManagers,
    fetchManagersByCampus,
    fetchUsersByCampus,
    updateManagerHours,
    getUserManagedCampus,
    updateUserCampusAccess,
    // Document templates
    fetchDocumentTemplates,
    createDocumentTemplate,
    updateDocumentTemplate,
    deleteDocumentTemplate,
    // Campus management
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
    // Template-based reports
    fetchReportTemplates,
    createReportTemplate,
    updateReportTemplate,
    deleteReportTemplate,
    fetchReportPeriods,
    createReportPeriod,
    updateReportPeriod,
    deleteReportPeriod,
    fetchReportSystemConfig,
    updateReportSystemConfig,
    fetchTemplateBasedReports,
    createTemplateBasedReport,
    updateTemplateBasedReport,
    deleteTemplateBasedReport,
    fetchTemplateReportResponses,
    upsertTemplateReportResponse,
    // Manager report versions
    createManagerReportVersion,
    updateManagerReportVersion,
    getNextVersionNumber,
    // Strategic configuration
    createStrategicAxis,
    createAction,
    createProduct,
    // Work plan functions
    fetchPendingWorkPlans,
    approveWorkPlan,
    createWorkPlan,
    updateWorkPlan,
    upsertWorkPlanAssignment,
    fetchWorkPlanDetails,
  };
}
