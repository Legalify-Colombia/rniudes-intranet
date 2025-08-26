import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';
import { sanitizeInput, isValidEmail } from '@/utils/securityUtils';

export interface RoleChangeLog {
  id: string;
  user_id: string;
  old_role: string | null;
  new_role: string;
  changed_by: string;
  changed_at: string;
  reason: string | null;
}

export const useSecureUserManagement = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const changeUserRole = async (
    userId: string, 
    newRole: string, 
    reason?: string
  ): Promise<boolean> => {
    try {
      setLoading(true);

      // Validate inputs
      if (!userId || !newRole) {
        throw new Error('ID de usuario y rol son requeridos');
      }

      if (!['Administrador', 'Coordinador', 'Gestor'].includes(newRole)) {
        throw new Error('Rol inválido');
      }

      const sanitizedReason = reason ? sanitizeInput(reason, 500) : null;

      // Call secure database function
      const { error } = await supabase.rpc('change_user_role', {
        target_user_id: userId,
        new_role: newRole,
        reason: sanitizedReason
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Rol actualizado",
        description: "El rol del usuario ha sido actualizado exitosamente.",
      });

      return true;
    } catch (error: any) {
      console.error('Error changing user role:', error);
      toast({
        title: "Error al cambiar rol",
        description: error.message,
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getRoleChangeHistory = async (userId?: string): Promise<RoleChangeLog[]> => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('role_change_audit')
        .select('*')
        .order('changed_at', { ascending: false });

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error: any) {
      console.error('Error fetching role change history:', error);
      toast({
        title: "Error al cargar historial",
        description: error.message,
        variant: "destructive",
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  const validateUserPermissions = async (action: string, targetUserId?: string): Promise<boolean> => {
    try {
      // Get current user profile
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return false;
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role, managed_campus_ids')
        .eq('id', user.id)
        .single();

      if (error || !profile) {
        return false;
      }

      // Administrators can perform all actions
      if (profile.role === 'Administrador') {
        return true;
      }

      // Coordinators have limited permissions
      if (profile.role === 'Coordinador') {
        // Define coordinator permissions here
        const coordinatorActions = ['view_users', 'view_reports', 'approve_plans'];
        return coordinatorActions.includes(action);
      }

      // Managers have basic permissions
      if (profile.role === 'Gestor') {
        const managerActions = ['view_own_data', 'create_reports', 'submit_plans'];
        return managerActions.includes(action);
      }

      return false;
    } catch (error) {
      console.error('Error validating permissions:', error);
      return false;
    }
  };

  const secureUpdateProfile = async (
    userId: string, 
    updates: Record<string, any>
  ): Promise<boolean> => {
    try {
      setLoading(true);

      // Validate permissions
      const hasPermission = await validateUserPermissions('update_profile', userId);
      if (!hasPermission) {
        throw new Error('No tienes permisos para realizar esta acción');
      }

      // Sanitize inputs
      const sanitizedUpdates: Record<string, any> = {};
      
      Object.entries(updates).forEach(([key, value]) => {
        if (typeof value === 'string') {
          sanitizedUpdates[key] = sanitizeInput(value, 255);
        } else {
          sanitizedUpdates[key] = value;
        }
      });

      // Validate email if present
      if (sanitizedUpdates.email && !isValidEmail(sanitizedUpdates.email)) {
        throw new Error('Formato de email inválido');
      }

      // Prevent direct role changes (use changeUserRole instead)
      delete sanitizedUpdates.role;
      delete sanitizedUpdates.managed_campus_ids;

      const { error } = await supabase
        .from('profiles')
        .update(sanitizedUpdates)
        .eq('id', userId);

      if (error) {
        throw error;
      }

      toast({
        title: "Perfil actualizado",
        description: "Los datos del perfil han sido actualizados exitosamente.",
      });

      return true;
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error al actualizar perfil",
        description: error.message,
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    changeUserRole,
    getRoleChangeHistory,
    validateUserPermissions,
    secureUpdateProfile,
    loading
  };
};