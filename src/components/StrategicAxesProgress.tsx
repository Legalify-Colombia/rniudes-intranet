
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { TrendingUp, Filter } from "lucide-react";

interface StrategicAxisProgress {
  id: string;
  name: string;
  code: string;
  progress_percentage: number;
  total_reports: number;
  completed_reports: number;
}

export function StrategicAxesProgress() {
  const [strategicAxes, setStrategicAxes] = useState<StrategicAxisProgress[]>([]);
  const [campuses, setCampuses] = useState<any[]>([]);
  const [faculties, setFaculties] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [selectedCampus, setSelectedCampus] = useState<string>('all');
  const [selectedFaculty, setSelectedFaculty] = useState<string>('all');
  const [selectedProgram, setSelectedProgram] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  const { 
    fetchStrategicAxes, 
    fetchCampus, 
    fetchFaculties, 
    fetchAcademicPrograms,
    fetchManagerReports,
    fetchWorkPlans,
    fetchActions,
    fetchProducts,
    fetchProductProgressReports
  } = useSupabaseData();

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedCampus !== 'all') {
      loadFacultiesByCampus(selectedCampus);
    } else {
      setFaculties([]);
      setSelectedFaculty('all');
    }
    setSelectedProgram('all');
  }, [selectedCampus]);

  useEffect(() => {
    if (selectedFaculty !== 'all') {
      loadProgramsByFaculty(selectedFaculty);
    } else if (selectedCampus !== 'all') {
      loadProgramsByCampus(selectedCampus);
    } else {
      setPrograms([]);
    }
    setSelectedProgram('all');
  }, [selectedFaculty]);

  useEffect(() => {
    calculateProgress();
  }, [selectedCampus, selectedFaculty, selectedProgram]);

  const loadInitialData = async () => {
    try {
      const [campusResult] = await Promise.all([
        fetchCampus()
      ]);

      setCampuses(campusResult.data || []);
      calculateProgress();
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFacultiesByCampus = async (campusId: string) => {
    try {
      const facultiesResult = await fetchFaculties();
      const filtered = (facultiesResult.data || []).filter(f => f.campus_id === campusId);
      setFaculties(filtered);
    } catch (error) {
      console.error('Error loading faculties:', error);
    }
  };

  const loadProgramsByFaculty = async (facultyId: string) => {
    try {
      const programsResult = await fetchAcademicPrograms();
      const filtered = (programsResult.data || []).filter(p => p.faculty_id === facultyId);
      setPrograms(filtered);
    } catch (error) {
      console.error('Error loading programs by faculty:', error);
    }
  };

  const loadProgramsByCampus = async (campusId: string) => {
    try {
      const programsResult = await fetchAcademicPrograms();
      const filtered = (programsResult.data || []).filter(p => p.campus_id === campusId);
      setPrograms(filtered);
    } catch (error) {
      console.error('Error loading programs by campus:', error);
    }
  };

  const calculateProgress = async () => {
    try {
      const [
        strategicAxesResult,
        reportsResult,
        workPlansResult,
        actionsResult,
        productsResult,
        progressReportsResult,
        programsResult
      ] = await Promise.all([
        fetchStrategicAxes(),
        fetchManagerReports(),
        fetchWorkPlans(),
        fetchActions(),
        fetchProducts(),
        fetchProductProgressReports(),
        fetchAcademicPrograms()
      ]);

      const allStrategicAxes = strategicAxesResult.data || [];
      const allReports = reportsResult.data || [];
      const allWorkPlans = workPlansResult.data || [];
      const allActions = actionsResult.data || [];
      const allProducts = productsResult.data || [];
      const allProgressReports = progressReportsResult.data || [];
      const allPrograms = programsResult.data || [];

      // Filtrar planes de trabajo según criterios seleccionados
      let filteredWorkPlans = allWorkPlans;
      
      if (selectedProgram !== 'all') {
        filteredWorkPlans = filteredWorkPlans.filter(wp => wp.program_id === selectedProgram);
      } else if (selectedFaculty !== 'all') {
        const facultyPrograms = allPrograms.filter(p => p.faculty_id === selectedFaculty);
        const programIds = facultyPrograms.map(p => p.id);
        filteredWorkPlans = filteredWorkPlans.filter(wp => programIds.includes(wp.program_id));
      } else if (selectedCampus !== 'all') {
        const campusPrograms = allPrograms.filter(p => p.campus_id === selectedCampus);
        const programIds = campusPrograms.map(p => p.id);
        filteredWorkPlans = filteredWorkPlans.filter(wp => programIds.includes(wp.program_id));
      }

      // Filtrar informes según planes de trabajo filtrados
      const filteredWorkPlanIds = filteredWorkPlans.map(wp => wp.id);
      const filteredReports = allReports.filter(r => filteredWorkPlanIds.includes(r.work_plan_id));

      // Calcular progreso por eje estratégico
      const progressByAxis = allStrategicAxes.map(axis => {
        const axisActions = allActions.filter(a => a.strategic_axis_id === axis.id);
        const axisProducts = allProducts.filter(p => 
          axisActions.some(a => a.id === p.action_id)
        );

        const axisProgressReports = allProgressReports.filter(pr => 
          axisProducts.some(p => p.id === pr.product_id) &&
          filteredReports.some(r => r.id === pr.manager_report_id)
        );

        const totalReports = axisProgressReports.length;
        const avgProgress = totalReports > 0 
          ? axisProgressReports.reduce((sum, pr) => sum + pr.progress_percentage, 0) / totalReports
          : 0;

        const completedReports = axisProgressReports.filter(pr => pr.progress_percentage >= 70).length;

        return {
          id: axis.id,
          name: axis.name,
          code: axis.code,
          progress_percentage: Math.round(avgProgress),
          total_reports: totalReports,
          completed_reports: completedReports
        };
      });

      setStrategicAxes(progressByAxis);
    } catch (error) {
      console.error('Error calculating progress:', error);
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Progreso Ejes Estratégicos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500">Cargando progreso...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Progreso Ejes Estratégicos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filtros */}
        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
          <Filter className="h-4 w-4 text-gray-500" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 flex-1">
            <Select value={selectedCampus} onValueChange={setSelectedCampus}>
              <SelectTrigger>
                <SelectValue placeholder="Todos los campus" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los campus</SelectItem>
                {campuses.map((campus) => (
                  <SelectItem key={campus.id} value={campus.id}>
                    {campus.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedFaculty} onValueChange={setSelectedFaculty} disabled={selectedCampus === 'all'}>
              <SelectTrigger>
                <SelectValue placeholder="Todas las facultades" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las facultades</SelectItem>
                {faculties.map((faculty) => (
                  <SelectItem key={faculty.id} value={faculty.id}>
                    {faculty.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedProgram} onValueChange={setSelectedProgram} disabled={selectedCampus === 'all' && selectedFaculty === 'all'}>
              <SelectTrigger>
                <SelectValue placeholder="Todos los programas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los programas</SelectItem>
                {programs.map((program) => (
                  <SelectItem key={program.id} value={program.id}>
                    {program.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Barras de progreso */}
        <div className="space-y-4">
          {strategicAxes.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No hay datos de progreso disponibles para los filtros seleccionados
            </div>
          ) : (
            strategicAxes.map((axis) => (
              <div key={axis.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium text-sm">{axis.code}</span>
                    <p className="text-xs text-gray-600">{axis.name}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold">{axis.progress_percentage}%</span>
                    <p className="text-xs text-gray-500">
                      {axis.completed_reports}/{axis.total_reports} completados
                    </p>
                  </div>
                </div>
                <Progress 
                  value={axis.progress_percentage} 
                  className={`h-3 ${getProgressColor(axis.progress_percentage)}`}
                />
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
