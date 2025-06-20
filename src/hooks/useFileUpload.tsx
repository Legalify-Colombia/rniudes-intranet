
import { supabase } from "@/integrations/supabase/client";
import type { Result } from "@/types/supabase";

export function useFileUpload() {
  const uploadFile = async (file: File, bucket: string = "evidence", folder: string = ""): Promise<Result<{ url: string; path: string }>> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = folder ? `${folder}/${fileName}` : fileName;

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (error) {
        return { data: null, error };
      }

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      return { 
        data: { 
          url: publicUrl, 
          path: filePath 
        }, 
        error: null 
      };
    } catch (error) {
      return { data: null, error };
    }
  };

  return {
    uploadFile,
  };
}
