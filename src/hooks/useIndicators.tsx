
import { supabase } from "@/integrations/supabase/client";
import type { Result } from "@/types/supabase";

export function useIndicators() {
  const fetchIndicators = async (): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from("indicators")
      .select("*")
      .order("name");
    return { data, error };
  };

  const createIndicator = async (indicator: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("indicators")
      .insert(indicator)
      .select()
      .single();
    return { data, error };
  };

  const updateIndicator = async (id: string, updates: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("indicators")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    return { data, error };
  };

  const deleteIndicator = async (id: string): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("indicators")
      .delete()
      .eq("id", id);
    return { data, error };
  };

  const fetchIndicatorReport = async (reportId: string): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("indicator_reports")
      .select("*")
      .eq("id", reportId)
      .single();
    return { data, error };
  };

  const createIndicatorReport = async (report: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("indicator_reports")
      .insert(report)
      .select()
      .single();
    return { data, error };
  };

  const updateIndicatorReport = async (id: string, updates: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("indicator_reports")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    return { data, error };
  };

  const submitIndicatorReport = async (reportId: string): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("indicator_reports")
      .update({ 
        status: 'submitted',
        submitted_date: new Date().toISOString()
      })
      .eq("id", reportId)
      .select()
      .single();
    return { data, error };
  };

  const deleteIndicatorReport = async (id: string): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("indicator_reports")
      .delete()
      .eq("id", id);
    return { data, error };
  };

  return {
    fetchIndicators,
    createIndicator,
    updateIndicator,
    deleteIndicator,
    fetchIndicatorReport,
    createIndicatorReport,
    updateIndicatorReport,
    submitIndicatorReport,
    deleteIndicatorReport
  };
}
