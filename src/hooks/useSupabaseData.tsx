import { supabase } from "@/integrations/supabase/client";
import { useStrategicAxes } from "./useStrategicAxes";
import { useActions } from "./useActions";
import { useProducts } from "./useProducts";
import { useCampus } from "./useCampus";
import { useFaculties } from "./useFaculties";
import { useManagers } from "./useManagers";
import { useReports } from "./useReports";
import { useWorkPlans } from "./useWorkPlans";
import { useCustomPlanAssignments } from "./useCustomPlanAssignments"; // <- Renombrado
import { useAcademicPrograms } from "./useAcademicPrograms";
import { usePlanTypes } from "./usePlanTypes";
import { useCustomPlans } from "./useCustomPlans";
import { useIndicators } from "./useIndicators";
import { useDocumentTemplates } from "./useDocumentTemplates";
import { useTemplateReports } from "./useTemplateReports";
import { useReportPeriods } from "./useReportPeriods";
import { useUsers } from "./useUsers";
import { useFileUpload } from "./useFileUpload";
import { useSnies } from "./useSnies";
import type { StrategicAxis, Action, Product, Result } from "@/types/supabase";

// Re-export types that components need
export type { StrategicAxis, Action, Product };

export interface DocumentTemplate {
  id: string;
  name: string;
  description?: string;
  template_content: string;
  template_type: string;
  file_name?: string;
  file_url?: string;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  strategic_axes_ids?: string[];
  actions_ids?: string[];
  products_ids?: string[];
  sharepoint_base_url?: string;
  max_versions?: number;
}

export interface ReportTemplate {
  id: string;
  name: string;
  description?: string;
  template_content: string;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  strategic_axes_ids?: string[];
  actions_ids?: string[];
  products_ids?: string[];
  sharepoint_base_url?: string;
  max_versions?: number;
}

export interface ManagerReportVersion {
  id: string;
  manager_report_id: string;
  template_id: string;
  version_number: number;
  content: any;
  created_at: string;
  progress_percentage?: number;
  sharepoint_folder_url?: string;
  evidence_links?: string[];
  observations?: string;
  submitted_at?: string;
}

export interface SniesReportTemplate {
  id: string;
  name: string;
  description?: string;
  template_structure: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useSupabaseData() {
  // Import all the specialized hooks
  const strategicAxes = useStrategicAxes();
  const actions = useActions();
  const products = useProducts();
  const campus = useCampus();
  const faculties = useFaculties();
  const managers = useManagers();
  const reports = useReports();
  const workPlans = useWorkPlans();
  const customPlanAssignments = useCustomPlanAssignments(); // <- Se usa el nombre corregido aquí
  const academicPrograms = useAcademicPrograms();
  const planTypes = usePlanTypes();
  const customPlans = useCustomPlans();
  const indicators = useIndicators();
  const documentTemplates = useDocumentTemplates();
  const templateReports = useTemplateReports();
  const reportPeriods = useReportPeriods();
  const users = useUsers();
  const fileUpload = useFileUpload();
  const snies = useSnies();

  // Return all functions from specialized hooks
  const savePlanElementOrder = async (orderData: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("plan_type_element_order")
      .upsert(orderData, {
        onConflict: "plan_type_id,element_type,element_id"
      })
      .select()
      .single();
    return { data, error };
  };

  const fetchPlanElementOrder = async (planTypeId: string): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from("plan_type_element_order")
      .select("*")
      .eq("plan_type_id", planTypeId)
      .order("display_order");
    return { data, error };
  };

  return {
    ...strategicAxes,
    ...actions,
    ...products,
    ...campus,
    ...faculties,
    ...managers,
    ...reports,
    ...workPlans,
    ...customPlanAssignments, // <- ¡Aquí se re-exporta!
    ...academicPrograms,
    ...planTypes,
    ...customPlans,
    ...indicators,
    ...documentTemplates,
    ...templateReports,
    ...reportPeriods,
    ...users,
    ...fileUpload,
    ...snies,
    savePlanElementOrder,
    fetchPlanElementOrder,
  };
}
