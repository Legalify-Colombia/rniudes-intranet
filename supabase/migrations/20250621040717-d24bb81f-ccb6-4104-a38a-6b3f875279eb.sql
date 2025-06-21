
-- Agregar la columna uses_structured_elements a la tabla plan_types
ALTER TABLE public.plan_types 
ADD COLUMN IF NOT EXISTS uses_structured_elements BOOLEAN DEFAULT false;

-- Actualizar los registros existentes para que por defecto no usen elementos estructurados
UPDATE public.plan_types 
SET uses_structured_elements = false 
WHERE uses_structured_elements IS NULL;
