
import { supabase } from "@/integrations/supabase/client";
import type { DocumentTemplate, Result } from "@/types/supabase";
import type { Database } from "@/integrations/supabase/types";

export function useDocumentTemplates() {
  const fetchDocumentTemplates = async (): Promise<Result<DocumentTemplate[]>> => {
    const { data, error } = await supabase
      .from("document_templates")
      .select("*")
      .eq("is_active", true)
      .order("name");
    return { data, error };
  };

  const createDocumentTemplate = async (template: Database["public"]["Tables"]["document_templates"]["Insert"]): Promise<Result<DocumentTemplate>> => {
    const { data, error } = await supabase.from("document_templates").insert(template).select().single();
    return { data, error };
  };

  const updateDocumentTemplate = async (id: string, updates: Database["public"]["Tables"]["document_templates"]["Update"]): Promise<Result<DocumentTemplate>> => {
    const { data, error } = await supabase.from("document_templates").update(updates).eq("id", id).select().single();
    return { data, error };
  };

  const deleteDocumentTemplate = async (id: string): Promise<Result<any>> => {
    const { data, error } = await supabase.from("document_templates").delete().eq("id", id);
    return { data, error };
  };

  return {
    fetchDocumentTemplates,
    createDocumentTemplate,
    updateDocumentTemplate,
    deleteDocumentTemplate,
  };
}
