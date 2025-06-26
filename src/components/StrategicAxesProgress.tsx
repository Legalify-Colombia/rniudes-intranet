
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { useAuth } from "@/hooks/useAuth";
import { Target } from "lucide-react";

interface AxisProgress {
  id: string;
  code: string;
  name: string;
  averageProgress: number;
  totalReports: number;
  managerCount: number;
}

export function StrategicAxesProgress() {
  const { profile } = useAuth();
  const { 
    fetchStrategicAxes, 
    fetchManagerReports, 
    fetchManagers,
    fetchCampus,
    fetchProductProgressReports
  } = useSupabaseData();
  
  const [axesProgress, setAxesProgress] = useState<AxisProgress[]>([]);
  const [selectedCampus, setSelectedCampus] = useState<string>("all");
  const [campusList, setCampusList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAxesProgress();
  }, [selectedCampus, profile]);

  const loadAxesProgress = async () => {
    try {
      setLoading(true);
      
      const [
        axesResult,
        reportsResult,
        managersResult,
        campusResult
      ] = await Promise.all([
        fetchStrategicAxes(),
        fetchManagerReports(),
        fetchManagers(),
        fetchCampus()
      ]);

      const axes = axesResult.data || [];
      const reports = reportsResult.data || [];
      const managers = managersResult.data || [];
      const campuses = campusResult.data || [];

      setCampusList(campuses);

      // Filter managers by campus and role
      let filteredManagers = managers;
      let filteredReports = reports;

      if (selectedCampus !== "all") {
        filteredManagers = managers.filter(manager => manager.campus_id === selectedCampus);
        filteredReports = reports.filter(report => {
          const manager = managers.find(m => m.id === report.manager_id);
          return manager?.campus_id === selectedCampus;
        });
      }

      if (profile?.role === 'Coordinador' && profile.campus_id) {
        filteredManagers = filteredManagers.filter(manager => manager.campus_id === profile.campus_id);
        filteredReports = filteredReports.filter(report => {
          const manager = managers.find(m => m.id === report.manager_id);
          return manager?.campus_id === profile.campus_id;
        });
      }

      if (profile?.role === 'Gestor') {
        filteredReports = filteredReports.filter(report => report.manager_id === profile.id);
      }

      // Calculate progress for each strategic axis
      const axesProgressData: AxisProgress[] = [];

      for (const axis of axes) {
        // Get all product progress reports related to this axis
        const axisReports: any[] = [];
        
        for (const report of filteredReports) {
          try {
            const progressResult = await fetchProductProgressReports(report.id);
            if (progressResult.data) {
              // Filter progress reports that belong to this strategic axis
              const axisProgressReports = progressResult.data.filter(progress => {
                const action = progress.product?.actions;
                return action?.strategic_axis_id === axis.id;
              });
              axisReports.push(...axisProgressReports);
            }
          } catch (error) {
            console.error(`Error fetching progress for report ${report.id}:`, error);
          }
        }

        // Calculate average progress for this axis
        const averageProgress = axisReports.length > 0 
          ? Math.round(axisReports.reduce((sum, report) => sum + (report.progress_percentage || 0), 0) / axisReports.length)
          : 0;

        // Count unique managers contributing to this axis
        const uniqueManagers = new Set(
          filteredReports
            .filter(report => {
              // Check if this report has progress for this axis
              return axisReports.some(axisReport => axisReport.manager_report_id === report.id);
            })
            .map(report => report.manager_id)
        );

        axesProgressData.push({
          id: axis.id,
          code: axis.code,
          name: axis.name,
          averageProgress,
          totalReports: axisReports.length,
          managerCount: uniqueManagers.size
        });
      }

      // Sort by progress (highest first)
      axesProgressData.sort((a, b) => b.averageProgress - a.averageProgress);
      
      setAxesProgress(axesProgressData);

    } catch (error) {
      console.error('Error loading axes progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "bg-green-500";
    if (progress >= 60) return "bg-yellow-500";
    if (progress >= 40) return "bg-orange-500";
    return "bg-red-500";
  };

  const getProgressStatus = (progress: number) => {
    if (progress >= 80) return { label: "Excelente", variant: "default" as const };
    if (progress >= 60) return { label: "Bueno", variant: "secondary" as const };
    if (progress >= 40) return { label: "Regular", variant: "outline" as const };
    return { label: "Bajo", variant: "destructive" as const };
  };

  if (loading) {
    return (
      <div className="flex justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Campus filter for coordinators and administrators */}
      {(['Coordinador', 'Administrador'].includes(profile?.role || '')) && campusList.length > 0 && (
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm font-medium">Campus:</span>
          <Select value={selectedCampus} onValueChange={setSelectedCampus}>
            <SelectTrigger className="w-48">
              <SelectValue />
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
      )}

      {axesProgress.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          No hay datos de progreso disponibles
        </div>
      ) : (
        <div className="space-y-3">
          {axesProgress.map((axis) => {
            const status = getProgressStatus(axis.averageProgress);
            
            return (
              <Card key={axis.id} className="hover:shadow-md transition-shadow duration-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Target className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {axis.code} - {axis.name}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {axis.managerCount} gestor{axis.managerCount !== 1 ? 'es' : ''} • {axis.totalReports} reporte{axis.totalReports !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={status.variant}>{status.label}</Badge>
                      <span className="text-lg font-bold text-gray-900">
                        {axis.averageProgress}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Progress 
                      value={axis.averageProgress} 
                      className="h-3"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>0%</span>
                      <span>50%</span>
                      <span>100%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
