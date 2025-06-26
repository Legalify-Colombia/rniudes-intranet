
import { supabase } from "@/integrations/supabase/client";
import type { Result } from "@/types/supabase";

export function useUserManagement() {
  const fetchUsersByCampus = async (campusIds?: string[]): Promise<Result<any[]>> => {
    let query = supabase
      .from("profiles")
      .select(`
        *,
        campus:campus_id(*)
      `);

    if (campusIds && campusIds.length > 0) {
      query = query.in("campus_id", campusIds);
    }

    const { data, error } = await query.order("created_at", { ascending: false });
    return { data, error };
  };

  const updateUserProfile = async (userId: string, updates: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", userId)
      .select()
      .single();
    return { data, error };
  };

  return {
    fetchUsersByCampus,
    updateUserProfile
  };
}
