import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Campus {
  id: string;
  name: string;
  address: string;
}

export interface Faculty {
  id: string;
  name: string;
  dean_name: string;
  campus_id: string;
  campus?: Campus;
  faculty_campus?: Array<{ campus: Campus }>;
}

export interface AcademicProgram {
  id: string;
  name: string;
  campus_id: string;
  faculty_id: string;
  director_name: string;
  director_email: string;
  manager_id?: string;
  campus?: Campus;
  faculty?: Faculty;
  manager?: any;
}

export interface StrategicAxis {
  id: string;
  name: string;
  code: string;
}

export interface Action {
  id: string;
  name: string;
  code: string;
  strategic_axis_id: string;
  strategic_axis?: StrategicAxis;
}

export interface Product {
  id: string;
  name: string;
  action_id: string;
  action?: Action;
}

export interface WorkPlan {
  id: string;
  manager_id: string;
  program_id: string;
  total_hours_assigned: number;
  status: 'draft' | 'pending' | 'submitted' | 'approved' | 'rejected';
  comments?: string;
  coordinator_approval_date?: string;
  coordinator_comments?: string;
  approved_by?: string;
  objectives?: string;
  approval_comments?: string;
  approved_date?: string;
  submitted_date?: string;
}

export interface WorkPlanAssignment {
  id: string;
  work_plan_id: string;
  product_id: string;
  assigned_hours: number;
  product?: Product;
}

export interface ManagerReport {
  id: string;
  manager_id: string;
  work_plan_id: string;
  title: string;
  description?: string;
  general_report_url?: string;
  general_report_file_name?: string;
  status: 'draft' | 'submitted' | 'reviewed';
  submitted_date?: string;
  created_at: string;
  updated_at: string;
  manager?: any;
  work_plan?: WorkPlan;
}

export interface ProductResponse {
  id: string;
  report_id: string;
  product_id: string;
  response_text?: string;
  file_url?: string;
  file_name?: string;
  created_at: string;
  updated_at: string;
  product?: Product;
}

