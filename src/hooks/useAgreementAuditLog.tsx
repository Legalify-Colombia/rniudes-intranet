import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

export interface AgreementAuditEntry {
  id: string;
  agreement_id: string;
  action_type: string;
  previous_status?: string;
  new_status?: string;
  comment?: string;
  user_id: string;
  user_name?: string;
  created_at: string;
}

export const useAgreementAuditLog = (agreementId?: string) => {
  const [auditLog, setAuditLog] = useState<AgreementAuditEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchAuditLog = async (id?: string) => {
    if (!id && !agreementId) return;
    
    try {
      setLoading(true);
      const targetId = id || agreementId;
      
      const { data, error } = await supabase
        .from('agreement_audit_log')
        .select('*')
        .eq('agreement_id', targetId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAuditLog(data || []);
    } catch (error: any) {
      toast({
        title: "Error al cargar bitácora",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addObservation = async (agreementId: string, comment: string) => {
    try {
      const { error } = await supabase.rpc('add_agreement_observation', {
        p_agreement_id: agreementId,
        p_comment: comment
      });

      if (error) throw error;

      toast({
        title: "Observación agregada",
        description: "La observación se ha registrado exitosamente",
      });

      // Recargar la bitácora
      await fetchAuditLog(agreementId);
    } catch (error: any) {
      toast({
        title: "Error al agregar observación",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const getActionTypeLabel = (actionType: string) => {
    const labels = {
      'creation': 'Creación',
      'status_change': 'Cambio de Estado',
      'observation': 'Observación',
      'renewal': 'Renovación',
      'update': 'Actualización'
    };
    return labels[actionType as keyof typeof labels] || actionType;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  useEffect(() => {
    if (agreementId) {
      fetchAuditLog();
    }
  }, [agreementId]);

  return {
    auditLog,
    loading,
    fetchAuditLog,
    addObservation,
    getActionTypeLabel,
    formatDate
  };
};