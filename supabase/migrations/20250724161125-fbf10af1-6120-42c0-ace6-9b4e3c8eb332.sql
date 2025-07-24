-- Fase 1: Mejorar configuración híbrida de tipos de plan
-- Agregar columnas para permitir configuración híbrida
ALTER TABLE plan_types 
ADD COLUMN allow_custom_fields BOOLEAN DEFAULT false,
ADD COLUMN allow_structured_elements BOOLEAN DEFAULT false;

-- Actualizar tipos de plan existentes para compatibilidad
UPDATE plan_types 
SET allow_custom_fields = NOT uses_structured_elements,
    allow_structured_elements = uses_structured_elements;

-- Fase 2: Conectar plantillas con tipos de plan
-- Agregar relación entre plantillas de informe y tipos de plan
ALTER TABLE report_templates
ADD COLUMN linked_plan_type_id UUID REFERENCES plan_types(id),
ADD COLUMN auto_generate_on_approval BOOLEAN DEFAULT false,
ADD COLUMN template_type VARCHAR(50) DEFAULT 'manual';

-- Tabla para configuración de campos de plantilla basados en tipos de plan
CREATE TABLE plan_type_template_fields (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_type_id UUID NOT NULL REFERENCES plan_types(id) ON DELETE CASCADE,
    template_id UUID NOT NULL REFERENCES report_templates(id) ON DELETE CASCADE,
    field_name VARCHAR(255) NOT NULL,
    field_type VARCHAR(50) NOT NULL, -- 'hours_report', 'evidence', 'progress', 'observations'
    field_order INTEGER DEFAULT 0,
    is_required BOOLEAN DEFAULT false,
    field_config JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(plan_type_id, template_id, field_name)
);

-- Habilitar RLS en la nueva tabla
ALTER TABLE plan_type_template_fields ENABLE ROW LEVEL SECURITY;

-- Política RLS para administradores
CREATE POLICY "Solo administradores pueden gestionar campos de plantilla"
ON plan_type_template_fields
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'Administrador'
    )
);

-- Política RLS para lectura pública
CREATE POLICY "Todos pueden ver campos de plantilla"
ON plan_type_template_fields
FOR SELECT
USING (true);

-- Fase 3: Mejorar flujo coordinador-gestor
-- Tabla para asignaciones de coordinador a gestor
CREATE TABLE coordinator_manager_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coordinator_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    manager_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    assigned_plan_type_id UUID REFERENCES plan_types(id),
    campus_id UUID REFERENCES campus(id),
    assignment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(coordinator_id, manager_id, assigned_plan_type_id)
);

-- Habilitar RLS
ALTER TABLE coordinator_manager_assignments ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para coordinadores
CREATE POLICY "Coordinadores pueden gestionar sus asignaciones"
ON coordinator_manager_assignments
FOR ALL
USING (
    coordinator_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'Administrador'
    )
);

-- Fase 4: Generación automática de informes
-- Tabla para informes automáticos generados desde planes aprobados
CREATE TABLE auto_generated_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    custom_plan_id UUID NOT NULL REFERENCES custom_plans(id) ON DELETE CASCADE,
    template_id UUID NOT NULL REFERENCES report_templates(id) ON DELETE CASCADE,
    manager_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    report_period_id UUID REFERENCES report_periods(id),
    status VARCHAR(20) DEFAULT 'active',
    generated_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    due_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(custom_plan_id, template_id)
);

-- Habilitar RLS
ALTER TABLE auto_generated_reports ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Gestores pueden ver sus informes automáticos"
ON auto_generated_reports
FOR SELECT
USING (
    manager_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role IN ('Administrador', 'Coordinador')
    )
);

CREATE POLICY "Gestores pueden actualizar sus informes automáticos"
ON auto_generated_reports
FOR UPDATE
USING (
    manager_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role IN ('Administrador', 'Coordinador')
    )
);

-- Función para generar informes automáticamente cuando un plan es aprobado
CREATE OR REPLACE FUNCTION generate_auto_reports_on_plan_approval()
RETURNS TRIGGER AS $$
BEGIN
    -- Solo generar informes cuando el plan cambia a 'approved'
    IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
        -- Buscar plantillas configuradas para auto-generación para este tipo de plan
        INSERT INTO auto_generated_reports (custom_plan_id, template_id, manager_id, report_period_id, due_date)
        SELECT 
            NEW.id,
            rt.id,
            NEW.manager_id,
            rp.id,
            (NOW() + INTERVAL '30 days')::TIMESTAMP WITH TIME ZONE
        FROM report_templates rt
        CROSS JOIN report_periods rp
        WHERE rt.linked_plan_type_id = NEW.plan_type_id
          AND rt.auto_generate_on_approval = true
          AND rp.is_active = true
          AND rp.end_date >= CURRENT_DATE
        ON CONFLICT (custom_plan_id, template_id) DO NOTHING;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para generar informes automáticamente
CREATE TRIGGER trigger_generate_auto_reports
    AFTER UPDATE ON custom_plans
    FOR EACH ROW
    EXECUTE FUNCTION generate_auto_reports_on_plan_approval();

-- Función auxiliar para obtener gestores por campus del coordinador
CREATE OR REPLACE FUNCTION get_managers_by_coordinator_campus(coordinator_id UUID)
RETURNS TABLE (
    manager_id UUID,
    manager_name TEXT,
    manager_email TEXT,
    campus_id UUID,
    campus_name TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.full_name,
        p.email,
        c.id,
        c.name
    FROM profiles p
    JOIN campus c ON p.campus_id = c.id
    WHERE p.role = 'Gestor'
      AND p.campus_id IN (
          SELECT UNNEST(coord.managed_campus_ids)
          FROM profiles coord
          WHERE coord.id = coordinator_id
            AND coord.role = 'Coordinador'
      );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;