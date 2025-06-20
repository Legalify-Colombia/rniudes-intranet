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

      // Validate required fields
      if (!report.title || !report.template_id) {
        return { data: null, error: new Error('Title and template are required') };
      }

      const reportData = {
        title: report.title.trim(),
        template_id: report.template_id,
        manager_id: userData.user.id,
        status: 'draft'
      };

      console.log('Creating SNIES report with data:', reportData);

      // First, create the basic report without the join
      const { data: createdReport, error: createError } = await supabase
        .from("snies_reports")
        .insert(reportData)
        .select()
        .single();

      if (createError) {
        console.error('Error creating SNIES report:', createError);
        return { data: null, error: createError };
      }

      // Then fetch the report with the related data
      const { data: fullReport, error: fetchError } = await supabase
        .from("snies_reports")
        .select(`
          *,
          template:snies_report_templates(name),
          manager:profiles(full_name)
        `)
        .eq("id", createdReport.id)
        .single();

      if (fetchError) {
        console.error('Error fetching created report:', fetchError);
        // Return the basic report if we can't fetch with joins
        return { data: createdReport, error: null };
      }

      console.log('SNIES report created successfully:', fullReport);
      return { data: fullReport, error: null };
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
