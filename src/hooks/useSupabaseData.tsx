
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Database } from "@/integrations/supabase/types";

// Import all the modular hooks
import { useCampus } from "./useCampus";
import { useFaculties } from "./useFaculties";
import { useAcademicPrograms } from "./useAcademicPrograms";
import { useManagers } from "./useManagers";
import { useStrategicElements } from "./useStrategicElements";
import { useReports } from "./useReports";
import { useDocumentTemplates } from "./useDocumentTemplates";
import { useCustomPlans } from "./useCustomPlans";
import { useIndicators } from "./useIndicators";
import { useWorkPlanAssignments } from "./useWorkPlanAssignments";
import { useFileUpload } from "./useFileUpload";

type Result<T> = { data: T | null; error: any };

export function useSupabaseData() {
  const [profile, setProfile] = useState<Database["public"]["Tables"]["profiles"]["Row"] | null>(null);
  const { user } = useAuth();

  // Import all hooks
  const campusHook = useCampus();
  const facultiesHook = useFaculties();
  const academicProgramsHook = useAcademicPrograms();
  const managersHook = useManagers();
  const strategicElementsHook = useStrategicElements();
  const reportsHook = useReports();
  const documentTemplatesHook = useDocumentTemplates();
  const customPlansHook = useCustomPlans();
  const indicatorsHook = useIndicators();
  const workPlanAssignmentsHook = useWorkPlanAssignments();
  const fileUploadHook = useFileUpload();

  useEffect(() => {
    const getProfile = async () => {
      if (user) {
        const { data: profileData, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error("Error fetching profile:", error);
        } else {
          setProfile(profileData);
        }
      } else {
        setProfile(null);
      }
    };

    getProfile();
  }, [user]);

  const updateProfile = async (updates: Database["public"]["Tables"]["profiles"]["Update"]) => {
    if (!user) {
      console.error("No user is signed in, cannot update profile");
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating profile:", error);
    } else {
      setProfile(data);
    }
  };

  // SNIES related functions
  const createSniesTableFunctions = (tableName: string) => {
    const fetchFunction = async (): Promise<Result<any[]>> => {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('is_active', true)
        .order('name');
      return { data: data || [], error };
    };

    const createFunction = async (item: any): Promise<Result<any>> => {
      const { data, error } = await supabase
        .from(tableName)
        .insert(item)
        .select()
        .single();
      return { data, error };
    };

    const bulkCreateFunction = async (items: any[]): Promise<Result<any[]>> => {
      const { data, error } = await supabase
        .from(tableName)
        .insert(items)
        .select();
      return { data: data || [], error };
    };

    const updateFunction = async (id: string, updates: any): Promise<Result<any>> => {
      const { data, error } = await supabase
        .from(tableName)
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      return { data, error };
    };

    const deleteFunction = async (id: string): Promise<Result<any>> => {
      const { data, error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id)
        .select()
        .single();
      return { data, error };
    };

    return {
      fetch: fetchFunction,
      create: createFunction,
      bulkCreate: bulkCreateFunction,
      update: updateFunction,
      delete: deleteFunction
    };
  };

  // SNIES functions
  const fetchSniesCountries = async (): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from('snies_countries')
      .select('*')
      .eq('is_active', true)
      .order('name');
    return { data: data || [], error };
  };

  const fetchSniesMunicipalities = async (): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from('snies_municipalities')
      .select('*')
      .eq('is_active', true)
      .order('name');
    return { data: data || [], error };
  };

  const fetchSniesDocumentTypes = async (): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from('snies_document_types')
      .select('*')
      .eq('is_active', true)
      .order('name');
    return { data: data || [], error };
  };

  const fetchSniesBiologicalSex = async (): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from('snies_biological_sex')
      .select('*')
      .eq('is_active', true)
      .order('name');
    return { data: data || [], error };
  };

  const fetchSniesMaritalStatus = async (): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from('snies_marital_status')
      .select('*')
      .eq('is_active', true)
      .order('name');
    return { data: data || [], error };
  };

  const sniesEducationLevels = createSniesTableFunctions('snies_education_levels');
  const sniesModalities = createSniesTableFunctions('snies_modalities');
  const sniesMethodologies = createSniesTableFunctions('snies_methodologies');
  const sniesKnowledgeAreas = createSniesTableFunctions('snies_knowledge_areas');
  const sniesInstitutions = createSniesTableFunctions('snies_institutions');

  const createSniesCountry = async (country: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from('snies_countries')
      .insert(country)
      .select()
      .single();
    return { data, error };
  };

  const bulkCreateSniesCountries = async (countries: any[]): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from('snies_countries')
      .insert(countries)
      .select();
    return { data: data || [], error };
  };

  const createSniesMunicipality = async (municipality: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from('snies_municipalities')
      .insert(municipality)
      .select()
      .single();
    return { data, error };
  };

  const bulkCreateSniesMunicipalities = async (municipalities: any[]): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from('snies_municipalities')
      .insert(municipalities)
      .select();
    return { data: data || [], error };
  };

  const fetchSniesReportData = async (reportId: string): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from('snies_report_data')
      .select('*')
      .eq('report_id', reportId)
      .order('row_index');
    return { data: data || [], error };
  };

  const saveSniesReportData = async (reportId: string, reportData: any[]): Promise<Result<any[]>> => {
    await supabase
      .from('snies_report_data')
      .delete()
      .eq('report_id', reportId);

    const dataToInsert = reportData.map((row, index) => ({
      report_id: reportId,
      row_index: index,
      field_data: row
    }));

    const { data, error } = await supabase
      .from('snies_report_data')
      .insert(dataToInsert)
      .select();

    return { data: data || [], error };
  };

  const consolidateSniesReports = async (templateId: string, title: string): Promise<Result<any>> => {
    const { data: reports, error: reportsError } = await supabase
      .from('snies_reports')
      .select(`
        id,
        manager_id,
        snies_report_data(*)
      `)
      .eq('template_id', templateId)
      .eq('status', 'submitted');

    if (reportsError) return { data: null, error: reportsError };

    let consolidatedData: any[] = [];
    reports?.forEach(report => {
      if (report.snies_report_data) {
        report.snies_report_data.forEach((dataRow: any) => {
          consolidatedData.push(dataRow.field_data);
        });
      }
    });

    const { data, error } = await supabase
      .from('snies_consolidated_reports')
      .insert({
        template_id: templateId,
        title,
        total_records: consolidatedData.length,
        participating_managers: reports?.length || 0,
        created_by: profile?.id || ''
      })
      .select()
      .single();

    return { data: { ...data, consolidated_data: consolidatedData }, error };
  };

  return {
    profile,
    updateProfile,
    
    // Campus
    ...campusHook,
    
    // Faculties
    ...facultiesHook,
    
    // Academic Programs
    fetchPrograms: academicProgramsHook.fetchAcademicPrograms,
    ...academicProgramsHook,
    
    // Managers
    ...managersHook,
    
    // Strategic Elements
    ...strategicElementsHook,
    
    // Reports
    ...reportsHook,
    
    // Document Templates
    ...documentTemplatesHook,
    
    // Custom Plans
    ...customPlansHook,
    
    // Indicators
    ...indicatorsHook,
    
    // Work Plan Assignments
    ...workPlanAssignmentsHook,
    
    // File Upload
    ...fileUploadHook,
    
    // SNIES functions
    fetchSniesCountries: async (): Promise<Result<any[]>> => {
      const { data, error } = await supabase
        .from('snies_countries')
        .select('*')
        .eq('is_active', true)
        .order('name');
      return { data: data || [], error };
    },

    fetchSniesMunicipalities: async (): Promise<Result<any[]>> => {
      const { data, error } = await supabase
        .from('snies_municipalities')
        .select('*')
        .eq('is_active', true)
        .order('name');
      return { data: data || [], error };
    },

    fetchSniesDocumentTypes: async (): Promise<Result<any[]>> => {
      const { data, error } = await supabase
        .from('snies_document_types')
        .select('*')
        .eq('is_active', true)
        .order('name');
      return { data: data || [], error };
    },

    fetchSniesBiologicalSex: async (): Promise<Result<any[]>> => {
      const { data, error } = await supabase
        .from('snies_biological_sex')
        .select('*')
        .eq('is_active', true)
        .order('name');
      return { data: data || [], error };
    },

    fetchSniesMaritalStatus: async (): Promise<Result<any[]>> => {
      const { data, error } = await supabase
        .from('snies_marital_status')
        .select('*')
        .eq('is_active', true)
        .order('name');
      return { data: data || [], error };
    },

    createSniesCountry: async (country: any): Promise<Result<any>> => {
      const { data, error } = await supabase
        .from('snies_countries')
        .insert(country)
        .select()
        .single();
      return { data, error };
    },

    bulkCreateSniesCountries: async (countries: any[]): Promise<Result<any[]>> => {
      const { data, error } = await supabase
        .from('snies_countries')
        .insert(countries)
        .select();
      return { data: data || [], error };
    },

    createSniesMunicipality: async (municipality: any): Promise<Result<any>> => {
      const { data, error } = await supabase
        .from('snies_municipalities')
        .insert(municipality)
        .select()
        .single();
      return { data, error };
    },

    bulkCreateSniesMunicipalities: async (municipalities: any[]): Promise<Result<any[]>> => {
      const { data, error } = await supabase
        .from('snies_municipalities')
        .insert(municipalities)
        .select();
      return { data: data || [], error };
    },

    fetchSniesReportData: async (reportId: string): Promise<Result<any[]>> => {
      const { data, error } = await supabase
        .from('snies_report_data')
        .select('*')
        .eq('report_id', reportId)
        .order('row_index');
      return { data: data || [], error };
    },

    saveSniesReportData: async (reportId: string, reportData: any[]): Promise<Result<any[]>> => {
      await supabase
        .from('snies_report_data')
        .delete()
        .eq('report_id', reportId);

      const dataToInsert = reportData.map((row, index) => ({
        report_id: reportId,
        row_index: index,
        field_data: row
      }));

      const { data, error } = await supabase
        .from('snies_report_data')
        .insert(dataToInsert)
        .select();

      return { data: data || [], error };
    },

    consolidateSniesReports: async (templateId: string, title: string): Promise<Result<any>> => {
      const { data: reports, error: reportsError } = await supabase
        .from('snies_reports')
        .select(`
          id,
          manager_id,
          snies_report_data(*)
        `)
        .eq('template_id', templateId)
        .eq('status', 'submitted');

      if (reportsError) return { data: null, error: reportsError };

      let consolidatedData: any[] = [];
      reports?.forEach(report => {
        if (report.snies_report_data) {
          report.snies_report_data.forEach((dataRow: any) => {
            consolidatedData.push(dataRow.field_data);
          });
        }
      });

      const { data, error } = await supabase
        .from('snies_consolidated_reports')
        .insert({
          template_id: templateId,
          title,
          total_records: consolidatedData.length,
          participating_managers: reports?.length || 0,
          created_by: profile?.id || ''
        })
        .select()
        .single();

      return { data: { ...data, consolidated_data: consolidatedData }, error };
    }
  };
}
