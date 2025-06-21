
import { useStrategicAxes } from "./useStrategicAxes";
import { useActions } from "./useActions";
import { useProducts } from "./useProducts";
import { useCampus } from "./useCampus";
import { useFaculties } from "./useFaculties";
import { useManagers } from "./useManagers";
import { useReports } from "./useReports";
import { useWorkPlans } from "./useWorkPlans";
import { useWorkPlanAssignments } from "./useWorkPlanAssignments";
import { useAcademicPrograms } from "./useAcademicPrograms";
import { usePlanTypes } from "./usePlanTypes";
import { useIndicators } from "./useIndicators";
import { useDocumentTemplates } from "./useDocumentTemplates";
import { useTemplateReports } from "./useTemplateReports";
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
  const workPlanAssignments = useWorkPlanAssignments();
  const academicPrograms = useAcademicPrograms();
  const planTypes = usePlanTypes();
  const indicators = useIndicators();
  const documentTemplates = useDocumentTemplates();
  const templateReports = useTemplateReports();
  const users = useUsers();
  const fileUpload = useFileUpload();
  const snies = useSnies();

  // Return all functions from specialized hooks
  return {
    // Strategic Axes
    ...strategicAxes,
    
    // Actions
    ...actions,
    
    // Products
    ...products,
    
    // Campus
    ...campus,
    
    // Faculties
    ...faculties,
    
    // Managers
    ...managers,
    
    // Reports
    ...reports,
    
    // Work Plans
    ...workPlans,
    
    // Work Plan Assignments
    ...workPlanAssignments,
    
    // Academic Programs
    ...academicPrograms,
    
    // Plan Types
    ...planTypes,
    
    // Indicators
    ...indicators,
    
    // Document Templates
    ...documentTemplates,
    
    // Template Reports
    ...templateReports,
    
    // Users
    ...users,
    
    // File Upload
    ...fileUpload,
    
    // SNIES
    ...snies,
  };
}
