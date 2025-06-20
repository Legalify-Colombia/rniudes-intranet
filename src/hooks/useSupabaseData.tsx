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
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  comments?: string;
  coordinator_approval_date?: string;
  coordinator_comments?: string;
  approved_by?: string;
}

export interface WorkPlanAssignment {
  id: string;
  work_plan_id: string;
  product_id: string;
  assigned_hours: number;
  product?: Product;
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
        manager:manager_id(*)
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

  // Manager functions - filtrar solo gestores disponibles
  const fetchManagers = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
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
        manager:manager_id(*),
        program:program_id(*)
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
    // Work Plan Assignments
    fetchWorkPlanAssignments,
    upsertWorkPlanAssignment,
    deleteWorkPlanAssignment,
  };
}
