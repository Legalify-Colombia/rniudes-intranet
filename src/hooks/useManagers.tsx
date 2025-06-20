
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

  const fetchManagersByCampus = async (campusIds?: string[]): Promise<Result<any[]>> => {
    let query = supabase
      .from("profiles")
      .select(`
        *,
        academic_programs:academic_programs!manager_id (
          id,
          name,
          director_name,
          campus:campus!campus_id (
            id,
            name
          ),
          faculty:faculties!faculty_id (
            id,
            name
          )
        )
      `)
      .eq("role", "Gestor")
      .order("full_name");

    if (campusIds && campusIds.length > 0) {
      // Get managers who are assigned to programs in the specified campuses
      const { data: programsData } = await supabase
        .from("academic_programs")
        .select("manager_id")
        .in("campus_id", campusIds);
      
      const managerIds = programsData?.map(p => p.manager_id).filter(Boolean) || [];
      
      if (managerIds.length > 0) {
        query = query.in("id", managerIds);
      } else {
        // No managers found for these campuses
        return { data: [], error: null };
      }
    }

    const { data, error } = await query;
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

  const fetchAvailablePlanTypes = async (managerId: string): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .rpc('get_available_plan_types_for_manager', {
        manager_profile_id: managerId
      });
    return { data, error };
  };

  return {
    fetchManagers,
    fetchManagersByCampus,
    fetchAllManagers,
    fetchAvailablePlanTypes,
  };
}
