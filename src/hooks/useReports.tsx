import { useCallback } from 'react'; // *** PASO 1: IMPORTAR useCallback ***
import { supabase } from "@/integrations/supabase/client";
import type { ManagerReport, ReportPeriod, Result } from "@/types/supabase";
import type { Database } from "@/integrations/supabase/types";

export function useReports() {
  // *** PASO 2: Envolver CADA función en useCallback para estabilizarla ***

  const fetchManagerReports = useCallback(async (): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from("manager_reports")
      .select(`
        *,
        manager:profiles!manager_reports_manager_id_fkey(*),
        report_period:report_periods(*),
        work_plan:custom_plans!manager_reports_work_plan_id_fkey(*)
      `)
      .order("created_at", { ascending: false });
    return { data, error };
  }, []);

  const fetchManagerReportsByManager = useCallback(async (managerId: string): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from("manager_reports")
      .select(`
        *,
        manager:profiles!manager_reports_manager_id_fkey(*),
        report_period:report_periods(*)
      `)
      .eq("manager_id", managerId)
      .order("created_at", { ascending: false });
    return { data, error };
  }, []);

  const createManagerReport = useCallback(async (report: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("manager_reports")
      .insert(report)
      .select()
      .single();
    return { data, error };
  }, []);

  const updateManagerReport = useCallback(async (id: string, updates: Database["public"]["Tables"]["manager_reports"]["Update"]): Promise<Result<ManagerReport>> => {
    const { data, error } = await supabase
      .from("manager_reports")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    return { data, error };
  }, []);

  const fetchProductProgressReports = useCallback(async (managerReportId: string): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from("product_progress_reports")
      .select(`
        *,
        product:products(*),
        assignment:custom_plan_assignments(*)
      `)
      .eq("manager_report_id", managerReportId)
      .order("created_at", { ascending: false });
    return { data, error };
  }, []);

  const upsertProductProgressReport = useCallback(async (reportData: any): Promise<Result<any>> => {
    try {
      const baseReportData = {
        manager_report_id: reportData.manager_report_id,
        product_id: reportData.product_id,
        progress_percentage: reportData.progress_percentage || 0,
        observations: reportData.observations || '',
        evidence_files: reportData.evidence_files || [],
        evidence_file_names: reportData.evidence_file_names || [],
        updated_at: new Date().toISOString()
      };

      let finalReportData;
      if (reportData.custom_plan_assignment_id) {
        finalReportData = {
          ...baseReportData,
          custom_plan_assignment_id: reportData.custom_plan_assignment_id,
          work_plan_assignment_id: null
        };
      } else if (reportData.work_plan_assignment_id) {
        finalReportData = {
          ...baseReportData,
          work_plan_assignment_id: reportData.work_plan_assignment_id,
          custom_plan_assignment_id: null
        };
      } else {
        throw new Error("Se debe proporcionar un 'work_plan_assignment_id' o un 'custom_plan_assignment_id'.");
      }

      const { data, error } = await supabase
        .from("product_progress_reports")
        .upsert(finalReportData, {
          onConflict: 'manager_report_id,product_id' 
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error en upsert:', error);
      }
      
      return { data, error };
    } catch (err) {
      console.error('Excepción en upsertProductProgressReport:', err);
      return { data: null, error: err as any };
    }
  }, []);

  const fetchWorkPlanAssignments = useCallback(async (workPlanId: string): Promise<Result<any[]>> => {
    try {
      const { data, error } = await supabase
        .from("custom_plan_assignments")
        .select(`
          *,
          product:products(*, action:strategic_actions(*, strategic_axis:strategic_axes(*)))
        `)
        .eq("custom_plan_id", workPlanId)
        .order("created_at", { ascending: false });

      if (error) console.error('Error en fetchWorkPlanAssignments:', error);
      return { data, error };
    } catch (err) {
      console.error('Excepción en fetchWorkPlanAssignments:', err);
      return { data: null, error: err as any };
    }
  }, []);

  const fetchReportPeriods = useCallback(async (): Promise<Result<ReportPeriod[]>> => {
    const { data, error } = await supabase
      .from("report_periods")
      .select("*")
      .order("start_date", { ascending: false });
    return { data, error };
  }, []);

  const createReportPeriod = useCallback(async (period: Database["public"]["Tables"]["report_periods"]["Insert"]): Promise<Result<ReportPeriod>> => {
    const { data, error } = await supabase.from("report_periods").insert(period).select().single();
    return { data, error };
  }, []);

  const updateReportPeriod = useCallback(async (id: string, updates: Database["public"]["Tables"]["report_periods"]["Update"]): Promise<Result<ReportPeriod>> => {
    const { data, error } = await supabase.from("report_periods").update(updates).eq("id", id).select().single();
    return { data, error };
  }, []);

  const deleteReportPeriod = useCallback(async (id: string): Promise<Result<any>> => {
    const { data, error } = await supabase.from("report_periods").delete().eq("id", id);
    return { data, error };
  }, []);

  const fetchReportSystemConfig = useCallback(async (): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("report_system_config")
      .select("*")
      .single();
    return { data, error };
  }, []);

  const updateReportSystemConfig = useCallback(async (config: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("report_system_config")
      .upsert(config)
      .select()
      .single();
    return { data, error };
  }, []);

  const checkPeriodActive = useCallback(async (periodId: string): Promise<Result<boolean>> => {
    const { data, error } = await supabase
      .rpc('is_period_active', { period_id: periodId });
    return { data, error };
  }, []);

  const fetchReportTemplates = useCallback(async (): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from("report_templates")
      .select("*")
      .eq("is_active", true)
      .order("name");
    return { data, error };
  }, []);

  const createReportTemplate = useCallback(async (template: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("report_templates")
      .insert(template)
      .select()
      .single();
    return { data, error };
  }, []);

  const updateReportTemplate = useCallback(async (id: string, updates: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("report_templates")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    return { data, error };
  }, []);

  const deleteReportTemplate = useCallback(async (id: string): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("report_templates")
      .delete()
      .eq("id", id);
    return { data, error };
  }, []);

  const createManagerReportVersion = useCallback(async (version: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("manager_report_versions")
      .insert(version)
      .select()
      .single();
    return { data, error };
  }, []);

  const updateManagerReportVersion = useCallback(async (id: string, updates: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("manager_report_versions")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    return { data, error };
  }, []);

  const getNextVersionNumber = useCallback(async (managerReportId: string, templateId: string): Promise<Result<number>> => {
    const { data, error } = await supabase
      .rpc('get_next_version_number', {
        p_manager_report_id: managerReportId,
        p_template_id: templateId
      });
    return { data, error };
  }, []);

  return {
    fetchManagerReports,
    fetchManagerReportsByManager,
    createManagerReport,
    updateManagerReport,
    fetchProductProgressReports,
    upsertProductProgressReport,
    fetchWorkPlanAssignments,
    fetchReportPeriods,
    createReportPeriod,
    updateReportPeriod,
    deleteReportPeriod,
    fetchReportSystemConfig,
    updateReportSystemConfig,
    checkPeriodActive,
    fetchReportTemplates,
    createReportTemplate,
    updateReportTemplate,
    deleteReportTemplate,
    createManagerReportVersion,
    updateManagerReportVersion,
    getNextVersionNumber,
  };
}
