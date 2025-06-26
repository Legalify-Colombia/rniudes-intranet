
import { supabase } from "@/integrations/supabase/client";
import type { Result } from "@/types/supabase";

export function useActions() {
  const fetchActions = async (): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from("actions")
      .select("*")
      .order("created_at");
    return { data, error };
  };

  const createAction = async (action: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("actions")
      .insert(action)
      .select()
      .single();
    return { data, error };
  };

  const updateAction = async (id: string, updates: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("actions")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    return { data, error };
  };

  const deleteAction = async (id: string): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("actions")
      .delete()
      .eq("id", id);
    return { data, error };
  };

  return {
    fetchActions,
    createAction,
    updateAction,
    deleteAction
  };
}
