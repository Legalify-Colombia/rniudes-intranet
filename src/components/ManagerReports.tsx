
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { FileText, Eye, CheckCircle, Clock, Edit, Plus, Settings } from "lucide-react";
import { DetailedReportForm } from "./DetailedReportForm";
import { ReportPeriodsManagement } from "./ReportPeriodsManagement";

export function ManagerReports() {
  const { 
    fetchManagerReportsWithPeriods, 
    fetchWorkPlans, 
    fetchReportPeriods,
    fetchReportSystemConfig,
    createManagerReport,
    updateManagerReport 
  } = useSupabaseData();
  const { profile } = useAuth();
  const { toast } = useToast();
  
  const [reports, setReports] = useState<any[]>([]);
  const [workPlans, setWorkPlans] = useState<any[]>([]);
  const [reportPeriods, setReportPeriods] = useState<any[]>([]);
  const [systemConfig, setSystemConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showPeriodsManagement, setShowPeriodsManagement] = useState(false);
  const [detailFormOpen, setDetailFormOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [reportsResult, workPlansResult, periodsResult, configResult] = await Promise.all([
        fetchManagerReportsWithPeriods(),
        fetchWorkPlans(),
        fetchReportPeriods(),
        fetchReportSystemConfig()
      ]);

      setReports(reportsResult.data || []);
      setWorkPlans(workPlansResult.data || []);
      setReportPeriods(periodsResult.data || []);
      setSystemConfig(configResult.data);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los informes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="secondary"><Edit className="w-3 h-3 mr-1" />Borrador</Badge>;
      case 'submitted':
        return <Badge variant="default"><Clock className="w-3 h-3 mr-1" />Enviado</Badge>;
      case 'reviewed':
        return <Badge variant="default" className="bg-green-600"><CheckCircle className="w-3 h-3 mr-1" />Revisado</Badge>;
      default:
        return <Badge variant="outline">Sin estado</Badge>;
    }
  };

  const getApprovedWorkPlans = () => {
    return workPlans.filter(plan => plan.status === 'approved');
  };

  const getReportForWorkPlan = (workPlanId: string) => {
    return reports.find(report => report.work_plan_id === workPlanId);
  };

  const getActiveReportPeriods = () => {
    return reportPeriods.filter(period => period.is_active);
  };

  const createNewReport = async (workPlanId: string, periodId: string) => {
    try {
      const reportData = {
        manager_id: profile?.id || '',
        work_plan_id: workPlanId,
        report_period_id: periodId,
        title: `Informe de Progreso - ${new Date().toLocaleDateString()}`,
        status: 'draft' as const
      };

      const { data, error } = await createManagerReport(reportData);
      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Informe creado correctamente",
      });

      setSelectedReport(data);
      setDetailFormOpen(true);
      loadData();
    } catch (error) {
      console.error('Error creating report:', error);
      toast({
        title: "Error",
        description: "No se pudo crear el informe",
        variant: "destructive",
      });
    }
  };

  const openDetailForm = (report: any) => {
    setSelectedReport(report);
    setDetailFormOpen(true);
  };

  const handleDetailFormSave = async () => {
    setDetailFormOpen(false);
    setSelectedReport(null);
    loadData();
  };

  if (loading) {
    return <div className="flex justify-center p-8">Cargando informes...</div>;
  }

  const approvedWorkPlans = getApprovedWorkPlans();
  const activeReportPeriods = getActiveReportPeriods();
  const isAdmin = profile?.role === 'Administrador';
  const reportsEnabled = systemConfig?.reports_enabled || false;

  if (showPeriodsManagement && isAdmin) {
    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={() => setShowPeriodsManagement(false)}>
          ← Volver a Informes
        </Button>
        <ReportPeriodsManagement />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Informes de Gestores</h1>
        {isAdmin && (
          <Button variant="outline" onClick={() => setShowPeriodsManagement(true)}>
            <Settings className="h-4 w-4 mr-2" />
            Gestionar Períodos
          </Button>
        )}
      </div>

      {!reportsEnabled && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-4">
            <p className="text-yellow-800">
              El sistema de informes está deshabilitado. Contacte al administrador para habilitarlo.
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Informes de Progreso
          </CardTitle>
        </CardHeader>
        <CardContent>
          {approvedWorkPlans.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No hay planes de trabajo aprobados para generar informes.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Gestor</TableHead>
                  <TableHead>Programa</TableHead>
                  <TableHead>Campus</TableHead>
                  <TableHead>Plan de Trabajo</TableHead>
                  <TableHead>Período Activo</TableHead>
                  <TableHead>Estado del Informe</TableHead>
                  <TableHead>Progreso Total</TableHead>
                  <TableHead>Fecha de Envío</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {approvedWorkPlans.map((workPlan) => {
                  const report = getReportForWorkPlan(workPlan.id);
                  const canCreateReport = activeReportPeriods.length > 0 && reportsEnabled;
                  
                  return (
                    <TableRow key={workPlan.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{workPlan.manager?.full_name}</div>
                          <div className="text-sm text-gray-500">{workPlan.manager?.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>{workPlan.program?.name}</TableCell>
                      <TableCell>{workPlan.program?.campus?.name}</TableCell>
                      <TableCell>
                        <Badge variant="default" className="bg-green-600">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Aprobado
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {activeReportPeriods.length > 0 ? (
                          <div className="text-sm">
                            {activeReportPeriods.map(period => (
                              <div key={period.id} className="text-green-600">
                                {period.name}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-500">Sin período activo</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {report ? (
                          getStatusBadge(report.status)
                        ) : (
                          <Badge variant="outline">Sin informe</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {report?.total_progress_percentage ? (
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${report.total_progress_percentage}%` }}
                              />
                            </div>
                            <span className="text-sm">{report.total_progress_percentage.toFixed(1)}%</span>
                          </div>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>
                        {report?.submitted_date ? 
                          new Date(report.submitted_date).toLocaleDateString('es-ES') : 
                          '-'
                        }
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {report ? (
                            <>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => openDetailForm(report)}
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                Ver Detalle
                              </Button>
                              {report.status === 'draft' && (
                                <Button 
                                  size="sm" 
                                  onClick={() => openDetailForm(report)}
                                >
                                  <Edit className="w-4 h-4 mr-1" />
                                  Editar
                                </Button>
                              )}
                            </>
                          ) : canCreateReport ? (
                            <Button 
                              size="sm" 
                              onClick={() => createNewReport(workPlan.id, activeReportPeriods[0].id)}
                            >
                              <Plus className="w-4 h-4 mr-1" />
                              Crear Informe
                            </Button>
                          ) : (
                            <span className="text-sm text-gray-500">
                              {!reportsEnabled ? 'Informes deshabilitados' : 'Sin período activo'}
                            </span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={detailFormOpen} onOpenChange={setDetailFormOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedReport?.title || 'Informe Detallado'}
            </DialogTitle>
          </DialogHeader>
          {selectedReport && (
            <DetailedReportForm
              reportId={selectedReport.id}
              workPlanId={selectedReport.work_plan_id}
              onSave={handleDetailFormSave}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
