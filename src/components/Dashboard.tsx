
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Users, Building, GraduationCap, FileText, Clock, CheckCircle } from "lucide-react";

export function Dashboard() {
  // Mock data for demonstration
  const stats = {
    totalUsers: 12,
    totalCampuses: 4,
    totalPrograms: 15,
    totalManagers: 8,
    pendingApprovals: 3,
    approvedPlans: 5
  };

  const recentActivities = [
    {
      id: 1,
      type: "user_created",
      message: "Nuevo usuario creado: Dr. María González",
      time: "Hace 2 horas",
      status: "success"
    },
    {
      id: 2,
      type: "plan_submitted",
      message: "Plan de trabajo enviado para aprobación - Ingeniería de Sistemas",
      time: "Hace 4 horas",
      status: "pending"
    },
    {
      id: 3,
      type: "plan_approved",
      message: "Plan de trabajo aprobado - Administración de Empresas",
      time: "Hace 6 horas",
      status: "approved"
    },
    {
      id: 4,
      type: "campus_created",
      message: "Nuevo campus registrado: Sede Valledupar",
      time: "Ayer",
      status: "success"
    }
  ];

  const campusProgress = [
    { name: "Bucaramanga", programs: 8, completion: 85 },
    { name: "Bogotá", programs: 4, completion: 70 },
    { name: "Valledupar", programs: 2, completion: 50 },
    { name: "Cúcuta", programs: 1, completion: 25 }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Dashboard DRNI</h1>
          <p className="text-gray-600">Oficina de Relaciones Internacionales</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Último acceso</p>
          <p className="font-medium">{new Date().toLocaleDateString()}</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="institutional-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              +2 desde el mes pasado
            </p>
          </CardContent>
        </Card>

        <Card className="institutional-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Campus Activos</CardTitle>
            <Building className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.totalCampuses}</div>
            <p className="text-xs text-muted-foreground">
              Bucaramanga, Bogotá, Valledupar, Cúcuta
            </p>
          </CardContent>
        </Card>

        <Card className="institutional-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Programas Académicos</CardTitle>
            <GraduationCap className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.totalPrograms}</div>
            <p className="text-xs text-muted-foreground">
              Distribuidos en todas las sedes
            </p>
          </CardContent>
        </Card>

        <Card className="institutional-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gestores Activos</CardTitle>
            <Users className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.totalManagers}</div>
            <p className="text-xs text-muted-foreground">
              Con planes de trabajo asignados
            </p>
          </CardContent>
        </Card>

        <Card className="institutional-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Planes Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pendingApprovals}</div>
            <p className="text-xs text-muted-foreground">
              Esperando aprobación
            </p>
          </CardContent>
        </Card>

        <Card className="institutional-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Planes Aprobados</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approvedPlans}</div>
            <p className="text-xs text-muted-foreground">
              Este semestre académico
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <Card className="institutional-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Actividades Recientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    activity.status === 'success' ? 'bg-green-500' :
                    activity.status === 'pending' ? 'bg-yellow-500' :
                    activity.status === 'approved' ? 'bg-blue-500' :
                    'bg-gray-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.message}
                    </p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                  <Badge variant={
                    activity.status === 'success' ? 'default' :
                    activity.status === 'pending' ? 'secondary' :
                    activity.status === 'approved' ? 'default' :
                    'outline'
                  }>
                    {activity.status === 'success' ? 'Completado' :
                     activity.status === 'pending' ? 'Pendiente' :
                     activity.status === 'approved' ? 'Aprobado' :
                     'En proceso'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Campus Progress */}
        <Card className="institutional-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Progreso por Campus
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {campusProgress.map((campus) => (
                <div key={campus.name} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{campus.name}</span>
                    <div className="text-xs text-gray-500">
                      {campus.programs} programas
                    </div>
                  </div>
                  <Progress value={campus.completion} className="w-full" />
                  <div className="text-xs text-gray-500 text-right">
                    {campus.completion}% completado
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="institutional-card">
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-sm font-medium">Crear Usuario</p>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Building className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-sm font-medium">Nuevo Campus</p>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <GraduationCap className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="text-sm font-medium">Nuevo Programa</p>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <FileText className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <p className="text-sm font-medium">Ver Reportes</p>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
