-- Create table for agreements management
CREATE TABLE public.agreements (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code text,
  country text NOT NULL,
  foreign_institution_name text NOT NULL,
  agreement_nature text,
  object text,
  agreement_type text,
  modality text,
  signature_date date,
  termination_date date,
  duration_years numeric,
  remaining_days integer,
  status text,
  renewal_info text,
  campus_id uuid,
  faculty_id uuid,
  programs text[],
  observations text,
  relation_date date,
  digital_folder_link text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  created_by uuid
);

-- Enable RLS
ALTER TABLE public.agreements ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Administrators can manage all agreements"
ON public.agreements
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'Administrador'
  )
);

CREATE POLICY "Coordinators can manage agreements for their campus"
ON public.agreements
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() 
    AND p.role = 'Coordinador'
    AND (
      p.managed_campus_ids IS NULL OR 
      agreements.campus_id = ANY(p.managed_campus_ids) OR
      agreements.campus_id = p.campus_id
    )
  )
);

CREATE POLICY "Managers can view agreements"
ON public.agreements
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role IN ('Gestor', 'Coordinador', 'Administrador')
  )
);

-- Create function to update timestamps
CREATE TRIGGER update_agreements_updated_at
BEFORE UPDATE ON public.agreements
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_agreements_country ON public.agreements(country);
CREATE INDEX idx_agreements_status ON public.agreements(status);
CREATE INDEX idx_agreements_campus ON public.agreements(campus_id);
CREATE INDEX idx_agreements_termination_date ON public.agreements(termination_date);