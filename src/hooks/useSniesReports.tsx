import { supabase } from "@/integrations/supabase/client";
import type { Result } from "@/types/supabase";

export function useSniesReports() {
  const fetchSniesReports = async (): Promise<Result<any[]>> => {
    try {
      const { data, error } = await supabase
        .from("snies_reports")
        .select(`
          *,
          template:snies_report_templates(name),
          manager:profiles(full_name)
        `)
        .order("created_at", { ascending: false });
      
      if (error) {
        console.error('Error fetching SNIES reports:', error);
        return { data: null, error };
      }
      
      return { data: data || [], error: null };
    } catch (error) {
      console.error('Unexpected error fetching SNIES reports:', error);
      return { data: null, error };
    }
  };

  const fetchSniesReportTemplates = async (): Promise<Result<any[]>> => {
    try {
      const { data, error } = await supabase
        .from("snies_report_templates")
        .select("*")
        .eq("is_active", true)
        .order("name");
      
      if (error) {
        console.error('Error fetching SNIES templates:', error);
        return { data: null, error };
      }
      
      return { data: data || [], error: null };
    } catch (error) {
      console.error('Unexpected error fetching SNIES templates:', error);
      return { data: null, error };
    }
  };

  const fetchSniesTemplateFields = async (templateId: string): Promise<Result<any[]>> => {
    try {
      const { data, error } = await supabase
        .from("snies_template_fields")
        .select("*")
        .eq("template_id", templateId)
        .order("field_order");
      
      if (error) {
        console.error('Error fetching template fields:', error);
        return { data: null, error };
      }
      
      return { data: data || [], error: null };
    } catch (error) {
      console.error('Unexpected error fetching template fields:', error);
      return { data: null, error };
    }
  };

  const createSniesReport = async (report: any): Promise<Result<any>> => {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError || !userData.user) {
        console.error('Error getting user:', userError);
        return { data: null, error: userError || new Error('No user found') };
      }

      const reportData = {
        title: report.title,
        template_id: report.template_id,
        manager_id: userData.user.id,
        status: 'draft'
      };

      console.log('Creating SNIES report with data:', reportData);

      const { data, error } = await supabase
        .from("snies_reports")
        .insert(reportData)
        .select(`
          *,
          template:snies_report_templates(name),
          manager:profiles(full_name)
        `)
        .single();

      if (error) {
        console.error('Error creating SNIES report:', error);
        return { data: null, error };
      }

      console.log('SNIES report created successfully:', data);
      return { data, error: null };
    } catch (error) {
      console.error('Unexpected error creating SNIES report:', error);
      return { data: null, error };
    }
  };

  const updateSniesReport = async (id: string, updates: any): Promise<Result<any>> => {
    try {
      const { data, error } = await supabase
        .from("snies_reports")
        .update(updates)
        .eq("id", id)
        .select(`
          *,
          template:snies_report_templates(name),
          manager:profiles(full_name)
        `)
        .single();
      
      if (error) {
        console.error('Error updating SNIES report:', error);
        return { data: null, error };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Unexpected error updating SNIES report:', error);
      return { data: null, error };
    }
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
