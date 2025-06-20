

import { supabase } from "@/integrations/supabase/client";
import type { Result } from "@/types/supabase";

export function useSniesReports() {
  const fetchSniesReports = async (): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from("snies_reports")
      .select("*")
      .order("created_at", { ascending: false });
    return { data, error };
  };

  const fetchSniesReportTemplates = async (): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from("snies_report_templates")
      .select("*")
      .eq("is_active", true)
      .order("name");
    return { data, error };
  };

  const fetchSniesTemplateFields = async (templateId: string): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from("snies_template_fields")
      .select("*")
      .eq("template_id", templateId)
      .order("field_order");
    return { data, error };
  };

  const createSniesReport = async (report: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("snies_reports")
      .insert(report)
      .select()
      .single();
    return { data, error };
  };

  const updateSniesReport = async (id: string, updates: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("snies_reports")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    return { data, error };
  };

  const createSniesReportTemplate = async (template: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("snies_report_templates")
      .insert(template)
      .select()
      .single();
    return { data, error };
  };

  const updateSniesReportTemplate = async (id: string, updates: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("snies_report_templates")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    return { data, error };
  };

  const deleteSniesReportTemplate = async (id: string): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("snies_report_templates")
      .delete()
      .eq("id", id);
    return { data, error };
  };

  const createSniesTemplateField = async (field: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("snies_template_fields")
      .insert(field)
      .select()
      .single();
    return { data, error };
  };

  const updateSniesTemplateField = async (id: string, updates: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("snies_template_fields")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    return { data, error };
  };

  const deleteSniesTemplateField = async (id: string): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("snies_template_fields")
      .delete()
      .eq("id", id);
    return { data, error };
  };

  return {
    fetchSniesReports,
    fetchSniesReportTemplates,
    fetchSniesTemplateFields,
    createSniesReport,
    updateSniesReport,
    createSniesReportTemplate,
    updateSniesReportTemplate,
    deleteSniesReportTemplate,
    createSniesTemplateField,
    updateSniesTemplateField,
    deleteSniesTemplateField,
  };
}

