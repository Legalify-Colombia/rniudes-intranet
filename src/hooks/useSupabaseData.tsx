
import { supabase } from "@/integrations/supabase/client";
import type { Profile, Result } from "@/types/supabase";

export function useSupabaseData() {
  // Campus functions
  const fetchCampus = async (): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from("campus")
      .select("*")
      .order("name");
    return { data, error };
  };

  const createCampus = async (campusData: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("campus")
      .insert(campusData)
      .select()
      .single();
    return { data, error };
  };

  const updateCampus = async (campusId: string, updates: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("campus")
      .update(updates)
      .eq("id", campusId)
      .select()
      .single();
    return { data, error };
  };

  const deleteCampus = async (campusId: string): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("campus")
      .delete()
      .eq("id", campusId);
    return { data, error };
  };

  // Faculty functions
  const fetchFaculties = async (): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from("faculties")
      .select(`
        *,
        campus:campus_id (
          id,
          name
        )
      `)
      .order("name");
    return { data, error };
  };

  const fetchFacultiesByCampus = async (campusId: string): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from("faculties")
      .select(`
        *,
        campus:campus_id (
          id,
          name
        )
      `)
      .eq("campus_id", campusId)
      .order("name");
    return { data, error };
  };

  const createFaculty = async (facultyData: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("faculties")
      .insert(facultyData)
      .select()
      .single();
    return { data, error };
  };

  const updateFaculty = async (facultyId: string, updates: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("faculties")
      .update(updates)
      .eq("id", facultyId)
      .select()
      .single();
    return { data, error };
  };

  const deleteFaculty = async (facultyId: string): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("faculties")
      .delete()
      .eq("id", facultyId);
    return { data, error };
  };

  // Academic Programs functions
  const fetchAcademicPrograms = async (): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from("academic_programs")
      .select(`
        *,
        campus:campus_id (
          id,
          name
        ),
        faculty:faculty_id (
          id,
          name
        ),
        manager:manager_id (
          id,
          full_name,
          email
        )
      `)
      .order("name");
    return { data, error };
  };

  const fetchAcademicProgramsByCampus = async (campusId: string): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from("academic_programs")
      .select(`
        *,
        campus:campus_id (
          id,
          name
        ),
        faculty:faculty_id (
          id,
          name
        ),
        manager:manager_id (
          id,
          full_name,
          email
        )
      `)
      .eq("campus_id", campusId)
      .order("name");
    return { data, error };
  };

  const createAcademicProgram = async (programData: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("academic_programs")
      .insert(programData)
      .select()
      .single();
    return { data, error };
  };

  const updateAcademicProgram = async (programId: string, updates: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("academic_programs")
      .update(updates)
      .eq("id", programId)
      .select()
      .single();
    return { data, error };
  };

  const deleteAcademicProgram = async (programId: string): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("academic_programs")
      .delete()
      .eq("id", programId);
    return { data, error };
  };

  // Users/Managers functions
  const fetchManagersByCampus = async (campusIds?: string[]): Promise<Result<Profile[]>> => {
    let query = supabase
      .from("profiles")
      .select("*")
      .eq("role", "Gestor");

    if (campusIds && campusIds.length > 0) {
      query = query.in("campus_id", campusIds);
    }

    const { data, error } = await query.order("full_name");
    return { data, error };
  };

  const fetchManagers = async (): Promise<Result<Profile[]>> => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", "Gestor")
      .order("full_name");
    return { data, error };
  };

  const fetchUsersByCampus = async (campusIds?: string[]): Promise<Result<Profile[]>> => {
    let query = supabase
      .from("profiles")
      .select("*");

    if (campusIds && campusIds.length > 0) {
      query = query.in("campus_id", campusIds);
    }

    const { data, error } = await query.order("full_name");
    return { data, error };
  };

  const updateUserProfile = async (userId: string, updates: any): Promise<Result<Profile>> => {
    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", userId)
      .select()
      .single();
    return { data, error };
  };

  const getUserManagedCampus = async (userId: string): Promise<Result<any>> => {
    const { data: userProfile, error: profileError } = await supabase
      .from("profiles")
      .select("managed_campus_ids, campus_id")
      .eq("id", userId)
      .single();

    if (profileError) return { data: null, error: profileError };

    return { 
      data: {
        managed_campus_ids: userProfile.managed_campus_ids || [],
        campus_id: userProfile.campus_id
      }, 
      error: null 
    };
  };

  // Strategic Axes functions
  const fetchStrategicAxes = async (): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from("strategic_axes")
      .select("*")
      .order("code");
    return { data, error };
  };

  const createStrategicAxis = async (axisData: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("strategic_axes")
      .insert(axisData)
      .select()
      .single();
    return { data, error };
  };

  const updateStrategicAxis = async (axisId: string, updates: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("strategic_axes")
      .update(updates)
      .eq("id", axisId)
      .select()
      .single();
    return { data, error };
  };

  const deleteStrategicAxis = async (axisId: string): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("strategic_axes")
      .delete()
      .eq("id", axisId);
    return { data, error };
  };

  // Actions functions
  const fetchActions = async (): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from("actions")
      .select(`
        *,
        strategic_axis:strategic_axis_id (
          id,
          name,
          code
        )
      `)
      .order("code");
    return { data, error };
  };

  const createAction = async (actionData: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("actions")
      .insert(actionData)
      .select()
      .single();
    return { data, error };
  };

  const updateAction = async (actionId: string, updates: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("actions")
      .update(updates)
      .eq("id", actionId)
      .select()
      .single();
    return { data, error };
  };

  const deleteAction = async (actionId: string): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("actions")
      .delete()
      .eq("id", actionId);
    return { data, error };
  };

  // Products functions
  const fetchProducts = async (): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from("products")
      .select(`
        *,
        action:action_id (
          id,
          name,
          code,
          strategic_axis:strategic_axis_id (
            id,
            name,
            code
          )
        )
      `)
      .order("name");
    return { data, error };
  };

  const createProduct = async (productData: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("products")
      .insert(productData)
      .select()
      .single();
    return { data, error };
  };

  const updateProduct = async (productId: string, updates: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("products")
      .update(updates)
      .eq("id", productId)
      .select()
      .single();
    return { data, error };
  };

  const deleteProduct = async (productId: string): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("products")
      .delete()
      .eq("id", productId);
    return { data, error };
  };

  // Work Plans functions
  const fetchWorkPlans = async (): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from("work_plan_assignments")
      .select(`
        *,
        work_plan:work_plan_id (
          *,
          manager:manager_id (
            id,
            full_name,
            email,
            position
          ),
          program:program_id (
            id,
            name,
            campus:campus_id (
              id,
              name
            ),
            faculty:faculty_id (
              id,
              name
            )
          )
        ),
        product:product_id (
          id,
          name,
          action:action_id (
            id,
            name,
            code,
            strategic_axis:strategic_axis_id (
              id,
              name,
              code
            )
          )
        )
      `)
      .order("created_at", { ascending: false });
    return { data, error };
  };

  const fetchPendingWorkPlans = async (): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from("work_plan_assignments")
      .select(`
        work_plan:work_plan_id!inner (
          id,
          status,
          objectives,
          total_hours_assigned,
          submitted_date,
          approval_comments,
          manager:manager_id (
            id,
            full_name,
            email,
            position
          ),
          program:program_id (
            id,
            name,
            campus:campus_id (
              id,
              name
            ),
            faculty:faculty_id (
              id,
              name
            )
          )
        )
      `)
      .eq("work_plan.status", "pending")
      .order("work_plan.submitted_date", { ascending: true });

    if (error) return { data: null, error };

    // Transform data to flatten work_plan structure
    const transformedData = data?.map(item => ({
      id: item.work_plan.id,
      status: item.work_plan.status,
      objectives: item.work_plan.objectives,
      total_hours_assigned: item.work_plan.total_hours_assigned,
      submitted_date: item.work_plan.submitted_date,
      approval_comments: item.work_plan.approval_comments,
      manager_name: item.work_plan.manager?.full_name,
      manager_email: item.work_plan.manager?.email,
      manager_position: item.work_plan.manager?.position,
      program_name: item.work_plan.program?.name,
      campus_name: item.work_plan.program?.campus?.name,
      faculty_name: item.work_plan.program?.faculty?.name,
    })) || [];

    // Remove duplicates by work plan id
    const uniqueWorkPlans = transformedData.filter((plan, index, self) => 
      index === self.findIndex(p => p.id === plan.id)
    );

    return { data: uniqueWorkPlans, error: null };
  };

  const fetchWorkPlanDetails = async (workPlanId: string): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("work_plan_assignments")
      .select(`
        *,
        work_plan:work_plan_id!inner (
          *,
          manager:manager_id (
            id,
            full_name,
            email
          ),
          program:program_id (
            id,
            name,
            campus:campus_id (
              id,
              name
            ),
            faculty:faculty_id (
              id,
              name
            )
          )
        )
      `)
      .eq("work_plan_id", workPlanId)
      .single();

    if (error) return { data: null, error };
    
    return { data: data?.work_plan, error: null };
  };

  const fetchWorkPlanAssignments = async (workPlanId: string): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from("work_plan_assignments")
      .select(`
        *,
        product:product_id (
          id,
          name,
          action:action_id (
            id,
            name,
            code,
            strategic_axis:strategic_axis_id (
              id,
              name,
              code
            )
          )
        )
      `)
      .eq("work_plan_id", workPlanId);
    return { data, error };
  };

  const createWorkPlan = async (workPlanData: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("work_plan_assignments")
      .insert(workPlanData)
      .select()
      .single();
    return { data, error };
  };

  const updateWorkPlan = async (workPlanId: string, updates: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("work_plan_assignments")
      .update(updates)
      .eq("work_plan_id", workPlanId)
      .select()
      .single();
    return { data, error };
  };

  const upsertWorkPlanAssignment = async (assignment: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("work_plan_assignments")
      .upsert(assignment)
      .select()
      .single();
    return { data, error };
  };

  const approveWorkPlan = async (workPlanId: string, status: 'approved' | 'rejected', comments?: string): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("work_plan_assignments")
      .update({
        status,
        approval_comments: comments,
        approved_date: new Date().toISOString()
      })
      .eq("work_plan_id", workPlanId)
      .select()
      .single();
    return { data, error };
  };

  // Report functions
  const fetchManagerReports = async (): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from("manager_reports")
      .select(`
        *,
        manager:manager_id (
          id,
          full_name,
          email
        ),
        work_plan:work_plan_id (
          id,
          program:program_id (
            id,
            name
          )
        )
      `)
      .order("created_at", { ascending: false });
    return { data, error };
  };

  const updateManagerReport = async (reportId: string, updates: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("manager_reports")
      .update(updates)
      .eq("id", reportId)
      .select()
      .single();
    return { data, error };
  };

  const fetchProductProgressReports = async (reportId: string): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from("product_progress_reports")
      .select(`
        *,
        product:product_id (
          id,
          name,
          action:action_id (
            id,
            name,
            code
          )
        )
      `)
      .eq("manager_report_id", reportId);
    return { data, error };
  };

  const upsertProductProgressReport = async (report: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("product_progress_reports")
      .upsert(report)
      .select()
      .single();
    return { data, error };
  };

  const deleteProductProgressReport = async (reportId: string): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("product_progress_reports")
      .delete()
      .eq("id", reportId);
    return { data, error };
  };

  // Report Templates functions
  const fetchReportTemplates = async (): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from("report_templates")
      .select("*")
      .eq("is_active", true)
      .order("name");
    return { data, error };
  };

  const createReportTemplate = async (templateData: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("report_templates")
      .insert(templateData)
      .select()
      .single();
    return { data, error };
  };

  const updateReportTemplate = async (templateId: string, updates: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("report_templates")
      .update(updates)
      .eq("id", templateId)
      .select()
      .single();
    return { data, error };
  };

  const deleteReportTemplate = async (templateId: string): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("report_templates")
      .delete()
      .eq("id", templateId);
    return { data, error };
  };

  // Report Periods functions
  const fetchReportPeriods = async (): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from("report_periods")
      .select("*")
      .order("start_date", { ascending: false });
    return { data, error };
  };

  const createReportPeriod = async (periodData: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("report_periods")
      .insert(periodData)
      .select()
      .single();
    return { data, error };
  };

  const updateReportPeriod = async (periodId: string, updates: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("report_periods")
      .update(updates)
      .eq("id", periodId)
      .select()
      .single();
    return { data, error };
  };

  const deleteReportPeriod = async (periodId: string): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("report_periods")
      .delete()
      .eq("id", periodId);
    return { data, error };
  };

  // Template-based Reports functions
  const fetchTemplateBasedReports = async (managerId?: string): Promise<Result<any[]>> => {
    let query = supabase
      .from("template_based_reports_with_details")
      .select("*");

    if (managerId) {
      query = query.eq("manager_id", managerId);
    }

    const { data, error } = await query.order("created_at", { ascending: false });
    return { data, error };
  };

  const fetchTemplateBasedReportDetails = async (reportId: string): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("template_based_reports")
      .select(`
        *,
        template:report_template_id (
          id,
          name,
          description
        ),
        period:report_period_id (
          id,
          name,
          start_date,
          end_date
        ),
        manager:manager_id (
          id,
          full_name,
          email
        )
      `)
      .eq("id", reportId)
      .single();
    return { data, error };
  };

  const createTemplateBasedReport = async (reportData: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("template_based_reports")
      .insert(reportData)
      .select()
      .single();
    return { data, error };
  };

  const updateTemplateBasedReport = async (reportId: string, updates: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("template_based_reports")
      .update(updates)
      .eq("id", reportId)
      .select()
      .single();
    return { data, error };
  };

  const submitTemplateBasedReport = async (reportId: string): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("template_based_reports")
      .update({
        status: 'submitted',
        submitted_date: new Date().toISOString()
      })
      .eq("id", reportId)
      .select()
      .single();
    return { data, error };
  };

  const deleteTemplateBasedReport = async (reportId: string): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("template_based_reports")
      .delete()
      .eq("id", reportId);
    return { data, error };
  };

  // Indicator Reports functions
  const fetchIndicatorReports = async (managerId?: string): Promise<Result<any[]>> => {
    let query = supabase
      .from("indicator_reports")
      .select(`
        *,
        period:report_period_id (
          id,
          name,
          start_date,
          end_date
        ),
        manager:manager_id (
          id,
          full_name,
          email
        )
      `);

    if (managerId) {
      query = query.eq("manager_id", managerId);
    }

    const { data, error } = await query.order("created_at", { ascending: false });
    return { data, error };
  };

  const fetchIndicatorReport = async (reportId: string): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("indicator_reports")
      .select(`
        *,
        period:report_period_id (
          id,
          name,
          start_date,
          end_date
        ),
        manager:manager_id (
          id,
          full_name,
          email
        )
      `)
      .eq("id", reportId)
      .single();
    return { data, error };
  };

  const createIndicatorReport = async (reportData: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("indicator_reports")
      .insert(reportData)
      .select()
      .single();
    return { data, error };
  };

  const updateIndicatorReport = async (reportId: string, updates: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("indicator_reports")
      .update(updates)
      .eq("id", reportId)
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

  // Custom Plans functions
  const fetchPlanTypes = async (): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from("plan_types")
      .select("*")
      .eq("is_active", true)
      .order("name");
    return { data, error };
  };

  const fetchPlanFields = async (planTypeId: string): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from("plan_fields")
      .select("*")
      .eq("plan_type_id", planTypeId)
      .order("field_order");
    return { data, error };
  };

  const fetchCustomPlans = async (managerId?: string): Promise<Result<any[]>> => {
    let query = supabase
      .from("custom_plans")
      .select(`
        *,
        plan_type:plan_type_id (
          id,
          name,
          description
        ),
        manager:manager_id (
          id,
          full_name,
          email
        )
      `);

    if (managerId) {
      query = query.eq("manager_id", managerId);
    }

    const { data, error } = await query.order("created_at", { ascending: false });
    return { data, error };
  };

  const fetchCustomPlanDetails = async (planId: string): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("custom_plans")
      .select(`
        *,
        plan_type:plan_type_id (
          id,
          name,
          description
        ),
        manager:manager_id (
          id,
          full_name,
          email
        )
      `)
      .eq("id", planId)
      .single();
    return { data, error };
  };

  const createCustomPlan = async (planData: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("custom_plans")
      .insert(planData)
      .select()
      .single();
    return { data, error };
  };

  const updateCustomPlan = async (planId: string, updates: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("custom_plans")
      .update(updates)
      .eq("id", planId)
      .select()
      .single();
    return { data, error };
  };

  const submitCustomPlan = async (planId: string): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("custom_plans")
      .update({
        status: 'submitted',
        submitted_date: new Date().toISOString()
      })
      .eq("id", planId)
      .select()
      .single();
    return { data, error };
  };

  const upsertCustomPlanResponse = async (response: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("custom_plan_responses")
      .upsert(response)
      .select()
      .single();
    return { data, error };
  };

  // File upload function
  const uploadFile = async (file: File, bucket: string, path: string): Promise<Result<any>> => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file);

    if (error) return { data: null, error };

    const { data: publicUrl } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);

    return { data: publicUrl, error: null };
  };

  // Utility functions
  const checkPeriodActive = async (periodId: string): Promise<boolean> => {
    const { data, error } = await supabase
      .from("report_periods")
      .select("end_date, is_active")
      .eq("id", periodId)
      .single();

    if (error || !data) return false;
    
    const now = new Date();
    const endDate = new Date(data.end_date);
    
    return data.is_active && endDate >= now;
  };

  return {
    // Campus
    fetchCampus,
    createCampus,
    updateCampus,
    deleteCampus,
    
    // Faculties
    fetchFaculties,
    fetchFacultiesByCampus,
    createFaculty,
    updateFaculty,
    deleteFaculty,
    
    // Academic Programs
    fetchAcademicPrograms,
    fetchAcademicProgramsByCampus,
    createAcademicProgram,
    updateAcademicProgram,
    deleteAcademicProgram,
    
    // Users/Managers
    fetchManagersByCampus,
    fetchManagers,
    fetchUsersByCampus,
    updateUserProfile,
    getUserManagedCampus,
    
    // Strategic Axes
    fetchStrategicAxes,
    createStrategicAxis,
    updateStrategicAxis,
    deleteStrategicAxis,
    
    // Actions
    fetchActions,
    createAction,
    updateAction,
    deleteAction,
    
    // Products
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    
    // Work Plans
    fetchWorkPlans,
    fetchPendingWorkPlans,
    fetchWorkPlanDetails,
    fetchWorkPlanAssignments,
    createWorkPlan,
    updateWorkPlan,
    upsertWorkPlanAssignment,
    approveWorkPlan,
    
    // Reports
    fetchManagerReports,
    updateManagerReport,
    fetchProductProgressReports,
    upsertProductProgressReport,
    deleteProductProgressReport,
    
    // Report Templates
    fetchReportTemplates,
    createReportTemplate,
    updateReportTemplate,
    deleteReportTemplate,
    
    // Report Periods
    fetchReportPeriods,
    createReportPeriod,
    updateReportPeriod,
    deleteReportPeriod,
    
    // Template-based Reports
    fetchTemplateBasedReports,
    fetchTemplateBasedReportDetails,
    createTemplateBasedReport,
    updateTemplateBasedReport,
    submitTemplateBasedReport,
    deleteTemplateBasedReport,
    
    // Indicator Reports
    fetchIndicatorReports,
    fetchIndicatorReport,
    createIndicatorReport,
    updateIndicatorReport,
    submitIndicatorReport,
    
    // Custom Plans
    fetchPlanTypes,
    fetchPlanFields,
    fetchCustomPlans,
    fetchCustomPlanDetails,
    createCustomPlan,
    updateCustomPlan,
    submitCustomPlan,
    upsertCustomPlanResponse,
    
    // Utilities
    uploadFile,
    checkPeriodActive,
  };
}
