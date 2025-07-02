
import { supabase } from "@/integrations/supabase/client";
import type { Action, Result } from "@/types/supabase";
import type { Database } from "@/integrations/supabase/types";

export function useActions() {
  const fetchActions = async (): Promise<Result<Action[]>> => {
    const { data, error } = await supabase.from("actions").select("*").order("name");
    return { data, error };
  };

  const createAction = async (action: Database["public"]["Tables"]["actions"]["Insert"]): Promise<Result<Action>> => {
    const { data, error } = await supabase.from("actions").insert(action).select().single();
    return { data, error };
  };

  const updateAction = async (id: string, updates: Database["public"]["Tables"]["actions"]["Update"]): Promise<Result<Action>> => {
    const { data, error } = await supabase.from("actions").update(updates).eq("id", id).select().single();
    return { data, error };
  };

  const deleteAction = async (id: string): Promise<Result<any>> => {
    const { data, error } = await supabase.from("actions").delete().eq("id", id);
    return { data, error };
  };

  return {
    fetchActions,
    createAction,
    updateAction,
    deleteAction,
  };
}
