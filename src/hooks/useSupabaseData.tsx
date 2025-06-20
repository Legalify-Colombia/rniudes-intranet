

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
