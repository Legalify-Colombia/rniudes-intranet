

import { supabase } from "@/integrations/supabase/client";
import type { Result } from "@/types/supabase";

export function useReportConfiguration() {
  const fetchReportSystemConfig = async (): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("report_system_config")
      .select("*")
      .single();
    return { data, error };
  };

  const updateReportSystemConfig = async (updates: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("report_system_config")
      .update(updates)
      .eq("id", updates.id)
      .select()
      .single();
    return { data, error };
  };

  const fetchReportTemplates = async (): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from("report_templates")
      .select("*")
      .eq("is_active", true)
      .order("name");
    return { data, error };
  };

  const createReportTemplate = async (template: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("report_templates")
      .insert(template)
      .select()
      .single();
    return { data, error };
  };

  const updateReportTemplate = async (id: string, updates: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("report_templates")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    return { data, error };
  };

  const deleteReportTemplate = async (id: string): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("report_templates")
      .delete()
      .eq("id", id);
    return { data, error };
  };

  const createManagerReportVersion = async (version: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("manager_report_versions")
      .insert(version)
      .select()
      .single();
    return { data, error };
  };

  const updateManagerReportVersion = async (id: string, updates: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("manager_report_versions")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    return { data, error };
  };

  const getNextVersionNumber = async (reportId: string, templateId: string): Promise<Result<number>> => {
    const { data, error } = await supabase.rpc('get_next_version_number', {
      p_manager_report_id: reportId,
      p_template_id: templateId
    });
    return { data, error };
  };

  return {
    fetchReportSystemConfig,
    updateReportSystemConfig,
    fetchReportTemplates,
    createReportTemplate,
    updateReportTemplate,
    deleteReportTemplate,
    createManagerReportVersion,
    updateManagerReportVersion,
    getNextVersionNumber,
  };
}

