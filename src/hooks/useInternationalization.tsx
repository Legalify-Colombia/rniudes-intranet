
import { supabase } from "@/integrations/supabase/client";
import type { Result } from "@/types/supabase";

export function useInternationalization() {
  const fetchInternationalizationProjects = async (): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from("internationalization_projects")
      .select("*")
      .order("created_at", { ascending: false });
    return { data, error };
  };

  const fetchInternationalizationReports = async (): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from("internationalization_reports")
      .select(`
        *,
        project:internationalization_projects(*)
      `)
      .order("created_at", { ascending: false });
    return { data, error };
  };

  const createInternationalizationProject = async (project: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("internationalization_projects")
      .insert(project)
      .select()
      .single();
    return { data, error };
  };

  const updateInternationalizationProject = async (id: string, updates: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("internationalization_projects")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    return { data, error };
  };

  return {
    fetchInternationalizationProjects,
    fetchInternationalizationReports,
    createInternationalizationProject,
    updateInternationalizationProject
  };
}
