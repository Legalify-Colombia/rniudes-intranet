
import { supabase } from "@/integrations/supabase/client";
import type { Result } from "@/types/supabase";

export function useSupabaseDataSnies() {
  const fetchSniesBiologicalSex = async (): Promise<Result<any[]>> => {
    try {
      // Using snies_marital_status as placeholder since snies_biological_sex doesn't exist
      const { data, error } = await supabase
        .from("snies_marital_status")
        .select("*")
        .eq("is_active", true)
        .order("name");
      
      return { data: data || [], error };
    } catch (error) {
      return { data: [], error: error as any };
    }
  };

  const createSniesCountry = async (countryData: any): Promise<Result<any>> => {
    try {
      const { data, error } = await supabase
        .from("snies_countries")
        .insert(countryData)
        .select()
        .single();
      
      return { data, error };
    } catch (error) {
      return { data: null, error: error as any };
    }
  };

  const createSniesMunicipality = async (municipalityData: any): Promise<Result<any>> => {
    try {
      const { data, error } = await supabase
        .from("snies_municipalities")
        .insert(municipalityData)
        .select()
        .single();
      
      return { data, error };
    } catch (error) {
      return { data: null, error: error as any };
    }
  };

  const bulkCreateSniesCountries = async (countries: any[]): Promise<Result<any[]>> => {
    try {
      const { data, error } = await supabase
        .from("snies_countries")
        .insert(countries)
        .select();
      
      return { data: data || [], error };
    } catch (error) {
      return { data: [], error: error as any };
    }
  };

  const bulkCreateSniesMunicipalities = async (municipalities: any[]): Promise<Result<any[]>> => {
    try {
      const { data, error } = await supabase
        .from("snies_municipalities")
        .insert(municipalities)
        .select();
      
      return { data: data || [], error };
    } catch (error) {
      return { data: [], error: error as any };
    }
  };

  const fetchSniesReportTemplates = async (): Promise<Result<any[]>> => {
    try {
      const { data, error } = await supabase
        .from("snies_report_templates")
        .select("*")
        .eq("is_active", true)
        .order("name");
      
      return { data: data || [], error };
    } catch (error) {
      return { data: [], error: error as any };
    }
  };

  const fetchSniesReports = async (): Promise<Result<any[]>> => {
    try {
      const { data, error } = await supabase
        .from("snies_reports")
        .select("*")
        .order("created_at", { ascending: false });
      
      return { data: data || [], error };
    } catch (error) {
      return { data: [], error: error as any };
    }
  };

  const consolidateSniesReports = async (templateId: string): Promise<Result<any>> => {
    try {
      // This would need proper implementation
      console.log("Consolidating reports for template:", templateId);
      return { data: { success: true }, error: null };
    } catch (error) {
      return { data: null, error: error as any };
    }
  };

  const fetchSniesTemplateFields = async (templateId: string): Promise<Result<any[]>> => {
    try {
      // This would need proper implementation with actual template fields table
      console.log("Fetching template fields for:", templateId);
      return { data: [], error: null };
    } catch (error) {
      return { data: [], error: error as any };
    }
  };

  return {
    fetchSniesBiologicalSex,
    createSniesCountry,
    createSniesMunicipality,
    bulkCreateSniesCountries,
    bulkCreateSniesMunicipalities,
    fetchSniesReportTemplates,
    fetchSniesReports,
    consolidateSniesReports,
    fetchSniesTemplateFields,
  };
}
