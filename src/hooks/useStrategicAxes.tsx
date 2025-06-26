
import { supabase } from "@/integrations/supabase/client";
import type { Result } from "@/types/supabase";

export function useStrategicAxes() {
  const fetchStrategicAxes = async (): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from("strategic_axes")
      .select("*")
      .order("code");
    return { data, error };
  };

  const createStrategicAxis = async (strategicAxis: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("strategic_axes")
      .insert(strategicAxis)
      .select()
      .single();
    return { data, error };
  };

  const updateStrategicAxis = async (id: string, updates: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("strategic_axes")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    return { data, error };
  };

  const deleteStrategicAxis = async (id: string): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("strategic_axes")
      .delete()
      .eq("id", id);
    return { data, error };
  };

  return {
    fetchStrategicAxes,
    createStrategicAxis,
    updateStrategicAxis,
    deleteStrategicAxis
  };
}
