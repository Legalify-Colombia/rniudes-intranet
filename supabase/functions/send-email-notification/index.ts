// Importa los módulos necesarios
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

// Define las cabeceras CORS para permitir solicitudes desde cualquier origen.
// En producción, es recomendable restringirlo a tu dominio: 'https://tu-dominio.com'
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Interfaz para tipar los datos esperados en la solicitud
interface EmailNotificationRequest {
  templateType: string;
  recipientEmails: string[];
  variables: Record<string, any>;
  campusId?: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
}

// Crea el cliente de Supabase usando las variables de entorno
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// Inicia el servidor para escuchar las solicitudes
serve(async (req: Request) => {
  console.log(`Función invocada con método: ${req.method}`);

  // --- MANEJO DE CORS PREFLIGHT ---
  // Esta es la parte crucial. Responde inmediatamente a las solicitudes OPTIONS
  // con un status 200 OK y las cabeceras correctas.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Extrae y valida los datos del cuerpo de la solicitud
    const {
      templateType,
      recipientEmails,
      variables,
      campusId,
      relatedEntityType,
      relatedEntityId
    }: EmailNotificationRequest = await req.json();

    if (!templateType || !recipientEmails || recipientEmails.length === 0) {
        throw new Error("Faltan parámetros requeridos: templateType o recipientEmails.");
    }

    console.log('Procesando notificación para:', { templateType, campusId });

    // --- OBTENER CONFIGURACIÓN DE EMAIL ---
    let emailConfig = null;
    if (campusId) {
      const { data, error } = await supabase
        .from('email_configurations')
        .select('*')
        .eq('campus_id', campusId)
        .eq('is_active', true)
        .single();
      if (error && error.code !== 'PGRST116') throw error; // Ignora el error "no rows found"
      emailConfig = data;
    }

    if (!emailConfig) {
      const { data, error } = await supabase
        .from('email_configurations')
        .select('*')
        .is('campus_id', null)
        .eq('is_active', true)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      emailConfig = data;
    }

    if (!emailConfig?.resend_api_key) {
      throw new Error('No se encontró una configuración de email válida o activa.');
    }

  // --- OBTENER PLANTILLA DE EMAIL ---
const { data: template, error: templateError } = await supabase
  .from('email_templates')
  // ... (condiciones de la búsqueda)
  .single();

if (templateError) throw templateError; // <-- ¡AQUÍ ESTÁ EL FALLO!
if (!template) {
  throw new Error(`No se encontró una plantilla activa para el tipo: ${templateType}`);
}

    // --- REEMPLAZAR VARIABLES EN LA PLANTILLA ---
    let subject = template.subject;
    let content = template.html_content;
    for (const [key, value] of Object.entries(variables)) {
      const placeholder = new RegExp(`{{${key}}}`, 'g');
      subject = subject.replace(placeholder, String(value ?? ''));
      content = content.replace(placeholder, String(value ?? ''));
    }

    // --- ENVIAR EMAIL CON RESEND ---
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${emailConfig.resend_api_key}`,
        'Content-Type': 'application/json',
        ...corsHeaders
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
      console.error('Error desde la API de Resend:', emailResult);
      throw new Error(`Error enviando email: ${JSON.stringify(emailResult.error?.message || emailResult)}`);
    }

    // --- REGISTRAR NOTIFICACIÓN EN LA BASE DE DATOS ---
    const notifications = recipientEmails.map(email => ({
      template_id: template.id,
      recipient_email: email,
      recipient_name: variables.recipient_name || '',
      subject: subject,
      content: 'Contenido del email enviado.', // Evita guardar todo el HTML si es muy largo
      status: 'sent',
      sent_at: new Date().toISOString(),
      related_entity_type: relatedEntityType,
      related_entity_id: relatedEntityId,
      campus_id: campusId,
    }));

    const { error: insertError } = await supabase.from('email_notifications').insert(notifications);
    if (insertError) {
        console.error("Error al guardar notificación en DB:", insertError);
        // No lanzamos un error aquí para no fallar si el email ya se envió.
    }

    console.log('Notificación por email enviada exitosamente.');

    return new Response(JSON.stringify({ success: true, message: 'Notificación enviada correctamente', resendId: emailResult.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error en la función send-email-notification:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500, // Usar 500 para errores internos del servidor
    });
  }
});
