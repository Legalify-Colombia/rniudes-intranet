
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Target, CheckCircle2 } from "lucide-react";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { useAuth } from "@/hooks/useAuth";

export function StrategicAxesProgress() {
  const [strategicAxes, setStrategicAxes] = useState<any[]>([]);
  const [managerReports, setManagerReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const { 
    fetchStrategicAxes, 
    fetchManagerReportsByManager
  } = useSupabaseData();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const [axesResult, reportsResult] = await Promise.all([
        fetchStrategicAxes(),
        fetchManagerReportsByManager(user.id)
      ]);

      if (axesResult.data) setStrategicAxes(axesResult.data);
      if (reportsResult.data) setManagerReports(reportsResult.data);
      
      console.log('Strategic axes loaded:', axesResult.data);
      console.log('Manager reports loaded:', reportsResult.data);
    } catch (error) {
      console.error('Error loading strategic data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAxisProgress = (axisId: string) => {
    // Calcular progreso real basado en los reportes del gestor
    const relevantReports = managerReports.filter(report => 
      report.status === 'submitted' || report.status === 'approved'
    );
    
    if (relevantReports.length === 0) return 0;
    
    // Usar el progreso promedio de los reportes más recientes
    const latestReport = relevantReports[0]; // Ya vienen ordenados por fecha
    return latestReport?.total_progress_percentage || 0;
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "bg-green-500";
    if (progress >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getStatusBadge = (progress: number) => {
    if (progress >= 80) {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          En Objetivo
        </Badge>
      );
    }
    if (progress >= 50) {
      return (
        <Badge variant="default" className="bg-yellow-100 text-yellow-800">
          <TrendingUp className="w-3 h-3 mr-1" />
          En Progreso
        </Badge>
      );
    }
    return (
      <Badge variant="destructive">
        <Target className="w-3 h-3 mr-1" />
        Requiere Atención
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Progreso por Ejes Estratégicos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalAxes = strategicAxes.length;
  const totalReports = managerReports.length;
  const submittedReports = managerReports.filter(r => r.status === 'submitted' || r.status === 'approved').length;
  const overallProgress = managerReports.length > 0 
    ? managerReports.reduce((acc, report) => acc + (report.total_progress_percentage || 0), 0) / managerReports.length 
    : 0;

  return (
    <div className="space-y-6">
      {/* Resumen General */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ejes Estratégicos</p>
                <p className="text-2xl font-bold text-primary">{totalAxes}</p>
              </div>
              <Target className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Informes Totales</p>
                <p className="text-2xl font-bold text-blue-600">{totalReports}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Informes Enviados</p>
                <p className="text-2xl font-bold text-green-600">{submittedReports}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Progreso General</p>
                <p className="text-2xl font-bold text-purple-600">{Math.round(overallProgress)}%</p>
              </div>
              <div className="h-8 w-8">
                <Progress value={overallProgress} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progreso por Eje Estratégico */}
      <Card>
        <CardHeader>
          <CardTitle>Progreso Detallado por Eje Estratégico</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {strategicAxes.map((axis) => {
              const progress = calculateAxisProgress(axis.id);

              return (
                <div key={axis.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{axis.code} - {axis.name}</h3>
                      <p className="text-sm text-gray-600">
                        Progreso basado en informes de gestión
                      </p>
                    </div>
                    {getStatusBadge(progress)}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progreso</span>
                      <span className="font-medium">{Math.round(progress)}%</span>
                    </div>
                    <Progress 
                      value={progress} 
                      className="h-3"
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {strategicAxes.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No hay ejes estratégicos configurados. 
              Ve a Configuración Estratégica para crear el primer eje.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
