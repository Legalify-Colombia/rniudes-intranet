
import { supabase } from "@/integrations/supabase/client";
import type { Faculty, Result } from "@/types/supabase";
import type { Database } from "@/integrations/supabase/types";

export function useFaculties() {
  const fetchFaculties = async (): Promise<Result<Faculty[]>> => {
    const { data, error } = await supabase
      .from("faculties")
      .select("*")
      .order("name");
    return { data, error };
  };

  const fetchFacultiesByCampus = async (campusId: string): Promise<Result<Faculty[]>> => {
    const { data, error } = await supabase
      .from("faculties")
      .select("*")
      .eq("campus_id", campusId)
      .order("name");
    return { data, error };
  };

  const createFaculty = async (faculty: Database["public"]["Tables"]["faculties"]["Insert"]): Promise<Result<Faculty>> => {
    const { data, error } = await supabase
      .from("faculties")
      .insert(faculty)
      .select()
      .single();
    return { data, error };
  };

  const updateFaculty = async (id: string, updates: Database["public"]["Tables"]["faculties"]["Update"]): Promise<Result<Faculty>> => {
    const { data, error } = await supabase
      .from("faculties")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    return { data, error };
  };

  const deleteFaculty = async (id: string): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("faculties")
      .delete()
      .eq("id", id);
    return { data, error };
  };

  return {
    fetchFaculties,
    fetchFacultiesByCampus,
    createFaculty,
    updateFaculty,
    deleteFaculty,
  };
}
