
import { useUser, useSupabaseClient } from "@supabase/auth-helpers-react";
import { Session } from "@supabase/supabase-js";
import { useState, useEffect } from "react";

import type { Database } from "@/integrations/supabase/types";

type Result<T> = { data: T | null; error: any };

export function useSupabaseData() {
  const [profile, setProfile] = useState<Database["public"]["Tables"]["profiles"]["Row"] | null>(null);
  const supabase = useSupabaseClient<Database>();
  const user = useUser();

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
  }, [user, supabase]);

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

  // Campus CRUD
  const fetchCampus = async (): Promise<Result<Database["public"]["Tables"]["campus"]["Row"][]>> => {
    const { data, error } = await supabase.from("campus").select("*").order("name");
    return { data, error };
  };

  const createCampus = async (campus: Database["public"]["Tables"]["campus"]["Insert"]): Promise<Result<Database["public"]["Tables"]["campus"]["Row"]>> => {
    const { data, error } = await supabase.from("campus").insert(campus).select().single();
    return { data, error };
  };

  const updateCampus = async (id: string, updates: Database["public"]["Tables"]["campus"]["Update"]): Promise<Result<Database["public"]["Tables"]["campus"]["Row"]>> => {
    const { data, error } = await supabase.from("campus").update(updates).eq("id", id).select().single();
    return { data, error };
  };

  const deleteCampus = async (id: string): Promise<Result<any>> => {
    const { data, error } = await supabase.from("campus").delete().eq("id", id);
    return { data, error };
  };

  // Faculties CRUD
  const fetchFaculties = async (): Promise<Result<Database["public"]["Tables"]["faculties"]["Row"][]>> => {
    const { data, error } = await supabase.from("faculties").select("*").order("name");
    return { data, error };
  };

  const createFaculty = async (faculty: Database["public"]["Tables"]["faculties"]["Insert"]): Promise<Result<Database["public"]["Tables"]["faculties"]["Row"]>> => {
    const { data, error } = await supabase.from("faculties").insert(faculty).select().single();
    return { data, error };
  };

  const updateFaculty = async (id: string, updates: Database["public"]["Tables"]["faculties"]["Update"]): Promise<Result<Database["public"]["Tables"]["faculties"]["Row"]>> => {
    const { data, error } = await supabase.from("faculties").update(updates).eq("id", id).select().single();
    return { data, error };
  };

  const deleteFaculty = async (id: string): Promise<Result<any>> => {
    const { data, error } = await supabase.from("faculties").delete().eq("id", id);
    return { data, error };
  };

  // Academic Programs CRUD
  const fetchPrograms = async (): Promise<Result<Database["public"]["Tables"]["academic_programs"]["Row"][]>> => {
    const { data, error } = await supabase.from("academic_programs").select("*").order("name");
    return { data, error };
  };

  const fetchAcademicPrograms = async (): Promise<Result<Database["public"]["Tables"]["academic_programs"]["Row"][]>> => {
    return fetchPrograms();
  };

  const createProgram = async (program: Database["public"]["Tables"]["academic_programs"]["Insert"]): Promise<Result<Database["public"]["Tables"]["academic_programs"]["Row"]>> => {
    const { data, error } = await supabase.from("academic_programs").insert(program).select().single();
    return { data, error };
  };

  const updateProgram = async (id: string, updates: Database["public"]["Tables"]["academic_programs"]["Update"]): Promise<Result<Database["public"]["Tables"]["academic_programs"]["Row"]>> => {
    const { data, error } = await supabase.from("academic_programs").update(updates).eq("id", id).select().single();
    return { data, error };
  };

  const deleteProgram = async (id: string): Promise<Result<any>> => {
    const { data, error } = await supabase.from("academic_programs").delete().eq("id", id);
    return { data, error };
  };

  // Strategic Axes CRUD
  const fetchStrategicAxes = async (): Promise<Result<Database["public"]["Tables"]["strategic_axes"]["Row"][]>> => {
    const { data, error } = await supabase.from("strategic_axes").select("*").order("name");
    return { data, error };
  };

  const createStrategicAxis = async (axis: Database["public"]["Tables"]["strategic_axes"]["Insert"]): Promise<Result<Database["public"]["Tables"]["strategic_axes"]["Row"]>> => {
    const { data, error } = await supabase.from("strategic_axes").insert(axis).select().single();
    return { data, error };
  };

  const updateStrategicAxis = async (id: string, updates: Database["public"]["Tables"]["strategic_axes"]["Update"]): Promise<Result<Database["public"]["Tables"]["strategic_axes"]["Row"]>> => {
    const { data, error } = await supabase.from("strategic_axes").update(updates).eq("id", id).select().single();
    return { data, error };
  };

  const deleteStrategicAxis = async (id: string): Promise<Result<any>> => {
    const { data, error } = await supabase.from("strategic_axes").delete().eq("id", id);
    return { data, error };
  };

  // Actions CRUD
  const fetchActions = async (): Promise<Result<Database["public"]["Tables"]["actions"]["Row"][]>> => {
    const { data, error } = await supabase.from("actions").select("*").order("name");
    return { data, error };
  };

  const createAction = async (action: Database["public"]["Tables"]["actions"]["Insert"]): Promise<Result<Database["public"]["Tables"]["actions"]["Row"]>> => {
    const { data, error } = await supabase.from("actions").insert(action).select().single();
    return { data, error };
  };

  const updateAction = async (id: string, updates: Database["public"]["Tables"]["actions"]["Update"]): Promise<Result<Database["public"]["Tables"]["actions"]["Row"]>> => {
    const { data, error } = await supabase.from("actions").update(updates).eq("id", id).select().single();
    return { data, error };
  };

  const deleteAction = async (id: string): Promise<Result<any>> => {
    const { data, error } = await supabase.from("actions").delete().eq("id", id);
    return { data, error };
  };

  // Products CRUD
  const fetchProducts = async (): Promise<Result<Database["public"]["Tables"]["products"]["Row"][]>> => {
    const { data, error } = await supabase.from("products").select("*").order("name");
    return { data, error };
  };

  const createProduct = async (product: Database["public"]["Tables"]["products"]["Insert"]): Promise<Result<Database["public"]["Tables"]["products"]["Row"]>> => {
    const { data, error } = await supabase.from("products").insert(product).select().single();
    return { data, error };
  };

  const updateProduct = async (id: string, updates: Database["public"]["Tables"]["products"]["Update"]): Promise<Result<Database["public"]["Tables"]["products"]["Row"]>> => {
    const { data, error } = await supabase.from("products").update(updates).eq("id", id).select().single();
    return { data, error };
  };

  const deleteProduct = async (id: string): Promise<Result<any>> => {
    const { data, error } = await supabase.from("products").delete().eq("id", id);
    return { data, error };
  };

  // Managers CRUD
  const fetchManagers = async (): Promise<Result<Database["public"]["Tables"]["profiles"]["Row"][]>> => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", "Gestor")
      .order("full_name");
    return { data, error };
  };

  // Work Plans CRUD
  const fetchWorkPlans = async (): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from("custom_plans")
      .select(`
        *,
        manager:profiles!custom_plans_manager_id_fkey(*)
      `)
      .order("created_at", { ascending: false });
    return { data, error };
  };

  // Manager Reports CRUD
  const fetchManagerReports = async (): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from("manager_reports")
      .select(`
        *,
        manager:profiles!manager_reports_manager_id_fkey(*),
        report_period:report_periods(*),
        work_plan:custom_plans!manager_reports_work_plan_id_fkey(*)
      `)
      .order("created_at", { ascending: false });
    return { data, error };
  };

  const updateManagerReport = async (id: string, updates: Database["public"]["Tables"]["manager_reports"]["Update"]): Promise<Result<Database["public"]["Tables"]["manager_reports"]["Row"]>> => {
    const { data, error } = await supabase
      .from("manager_reports")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    return { data, error };
  };

  // Report Periods CRUD
  const fetchReportPeriods = async (): Promise<Result<Database["public"]["Tables"]["report_periods"]["Row"][]>> => {
    const { data, error } = await supabase
      .from("report_periods")
      .select("*")
      .order("start_date", { ascending: false });
    return { data, error };
  };

  const createReportPeriod = async (period: Database["public"]["Tables"]["report_periods"]["Insert"]): Promise<Result<Database["public"]["Tables"]["report_periods"]["Row"]>> => {
    const { data, error } = await supabase.from("report_periods").insert(period).select().single();
    return { data, error };
  };

  const updateReportPeriod = async (id: string, updates: Database["public"]["Tables"]["report_periods"]["Update"]): Promise<Result<Database["public"]["Tables"]["report_periods"]["Row"]>> => {
    const { data, error } = await supabase.from("report_periods").update(updates).eq("id", id).select().single();
    return { data, error };
  };

  const deleteReportPeriod = async (id: string): Promise<Result<any>> => {
    const { data, error } = await supabase.from("report_periods").delete().eq("id", id);
    return { data, error };
  };

  // Document Templates CRUD
  const fetchDocumentTemplates = async (): Promise<Result<Database["public"]["Tables"]["document_templates"]["Row"][]>> => {
    const { data, error } = await supabase
      .from("document_templates")
      .select("*")
      .eq("is_active", true)
      .order("name");
    return { data, error };
  };

  // Función auxiliar para crear funciones CRUD genéricas para tablas SNIES
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

  // Funciones SNIES existentes
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

  // Crear funciones para las nuevas tablas SNIES
  const sniesEducationLevels = createSniesTableFunctions('snies_education_levels');
  const sniesModalities = createSniesTableFunctions('snies_modalities');
  const sniesMethodologies = createSniesTableFunctions('snies_methodologies');
  const sniesKnowledgeAreas = createSniesTableFunctions('snies_knowledge_areas');
  const sniesInstitutions = createSniesTableFunctions('snies_institutions');

  // Funciones para crear datos SNIES (corregir problemas de importación)
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
    // First delete existing data
    await supabase
      .from('snies_report_data')
      .delete()
      .eq('report_id', reportId);

    // Then insert new data
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
    // Get all submitted reports for this template
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

    // Consolidate all data
    let consolidatedData: any[] = [];
    reports?.forEach(report => {
      if (report.snies_report_data) {
        report.snies_report_data.forEach((dataRow: any) => {
          consolidatedData.push(dataRow.field_data);
        });
      }
    });

    // Create consolidated report record
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
    fetchCampus,
    createCampus,
    updateCampus,
    deleteCampus,
    
    // Faculties
    fetchFaculties,
    createFaculty,
    updateFaculty,
    deleteFaculty,
    
    // Academic Programs
    fetchPrograms,
    fetchAcademicPrograms,
    createProgram,
    updateProgram,
    deleteProgram,
    
    // Strategic Axes
    fetchStrategicAxes,
    createStrategicAxis,
    updateStrategicAxis,
    deleteStrategicAxis,
    
    // Actions
    fetchActions,
    createAction,
    updateAction,
    deleteAction,
    
    // Products
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    
    // Managers
    fetchManagers,
    
    // Work Plans
    fetchWorkPlans,
    
    // Manager Reports
    fetchManagerReports,
    updateManagerReport,
    
    // Report Periods
    fetchReportPeriods,
    createReportPeriod,
    updateReportPeriod,
    deleteReportPeriod,
    
    // Document Templates
    fetchDocumentTemplates,
    
    // Funciones SNIES existentes
    fetchSniesCountries,
    fetchSniesMunicipalities,
    fetchSniesDocumentTypes,
    fetchSniesBiologicalSex,
    fetchSniesMaritalStatus,
    createSniesCountry,
    bulkCreateSniesCountries,
    createSniesMunicipality,
    bulkCreateSniesMunicipalities,
    
    // Nuevas funciones SNIES
    fetchSniesEducationLevels: sniesEducationLevels.fetch,
    createSniesEducationLevel: sniesEducationLevels.create,
    bulkCreateSniesEducationLevels: sniesEducationLevels.bulkCreate,
    updateSniesEducationLevel: sniesEducationLevels.update,
    deleteSniesEducationLevel: sniesEducationLevels.delete,
    
    fetchSniesModalities: sniesModalities.fetch,
    createSniesModality: sniesModalities.create,
    bulkCreateSniesModalities: sniesModalities.bulkCreate,
    updateSniesModality: sniesModalities.update,
    deleteSniesModality: sniesModalities.delete,
    
    fetchSniesMethodologies: sniesMethodologies.fetch,
    createSniesMethodology: sniesMethodologies.create,
    bulkCreateSniesMethodologies: sniesMethodologies.bulkCreate,
    updateSniesMethodology: sniesMethodologies.update,
    deleteSniesMethodology: sniesMethodologies.delete,
    
    fetchSniesKnowledgeAreas: sniesKnowledgeAreas.fetch,
    createSniesKnowledgeArea: sniesKnowledgeAreas.create,
    bulkCreateSniesKnowledgeAreas: sniesKnowledgeAreas.bulkCreate,
    updateSniesKnowledgeArea: sniesKnowledgeAreas.update,
    deleteSniesKnowledgeArea: sniesKnowledgeAreas.delete,
    
    fetchSniesInstitutions: sniesInstitutions.fetch,
    createSniesInstitution: sniesInstitutions.create,
    bulkCreateSniesInstitutions: sniesInstitutions.bulkCreate,
    updateSniesInstitution: sniesInstitutions.update,
    deleteSniesInstitution: sniesInstitutions.delete,
    
    // Funciones de reportes SNIES
    fetchSniesReportData,
    saveSniesReportData,
    consolidateSniesReports
  };
}
