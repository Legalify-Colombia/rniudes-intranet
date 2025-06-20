// Strategic configuration types
export interface StrategicAxis {
  id: string;
  name: string;
  description?: string;
  code: string;
  usage_type?: string[];
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Action {
  id: string;
  name: string;
  description?: string;
  code: string;
  strategic_axis_id: string;
  usage_type?: string[];
  created_by: string;
  created_at: string;
  updated_at: string;
  strategic_axes?: StrategicAxis;
  strategic_axis?: StrategicAxis;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  action_id: string;
  usage_type?: string[];
  created_by: string;
  created_at: string;
  updated_at: string;
  actions?: Action;
  action?: Action;
}

// Campus and academic types
export interface Campus {
  id: string;
  name: string;
  address: string;
  created_at: string;
  updated_at: string;
}

export interface Faculty {
  id: string;
  name: string;
  dean_name: string;
  campus_id: string;
  created_at: string;
  updated_at: string;
  campus?: Campus;
  faculty_campus?: Array<{
    campus: Campus;
  }>;
}

export interface AcademicProgram {
  id: string;
  name: string;
  campus_id: string;
  faculty_id: string;
  director_name: string;
  director_email: string;
  manager_id?: string;
  snies_code?: string;
  level?: string;
  created_at: string;
  updated_at: string;
  campus?: Campus;
  faculty?: Faculty;
  faculties?: Faculty;
  manager?: {
    id: string;
    full_name: string;
    email: string;
  };
}

// User and profile types
export interface Profile {
  id: string;
  email: string;
  full_name: string;
  document_number: string;
  position: string;
  role: 'Administrador' | 'Gestor' | 'Usuario' | 'Coordinador';
  campus_id?: string;
  managed_campus_ids?: string[];
  weekly_hours?: number;
  number_of_weeks?: number;
  total_hours?: number;
  created_at: string;
  updated_at: string;
  campus?: Campus;
}

// Report types
export interface ReportPeriod {
  id: string;
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ManagerReport {
  id: string;
  manager_id: string;
  work_plan_id: string;
  report_period_id?: string;
  title: string;
  description?: string;
  status: 'draft' | 'submitted' | 'reviewed';
  total_progress_percentage?: number;
  completion_percentage?: number;
  requires_improvement_plan?: boolean;
  submitted_date?: string;
  approved_date?: string;
  approved_by?: string;
  approval_comments?: string;
  created_at: string;
  updated_at: string;
  report_periods?: ReportPeriod;
  report_period?: ReportPeriod;
  manager?: Profile;
  work_plan?: any;
}

export interface ProductProgressReport {
  id: string;
  manager_report_id: string;
  product_id: string;
  work_plan_assignment_id: string;
  progress_percentage: number;
  observations?: string;
  evidence_files?: string[];
  evidence_file_names?: string[];
  created_at: string;
  updated_at: string;
}

// Document template types
export interface DocumentTemplate {
  id: string;
  name: string;
  description?: string;
  template_type: 'pdf' | 'doc';
  template_content: string;
  file_url?: string;
  file_name?: string;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// Report template types
export interface ReportTemplate {
  id: string;
  name: string;
  description?: string;
  strategic_axis_id?: string;
  action_id?: string;
  product_id?: string;
  strategic_axes_ids?: string[];
  actions_ids?: string[];
  products_ids?: string[];
  sharepoint_base_url?: string;
  is_active: boolean;
  max_versions: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ManagerReportVersion {
  id: string;
  manager_report_id?: string;
  template_id?: string;
  version_number: number;
  progress_percentage?: number;
  observations?: string;
  evidence_links?: string[];
  sharepoint_folder_url?: string;
  submitted_at?: string;
  created_at: string;
  updated_at: string;
}

// Specific lines and indicators
export interface SpecificLine {
  id: string;
  title: string;
  description?: string;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Indicator {
  id: string;
  name: string;
  data_type: 'numeric' | 'link' | 'file' | 'short_text' | 'long_text';
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// Internationalization types
export interface InternationalizationProject {
  id: string;
  project_title: string;
  project_summary?: string;
  introduction?: string;
  general_objective: string;
  specific_objectives: string[];
  methodology: string;
  activities_schedule: string;
  duration_months: number;
  schedule_description: string;
  justification?: string;
  bibliography: string;
  beneficiaries_description?: string;
  impact?: string;
  indicators_text?: string;
  results?: string;
  strategic_axis_id: string;
  specific_line_id: string;
  program_id: string;
  manager_id: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  submitted_date?: string;
  approved_date?: string;
  approved_by?: string;
  approval_comments?: string;
  participation_letter_url?: string;
  participation_letter_name?: string;
  created_at: string;
  updated_at: string;
  strategic_axes?: StrategicAxis;
  specific_lines?: SpecificLine;
  academic_programs?: AcademicProgram;
}

export interface ProjectPartnerInstitution {
  id: string;
  project_id: string;
  institution_name: string;
  institution_country: string;
  contact_person: string;
  contact_email: string;
  collaboration_type: string;
  country: string;
  contact_professor_name: string;
  contact_professor_email: string;
  created_at: string;
}

export interface InternationalizationReport {
  id: string;
  project_id: string;
  report_period_id: string;
  manager_id: string;
  objectives_achieved: string;
  activities_executed: string;
  activities_in_progress: string;
  project_timing: 'ahead' | 'on_time' | 'delayed';
  project_status?: string;
  abnormal_reason?: string;
  difficulties: string[];
  next_period_activities?: string;
  observations?: string;
  status: 'draft' | 'submitted' | 'reviewed';
  submitted_date?: string;
  reviewed_date?: string;
  reviewed_by?: string;
  created_at: string;
  updated_at: string;
  internationalization_projects?: InternationalizationProject;
  report_periods?: ReportPeriod;
}

// Template based reports
export interface TemplateBasedReport {
  id: string;
  report_template_id: string;
  report_period_id: string;
  manager_id: string;
  title: string;
  description?: string;
  status: 'draft' | 'submitted' | 'reviewed';
  submitted_date?: string;
  reviewed_date?: string;
  reviewed_by?: string;
  created_at: string;
  updated_at: string;
}

export interface TemplateReportResponse {
  id: string;
  template_report_id: string;
  strategic_axis_id?: string;
  action_id?: string;
  product_id?: string;
  response_text?: string;
  progress_percentage?: number;
  observations?: string;
  evidence_files?: string[];
  evidence_file_names?: string[];
  created_at: string;
  updated_at: string;
}

// Report system config
export interface ReportSystemConfig {
  id: string;
  reports_enabled: boolean;
  max_reports_per_period: number;
  auto_calculate_progress: boolean;
  require_evidence: boolean;
  created_at: string;
  updated_at: string;
}

// Work plan types
export interface WorkPlan {
  id: string;
  manager_id: string;
  program_id: string;
  objectives?: string;
  total_hours_assigned: number;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  comments?: string;
  coordinator_comments?: string;
  approval_comments?: string;
  submitted_date?: string;
  approved_date?: string;
  coordinator_approval_date?: string;
  approved_by?: string;
  created_at: string;
  updated_at: string;
}

export interface WorkPlanAssignment {
  id: string;
  work_plan_id: string;
  product_id: string;
  assigned_hours: number;
  created_at: string;
  updated_at: string;
  product?: Product;
}
