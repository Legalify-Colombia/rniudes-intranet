export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      academic_programs: {
        Row: {
          campus_id: string
          created_at: string | null
          director_email: string
          director_name: string
          faculty_id: string
          id: string
          manager_id: string | null
          name: string
          updated_at: string | null
        }
        Insert: {
          campus_id: string
          created_at?: string | null
          director_email: string
          director_name: string
          faculty_id: string
          id?: string
          manager_id?: string | null
          name: string
          updated_at?: string | null
        }
        Update: {
          campus_id?: string
          created_at?: string | null
          director_email?: string
          director_name?: string
          faculty_id?: string
          id?: string
          manager_id?: string | null
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "academic_programs_campus_id_fkey"
            columns: ["campus_id"]
            isOneToOne: false
            referencedRelation: "campus"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "academic_programs_faculty_id_fkey"
            columns: ["faculty_id"]
            isOneToOne: false
            referencedRelation: "faculties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "academic_programs_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      actions: {
        Row: {
          code: string
          created_at: string | null
          created_by: string
          id: string
          name: string
          strategic_axis_id: string
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          created_by: string
          id?: string
          name: string
          strategic_axis_id: string
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          created_by?: string
          id?: string
          name?: string
          strategic_axis_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "actions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "actions_strategic_axis_id_fkey"
            columns: ["strategic_axis_id"]
            isOneToOne: false
            referencedRelation: "strategic_axes"
            referencedColumns: ["id"]
          },
        ]
      }
      campus: {
        Row: {
          address: string
          created_at: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          address: string
          created_at?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          address?: string
          created_at?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      faculties: {
        Row: {
          campus_id: string
          created_at: string | null
          dean_name: string
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          campus_id: string
          created_at?: string | null
          dean_name: string
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          campus_id?: string
          created_at?: string | null
          dean_name?: string
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "faculties_campus_id_fkey"
            columns: ["campus_id"]
            isOneToOne: false
            referencedRelation: "campus"
            referencedColumns: ["id"]
          },
        ]
      }
      faculty_campus: {
        Row: {
          campus_id: string
          created_at: string | null
          faculty_id: string
          id: string
        }
        Insert: {
          campus_id: string
          created_at?: string | null
          faculty_id: string
          id?: string
        }
        Update: {
          campus_id?: string
          created_at?: string | null
          faculty_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "faculty_campus_campus_id_fkey"
            columns: ["campus_id"]
            isOneToOne: false
            referencedRelation: "campus"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "faculty_campus_faculty_id_fkey"
            columns: ["faculty_id"]
            isOneToOne: false
            referencedRelation: "faculties"
            referencedColumns: ["id"]
          },
        ]
      }
      manager_report_versions: {
        Row: {
          created_at: string | null
          evidence_links: string[] | null
          id: string
          manager_report_id: string | null
          observations: string | null
          progress_percentage: number | null
          sharepoint_folder_url: string | null
          submitted_at: string | null
          template_id: string | null
          updated_at: string | null
          version_number: number
        }
        Insert: {
          created_at?: string | null
          evidence_links?: string[] | null
          id?: string
          manager_report_id?: string | null
          observations?: string | null
          progress_percentage?: number | null
          sharepoint_folder_url?: string | null
          submitted_at?: string | null
          template_id?: string | null
          updated_at?: string | null
          version_number?: number
        }
        Update: {
          created_at?: string | null
          evidence_links?: string[] | null
          id?: string
          manager_report_id?: string | null
          observations?: string | null
          progress_percentage?: number | null
          sharepoint_folder_url?: string | null
          submitted_at?: string | null
          template_id?: string | null
          updated_at?: string | null
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "manager_report_versions_manager_report_id_fkey"
            columns: ["manager_report_id"]
            isOneToOne: false
            referencedRelation: "manager_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "manager_report_versions_manager_report_id_fkey"
            columns: ["manager_report_id"]
            isOneToOne: false
            referencedRelation: "vw_full_report_data"
            referencedColumns: ["report_id"]
          },
          {
            foreignKeyName: "manager_report_versions_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "report_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      manager_reports: {
        Row: {
          created_at: string | null
          description: string | null
          general_report_file_name: string | null
          general_report_url: string | null
          id: string
          manager_id: string
          report_period_id: string | null
          status: string | null
          submitted_date: string | null
          title: string
          total_progress_percentage: number | null
          updated_at: string | null
          work_plan_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          general_report_file_name?: string | null
          general_report_url?: string | null
          id?: string
          manager_id: string
          report_period_id?: string | null
          status?: string | null
          submitted_date?: string | null
          title: string
          total_progress_percentage?: number | null
          updated_at?: string | null
          work_plan_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          general_report_file_name?: string | null
          general_report_url?: string | null
          id?: string
          manager_id?: string
          report_period_id?: string | null
          status?: string | null
          submitted_date?: string | null
          title?: string
          total_progress_percentage?: number | null
          updated_at?: string | null
          work_plan_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "manager_reports_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "manager_reports_report_period_id_fkey"
            columns: ["report_period_id"]
            isOneToOne: false
            referencedRelation: "report_periods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "manager_reports_work_plan_id_fkey"
            columns: ["work_plan_id"]
            isOneToOne: true
            referencedRelation: "vw_full_report_data"
            referencedColumns: ["work_plan_id"]
          },
          {
            foreignKeyName: "manager_reports_work_plan_id_fkey"
            columns: ["work_plan_id"]
            isOneToOne: true
            referencedRelation: "work_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "manager_reports_work_plan_id_fkey"
            columns: ["work_plan_id"]
            isOneToOne: true
            referencedRelation: "work_plans_with_manager"
            referencedColumns: ["id"]
          },
        ]
      }
      preliminary_reports: {
        Row: {
          assignment_id: string
          created_at: string
          delivery_date: string
          evidence_files: string[] | null
          id: string
          observations: string | null
          progress_percentage: number
          updated_at: string
        }
        Insert: {
          assignment_id: string
          created_at?: string
          delivery_date?: string
          evidence_files?: string[] | null
          id?: string
          observations?: string | null
          progress_percentage?: number
          updated_at?: string
        }
        Update: {
          assignment_id?: string
          created_at?: string
          delivery_date?: string
          evidence_files?: string[] | null
          id?: string
          observations?: string | null
          progress_percentage?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "preliminary_reports_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "vw_full_report_data"
            referencedColumns: ["assignment_id"]
          },
          {
            foreignKeyName: "preliminary_reports_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "work_plan_assignments"
            referencedColumns: ["id"]
          },
        ]
      }
      product_progress_reports: {
        Row: {
          created_at: string | null
          evidence_file_names: string[] | null
          evidence_files: string[] | null
          id: string
          manager_report_id: string
          observations: string | null
          product_id: string
          progress_percentage: number
          updated_at: string | null
          work_plan_assignment_id: string
        }
        Insert: {
          created_at?: string | null
          evidence_file_names?: string[] | null
          evidence_files?: string[] | null
          id?: string
          manager_report_id: string
          observations?: string | null
          product_id: string
          progress_percentage?: number
          updated_at?: string | null
          work_plan_assignment_id: string
        }
        Update: {
          created_at?: string | null
          evidence_file_names?: string[] | null
          evidence_files?: string[] | null
          id?: string
          manager_report_id?: string
          observations?: string | null
          product_id?: string
          progress_percentage?: number
          updated_at?: string | null
          work_plan_assignment_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_progress_reports_manager_report_id_fkey"
            columns: ["manager_report_id"]
            isOneToOne: false
            referencedRelation: "manager_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_progress_reports_manager_report_id_fkey"
            columns: ["manager_report_id"]
            isOneToOne: false
            referencedRelation: "vw_full_report_data"
            referencedColumns: ["report_id"]
          },
          {
            foreignKeyName: "product_progress_reports_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_progress_reports_work_plan_assignment_id_fkey"
            columns: ["work_plan_assignment_id"]
            isOneToOne: false
            referencedRelation: "vw_full_report_data"
            referencedColumns: ["assignment_id"]
          },
          {
            foreignKeyName: "product_progress_reports_work_plan_assignment_id_fkey"
            columns: ["work_plan_assignment_id"]
            isOneToOne: false
            referencedRelation: "work_plan_assignments"
            referencedColumns: ["id"]
          },
        ]
      }
      product_responses: {
        Row: {
          created_at: string | null
          file_name: string | null
          file_url: string | null
          id: string
          product_id: string
          report_id: string
          response_text: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          file_name?: string | null
          file_url?: string | null
          id?: string
          product_id: string
          report_id: string
          response_text?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          file_name?: string | null
          file_url?: string | null
          id?: string
          product_id?: string
          report_id?: string
          response_text?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_responses_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_responses_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "manager_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_responses_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "vw_full_report_data"
            referencedColumns: ["report_id"]
          },
        ]
      }
      products: {
        Row: {
          action_id: string
          created_at: string | null
          created_by: string
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          action_id: string
          created_at?: string | null
          created_by: string
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          action_id?: string
          created_at?: string | null
          created_by?: string
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_action_id_fkey"
            columns: ["action_id"]
            isOneToOne: false
            referencedRelation: "actions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          document_number: string
          email: string
          full_name: string
          id: string
          number_of_weeks: number | null
          position: string
          role: string
          total_hours: number | null
          updated_at: string | null
          weekly_hours: number | null
        }
        Insert: {
          created_at?: string | null
          document_number: string
          email: string
          full_name: string
          id: string
          number_of_weeks?: number | null
          position: string
          role: string
          total_hours?: number | null
          updated_at?: string | null
          weekly_hours?: number | null
        }
        Update: {
          created_at?: string | null
          document_number?: string
          email?: string
          full_name?: string
          id?: string
          number_of_weeks?: number | null
          position?: string
          role?: string
          total_hours?: number | null
          updated_at?: string | null
          weekly_hours?: number | null
        }
        Relationships: []
      }
      report_periods: {
        Row: {
          created_at: string | null
          created_by: string
          description: string | null
          end_date: string
          id: string
          is_active: boolean | null
          name: string
          start_date: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          description?: string | null
          end_date: string
          id?: string
          is_active?: boolean | null
          name: string
          start_date: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          description?: string | null
          end_date?: string
          id?: string
          is_active?: boolean | null
          name?: string
          start_date?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "report_periods_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      report_system_config: {
        Row: {
          auto_calculate_progress: boolean | null
          created_at: string | null
          id: string
          max_reports_per_period: number
          reports_enabled: boolean | null
          require_evidence: boolean | null
          updated_at: string | null
        }
        Insert: {
          auto_calculate_progress?: boolean | null
          created_at?: string | null
          id?: string
          max_reports_per_period?: number
          reports_enabled?: boolean | null
          require_evidence?: boolean | null
          updated_at?: string | null
        }
        Update: {
          auto_calculate_progress?: boolean | null
          created_at?: string | null
          id?: string
          max_reports_per_period?: number
          reports_enabled?: boolean | null
          require_evidence?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      report_templates: {
        Row: {
          action_id: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          max_versions: number | null
          name: string
          product_id: string | null
          sharepoint_base_url: string | null
          strategic_axis_id: string | null
          updated_at: string | null
        }
        Insert: {
          action_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          max_versions?: number | null
          name: string
          product_id?: string | null
          sharepoint_base_url?: string | null
          strategic_axis_id?: string | null
          updated_at?: string | null
        }
        Update: {
          action_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          max_versions?: number | null
          name?: string
          product_id?: string | null
          sharepoint_base_url?: string | null
          strategic_axis_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "report_templates_action_id_fkey"
            columns: ["action_id"]
            isOneToOne: false
            referencedRelation: "actions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_templates_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_templates_strategic_axis_id_fkey"
            columns: ["strategic_axis_id"]
            isOneToOne: false
            referencedRelation: "strategic_axes"
            referencedColumns: ["id"]
          },
        ]
      }
      strategic_axes: {
        Row: {
          code: string
          created_at: string | null
          created_by: string
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          created_by: string
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          created_by?: string
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "strategic_axes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      work_plan_assignments: {
        Row: {
          assigned_hours: number
          created_at: string | null
          id: string
          product_id: string
          updated_at: string | null
          work_plan_id: string
        }
        Insert: {
          assigned_hours?: number
          created_at?: string | null
          id?: string
          product_id: string
          updated_at?: string | null
          work_plan_id: string
        }
        Update: {
          assigned_hours?: number
          created_at?: string | null
          id?: string
          product_id?: string
          updated_at?: string | null
          work_plan_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_plan_assignments_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_plan_assignments_work_plan_id_fkey"
            columns: ["work_plan_id"]
            isOneToOne: false
            referencedRelation: "vw_full_report_data"
            referencedColumns: ["work_plan_id"]
          },
          {
            foreignKeyName: "work_plan_assignments_work_plan_id_fkey"
            columns: ["work_plan_id"]
            isOneToOne: false
            referencedRelation: "work_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_plan_assignments_work_plan_id_fkey"
            columns: ["work_plan_id"]
            isOneToOne: false
            referencedRelation: "work_plans_with_manager"
            referencedColumns: ["id"]
          },
        ]
      }
      work_plans: {
        Row: {
          approval_comments: string | null
          approved_by: string | null
          approved_date: string | null
          comments: string | null
          coordinator_approval_date: string | null
          coordinator_comments: string | null
          created_at: string | null
          id: string
          manager_id: string
          objectives: string | null
          program_id: string
          status: Database["public"]["Enums"]["work_plan_status"] | null
          submitted_date: string | null
          total_hours_assigned: number
          updated_at: string | null
        }
        Insert: {
          approval_comments?: string | null
          approved_by?: string | null
          approved_date?: string | null
          comments?: string | null
          coordinator_approval_date?: string | null
          coordinator_comments?: string | null
          created_at?: string | null
          id?: string
          manager_id: string
          objectives?: string | null
          program_id: string
          status?: Database["public"]["Enums"]["work_plan_status"] | null
          submitted_date?: string | null
          total_hours_assigned: number
          updated_at?: string | null
        }
        Update: {
          approval_comments?: string | null
          approved_by?: string | null
          approved_date?: string | null
          comments?: string | null
          coordinator_approval_date?: string | null
          coordinator_comments?: string | null
          created_at?: string | null
          id?: string
          manager_id?: string
          objectives?: string | null
          program_id?: string
          status?: Database["public"]["Enums"]["work_plan_status"] | null
          submitted_date?: string | null
          total_hours_assigned?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "work_plans_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_plans_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_plans_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "academic_programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_plans_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "vw_full_report_data"
            referencedColumns: ["program_id"]
          },
        ]
      }
    }
    Views: {
      vw_full_report_data: {
        Row: {
          action_name: string | null
          assignment_id: string | null
          campus_id: string | null
          delivery_date: string | null
          evidence_files: string[] | null
          faculty_id: string | null
          manager_email: string | null
          manager_id: string | null
          manager_name: string | null
          observations: string | null
          plan_total_hours: number | null
          product_assigned_hours: number | null
          product_id: string | null
          product_name: string | null
          program_id: string | null
          program_name: string | null
          progress_percentage: number | null
          report_created_at: string | null
          report_id: string | null
          strategic_axis_name: string | null
          weekly_hours: number | null
          work_plan_id: string | null
          work_plan_status: string | null
        }
        Relationships: [
          {
            foreignKeyName: "academic_programs_campus_id_fkey"
            columns: ["campus_id"]
            isOneToOne: false
            referencedRelation: "campus"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "academic_programs_faculty_id_fkey"
            columns: ["faculty_id"]
            isOneToOne: false
            referencedRelation: "faculties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_plan_assignments_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_plans_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      work_plans_with_manager: {
        Row: {
          approval_comments: string | null
          approved_by: string | null
          approved_date: string | null
          campus_name: string | null
          comments: string | null
          coordinator_approval_date: string | null
          coordinator_comments: string | null
          created_at: string | null
          faculty_name: string | null
          id: string | null
          manager_email: string | null
          manager_id: string | null
          manager_name: string | null
          manager_position: string | null
          objectives: string | null
          program_id: string | null
          program_name: string | null
          status: Database["public"]["Enums"]["work_plan_status"] | null
          submitted_date: string | null
          total_hours_assigned: number | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "work_plans_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_plans_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_plans_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "academic_programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_plans_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "vw_full_report_data"
            referencedColumns: ["program_id"]
          },
        ]
      }
    }
    Functions: {
      calculate_total_progress: {
        Args: { report_id: string }
        Returns: number
      }
      get_next_version_number: {
        Args: { p_manager_report_id: string; p_template_id: string }
        Returns: number
      }
    }
    Enums: {
      work_plan_status:
        | "draft"
        | "submitted"
        | "pending"
        | "approved"
        | "rejected"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      work_plan_status: [
        "draft",
        "submitted",
        "pending",
        "approved",
        "rejected",
      ],
    },
  },
} as const
