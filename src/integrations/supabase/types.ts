export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      academic_programs: {
        Row: {
          campus_id: string
          coordinador_id: string | null
          created_at: string | null
          description: string | null
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
          coordinador_id?: string | null
          created_at?: string | null
          description?: string | null
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
          coordinador_id?: string | null
          created_at?: string | null
          description?: string | null
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
            foreignKeyName: "academic_programs_coordinador_id_fkey"
            columns: ["coordinador_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
          description: string | null
          id: string
          name: string
          strategic_axis_id: string
          updated_at: string | null
          usage_type: string[] | null
        }
        Insert: {
          code: string
          created_at?: string | null
          created_by: string
          description?: string | null
          id?: string
          name: string
          strategic_axis_id: string
          updated_at?: string | null
          usage_type?: string[] | null
        }
        Update: {
          code?: string
          created_at?: string | null
          created_by?: string
          description?: string | null
          id?: string
          name?: string
          strategic_axis_id?: string
          updated_at?: string | null
          usage_type?: string[] | null
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
      auto_generated_reports: {
        Row: {
          created_at: string | null
          custom_plan_id: string
          due_date: string | null
          generated_date: string | null
          id: string
          manager_id: string
          report_period_id: string | null
          status: string | null
          template_id: string
        }
        Insert: {
          created_at?: string | null
          custom_plan_id: string
          due_date?: string | null
          generated_date?: string | null
          id?: string
          manager_id: string
          report_period_id?: string | null
          status?: string | null
          template_id: string
        }
        Update: {
          created_at?: string | null
          custom_plan_id?: string
          due_date?: string | null
          generated_date?: string | null
          id?: string
          manager_id?: string
          report_period_id?: string | null
          status?: string | null
          template_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "auto_generated_reports_custom_plan_id_fkey"
            columns: ["custom_plan_id"]
            isOneToOne: false
            referencedRelation: "custom_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "auto_generated_reports_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "auto_generated_reports_report_period_id_fkey"
            columns: ["report_period_id"]
            isOneToOne: false
            referencedRelation: "report_periods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "auto_generated_reports_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "report_templates"
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
      coordinator_manager_assignments: {
        Row: {
          assigned_plan_type_id: string | null
          assignment_date: string | null
          campus_id: string | null
          coordinator_id: string
          created_at: string | null
          id: string
          is_active: boolean | null
          manager_id: string
        }
        Insert: {
          assigned_plan_type_id?: string | null
          assignment_date?: string | null
          campus_id?: string | null
          coordinator_id: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          manager_id: string
        }
        Update: {
          assigned_plan_type_id?: string | null
          assignment_date?: string | null
          campus_id?: string | null
          coordinator_id?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          manager_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coordinator_manager_assignments_assigned_plan_type_id_fkey"
            columns: ["assigned_plan_type_id"]
            isOneToOne: false
            referencedRelation: "plan_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coordinator_manager_assignments_campus_id_fkey"
            columns: ["campus_id"]
            isOneToOne: false
            referencedRelation: "campus"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coordinator_manager_assignments_coordinator_id_fkey"
            columns: ["coordinator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coordinator_manager_assignments_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_plan_assignments: {
        Row: {
          action_id: string | null
          assigned_hours: number | null
          created_at: string | null
          custom_plan_id: string
          id: string
          product_id: string | null
          strategic_axis_id: string | null
        }
        Insert: {
          action_id?: string | null
          assigned_hours?: number | null
          created_at?: string | null
          custom_plan_id: string
          id?: string
          product_id?: string | null
          strategic_axis_id?: string | null
        }
        Update: {
          action_id?: string | null
          assigned_hours?: number | null
          created_at?: string | null
          custom_plan_id?: string
          id?: string
          product_id?: string | null
          strategic_axis_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "custom_plan_assignments_action_id_fkey"
            columns: ["action_id"]
            isOneToOne: false
            referencedRelation: "actions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "custom_plan_assignments_custom_plan_id_fkey"
            columns: ["custom_plan_id"]
            isOneToOne: false
            referencedRelation: "custom_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "custom_plan_assignments_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "custom_plan_assignments_strategic_axis_id_fkey"
            columns: ["strategic_axis_id"]
            isOneToOne: false
            referencedRelation: "strategic_axes"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_plan_responses: {
        Row: {
          created_at: string | null
          custom_plan_id: string
          file_name: string | null
          file_url: string | null
          id: string
          plan_field_id: string
          response_value: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          custom_plan_id: string
          file_name?: string | null
          file_url?: string | null
          id?: string
          plan_field_id: string
          response_value?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          custom_plan_id?: string
          file_name?: string | null
          file_url?: string | null
          id?: string
          plan_field_id?: string
          response_value?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "custom_plan_responses_custom_plan_id_fkey"
            columns: ["custom_plan_id"]
            isOneToOne: false
            referencedRelation: "custom_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "custom_plan_responses_plan_field_id_fkey"
            columns: ["plan_field_id"]
            isOneToOne: false
            referencedRelation: "plan_fields"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_plans: {
        Row: {
          approval_comments: string | null
          approved_by: string | null
          approved_date: string | null
          coordinator_observations: string | null
          created_at: string | null
          id: string
          manager_id: string
          plan_type_id: string
          status: string | null
          submitted_date: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          approval_comments?: string | null
          approved_by?: string | null
          approved_date?: string | null
          coordinator_observations?: string | null
          created_at?: string | null
          id?: string
          manager_id: string
          plan_type_id: string
          status?: string | null
          submitted_date?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          approval_comments?: string | null
          approved_by?: string | null
          approved_date?: string | null
          coordinator_observations?: string | null
          created_at?: string | null
          id?: string
          manager_id?: string
          plan_type_id?: string
          status?: string | null
          submitted_date?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "custom_plans_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "custom_plans_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "custom_plans_plan_type_id_fkey"
            columns: ["plan_type_id"]
            isOneToOne: false
            referencedRelation: "plan_types"
            referencedColumns: ["id"]
          },
        ]
      }
      document_templates: {
        Row: {
          created_at: string | null
          created_by: string
          description: string | null
          file_name: string | null
          file_url: string | null
          id: string
          is_active: boolean | null
          name: string
          template_content: string
          template_type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          description?: string | null
          file_name?: string | null
          file_url?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          template_content: string
          template_type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          description?: string | null
          file_name?: string | null
          file_url?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          template_content?: string
          template_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      email_configurations: {
        Row: {
          campus_id: string | null
          created_at: string | null
          created_by: string | null
          from_email: string
          from_name: string
          id: string
          is_active: boolean | null
          resend_api_key: string | null
          test_email: string | null
          updated_at: string | null
        }
        Insert: {
          campus_id?: string | null
          created_at?: string | null
          created_by?: string | null
          from_email?: string
          from_name?: string
          id?: string
          is_active?: boolean | null
          resend_api_key?: string | null
          test_email?: string | null
          updated_at?: string | null
        }
        Update: {
          campus_id?: string | null
          created_at?: string | null
          created_by?: string | null
          from_email?: string
          from_name?: string
          id?: string
          is_active?: boolean | null
          resend_api_key?: string | null
          test_email?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_configurations_campus_id_fkey"
            columns: ["campus_id"]
            isOneToOne: true
            referencedRelation: "campus"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_configurations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      email_notifications: {
        Row: {
          campus_id: string | null
          content: string
          created_at: string | null
          error_message: string | null
          id: string
          recipient_email: string
          recipient_name: string | null
          related_entity_id: string | null
          related_entity_type: string | null
          sent_at: string | null
          status: string | null
          subject: string
          template_id: string | null
        }
        Insert: {
          campus_id?: string | null
          content: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          recipient_email: string
          recipient_name?: string | null
          related_entity_id?: string | null
          related_entity_type?: string | null
          sent_at?: string | null
          status?: string | null
          subject: string
          template_id?: string | null
        }
        Update: {
          campus_id?: string | null
          content?: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          recipient_email?: string
          recipient_name?: string | null
          related_entity_id?: string | null
          related_entity_type?: string | null
          sent_at?: string | null
          status?: string | null
          subject?: string
          template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_notifications_campus_id_fkey"
            columns: ["campus_id"]
            isOneToOne: false
            referencedRelation: "campus"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_notifications_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "email_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      email_templates: {
        Row: {
          campus_id: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          html_content: string
          id: string
          is_active: boolean | null
          name: string
          subject: string
          template_type: string
          updated_at: string | null
          variables: Json | null
        }
        Insert: {
          campus_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          html_content: string
          id?: string
          is_active?: boolean | null
          name: string
          subject: string
          template_type: string
          updated_at?: string | null
          variables?: Json | null
        }
        Update: {
          campus_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          html_content?: string
          id?: string
          is_active?: boolean | null
          name?: string
          subject?: string
          template_type?: string
          updated_at?: string | null
          variables?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "email_templates_campus_id_fkey"
            columns: ["campus_id"]
            isOneToOne: false
            referencedRelation: "campus"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      faculties: {
        Row: {
          campus_id: string | null
          created_at: string | null
          dean_name: string
          description: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          campus_id?: string | null
          created_at?: string | null
          dean_name: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          campus_id?: string | null
          created_at?: string | null
          dean_name?: string
          description?: string | null
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
      improvement_plans: {
        Row: {
          created_at: string | null
          created_by: string
          description: string
          expected_completion_date: string | null
          id: string
          improvement_actions: string[] | null
          manager_id: string
          manager_report_id: string
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          description: string
          expected_completion_date?: string | null
          id?: string
          improvement_actions?: string[] | null
          manager_id: string
          manager_report_id: string
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          description?: string
          expected_completion_date?: string | null
          id?: string
          improvement_actions?: string[] | null
          manager_id?: string
          manager_report_id?: string
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "improvement_plans_manager_report_id_fkey"
            columns: ["manager_report_id"]
            isOneToOne: false
            referencedRelation: "manager_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "improvement_plans_manager_report_id_fkey"
            columns: ["manager_report_id"]
            isOneToOne: false
            referencedRelation: "vw_full_report_data"
            referencedColumns: ["report_id"]
          },
        ]
      }
      indicator_reports: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          manager_id: string
          report_period_id: string
          reviewed_by: string | null
          reviewed_date: string | null
          status: string | null
          submitted_date: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          manager_id: string
          report_period_id: string
          reviewed_by?: string | null
          reviewed_date?: string | null
          status?: string | null
          submitted_date?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          manager_id?: string
          report_period_id?: string
          reviewed_by?: string | null
          reviewed_date?: string | null
          status?: string | null
          submitted_date?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "indicator_reports_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "indicator_reports_report_period_id_fkey"
            columns: ["report_period_id"]
            isOneToOne: false
            referencedRelation: "report_periods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "indicator_reports_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      indicator_responses: {
        Row: {
          created_at: string | null
          file_name: string | null
          file_url: string | null
          id: string
          indicator_id: string
          indicator_report_id: string
          link_value: string | null
          numeric_value: number | null
          observations: string | null
          text_value: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          file_name?: string | null
          file_url?: string | null
          id?: string
          indicator_id: string
          indicator_report_id: string
          link_value?: string | null
          numeric_value?: number | null
          observations?: string | null
          text_value?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          file_name?: string | null
          file_url?: string | null
          id?: string
          indicator_id?: string
          indicator_report_id?: string
          link_value?: string | null
          numeric_value?: number | null
          observations?: string | null
          text_value?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "indicator_responses_indicator_id_fkey"
            columns: ["indicator_id"]
            isOneToOne: false
            referencedRelation: "indicators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "indicator_responses_indicator_report_id_fkey"
            columns: ["indicator_report_id"]
            isOneToOne: false
            referencedRelation: "indicator_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      indicators: {
        Row: {
          created_at: string | null
          created_by: string
          data_type: string
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          data_type: string
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          data_type?: string
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "indicators_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      internationalization_projects: {
        Row: {
          activities_schedule: string | null
          approval_comments: string | null
          approved_by: string | null
          approved_date: string | null
          bibliography: string | null
          created_at: string | null
          duration_months: number | null
          general_objective: string | null
          id: string
          impact: string | null
          indicators_text: string | null
          introduction: string | null
          manager_id: string
          methodology: string | null
          participation_letter_name: string | null
          participation_letter_url: string | null
          program_id: string
          project_summary: string | null
          project_title: string
          results: string | null
          schedule_description: string | null
          specific_line_id: string | null
          specific_objectives: string[] | null
          status: string | null
          strategic_axis_id: string | null
          submitted_date: string | null
          updated_at: string | null
        }
        Insert: {
          activities_schedule?: string | null
          approval_comments?: string | null
          approved_by?: string | null
          approved_date?: string | null
          bibliography?: string | null
          created_at?: string | null
          duration_months?: number | null
          general_objective?: string | null
          id?: string
          impact?: string | null
          indicators_text?: string | null
          introduction?: string | null
          manager_id: string
          methodology?: string | null
          participation_letter_name?: string | null
          participation_letter_url?: string | null
          program_id: string
          project_summary?: string | null
          project_title: string
          results?: string | null
          schedule_description?: string | null
          specific_line_id?: string | null
          specific_objectives?: string[] | null
          status?: string | null
          strategic_axis_id?: string | null
          submitted_date?: string | null
          updated_at?: string | null
        }
        Update: {
          activities_schedule?: string | null
          approval_comments?: string | null
          approved_by?: string | null
          approved_date?: string | null
          bibliography?: string | null
          created_at?: string | null
          duration_months?: number | null
          general_objective?: string | null
          id?: string
          impact?: string | null
          indicators_text?: string | null
          introduction?: string | null
          manager_id?: string
          methodology?: string | null
          participation_letter_name?: string | null
          participation_letter_url?: string | null
          program_id?: string
          project_summary?: string | null
          project_title?: string
          results?: string | null
          schedule_description?: string | null
          specific_line_id?: string | null
          specific_objectives?: string[] | null
          status?: string | null
          strategic_axis_id?: string | null
          submitted_date?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "internationalization_projects_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "internationalization_projects_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "internationalization_projects_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "academic_programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "internationalization_projects_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "vw_full_report_data"
            referencedColumns: ["program_id"]
          },
          {
            foreignKeyName: "internationalization_projects_specific_line_id_fkey"
            columns: ["specific_line_id"]
            isOneToOne: false
            referencedRelation: "specific_lines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "internationalization_projects_strategic_axis_id_fkey"
            columns: ["strategic_axis_id"]
            isOneToOne: false
            referencedRelation: "strategic_axes"
            referencedColumns: ["id"]
          },
        ]
      }
      internationalization_reports: {
        Row: {
          abnormal_reason: string | null
          activities_executed: string | null
          activities_in_progress: string | null
          created_at: string | null
          difficulties: string[] | null
          id: string
          manager_id: string
          objectives_achieved: string | null
          project_id: string
          project_status: string | null
          project_timing: string | null
          report_period_id: string
          reviewed_by: string | null
          reviewed_date: string | null
          status: string | null
          submitted_date: string | null
          updated_at: string | null
        }
        Insert: {
          abnormal_reason?: string | null
          activities_executed?: string | null
          activities_in_progress?: string | null
          created_at?: string | null
          difficulties?: string[] | null
          id?: string
          manager_id: string
          objectives_achieved?: string | null
          project_id: string
          project_status?: string | null
          project_timing?: string | null
          report_period_id: string
          reviewed_by?: string | null
          reviewed_date?: string | null
          status?: string | null
          submitted_date?: string | null
          updated_at?: string | null
        }
        Update: {
          abnormal_reason?: string | null
          activities_executed?: string | null
          activities_in_progress?: string | null
          created_at?: string | null
          difficulties?: string[] | null
          id?: string
          manager_id?: string
          objectives_achieved?: string | null
          project_id?: string
          project_status?: string | null
          project_timing?: string | null
          report_period_id?: string
          reviewed_by?: string | null
          reviewed_date?: string | null
          status?: string | null
          submitted_date?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "internationalization_reports_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "internationalization_reports_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "internationalization_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "internationalization_reports_report_period_id_fkey"
            columns: ["report_period_id"]
            isOneToOne: false
            referencedRelation: "report_periods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "internationalization_reports_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
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
          can_edit: boolean | null
          completion_percentage: number | null
          created_at: string | null
          description: string | null
          general_report_file_name: string | null
          general_report_url: string | null
          id: string
          is_final_version: boolean | null
          manager_id: string
          report_period_id: string | null
          requires_improvement_plan: boolean | null
          status: string | null
          submitted_date: string | null
          title: string
          total_progress_percentage: number | null
          updated_at: string | null
          version_number: number | null
          work_plan_id: string
        }
        Insert: {
          can_edit?: boolean | null
          completion_percentage?: number | null
          created_at?: string | null
          description?: string | null
          general_report_file_name?: string | null
          general_report_url?: string | null
          id?: string
          is_final_version?: boolean | null
          manager_id: string
          report_period_id?: string | null
          requires_improvement_plan?: boolean | null
          status?: string | null
          submitted_date?: string | null
          title: string
          total_progress_percentage?: number | null
          updated_at?: string | null
          version_number?: number | null
          work_plan_id: string
        }
        Update: {
          can_edit?: boolean | null
          completion_percentage?: number | null
          created_at?: string | null
          description?: string | null
          general_report_file_name?: string | null
          general_report_url?: string | null
          id?: string
          is_final_version?: boolean | null
          manager_id?: string
          report_period_id?: string | null
          requires_improvement_plan?: boolean | null
          status?: string | null
          submitted_date?: string | null
          title?: string
          total_progress_percentage?: number | null
          updated_at?: string | null
          version_number?: number | null
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
            referencedRelation: "custom_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_fields: {
        Row: {
          created_at: string | null
          dropdown_options: Json | null
          field_name: string
          field_order: number | null
          field_type: string
          id: string
          is_required: boolean | null
          plan_type_id: string
        }
        Insert: {
          created_at?: string | null
          dropdown_options?: Json | null
          field_name: string
          field_order?: number | null
          field_type: string
          id?: string
          is_required?: boolean | null
          plan_type_id: string
        }
        Update: {
          created_at?: string | null
          dropdown_options?: Json | null
          field_name?: string
          field_order?: number | null
          field_type?: string
          id?: string
          is_required?: boolean | null
          plan_type_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "plan_fields_plan_type_id_fkey"
            columns: ["plan_type_id"]
            isOneToOne: false
            referencedRelation: "plan_types"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_observations: {
        Row: {
          created_at: string | null
          id: string
          observation_text: string
          observer_id: string
          plan_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          observation_text: string
          observer_id: string
          plan_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          observation_text?: string
          observer_id?: string
          plan_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "plan_observations_observer_id_fkey"
            columns: ["observer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plan_observations_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "custom_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_type_actions: {
        Row: {
          action_id: string
          created_at: string | null
          id: string
          is_required: boolean | null
          plan_type_id: string
        }
        Insert: {
          action_id: string
          created_at?: string | null
          id?: string
          is_required?: boolean | null
          plan_type_id: string
        }
        Update: {
          action_id?: string
          created_at?: string | null
          id?: string
          is_required?: boolean | null
          plan_type_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "plan_type_actions_action_id_fkey"
            columns: ["action_id"]
            isOneToOne: false
            referencedRelation: "actions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plan_type_actions_plan_type_id_fkey"
            columns: ["plan_type_id"]
            isOneToOne: false
            referencedRelation: "plan_types"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_type_element_order: {
        Row: {
          created_at: string
          display_order: number
          element_id: string
          element_type: string
          id: string
          is_visible: boolean
          plan_type_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          element_id: string
          element_type: string
          id?: string
          is_visible?: boolean
          plan_type_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number
          element_id?: string
          element_type?: string
          id?: string
          is_visible?: boolean
          plan_type_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "plan_type_element_order_plan_type_id_fkey"
            columns: ["plan_type_id"]
            isOneToOne: false
            referencedRelation: "plan_types"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_type_products: {
        Row: {
          created_at: string | null
          id: string
          is_required: boolean | null
          plan_type_id: string
          product_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_required?: boolean | null
          plan_type_id: string
          product_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_required?: boolean | null
          plan_type_id?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "plan_type_products_plan_type_id_fkey"
            columns: ["plan_type_id"]
            isOneToOne: false
            referencedRelation: "plan_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plan_type_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_type_strategic_axes: {
        Row: {
          created_at: string | null
          id: string
          is_required: boolean | null
          plan_type_id: string
          strategic_axis_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_required?: boolean | null
          plan_type_id: string
          strategic_axis_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_required?: boolean | null
          plan_type_id?: string
          strategic_axis_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "plan_type_strategic_axes_plan_type_id_fkey"
            columns: ["plan_type_id"]
            isOneToOne: false
            referencedRelation: "plan_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plan_type_strategic_axes_strategic_axis_id_fkey"
            columns: ["strategic_axis_id"]
            isOneToOne: false
            referencedRelation: "strategic_axes"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_type_template_fields: {
        Row: {
          created_at: string | null
          field_config: Json | null
          field_name: string
          field_order: number | null
          field_type: string
          id: string
          is_required: boolean | null
          plan_type_id: string
          template_id: string
        }
        Insert: {
          created_at?: string | null
          field_config?: Json | null
          field_name: string
          field_order?: number | null
          field_type: string
          id?: string
          is_required?: boolean | null
          plan_type_id: string
          template_id: string
        }
        Update: {
          created_at?: string | null
          field_config?: Json | null
          field_name?: string
          field_order?: number | null
          field_type?: string
          id?: string
          is_required?: boolean | null
          plan_type_id?: string
          template_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "plan_type_template_fields_plan_type_id_fkey"
            columns: ["plan_type_id"]
            isOneToOne: false
            referencedRelation: "plan_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plan_type_template_fields_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "report_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_types: {
        Row: {
          allow_custom_fields: boolean | null
          allow_structured_elements: boolean | null
          created_at: string | null
          created_by: string
          description: string | null
          id: string
          is_active: boolean | null
          is_visible: boolean | null
          max_weekly_hours: number | null
          min_weekly_hours: number | null
          name: string
          updated_at: string | null
          uses_structured_elements: boolean | null
        }
        Insert: {
          allow_custom_fields?: boolean | null
          allow_structured_elements?: boolean | null
          created_at?: string | null
          created_by: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_visible?: boolean | null
          max_weekly_hours?: number | null
          min_weekly_hours?: number | null
          name: string
          updated_at?: string | null
          uses_structured_elements?: boolean | null
        }
        Update: {
          allow_custom_fields?: boolean | null
          allow_structured_elements?: boolean | null
          created_at?: string | null
          created_by?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_visible?: boolean | null
          max_weekly_hours?: number | null
          min_weekly_hours?: number | null
          name?: string
          updated_at?: string | null
          uses_structured_elements?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "plan_types_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
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
          custom_plan_assignment_id: string | null
          evidence_file_names: string[] | null
          evidence_files: string[] | null
          id: string
          manager_report_id: string
          observations: string | null
          product_id: string
          progress_percentage: number
          updated_at: string | null
          work_plan_assignment_id: string | null
        }
        Insert: {
          created_at?: string | null
          custom_plan_assignment_id?: string | null
          evidence_file_names?: string[] | null
          evidence_files?: string[] | null
          id?: string
          manager_report_id: string
          observations?: string | null
          product_id: string
          progress_percentage?: number
          updated_at?: string | null
          work_plan_assignment_id?: string | null
        }
        Update: {
          created_at?: string | null
          custom_plan_assignment_id?: string | null
          evidence_file_names?: string[] | null
          evidence_files?: string[] | null
          id?: string
          manager_report_id?: string
          observations?: string | null
          product_id?: string
          progress_percentage?: number
          updated_at?: string | null
          work_plan_assignment_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_progress_reports_custom_plan_assignment_id_fkey"
            columns: ["custom_plan_assignment_id"]
            isOneToOne: false
            referencedRelation: "custom_plan_assignments"
            referencedColumns: ["id"]
          },
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
          description: string | null
          id: string
          name: string
          updated_at: string | null
          usage_type: string[] | null
        }
        Insert: {
          action_id: string
          created_at?: string | null
          created_by: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
          usage_type?: string[] | null
        }
        Update: {
          action_id?: string
          created_at?: string | null
          created_by?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
          usage_type?: string[] | null
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
          campus: string | null
          campus_id: string | null
          created_at: string | null
          document_number: string
          email: string
          full_name: string
          id: string
          managed_campus_ids: string[] | null
          number_of_weeks: number | null
          position: string
          role: string
          total_hours: number | null
          updated_at: string | null
          weekly_hours: number | null
        }
        Insert: {
          campus?: string | null
          campus_id?: string | null
          created_at?: string | null
          document_number: string
          email: string
          full_name: string
          id: string
          managed_campus_ids?: string[] | null
          number_of_weeks?: number | null
          position: string
          role: string
          total_hours?: number | null
          updated_at?: string | null
          weekly_hours?: number | null
        }
        Update: {
          campus?: string | null
          campus_id?: string | null
          created_at?: string | null
          document_number?: string
          email?: string
          full_name?: string
          id?: string
          managed_campus_ids?: string[] | null
          number_of_weeks?: number | null
          position?: string
          role?: string
          total_hours?: number | null
          updated_at?: string | null
          weekly_hours?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_campus_id_fkey"
            columns: ["campus_id"]
            isOneToOne: false
            referencedRelation: "campus"
            referencedColumns: ["id"]
          },
        ]
      }
      project_partner_institutions: {
        Row: {
          contact_professor_email: string
          contact_professor_name: string
          country: string
          created_at: string | null
          id: string
          institution_name: string
          project_id: string
        }
        Insert: {
          contact_professor_email: string
          contact_professor_name: string
          country: string
          created_at?: string | null
          id?: string
          institution_name: string
          project_id: string
        }
        Update: {
          contact_professor_email?: string
          contact_professor_name?: string
          country?: string
          created_at?: string | null
          id?: string
          institution_name?: string
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_partner_institutions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "internationalization_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      report_document_templates: {
        Row: {
          created_at: string | null
          document_template_id: string | null
          id: string
          report_template_id: string | null
        }
        Insert: {
          created_at?: string | null
          document_template_id?: string | null
          id?: string
          report_template_id?: string | null
        }
        Update: {
          created_at?: string | null
          document_template_id?: string | null
          id?: string
          report_template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "report_document_templates_document_template_id_fkey"
            columns: ["document_template_id"]
            isOneToOne: false
            referencedRelation: "document_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_document_templates_report_template_id_fkey"
            columns: ["report_template_id"]
            isOneToOne: false
            referencedRelation: "report_templates"
            referencedColumns: ["id"]
          },
        ]
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
          actions_ids: string[] | null
          auto_generate_on_approval: boolean | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          linked_plan_type_id: string | null
          max_versions: number | null
          name: string
          product_id: string | null
          products_ids: string[] | null
          sharepoint_base_url: string | null
          strategic_axes_ids: string[] | null
          strategic_axis_id: string | null
          template_type: string | null
          updated_at: string | null
        }
        Insert: {
          action_id?: string | null
          actions_ids?: string[] | null
          auto_generate_on_approval?: boolean | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          linked_plan_type_id?: string | null
          max_versions?: number | null
          name: string
          product_id?: string | null
          products_ids?: string[] | null
          sharepoint_base_url?: string | null
          strategic_axes_ids?: string[] | null
          strategic_axis_id?: string | null
          template_type?: string | null
          updated_at?: string | null
        }
        Update: {
          action_id?: string | null
          actions_ids?: string[] | null
          auto_generate_on_approval?: boolean | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          linked_plan_type_id?: string | null
          max_versions?: number | null
          name?: string
          product_id?: string | null
          products_ids?: string[] | null
          sharepoint_base_url?: string | null
          strategic_axes_ids?: string[] | null
          strategic_axis_id?: string | null
          template_type?: string | null
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
            foreignKeyName: "report_templates_linked_plan_type_id_fkey"
            columns: ["linked_plan_type_id"]
            isOneToOne: false
            referencedRelation: "plan_types"
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
      snies_biological_sex: {
        Row: {
          created_at: string | null
          id: number
          is_active: boolean | null
          name: string
        }
        Insert: {
          created_at?: string | null
          id: number
          is_active?: boolean | null
          name: string
        }
        Update: {
          created_at?: string | null
          id?: number
          is_active?: boolean | null
          name?: string
        }
        Relationships: []
      }
      snies_consolidated_reports: {
        Row: {
          consolidation_date: string | null
          created_at: string | null
          created_by: string
          file_url: string | null
          id: string
          participating_managers: number | null
          template_id: string | null
          title: string
          total_records: number | null
        }
        Insert: {
          consolidation_date?: string | null
          created_at?: string | null
          created_by: string
          file_url?: string | null
          id?: string
          participating_managers?: number | null
          template_id?: string | null
          title: string
          total_records?: number | null
        }
        Update: {
          consolidation_date?: string | null
          created_at?: string | null
          created_by?: string
          file_url?: string | null
          id?: string
          participating_managers?: number | null
          template_id?: string | null
          title?: string
          total_records?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "snies_consolidated_reports_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "snies_report_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      snies_countries: {
        Row: {
          alpha_2: string | null
          alpha_3: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
        }
        Insert: {
          alpha_2?: string | null
          alpha_3?: string | null
          created_at?: string | null
          id: string
          is_active?: boolean | null
          name: string
        }
        Update: {
          alpha_2?: string | null
          alpha_3?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
        }
        Relationships: []
      }
      snies_document_types: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id: string
          is_active?: boolean | null
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
        }
        Relationships: []
      }
      snies_education_levels: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id: string
          is_active?: boolean | null
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
        }
        Relationships: []
      }
      snies_institutions: {
        Row: {
          address: string | null
          code: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          municipality_id: string | null
          name: string
        }
        Insert: {
          address?: string | null
          code?: string | null
          created_at?: string | null
          id: string
          is_active?: boolean | null
          municipality_id?: string | null
          name: string
        }
        Update: {
          address?: string | null
          code?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          municipality_id?: string | null
          name?: string
        }
        Relationships: []
      }
      snies_knowledge_areas: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          parent_area_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id: string
          is_active?: boolean | null
          name: string
          parent_area_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          parent_area_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "snies_knowledge_areas_parent_area_id_fkey"
            columns: ["parent_area_id"]
            isOneToOne: false
            referencedRelation: "snies_knowledge_areas"
            referencedColumns: ["id"]
          },
        ]
      }
      snies_marital_status: {
        Row: {
          created_at: string | null
          id: number
          is_active: boolean | null
          name: string
        }
        Insert: {
          created_at?: string | null
          id: number
          is_active?: boolean | null
          name: string
        }
        Update: {
          created_at?: string | null
          id?: number
          is_active?: boolean | null
          name?: string
        }
        Relationships: []
      }
      snies_methodologies: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id: string
          is_active?: boolean | null
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
        }
        Relationships: []
      }
      snies_modalities: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id: string
          is_active?: boolean | null
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
        }
        Relationships: []
      }
      snies_municipalities: {
        Row: {
          country_id: string | null
          created_at: string | null
          department_id: string
          id: string
          is_active: boolean | null
          name: string
        }
        Insert: {
          country_id?: string | null
          created_at?: string | null
          department_id: string
          id: string
          is_active?: boolean | null
          name: string
        }
        Update: {
          country_id?: string | null
          created_at?: string | null
          department_id?: string
          id?: string
          is_active?: boolean | null
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "snies_municipalities_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "snies_countries"
            referencedColumns: ["id"]
          },
        ]
      }
      snies_report_data: {
        Row: {
          created_at: string | null
          field_data: Json
          id: string
          report_id: string | null
          row_index: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          field_data: Json
          id?: string
          report_id?: string | null
          row_index: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          field_data?: Json
          id?: string
          report_id?: string | null
          row_index?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "snies_report_data_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "snies_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      snies_report_templates: {
        Row: {
          created_at: string | null
          created_by: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      snies_reports: {
        Row: {
          created_at: string | null
          id: string
          manager_id: string
          status: string | null
          submitted_date: string | null
          template_id: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          manager_id: string
          status?: string | null
          submitted_date?: string | null
          template_id?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          manager_id?: string
          status?: string | null
          submitted_date?: string | null
          template_id?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "snies_reports_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "snies_reports_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "snies_report_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      snies_template_fields: {
        Row: {
          created_at: string | null
          field_label: string
          field_name: string
          field_options: Json | null
          field_order: number | null
          field_type: string
          id: string
          is_required: boolean | null
          relation_display_field: string | null
          relation_id_field: string | null
          relation_table: string | null
          template_id: string | null
        }
        Insert: {
          created_at?: string | null
          field_label: string
          field_name: string
          field_options?: Json | null
          field_order?: number | null
          field_type: string
          id?: string
          is_required?: boolean | null
          relation_display_field?: string | null
          relation_id_field?: string | null
          relation_table?: string | null
          template_id?: string | null
        }
        Update: {
          created_at?: string | null
          field_label?: string
          field_name?: string
          field_options?: Json | null
          field_order?: number | null
          field_type?: string
          id?: string
          is_required?: boolean | null
          relation_display_field?: string | null
          relation_id_field?: string | null
          relation_table?: string | null
          template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "snies_template_fields_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "snies_report_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      specific_lines: {
        Row: {
          created_at: string | null
          created_by: string
          description: string | null
          id: string
          is_active: boolean | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "specific_lines_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      strategic_axes: {
        Row: {
          code: string
          created_at: string | null
          created_by: string
          description: string | null
          id: string
          name: string
          updated_at: string | null
          usage_type: string[] | null
        }
        Insert: {
          code: string
          created_at?: string | null
          created_by: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
          usage_type?: string[] | null
        }
        Update: {
          code?: string
          created_at?: string | null
          created_by?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
          usage_type?: string[] | null
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
      template_based_reports: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          manager_id: string
          report_period_id: string
          report_template_id: string
          reviewed_by: string | null
          reviewed_date: string | null
          status: string | null
          submitted_date: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          manager_id: string
          report_period_id: string
          report_template_id: string
          reviewed_by?: string | null
          reviewed_date?: string | null
          status?: string | null
          submitted_date?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          manager_id?: string
          report_period_id?: string
          report_template_id?: string
          reviewed_by?: string | null
          reviewed_date?: string | null
          status?: string | null
          submitted_date?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "template_based_reports_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "template_based_reports_report_period_id_fkey"
            columns: ["report_period_id"]
            isOneToOne: false
            referencedRelation: "report_periods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "template_based_reports_report_template_id_fkey"
            columns: ["report_template_id"]
            isOneToOne: false
            referencedRelation: "report_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "template_based_reports_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      template_report_responses: {
        Row: {
          action_id: string | null
          created_at: string | null
          evidence_file_names: string[] | null
          evidence_files: string[] | null
          id: string
          observations: string | null
          product_id: string | null
          progress_percentage: number | null
          response_text: string | null
          strategic_axis_id: string | null
          template_report_id: string
          updated_at: string | null
        }
        Insert: {
          action_id?: string | null
          created_at?: string | null
          evidence_file_names?: string[] | null
          evidence_files?: string[] | null
          id?: string
          observations?: string | null
          product_id?: string | null
          progress_percentage?: number | null
          response_text?: string | null
          strategic_axis_id?: string | null
          template_report_id: string
          updated_at?: string | null
        }
        Update: {
          action_id?: string | null
          created_at?: string | null
          evidence_file_names?: string[] | null
          evidence_files?: string[] | null
          id?: string
          observations?: string | null
          product_id?: string | null
          progress_percentage?: number | null
          response_text?: string | null
          strategic_axis_id?: string | null
          template_report_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "template_report_responses_action_id_fkey"
            columns: ["action_id"]
            isOneToOne: false
            referencedRelation: "actions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "template_report_responses_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "template_report_responses_strategic_axis_id_fkey"
            columns: ["strategic_axis_id"]
            isOneToOne: false
            referencedRelation: "strategic_axes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "template_report_responses_template_report_id_fkey"
            columns: ["template_report_id"]
            isOneToOne: false
            referencedRelation: "template_based_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "template_report_responses_template_report_id_fkey"
            columns: ["template_report_id"]
            isOneToOne: false
            referencedRelation: "template_based_reports_with_details"
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
      template_based_reports_with_details: {
        Row: {
          created_at: string | null
          description: string | null
          id: string | null
          manager_email: string | null
          manager_id: string | null
          manager_name: string | null
          period_end: string | null
          period_name: string | null
          period_start: string | null
          report_period_id: string | null
          report_template_id: string | null
          reviewed_by: string | null
          reviewed_by_name: string | null
          reviewed_date: string | null
          status: string | null
          submitted_date: string | null
          template_description: string | null
          template_name: string | null
          title: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "template_based_reports_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "template_based_reports_report_period_id_fkey"
            columns: ["report_period_id"]
            isOneToOne: false
            referencedRelation: "report_periods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "template_based_reports_report_template_id_fkey"
            columns: ["report_template_id"]
            isOneToOne: false
            referencedRelation: "report_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "template_based_reports_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      unified_reports: {
        Row: {
          created_at: string | null
          description: string | null
          id: string | null
          manager_id: string | null
          report_period_id: string | null
          report_type: string | null
          status: string | null
          submitted_date: string | null
          title: string | null
          type_display_name: string | null
          updated_at: string | null
        }
        Relationships: []
      }
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
      calculate_report_completion: {
        Args: { report_id: string }
        Returns: number
      }
      can_edit_custom_plan: {
        Args: { plan_id: string; user_id: string }
        Returns: boolean
      }
      can_manage_campus: {
        Args: { admin_id: string; target_campus_id: string }
        Returns: boolean
      }
      create_notification: {
        Args: {
          p_user_id: string
          p_title: string
          p_message: string
          p_type: string
          p_related_entity_type?: string
          p_related_entity_id?: string
        }
        Returns: string
      }
      get_administrators: {
        Args: Record<PropertyKey, never>
        Returns: {
          admin_id: string
          admin_email: string
          admin_name: string
        }[]
      }
      get_available_plan_types_for_manager: {
        Args: { manager_profile_id: string }
        Returns: {
          id: string
          name: string
          description: string
          min_weekly_hours: number
          max_weekly_hours: number
          field_count: number
        }[]
      }
      get_campus_coordinators: {
        Args: { target_campus_id: string }
        Returns: {
          coordinator_id: string
          coordinator_email: string
          coordinator_name: string
        }[]
      }
      get_campus_coordinators_for_manager: {
        Args: { manager_id: string }
        Returns: {
          coordinator_id: string
          coordinator_email: string
          coordinator_name: string
        }[]
      }
      get_complete_work_plan_details: {
        Args: { plan_id: string }
        Returns: {
          id: string
          title: string
          manager_id: string
          plan_type_id: string
          status: string
          created_at: string
          updated_at: string
          submitted_date: string
          approved_date: string
          approved_by: string
          approval_comments: string
          manager_name: string
          manager_email: string
          manager_position: string
          manager_campus_id: string
          plan_type_name: string
          total_hours_assigned: number
          program_name: string
          campus_name: string
          faculty_name: string
          objectives: string
          assignments_data: Json
        }[]
      }
      get_managers_by_coordinator_campus: {
        Args: { coordinator_id: string }
        Returns: {
          manager_id: string
          manager_name: string
          manager_email: string
          campus_id: string
          campus_name: string
        }[]
      }
      get_next_version_number: {
        Args: { p_manager_report_id: string; p_template_id: string }
        Returns: number
      }
      get_pending_work_plans_with_details: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          title: string
          manager_id: string
          plan_type_id: string
          status: string
          created_at: string
          updated_at: string
          submitted_date: string
          approved_date: string
          approved_by: string
          approval_comments: string
          manager_name: string
          manager_email: string
          manager_position: string
          plan_type_name: string
          total_hours_assigned: number
          program_name: string
          campus_name: string
          faculty_name: string
          objectives: string
          assignments_data: Json
        }[]
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_campus_coordinator: {
        Args: { user_id: string }
        Returns: boolean
      }
      is_period_active: {
        Args: { period_id: string }
        Returns: boolean
      }
      is_program_director: {
        Args: { user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      field_type:
        | "numeric"
        | "short_text"
        | "long_text"
        | "dropdown"
        | "file"
        | "section"
        | "manager_name"
        | "campus_name"
        | "program_director"
        | "strategic_axes"
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      field_type: [
        "numeric",
        "short_text",
        "long_text",
        "dropdown",
        "file",
        "section",
        "manager_name",
        "campus_name",
        "program_director",
        "strategic_axes",
      ],
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
