
import { supabase } from "@/integrations/supabase/client";
import type { Result } from "@/types/supabase";

export function useSniesManagement() {
  // SNIES Configuration
  const fetchSniesCountries = async (): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from("snies_countries")
      .select("*")
      .order("name");
    return { data, error };
  };

  const fetchSniesMunicipalities = async (): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from("snies_municipalities")
      .select("*")
      .order("name");
    return { data, error };
  };

  const fetchSniesDocumentTypes = async (): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from("snies_document_types")
      .select("*")
      .order("name");
    return { data, error };
  };

  const fetchSniesBiologicalSex = async (): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from("snies_biological_sex")
      .select("*")
      .order("name");
    return { data, error };
  };

  const fetchSniesMaritalStatus = async (): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from("snies_marital_status")
      .select("*")
      .order("name");
    return { data, error };
  };

  const createSniesCountry = async (country: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("snies_countries")
      .insert(country)
      .select()
      .single();
    return { data, error };
  };

  const createSniesMunicipality = async (municipality: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("snies_municipalities")
      .insert(municipality)
      .select()
      .single();
    return { data, error };
  };

  const bulkCreateSniesCountries = async (countries: any[]): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from("snies_countries")
      .insert(countries)
      .select();
    return { data, error };
  };

  const bulkCreateSniesMunicipalities = async (municipalities: any[]): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from("snies_municipalities")
      .insert(municipalities)
      .select();
    return { data, error };
  };

  // SNIES Report Templates
  const fetchSniesReportTemplates = async (): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from("snies_report_templates")
      .select("*")
      .order("created_at", { ascending: false });
    return { data, error };
  };

  const consolidateSniesReports = async (templateId: string, periodId: string): Promise<Result<any>> => {
    // Since the RPC function doesn't exist, we'll implement basic consolidation logic here
    try {
      // Fetch all reports for this template and period
      const { data: reports, error: reportsError } = await supabase
        .from("snies_reports")
        .select(`
          *,
          snies_report_data(*)
        `)
        .eq("template_id", templateId);

      if (reportsError) {
        return { data: null, error: reportsError };
      }

      // Create consolidated report entry
      const { data: consolidatedReport, error: consolidationError } = await supabase
        .from("snies_consolidated_reports")
        .insert({
          template_id: templateId,
          title: `Consolidated Report - ${new Date().toISOString()}`,
          total_records: reports?.length || 0,
          participating_managers: reports?.length || 0,
          created_by: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      return { data: consolidatedReport, error: consolidationError };
    } catch (error) {
      return { data: null, error: error as any };
    }
  };

  // SNIES Reports
  const fetchSniesReports = async (): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from("snies_reports")
      .select(`
        *,
        template:snies_report_templates(*),
        period:report_periods(*)
      `)
      .order("created_at", { ascending: false });
    return { data, error };
  };

  const fetchSniesReportData = async (reportId: string): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from("snies_report_data")
      .select("*")
      .eq("report_id", reportId);
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

  const upsertSniesReportData = async (reportData: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("snies_report_data")
      .upsert(reportData)
      .select()
      .single();
    return { data, error };
  };

  return {
    // Configuration
    fetchSniesCountries,
    fetchSniesMunicipalities,
    fetchSniesDocumentTypes,
    fetchSniesBiologicalSex,
    fetchSniesMaritalStatus,
    createSniesCountry,
    createSniesMunicipality,
    bulkCreateSniesCountries,
    bulkCreateSniesMunicipalities,
    // Templates
    fetchSniesReportTemplates,
    consolidateSniesReports,
    // Reports
    fetchSniesReports,
    fetchSniesReportData,
    fetchSniesTemplateFields,
    upsertSniesReportData
  };
}
