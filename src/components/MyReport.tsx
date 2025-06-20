
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { EditableReportForm } from "./EditableReportForm";
import { FileText, Plus, Eye, Calendar, CheckCircle, Clock, AlertTriangle } from "lucide-react";

export function MyReport() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const {
    fetchManagerReportsByManager,
    fetchWorkPlans,
    createManagerReport
  } = useSupabaseData();

  const [reports, setReports] = useState<any[]>([]);
  const [workPlans, setWorkPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (profile?.id) {
      loadData();
    }
  }, [profile?.id]);

  const loadData = async () => {
    if (!profile?.id) return;
    
    setLoading(true);
    try {
      const [reportsResult, workPlansResult] = await Promise.all([
        fetchManagerReportsByManager(profile.id),
        fetchWorkPlans()
      ]);

      console.log('Reports loaded:', reportsResult);
      console.log('Work plans loaded:', workPlansResult);

      setReports(reportsResult.data || []);
      
      // Filtrar planes de trabajo aprobados para este gestor
      const approvedPlans = (workPlansResult.data || []).filter(
        (plan: any) => plan.manager_id === profile.id && plan.status === 'approved'
      );
      setWorkPlans(approvedPlans);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createNewReport = async (workPlanId: string) => {
    if (!profile?.id) return;

    setCreating(true);
    try {
      const workPlan = workPlans.find(wp => wp.id === workPlanId);
      if (!workPlan) {
        throw new Error('Plan de trabajo no encontrado');
      }

      const reportData = {
        manager_id: profile.id,
        work_plan_id: workPlanId,
        title: `Informe de Progreso - ${new Date().toLocaleDateString()}`,
        description: `Informe de progreso para el plan de trabajo`,
        status: 'draft' as const
      };

      console.log('Creating report with data:', reportData);

      const result = await createManagerReport(reportData);
      
      if (result.error) {
        throw result.error;
      }

      console.log('Report created successfully:', result.data);

      toast({
        title: "Éxito",
        description: "Informe creado correctamente",
      });

      await loadData();
      setSelectedReport(result.data);
    } catch (error) {
      console.error('Error creating report:', error);
      toast({
        title: "Error",
        description: "No se pudo crear el informe",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return (
          <Badge variant="secondary">
            <Clock className="w-3 h-3 mr-1" />
            Borrador
          </Badge>
        );
      case 'submitted':
        return (
          <Badge variant="default">
            <FileText className="w-3 h-3 mr-1" />
            Enviado
          </Badge>
        );
      case 'reviewed':
        return (
          <Badge variant="default" className="bg-green-600">
            <CheckCircle className="w-3 h-3 mr-1" />
            Revisado
          </Badge>
        );
      default:
        return <Badge variant="outline">Sin estado</Badge>;
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Cargando informes...</p>
        </div>
      </div>
    );
  }

  if (selectedReport) {
    return (
      <EditableReportForm
        reportId={selectedReport.id}
        workPlanId={selectedReport.work_plan_id}
        reportStatus={selectedReport.status}
        onSave={() => {
          setSelectedReport(null);
          loadData();
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mis Informes de Progreso</h1>
          <p className="text-gray-600 mt-1">
            Gestiona y crea tus informes de progreso de planes de trabajo
          </p>
        </div>
      </div>

      {workPlans.length === 0 && reports.length === 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            No tienes planes de trabajo aprobados para crear informes de progreso.
            Contacta con tu coordinador para que apruebe tu plan de trabajo.
          </AlertDescription>
        </Alert>
      )}

      {/* Sección para crear nuevos informes */}
      {workPlans.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Crear Nuevo Informe
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Selecciona un plan de trabajo aprobado para crear un nuevo informe de progreso:
              </p>
              <div className="grid gap-3">
                {workPlans.map((workPlan) => (
                  <div key={workPlan.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div>
                      <h4 className="font-medium">Plan de Trabajo</h4>
                      <p className="text-sm text-gray-600">
                        {workPlan.total_hours_assigned} horas asignadas
                      </p>
                      <p className="text-xs text-gray-500">
                        Aprobado: {new Date(workPlan.approved_date).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      onClick={() => createNewReport(workPlan.id)}
                      disabled={creating}
                    >
                      {creating ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Creando...
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          Crear Informe
                        </>
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de informes existentes */}
      {reports.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Mis Informes ({reports.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reports.map((report) => (
                <div key={report.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium">{report.title}</h3>
                        {getStatusBadge(report.status)}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>Creado: {new Date(report.created_at).toLocaleDateString()}</span>
                        </div>
                        
                        {report.submitted_date && (
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            <span>Enviado: {new Date(report.submitted_date).toLocaleDateString()}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2">
                          <div className={`font-medium ${getProgressColor(report.total_progress_percentage || 0)}`}>
                            Progreso: {Math.round(report.total_progress_percentage || 0)}%
                          </div>
                        </div>
                      </div>

                      {report.description && (
                        <p className="text-sm text-gray-600 mt-2">{report.description}</p>
                      )}
                    </div>

                    <div className="flex gap-2 ml-4">
                      <Button
                        variant={report.status === 'draft' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedReport(report)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        {report.status === 'draft' ? 'Editar' : 'Ver'}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
