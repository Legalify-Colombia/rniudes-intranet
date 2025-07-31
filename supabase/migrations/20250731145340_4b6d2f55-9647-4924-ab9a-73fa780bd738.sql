-- Crear tablas para el sistema de notificaciones por email

-- Tabla para configuración de email por campus
CREATE TABLE IF NOT EXISTS email_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campus_id UUID REFERENCES campus(id) ON DELETE CASCADE,
  resend_api_key TEXT,
  from_email TEXT NOT NULL DEFAULT 'no-reply@universidad.edu.co',
  from_name TEXT NOT NULL DEFAULT 'Sistema Universitario',
  is_active BOOLEAN DEFAULT true,
  test_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES profiles(id),
  UNIQUE(campus_id)
);

-- Tabla para plantillas de email
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  template_type TEXT NOT NULL, -- 'plan_submitted', 'plan_assigned', 'plan_approved', 'report_submitted', etc.
  subject TEXT NOT NULL,
  html_content TEXT NOT NULL,
  variables JSONB DEFAULT '[]'::jsonb, -- Variables disponibles para reemplazo
  is_active BOOLEAN DEFAULT true,
  campus_id UUID REFERENCES campus(id), -- NULL para plantillas globales
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES profiles(id)
);

-- Tabla para registro de notificaciones enviadas
CREATE TABLE IF NOT EXISTS email_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES email_templates(id),
  recipient_email TEXT NOT NULL,
  recipient_name TEXT,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'sent', 'failed'
  error_message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  related_entity_type TEXT, -- 'custom_plan', 'manager_report', 'snies_report'
  related_entity_id UUID,
  campus_id UUID REFERENCES campus(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS en las nuevas tablas
ALTER TABLE email_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_notifications ENABLE ROW LEVEL SECURITY;

-- Políticas para email_configurations
CREATE POLICY "Coordinadores pueden gestionar configuración de su campus"
ON email_configurations
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
    AND (
      p.role = 'Administrador' OR
      (p.role = 'Coordinador' AND (p.managed_campus_ids IS NULL OR campus_id = ANY(p.managed_campus_ids)))
    )
  )
);

-- Políticas para email_templates
CREATE POLICY "Coordinadores pueden gestionar plantillas de su campus"
ON email_templates
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
    AND (
      p.role = 'Administrador' OR
      (p.role = 'Coordinador' AND (campus_id IS NULL OR p.managed_campus_ids IS NULL OR campus_id = ANY(p.managed_campus_ids)))
    )
  )
);

-- Políticas para email_notifications (solo lectura para coordinadores y admins)
CREATE POLICY "Coordinadores pueden ver notificaciones de su campus"
ON email_notifications
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
    AND (
      p.role = 'Administrador' OR
      (p.role = 'Coordinador' AND (p.managed_campus_ids IS NULL OR campus_id = ANY(p.managed_campus_ids)))
    )
  )
);

