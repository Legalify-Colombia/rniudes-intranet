import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useCampus } from "@/hooks/useCampus";
import { useFaculties } from "@/hooks/useFaculties";
import { useAcademicPrograms } from "@/hooks/useAcademicPrograms";
import { useCustomPlans } from "@/hooks/useCustomPlans";
import { useReports } from "@/hooks/useReports";
import { useIndicators } from "@/hooks/useIndicators";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from "recharts";
import { 
  TrendingUp, 
  BarChart3, 
  PieChartIcon, 
  LineChart as LineChartIcon,
  Download,
  Filter,
  RefreshCw,
  Target,
  Users,
  BookOpen,
  FileText,
  Calendar,
  Activity
} from "lucide-react";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

interface StatisticsData {
  campusList: any[];
  facultiesList: any[];
  programsList: any[];
  customPlans: any[];
  reports: any[];
  indicators: any[];
  indicatorReports: any[];
}

interface Filters {
  campus_id: string;
  faculty_id: string;
  program_id: string;
  date_range: string;
  status: string;
}

export function StatisticsModule() {
  const { profile } = useAuth();
  const { toast } = useToast();
  
  const { fetchCampus } = useCampus();
  const { fetchFaculties } = useFaculties();
  const { fetchAcademicPrograms } = useAcademicPrograms();
  const { fetchCustomPlans } = useCustomPlans();
  const { fetchManagerReports } = useReports();
  const { fetchIndicators } = useIndicators();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    campus_id: "",
    faculty_id: "",
    program_id: "",
    date_range: "all",
    status: "all"
  });

  const [data, setData] = useState<StatisticsData>({
    campusList: [],
    facultiesList: [],
    programsList: [],
    customPlans: [],
    reports: [],
    indicators: [],
    indicatorReports: []
  });

  const [processedData, setProcessedData] = useState({
    campusStats: [],
    facultyStats: [],
    programStats: [],
    timeSeriesData: [],
    statusDistribution: [],
    progressMetrics: {},
    kpiCards: []
  });

  useEffect(() => {
    loadAllData();
  }, []);

  useEffect(() => {
    if (data.campusList.length > 0) {
      processStatistics();
    }
  }, [data, filters]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [
        campusResult,
        facultiesResult,
        programsResult,
        plansResult,
        reportsResult,
        indicatorsResult
      ] = await Promise.all([
        fetchCampus(),
        fetchFaculties(),
        fetchAcademicPrograms(),
        fetchCustomPlans(),
        fetchManagerReports(),
        fetchIndicators()
      ]);

      setData({
        campusList: campusResult.data || [],
        facultiesList: facultiesResult.data || [],
        programsList: programsResult.data || [],
        customPlans: plansResult.data || [],
        reports: reportsResult.data || [],
        indicators: indicatorsResult.data || [],
        indicatorReports: []
      });
    } catch (error) {
      console.error('Error loading statistics data:', error);
      toast({
        title: "Error",
        description: "Error al cargar los datos estadísticos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await loadAllData();
    setRefreshing(false);
    toast({
      title: "Datos actualizados",
      description: "Las estadísticas han sido actualizadas correctamente",
    });
  };

  const processStatistics = () => {
    let filteredPlans = data.customPlans;
    let filteredReports = data.reports;

    // Aplicar filtros
    if (filters.campus_id && filters.campus_id !== "all") {
      filteredPlans = filteredPlans.filter(plan => {
        const manager = plan.profiles;
        return manager?.campus_id === filters.campus_id;
      });
    }

    if (filters.faculty_id && filters.faculty_id !== "all") {
      filteredPlans = filteredPlans.filter(plan => {
        const program = data.programsList.find(p => p.manager_id === plan.manager_id);
        return program?.faculty_id === filters.faculty_id;
      });
    }

    if (filters.status && filters.status !== "all") {
      filteredPlans = filteredPlans.filter(plan => plan.status === filters.status);
    }

    // Estadísticas por campus
    const campusStats = data.campusList.map(campus => {
      const campusPlans = filteredPlans.filter(plan => 
        plan.profiles?.campus_id === campus.id
      );
      const campusReports = filteredReports.filter(report => 
        report.manager?.campus_id === campus.id
      );

      return {
        name: campus.name,
        totalPlans: campusPlans.length,
        approvedPlans: campusPlans.filter(p => p.status === 'approved').length,
        submittedPlans: campusPlans.filter(p => p.status === 'submitted').length,
        draftPlans: campusPlans.filter(p => p.status === 'draft').length,
        totalReports: campusReports.length,
        avgProgress: campusReports.length > 0 ? 
          campusReports.reduce((sum, r) => sum + (parseFloat(r.total_progress_percentage) || 0), 0) / campusReports.length : 0
      };
    });

    // Estadísticas por facultad
    const facultyStats = data.facultiesList.map(faculty => {
      const facultyPrograms = data.programsList.filter(p => p.faculty_id === faculty.id);
      const facultyPlans = filteredPlans.filter(plan => {
        const program = data.programsList.find(p => p.manager_id === plan.manager_id);
        return program?.faculty_id === faculty.id;
      });

      return {
        name: faculty.name,
        totalPrograms: facultyPrograms.length,
        totalPlans: facultyPlans.length,
        approvedPlans: facultyPlans.filter(p => p.status === 'approved').length,
        pendingPlans: facultyPlans.filter(p => p.status === 'submitted').length
      };
    });

    // Distribución de estados
    const statusDistribution = [
      { name: 'Borradores', value: filteredPlans.filter(p => p.status === 'draft').length, color: '#FFBB28' },
      { name: 'Enviados', value: filteredPlans.filter(p => p.status === 'submitted').length, color: '#FF8042' },
      { name: 'Aprobados', value: filteredPlans.filter(p => p.status === 'approved').length, color: '#00C49F' },
      { name: 'Rechazados', value: filteredPlans.filter(p => p.status === 'rejected').length, color: '#0088FE' }
    ];

    // Métricas de progreso
    const progressMetrics = {
      totalPlans: filteredPlans.length,
      totalReports: filteredReports.length,
      avgProgress: filteredReports.length > 0 ? 
        Math.round(filteredReports.reduce((sum, r) => sum + (parseFloat(r.total_progress_percentage) || 0), 0) / filteredReports.length) : 0,
      completionRate: filteredPlans.length > 0 ? 
        Math.round((filteredPlans.filter(p => p.status === 'approved').length / filteredPlans.length) * 100) : 0
    };

    // KPI Cards
    const kpiCards = [
      {
        title: "Total de Planes",
        value: progressMetrics.totalPlans,
        icon: Target,
        color: "text-blue-500",
        trend: "+12%"
      },
      {
        title: "Planes Aprobados",
        value: filteredPlans.filter(p => p.status === 'approved').length,
        icon: BookOpen,
        color: "text-green-500",
        trend: "+8%"
      },
      {
        title: "Informes Generados",
        value: progressMetrics.totalReports,
        icon: FileText,
        color: "text-purple-500",
        trend: "+15%"
      },
      {
        title: "Progreso Promedio",
        value: `${progressMetrics.avgProgress}%`,
        icon: TrendingUp,
        color: "text-orange-500",
        trend: "+5%"
      },
      {
        title: "Campus Activos",
        value: data.campusList.length,
        icon: Users,
        color: "text-indigo-500",
        trend: "0%"
      },
      {
        title: "Tasa de Completitud",
        value: `${progressMetrics.completionRate}%`,
        icon: Activity,
        color: "text-emerald-500",
        trend: "+3%"
      }
    ];

    // Series de tiempo (mockup para demostración)
    const timeSeriesData = [
      { month: 'Ene', plans: 12, reports: 8, progress: 65 },
      { month: 'Feb', plans: 19, reports: 15, progress: 70 },
      { month: 'Mar', plans: 25, reports: 22, progress: 75 },
      { month: 'Abr', plans: 30, reports: 28, progress: 78 },
      { month: 'May', plans: 35, reports: 32, progress: 82 },
      { month: 'Jun', plans: 42, reports: 38, progress: 85 }
    ];

    setProcessedData({
      campusStats,
      facultyStats,
      programStats: [],
      timeSeriesData,
      statusDistribution,
      progressMetrics,
      kpiCards
    });
  };

  const exportData = () => {
    const exportData = {
      filters,
      statistics: processedData,
      generatedAt: new Date().toISOString(),
      totalRecords: {
        plans: data.customPlans.length,
        reports: data.reports.length,
        indicators: data.indicators.length
      }
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `estadisticas_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Datos exportados",
      description: "El archivo de estadísticas ha sido descargado correctamente",
    });
  };

  if (profile?.role !== 'Coordinador' && profile?.role !== 'Administrador') {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Target className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Acceso Restringido</h3>
          <p className="text-gray-500">No tienes permisos para acceder al módulo de estadísticas.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Cargando Estadísticas</h3>
          <p className="text-gray-500">Procesando datos de planes, informes e indicadores...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con controles */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Módulo de Estadísticas</h1>
          <p className="text-gray-500 mt-1">Análisis integral de planes, informes e indicadores</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={refreshData} 
            disabled={refreshing}
            variant="outline" 
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          <Button onClick={exportData} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros de Análisis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Select
              value={filters.campus_id || "all"}
              onValueChange={(value) => setFilters(prev => ({ 
                ...prev, 
                campus_id: value === "all" ? "" : value,
                faculty_id: "",
                program_id: ""
              }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos los campus" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los campus</SelectItem>
                {data.campusList.map((campus) => (
                  <SelectItem key={campus.id} value={campus.id}>
                    {campus.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.faculty_id || "all"}
              onValueChange={(value) => setFilters(prev => ({ 
                ...prev, 
                faculty_id: value === "all" ? "" : value,
                program_id: ""
              }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todas las facultades" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las facultades</SelectItem>
                {data.facultiesList.map((faculty) => (
                  <SelectItem key={faculty.id} value={faculty.id}>
                    {faculty.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.program_id || "all"}
              onValueChange={(value) => setFilters(prev => ({ 
                ...prev, 
                program_id: value === "all" ? "" : value
              }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos los programas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los programas</SelectItem>
                {data.programsList
                  .filter(program => !filters.faculty_id || filters.faculty_id === "all" || program.faculty_id === filters.faculty_id)
                  .map((program) => (
                    <SelectItem key={program.id} value={program.id}>
                      {program.name}
                    </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.status || "all"}
              onValueChange={(value) => setFilters(prev => ({ 
                ...prev, 
                status: value === "all" ? "" : value
              }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos los estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="draft">Borrador</SelectItem>
                <SelectItem value="submitted">Enviado</SelectItem>
                <SelectItem value="approved">Aprobado</SelectItem>
                <SelectItem value="rejected">Rechazado</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.date_range || "all"}
              onValueChange={(value) => setFilters(prev => ({ 
                ...prev, 
                date_range: value
              }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todo el tiempo</SelectItem>
                <SelectItem value="current_month">Mes actual</SelectItem>
                <SelectItem value="last_3_months">Últimos 3 meses</SelectItem>
                <SelectItem value="current_year">Año actual</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {processedData.kpiCards.map((kpi, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{kpi.title}</p>
                  <p className="text-2xl font-bold mt-1">{kpi.value}</p>
                  <Badge variant="secondary" className="mt-2 text-xs">
                    {kpi.trend}
                  </Badge>
                </div>
                <kpi.icon className={`h-8 w-8 ${kpi.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs para diferentes vistas */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="campus">Por Campus</TabsTrigger>
          <TabsTrigger value="faculty">Por Facultad</TabsTrigger>
          <TabsTrigger value="trends">Tendencias</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Distribución de Estados */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5" />
                  Distribución de Estados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={processedData.statusDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {processedData.statusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Evolución Temporal */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChartIcon className="h-5 w-5" />
                  Evolución Temporal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={processedData.timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="plans" stroke="#8884d8" name="Planes" />
                    <Line type="monotone" dataKey="reports" stroke="#82ca9d" name="Informes" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="campus" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Estadísticas por Campus
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={processedData.campusStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="totalPlans" fill="#8884d8" name="Total Planes" />
                  <Bar dataKey="approvedPlans" fill="#82ca9d" name="Aprobados" />
                  <Bar dataKey="submittedPlans" fill="#ffc658" name="Enviados" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="faculty" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Estadísticas por Facultad
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={processedData.facultyStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="totalPlans" fill="#8884d8" name="Total Planes" />
                  <Bar dataKey="approvedPlans" fill="#82ca9d" name="Aprobados" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Análisis de Tendencias
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={processedData.timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="progress" stackId="1" stroke="#8884d8" fill="#8884d8" name="Progreso %" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Tabla detallada */}
      <Card>
        <CardHeader>
          <CardTitle>Resumen Detallado</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-semibold">Campus</th>
                  <th className="text-left p-3 font-semibold">Total Planes</th>
                  <th className="text-left p-3 font-semibold">Aprobados</th>
                  <th className="text-left p-3 font-semibold">Enviados</th>
                  <th className="text-left p-3 font-semibold">Borradores</th>
                  <th className="text-left p-3 font-semibold">Progreso Promedio</th>
                </tr>
              </thead>
              <tbody>
                {processedData.campusStats.map((campus, index) => (
                  <tr key={index} className="border-b hover:bg-muted/50">
                    <td className="p-3 font-medium">{campus.name}</td>
                    <td className="p-3">{campus.totalPlans}</td>
                    <td className="p-3">
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        {campus.approvedPlans}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                        {campus.submittedPlans}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                        {campus.draftPlans}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-muted rounded-full">
                          <div 
                            className="h-2 bg-primary rounded-full transition-all" 
                            style={{ width: `${Math.min(campus.avgProgress, 100)}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">
                          {Math.round(campus.avgProgress)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}