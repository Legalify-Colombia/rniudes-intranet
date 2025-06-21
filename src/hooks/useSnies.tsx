
import { supabase } from "@/integrations/supabase/client";
import type { Result } from "@/types/supabase";

export function useSnies() {
  const fetchSniesCountries = async (): Promise<Result<any[]>> => {
    const { data, error } = await supabase.from("snies_countries").select("*").order("name");
    return { data, error };
  };

  const fetchSniesMunicipalities = async (): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from("snies_municipalities")
      .select(`
        *,
        department:snies_departments(*)
      `)
      .order("name");
    return { data, error };
  };

  const fetchSniesDocumentTypes = async (): Promise<Result<any[]>> => {
    const { data, error } = await supabase.from("snies_document_types").select("*").order("name");
    return { data, error };
  };

  const fetchSniesBiologicalSex = async (): Promise<Result<any[]>> => {
    const { data, error } = await supabase.from("snies_biological_sex").select("*").order("name");
    return { data, error };
  };

  const fetchSniesMaritalStatus = async (): Promise<Result<any[]>> => {
    const { data, error } = await supabase.from("snies_marital_status").select("*").order("name");
    return { data, error };
  };

  const createSniesCountry = async (country: any): Promise<Result<any>> => {
    const { data, error } = await supabase.from("snies_countries").insert(country).select().single();
    return { data, error };
  };

  const createSniesMunicipality = async (municipality: any): Promise<Result<any>> => {
    const { data, error } = await supabase.from("snies_municipalities").insert(municipality).select().single();
    return { data, error };
  };

  const bulkCreateSniesCountries = async (countries: any[]): Promise<Result<any>> => {
    const { data, error } = await supabase.from("snies_countries").insert(countries).select();
    return { data, error };
  };

  const bulkCreateSniesMunicipalities = async (municipalities: any[]): Promise<Result<any>> => {
    const { data, error } = await supabase.from("snies_municipalities").insert(municipalities).select();
    return { data, error };
  };

  const fetchSniesReportTemplates = async (): Promise<Result<any[]>> => {
    const { data, error } = await supabase.from("snies_report_templates").select("*").order("name");
    return { data, error };
  };

  const consolidateSniesReports = async (templateId: string): Promise<Result<any>> => {
    const { data, error } = await supabase.rpc('consolidate_snies_reports', { template_id: templateId });
    return { data, error };
  };

  const uploadFile = async (file: File, folder: string = "uploads"): Promise<Result<{ publicUrl: string }>> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('files')
        .upload(filePath, file);

      if (uploadError) {
        return { data: null, error: uploadError };
      }

      const { data: { publicUrl } } = supabase.storage
        .from('files')
        .getPublicUrl(filePath);

      return { data: { publicUrl }, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  return {
    fetchSniesCountries,
    fetchSniesMunicipalities,
    fetchSniesDocumentTypes,
    fetchSniesBiologicalSex,
    fetchSniesMaritalStatus,
    createSniesCountry,
    createSniesMunicipality,
    bulkCreateSniesCountries,
    bulkCreateSniesMunicipalities,
    fetchSniesReportTemplates,
    consolidateSniesReports,
    uploadFile,
  };
}
