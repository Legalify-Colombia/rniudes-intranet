
import { supabase } from "@/integrations/supabase/client";
import type { Result } from "@/types/supabase";

export interface DocumentTemplate {
  id: string;
  name: string;
  description?: string;
  template_content: string;
  template_type: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
  file_url?: string;
  file_name?: string;
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
  max_versions: number;
  is_active: boolean;
  sharepoint_base_url?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ManagerReportVersion {
  id: string;
  manager_report_id: string;
  template_id: string;
  version_number: number;
  progress_percentage: number;
  observations?: string;
  evidence_links?: string[];
  sharepoint_folder_url?: string;
  submitted_at?: string;
  created_at: string;
  updated_at: string;
}

export function useReportSystem() {
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

  const createManagerReportVersion = async (version: Omit<ManagerReportVersion, 'id' | 'created_at' | 'updated_at'>): Promise<Result<ManagerReportVersion>> => {
    const { data, error } = await supabase
      .from("manager_report_versions")
      .insert(version)
      .select()
      .single();
    return { data, error };
  };

  const fetchManagerReportVersions = async (reportId: string): Promise<Result<ManagerReportVersion[]>> => {
    const { data, error } = await supabase
      .from("manager_report_versions")
      .select("*")
      .eq("manager_report_id", reportId)
      .order("version_number", { ascending: false });
    return { data, error };
  };

  const updateManagerReportVersion = async (id: string, updates: Partial<ManagerReportVersion>): Promise<Result<ManagerReportVersion>> => {
    const { data, error } = await supabase
      .from("manager_report_versions")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    return { data, error };
  };

  return {
    fetchReportSystemConfig,
    updateReportSystemConfig,
    createManagerReportVersion,
    fetchManagerReportVersions,
    updateManagerReportVersion
  };
}
