import { supabase } from "@/integrations/supabase/client";
import type { CustomPlan, Result } from "@/types/supabase";

export function useWorkPlans() {
  const fetchWorkPlans = async (): Promise<Result<CustomPlan[]>> => {
    const { data, error } = await supabase
      .from("custom_plans")
      .select(`
        *,
        profiles:manager_id(*),
        plan_type:plan_type_id(*)
      `)
      .order("created_at", { ascending: false });
    return { data, error };
  };

  const fetchWorkPlansForManager = async (managerId: string): Promise<Result<CustomPlan[]>> => {
    const { data, error } = await supabase
      .from("custom_plans")
      .select(`
        *,
        profiles:manager_id(*),
        plan_type:plan_type_id(*)
      `)
      .eq("manager_id", managerId)
      .order("created_at", { ascending: false });
    return { data, error };
  };

  const fetchPendingWorkPlans = async (): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from("custom_plans")
      .select(`
        *,
        profiles:manager_id(
          full_name,
          email,
          position,
          campus_id
        ),
        plan_types:plan_type_id(name)
      `)
      .eq("status", "submitted")
      .order("submitted_date", { ascending: false });
    
    if (error) return { data: [], error };
    
    const processedData = await Promise.all((data || []).map(async (plan: any) => {
      let campusName = 'N/A';
      let programName = 'N/A';
      let facultyName = 'N/A';
      
      if (plan.profiles?.campus_id) {
        const { data: campusData } = await supabase
          .from("campus")
          .select("name")
          .eq("id", plan.profiles.campus_id)
          .single();
        
        campusName = campusData?.name || 'N/A';
        
        const { data: programData } = await supabase
          .from("academic_programs")
          .select("name, faculties(name)")
          .eq("campus_id", plan.profiles.campus_id)
          .limit(1)
          .single();
        
        if (programData) {
          programName = programData.name || 'N/A';
          facultyName = (programData as any).faculties?.name || 'N/A';
        }
      }
      
      const { data: assignmentsData } = await supabase
        .from("custom_plan_assignments")
        .select("assigned_hours")
        .eq("custom_plan_id", plan.id);
      
      const totalHours = assignmentsData?.reduce((sum, assignment) => 
        sum + (assignment.assigned_hours || 0), 0) || 0;
      
      const { data: objectivesData } = await supabase
        .from("custom_plan_responses")
        .select(`
          response_value,
          plan_fields(label, field_type)
        `)
        .eq("custom_plan_id", plan.id);
      
      const objectivesResponse = objectivesData?.find((response: any) => 
        response.plan_fields?.field_type === 'textarea' && 
        response.plan_fields?.label?.toLowerCase().includes('objetivo')
      );
      
      const objectives = objectivesResponse?.response_value && 
        typeof objectivesResponse.response_value === 'object' 
        ? (objectivesResponse.response_value as any).text || '' 
        : '';
      
      return {
        ...plan,
        manager_name: plan.profiles?.full_name || 'N/A',
        manager_email: plan.profiles?.email || 'N/A',
        manager_position: plan.profiles?.position || 'N/A',
        plan_type_name: plan.plan_types?.name || 'N/A',
        campus_name: campusName,
        program_name: programName,
        faculty_name: facultyName,
        total_hours_assigned: totalHours,
        objectives: objectives
      };
    }));
    
    return { data: processedData, error: null };
  };

  const approveWorkPlan = async (planId: string, status: 'approved' | 'rejected', approvedBy: string, comments?: string): Promise<Result<CustomPlan>> => {
    const { data, error } = await supabase
      .from("custom_plans")
      .update({
        status: status,
        approved_by: approvedBy,
        approved_date: new Date().toISOString(),
        approval_comments: comments
      })
      .eq("id", planId)
      .select()
      .single();
    return { data, error };
  };
  
  // NUEVA FUNCIÓN: Envía un plan para revisión
  const submitCustomPlan = async (planId: string): Promise<Result<CustomPlan>> => {
    const { data, error } = await supabase
      .from("custom_plans")
      .update({
        status: "submitted",
        submitted_date: new Date().toISOString(),
      })
      .eq("id", planId)
      .select()
      .single();
    return { data, error };
  };

  const createWorkPlan = async (workPlan: any): Promise<Result<CustomPlan>> => {
    const { data, error } = await supabase
      .from("custom_plans")
      .insert(workPlan)
      .select()
      .single();
    return { data, error };
  };

  const updateWorkPlan = async (id: string, updates: any): Promise<Result<CustomPlan>> => {
    const { data, error } = await supabase
      .from("custom_plans")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    return { data, error };
  };

  const upsertWorkPlanAssignment = async (assignment: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("custom_plan_assignments")
      .upsert(assignment)
      .select()
      .single();
    return { data, error };
  };

  return {
    fetchWorkPlans,
    fetchWorkPlansForManager,
    fetchPendingWorkPlans,
    approveWorkPlan,
    submitCustomPlan, // Exportamos la nueva función
    createWorkPlan,
    updateWorkPlan,
    upsertWorkPlanAssignment,
  };
}
