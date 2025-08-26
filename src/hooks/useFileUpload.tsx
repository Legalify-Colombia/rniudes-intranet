
import { supabase } from "@/integrations/supabase/client";
import type { Result } from "@/types/supabase";

export function useFileUpload() {
  const uploadFile = async (file: File, folder: string = "uploads", fileName?: string): Promise<Result<{ publicUrl: string }>> => {
    try {
      // Verificar tamaño del archivo (máximo 5MB)
      const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB en bytes
      if (file.size > MAX_FILE_SIZE) {
        return { 
          data: null, 
          error: new Error('El archivo excede el tamaño máximo de 5MB') 
        };
      }

      const fileExt = file.name.split('.').pop();
      const finalFileName = fileName || `${Math.random()}.${fileExt}`;
      
      // Usar el userId para organizar los archivos por usuario
      const userId = (await supabase.auth.getUser()).data.user?.id;
      if (!userId) {
        return { 
          data: null, 
          error: new Error('Usuario no autenticado') 
        };
      }
      
      const filePath = `${userId}/${folder}/${finalFileName}`;

      const { error: uploadError } = await supabase.storage
        .from('evidence-files')
        .upload(filePath, file);

      if (uploadError) {
        return { data: null, error: uploadError };
      }

      const { data: { publicUrl } } = supabase.storage
        .from('evidence-files')
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
