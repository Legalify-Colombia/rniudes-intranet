import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Database } from "@/integrations/supabase/types";
import type { Result } from "@/types/supabase";

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
import { useSniesReports } from "./useSniesReports";
import { useTemplateReports } from "./useTemplateReports";
import { useReportConfiguration } from "./useReportConfiguration";
import { usePlanTypes } from "./usePlanTypes";
import { useUsers } from "./useUsers";
import { useWorkPlans } from "./useWorkPlans";

// Re-export types for components that need them
export type {
  Campus,
  Faculty,
  AcademicProgram,
  DocumentTemplate,
  StrategicAxis,
  Action,
  Product,
  ReportPeriod,
  ManagerReport,
  Profile,
  CustomPlan,
  Indicator,
  IndicatorReport,
  ReportTemplate,
  ManagerReportVersion,
  SniesReport,
  SniesReportTemplate,
  SniesTemplateField
} from "@/types/supabase";

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
  const sniesReportsHook = useSniesReports();
  const templateReportsHook = useTemplateReports();
  const reportConfigurationHook = useReportConfiguration();
  const planTypesHook = usePlanTypes();
  const usersHook = useUsers();
  const workPlansHook = useWorkPlans();

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

  // Additional functions that are still needed
  const createManagerReport = async (report: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("manager_reports")
      .insert(report)
      .select()
      .single();
    return { data, error };
  };

  const fetchUnifiedReports = async (managerId?: string): Promise<Result<any[]>> => {
    let query = supabase.from("unified_reports").select("*");
    
    if (managerId) {
      query = query.eq("manager_id", managerId);
    }
    
    const { data, error } = await query.order("created_at", { ascending: false });
    return { data, error };
  };

  const deleteTemplateBasedReport = async (id: string): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("template_based_reports")
      .delete()
      .eq("id", id);
    return { data, error };
  };

  const deleteIndicatorReport = async (id: string): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("indicator_reports")
      .delete()
      .eq("id", id);
    return { data, error };
  };

  const checkPeriodActive = async (periodId: string): Promise<Result<boolean>> => {
    const { data, error } = await supabase
      .from("report_periods")
      .select("end_date, is_active")
      .eq("id", periodId)
      .single();
    
    if (error) return { data: null, error };
    
    const isActive = data.is_active && new Date(data.end_date) >= new Date();
    return { data: isActive, error: null };
  };

  const submitTemplateBasedReport = async (reportId: string): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("template_based_reports")
      .update({ 
        status: "submitted",
        submitted_date: new Date().toISOString()
      })
      .eq("id", reportId)
      .select()
      .single();
    return { data, error };
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

    // SNIES Reports
    ...sniesReportsHook,

    // Template Reports
    ...templateReportsHook,

    // Report Configuration
    ...reportConfigurationHook,

    // Plan Types
    ...planTypesHook,

    // Users
    ...usersHook,

    // Work Plans
    ...workPlansHook,

    // Additional functions
    createManagerReport,
    fetchUnifiedReports,
    deleteTemplateBasedReport,
    deleteIndicatorReport,
    checkPeriodActive,
    submitTemplateBasedReport,
    
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
    },
    // SNIES functions adicionales
    fetchSniesAcademicLevels: async (): Promise<Result<any[]>> => {
      const { data, error } = await supabase
        .from('snies_academic_levels')
        .select('*')
        .eq('is_active', true)
        .order('name');
      return { data: data || [], error };
    },

    fetchSniesProgramTypes: async (): Promise<Result<any[]>> => {
      const { data, error } = await supabase
        .from('snies_program_types')
        .select('*')
        .eq('is_active', true)
        .order('name');
      return { data: data || [], error };
    },

    fetchSniesRecognitionTypes: async (): Promise<Result<any[]>> => {
      const { data, error } = await supabase
        .from('snies_recognition_types')
        .select('*')
        .eq('is_active', true)
        .order('name');
      return { data: data || [], error };
    },

    fetchSniesDepartments: async (): Promise<Result<any[]>> => {
      const { data, error } = await supabase
        .from('snies_departments')
        .select('*, country:snies_countries(name)')
        .eq('is_active', true)
        .order('name');
      return { data: data || [], error };
    },

    createSniesAcademicLevel: async (academicLevel: any): Promise<Result<any>> => {
      const { data, error } = await supabase
        .from('snies_academic_levels')
        .insert(academicLevel)
        .select()
        .single();
      return { data, error };
    },

    createSniesProgramType: async (programType: any): Promise<Result<any>> => {
      const { data, error } = await supabase
        .from('snies_program_types')
        .insert(programType)
        .select()
        .single();
      return { data, error };
    },

    createSniesRecognitionType: async (recognitionType: any): Promise<Result<any>> => {
      const { data, error } = await supabase
        .from('snies_recognition_types')
        .insert(recognitionType)
        .select()
        .single();
      return { data, error };
    },

    createSniesDepartment: async (department: any): Promise<Result<any>> => {
      const { data, error } = await supabase
        .from('snies_departments')
        .insert(department)
        .select()
        .single();
      return { data, error };
    },

    bulkCreateSniesAcademicLevels: async (academicLevels: any[]): Promise<Result<any[]>> => {
      const { data, error } = await supabase
        .from('snies_academic_levels')
        .insert(academicLevels)
        .select();
      return { data: data || [], error };
    },

    bulkCreateSniesProgramTypes: async (programTypes: any[]): Promise<Result<any[]>> => {
      const { data, error } = await supabase
        .from('snies_program_types')
        .insert(programTypes)
        .select();
      return { data: data || [], error };
    },

    bulkCreateSniesRecognitionTypes: async (recognitionTypes: any[]): Promise<Result<any[]>> => {
      const { data, error } = await supabase
        .from('snies_recognition_types')
        .insert(recognitionTypes)
        .select();
      return { data: data || [], error };
    },

    bulkCreateSniesDepartments: async (departments: any[]): Promise<Result<any[]>> => {
      const { data, error } = await supabase
        .from('snies_departments')
        .insert(departments)
        .select();
      return { data: data || [], error };
    },

    // Función para parsear CSV
    parseCSV: (csvText: string): any[] => {
      const lines = csvText.trim().split('\n');
      if (lines.length < 2) return [];
      
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      const result = [];
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
        if (values.length === headers.length) {
          const row: any = {};
          headers.forEach((header, index) => {
            row[header] = values[index];
          });
          result.push(row);
        }
      }
      
      return result;
    }
  };
}
