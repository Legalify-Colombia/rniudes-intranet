
import { supabase } from "@/integrations/supabase/client";
import type { AcademicProgram, Result } from "@/types/supabase";
import type { Database } from "@/integrations/supabase/types";

export function useAcademicPrograms() {
  const fetchAcademicPrograms = async (): Promise<Result<AcademicProgram[]>> => {
    const { data, error } = await supabase
      .from("academic_programs")
      .select("*")
      .order("name");
    return { data, error };
  };

  const fetchAcademicProgramsByCampus = async (campusId: string): Promise<Result<AcademicProgram[]>> => {
    const { data, error } = await supabase
      .from("academic_programs")
      .select("*")
      .eq("campus_id", campusId)
      .order("name");
    return { data, error };
  };

  const fetchAcademicProgramsByFaculty = async (facultyId: string): Promise<Result<AcademicProgram[]>> => {
    const { data, error } = await supabase
      .from("academic_programs")
      .select("*")
      .eq("faculty_id", facultyId)
      .order("name");
    return { data, error };
  };

  const createAcademicProgram = async (program: Database["public"]["Tables"]["academic_programs"]["Insert"]): Promise<Result<AcademicProgram>> => {
    const { data, error } = await supabase
      .from("academic_programs")
      .insert(program)
      .select()
      .single();
    return { data, error };
  };

  const updateAcademicProgram = async (id: string, updates: Database["public"]["Tables"]["academic_programs"]["Update"]): Promise<Result<AcademicProgram>> => {
    const { data, error } = await supabase
      .from("academic_programs")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    return { data, error };
  };

  const deleteAcademicProgram = async (id: string): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("academic_programs")
      .delete()
      .eq("id", id);
    return { data, error };
  };

  return {
    fetchAcademicPrograms,
    fetchAcademicProgramsByCampus,
    fetchAcademicProgramsByFaculty,
    createAcademicProgram,
    updateAcademicProgram,
    deleteAcademicProgram,
  };
}
