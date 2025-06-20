import { PostgrestError } from "@supabase/supabase-js";
import { v4 as uuidv4 } from 'uuid';

import { Action, StrategicAxis } from "@/types";
import { supabase } from "@/integrations/supabase/client";

interface Result<T> {
  data: T | null;
  error: PostgrestError | Error | null;
}

// Types for campus management
export interface Campus {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Faculty {
  id: string;
  name: string;
  description?: string;
  campus_id: string;
  created_at: string;
  updated_at: string;
}

export interface AcademicProgram {
  id: string;
  name: string;
  description?: string;
  faculty_id: string;
  campus_id: string;
  created_at: string;
  updated_at: string;
}

// Document template interface
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
        .select('*, strategic_axis(id, code, name)')
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
        .select('*, action(id, code, name, strategic_axis(id, code, name))')
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
        .select('*, product(id, name, action(id, strategic_axis(id)))')
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

  const updateManagerHours = async (managerId: string, hours: { weekly_hours: number; number_of_weeks: number; total_hours: number }) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(hours)
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

  const createCampus = async (campusData: Omit<Campus, 'id' | 'created_at' | 'updated_at'>) => {
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

  const updateCampus = async (campusId: string, updates: Partial<Campus>) => {
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

  const fetchFacultiesByCampus = async (campusId: string) => {
    try {
      const { data, error } = await supabase
        .from('faculties')
        .select('*')
        .eq('campus_id', campusId)
        .order('name');

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

  const createFaculty = async (facultyData: Omit<Faculty, 'id' | 'created_at' | 'updated_at'>) => {
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

  const updateFaculty = async (facultyId: string, updates: Partial<Faculty>) => {
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
        .select('*, faculty(id, name, campus(id, name))')
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

  const fetchAcademicProgramsByCampus = async (campusId: string) => {
    try {
      const { data, error } = await supabase
        .from('academic_programs')
        .select('*, faculty(id, name)')
        .eq('campus_id', campusId)
        .order('name');

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

  const createAcademicProgram = async (programData: Omit<AcademicProgram, 'id' | 'created_at' | 'updated_at'>) => {
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

  const updateAcademicProgram = async (programId: string, updates: Partial<AcademicProgram>) => {
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
          strategic_axis:strategic_axes(id, code, name),
          action:actions(id, code, name),
          product:products(id, name)
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
    fetchReportPeriods,
    fetchTemplateBasedReports,
    createTemplateBasedReport,
    updateTemplateBasedReport,
    deleteTemplateBasedReport,
    fetchTemplateReportResponses,
    upsertTemplateReportResponse,
  };
}
