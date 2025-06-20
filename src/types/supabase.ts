

import type { Database } from "@/integrations/supabase/types";

export type Campus = Database["public"]["Tables"]["campus"]["Row"];
export type Faculty = Database["public"]["Tables"]["faculties"]["Row"];
export type AcademicProgram = Database["public"]["Tables"]["academic_programs"]["Row"];
export type DocumentTemplate = Database["public"]["Tables"]["document_templates"]["Row"];
export type StrategicAxis = Database["public"]["Tables"]["strategic_axes"]["Row"];
export type Action = Database["public"]["Tables"]["actions"]["Row"];
export type Product = Database["public"]["Tables"]["products"]["Row"];
export type ReportPeriod = Database["public"]["Tables"]["report_periods"]["Row"];
export type ManagerReport = Database["public"]["Tables"]["manager_reports"]["Row"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type CustomPlan = Database["public"]["Tables"]["custom_plans"]["Row"];
export type Indicator = Database["public"]["Tables"]["indicators"]["Row"];
export type IndicatorReport = Database["public"]["Tables"]["indicator_reports"]["Row"];
export type ReportTemplate = Database["public"]["Tables"]["report_templates"]["Row"];
export type ManagerReportVersion = Database["public"]["Tables"]["manager_report_versions"]["Row"];

// SNIES types
export type SniesReport = {
  id: string;
  template_id: string;
  manager_id: string;
  title: string;
  status: string;
  created_at: string;
  updated_at: string;
  submitted_date?: string;
};

export type SniesReportTemplate = {
  id: string;
  name: string;
  description?: string;
  fields: any[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type SniesTemplateField = {
  id: string;
  template_id: string;
  field_name: string;
  field_type: string;
  field_order: number;
  is_required: boolean;
  field_options?: any;
  created_at: string;
  updated_at: string;
};

export type Result<T> = { data: T | null; error: any };

