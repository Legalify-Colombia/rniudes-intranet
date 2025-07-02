
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft, Save, Send, FileText, Clock, CheckCircle } from "lucide-react";

interface UnifiedReportFormProps {
  reportType: "work_plan" | "template" | "indicators" | "custom_plan";
  reportId?: string;
  reportPeriodId?: string;
  planTypeId?: string;
  onSave: () => void;
}

export function UnifiedReportForm({ 
  reportType, 
  reportId, 
  reportPeriodId, 
  planTypeId,
  onSave 
}: UnifiedReportFormProps) {
  const { profile } = useAuth();
  const { toast } = useToast();
  const { 
    fetchWorkPlanDetails,
    fetchTemplateBasedReportDetails,
    fetchIndicatorReport,
    fetchCustomPlanDetails,
    updateWorkPlan,
    updateTemplateBasedReport,
    updateIndicatorReport,
    updateCustomPlan,
    submitTemplateBasedReport,
    submitIndicatorReport,
    submitCustomPlan,
    checkPeriodActive
  } = useSupabaseData();

  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [canEdit, setCanEdit] = useState(true);

  useEffect(() => {
    loadReport();
  }, [reportId, reportType]);

  const loadReport = async () => {
    if (!reportId) return;
    
    setLoading(true);
    try {
      let result;
      
      switch (reportType) {
        case "work_plan":
          result = await fetchWorkPlanDetails(reportId);
          break;
        case "template":
          result = await fetchTemplateBasedReportDetails(reportId);
          break;
        case "indicators":
          result = await fetchIndicatorReport(reportId);
          break;
        case "custom_plan":
          result = await fetchCustomPlanDetails(reportId);
          break;
      }

      if (result?.data) {
        setReport(result.data);
        
        // Check if period is still active for editing
        if (result.data.report_period_id) {
          const isActive = await checkPeriodActive(result.data.report_period_id);
          setCanEdit(isActive && result.data.status === 'draft');
        } else {
          setCanEdit(result.data.status === 'draft');
        }
      }
    } catch (error) {
      console.error('Error loading report:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar el informe",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!report || !reportId) return;

    setSaving(true);
    try {
      let result;
      
      switch (reportType) {
        case "work_plan":
          result = await updateWorkPlan(reportId, report);
          break;
        case "template":
          result = await updateTemplateBasedReport(reportId, report);
          break;
        case "indicators":
          result = await updateIndicatorReport(reportId, report);
          break;
        case "custom_plan":
          result = await updateCustomPlan(reportId, report);
          break;
      }

      if (result?.data) {
        toast({
          title: "Éxito",
          description: "Informe guardado correctamente",
        });
      }
    } catch (error) {
      console.error('Error saving report:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar el informe",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!reportId) return;

    try {
      let result;
      
      switch (reportType) {
        case "template":
          result = await submitTemplateBasedReport(reportId);
          break;
        case "indicators":
          result = await submitIndicatorReport(reportId);
          break;
        case "custom_plan":
          result = await submitCustomPlan(reportId);
          break;
      }

      if (result?.data) {
        toast({
          title: "Éxito",
          description: "Informe enviado correctamente",
        });
        onSave();
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      toast({
        title: "Error",
        description: "No se pudo enviar el informe",
        variant: "destructive",
      });
    }
  };

  const getReportTypeName = () => {
    switch (reportType) {
      case "work_plan":
        return "Plan de Trabajo";
      case "template":
        return "Informe por Plantilla";
      case "indicators":
        return "Informe de Indicadores";
      case "custom_plan":
        return "Plan Personalizado";
      default:
        return "Informe";
    }
  };

  const getStatusIcon = () => {
    if (!report) return <Clock className="h-5 w-5 text-gray-400" />;
    
    switch (report.status) {
      case 'draft':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'submitted':
        return <Send className="h-5 w-5 text-blue-500" />;
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusText = () => {
    if (!report) return "Cargando...";
    
    switch (report.status) {
      case 'draft':
        return "Borrador";
      case 'submitted':
        return "Enviado";
      case 'approved':
        return "Aprobado";
      case 'rejected':
        return "Rechazado";
      default:
        return "Desconocido";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Cargando informe...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onSave}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Mis Informes
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{getReportTypeName()}</h1>
            <div className="flex items-center gap-2 text-gray-600">
              {getStatusIcon()}
              <span>Estado: {getStatusText()}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {canEdit && (
            <Button
              variant="outline"
              onClick={handleSave}
              disabled={saving}
            >
              <Save className="h-4 w-4 mr-2" />
              Guardar
            </Button>
          )}
          {canEdit && report?.status === 'draft' && reportType !== 'work_plan' && (
            <Button
              onClick={handleSubmit}
              className="institutional-gradient text-white"
            >
              <Send className="h-4 w-4 mr-2" />
              Enviar Informe
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Detalles del Informe
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {report && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    value={report.title || report.project_title || ''}
                    onChange={(e) => setReport({ 
                      ...report, 
                      title: e.target.value,
                      project_title: e.target.value 
                    })}
                    disabled={!canEdit}
                  />
                </div>
                <div>
                  <Label htmlFor="status">Estado</Label>
                  <Input
                    id="status"
                    value={getStatusText()}
                    disabled
                    className="bg-gray-100"
                  />
                </div>
              </div>

              {report.description !== undefined && (
                <div>
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    value={report.description || ''}
                    onChange={(e) => setReport({ ...report, description: e.target.value })}
                    disabled={!canEdit}
                    rows={3}
                  />
                </div>
              )}

              {report.objectives !== undefined && (
                <div>
                  <Label htmlFor="objectives">Objetivos</Label>
                  <Textarea
                    id="objectives"
                    value={report.objectives || ''}
                    onChange={(e) => setReport({ ...report, objectives: e.target.value })}
                    disabled={!canEdit}
                    rows={4}
                  />
                </div>
              )}

              {/* Mostrar campos específicos según el tipo de reporte */}
              {reportType === "work_plan" && report.total_hours_assigned && (
                <div>
                  <Label htmlFor="total_hours">Total de Horas Asignadas</Label>
                  <Input
                    id="total_hours"
                    type="number"
                    value={report.total_hours_assigned || 0}
                    onChange={(e) => setReport({ 
                      ...report, 
                      total_hours_assigned: parseInt(e.target.value) || 0 
                    })}
                    disabled={!canEdit}
                  />
                </div>
              )}

              {/* Información de fechas */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                <div>
                  <Label className="text-sm text-gray-600">Fecha de Creación</Label>
                  <p className="text-sm">
                    {report.created_at ? new Date(report.created_at).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                {report.submitted_date && (
                  <div>
                    <Label className="text-sm text-gray-600">Fecha de Envío</Label>
                    <p className="text-sm">
                      {new Date(report.submitted_date).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {report.approved_date && (
                  <div>
                    <Label className="text-sm text-gray-600">Fecha de Aprobación</Label>
                    <p className="text-sm">
                      {new Date(report.approved_date).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>

              {/* Comentarios de aprobación */}
              {report.approval_comments && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <Label className="text-sm font-medium text-blue-900">Comentarios de Aprobación</Label>
                  <p className="text-sm text-blue-800 mt-1">{report.approval_comments}</p>
                </div>
              )}

              {!canEdit && report.status === 'draft' && (
                <div className="p-4 bg-amber-50 rounded-lg">
                  <p className="text-amber-800 text-sm">
                    <strong>Nota:</strong> El período de reporte ha finalizado. Este informe ya no puede ser editado.
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
