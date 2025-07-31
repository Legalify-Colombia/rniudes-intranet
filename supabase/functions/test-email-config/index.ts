import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TestEmailRequest {
  campusId?: string;
  testEmail: string;
  resendApiKey?: string;
  fromEmail?: string;
  fromName?: string;
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
      campusId,
      testEmail,
      resendApiKey,
      fromEmail,
      fromName
    }: TestEmailRequest = await req.json();

    console.log('Testing email configuration for campus:', campusId);

    let apiKey = resendApiKey;
    let senderEmail = fromEmail || 'no-reply@universidad.edu.co';
    let senderName = fromName || 'Sistema Universitario';

    // If no API key provided, get from database
    if (!apiKey) {
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

      if (!emailConfig) {
        const { data: globalConfig } = await supabase
          .from('email_configurations')
          .select('*')
          .is('campus_id', null)
          .eq('is_active', true)
          .single();
        emailConfig = globalConfig;
      }

      if (!emailConfig) {
        throw new Error('No se encontró configuración de email');
      }

      apiKey = emailConfig.resend_api_key;
      senderEmail = emailConfig.from_email;
      senderName = emailConfig.from_name;
    }

    if (!apiKey) {
      throw new Error('API Key de Resend no configurada');
    }

    // Send test email
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${senderName} <${senderEmail}>`,
        to: [testEmail],
        subject: 'Prueba de Configuración de Email - Sistema Universitario',
        html: `
          <h1>✅ Configuración de Email Exitosa</h1>
          <p>Este es un email de prueba del Sistema Universitario.</p>
          <p><strong>Detalles de la configuración:</strong></p>
          <ul>
            <li><strong>Remitente:</strong> ${senderName} &lt;${senderEmail}&gt;</li>
            <li><strong>Campus ID:</strong> ${campusId || 'Global'}</li>
            <li><strong>Fecha de prueba:</strong> ${new Date().toLocaleString('es-CO')}</li>
          </ul>
          <p>Si recibes este email, la configuración está funcionando correctamente.</p>
          <hr>
          <p><small>Este es un email automático generado por el sistema de notificaciones.</small></p>
        `,
      }),
    });

    const emailResult = await resendResponse.json();

    if (!resendResponse.ok) {
      throw new Error(`Error en Resend: ${JSON.stringify(emailResult)}`);
    }

    // Log test notification
    await supabase
      .from('email_notifications')
      .insert({
        template_id: null,
        recipient_email: testEmail,
        recipient_name: 'Usuario de Prueba',
        subject: 'Prueba de Configuración de Email - Sistema Universitario',
        content: 'Email de prueba enviado correctamente',
        status: 'sent',
        sent_at: new Date().toISOString(),
        related_entity_type: 'test',
        related_entity_id: null,
        campus_id: campusId,
      });

    console.log('Test email sent successfully:', {
      resendId: emailResult.id,
      testEmail,
      campusId
    });

    return new Response(JSON.stringify({
      success: true,
      message: 'Email de prueba enviado correctamente',
      resendId: emailResult.id,
      details: {
        from: `${senderName} <${senderEmail}>`,
        to: testEmail,
        timestamp: new Date().toISOString()
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in test-email-config function:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      details: error.stack
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
};

serve(handler);