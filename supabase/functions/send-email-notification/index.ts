import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailNotificationRequest {
  templateType: string;
  recipientEmails: string[];
  variables: Record<string, any>;
  campusId?: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      templateType,
      recipientEmails,
      variables,
      campusId,
      relatedEntityType,
      relatedEntityId
    }: EmailNotificationRequest = await req.json();

    console.log('Processing email notification:', {
      templateType,
      recipientCount: recipientEmails.length,
      campusId
    });

    // Get email configuration for campus
    let emailConfig = null;
    if (campusId) {
      const { data: config } = await supabase
        .from('email_configurations')
        .select('*')
        .eq('campus_id', campusId)
        .eq('is_active', true)
        .single();
      emailConfig = config;
    }

    // If no campus config, try to get default/global config
    if (!emailConfig) {
      const { data: globalConfig } = await supabase
        .from('email_configurations')
        .select('*')
        .is('campus_id', null)
        .eq('is_active', true)
        .single();
      emailConfig = globalConfig;
    }

    if (!emailConfig?.resend_api_key) {
      throw new Error('No se encontró configuración de email válida');
    }

    // Get email template
    const { data: template } = await supabase
      .from('email_templates')
      .select('*')
      .eq('template_type', templateType)
      .eq('is_active', true)
      .or(`campus_id.eq.${campusId},campus_id.is.null`)
      .order('campus_id', { ascending: false, nullsFirst: false })
      .limit(1)
      .single();

    if (!template) {
      throw new Error(`No se encontró plantilla para: ${templateType}`);
    }

    // Replace variables in template
    let subject = template.subject;
    let content = template.html_content;

    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `{{${key}}}`;
      subject = subject.replace(new RegExp(placeholder, 'g'), String(value));
      content = content.replace(new RegExp(placeholder, 'g'), String(value));
    }

    // Initialize Resend with the configuration
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${emailConfig.resend_api_key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${emailConfig.from_name} <${emailConfig.from_email}>`,
        to: recipientEmails,
        subject: subject,
        html: content,
      }),
    });

    const emailResult = await resendResponse.json();

    if (!resendResponse.ok) {
      throw new Error(`Error enviando email: ${JSON.stringify(emailResult)}`);
    }

    // Log notification for each recipient
    const notifications = recipientEmails.map(email => ({
      template_id: template.id,
      recipient_email: email,
      recipient_name: variables.recipient_name || '',
      subject: subject,
      content: content,
      status: 'sent',
      sent_at: new Date().toISOString(),
      related_entity_type: relatedEntityType,
      related_entity_id: relatedEntityId,
      campus_id: campusId,
    }));

    await supabase
      .from('email_notifications')
      .insert(notifications);

    console.log('Email notification sent successfully:', {
      templateType,
      recipientCount: recipientEmails.length,
      resendId: emailResult.id
    });

    return new Response(JSON.stringify({
      success: true,
      message: 'Notificación enviada correctamente',
      resendId: emailResult.id,
      recipientCount: recipientEmails.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in send-email-notification function:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
};

serve(handler);