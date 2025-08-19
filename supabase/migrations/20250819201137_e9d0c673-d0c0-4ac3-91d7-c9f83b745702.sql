-- Crear tabla para comentarios y observaciones de convenios
CREATE TABLE IF NOT EXISTS public.agreement_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agreement_id UUID NOT NULL REFERENCES public.agreements(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  comment_text TEXT NOT NULL,
  comment_type TEXT DEFAULT 'comment' CHECK (comment_type IN ('comment', 'observation', 'status_change')),
  old_status TEXT,
  new_status TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agregar campos de estado mejorado a la tabla agreements
ALTER TABLE public.agreements 
ADD COLUMN IF NOT EXISTS current_status TEXT DEFAULT 'active' 
CHECK (current_status IN ('active', 'expired', 'suspended', 'under_review', 'renewed', 'terminated'));

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_agreement_comments_agreement_id ON public.agreement_comments(agreement_id);
CREATE INDEX IF NOT EXISTS idx_agreement_comments_created_at ON public.agreement_comments(created_at DESC);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION public.update_agreement_comments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'agreement_comments_updated_at') THEN
    CREATE TRIGGER agreement_comments_updated_at
      BEFORE UPDATE ON public.agreement_comments
      FOR EACH ROW
      EXECUTE FUNCTION public.update_agreement_comments_updated_at();
  END IF;
END$$;

-- RLS policies para agreement_comments
ALTER TABLE public.agreement_comments ENABLE ROW LEVEL SECURITY;

-- Los usuarios autenticados pueden ver comentarios
CREATE POLICY "Authenticated users can read agreement comments"
  ON public.agreement_comments
  FOR SELECT
  TO authenticated
  USING (true);

-- Los usuarios pueden crear comentarios
CREATE POLICY "Authenticated users can create agreement comments"
  ON public.agreement_comments
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Los usuarios pueden actualizar sus propios comentarios
CREATE POLICY "Users can update their own agreement comments"
  ON public.agreement_comments
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Solo administradores y coordinadores pueden eliminar comentarios
CREATE POLICY "Admins and coordinators can delete agreement comments"
  ON public.agreement_comments
  FOR DELETE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('Administrador', 'Coordinador')
  ));