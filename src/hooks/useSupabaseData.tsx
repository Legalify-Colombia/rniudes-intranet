
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

  // Additional functions that are still needed
  const createManagerReport = async (report: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("manager_reports")
      .insert(report)
      .select()
      .single();
    return { data, error };
  };

  const fetchUnifiedReports = async (): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from("unified_reports")
      .select("*")
      .order("created_at", { ascending: false });
    return { data, error };
  };

  const deleteTemplateBasedReport = async (id: string): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("template_based_reports")
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

  // Plan types management
  const createPlanType = async (planType: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("plan_types")
      .insert(planType)
      .select()
      .single();
    return { data, error };
  };

  const updatePlanType = async (id: string, updates: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("plan_types")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    return { data, error };
  };

  const deletePlanType = async (id: string): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("plan_types")
      .delete()
      .eq("id", id);
    return { data, error };
  };

  // Plan fields management
  const createPlanField = async (field: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("plan_fields")
      .insert(field)
      .select()
      .single();
    return { data, error };
  };

  const updatePlanField = async (id: string, updates: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("plan_fields")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    return { data, error };
  };

  const deletePlanField = async (id: string): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("plan_fields")
      .delete()
      .eq("id", id);
    return { data, error };
  };

  const configurePlanTypeElements = async (planTypeId: string, elements: any): Promise<Result<any>> => {
    // Implementation for configuring plan type elements
    return { data: null, error: null };
  };

  // Report system config
  const fetchReportSystemConfig = async (): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("report_system_config")
      .select("*")
      .single();
    return { data, error };
  };

  const updateReportSystemConfig = async (updates: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("report_system_config")
      .update(updates)
      .eq("id", updates.id)
      .select()
      .single();
    return { data, error };
  };

  // Report templates
  const fetchReportTemplates = async (): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from("report_templates")
      .select("*")
      .eq("is_active", true)
      .order("name");
    return { data, error };
  };

  const createReportTemplate = async (template: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("report_templates")
      .insert(template)
      .select()
      .single();
    return { data, error };
  };

  const updateReportTemplate = async (id: string, updates: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("report_templates")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    return { data, error };
  };

  const deleteReportTemplate = async (id: string): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("report_templates")
      .delete()
      .eq("id", id);
    return { data, error };
  };

  // Manager report versions
  const createManagerReportVersion = async (version: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("manager_report_versions")
      .insert(version)
      .select()
      .single();
    return { data, error };
  };

  const updateManagerReportVersion = async (id: string, updates: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("manager_report_versions")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    return { data, error };
  };

  const getNextVersionNumber = async (reportId: string, templateId: string): Promise<Result<number>> => {
    const { data, error } = await supabase.rpc('get_next_version_number', {
      p_manager_report_id: reportId,
      p_template_id: templateId
    });
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

    // Additional functions
    createManagerReport,
    fetchUnifiedReports,
    deleteTemplateBasedReport,
    checkPeriodActive,
    submitTemplateBasedReport,
    
    // Plan types
    createPlanType,
    updatePlanType,
    deletePlanType,
    
    // Plan fields
    createPlanField,
    updatePlanField,
    deletePlanField,
    configurePlanTypeElements,
    
    // Report system
    fetchReportSystemConfig,
    updateReportSystemConfig,
    
    // Report templates
    fetchReportTemplates,
    createReportTemplate,
    updateReportTemplate,
    deleteReportTemplate,
    
    // Report versions
    createManagerReportVersion,
    updateManagerReportVersion,
    getNextVersionNumber,
    
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
