
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { useAuth } from "@/hooks/useAuth";
import { 
  Users, 
  Building2, 
  GraduationCap, 
  Target,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText
} from "lucide-react";

export function Dashboard() {
  const { profile } = useAuth();
  const { 
    fetchManagers, 
    fetchAcademicPrograms, 
    fetchCampus, 
    fetchWorkPlans,
    fetchManagerReports
  } = useSupabaseData();
  
  const [stats, setStats] = useState({
    totalManagers: 0,
    totalPrograms: 0,
    totalCampuses: 0,
    workPlansStats: {
      draft: 0,
      submitted: 0,
      approved: 0,
      rejected: 0
    },
    reportsStats: {
      pending: 0,
      submitted: 0,
      reviewed: 0
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [
        managersResult,
        programsResult,
        campusResult,
        workPlansResult,
        reportsResult
      ] = await Promise.all([
        fetchManagers(),
        fetchAcademicPrograms(),
        fetchCampus(),
        fetchWorkPlans(),
        fetchManagerReports()
      ]);

      const managers = managersResult.data || [];
      const programs = programsResult.data || [];
      const campuses = campusResult.data || [];
      const workPlans = workPlansResult.data || [];
      const reports = reportsResult.data || [];

      // Calcular estadísticas de planes de trabajo
      const workPlansStats = {
        draft: workPlans.filter(wp => wp.status === 'draft').length,
        submitted: workPlans.filter(wp => wp.status === 'submitted').length,
        approved: workPlans.filter(wp => wp.status === 'approved').length,
        rejected: workPlans.filter(wp => wp.status === 'rejected').length
      };

      // Calcular estadísticas de informes
      const approvedPlans = workPlans.filter(wp => wp.status === 'approved');
      const reportsStats = {
        pending: approvedPlans.length - reports.length,
        submitted: reports.filter(r => r.status === 'submitted').length,
        reviewed: reports.filter(r => r.status === 'reviewed').length
      };

      setStats({
        totalManagers: managers.length,
        totalPrograms: programs.length,
        totalCampuses: campuses.length,
        workPlansStats,
        reportsStats
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Cargando dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Gestores</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalManagers}</div>
            <p className="text-xs text-muted-foreground">
              Gestores registrados en el sistema
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Campus</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCampuses}</div>
            <p className="text-xs text-muted-foreground">
              Campus disponibles
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Programas Académicos</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPrograms}</div>
            <p className="text-xs text-muted-foreground">
              Programas registrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Planes Aprobados</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.workPlansStats.approved}</div>
            <p className="text-xs text-muted-foreground">
              Planes de trabajo aprobados
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Estado de Planes de Trabajo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-gray-500" />
                <span className="text-sm">Borradores</span>
              </div>
              <Badge variant="secondary">{stats.workPlansStats.draft}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-500" />
                <span className="text-sm">Enviados</span>
              </div>
              <Badge variant="default">{stats.workPlansStats.submitted}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Aprobados</span>
              </div>
              <Badge variant="default" className="bg-green-600">
                {stats.workPlansStats.approved}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm">Rechazados</span>
              </div>
              <Badge variant="destructive">{stats.workPlansStats.rejected}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Estado de Informes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-orange-500" />
                <span className="text-sm">Pendientes</span>
              </div>
              <Badge variant="outline">{stats.reportsStats.pending}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-500" />
                <span className="text-sm">Enviados</span>
              </div>
              <Badge variant="default">{stats.reportsStats.submitted}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Revisados</span>
              </div>
              <Badge variant="default" className="bg-green-600">
                {stats.reportsStats.reviewed}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {profile?.role === 'Gestor' && (
        <Card>
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-600">
              <p>• Revisa tu plan de trabajo en la sección "Mi Plan de Trabajo"</p>
              <p>• Una vez aprobado tu plan, podrás crear informes de gestión</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
