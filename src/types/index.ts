
// Strategic configuration types
export interface StrategicAxis {
  id: string;
  name: string;
  description: string;
  usage_type: 'gestores' | 'internacionalizacion';
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Action {
  id: string;
  name: string;
  description: string;
  strategic_axis_id: string;
  usage_type: 'gestores' | 'internacionalizacion';
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  action_id: string;
  usage_type: 'gestores' | 'internacionalizacion';
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// Campus and academic types
export interface AcademicProgram {
  id: string;
  name: string;
  snies_code: string;
  level: string;
  campus_id: string;
  faculty_id: string;
  created_at: string;
  updated_at: string;
  campus?: {
    id: string;
    name: string;
    address: string;
  };
  faculties?: {
    id: string;
    name: string;
    dean_name: string;
  };
}

// User and profile types
export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: 'Administrador' | 'Gestor' | 'Usuario';
  campus_id?: string;
  managed_campus_ids?: string[];
  weekly_hours?: number;
  number_of_weeks?: number;
  total_hours?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  campus?: {
    id: string;
    name: string;
    address: string;
  };
}

// Report types
export interface ReportPeriod {
  id: string;
  name: string;
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
  report_period_id: string;
  status: 'draft' | 'submitted' | 'approved';
  submitted_date?: string;
  approved_date?: string;
  approved_by?: string;
  approval_comments?: string;
  created_at: string;
  updated_at: string;
  report_periods?: ReportPeriod;
}

export interface ProductProgressReport {
  id: string;
  manager_report_id: string;
  product_id: string;
  progress_percentage: number;
  activities_description: string;
  difficulties?: string;
  evidence_files?: string[];
  created_at: string;
  updated_at: string;
}

// Internationalization types
export interface InternationalizationProject {
  id: string;
  project_title: string;
  general_objective: string;
  specific_objectives: string[];
  methodology: string;
  activities_schedule: string;
  duration_months: number;
  schedule_description: string;
  justification: string;
  bibliography: string;
  beneficiaries_description: string;
  strategic_axis_id: string;
  specific_line_id: string;
  program_id: string;
  manager_id: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  submitted_date?: string;
  approved_date?: string;
  approved_by?: string;
  approval_comments?: string;
  proposal_file_url?: string;
  proposal_file_name?: string;
  participation_letter_url?: string;
  participation_letter_name?: string;
  created_at: string;
  updated_at: string;
  strategic_axes?: StrategicAxis;
  specific_lines?: {
    id: string;
    title: string;
    description: string;
  };
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
  abnormal_reason?: string;
  difficulties: string[];
  evidence_files: string[];
  next_period_activities: string;
  observations?: string;
  status: 'draft' | 'submitted' | 'approved';
  submitted_date?: string;
  approved_date?: string;
  approved_by?: string;
  approval_comments?: string;
  created_at: string;
  updated_at: string;
  internationalization_projects?: InternationalizationProject;
  report_periods?: ReportPeriod;
}