-- Insertar plantillas por defecto
INSERT INTO email_templates (name, description, template_type, subject, html_content, variables) VALUES
(
  'Plan Presentado',
  'Notificación cuando un gestor presenta un plan de trabajo',
  'plan_submitted',
  'Nuevo Plan de Trabajo Presentado - {{plan_title}}',
  '<h1>Plan de Trabajo Presentado</h1>
   <p>Estimado coordinador,</p>
   <p>El gestor <strong>{{manager_name}}</strong> ha presentado un nuevo plan de trabajo:</p>
   <ul>
     <li><strong>Título:</strong> {{plan_title}}</li>
     <li><strong>Tipo de Plan:</strong> {{plan_type_name}}</li>
     <li><strong>Campus:</strong> {{campus_name}}</li>
     <li><strong>Fecha de Presentación:</strong> {{submitted_date}}</li>
   </ul>
   <p>Por favor, revise el plan en el sistema para proceder con la aprobación.</p>
   <p>Saludos cordiales,<br>Sistema Universitario</p>',
  '["manager_name", "plan_title", "plan_type_name", "campus_name", "submitted_date"]'::jsonb
),
(
  'Plan Aprobado',
  'Notificación cuando un plan es aprobado',
  'plan_approved',
  'Su Plan de Trabajo ha sido Aprobado - {{plan_title}}',
  '<h1>Plan de Trabajo Aprobado</h1>
   <p>Estimado {{manager_name}},</p>
   <p>Su plan de trabajo <strong>{{plan_title}}</strong> ha sido aprobado por el coordinador.</p>
   <p><strong>Comentarios:</strong> {{approval_comments}}</p>
   <p>Ya puede comenzar con la ejecución de las actividades planificadas.</p>
   <p>Saludos cordiales,<br>Sistema Universitario</p>',
  '["manager_name", "plan_title", "approval_comments"]'::jsonb
),
(
  'Plan Rechazado',
  'Notificación cuando un plan es rechazado',
  'plan_rejected',
  'Su Plan de Trabajo Requiere Revisión - {{plan_title}}',
  '<h1>Plan de Trabajo Requiere Revisión</h1>
   <p>Estimado {{manager_name}},</p>
   <p>Su plan de trabajo <strong>{{plan_title}}</strong> requiere revisión.</p>
   <p><strong>Observaciones:</strong> {{approval_comments}}</p>
   <p>Por favor, realice las correcciones necesarias y vuelva a presentar el plan.</p>
   <p>Saludos cordiales,<br>Sistema Universitario</p>',
  '["manager_name", "plan_title", "approval_comments"]'::jsonb
),
(
  'Informe Presentado',
  'Notificación cuando se presenta un informe basado en plantilla',
  'report_submitted',
  'Nuevo Informe Presentado - {{report_title}}',
  '<h1>Informe Presentado</h1>
   <p>Estimado coordinador,</p>
   <p>El gestor <strong>{{manager_name}}</strong> ha presentado un nuevo informe:</p>
   <ul>
     <li><strong>Título:</strong> {{report_title}}</li>
     <li><strong>Plantilla:</strong> {{template_name}}</li>
     <li><strong>Período:</strong> {{report_period}}</li>
     <li><strong>Campus:</strong> {{campus_name}}</li>
   </ul>
   <p>Por favor, revise el informe en el sistema.</p>
   <p>Saludos cordiales,<br>Sistema Universitario</p>',
  '["manager_name", "report_title", "template_name", "report_period", "campus_name"]'::jsonb
),
(
  'Reporte SNIES Presentado',
  'Notificación cuando se presenta un reporte SNIES',
  'snies_report_submitted',
  'Nuevo Reporte SNIES Presentado - {{report_title}}',
  '<h1>Reporte SNIES Presentado</h1>
   <p>Estimado administrador,</p>
   <p>El gestor <strong>{{manager_name}}</strong> ha presentado un nuevo reporte SNIES:</p>
   <ul>
     <li><strong>Título:</strong> {{report_title}}</li>
     <li><strong>Campus:</strong> {{campus_name}}</li>
     <li><strong>Fecha de Presentación:</strong> {{submitted_date}}</li>
   </ul>
   <p>Por favor, revise el reporte en el sistema.</p>
   <p>Saludos cordiales,<br>Sistema Universitario</p>',
  '["manager_name", "report_title", "campus_name", "submitted_date"]'::jsonb
);

-- Función para obtener coordinadores de un campus
CREATE OR REPLACE FUNCTION get_campus_coordinators(target_campus_id UUID)
RETURNS TABLE(coordinator_id UUID, coordinator_email TEXT, coordinator_name TEXT)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.email,
    p.full_name
  FROM profiles p
  WHERE p.role = 'Coordinador'
  AND (
    p.managed_campus_ids IS NULL OR 
    target_campus_id = ANY(p.managed_campus_ids)
  );
END;
$$;

-- Función para obtener administradores
CREATE OR REPLACE FUNCTION get_administrators()
RETURNS TABLE(admin_id UUID, admin_email TEXT, admin_name TEXT)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.email,
    p.full_name
  FROM profiles p
  WHERE p.role = 'Administrador';
END;
$$;