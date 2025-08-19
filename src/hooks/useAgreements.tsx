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
      setAgreements(data || []);
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
      const { data, error } = await supabase
        .from('agreements')
        .insert([agreement])
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

      const agreementsToInsert = csvData
        .filter((row: any) => {
          const country = row.País || row.country;
          const institutionName = row['Nombre de la Institución Extranjera'] || row.foreign_institution_name;
          return country && institutionName; // Only include rows with required fields
        })
        .map((row: any) => ({
          code: row.Código || row.code || null,
          country: row.País || row.country,
          foreign_institution_name: row['Nombre de la Institución Extranjera'] || row.foreign_institution_name,
          agreement_nature: row['Naturaleza del Convenio'] || row.agreement_nature || null,
          object: row.Objeto || row.object || null,
          agreement_type: row['Tipo de Convenio'] || row.agreement_type || null,
          modality: row.Modalidad || row.modality || null,
          signature_date: row['Fecha de Firma/Inicio'] || row.signature_date || null,
          termination_date: row['Fecha de Terminación'] || row.termination_date || null,
          duration_years: parseFloat(row['Duración en años'] || row.duration_years) || null,
          remaining_days: parseInt(row['Días Faltantes'] || row.remaining_days) || null,
          status: row.Estado || row.status || null,
          renewal_info: row.Renovación || row.renewal_info || null,
          programs: typeof (row.Programas || row.programs) === 'string' 
            ? (row.Programas || row.programs).split(',').map((p: string) => p.trim())
            : row.Programas || row.programs || null,
          observations: row.Observaciones || row.observations || null,
          relation_date: row['Fecha de Relación'] || row.relation_date || null,
          digital_folder_link: row['Enlace Carpeta Digital'] || row.digital_folder_link || null,
          created_by: user.user.id
        }));

      const { error } = await supabase
        .from('agreements')
        .insert(agreementsToInsert);

      if (error) throw error;

      toast({
        title: "Importación exitosa",
        description: `Se importaron ${agreementsToInsert.length} convenios`,
      });

      await fetchAgreements();
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
    importAgreementsFromCSV,
    calculateStatus
  };
};