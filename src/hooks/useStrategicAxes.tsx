
import { supabase } from "@/integrations/supabase/client";
import type { StrategicAxis, Result } from "@/types/supabase";
import type { Database } from "@/integrations/supabase/types";

export function useStrategicAxes() {
  const fetchStrategicAxes = async (): Promise<Result<StrategicAxis[]>> => {
    const { data, error } = await supabase.from("strategic_axes").select("*").order("name");
    return { data, error };
  };

  const createStrategicAxis = async (axis: Database["public"]["Tables"]["strategic_axes"]["Insert"]): Promise<Result<StrategicAxis>> => {
    const { data, error } = await supabase.from("strategic_axes").insert(axis).select().single();
    return { data, error };
  };

  const updateStrategicAxis = async (id: string, updates: Database["public"]["Tables"]["strategic_axes"]["Update"]): Promise<Result<StrategicAxis>> => {
    const { data, error } = await supabase.from("strategic_axes").update(updates).eq("id", id).select().single();
    return { data, error };
  };

  const deleteStrategicAxis = async (id: string): Promise<Result<any>> => {
    const { data, error } = await supabase.from("strategic_axes").delete().eq("id", id);
    return { data, error };
  };

  return {
    fetchStrategicAxes,
    createStrategicAxis,
    updateStrategicAxis,
    deleteStrategicAxis,
  };
}
