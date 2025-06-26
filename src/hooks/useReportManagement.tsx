
import { supabase } from "@/integrations/supabase/client";
import type { Result } from "@/types/supabase";

export function useReportManagement() {
  const upsertProductProgressReport = async (report: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("product_progress_reports")
      .upsert(report)
      .select()
      .single();
    return { data, error };
  };

  const deleteProductProgressReport = async (id: string): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("product_progress_reports")
      .delete()
      .eq("id", id);
    return { data, error };
  };

  const updateManagerReport = async (id: string, updates: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("manager_reports")
      .update(updates)
      .eq("id", id)
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
    upsertProductProgressReport,
    deleteProductProgressReport,
    updateManagerReport,
    uploadFile
  };
}
