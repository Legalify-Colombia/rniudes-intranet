export interface Profile {
  id: string;
  created_at: string;
  updated_at: string;
  full_name: string;
  avatar_url: string;
  role: "Administrador" | "Coordinador" | "Gestor";
  email: string;
}

export interface StrategicAxis {
  id: string;
  created_at: string;
  updated_at: string;
  code: string;
  name: string;
  created_by: string;
}

export interface Action {
  id: string;
  created_at: string;
  updated_at: string;
  code: string;
  name: string;
  strategic_axis_id: string;
  created_by: string;
  strategic_axis?: StrategicAxis;
}

export interface Product {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  action_id: string;
  created_by: string;
  action?: Action;
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
