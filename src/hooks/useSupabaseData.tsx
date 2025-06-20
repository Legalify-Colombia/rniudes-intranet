import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { PostgrestError } from "@supabase/supabase-js";
import { v4 as uuidv4 } from 'uuid';

import { Action, StrategicAxis } from "@/types";
import { supabase } from "@/integrations/supabase/client";

interface Result<T> {
  data: T | null;
  error: PostgrestError | Error | null;
}

export function useSupabaseData() {
  const supabaseClient = useSupabaseClient();

  const fetchStrategicAxes = async (): Promise<Result<StrategicAxis[]>> => {
    try {
      const { data, error } = await supabaseClient
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
      const { data, error } = await supabaseClient
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
      const { data, error } = await supabaseClient
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
      const { data, error } = await supabaseClient
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
      const { data, error } = await supabaseClient
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
      const { data, error } = await supabaseClient
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
      const { data, error } = await supabaseClient
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
      const { data, error } = await supabaseClient
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
      const { data, error } = await supabaseClient
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
      const { data, error } = await supabaseClient
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
      const { data, error } = await supabaseClient
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
      const { data, error } = await supabaseClient
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
      const { error } = await supabaseClient
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

  // Nuevas funciones para informes basados en plantillas
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
