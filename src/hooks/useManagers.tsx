
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

  const updateManagerHours = async (managerId: string, weeklyHours: number, numberOfWeeks: number): Promise<Result<Profile>> => {
    const totalHours = weeklyHours * numberOfWeeks;
    const { data, error } = await supabase
      .from("profiles")
      .update({ 
        weekly_hours: weeklyHours,
        number_of_weeks: numberOfWeeks,
        total_hours: totalHours
      })
      .eq("id", managerId)
      .select()
      .single();
    return { data, error };
  };

  return {
    fetchManagers,
    fetchManagersByCampus,
    updateManagerHours,
  };
}
