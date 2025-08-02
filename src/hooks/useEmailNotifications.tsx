import { supabase } from "@/integrations/supabase/client";
import type { Result } from "@/types/supabase";

export interface EmailTemplate {
  id?: string;
  name: string;
  template_type: string;
  subject: string;
  html_content: string;
  variables?: any;
  campus_id?: string;
  is_active: boolean;
  description?: string;
  created_by?: string;
}

export interface EmailConfiguration {
  id?: string;
  campus_id?: string;
  resend_api_key?: string;
  from_email: string;
  from_name: string;
  test_email?: string;
  is_active: boolean;
  created_by?: string;
}

export function useEmailNotifications() {
  const fetchEmailTemplates = async (): Promise<Result<EmailTemplate[]>> => {
    try {
      const { data, error } = await supabase
        .from("email_templates")
        .select("*")
        .order("created_at", { ascending: false });

      return { data: data || [], error };
    } catch (error) {
      console.error("Error fetching email templates:", error);
      return { data: [], error: error as any };
    }
  };

  const createEmailTemplate = async (template: EmailTemplate): Promise<Result<EmailTemplate>> => {
    try {
      const { data, error } = await supabase
        .from("email_templates")
        .insert(template)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error("Error creating email template:", error);
      return { data: null, error: error as any };
    }
  };

  const updateEmailTemplate = async (id: string, updates: Partial<EmailTemplate>): Promise<Result<EmailTemplate>> => {
    try {
      const { data, error } = await supabase
        .from("email_templates")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error("Error updating email template:", error);
      return { data: null, error: error as any };
    }
  };

  const deleteEmailTemplate = async (id: string): Promise<Result<void>> => {
    try {
      const { error } = await supabase
        .from("email_templates")
        .delete()
        .eq("id", id);

      return { data: undefined, error };
    } catch (error) {
      console.error("Error deleting email template:", error);
      return { data: undefined, error: error as any };
    }
  };

  const fetchEmailConfigurations = async (): Promise<Result<EmailConfiguration[]>> => {
    try {
      const { data, error } = await supabase
        .from("email_configurations")
        .select("*")
        .order("created_at", { ascending: false });

      return { data: data || [], error };
    } catch (error) {
      console.error("Error fetching email configurations:", error);
      return { data: [], error: error as any };
    }
  };

  const saveEmailConfiguration = async (config: EmailConfiguration): Promise<Result<EmailConfiguration>> => {
    try {
      let result;
      if (config.id) {
        result = await supabase
          .from("email_configurations")
          .update(config)
          .eq("id", config.id)
          .select()
          .single();
      } else {
        result = await supabase
          .from("email_configurations")
          .insert(config)
          .select()
          .single();
      }

      return { data: result.data, error: result.error };
    } catch (error) {
      console.error("Error saving email configuration:", error);
      return { data: null, error: error as any };
    }
  };

  const fetchEmailNotifications = async (limit: number = 50): Promise<Result<any[]>> => {
    try {
      const { data, error } = await supabase
        .from("email_notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      return { data: data || [], error };
    } catch (error) {
      console.error("Error fetching email notifications:", error);
      return { data: [], error: error as any };
    }
  };

  const sendTestEmail = async (templateType: string, recipientEmail: string, variables: any = {}, campusId?: string): Promise<Result<any>> => {
    try {
      const { data, error } = await supabase.functions.invoke('send-email-notification', {
        body: {
          templateType,
          recipientEmails: [recipientEmail],
          variables,
          campusId
        }
      });

      return { data, error };
    } catch (error) {
      console.error("Error sending test email:", error);
      return { data: null, error: error as any };
    }
  };

  return {
    fetchEmailTemplates,
    createEmailTemplate,
    updateEmailTemplate,
    deleteEmailTemplate,
    fetchEmailConfigurations,
    saveEmailConfiguration,
    fetchEmailNotifications,
    sendTestEmail,
  };
}