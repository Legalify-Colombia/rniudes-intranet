
import { supabase } from "@/integrations/supabase/client";
import type { Result } from "@/types/supabase";

export function useFaculties() {
  const fetchFaculties = async (): Promise<Result<any[]>> => {
    const { data, error } = await supabase.from("faculties").select("*").order("name");
    return { data, error };
  };

  const createFaculty = async (faculty: any): Promise<Result<any>> => {
    const { data, error } = await supabase.from("faculties").insert(faculty).select().single();
    return { data, error };
  };

  const updateFaculty = async (id: string, updates: any): Promise<Result<any>> => {
    const { data, error } = await supabase.from("faculties").update(updates).eq("id", id).select().single();
    return { data, error };
  };

  const deleteFaculty = async (id: string): Promise<Result<any>> => {
    const { data, error } = await supabase.from("faculties").delete().eq("id", id);
    return { data, error };
  };

  return {
    fetchFaculties,
    createFaculty,
    updateFaculty,
    deleteFaculty,
  };
}
