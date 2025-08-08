
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { EditableReportForm } from "./EditableReportForm";
import { TemplateBasedReportSelector } from "./TemplateBasedReportSelector";
import { IndicatorReportSelector } from "./IndicatorReportSelector";
import { IndicatorReportForm } from "./IndicatorReportForm";
import { TemplateReportForm } from "./TemplateReportForm";
import { FileText, Plus, Eye, Calendar, CheckCircle, Clock, AlertTriangle, Grid3x3, BarChart3, Edit3, Send, Trash2 } from "lucide-react";
import { UnifiedReport } from "@/types";
import { supabase } from "@/integrations/supabase/client";

export function MyReport() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const {
    fetchManagerReportsByManager,
    fetchWorkPlans,
    createManagerReport,
    fetchUnifiedReports,
    deleteTemplateBasedReport,
    deleteIndicatorReport,
    checkPeriodActive,
    submitIndicatorReport,
    submitTemplateBasedReport,
    fetchWorkPlansForManager,
  } = useSupabaseData();

  const [unifiedReports, setUnifiedReports] = useState<UnifiedReport[]>([]);
  const [workPlans, setWorkPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [selectedReportType, setSelectedReportType] = useState<string>("");
  const [creating, setCreating] = useState(false);
  const [activeTab, setActiveTab] = useState("all-reports");
  const [selectedWorkPlanId, setSelectedWorkPlanId] = useState<string | null>(null); // asegura pasar el plan al editor

  useEffect(() => {
    if (profile?.id) {
      loadData();
    }
  }, [profile?.id]);

  const loadData = async () => {
    if (!profile?.id) return;
    
    setLoading(true);
    try {
      const [unifiedResult, workPlansResult] = await Promise.all([
        fetchUnifiedReports(profile.id),
        fetchWorkPlansForManager(profile.id)
      ]);

      console.log('Unified reports loaded:', unifiedResult);

      setUnifiedReports(unifiedResult.data || []);
      // Solo planes del gestor, filtramos aprobados
      const approvedPlans = (workPlansResult.data || []).filter(
        (plan: any) => plan.status === 'approved'
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

  const createNewWorkPlanReport = async (workPlanId: string) => {
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

      const result = await createManagerReport(reportData);
      
      if (result.error) {
        throw result.error;
      }

      toast({
        title: "Éxito",
        description: "Informe creado correctamente",
      });

      await loadData();
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

  const handleEditReport = (report: UnifiedReport) => {
    setSelectedReport(report);
    setSelectedReportType(report.report_type);
  };

  // Asegurar obtener el work_plan_id cuando el reporte unificado no lo expone
  useEffect(() => {
    const loadWorkPlanId = async () => {
      if (selectedReport && selectedReportType === 'work_plan') {
        if (selectedReport.work_plan_id) {
          setSelectedWorkPlanId(selectedReport.work_plan_id);
          return;
        }
        const { data, error } = await supabase
          .from('manager_reports')
          .select('work_plan_id')
          .eq('id', selectedReport.id)
          .single();
        if (!error && data?.work_plan_id) {
          setSelectedWorkPlanId(data.work_plan_id);
        }
      } else {
        setSelectedWorkPlanId(null);
      }
    };
    loadWorkPlanId();
  }, [selectedReport, selectedReportType]);

  const handleDeleteReport = async (reportId: string, reportType: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este informe? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      let result;
      if (reportType === 'template') {
        result = await deleteTemplateBasedReport(reportId);
      } else if (reportType === 'indicators') {
        result = await deleteIndicatorReport(reportId);
      } else {
        toast({
          title: "Error",
          description: "No se puede eliminar este tipo de informe",
          variant: "destructive",
        });
        return;
      }
      
      if (result.error) {
        throw result.error;
      }

      toast({
        title: "Éxito",
        description: "Informe eliminado correctamente",
      });

      await loadData();
    } catch (error) {
      console.error('Error deleting report:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el informe",
        variant: "destructive",
      });
    }
  };

  const handleSubmitReport = async (reportId: string, reportType: string) => {
    if (!confirm('¿Estás seguro de que deseas enviar este informe? No podrás editarlo después.')) {
      return;
    }

    try {
      let result;
      if (reportType === 'indicators') {
        result = await submitIndicatorReport(reportId);
      } else if (reportType === 'template') {
        result = await submitTemplateBasedReport(reportId);
      } else {
        toast({
          title: "Error",
          description: "No se puede enviar este tipo de informe desde aquí",
          variant: "destructive",
        });
        return;
      }
      
      if (result.error) {
        throw result.error;
      }

      toast({
        title: "Éxito",
        description: "Informe enviado correctamente",
      });

      await loadData();
    } catch (error) {
      console.error('Error submitting report:', error);
      toast({
        title: "Error",
        description: "No se pudo enviar el informe",
        variant: "destructive",
      });
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
            <Send className="w-3 h-3 mr-1" />
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

  const canEdit = (report: UnifiedReport) => {
    return report.status === 'draft';
  };

  const canDelete = (report: UnifiedReport) => {
    return report.status === 'draft' && (report.report_type === 'template' || report.report_type === 'indicators');
  };

  const canSubmit = (report: UnifiedReport) => {
    return report.status === 'draft' && (report.report_type === 'template' || report.report_type === 'indicators');
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
    if (selectedReportType === 'work_plan') {
      return (
        <EditableReportForm
          reportId={selectedReport.id}
          workPlanId={selectedReport.work_plan_id ?? selectedWorkPlanId ?? ""}
          reportStatus={selectedReport.status}
          onSave={() => {
            setSelectedReport(null);
            setSelectedReportType("");
            loadData();
          }}
        />
      );
    } else if (selectedReportType === 'indicators') {
      return (
        <IndicatorReportForm
          reportId={selectedReport.id}
          reportPeriodId={selectedReport.report_period_id}
          onSave={() => {
            setSelectedReport(null);
            setSelectedReportType("");
            loadData();
          }}
        />
      );
    } else if (selectedReportType === 'template') {
      return (
        <TemplateReportForm
          reportId={selectedReport.id}
          onSave={() => {
            setSelectedReport(null);
            setSelectedReportType("");
            loadData();
          }}
        />
      );
    } else {
      // Fallback for other report types
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setSelectedReport(null);
                setSelectedReportType("");
              }}
            >
              ← Volver a Mis Informes
            </Button>
          </div>
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">{selectedReport.title}</h3>
              <p className="text-gray-600">Editor de este tipo de informe en desarrollo...</p>
            </CardContent>
          </Card>
        </div>
      );
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mis Informes</h1>
          <p className="text-gray-600 mt-1">
            Gestiona todos tus informes en un solo lugar
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all-reports" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Todos los Informes
            {unifiedReports.length > 0 && (
              <Badge variant="secondary">{unifiedReports.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="work-plan-reports" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Plan de Trabajo
          </TabsTrigger>
          <TabsTrigger value="template-reports" className="flex items-center gap-2">
            <Grid3x3 className="h-4 w-4" />
            Plantillas
          </TabsTrigger>
          <TabsTrigger value="indicator-reports" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Indicadores
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all-reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Todos Mis Informes ({unifiedReports.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {unifiedReports.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No tienes informes creados</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tipo de Informe</TableHead>
                      <TableHead>Título</TableHead>
                      <TableHead>Fecha de Creación</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Fecha de Envío</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {unifiedReports.map((report) => (
                      <TableRow key={`${report.report_type}-${report.id}`}>
                        <TableCell>
                          <Badge variant="outline">
                            {report.type_display_name}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">{report.title}</TableCell>
                        <TableCell>
                          {new Date(report.created_at).toLocaleDateString('es-ES')}
                        </TableCell>
                        <TableCell>{getStatusBadge(report.status)}</TableCell>
                        <TableCell>
                          {report.submitted_date 
                            ? new Date(report.submitted_date).toLocaleDateString('es-ES')
                            : '-'
                          }
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant={canEdit(report) ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => handleEditReport(report)}
                            >
                              {canEdit(report) ? (
                                <>
                                  <Edit3 className="h-4 w-4 mr-1" />
                                  Editar
                                </>
                              ) : (
                                <>
                                  <Eye className="h-4 w-4 mr-1" />
                                  Ver
                                </>
                              )}
                            </Button>

                            {canSubmit(report) && (
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleSubmitReport(report.id, report.report_type)}
                                className="institutional-gradient text-white"
                              >
                                <Send className="h-4 w-4 mr-1" />
                                Enviar
                              </Button>
                            )}

                            {canDelete(report) && (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteReport(report.id, report.report_type)}
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Eliminar
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="work-plan-reports" className="space-y-6">
          {workPlans.length === 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                No tienes planes de trabajo aprobados para crear informes de progreso.
              </AlertDescription>
            </Alert>
          )}

          {workPlans.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Crear Nuevo Informe del Plan de Trabajo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {workPlans.map((workPlan) => (
                    <div key={workPlan.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">Plan de Trabajo</h4>
                        <p className="text-sm text-gray-600">
                          {workPlan.total_hours_assigned} horas asignadas
                        </p>
                      </div>
                      <Button
                        onClick={() => createNewWorkPlanReport(workPlan.id)}
                        disabled={creating}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Crear Informe
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="template-reports" className="space-y-6">
          <TemplateBasedReportSelector
            onReportCreated={loadData}
            existingReports={unifiedReports.filter(r => r.report_type === 'template')}
          />
        </TabsContent>

        <TabsContent value="indicator-reports" className="space-y-6">
          <IndicatorReportSelector
            onReportCreated={loadData}
            existingReports={unifiedReports.filter(r => r.report_type === 'indicators')}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
