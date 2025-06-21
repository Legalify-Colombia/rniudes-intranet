import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { Bell, FileText, Target, User } from "lucide-react";

interface NotificationItem {
  id: string;
  manager_name: string;
  program_name: string;
  campus_name: string;
  action_type: 'plan_submitted' | 'report_submitted';
  created_at: string;
}

export function NotificationFeed() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { fetchCustomPlans, fetchManagerReports, fetchManagers, fetchAcademicPrograms, fetchCampus } = useSupabaseData();

  useEffect(() => {
    loadNotifications();
  }, []);

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

      // Procesar planes de trabajo enviados (custom plans)
      customPlans
        .filter(plan => plan.status === 'submitted' || plan.status === 'approved')
        .forEach(plan => {
          const manager = managers.find(m => m.id === plan.manager_id);
          // For custom plans, we need to get program from manager's profile
          const managerProfile = manager?.profile || manager;
          const program = programs.find(p => p.manager_id === plan.manager_id);
          const campus = campuses.find(c => c.id === program?.campus_id);

          if (manager && program && campus) {
            notificationsList.push({
              id: `plan-${plan.id}`,
              manager_name: managerProfile?.full_name || manager.full_name || 'Manager',
              program_name: program.name,
              campus_name: campus.name,
              action_type: 'plan_submitted',
              created_at: plan.submitted_date || plan.created_at
            });
          }
        });

      // Procesar informes enviados
      reports
        .filter(report => report.status === 'submitted' || report.status === 'reviewed')
        .forEach(report => {
          const manager = managers.find(m => m.id === report.manager_id);
          const customPlan = customPlans.find(cp => cp.id === report.work_plan_id);
          const program = programs.find(p => p.manager_id === report.manager_id);
          const campus = campuses.find(c => c.id === program?.campus_id);

          if (manager && program && campus) {
            const managerProfile = manager?.profile || manager;
            notificationsList.push({
              id: `report-${report.id}`,
              manager_name: managerProfile?.full_name || manager.full_name || 'Manager',
              program_name: program.name,
              campus_name: campus.name,
              action_type: 'report_submitted',
              created_at: report.submitted_date || report.created_at
            });
          }
        });

      // Ordenar por fecha más reciente
      notificationsList.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setNotifications(notificationsList.slice(0, 10)); // Mostrar solo las 10 más recientes
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
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

  const getActionText = (actionType: 'plan_submitted' | 'report_submitted') => {
    return actionType === 'plan_submitted' 
      ? 'Gestor presenta plan de trabajo'
      : 'Gestor reporta avances en informes parciales';
  };

  const getActionIcon = (actionType: 'plan_submitted' | 'report_submitted') => {
    return actionType === 'plan_submitted' 
      ? <Target className="h-4 w-4 text-blue-500" />
      : <FileText className="h-4 w-4 text-green-500" />;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notificaciones de Actividad
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500">Cargando notificaciones...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notificaciones de Actividad
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-80">
          {notifications.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No hay notificaciones recientes
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
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
                      variant={notification.action_type === 'plan_submitted' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {notification.action_type === 'plan_submitted' ? 'Plan' : 'Informe'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
