
import { supabase } from "@/integrations/supabase/client";
import type { Result } from "@/types/supabase";

export function useReportPeriods() {
  const fetchReportPeriods = async (): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from("report_periods")
      .select("*")
      .order("created_at", { ascending: false });
    return { data, error };
  };

  const createReportPeriod = async (period: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("report_periods")
      .insert(period)
      .select()
      .single();
    return { data, error };
  };

  const updateReportPeriod = async (id: string, updates: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("report_periods")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    return { data, error };
  };

  const deleteReportPeriod = async (id: string): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("report_periods")
      .delete()
      .eq("id", id);
    return { data, error };
  };

  return {
    fetchReportPeriods,
    createReportPeriod,
    updateReportPeriod,
    deleteReportPeriod
  };
}
