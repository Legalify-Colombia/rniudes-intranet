import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { FileText, Eye, Edit, Plus, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { DetailedReportForm } from "./DetailedReportForm";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function MyReport() {
  const { 
    fetchManagerReportsByManagerWithPeriods,
    fetchWorkPlans,
    fetchReportPeriods,
    fetchReportSystemConfig,
    createManagerReport
  } = useSupabaseData();
  const { profile } = useAuth();
  const { toast } = useToast();
  
  const [reports, setReports] = useState<any[]>([]);
  const [workPlans, setWorkPlans] = useState<any[]>([]);
  const [reportPeriods, setReportPeriods] = useState<any[]>([]);
  const [systemConfig, setSystemConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [detailFormOpen, setDetailFormOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);

  useEffect(() => {
    if (profile?.role === 'Gestor') {
      loadData();
    }
  }, [profile]);

  const loadData = async () => {
    if (!profile?.id) return;
    
    setLoading(true);
    try {
      const [reportsResult, workPlansResult, periodsResult, configResult] = await Promise.all([
        fetchManagerReportsByManagerWithPeriods(profile.id),
        fetchWorkPlans(),
        fetchReportPeriods(),
        fetchReportSystemConfig()
      ]);

      setReports(reportsResult.data || []);
      
      // Filtrar solo los planes de trabajo aprobados del gestor actual
      const myApprovedPlans = (workPlansResult.data || []).filter(
        plan => plan.manager_id === profile.id && plan.status === 'approved'
      );
      setWorkPlans(myApprovedPlans);
      
      // Filtrar solo períodos activos
      const activePeriods = (periodsResult.data || []).filter(period => period.is_active);
      setReportPeriods(activePeriods);
      
      setSystemConfig(configResult.data);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar tus informes",
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

  const createNewReport = async (workPlanId: string, periodId: string) => {
    if (!profile?.id) return;
    
    try {
      const reportData = {
        manager_id: profile.id,
        work_plan_id: workPlanId,
        report_period_id: periodId,
        title: `Mi Informe de Progreso - ${new Date().toLocaleDateString()}`,
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

  // Verificar permisos del usuario
  if (!profile) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Cargando información del usuario...
        </AlertDescription>
      </Alert>
    );
  }

  if (profile.role !== 'Gestor') {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No tienes permisos para acceder a esta sección. Solo los gestores pueden ver sus informes.
        </AlertDescription>
      </Alert>
    );
  }

  if (loading) {
    return <div className="flex justify-center p-8">Cargando tus informes...</div>;
  }

  const reportsEnabled = systemConfig?.reports_enabled || false;

  if (!reportsEnabled) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          El sistema de informes está deshabilitado. Contacte al administrador para habilitarlo.
        </AlertDescription>
      </Alert>
    );
  }

  if (workPlans.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No tienes planes de trabajo aprobados. Debes tener un plan de trabajo aprobado para poder crear informes.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Mis Informes</h1>
        <Badge variant="outline">
          {reports.length} informe{reports.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      {reportPeriods.length === 0 && (
        <Alert>
          <Clock className="h-4 w-4" />
          <AlertDescription>
            No hay períodos de reporte activos. Los informes solo pueden crearse cuando hay períodos activos.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Mis Informes de Progreso
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plan de Trabajo</TableHead>
                <TableHead>Período de Reporte</TableHead>
                <TableHead>Título del Informe</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Progreso Total</TableHead>
                <TableHead>Fecha de Envío</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workPlans.map((workPlan) => {
                const existingReports = reports.filter(report => report.work_plan_id === workPlan.id);
                const canCreateNewReport = reportPeriods.length > 0 && reportsEnabled;
                
                return (
                  <React.Fragment key={workPlan.id}>
                    {existingReports.length > 0 ? (
                      existingReports.map((report) => (
                        <TableRow key={report.id}>
                          <TableCell>
                            <Badge variant="default" className="bg-green-600">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Plan Aprobado
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {report.report_period?.name || 'Sin período'}
                          </TableCell>
                          <TableCell>{report.title}</TableCell>
                          <TableCell>{getStatusBadge(report.status)}</TableCell>
                          <TableCell>
                            {report.total_progress_percentage ? (
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
                            {report.submitted_date ? 
                              new Date(report.submitted_date).toLocaleDateString('es-ES') : 
                              '-'
                            }
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => openDetailForm(report)}
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                Ver
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
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell>
                          <Badge variant="default" className="bg-green-600">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Plan Aprobado
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {reportPeriods.length > 0 ? reportPeriods[0].name : 'Sin período activo'}
                        </TableCell>
                        <TableCell>-</TableCell>
                        <TableCell>
                          <Badge variant="outline">Sin informe</Badge>
                        </TableCell>
                        <TableCell>-</TableCell>
                        <TableCell>-</TableCell>
                        <TableCell>
                          {canCreateNewReport ? (
                            <Button 
                              size="sm" 
                              onClick={() => createNewReport(workPlan.id, reportPeriods[0].id)}
                            >
                              <Plus className="w-4 h-4 mr-1" />
                              Crear Informe
                            </Button>
                          ) : (
                            <span className="text-sm text-gray-500">
                              Sin período activo
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={detailFormOpen} onOpenChange={setDetailFormOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedReport?.title || 'Mi Informe Detallado'}
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
