
-- Verificar y corregir las relaciones entre tablas
-- Asegurar que las tablas tienen las columnas correctas

-- Verificar estructura de faculties
ALTER TABLE faculties 
ADD COLUMN IF NOT EXISTS description TEXT;

-- Verificar estructura de academic_programs
ALTER TABLE academic_programs 
ADD COLUMN IF NOT EXISTS description TEXT;

-- Asegurar que las foreign keys están correctamente configuradas
-- Para faculties -> campus
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'faculties_campus_id_fkey'
  ) THEN
    ALTER TABLE faculties 
    ADD CONSTRAINT faculties_campus_id_fkey 
    FOREIGN KEY (campus_id) REFERENCES campus(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Para academic_programs -> campus
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'academic_programs_campus_id_fkey'
  ) THEN
    ALTER TABLE academic_programs 
    ADD CONSTRAINT academic_programs_campus_id_fkey 
    FOREIGN KEY (campus_id) REFERENCES campus(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Para academic_programs -> faculties
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'academic_programs_faculty_id_fkey'
  ) THEN
    ALTER TABLE academic_programs 
    ADD CONSTRAINT academic_programs_faculty_id_fkey 
    FOREIGN KEY (faculty_id) REFERENCES faculties(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Para academic_programs -> profiles (manager)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'academic_programs_manager_id_fkey'
  ) THEN
    ALTER TABLE academic_programs 
    ADD CONSTRAINT academic_programs_manager_id_fkey 
    FOREIGN KEY (manager_id) REFERENCES profiles(id) ON DELETE SET NULL;
  END IF;
END $$;
