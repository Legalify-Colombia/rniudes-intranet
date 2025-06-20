
import { supabase } from "@/integrations/supabase/client";
import type { Profile, Result } from "@/types/supabase";

export function useSupabaseData() {
  const fetchCampus = async (): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from("campus")
      .select("*")
      .order("name");
    return { data, error };
  };

  const fetchFaculties = async (): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from("faculties")
      .select(`
        *,
        campus:campus_id (
          id,
          name
        )
      `)
      .order("name");
    return { data, error };
  };

  const fetchFacultiesByCampus = async (campusId: string): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from("faculties")
      .select(`
        *,
        campus:campus_id (
          id,
          name
        )
      `)
      .eq("campus_id", campusId)
      .order("name");
    return { data, error };
  };

  const fetchAcademicPrograms = async (): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from("academic_programs")
      .select(`
        *,
        campus:campus_id (
          id,
          name
        ),
        faculty:faculty_id (
          id,
          name
        ),
        manager:manager_id (
          id,
          full_name,
          email
        )
      `)
      .order("name");
    return { data, error };
  };

  const fetchAcademicProgramsByCampus = async (campusId: string): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from("academic_programs")
      .select(`
        *,
        campus:campus_id (
          id,
          name
        ),
        faculty:faculty_id (
          id,
          name
        ),
        manager:manager_id (
          id,
          full_name,
          email
        )
      `)
      .eq("campus_id", campusId)
      .order("name");
    return { data, error };
  };

  const fetchManagersByCampus = async (campusIds?: string[]): Promise<Result<Profile[]>> => {
    let query = supabase
      .from("profiles")
      .select("*")
      .eq("role", "Gestor");

    if (campusIds && campusIds.length > 0) {
      query = query.in("campus_id", campusIds);
    }

    const { data, error } = await query.order("full_name");
    return { data, error };
  };

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

  const createCampus = async (campusData: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("campus")
      .insert(campusData)
      .select()
      .single();
    return { data, error };
  };

  const updateCampus = async (campusId: string, updates: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("campus")
      .update(updates)
      .eq("id", campusId)
      .select()
      .single();
    return { data, error };
  };

  const deleteCampus = async (campusId: string): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("campus")
      .delete()
      .eq("id", campusId);
    return { data, error };
  };

  const createFaculty = async (facultyData: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("faculties")
      .insert(facultyData)
      .select()
      .single();
    return { data, error };
  };

  const updateFaculty = async (facultyId: string, updates: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("faculties")
      .update(updates)
      .eq("id", facultyId)
      .select()
      .single();
    return { data, error };
  };

  const deleteFaculty = async (facultyId: string): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("faculties")
      .delete()
      .eq("id", facultyId);
    return { data, error };
  };

  const createAcademicProgram = async (programData: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("academic_programs")
      .insert(programData)
      .select()
      .single();
    return { data, error };
  };

  const updateAcademicProgram = async (programId: string, updates: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("academic_programs")
      .update(updates)
      .eq("id", programId)
      .select()
      .single();
    return { data, error };
  };

  const deleteAcademicProgram = async (programId: string): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("academic_programs")
      .delete()
      .eq("id", programId);
    return { data, error };
  };

  return {
    fetchCampus,
    fetchFaculties,
    fetchFacultiesByCampus,
    fetchAcademicPrograms,
    fetchAcademicProgramsByCampus,
    fetchManagersByCampus,
    fetchUsersByCampus,
    updateUserProfile,
    createCampus,
    updateCampus,
    deleteCampus,
    createFaculty,
    updateFaculty,
    deleteFaculty,
    createAcademicProgram,
    updateAcademicProgram,
    deleteAcademicProgram,
  };
}
