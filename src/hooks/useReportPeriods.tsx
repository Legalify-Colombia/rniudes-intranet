
import { supabase } from "@/integrations/supabase/client";
import type { Result } from "@/types/supabase";
import type { Database } from "@/integrations/supabase/types";

export function useReportPeriods() {
  const fetchReportPeriods = async (): Promise<Result<any[]>> => {
    const { data, error } = await supabase.from("report_periods").select("*").order("start_date", { ascending: false });
    return { data, error };
  };

  const createReportPeriod = async (period: Database["public"]["Tables"]["report_periods"]["Insert"]): Promise<Result<any>> => {
    const { data, error } = await supabase.from("report_periods").insert(period).select().single();
    return { data, error };
  };

  const updateReportPeriod = async (id: string, updates: Database["public"]["Tables"]["report_periods"]["Update"]): Promise<Result<any>> => {
    const { data, error } = await supabase.from("report_periods").update(updates).eq("id", id).select().single();
    return { data, error };
  };

  const deleteReportPeriod = async (id: string): Promise<Result<any>> => {
    const { data, error } = await supabase.from("report_periods").delete().eq("id", id);
    return { data, error };
  };

  const checkPeriodActive = async (periodId: string): Promise<Result<boolean>> => {
    const { data, error } = await supabase.rpc('is_period_active', { period_id: periodId });
    return { data, error };
  };

  return {
    fetchReportPeriods,
    createReportPeriod,
    updateReportPeriod,
    deleteReportPeriod,
    checkPeriodActive,
  };
}
