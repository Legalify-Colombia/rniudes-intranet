
-- Crear tabla para notificaciones automáticas
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('info', 'warning', 'success', 'error')),
  is_read BOOLEAN DEFAULT false,
  related_entity_type TEXT, -- 'manager_report', 'work_plan', etc.
  related_entity_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS en notificaciones
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Políticas para notificaciones
CREATE POLICY "Users can view their own notifications" 
  ON notifications 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" 
  ON notifications 
  FOR INSERT 
  WITH CHECK (true);

-- Modificar manager_reports para incluir versión automática
ALTER TABLE manager_reports 
ADD COLUMN IF NOT EXISTS version_number INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS is_final_version BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS completion_percentage NUMERIC(5,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS requires_improvement_plan BOOLEAN DEFAULT false;

-- Crear tabla para planes de mejora
CREATE TABLE IF NOT EXISTS improvement_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  manager_report_id UUID NOT NULL REFERENCES manager_reports(id) ON DELETE CASCADE,
  manager_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  improvement_actions TEXT[],
  expected_completion_date DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS en planes de mejora
ALTER TABLE improvement_plans ENABLE ROW LEVEL SECURITY;

-- Políticas para planes de mejora
CREATE POLICY "Users can view improvement plans based on permissions" 
  ON improvement_plans 
  FOR SELECT 
  USING (
    manager_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('Administrador', 'Coordinador')
    )
  );

CREATE POLICY "Managers and admins can create improvement plans" 
  ON improvement_plans 
  FOR INSERT 
  WITH CHECK (
    manager_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('Administrador', 'Coordinador')
    )
  );

-- Función para calcular porcentaje de completitud del informe
CREATE OR REPLACE FUNCTION calculate_report_completion(report_id UUID)
RETURNS NUMERIC AS $$
DECLARE
    total_progress NUMERIC := 0;
    total_products INTEGER := 0;
    avg_progress NUMERIC := 0;
BEGIN
    SELECT 
        AVG(ppr.progress_percentage),
        COUNT(*)
    INTO avg_progress, total_products
    FROM product_progress_reports ppr
    WHERE ppr.manager_report_id = report_id;
    
    RETURN COALESCE(avg_progress, 0);
END;
$$ LANGUAGE plpgsql;

-- Función para crear notificaciones automáticas
CREATE OR REPLACE FUNCTION create_notification(
    p_user_id UUID,
    p_title TEXT,
    p_message TEXT,
    p_type TEXT,
    p_related_entity_type TEXT DEFAULT NULL,
    p_related_entity_id UUID DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    notification_id UUID;
BEGIN
    INSERT INTO notifications (user_id, title, message, type, related_entity_type, related_entity_id)
    VALUES (p_user_id, p_title, p_message, p_type, p_related_entity_type, p_related_entity_id)
    RETURNING id INTO notification_id;
    
    RETURN notification_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger para notificar automáticamente cuando se actualiza un informe
CREATE OR REPLACE FUNCTION notify_report_update()
RETURNS TRIGGER AS $$
DECLARE
    admin_user RECORD;
    coordinator_user RECORD;
    manager_name TEXT;
    completion_pct NUMERIC;
BEGIN
    -- Obtener nombre del gestor
    SELECT full_name INTO manager_name
    FROM profiles
    WHERE id = NEW.manager_id;
    
    -- Calcular porcentaje de completitud
    completion_pct := calculate_report_completion(NEW.id);
    
    -- Actualizar porcentaje en el informe
    UPDATE manager_reports 
    SET completion_percentage = completion_pct
    WHERE id = NEW.id;
    
    -- Si el informe cambia a submitted, notificar a administradores y coordinadores
    IF NEW.status = 'submitted' AND (OLD.status IS NULL OR OLD.status != 'submitted') THEN
        -- Notificar a administradores
        FOR admin_user IN 
            SELECT id FROM profiles WHERE role = 'Administrador'
        LOOP
            PERFORM create_notification(
                admin_user.id,
                'Nuevo informe de progreso enviado',
                format('El gestor %s ha enviado un informe de progreso con %s%% de completitud', 
                       manager_name, ROUND(completion_pct, 1)),
                'info',
                'manager_report',
                NEW.id
            );
        END LOOP;
        
        -- Notificar a coordinadores
        FOR coordinator_user IN 
            SELECT id FROM profiles WHERE role = 'Coordinador'
        LOOP
            PERFORM create_notification(
                coordinator_user.id,
                'Nuevo informe de progreso enviado',
                format('El gestor %s ha enviado un informe de progreso con %s%% de completitud', 
                       manager_name, ROUND(completion_pct, 1)),
                'info',
                'manager_report',
                NEW.id
            );
        END LOOP;
        
        -- Si la completitud es menor al 70%, marcar como requiere plan de mejora
        IF completion_pct < 70 THEN
            UPDATE manager_reports 
            SET requires_improvement_plan = true
            WHERE id = NEW.id;
            
            -- Notificar que requiere plan de mejora
            FOR admin_user IN 
                SELECT id FROM profiles WHERE role IN ('Administrador', 'Coordinador')
            LOOP
                PERFORM create_notification(
                    admin_user.id,
                    'Informe requiere plan de mejora',
                    format('El informe de %s tiene solo %s%% de completitud. Se requiere un plan de mejora.', 
                           manager_name, ROUND(completion_pct, 1)),
                    'warning',
                    'manager_report',
                    NEW.id
                );
            END LOOP;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear el trigger
CREATE TRIGGER trigger_notify_report_update
    AFTER UPDATE ON manager_reports
    FOR EACH ROW
    EXECUTE FUNCTION notify_report_update();

-- Índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_manager_reports_version ON manager_reports(manager_id, version_number);
