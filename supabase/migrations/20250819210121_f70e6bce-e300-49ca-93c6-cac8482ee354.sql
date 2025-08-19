-- Crear tabla para bitácora/historial de convenios
CREATE TABLE public.agreement_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agreement_id UUID NOT NULL,
  action_type TEXT NOT NULL, -- 'status_change', 'observation', 'renewal', 'creation', 'update'
  previous_status TEXT,
  new_status TEXT,
  comment TEXT,
  user_id UUID NOT NULL,
  user_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.agreement_audit_log ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view audit log for agreements they can see" 
ON public.agreement_audit_log FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.agreements a 
    WHERE a.id = agreement_audit_log.agreement_id
  )
);

CREATE POLICY "Authenticated users can create audit entries" 
ON public.agreement_audit_log FOR INSERT 
WITH CHECK (user_id = auth.uid());

-- Función para crear entradas de bitácora automáticamente
CREATE OR REPLACE FUNCTION public.log_agreement_change()
RETURNS TRIGGER AS $$
DECLARE
  user_profile RECORD;
  action_type_val TEXT := 'update';
BEGIN
  -- Obtener información del usuario
  SELECT full_name INTO user_profile 
  FROM profiles 
  WHERE id = auth.uid();

  -- Determinar el tipo de acción
  IF TG_OP = 'INSERT' THEN
    action_type_val := 'creation';
  ELSIF OLD.current_status IS DISTINCT FROM NEW.current_status THEN
    action_type_val := 'status_change';
  END IF;

  -- Crear entrada en la bitácora
  INSERT INTO public.agreement_audit_log (
    agreement_id,
    action_type,
    previous_status,
    new_status,
    user_id,
    user_name
  ) VALUES (
    COALESCE(NEW.id, OLD.id),
    action_type_val,
    OLD.current_status,
    NEW.current_status,
    auth.uid(),
    COALESCE(user_profile.full_name, 'Usuario')
  );

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para cambios automáticos
CREATE TRIGGER agreement_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.agreements
  FOR EACH ROW
  EXECUTE FUNCTION public.log_agreement_change();

-- Función para agregar observaciones manuales a la bitácora
CREATE OR REPLACE FUNCTION public.add_agreement_observation(
  p_agreement_id UUID,
  p_comment TEXT
)
RETURNS UUID AS $$
DECLARE
  user_profile RECORD;
  audit_id UUID;
BEGIN
  -- Obtener información del usuario
  SELECT full_name INTO user_profile 
  FROM profiles 
  WHERE id = auth.uid();

  -- Crear entrada en la bitácora
  INSERT INTO public.agreement_audit_log (
    agreement_id,
    action_type,
    comment,
    user_id,
    user_name
  ) VALUES (
    p_agreement_id,
    'observation',
    p_comment,
    auth.uid(),
    COALESCE(user_profile.full_name, 'Usuario')
  )
  RETURNING id INTO audit_id;

  RETURN audit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Agregar campo para diferenciar convenios nacionales vs internacionales
ALTER TABLE public.agreements 
ADD COLUMN IF NOT EXISTS is_international BOOLEAN DEFAULT true;