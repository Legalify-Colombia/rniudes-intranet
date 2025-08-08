import { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { useToast } from "@/hooks/use-toast";
import { EvidenceUploader } from "./EvidenceUploader";
import { FileText, Save, Send, AlertTriangle, CheckCircle, Clock, Edit3 } from "lucide-react";

interface EditableReportFormProps {
  reportId: string;
  workPlanId: string;
  onSave: () => void;
  reportStatus?: string;
  isReadOnly?: boolean;
}

export function EditableReportForm({ 
  reportId, 
  workPlanId, 
  onSave,
  reportStatus = 'draft',
  isReadOnly = false
}: EditableReportFormProps) {
  const {
    fetchWorkPlanAssignments,
    fetchProductProgressReports,
    upsertProductProgressReport,
    updateManagerReport
  } = useSupabaseData();
  const { toast } = useToast();

  const [assignments, setAssignments] = useState<any[]>([]);
  const [progressReports, setProgressReports] = useState<any[]>([]);
  const [localChanges, setLocalChanges] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [overallProgress, setOverallProgress] = useState(0);

  const loadData = useCallback(async () => {
    try {
      const [assignmentsResult, progressResult] = await Promise.all([
        fetchWorkPlanAssignments(workPlanId),
        fetchProductProgressReports(reportId)
      ]);
      setAssignments(assignmentsResult.data || []);
      setProgressReports(progressResult.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos del informe",
        variant: "destructive",
      });
    }
  }, [reportId, workPlanId, fetchWorkPlanAssignments, fetchProductProgressReports, toast]);

  useEffect(() => {
    if (workPlanId && reportId) {
      setLoading(true);
      loadData().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportId, workPlanId]);

  useEffect(() => {
    const allReports = [...progressReports];
    Object.keys(localChanges).forEach(productId => {
      const existingIndex = allReports.findIndex(r => r.product_id === productId);
      if (existingIndex >= 0) {
        allReports[existingIndex] = { ...allReports[existingIndex], ...localChanges[productId] };
      } else if (localChanges[productId].progress_percentage > 0) {
        allReports.push({ product_id: productId, ...localChanges[productId] });
      }
    });

    if (allReports.length === 0) {
      setOverallProgress(0);
      return;
    }

    const totalProgress = allReports.reduce(
      (sum, report) => sum + (report.progress_percentage || 0), 
      0
    );
    const average = totalProgress / allReports.length;
    setOverallProgress(Math.round(average));
  }, [progressReports, localChanges]);

  const getProgressReport = useCallback((productId: string) => {
    const localChange = localChanges[productId];
    const dbReport = progressReports.find(pr => pr.product_id === productId);
    return {
      progress_percentage: 0,
      observations: '',
      evidence_files: [],
      evidence_file_names: [],
      ...dbReport,
      ...localChange
    };
  }, [localChanges, progressReports]);

  const updateLocalChanges = useCallback((productId: string, updates: any) => {
    if (isReadOnly) return;
    setLocalChanges(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        ...updates
      }
    }));
  }, [isReadOnly]);

  const saveDraft = useCallback(async () => {
    if (isReadOnly) return;
    
    setSaving(true);
    try {
      const saveErrors = [];
      for (const productId of Object.keys(localChanges)) {
        const assignment = assignments.find(a => a.product.id === productId);
        if (!assignment) continue;

        const reportData = {
          manager_report_id: reportId,
          product_id: productId,
          custom_plan_assignment_id: assignment.id,
          ...localChanges[productId]
        };

        const result = await upsertProductProgressReport(reportData);
        if (result.error) {
          saveErrors.push({ productId, error: result.error });
        }
      }

      // *** CORRECCIÓN: Manejo de errores detallado ***
      if (saveErrors.length > 0) {
        const firstError = saveErrors[0];
        // El objeto de error de Supabase tiene información valiosa.
        const detailedMessage = `Error en Producto ID ${firstError.productId}: ${firstError.error.message}. (Detalles: ${firstError.error.details || 'No hay más detalles'})`;
        
        console.error("Error detallado al guardar:", firstError.error);

        toast({
          title: "Error al Guardar Progreso",
          description: detailedMessage,
          variant: "destructive",
          duration: 10000 // Aumentar la duración para poder leer el error
        });
        // Detenemos la ejecución aquí, el toast es suficiente.
        return; 
      }

      setLocalChanges({});
      await updateManagerReport(reportId, { updated_at: new Date().toISOString() });
      
      toast({
        title: "Éxito",
        description: "Borrador guardado correctamente",
      });
      
      await loadData();
    } catch (error) {
      // Este catch ahora solo atrapará errores inesperados de JavaScript.
      console.error('Error inesperado al guardar borrador:', error);
      toast({
        title: "Error Inesperado",
        description: error instanceof Error ? error.message : "Ocurrió un error desconocido.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }, [isReadOnly, localChanges, assignments, reportId, upsertProductProgressReport, updateManagerReport, toast, loadData]);

  const submitReport = useCallback(async () => {
    if (isReadOnly) return;
    
    setSubmitting(true);
    try {
      if (Object.keys(localChanges).length > 0) {
        // saveDraft ahora retorna si hay un error, así que verificamos si aún hay cambios.
        await saveDraft();
        if (Object.keys(localChanges).length > 0) {
            // Si saveDraft falló y no limpió los cambios, no continuamos.
            setSubmitting(false);
            return;
        }
      }
      
      const updateResult = await updateManagerReport(reportId, { 
        status: 'submitted',
        submitted_date: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      if (updateResult.error) {
        throw updateResult.error;
      }

      toast({
        title: "Éxito",
        description: overallProgress >= 70 
          ? "Informe enviado correctamente. Se ha notificado a los administradores y coordinadores."
          : "Informe enviado. Como el progreso es menor al 70%, se requerirá un plan de mejora.",
        variant: overallProgress >= 70 ? "default" : "destructive"
      });

      onSave();
    } catch (error) {
      console.error('Error submitting report:', error);
      toast({
        title: "Error",
        description: "No se pudo enviar el informe",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  }, [isReadOnly, localChanges, saveDraft, updateManagerReport, reportId, toast, overallProgress, onSave]);

  const organizedData = useMemo(() => {
    const organized: any = {};
    assignments.forEach(assignment => {
      const product = assignment.product;
      if (!product?.action?.strategic_axis) return;
      
      const axis = product.action.strategic_axis;
      const action = product.action;
      
      if (!organized[axis.id]) {
        organized[axis.id] = { ...axis, actions: {} };
      }
      if (!organized[axis.id].actions[action.id]) {
        organized[axis.id].actions[action.id] = { ...action, products: [] };
      }
      
      organized[axis.id].actions[action.id].products.push({
        ...assignment,
        progressReport: getProgressReport(product.id)
      });
    });
    return Object.values(organized);
  }, [assignments, getProgressReport]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft': return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Borrador</Badge>;
      case 'submitted': return <Badge variant="default"><Send className="w-3 h-3 mr-1" />Enviado</Badge>;
      case 'reviewed': return <Badge variant="default" className="bg-green-600"><CheckCircle className="w-3 h-3 mr-1" />Revisado</Badge>;
      default: return <Badge variant="outline">Sin estado</Badge>;
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Cargando formulario de informe...</div>;
  }
  
  if (!workPlanId) {
    return (
      <Alert className="mt-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          No se ha especificado un plan de trabajo. Selecciona uno para ver el informe.
        </AlertDescription>
      </Alert>
    );
  }

  const canEdit = !isReadOnly && reportStatus === 'draft';
  const hasUnsavedChanges = Object.keys(localChanges).length > 0;
  const requiresImprovementPlan = overallProgress < 70;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">
            {isReadOnly ? 'Vista de Informe de Progreso' : 'Mi Informe de Progreso'}
          </h2>
          <div className="flex items-center gap-4 mt-2">
            {getStatusBadge(reportStatus)}
            <span className="text-sm text-gray-600">{assignments.length} indicadores</span>
            {hasUnsavedChanges && canEdit && (
              <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                <Edit3 className="w-3 h-3 mr-1" />
                Cambios sin guardar
              </Badge>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {canEdit && (
            <>
              <Button onClick={saveDraft} variant="outline" disabled={saving}>
                {saving ? (
                  <><div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-2"></div>Guardando...</>
                ) : (
                  <><Save className="h-4 w-4 mr-2" />Guardar Borrador</>
                )}
              </Button>
              <Button onClick={submitReport} disabled={submitting} className={requiresImprovementPlan ? "bg-yellow-600 hover:bg-yellow-700" : ""}>
                {submitting ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>Enviando...</>
                ) : (
                  <><Send className="h-4 w-4 mr-2" />Enviar Informe</>
                )}
              </Button>
            </>
          )}
          {!canEdit && (
            <Button onClick={onSave} variant="outline">
              <CheckCircle className="h-4 w-4 mr-2" />
              Cerrar
            </Button>
          )}
        </div>
      </div>

      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{overallProgress}%</div>
              <div className="text-sm text-gray-600">Progreso General</div>
              <Progress value={overallProgress} className="mt-2" />
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-700 mb-2">{progressReports.length + Object.keys(localChanges).length}</div>
              <div className="text-sm text-gray-600">Indicadores con Progreso</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-700 mb-2">{assignments.length}</div>
              <div className="text-sm text-gray-600">Total de Indicadores</div>
            </div>
          </div>
          {requiresImprovementPlan && (
            <Alert className="mt-4 border-yellow-400 bg-yellow-50">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                <strong>Atención:</strong> El progreso general es menor al 70%. Al enviar este informe se requerirá crear un plan de mejora para la próxima vigencia.
              </AlertDescription>
            </Alert>
          )}
          {hasUnsavedChanges && canEdit && (
            <Alert className="mt-4 border-blue-400 bg-blue-50">
              <Edit3 className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                Tienes cambios sin guardar. Haz clic en "Guardar Borrador" para guardar tus cambios en la base de datos.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {organizedData.length === 0 ? (
        <Alert>
          <FileText className="h-4 w-4" />
          <AlertDescription>
            No hay productos asignados en el plan de trabajo para reportar.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-6">
          {organizedData.map((axis: any) => (
            <Card key={axis.id}>
              <CardHeader>
                <CardTitle className="text-lg text-blue-800">{axis.code} - {axis.name}</CardTitle>
              </CardHeader>
              <CardContent>
                {Object.values(axis.actions).map((action: any) => (
                  <div key={action.id} className="mb-6">
                    <h4 className="font-medium text-gray-800 mb-4">{action.code} {action.name}</h4>
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-50">
                            <TableHead className="font-medium">Indicador</TableHead>
                            <TableHead className="font-medium w-32">Horas</TableHead>
                            <TableHead className="font-medium w-32">Progreso (%)</TableHead>
                            <TableHead className="font-medium w-40">Progreso Visual</TableHead>
                            <TableHead className="font-medium">Observaciones</TableHead>
                            <TableHead className="font-medium w-80">Evidencias</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {action.products.map((assignment: any) => {
                            const product = assignment.product;
                            const progressReport = assignment.progressReport;
                            return (
                              <TableRow key={assignment.id} className="hover:bg-gray-50">
                                <TableCell><div className="font-medium">{product.name}</div></TableCell>
                                <TableCell><Badge variant="outline">{assignment.assigned_hours}h</Badge></TableCell>
                                <TableCell>
                                  {canEdit ? (
                                    <Input
                                      type="number"
                                      min="0" max="100"
                                      value={progressReport.progress_percentage || 0}
                                      onChange={(e) => {
                                        const newPercentage = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
                                        updateLocalChanges(product.id, { progress_percentage: newPercentage });
                                      }}
                                      className="w-20"
                                      placeholder="0"
                                    />
                                  ) : (
                                    <span className="font-medium">{progressReport.progress_percentage || 0}%</span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Progress value={progressReport.progress_percentage || 0} className="flex-1" />
                                    <span className="text-xs text-gray-500 w-8">{progressReport.progress_percentage || 0}%</span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {canEdit ? (
                                    <Textarea
                                      value={progressReport.observations || ''}
                                      onChange={(e) => updateLocalChanges(product.id, { observations: e.target.value })}
                                      placeholder="Observaciones sobre el progreso..."
                                      className="min-h-[60px] resize-none"
                                    />
                                  ) : (
                                    <div className="text-sm text-gray-600 max-w-xs">{progressReport.observations || 'Sin observaciones'}</div>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <EvidenceUploader
                                    productId={product.id}
                                    reportId={reportId}
                                    currentFiles={progressReport.evidence_files || []}
                                    currentFileNames={progressReport.evidence_file_names || []}
                                    onFilesChange={(files, fileNames) => {
                                      updateLocalChanges(product.id, {
                                        evidence_files: files,
                                        evidence_file_names: fileNames
                                      });
                                    }}
                                    disabled={!canEdit}
                                  />
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
