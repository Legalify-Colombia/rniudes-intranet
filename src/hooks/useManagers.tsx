
import { supabase } from "@/integrations/supabase/client";
import type { Profile, Result } from "@/types/supabase";

export function useManagers() {
  const fetchManagers = async (): Promise<Result<Profile[]>> => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", "Gestor")
      .order("full_name");
    return { data, error };
  };

  const fetchManagersByCampus = async (campusId: string): Promise<Result<Profile[]>> => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", "Gestor")
      .eq("campus_id", campusId)
      .order("full_name");
    return { data, error };
  };

  const fetchAllManagers = async (): Promise<Result<Profile[]>> => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .in("role", ["Gestor", "Coordinador", "Administrador"])
      .order("full_name");
    return { data, error };
  };

  return {
    fetchManagers,
    fetchManagersByCampus,
    fetchAllManagers,
  };
}
