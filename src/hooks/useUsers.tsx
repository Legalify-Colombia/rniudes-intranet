
import { supabase } from "@/integrations/supabase/client";
import type { Profile, Result } from "@/types/supabase";

export function useUsers() {
  const fetchUsersByCampus = async (campusIds?: string[]): Promise<Result<Profile[]>> => {
    let query = supabase
      .from("profiles")
      .select("*");

    if (campusIds && campusIds.length > 0) {
      query = query.in("campus_id", campusIds);
    }

    const { data, error } = await query.order("full_name");
    return { data, error };
  };

  const updateUserProfile = async (userId: string, updates: any): Promise<Result<Profile>> => {
    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", userId)
      .select()
      .single();
    return { data, error };
  };

  const updateUserCampusAccess = async (userId: string, campusId: string): Promise<Result<Profile>> => {
    const { data, error } = await supabase
      .from("profiles")
      .update({ campus_id: campusId })
      .eq("id", userId)
      .select()
      .single();
    return { data, error };
  };

  return {
    fetchUsersByCampus,
    updateUserProfile,
    updateUserCampusAccess,
  };
}
