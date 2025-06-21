
import { supabase } from "@/integrations/supabase/client";
import type { Result } from "@/types/supabase";

export function useFaculties() {
  const fetchFaculties = async (): Promise<Result<any[]>> => {
    const { data, error } = await supabase.from("faculties").select("*").order("name");
    return { data, error };
  };

  const fetchFacultiesByCampus = async (campusId: string): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from("faculty_campus")
      .select(`
        faculty_id,
        faculties (*)
      `)
      .eq("campus_id", campusId);
    
    if (error) return { data: null, error };
    
    const faculties = data?.map(item => item.faculties).filter(Boolean) || [];
    return { data: faculties, error: null };
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

  const addFacultyToCampus = async (facultyId: string, campusId: string): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("faculty_campus")
      .insert({ faculty_id: facultyId, campus_id: campusId })
      .select()
      .single();
    return { data, error };
  };

  const removeFacultyFromCampus = async (facultyId: string, campusId: string): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("faculty_campus")
      .delete()
      .eq("faculty_id", facultyId)
      .eq("campus_id", campusId);
    return { data, error };
  };

  const getFacultyCampuses = async (facultyId: string): Promise<Result<string[]>> => {
    const { data, error } = await supabase
      .from("faculty_campus")
      .select("campus_id")
      .eq("faculty_id", facultyId);
    
    if (error) return { data: null, error };
    
    const campusIds = data?.map(item => item.campus_id) || [];
    return { data: campusIds, error: null };
  };

  return {
    fetchFaculties,
    fetchFacultiesByCampus,
    createFaculty,
    updateFaculty,
    deleteFaculty,
    addFacultyToCampus,
    removeFacultyFromCampus,
    getFacultyCampuses,
  };
}