export interface ReportPeriod {
  id: string;
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ProductProgressReport {
  id: string;
  manager_report_id: string;
  product_id: string;
  work_plan_assignment_id: string;
  progress_percentage: number;
  observations?: string;
  evidence_files?: string[];
  evidence_file_names?: string[];
  created_at: string;
  updated_at: string;
  product?: Product;
  work_plan_assignment?: WorkPlanAssignment;
}

export interface ReportSystemConfig {
  id: string;
  max_reports_per_period: number;
  reports_enabled: boolean;
  auto_calculate_progress: boolean;
  require_evidence: boolean;
  created_at: string;
  updated_at: string;
}

export function useSupabaseData() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);

  // Campus functions
  const fetchCampus = async () => {
    const { data, error } = await supabase
      .from('campus')
      .select('*')
      .order('name');
    return { data, error };
  };

  const createCampus = async (campus: Omit<Campus, 'id'>) => {
    const { data, error } = await supabase
      .from('campus')
      .insert([campus])
      .select()
      .single();
    return { data, error };
  };

  const updateCampus = async (id: string, updates: Partial<Campus>) => {
    const { data, error } = await supabase
      .from('campus')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  };

  const deleteCampus = async (id: string) => {
    const { data, error } = await supabase
      .from('campus')
      .delete()
      .eq('id', id);
    return { data, error };
  };

  // Faculty functions
  const fetchFaculties = async () => {
    const { data, error } = await supabase
      .from('faculties')
      .select(`
        *,
        campus:campus_id(*),
        faculty_campus!inner(
          campus(*)
        )
      `)
      .order('name');
    return { data, error };
  };

  const createFaculty = async (faculty: Omit<Faculty, 'id'> & { campus_ids?: string[] }) => {
    const { campus_ids, ...facultyData } = faculty;
    
    // Crear la facultad
    const { data: facultyResult, error: facultyError } = await supabase
      .from('faculties')
      .insert([facultyData])
      .select()
      .single();

    if (facultyError || !facultyResult) {
      return { data: null, error: facultyError };
    }

    // Crear las relaciones con campus si se proporcionaron
    if (campus_ids && campus_ids.length > 0) {
      const facultyCampusRelations = campus_ids.map(campus_id => ({
        faculty_id: facultyResult.id,
        campus_id
      }));

      const { error: relationError } = await supabase
        .from('faculty_campus')
        .insert(facultyCampusRelations);

      if (relationError) {
        // Si hay error en las relaciones, eliminar la facultad creada
        await supabase.from('faculties').delete().eq('id', facultyResult.id);
        return { data: null, error: relationError };
      }
    }

    return { data: facultyResult, error: null };
  };

  const updateFaculty = async (id: string, updates: Partial<Faculty> & { campus_ids?: string[] }) => {
    const { campus_ids, ...facultyUpdates } = updates;
    
    // Actualizar la facultad
    const { data: facultyResult, error: facultyError } = await supabase
      .from('faculties')
      .update(facultyUpdates)
      .eq('id', id)
      .select()
      .single();

    if (facultyError) {
      return { data: null, error: facultyError };
    }

    // Si se proporcionaron campus_ids, actualizar las relaciones
    if (campus_ids !== undefined) {
      // Eliminar relaciones existentes
      await supabase
        .from('faculty_campus')
        .delete()
        .eq('faculty_id', id);

      // Crear nuevas relaciones
      if (campus_ids.length > 0) {
        const facultyCampusRelations = campus_ids.map(campus_id => ({
          faculty_id: id,
          campus_id
        }));

        const { error: relationError } = await supabase
          .from('faculty_campus')
          .insert(facultyCampusRelations);

        if (relationError) {
          return { data: null, error: relationError };
        }
      }
    }

    return { data: facultyResult, error: null };
  };

  const deleteFaculty = async (id: string) => {
    const { data, error } = await supabase
      .from('faculties')
      .delete()
      .eq('id', id);
    return { data, error };
  };

  // Academic Programs functions
  const fetchAcademicPrograms = async () => {
    const { data, error } = await supabase
      .from('academic_programs')
      .select(`
        *,
        campus:campus_id(*),
        faculty:faculty_id(*),
        manager:manager_id(
          *,
          academic_programs(
            *,
            campus:campus_id(*),
            faculty:faculty_id(*)
          )
        )
      `)
      .order('name');
    return { data, error };
  };

  const createAcademicProgram = async (program: Omit<AcademicProgram, 'id'>) => {
    const { data, error } = await supabase
      .from('academic_programs')
      .insert([program])
      .select()
      .single();
    return { data, error };
  };

  const updateAcademicProgram = async (id: string, updates: Partial<AcademicProgram>) => {
    const { data, error } = await supabase
      .from('academic_programs')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  };

  const deleteAcademicProgram = async (id: string) => {
    const { data, error } = await supabase
      .from('academic_programs')
      .delete()
      .eq('id', id);
    return { data, error };
  };

  // Manager functions - Mejorada para incluir relaciones completas
  const fetchManagers = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        academic_programs(
          *,
          campus:campus_id(*),
          faculty:faculty_id(*)
        )
      `)
      .eq('role', 'Gestor')
      .order('full_name');
    return { data, error };
  };

  // Función para actualizar las horas de trabajo de un gestor
  const updateManagerHours = async (managerId: string, weeklyHours: number, numberOfWeeks: number = 16) => {
    const totalHours = weeklyHours * numberOfWeeks;
    
    const { data, error } = await supabase
      .from('profiles')
      .update({ 
        weekly_hours: weeklyHours,
        number_of_weeks: numberOfWeeks,
        total_hours: totalHours
      })
      .eq('id', managerId)
      .eq('role', 'Gestor')
      .select()
      .single();
    
    return { data, error };
  };

  // Strategic Axes functions
  const fetchStrategicAxes = async () => {
    const { data, error } = await supabase
      .from('strategic_axes')
      .select('*')
      .order('code');
    return { data, error };
  };

  const createStrategicAxis = async (axis: { name: string; code: string }) => {
    if (!profile?.id) return { data: null, error: { message: 'No user profile' } };
    
    const { data, error } = await supabase
      .from('strategic_axes')
      .insert([{ ...axis, created_by: profile.id }])
      .select()
      .single();
    return { data, error };
  };

  const updateStrategicAxis = async (id: string, updates: { name?: string; code?: string }) => {
    const { data, error } = await supabase
      .from('strategic_axes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  };

  const deleteStrategicAxis = async (id: string) => {
    const { data, error } = await supabase
      .from('strategic_axes')
      .delete()
      .eq('id', id);
    return { data, error };
  };

  // Actions functions
  const fetchActions = async () => {
    const { data, error } = await supabase
      .from('actions')
      .select(`
        *,
        strategic_axis:strategic_axis_id(*)
      `)
      .order('code');
    return { data, error };
  };

  const createAction = async (action: { name: string; code: string; strategic_axis_id: string }) => {
    if (!profile?.id) return { data: null, error: { message: 'No user profile' } };
    
    const { data, error } = await supabase
      .from('actions')
      .insert([{ ...action, created_by: profile.id }])
      .select()
      .single();
    return { data, error };
  };

  const updateAction = async (id: string, updates: { name?: string; code?: string; strategic_axis_id?: string }) => {
    const { data, error } = await supabase
      .from('actions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  };

  const deleteAction = async (id: string) => {
    const { data, error } = await supabase
      .from('actions')
      .delete()
      .eq('id', id);
    return { data, error };
  };

  // Products functions
  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        action:action_id(
          *,
          strategic_axis:strategic_axis_id(*)
        )
      `)
      .order('name');
    return { data, error };
  };

  const createProduct = async (product: { name: string; action_id: string }) => {
    if (!profile?.id) return { data: null, error: { message: 'No user profile' } };
    
    const { data, error } = await supabase
      .from('products')
      .insert([{ ...product, created_by: profile.id }])
      .select()
      .single();
    return { data, error };
  };

  const updateProduct = async (id: string, updates: { name?: string; action_id?: string }) => {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  };

  const deleteProduct = async (id: string) => {
    const { data, error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    return { data, error };
  };

  // Work Plans functions
  const fetchWorkPlans = async () => {
    const { data, error } = await supabase
      .from('work_plans')
      .select(`
        *,
        manager:profiles!work_plans_manager_id_fkey(
          id,
          full_name,
          email,
          position
        )
      `)
      .order('created_at', { ascending: false });
    return { data, error };
  };

  const createWorkPlan = async (workPlan: Omit<WorkPlan, 'id'>) => {
    const { data, error } = await supabase
      .from('work_plans')
      .insert([workPlan])
      .select()
      .single();
    return { data, error };
  };

  const updateWorkPlan = async (id: string, updates: Partial<WorkPlan>) => {
    const { data, error } = await supabase
      .from('work_plans')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  };

  // Función específica para aprobar/rechazar planes de trabajo - CORREGIDA
  const approveWorkPlan = async (workPlanId: string, status: 'approved' | 'rejected', comments?: string) => {
    console.log('Aprobando plan:', { workPlanId, status, comments, approvedBy: profile?.id });
    
    const updateData: any = { 
      status,
      approval_comments: comments || null
    };

    // Solo establecer fecha de aprobación y aprobador si es aprobado
    if (status === 'approved') {
      updateData.approved_date = new Date().toISOString();
      updateData.approved_by = profile?.id;
    } else {
      // Si es rechazado, limpiar campos de aprobación
      updateData.approved_date = null;
      updateData.approved_by = null;
    }

    const { data, error } = await supabase
      .from('work_plans')
      .update(updateData)
      .eq('id', workPlanId)
      .select();

    console.log('Resultado de aprobación:', { data, error });
    return { data, error };
  };

  // Nueva función para obtener detalles completos de un plan de trabajo
  const fetchWorkPlanDetails = async (workPlanId: string) => {
    const { data, error } = await supabase
      .from('work_plans')
      .select(`
        *,
        manager:profiles!work_plans_manager_id_fkey(
          id,
          full_name,
          email,
          position
        ),
        program:academic_programs!work_plans_program_id_fkey(
          id,
          name,
          campus:campus_id(name),
          faculty:faculty_id(name)
        )
      `)
      .eq('id', workPlanId)
      .single();
    
    return { data, error };
  };

  // Función para obtener planes pendientes de aprobación - CORREGIDA
  const fetchPendingWorkPlans = async () => {
    console.log('Ejecutando fetchPendingWorkPlans...');
    
    const { data, error } = await supabase
      .from('work_plans')
      .select(`
        *,
        manager:profiles!work_plans_manager_id_fkey(
          id,
          full_name,
          email,
          position
        ),
        program:academic_programs!work_plans_program_id_fkey(
          id,
          name,
          campus:campus_id(
            id,
            name
          ),
          faculty:faculty_id(
            id,
            name
          )
        )
      `)
      .in('status', ['pending', 'submitted'])
      .order('submitted_date', { ascending: true });

    console.log('Resultado de fetchPendingWorkPlans:', { data, error });
    
    // Transformar los datos para que coincidan con la estructura esperada
    if (data) {
      const transformedData = data.map(plan => ({
        ...plan,
        manager_name: plan.manager?.full_name,
        manager_email: plan.manager?.email,
        manager_position: plan.manager?.position,
        program_name: plan.program?.name,
        campus_name: plan.program?.campus?.name,
        faculty_name: plan.program?.faculty?.name
      }));
      
      return { data: transformedData, error };
    }

    return { data, error };
  };

  // Work Plan Assignments functions
  const fetchWorkPlanAssignments = async (workPlanId: string) => {
    const { data, error } = await supabase
      .from('work_plan_assignments')
      .select(`
        *,
        product:product_id(
          *,
          action:action_id(
            *,
            strategic_axis:strategic_axis_id(*)
          )
        )
      `)
      .eq('work_plan_id', workPlanId);
    return { data, error };
  };

  const upsertWorkPlanAssignment = async (assignment: Omit<WorkPlanAssignment, 'id'>) => {
    const { data, error } = await supabase
      .from('work_plan_assignments')
      .upsert([assignment], { onConflict: 'work_plan_id,product_id' })
      .select()
      .single();
    return { data, error };
  };

  const deleteWorkPlanAssignment = async (workPlanId: string, productId: string) => {
    const { data, error } = await supabase
      .from('work_plan_assignments')
      .delete()
      .eq('work_plan_id', workPlanId)
      .eq('product_id', productId);
    return { data, error };
  };

  // Manager Reports functions
  const fetchManagerReports = async () => {
    const { data, error } = await supabase
      .from('manager_reports')
      .select(`
        *,
        manager:manager_id(*),
        work_plan:work_plan_id(
          *,
          program:program_id(*)
        )
      `)
      .order('created_at', { ascending: false });
    return { data, error };
  };

  const fetchManagerReportsByManager = async (managerId: string) => {
    const { data, error } = await supabase
      .from('manager_reports')
      .select(`
        *,
        work_plan:work_plan_id(*)
      `)
      .eq('manager_id', managerId)
      .order('created_at', { ascending: false });
    return { data, error };
  };

  const createManagerReport = async (report: Omit<ManagerReport, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('manager_reports')
      .insert([report])
      .select()
      .single();
    return { data, error };
  };

  const updateManagerReport = async (id: string, updates: Partial<ManagerReport>) => {
    const { data, error } = await supabase
      .from('manager_reports')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  };

  // Product Responses functions
  const fetchProductResponses = async (reportId: string) => {
    const { data, error } = await supabase
      .from('product_responses')
      .select(`
        *,
        product:product_id(
          *,
          action:action_id(
            *,
            strategic_axis:strategic_axis_id(*)
          )
        )
      `)
      .eq('report_id', reportId);
    return { data, error };
  };

  const upsertProductResponse = async (response: Omit<ProductResponse, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('product_responses')
      .upsert([response], { onConflict: 'report_id,product_id' })
      .select()
      .single();
    return { data, error };
  };

  // Report Periods functions
  const fetchReportPeriods = async () => {
    const { data, error } = await supabase
      .from('report_periods')
      .select('*')
      .order('start_date', { ascending: false });
    return { data, error };
  };

  const createReportPeriod = async (period: Omit<ReportPeriod, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('report_periods')
      .insert([period])
      .select()
      .single();
    return { data, error };
  };

  const updateReportPeriod = async (id: string, updates: Partial<ReportPeriod>) => {
    const { data, error } = await supabase
      .from('report_periods')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  };

  const deleteReportPeriod = async (id: string) => {
    const { data, error } = await supabase
      .from('report_periods')
      .delete()
      .eq('id', id);
    return { data, error };
  };

  // Product Progress Reports functions
  const fetchProductProgressReports = async (managerReportId: string) => {
    const { data, error } = await supabase
      .from('product_progress_reports')
      .select(`
        *,
        product:product_id(
          *,
          action:action_id(
            *,
            strategic_axis:strategic_axis_id(*)
          )
        ),
        work_plan_assignment:work_plan_assignment_id(*)
      `)
      .eq('manager_report_id', managerReportId);
    return { data, error };
  };

  const upsertProductProgressReport = async (report: Omit<ProductProgressReport, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('product_progress_reports')
      .upsert([report], { onConflict: 'manager_report_id,product_id' })
      .select()
      .single();
    return { data, error };
  };

  const deleteProductProgressReport = async (id: string) => {
    const { data, error } = await supabase
      .from('product_progress_reports')
      .delete()
      .eq('id', id);
    return { data, error };
  };

  // Report System Config functions
  const fetchReportSystemConfig = async () => {
    const { data, error } = await supabase
      .from('report_system_config')
      .select('*')
      .single();
    return { data, error };
  };

  const updateReportSystemConfig = async (updates: Partial<ReportSystemConfig>) => {
    const { data, error } = await supabase
      .from('report_system_config')
      .update(updates)
      .select()
      .single();
    return { data, error };
  };

  // Función para obtener reportes con información completa incluyendo períodos
  const fetchManagerReportsWithPeriods = async () => {
    const { data, error } = await supabase
      .from('manager_reports')
      .select(`
        *,
        manager:manager_id(*),
        work_plan:work_plan_id(
          *,
          program:program_id(*)
        ),
        report_period:report_period_id(*)
      `)
      .order('created_at', { ascending: false });
    return { data, error };
  };

  // Función para obtener reportes de un gestor específico con períodos
  const fetchManagerReportsByManagerWithPeriods = async (managerId: string) => {
    const { data, error } = await supabase
      .from('manager_reports')
      .select(`
        *,
        work_plan:work_plan_id(*),
        report_period:report_period_id(*)
      `)
      .eq('manager_id', managerId)
      .order('created_at', { ascending: false });
    return { data, error };
  };

  // File upload function
  const uploadFile = async (file: File, bucket: string, path: string) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true
      });
    
    if (error) return { data: null, error };
    
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);
    
    return { data: { ...data, publicUrl: urlData.publicUrl }, error: null };
  };

  const deleteFile = async (bucket: string, path: string) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .remove([path]);
    return { data, error };
  };

  return {
    loading,
    setLoading,
    // Campus
    fetchCampus,
    createCampus,
    updateCampus,
    deleteCampus,
    // Faculties
    fetchFaculties,
    createFaculty,
    updateFaculty,
    deleteFaculty,
    // Academic Programs
    fetchAcademicPrograms,
    createAcademicProgram,
    updateAcademicProgram,
    deleteAcademicProgram,
    // Managers
    fetchManagers,
    updateManagerHours,
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
    createWorkPlan,
    updateWorkPlan,
    approveWorkPlan,
    fetchPendingWorkPlans,
    fetchWorkPlanDetails,
    // Work Plan Assignments
    fetchWorkPlanAssignments,
    upsertWorkPlanAssignment,
    deleteWorkPlanAssignment,
    // Manager Reports
    fetchManagerReports,
    fetchManagerReportsByManager,
    createManagerReport,
    updateManagerReport,
    // Product Responses
    fetchProductResponses,
    upsertProductResponse,
    // File Management
    uploadFile,
    deleteFile,
    // Report Periods
    fetchReportPeriods,
    createReportPeriod,
    updateReportPeriod,
    deleteReportPeriod,
    // Product Progress Reports
    fetchProductProgressReports,
    upsertProductProgressReport,
    deleteProductProgressReport,
    // Report System Config
    fetchReportSystemConfig,
    updateReportSystemConfig,
    // Enhanced Manager Reports
    fetchManagerReportsWithPeriods,
    fetchManagerReportsByManagerWithPeriods,
  };
}
