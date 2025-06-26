
import { supabase } from "@/integrations/supabase/client";
import type { Result } from "@/types/supabase";

export function useTemplateReportManagement() {
  const fetchTemplateBasedReportDetails = async (reportId: string): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("template_based_reports")
      .select(`
        *,
        profiles:manager_id(*),
        report_periods:report_period_id(*)
      `)
      .eq("id", reportId)
      .single();
    return { data, error };
  };

  const upsertTemplateReportResponse = async (response: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("template_report_responses")
      .upsert(response)
      .select()
      .single();
    return { data, error };
  };

  const deleteTemplateReportResponse = async (id: string): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("template_report_responses")
      .delete()
      .eq("id", id);
    return { data, error };
  };

  const updateTemplateBasedReport = async (id: string, updates: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("template_based_reports")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    return { data, error };
  };

  const submitTemplateBasedReport = async (reportId: string): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("template_based_reports")
      .update({ 
        status: 'submitted',
        submitted_date: new Date().toISOString()
      })
      .eq("id", reportId)
      .select()
      .single();
    return { data, error };
  };

  const uploadFile = async (file: File, bucket: string, path: string): Promise<Result<any>> => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file);
    
    if (error) return { data: null, error };
    
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);
    
    return { data: { ...data, publicUrl: urlData.publicUrl }, error: null };
  };

  return {
    fetchTemplateBasedReportDetails,
    upsertTemplateReportResponse,
    deleteTemplateReportResponse,
    updateTemplateBasedReport,
    submitTemplateBasedReport,
    uploadFile
  };
}
