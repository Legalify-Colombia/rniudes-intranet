import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

export interface AgreementStats {
  total_agreements: number;
  active_agreements: number;
  expiring_soon: number;
  international_agreements: number;
  national_agreements: number;
}

export const useAgreementStats = () => {
  const [stats, setStats] = useState<AgreementStats>({
    total_agreements: 0,
    active_agreements: 0,
    expiring_soon: 0,
    international_agreements: 0,
    national_agreements: 0
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchStats = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_agreements_stats');

      if (error) throw error;
      
      if (data && data.length > 0) {
        setStats({
          total_agreements: Number(data[0].total_agreements) || 0,
          active_agreements: Number(data[0].active_agreements) || 0,
          expiring_soon: Number(data[0].expiring_soon) || 0,
          international_agreements: Number(data[0].international_agreements) || 0,
          national_agreements: Number(data[0].national_agreements) || 0
        });
      }
    } catch (error: any) {
      console.error('Error fetching agreement stats:', error);
      toast({
        title: "Error al cargar estadísticas",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return {
    stats,
    loading,
    fetchStats
  };
};