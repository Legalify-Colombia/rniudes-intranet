import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

export interface Agreement {
  id: string;
  code?: string;
  country: string;
  foreign_institution_name: string;
  agreement_nature?: string;
  object?: string;
  agreement_type?: string;
  modality?: string;
  signature_date?: string;
  termination_date?: string;
  duration_years?: number;
  remaining_days?: number;
  status?: string;
  current_status?: 'active' | 'expired' | 'suspended' | 'under_review' | 'renewed' | 'terminated';
  renewal_info?: string;
  campus_id?: string;
  faculty_id?: string;
  programs?: string[];
  observations?: string;
  relation_date?: string;
  digital_folder_link?: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
}

export const useAgreements = () => {
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchAgreements = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('agreements')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAgreements((data || []).map(agreement => ({
        ...agreement,
        current_status: agreement.current_status as Agreement['current_status'] || 'active'
      })));
    } catch (error: any) {
      toast({
        title: "Error al cargar convenios",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createAgreement = async (agreement: Pick<Agreement, 'country' | 'foreign_institution_name'> & Partial<Agreement>) => {
    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!authData?.user) throw new Error('Usuario no autenticado');

      // Asegurar trazabilidad y compatibilidad con RLS: siempre guardar created_by
      const payload = {
        ...agreement,
        created_by: authData.user.id,
      };

      const { data, error } = await supabase
        .from('agreements')
        .insert([payload])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Convenio creado",
        description: "El convenio se ha creado exitosamente",
      });

      await fetchAgreements();
      return data;
    } catch (error: any) {
      toast({
        title: "Error al crear convenio",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };
  const updateAgreement = async (id: string, updates: Partial<Agreement>) => {
    try {
      const { data, error } = await supabase
        .from('agreements')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Convenio actualizado",
        description: "El convenio se ha actualizado exitosamente",
      });

      await fetchAgreements();
      return data;
    } catch (error: any) {
      toast({
        title: "Error al actualizar convenio",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteAgreement = async (id: string) => {
    try {
      const { error } = await supabase
        .from('agreements')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Convenio eliminado",
        description: "El convenio se ha eliminado exitosamente",
      });

      await fetchAgreements();
    } catch (error: any) {
      toast({
        title: "Error al eliminar convenio",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const importAgreementsFromCSV = async (csvData: any[]) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Usuario no autenticado');

      const errors: string[] = [];
      const agreementsToInsert: any[] = [];
      let successCount = 0;
      let skippedCount = 0;

      // Process each row individually to track errors by row number
      csvData.forEach((row: any, index: number) => {
        const rowNumber = index + 2; // +2 because index starts at 0 and we skip header row
        const country = row.País || row.country;
        const institutionName = row['Nombre de la Institución Extranjera'] || row.foreign_institution_name;

        // Check for required fields
        if (!country || !institutionName) {
          if (!country && !institutionName) {
            errors.push(`Fila ${rowNumber}: Faltan el país y el nombre de la institución`);
          } else if (!country) {
            errors.push(`Fila ${rowNumber}: Falta el país`);
          } else if (!institutionName) {
            errors.push(`Fila ${rowNumber}: Falta el nombre de la institución`);
          }
          skippedCount++;
          return;
        }

        try {
          // Validate and process data
          const agreementData = {
            code: row.Código || row.code || null,
            country: country.toString().trim(),
            foreign_institution_name: institutionName.toString().trim(),
            agreement_nature: row['Naturaleza del Convenio'] || row.agreement_nature || null,
            object: row.Objeto || row.object || null,
            agreement_type: row['Tipo de Convenio'] || row.agreement_type || null,
            modality: row.Modalidad || row.modality || null,
            signature_date: row['Fecha de Firma/Inicio'] || row.signature_date || null,
            termination_date: row['Fecha de Terminación'] || row.termination_date || null,
            duration_years: null as number | null,
            remaining_days: null as number | null,
            status: row.Estado || row.status || null,
            renewal_info: row.Renovación || row.renewal_info || null,
            programs: null as string[] | null,
            observations: row.Observaciones || row.observations || null,
            relation_date: row['Fecha de Relación'] || row.relation_date || null,
            digital_folder_link: row['Enlace Carpeta Digital'] || row.digital_folder_link || null,
            created_by: user.user.id
          };

          // Validate and parse duration_years
          const durationStr = row['Duración en años'] || row.duration_years;
          if (durationStr && durationStr.toString().trim() !== '') {
            const duration = parseFloat(durationStr.toString());
            if (isNaN(duration) || duration < 0) {
              errors.push(`Fila ${rowNumber}: Duración en años debe ser un número válido (${durationStr})`);
              skippedCount++;
              return;
            }
            agreementData.duration_years = duration;
          }

          // Validate and parse remaining_days
          const remainingStr = row['Días Faltantes'] || row.remaining_days;
          if (remainingStr && remainingStr.toString().trim() !== '') {
            const remaining = parseInt(remainingStr.toString());
            if (isNaN(remaining)) {
              errors.push(`Fila ${rowNumber}: Días faltantes debe ser un número entero (${remainingStr})`);
              skippedCount++;
              return;
            }
            agreementData.remaining_days = remaining;
          }

          // Process programs array
          const programsStr = row.Programas || row.programs;
          if (programsStr && typeof programsStr === 'string' && programsStr.trim() !== '') {
            agreementData.programs = programsStr.split(',').map((p: string) => p.trim()).filter(p => p !== '');
          } else if (Array.isArray(programsStr)) {
            agreementData.programs = programsStr.filter(p => p && p.toString().trim() !== '');
          }

          // Validate dates
          if (agreementData.signature_date && agreementData.signature_date !== '') {
            const signatureDate = new Date(agreementData.signature_date);
            if (isNaN(signatureDate.getTime())) {
              errors.push(`Fila ${rowNumber}: Fecha de firma inválida (${agreementData.signature_date})`);
              skippedCount++;
              return;
            }
          }

          if (agreementData.termination_date && agreementData.termination_date !== '') {
            const terminationDate = new Date(agreementData.termination_date);
            if (isNaN(terminationDate.getTime())) {
              errors.push(`Fila ${rowNumber}: Fecha de terminación inválida (${agreementData.termination_date})`);
              skippedCount++;
              return;
            }
          }

          agreementsToInsert.push(agreementData);
          successCount++;

        } catch (err: any) {
          errors.push(`Fila ${rowNumber}: Error al procesar datos - ${err.message}`);
          skippedCount++;
        }
      });

      // Insert valid agreements
      if (agreementsToInsert.length > 0) {
        const { error } = await supabase
          .from('agreements')
          .insert(agreementsToInsert);

        if (error) {
          // If batch insert fails, try individual inserts to identify specific errors
          const insertErrors: string[] = [];
          let insertedCount = 0;

          for (let i = 0; i < agreementsToInsert.length; i++) {
            try {
              const { error: insertError } = await supabase
                .from('agreements')
                .insert([agreementsToInsert[i]]);

              if (insertError) {
                // Find the original row number for this agreement
                const originalIndex = csvData.findIndex(row => {
                  const country = row.País || row.country;
                  const institutionName = row['Nombre de la Institución Extranjera'] || row.foreign_institution_name;
                  return country === agreementsToInsert[i].country && 
                         institutionName === agreementsToInsert[i].foreign_institution_name;
                });
                const rowNumber = originalIndex + 2;
                insertErrors.push(`Fila ${rowNumber}: Error de base de datos - ${insertError.message}`);
              } else {
                insertedCount++;
              }
            } catch (insertErr: any) {
              insertErrors.push(`Error en inserción individual: ${insertErr.message}`);
            }
          }

          if (insertErrors.length > 0) {
            errors.push(...insertErrors);
          }
          successCount = insertedCount;
        }
      }

      // Show results
      if (errors.length > 0) {
        const errorMessage = errors.slice(0, 5).join('\n') + (errors.length > 5 ? `\n... y ${errors.length - 5} errores más` : '');
        toast({
          title: "Importación completada con errores",
          description: `Procesados: ${successCount}, Omitidos: ${skippedCount}\n${errorMessage}`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Importación exitosa",
          description: `Se importaron ${successCount} convenios exitosamente`,
        });
      }

      if (successCount > 0) {
        await fetchAgreements();
      }

      // Return error details for the component to show
      return {
        success: successCount,
        errors: errors,
        skipped: skippedCount
      };

    } catch (error: any) {
      toast({
        title: "Error en la importación",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const calculateStatus = (terminationDate?: string) => {
    if (!terminationDate) return 'Sin fecha';
    
    const today = new Date();
    const termination = new Date(terminationDate);
    const diffTime = termination.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Vencido';
    if (diffDays <= 180) return 'Próximo a vencer';
    return 'Vigente';
  };

  const updateAgreementStatus = async (id: string, newStatus: string, comment?: string) => {
    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!authData?.user) throw new Error('Usuario no autenticado');

      // Obtener el estado actual
      const { data: currentAgreement, error: fetchError } = await supabase
        .from('agreements')
        .select('current_status')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      // Actualizar el estado del convenio
      const { data, error } = await supabase
        .from('agreements')
        .update({ current_status: newStatus })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Agregar comentario del cambio de estado si se proporciona
      if (comment) {
        await supabase
          .from('agreement_comments')
          .insert([{
            agreement_id: id,
            user_id: authData.user.id,
            comment_text: comment,
            comment_type: 'status_change',
            old_status: currentAgreement?.current_status || null,
            new_status: newStatus
          }]);
      }

      toast({
        title: "Estado actualizado",
        description: "El estado del convenio se ha actualizado exitosamente",
      });

      await fetchAgreements();
      return data;
    } catch (error: any) {
      toast({
        title: "Error al actualizar estado",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchAgreements();
  }, []);

  return {
    agreements,
    loading,
    fetchAgreements,
    createAgreement,
    updateAgreement,
    deleteAgreement,
    updateAgreementStatus,
    importAgreementsFromCSV,
    calculateStatus
  };
};