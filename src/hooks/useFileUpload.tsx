
import { supabase } from "@/integrations/supabase/client";
import type { Result } from "@/types/supabase";

export function useFileUpload() {
  const uploadFile = async (file: File, folder: string = "uploads"): Promise<Result<string>> => {
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

      return { data: publicUrl, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  return {
    uploadFile,
  };
}
