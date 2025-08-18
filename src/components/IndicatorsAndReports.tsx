import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { useCampus } from "@/hooks/useCampus";
import { useFaculties } from "@/hooks/useFaculties";
import { useAcademicPrograms } from "@/hooks/useAcademicPrograms";
import { useAuth } from "@/hooks/useAuth";
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  FileText, 
  Download,
  Filter 
} from "lucide-react";

export function IndicatorsAndReports() {
  const { profile } = useAuth();
  const { toast } = useToast();
  
  const { fetchWorkPlans, fetchManagerReports } = useSupabaseData();
  const { fetchCampus } = useCampus();
  const { fetchFaculties } = useFaculties();
  const { fetchAcademicPrograms } = useAcademicPrograms();
  
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    campus_id: "",
    faculty_id: "",
    program_id: "",
    period: "current_month"
  });
  
  const [data, setData] = useState({
    campusList: [],
    facultiesList: [],
    programsList: [],
    workPlans: [],
    reports: [],
    indicators: {
      totalPlans: 0,
      approvedPlans: 0,
      pendingPlans: 0,
      completedReports: 0,
      averageProgress: 0
    }
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (data.campusList.length > 0) {
      generateIndicators();
    }
  }, [filters, data.workPlans, data.reports]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [campusResult, facultiesResult, programsResult, plansResult, reportsResult] = await Promise.all([
        fetchCampus(),
        fetchFaculties(),
        fetchAcademicPrograms(),
        fetchWorkPlans(),
        fetchManagerReports()
      ]);

      setData(prev => ({
        ...prev,
        campusList: campusResult.data || [],
        facultiesList: facultiesResult.data || [],
        programsList: programsResult.data || [],
        workPlans: plansResult.data || [],
        reports: reportsResult.data || []
      }));
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Error al cargar los datos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateIndicators = () => {
    let filteredPlans = data.workPlans;
    let filteredReports = data.reports;

    // Aplicar filtros
    if (filters.campus_id && filters.campus_id !== "all") {
      filteredPlans = filteredPlans.filter(plan => {
        const program = data.programsList.find(p => p.manager_id === plan.manager_id);
        return program?.campus_id === filters.campus_id;
      });
    }

    if (filters.faculty_id && filters.faculty_id !== "all") {
      filteredPlans = filteredPlans.filter(plan => {
        const program = data.programsList.find(p => p.manager_id === plan.manager_id);
        return program?.faculty_id === filters.faculty_id;
      });
    }

    if (filters.program_id && filters.program_id !== "all") {
      filteredPlans = filteredPlans.filter(plan => {
        const program = data.programsList.find(p => p.manager_id === plan.manager_id);
        return program?.id === filters.program_id;
      });
    }

    // Calcular indicadores
    const totalPlans = filteredPlans.length;
    const approvedPlans = filteredPlans.filter(plan => plan.status === 'approved').length;
    const pendingPlans = filteredPlans.filter(plan => plan.status === 'submitted').length;
    const completedReports = filteredReports.filter(report => report.status === 'submitted').length;
    
    const totalProgress = filteredReports.reduce((sum, report) => 
      sum + (parseFloat(report.total_progress_percentage) || 0), 0
    );
    const averageProgress = filteredReports.length > 0 ? 
      Math.round(totalProgress / filteredReports.length) : 0;

    setData(prev => ({
      ...prev,
      indicators: {
        totalPlans,
        approvedPlans,
        pendingPlans,
        completedReports,
        averageProgress
      }
    }));
  };

  const getFilteredPrograms = () => {
    if (!filters.faculty_id || filters.faculty_id === "all") return data.programsList;
    return data.programsList.filter(program => program.faculty_id === filters.faculty_id);
  };

  const exportReport = () => {
    const reportData = {
      filters,
      indicators: data.indicators,
      generatedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `indicadores_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Éxito",
      description: "Reporte exportado correctamente",
    });
  };

  if (profile?.role !== 'Coordinador' && profile?.role !== 'Administrador') {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No tienes permisos para acceder a esta sección.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros de Indicadores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Campus</label>
              <Select
                value={filters.campus_id || "all"}
                onValueChange={(value) => setFilters({ ...filters, campus_id: value === "all" ? "" : value, faculty_id: "", program_id: "" })}
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
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Facultad</label>
              <Select
                value={filters.faculty_id || "all"}
                onValueChange={(value) => setFilters({ ...filters, faculty_id: value === "all" ? "" : value, program_id: "" })}
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
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Programa</label>
              <Select
                value={filters.program_id || "all"}
                onValueChange={(value) => setFilters({ ...filters, program_id: value === "all" ? "" : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos los programas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los programas</SelectItem>
                  {getFilteredPrograms().map((program) => (
                    <SelectItem key={program.id} value={program.id}>
                      {program.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button onClick={exportReport} className="w-full flex items-center gap-2">
                <Download className="h-4 w-4" />
                Exportar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Indicadores Principales */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Planes</p>
                <p className="text-2xl font-bold">{data.indicators.totalPlans}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Planes Aprobados</p>
                <p className="text-2xl font-bold text-green-600">{data.indicators.approvedPlans}</p>
              </div>
              <PieChart className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Planes Pendientes</p>
                <p className="text-2xl font-bold text-yellow-600">{data.indicators.pendingPlans}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Informes Completados</p>
                <p className="text-2xl font-bold text-purple-600">{data.indicators.completedReports}</p>
              </div>
              <FileText className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Progreso Promedio</p>
                <p className="text-2xl font-bold text-indigo-600">{data.indicators.averageProgress}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-indigo-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Visualizaciones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Estado de Planes por Campus</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p>Gráfico de barras - En desarrollo</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Progreso por Facultad</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <PieChart className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p>Gráfico circular - En desarrollo</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla Detallada */}
      <Card>
        <CardHeader>
          <CardTitle>Resumen Detallado por Programa</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Programa</th>
                  <th className="text-left p-2">Campus</th>
                  <th className="text-left p-2">Facultad</th>
                  <th className="text-left p-2">Planes Totales</th>
                  <th className="text-left p-2">Aprobados</th>
                  <th className="text-left p-2">Progreso</th>
                </tr>
              </thead>
              <tbody>
                {getFilteredPrograms().map((program) => {
                  const programPlans = data.workPlans.filter(plan => {
                    const prog = data.programsList.find(p => p.manager_id === plan.manager_id);
                    return prog?.id === program.id;
                  });
                  
                  const approvedCount = programPlans.filter(plan => plan.status === 'approved').length;
                  const programReports = data.reports.filter(report => {
                    const prog = data.programsList.find(p => p.manager_id === report.manager_id);
                    return prog?.id === program.id;
                  });
                  
                  const avgProgress = programReports.length > 0 ? 
                    Math.round(programReports.reduce((sum, report) => 
                      sum + (parseFloat(report.total_progress_percentage) || 0), 0
                    ) / programReports.length) : 0;

                  return (
                    <tr key={program.id} className="border-b hover:bg-gray-50">
                      <td className="p-2 font-medium">{program.name}</td>
                      <td className="p-2">{data.campusList.find(c => c.id === program.campus_id)?.name || 'N/A'}</td>
                      <td className="p-2">{data.facultiesList.find(f => f.id === program.faculty_id)?.name || 'N/A'}</td>
                      <td className="p-2">{programPlans.length}</td>
                      <td className="p-2 text-green-600">{approvedCount}</td>
                      <td className="p-2">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-gray-200 rounded-full">
                            <div 
                              className="h-2 bg-blue-500 rounded-full" 
                              style={{ width: `${avgProgress}%` }}
                            ></div>
                          </div>
                          <span className="text-sm">{avgProgress}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}