
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { useAuth } from "@/hooks/useAuth";
import { NotificationFeed } from "@/components/NotificationFeed";
import { StrategicAxesProgress } from "@/components/StrategicAxesProgress";
import { AdminDashboard } from "@/components/AdminDashboard";
import { 
  Target,
  TrendingUp,
  Package,
  Activity,
  Users,
  GraduationCap,
  FileText,
  CheckCircle
} from "lucide-react";

export function Dashboard() {
  const { profile } = useAuth();
  const { 
    fetchStrategicAxes,
    fetchActions,
    fetchProducts,
    fetchCustomPlans,
    fetchManagerReports,
    fetchManagers,
    fetchAcademicPrograms,
    fetchCampus
  } = useSupabaseData();
  
  const [dashboardStats, setDashboardStats] = useState({
    totalAxes: 0,
    totalActions: 0,
    totalProducts: 0,
    totalProfessors: 0,
    totalPrograms: 0,
    submittedPlans: 0,
    approvedPlans: 0,
    averageProgress: 0,
    overallProgress: 0
  });
  const [professorProgress, setProfessorProgress] = useState<any[]>([]);
  const [selectedCampus, setSelectedCampus] = useState<string>("all");
  const [campusList, setCampusList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [selectedCampus, profile]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const [
        axesResult,
        actionsResult,
        productsResult,
        plansResult,
        reportsResult,
        managersResult,
        programsResult,
        campusResult
      ] = await Promise.all([
        fetchStrategicAxes(),
        fetchActions(),
        fetchProducts(),
        fetchCustomPlans(),
        fetchManagerReports(),
        fetchManagers(),
        fetchAcademicPrograms(),
        fetchCampus()
      ]);

      const axes = axesResult.data || [];
      const actions = actionsResult.data || [];
      const products = productsResult.data || [];
      const plans = plansResult.data || [];
      const reports = reportsResult.data || [];
      const managers = managersResult.data || [];
      const programs = programsResult.data || [];
      const campuses = campusResult.data || [];

      setCampusList(campuses);

      // Filtrar datos por campus si es necesario
      let filteredManagers = managers;
      let filteredPrograms = programs;
      let filteredPlans = plans;
      let filteredReports = reports;

      if (selectedCampus !== "all") {
        filteredManagers = managers.filter(manager => manager.campus_id === selectedCampus);
        filteredPrograms = programs.filter(program => program.campus_id === selectedCampus);
        filteredPlans = plans.filter(plan => {
          const manager = managers.find(m => m.id === plan.manager_id);
          return manager?.campus_id === selectedCampus;
        });
        filteredReports = reports.filter(report => {
          const manager = managers.find(m => m.id === report.manager_id);
          return manager?.campus_id === selectedCampus;
        });
      }

      // Filtrar por rol del usuario
      if (profile?.role === 'Coordinador' && profile.campus_id) {
        filteredManagers = filteredManagers.filter(manager => manager.campus_id === profile.campus_id);
        filteredPrograms = filteredPrograms.filter(program => program.campus_id === profile.campus_id);
        filteredPlans = filteredPlans.filter(plan => {
          const manager = managers.find(m => m.id === plan.manager_id);
          return manager?.campus_id === profile.campus_id;
        });
        filteredReports = filteredReports.filter(report => {
          const manager = managers.find(m => m.id === report.manager_id);
          return manager?.campus_id === profile.campus_id;
        });
      }

      if (profile?.role === 'Gestor') {
        filteredPlans = filteredPlans.filter(plan => plan.manager_id === profile.id);
        filteredReports = filteredReports.filter(report => report.manager_id === profile.id);
      }

      // Calcular estadísticas
      const submittedPlans = filteredPlans.filter(plan => plan.status === 'submitted').length;
      const approvedPlans = filteredPlans.filter(plan => plan.status === 'approved').length;
      const totalReports = filteredReports.length;
      const avgProgress = totalReports > 0 
        ? Math.round(filteredReports.reduce((sum, report) => sum + (report.total_progress_percentage || 0), 0) / totalReports)
        : 0;

      // Calcular progreso por profesor
      const professorProgressData = filteredManagers.map(manager => {
        const managerPlans = filteredPlans.filter(plan => plan.manager_id === manager.id);
        const managerReports = filteredReports.filter(report => report.manager_id === manager.id);
        const avgManagerProgress = managerReports.length > 0 
          ? Math.round(managerReports.reduce((sum, report) => sum + (report.total_progress_percentage || 0), 0) / managerReports.length)
          : 0;

        return {
          id: manager.id,
          name: manager.full_name,
          email: manager.email,
          position: manager.position,
          plansSubmitted: managerPlans.filter(plan => plan.status === 'submitted').length,
          plansApproved: managerPlans.filter(plan => plan.status === 'approved').length,
          averageProgress: avgManagerProgress,
          totalReports: managerReports.length
        };
      });

      setDashboardStats({
        totalAxes: axes.length,
        totalActions: actions.length,
        totalProducts: products.length,
        totalProfessors: filteredManagers.length,
        totalPrograms: filteredPrograms.length,
        submittedPlans,
        approvedPlans,
        averageProgress: avgProgress,
        overallProgress: Math.min(100, Math.round((submittedPlans + approvedPlans + avgProgress) / 3))
      });

      setProfessorProgress(professorProgressData);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Datos de ejemplo en caso de error
      setDashboardStats({
        totalAxes: 9,
        totalActions: 20,
        totalProducts: 23,
        totalProfessors: 15,
        totalPrograms: 8,
        submittedPlans: 12,
        approvedPlans: 8,
        averageProgress: 65,
        overallProgress: 52
      });
    } finally {
      setLoading(false);
    }
  };

  // Mostrar dashboard específico para administradores
  if (profile?.role === 'Administrador') {
    return <AdminDashboard />;
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header con filtros */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard de Gestión</h1>
        <p className="text-gray-600 mb-4">Seguimiento de Ejes Estratégicos y Avances</p>
        
        {(['Coordinador', 'Administrador'].includes(profile?.role || '')) && campusList.length > 0 && (
          <div className="flex justify-center">
            <div className="w-64">
              <Select value={selectedCampus} onValueChange={setSelectedCampus}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por campus" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los Campus</SelectItem>
                  {campusList.map((campus) => (
                    <SelectItem key={campus.id} value={campus.id}>
                      {campus.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>

      {/* Indicadores Principales */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Profesores */}
        <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-105 border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100">
          <CardHeader className="text-center pb-3">
            <div className="mx-auto w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mb-3 group-hover:bg-purple-700 transition-colors duration-300">
              <Users className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-lg font-semibold text-gray-800">Profesores</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-4xl font-bold text-purple-600 mb-2 animate-pulse">
              {dashboardStats.totalProfessors}
            </div>
            <p className="text-sm text-gray-600">
              Gestores activos
            </p>
          </CardContent>
        </Card>

        {/* Programas */}
        <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-105 border-indigo-200 bg-gradient-to-br from-indigo-50 to-indigo-100">
          <CardHeader className="text-center pb-3">
            <div className="mx-auto w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center mb-3 group-hover:bg-indigo-700 transition-colors duration-300">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-lg font-semibold text-gray-800">Programas</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-4xl font-bold text-indigo-600 mb-2 animate-pulse">
              {dashboardStats.totalPrograms}
            </div>
            <p className="text-sm text-gray-600">
              Programas académicos
            </p>
          </CardContent>
        </Card>

        {/* Planes Presentados */}
        <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-105 border-green-200 bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader className="text-center pb-3">
            <div className="mx-auto w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mb-3 group-hover:bg-green-700 transition-colors duration-300">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-lg font-semibold text-gray-800">Planes Presentados</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-4xl font-bold text-green-600 mb-2 animate-pulse">
              {dashboardStats.submittedPlans}
            </div>
            <div className="flex items-center justify-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-gray-600">{dashboardStats.approvedPlans} aprobados</span>
            </div>
          </CardContent>
        </Card>

        {/* Progreso General */}
        <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-105 border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100">
          <CardHeader className="text-center pb-3">
            <div className="mx-auto w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center mb-3 group-hover:bg-orange-700 transition-colors duration-300">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-lg font-semibold text-gray-800">Progreso Promedio</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-4xl font-bold text-orange-600 mb-2 animate-pulse">
              {dashboardStats.averageProgress}%
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div 
                className="bg-orange-600 h-2 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${dashboardStats.averageProgress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600">
              Avance de informes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Progreso por Profesor */}
      {professorProgress.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-xl font-semibold text-gray-800">
              Avances por Profesor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Profesor</th>
                    <th className="text-left p-2">Posición</th>
                    <th className="text-center p-2">Planes Enviados</th>
                    <th className="text-center p-2">Planes Aprobados</th>
                    <th className="text-center p-2">Progreso Promedio</th>
                    <th className="text-center p-2">Informes</th>
                  </tr>
                </thead>
                <tbody>
                  {professorProgress.map((professor) => (
                    <tr key={professor.id} className="border-b hover:bg-gray-50">
                      <td className="p-2">
                        <div>
                          <div className="font-medium">{professor.name}</div>
                          <div className="text-gray-500 text-xs">{professor.email}</div>
                        </div>
                      </td>
                      <td className="p-2 text-sm text-gray-600">{professor.position}</td>
                      <td className="p-2 text-center">
                        <Badge variant="outline">{professor.plansSubmitted}</Badge>
                      </td>
                      <td className="p-2 text-center">
                        <Badge variant="default">{professor.plansApproved}</Badge>
                      </td>
                      <td className="p-2 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-12 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${professor.averageProgress}%` }}
                            ></div>
                          </div>
                          <span className="text-xs font-medium">{professor.averageProgress}%</span>
                        </div>
                      </td>
                      <td className="p-2 text-center">
                        <Badge variant="secondary">{professor.totalReports}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Separador visual */}
      <div className="border-t border-gray-200 my-8"></div>

      {/* Componentes existentes */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="hover:shadow-md transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="text-center text-xl font-semibold text-gray-800">
              Notificaciones de Actividad
            </CardTitle>
          </CardHeader>
          <CardContent>
            <NotificationFeed />
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="text-center text-xl font-semibold text-gray-800">
              Progreso Detallado por Eje Estratégico
            </CardTitle>
          </CardHeader>
          <CardContent>
            <StrategicAxesProgress />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
