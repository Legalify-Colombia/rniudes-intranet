-- Actualizar los permisos de aprobación de planes de trabajo
-- Solo los directores de programa pueden aprobar los planes

-- Crear función para verificar si es director de programa
CREATE OR REPLACE FUNCTION public.is_program_director(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM profiles 
    WHERE id = user_id 
    AND position = 'Director de Programa'
  );
END;
$$;

-- Crear función para verificar si es coordinador de campus
CREATE OR REPLACE FUNCTION public.is_campus_coordinator(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM profiles 
    WHERE id = user_id 
    AND position = 'Coordinador de Campus'
  );
END;
$$;

-- Agregar columna para observaciones del coordinador en custom_plans
ALTER TABLE custom_plans 
ADD COLUMN IF NOT EXISTS coordinator_observations text;

-- Crear tabla para manejar observaciones de coordinadores
CREATE TABLE IF NOT EXISTS plan_observations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id uuid NOT NULL REFERENCES custom_plans(id) ON DELETE CASCADE,
  observer_id uuid NOT NULL REFERENCES profiles(id),
  observation_text text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Habilitar RLS en plan_observations
ALTER TABLE plan_observations ENABLE ROW LEVEL SECURITY;

-- Política para que coordinadores y directores puedan crear observaciones
CREATE POLICY "Coordinadores y directores pueden crear observaciones"
ON plan_observations
FOR INSERT
WITH CHECK (
  public.is_campus_coordinator(auth.uid()) OR 
  public.is_program_director(auth.uid()) OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'Administrador')
);

-- Política para que coordinadores y directores puedan ver observaciones
CREATE POLICY "Coordinadores y directores pueden ver observaciones"
ON plan_observations
FOR SELECT
USING (
  public.is_campus_coordinator(auth.uid()) OR 
  public.is_program_director(auth.uid()) OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'Administrador')
);

-- Política para que puedan actualizar sus propias observaciones
CREATE POLICY "Pueden actualizar sus propias observaciones"
ON plan_observations
FOR UPDATE
USING (observer_id = auth.uid());

-- Actualizar las políticas de custom_plans para restringir aprobación solo a directores de programa
DROP POLICY IF EXISTS "Coordinators can approve work plans" ON custom_plans;

-- Nueva política: Solo directores de programa pueden aprobar planes
CREATE POLICY "Solo directores de programa pueden aprobar planes"
ON custom_plans
FOR UPDATE
USING (
  (manager_id = auth.uid()) OR 
  (public.is_program_director(auth.uid()) AND status = 'submitted') OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'Administrador')
);

-- Coordinadores pueden agregar observaciones pero no aprobar
CREATE POLICY "Coordinadores pueden agregar observaciones"
ON custom_plans
FOR UPDATE
USING (
  public.is_campus_coordinator(auth.uid()) AND 
  coordinator_observations IS DISTINCT FROM OLD.coordinator_observations AND
  status = OLD.status -- No pueden cambiar el status
);

-- Crear tabla para habilitar informes automáticamente cuando se aprueba un plan
CREATE TABLE IF NOT EXISTS auto_generated_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  custom_plan_id uuid NOT NULL REFERENCES custom_plans(id) ON DELETE CASCADE,
  template_id uuid REFERENCES report_templates(id),
  manager_id uuid NOT NULL REFERENCES profiles(id),
  report_period_id uuid REFERENCES report_periods(id),
  due_date timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  status text DEFAULT 'pending',
  UNIQUE(custom_plan_id, template_id)
);

-- Habilitar RLS en auto_generated_reports
ALTER TABLE auto_generated_reports ENABLE ROW LEVEL SECURITY;

-- Política para gestores ver sus informes auto-generados
CREATE POLICY "Gestores pueden ver sus informes auto-generados"
ON auto_generated_reports
FOR SELECT
USING (
  manager_id = auth.uid() OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('Administrador', 'Coordinador'))
);

-- Política para administradores gestionar informes auto-generados
CREATE POLICY "Administradores pueden gestionar informes auto-generados"
ON auto_generated_reports
FOR ALL
USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'Administrador')
);

-- Crear trigger para generar informes automáticamente cuando se aprueba un plan
CREATE OR REPLACE FUNCTION public.generate_auto_reports_on_plan_approval()
RETURNS trigger
LANGUAGE plpgsql
AS $$
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
$$;

-- Crear el trigger
DROP TRIGGER IF EXISTS trigger_generate_auto_reports ON custom_plans;
CREATE TRIGGER trigger_generate_auto_reports
    AFTER UPDATE ON custom_plans
    FOR EACH ROW
    EXECUTE FUNCTION public.generate_auto_reports_on_plan_approval();

-- Agregar columnas necesarias a report_templates si no existen
ALTER TABLE report_templates 
ADD COLUMN IF NOT EXISTS linked_plan_type_id uuid REFERENCES plan_types(id),
ADD COLUMN IF NOT EXISTS auto_generate_on_approval boolean DEFAULT false;