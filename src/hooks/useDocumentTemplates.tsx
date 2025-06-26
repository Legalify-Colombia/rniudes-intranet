
import { supabase } from "@/integrations/supabase/client";
import type { Result } from "@/types/supabase";

export function useDocumentTemplates() {
  const fetchDocumentTemplates = async (): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from("document_templates")
      .select("*")
      .order("created_at");
    return { data, error };
  };

  const createDocumentTemplate = async (template: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("document_templates")
      .insert(template)
      .select()
      .single();
    return { data, error };
  };

  const updateDocumentTemplate = async (id: string, updates: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("document_templates")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    return { data, error };
  };

  const deleteDocumentTemplate = async (id: string): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("document_templates")
      .delete()
      .eq("id", id);
    return { data, error };
  };

  return {
    fetchDocumentTemplates,
    createDocumentTemplate,
    updateDocumentTemplate,
    deleteDocumentTemplate
  };
}
