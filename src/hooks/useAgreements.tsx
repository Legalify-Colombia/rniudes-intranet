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
  is_international?: boolean;
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

  const cleanField = (value: any): string | null => {
    if (value === undefined || value === null || value === '') return null;
    const cleaned = String(value).trim().replace(/^["']|["']$/g, '');
    return cleaned === '' ? null : cleaned;
  };

  const determineIfInternational = (country: string | null): boolean => {
    if (!country) return true; // Default to international if no country specified
    const nationalCountries = ['colombia', 'co', 'col'];
    return !nationalCountries.includes(country.toLowerCase());
  };

  const parseDate = (dateString: string): string | null => {
    if (!dateString || typeof dateString !== 'string') return null;
    
    // Clean the date string
    let cleanDate = dateString.trim().replace(/['"]/g, '');
    
    // Try ISO format first (YYYY-MM-DD)
    if (/^\d{4}-\d{2}-\d{2}$/.test(cleanDate)) {
      return cleanDate;
    }
    
    // Try DD/MM/YYYY or DD-MM-YYYY format
    const ddmmyyMatch = cleanDate.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    if (ddmmyyMatch) {
      const [, day, month, year] = ddmmyyMatch;
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    
    // Try MM/DD/YYYY format 
    const mmddyyMatch = cleanDate.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    if (mmddyyMatch) {
      const [, month, day, year] = mmddyyMatch;
      // Assume DD/MM if day > 12, otherwise try both interpretations
      if (parseInt(day) > 12) {
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
    }
    
    // Try YYYY/MM/DD format
    const yyyymmddMatch = cleanDate.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
    if (yyyymmddMatch) {
      const [, year, month, day] = yyyymmddMatch;
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    
    // Try DD-MM-AAAA or DD/MM/AAAA explicitly
    const ddmmyyyyMatch = cleanDate.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    if (ddmmyyyyMatch) {
      const [, day, month, year] = ddmmyyyyMatch;
      const dayNum = parseInt(day);
      const monthNum = parseInt(month);
      
      // Validate day and month ranges
      if (dayNum >= 1 && dayNum <= 31 && monthNum >= 1 && monthNum <= 12) {
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
    }
    
    // Try to parse with Date constructor as last resort
    try {
      const parsedDate = new Date(cleanDate);
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate.toISOString().split('T')[0];
      }
    } catch (e) {
      // Ignore parsing errors
    }
    
    return null;
  };

  const importAgreementsFromCSV = async (csvData: any[]) => {
    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!authData?.user) throw new Error('Usuario no autenticado');

      const errors: string[] = [];
      const agreementsToInsert: any[] = [];
      let successCount = 0;
      let skippedCount = 0;

      csvData.forEach((csvAgreement: any, index: number) => {
        const rowNumber = index + 2;
        
        // Validar campos requeridos
        const country = cleanField(csvAgreement['País'] || csvAgreement.country);
        const foreignInstitutionName = cleanField(csvAgreement['Nombre de la Institución Extranjera'] || csvAgreement.foreign_institution_name);
        
        if (!country || !foreignInstitutionName) {
          errors.push(`Fila ${rowNumber}: Faltan campos requeridos (País y Nombre de Institución)`);
          skippedCount++;
          return;
        }

        try {
          const mappedAgreement = {
            country: cleanField(csvAgreement['País'] || csvAgreement.country),
            foreign_institution_name: cleanField(csvAgreement['Nombre de la Institución Extranjera'] || csvAgreement.foreign_institution_name),
            code: cleanField(csvAgreement['Código'] || csvAgreement.code),
            agreement_nature: cleanField(csvAgreement['Naturaleza del Convenio'] || csvAgreement.agreement_nature),
            object: cleanField(csvAgreement['Objeto'] || csvAgreement.object),
            agreement_type: cleanField(csvAgreement['Tipo de Convenio'] || csvAgreement.agreement_type),
            modality: cleanField(csvAgreement['Modalidad'] || csvAgreement.modality),
            signature_date: parseDate(csvAgreement['Fecha de Firma/Inicio'] || csvAgreement.signature_date),
            termination_date: parseDate(csvAgreement['Fecha de Terminación'] || csvAgreement.termination_date),
            duration_years: parseFloat(cleanField(csvAgreement['Duración en años'] || csvAgreement.duration_years)) || null,
            remaining_days: parseInt(cleanField(csvAgreement['Días Faltantes'] || csvAgreement.remaining_days)) || null,
            status: cleanField(csvAgreement['Estado'] || csvAgreement.status),
            renewal_info: cleanField(csvAgreement['Renovación'] || csvAgreement.renewal_info),
            programs: csvAgreement['Programas'] || csvAgreement.programs ? 
              String(csvAgreement['Programas'] || csvAgreement.programs).split(',').map(p => p.trim()).filter(Boolean) : 
              [],
            observations: cleanField(csvAgreement['Observaciones'] || csvAgreement.observations),
            relation_date: parseDate(csvAgreement['Fecha de Relación'] || csvAgreement.relation_date),
            digital_folder_link: cleanField(csvAgreement['Enlace Carpeta Digital'] || csvAgreement.digital_folder_link),
            is_international: determineIfInternational(cleanField(csvAgreement['País'] || csvAgreement.country)),
            created_by: authData.user.id
          };

          // Validaciones adicionales
          if (mappedAgreement.signature_date) {
            const signatureDate = new Date(mappedAgreement.signature_date);
            if (isNaN(signatureDate.getTime())) {
              errors.push(`Fila ${rowNumber}: Fecha de firma inválida`);
              skippedCount++;
              return;
            }
          }

          if (mappedAgreement.termination_date) {
            const terminationDate = new Date(mappedAgreement.termination_date);
            if (isNaN(terminationDate.getTime())) {
              errors.push(`Fila ${rowNumber}: Fecha de terminación inválida`);
              skippedCount++;
              return;
            }
          }

          agreementsToInsert.push(mappedAgreement);
          successCount++;

        } catch (err: any) {
          errors.push(`Fila ${rowNumber}: Error al procesar - ${err.message}`);
          skippedCount++;
        }
      });

      // Insertar convenios válidos
      if (agreementsToInsert.length > 0) {
        const { error } = await supabase
          .from('agreements')
          .insert(agreementsToInsert);

        if (error) throw error;
      }

      await fetchAgreements();
      
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