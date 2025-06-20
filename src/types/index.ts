export interface Profile {
  id: string;
  created_at: string;
  updated_at: string;
  full_name: string;
  document_number: string;
  email: string;
  position: string;
  role: "Administrador" | "Coordinador" | "Gestor";
  weekly_hours?: number;
  number_of_weeks?: number;
  total_hours?: number;
  campus_id?: string;
  managed_campus_ids?: string[];
  campus?: {
    name: string;
  };
}

export interface StrategicAxis {
  id: string;
  code: string;
  name: string;
  description?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  usage_type?: string[];
}

export interface Action {
  id: string;
  code: string;
  name: string;
  description?: string;
  strategic_axis_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  usage_type?: string[];
  strategic_axis?: StrategicAxis;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  action_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  usage_type?: string[];
  action?: Action & {
    strategic_axis?: StrategicAxis;
  };
}

export interface Program {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  faculty_id: string;
  is_active: boolean;
}

export interface Faculty {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  campus_id: string;
  is_active: boolean;
}

export interface Campus {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  is_active: boolean;
}

export interface Manager {
  id: string;
  created_at: string;
  updated_at: string;
  profile_id: string;
  program_id: string;
  weekly_hours: number;
  total_hours: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  profile?: Profile;
  program?: Program;
}

export interface ManagerReport {
  id: string;
  created_at: string;
  updated_at: string;
  manager_id: string;
  program_id: string;
  period: string;
  total_progress: number;
  submitted_date: string;
  approved_date: string;
  is_approved: boolean;
  manager?: Manager;
  program?: Program;
}

export interface WorkPlan {
  id: string;
  created_at: string;
  updated_at: string;
  manager_id: string;
  objectives: string;
  total_hours: number;
  status: string;
  submitted_date: string;
  approved_date: string;
  is_approved: boolean;
  manager?: Manager;
}

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  strategic_axes_ids: string[];
  actions_ids: string[];
  products_ids: string[];
  sharepoint_base_url: string;
  max_versions: number;
  is_active: boolean;
}

export interface DocumentTemplate {
  id: string;
  name: string;
  description: string;
  template_type: "pdf" | "doc";
  template_content: string;
  file_url: string;
  file_name: string;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Indicator {
  id: string;
  name: string;
  data_type: "numeric" | "short_text" | "long_text" | "file" | "link";
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface IndicatorReport {
  id: string;
  created_at: string;
  updated_at: string;
  manager_id: string;
  report_period_id: string;
  title: string;
  description: string;
  status: "draft" | "submitted" | "reviewed";
  submitted_date: string;
  reviewed_date: string;
  reviewed_by: string;
}

export interface IndicatorResponse {
  id: string;
  created_at: string;
  updated_at: string;
  indicator_report_id: string;
  indicator_id: string;
  numeric_value: number;
  text_value: string;
  file_url: string;
  file_name: string;
  link_value: string;
  observations: string;
}

export interface UnifiedReport {
  id: string;
  report_type: "work_plan" | "template" | "indicators";
  manager_id: string;
  title: string;
  description: string;
  status: "draft" | "submitted" | "reviewed";
  submitted_date: string;
  created_at: string;
  updated_at: string;
  report_period_id: string | null;
  type_display_name: string;
}

export interface PlanType {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  min_weekly_hours: number;
  max_weekly_hours: number | null;
  is_visible: boolean;
}

export interface PlanField {
  id: string;
  plan_type_id: string;
  field_name: string;
  field_type: "numeric" | "short_text" | "long_text" | "dropdown" | "file" | "section" | "manager_name" | "campus_name" | "program_director" | "strategic_axes";
  dropdown_options?: any;
  is_required: boolean;
  field_order: number;
  created_at: string;
}

export interface CustomPlan {
  id: string;
  plan_type_id: string;
  manager_id: string;
  title: string;
  status: "draft" | "submitted" | "approved" | "rejected";
  submitted_date?: string;
  approved_date?: string;
  approved_by?: string;
  approval_comments?: string;
  created_at: string;
  updated_at: string;
  plan_type?: PlanType;
  responses?: CustomPlanResponse[];
  assignments?: CustomPlanAssignment[];
}

export interface CustomPlanResponse {
  id: string;
  custom_plan_id: string;
  plan_field_id: string;
  response_value?: any;
  file_url?: string;
  file_name?: string;
  created_at: string;
  updated_at: string;
  plan_field?: PlanField;
}

export interface CustomPlanAssignment {
  id: string;
  custom_plan_id: string;
  strategic_axis_id?: string;
  action_id?: string;
  product_id?: string;
  assigned_hours: number;
  created_at: string;
  strategic_axis?: StrategicAxis;
  action?: Action;
  product?: Product;
}

export interface PlanTypeConfiguration {
  strategic_axes: string[];
  actions: string[];
  products: string[];
}
