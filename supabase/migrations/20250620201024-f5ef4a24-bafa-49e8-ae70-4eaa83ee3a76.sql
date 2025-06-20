
-- Crear política para permitir a los gestores crear reportes SNIES
CREATE POLICY "Allow gestores to create their own snies reports" ON public.snies_reports
  FOR INSERT TO authenticated 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'Gestor'
    ) 
    AND manager_id = auth.uid()
  );

-- Política para permitir a los gestores leer sus propios reportes
CREATE POLICY "Allow gestores to read their own snies reports" ON public.snies_reports
  FOR SELECT TO authenticated 
  USING (
    manager_id = auth.uid() 
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('Administrador', 'Coordinador')
    )
  );

-- Política para permitir a los gestores actualizar sus propios reportes en borrador
CREATE POLICY "Allow gestores to update their own draft snies reports" ON public.snies_reports
  FOR UPDATE TO authenticated 
  USING (
    manager_id = auth.uid() 
    AND status = 'draft'
    AND EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'Gestor'
    )
  );

-- Política para snies_report_data para que los gestores puedan guardar datos
CREATE POLICY "Allow gestores to manage their report data" ON public.snies_report_data
  FOR ALL TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.snies_reports sr
      WHERE sr.id = report_id
      AND sr.manager_id = auth.uid()
    )
  );
