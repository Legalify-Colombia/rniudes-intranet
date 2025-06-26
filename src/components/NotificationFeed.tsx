
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { useAuth } from "@/hooks/useAuth";
import { Bell, FileText, Target, User, CheckCircle, Clock, AlertTriangle } from "lucide-react";

interface NotificationItem {
  id: string;
  manager_name: string;
  program_name: string;
  campus_name: string;
  action_type: 'plan_submitted' | 'report_submitted' | 'plan_approved' | 'plan_rejected';
  created_at: string;
  status?: string;
}

export function NotificationFeed() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<NotificationItem[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();
  const { 
    fetchCustomPlans, 
    fetchManagerReports, 
    fetchManagers, 
    fetchAcademicPrograms, 
    fetchCampus 
  } = useSupabaseData();

  useEffect(() => {
    loadNotifications();
  }, [profile]);

  useEffect(() => {
    filterNotificationsByRole();
  }, [notifications, selectedRole]);

  const loadNotifications = async () => {
    try {
      const [customPlansResult, reportsResult, managersResult, programsResult, campusResult] = await Promise.all([
        fetchCustomPlans(),
        fetchManagerReports(),
        fetchManagers(),
        fetchAcademicPrograms(),
        fetchCampus()
      ]);

      const customPlans = customPlansResult.data || [];
      const reports = reportsResult.data || [];
      const managers = managersResult.data || [];
      const programs = programsResult.data || [];
      const campuses = campusResult.data || [];

      const notificationsList: NotificationItem[] = [];

      // Procesar planes de trabajo
      customPlans.forEach(plan => {
        const manager = managers.find(m => m.id === plan.manager_id);
        const program = programs.find(p => p.manager_id === plan.manager_id);
        const campus = campuses.find(c => c.id === program?.campus_id);

        if (manager && program && campus) {
          // Plan enviado
          if (plan.status === 'submitted' && plan.submitted_date) {
            notificationsList.push({
              id: `plan-submitted-${plan.id}`,
              manager_name: manager.full_name || 'Manager',
              program_name: program.name,
              campus_name: campus.name,
              action_type: 'plan_submitted',
              created_at: plan.submitted_date,
              status: plan.status
            });
          }

          // Plan aprobado
          if (plan.status === 'approved' && plan.approved_date) {
            notificationsList.push({
              id: `plan-approved-${plan.id}`,
              manager_name: manager.full_name || 'Manager',
              program_name: program.name,
              campus_name: campus.name,
              action_type: 'plan_approved',
              created_at: plan.approved_date,
              status: plan.status
            });
          }

          // Plan rechazado
          if (plan.status === 'rejected' && plan.approved_date) {
            notificationsList.push({
              id: `plan-rejected-${plan.id}`,
              manager_name: manager.full_name || 'Manager',
              program_name: program.name,
              campus_name: campus.name,
              action_type: 'plan_rejected',
              created_at: plan.approved_date,
              status: plan.status
            });
          }
        }
      });

      // Procesar informes enviados
      reports
        .filter(report => report.status === 'submitted' || report.status === 'reviewed')
        .forEach(report => {
          const manager = managers.find(m => m.id === report.manager_id);
          const program = programs.find(p => p.manager_id === report.manager_id);
          const campus = campuses.find(c => c.id === program?.campus_id);

          if (manager && program && campus) {
            notificationsList.push({
              id: `report-${report.id}`,
              manager_name: manager.full_name || 'Manager',
              program_name: program.name,
              campus_name: campus.name,
              action_type: 'report_submitted',
              created_at: report.submitted_date || report.created_at,
              status: report.status
            });
          }
        });

      // Ordenar por fecha más reciente
      notificationsList.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setNotifications(notificationsList);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterNotificationsByRole = () => {
    let filtered = [...notifications];

    // Filtrar según el rol seleccionado o el rol del usuario actual
    const roleToFilter = selectedRole !== "all" ? selectedRole : profile?.role;

    switch (roleToFilter) {
      case 'Gestor':
        // Los gestores ven sus propias notificaciones
        filtered = filtered.filter(notification => {
          // Aquí necesitaríamos relacionar las notificaciones con el gestor actual
          return true; // Por ahora mostrar todas, se puede refinar más
        });
        break;
      case 'Coordinador':
        // Los coordinadores ven notificaciones de su campus
        filtered = filtered.filter(notification => {
          // Filtrar por campus del coordinador si está definido
          return true; // Por ahora mostrar todas
        });
        break;
      case 'Administrador':
        // Los administradores ven todas las notificaciones
        break;
      default:
        break;
    }

    setFilteredNotifications(filtered.slice(0, 15));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActionText = (actionType: 'plan_submitted' | 'report_submitted' | 'plan_approved' | 'plan_rejected') => {
    switch (actionType) {
      case 'plan_submitted':
        return 'Gestor presenta plan de trabajo';
      case 'report_submitted':
        return 'Gestor reporta avances en informes';
      case 'plan_approved':
        return 'Plan de trabajo aprobado';
      case 'plan_rejected':
        return 'Plan de trabajo rechazado';
      default:
        return 'Actividad registrada';
    }
  };

  const getActionIcon = (actionType: 'plan_submitted' | 'report_submitted' | 'plan_approved' | 'plan_rejected') => {
    switch (actionType) {
      case 'plan_submitted':
        return <Target className="h-4 w-4 text-blue-500" />;
      case 'report_submitted':
        return <FileText className="h-4 w-4 text-green-500" />;
      case 'plan_approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'plan_rejected':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActionColor = (actionType: 'plan_submitted' | 'report_submitted' | 'plan_approved' | 'plan_rejected') => {
    switch (actionType) {
      case 'plan_submitted':
        return 'default';
      case 'report_submitted':
        return 'secondary';
      case 'plan_approved':
        return 'default';
      case 'plan_rejected':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="text-center text-gray-500">Cargando notificaciones...</div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filtro por rol para administradores */}
      {profile?.role === 'Administrador' && (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Ver notificaciones por rol:</span>
          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los roles</SelectItem>
              <SelectItem value="Gestor">Gestores</SelectItem>
              <SelectItem value="Coordinador">Coordinadores</SelectItem>
              <SelectItem value="Administrador">Administradores</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <ScrollArea className="h-80">
        {filteredNotifications.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No hay notificaciones recientes
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNotifications.map((notification) => (
              <div key={notification.id} className="border-b border-gray-100 pb-3 last:border-b-0">
                <div className="flex items-start gap-3">
                  {getActionIcon(notification.action_type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <User className="h-3 w-3 text-gray-400" />
                      <span className="font-medium text-sm">{notification.manager_name}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      {getActionText(notification.action_type)}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{notification.program_name}</span>
                      <span>•</span>
                      <span>{notification.campus_name}</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {formatDate(notification.created_at)}
                    </div>
                  </div>
                  <Badge 
                    variant={getActionColor(notification.action_type)}
                    className="text-xs"
                  >
                    {notification.action_type === 'plan_submitted' ? 'Plan' :
                     notification.action_type === 'report_submitted' ? 'Informe' :
                     notification.action_type === 'plan_approved' ? 'Aprobado' : 'Rechazado'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
