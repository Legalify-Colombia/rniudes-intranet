
import { supabase } from "@/integrations/supabase/client";
import type { Result } from "@/types/supabase";

export function useFileUpload() {
  const uploadFile = async (file: File, folder: string = "uploads", fileName?: string): Promise<Result<{ publicUrl: string }>> => {
    try {
      const fileExt = file.name.split('.').pop();
      const finalFileName = fileName || `${Math.random()}.${fileExt}`;
      const filePath = `${folder}/${finalFileName}`;

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
    uploadFile,
  };
}
