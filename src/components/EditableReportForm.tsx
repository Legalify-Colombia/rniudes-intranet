import { useState, useEffect } from "react";
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
import { ProgressIndicatorCard } from "./ProgressIndicatorCard";
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

  useEffect(() => {
    // 💡 CORRECCIÓN: Si workPlanId no existe, desactivamos la carga inmediatamente.
    if (workPlanId) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [reportId, workPlanId]);

  useEffect(() => {
    calculateOverallProgress();
  }, [progressReports, localChanges]);

  const loadData = async () => {
    setLoading(true);
    try {
      console.log('Cargando datos para reportId:', reportId, 'workPlanId (custom_plan_id):', workPlanId);
      const [assignmentsResult, progressResult] = await Promise.all([
        fetchWorkPlanAssignments(workPlanId), // workPlanId es en realidad custom_plan_id
        fetchProductProgressReports(reportId)
      ]);

      console.log('Datos cargados:', { assignmentsResult, progressResult });
      setAssignments(assignmentsResult.data || []);
      setProgressReports(progressResult.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos del informe",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateOverallProgress = () => {
    const allReports = [...progressReports];
    
    // Aplicar cambios locales
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
  };

  const getProgressReport = (productId: string, assignmentId: string) => {
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
  };

  const updateLocalChanges = (productId: string, assignmentId: string, updates: any) => {
    if (isReadOnly) return;
    
    console.log('Actualizando cambios locales:', { productId, updates });
    setLocalChanges(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        ...updates
      }
    }));
  };

  const saveDraft = async () => {
    if (isReadOnly) return;
    
    setSaving(true);
    try {
      console.log('Guardando borrador con cambios locales:', localChanges);
      
      const saveResults = [];
      const saveErrors = [];
      
      for (const productId of Object.keys(localChanges)) {
        try {
          const assignment = assignments.find(a => a.product.id === productId);
          if (!assignment) {
            console.warn('No se encontró assignment para producto:', productId);
            continue;
          }

          const reportData = {
            manager_report_id: reportId,
            product_id: productId,
            custom_plan_assignment_id: assignment.id,
            ...localChanges[productId]
          };

          console.log('Guardando reporte de producto:', reportData);
          const result = await upsertProductProgressReport(reportData);
          
          if (result.error) {
            console.error('Error guardando producto', productId, ':', result.error);
            saveErrors.push({ productId, error: result.error });
          } else {
            console.log('Producto guardado exitosamente:', productId);
            saveResults.push({ productId, data: result.data });
          }
        } catch (error) {
          console.error('Error guardando producto', productId, ':', error);
          saveErrors.push({ productId, error });
        }
      }

      console.log('Resultados del guardado:', { saveResults, saveErrors });
      
      if (saveErrors.length > 0) {
        console.error('Errores al guardar:', saveErrors);
        
        if (saveResults.length === 0) {
          throw new Error(`No se pudo guardar ningún reporte. ${saveErrors.map(e => `Producto ${e.productId}: ${e.error?.message || 'Error desconocido'}`).join(', ')}`);
        } else {
          toast({
            title: "Guardado parcial",
            description: `Se guardaron ${saveResults.length} reportes, pero ${saveErrors.length} fallaron. Intenta guardar nuevamente.`,
            variant: "destructive",
          });
        }
      }
      
      if (saveResults.length > 0) {
        setLocalChanges(prev => {
          const newChanges = { ...prev };
          saveResults.forEach(({ productId }) => {
            delete newChanges[productId];
          });
          return newChanges;
        });
        
        const updateResult = await updateManagerReport(reportId, { 
          status: 'draft',
          updated_at: new Date().toISOString()
        });

        if (updateResult.error) {
          console.error('Error actualizando informe principal:', updateResult.error);
        }
        
        if (saveErrors.length === 0) {
          toast({
            title: "Éxito",
            description: "Borrador guardado correctamente",
          });
        }
        
        await loadData();
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo guardar el borrador",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const submitReport = async () => {
    if (isReadOnly) return;
    
    setSubmitting(true);
    try {
      console.log('Enviando informe...');
      
      if (Object.keys(localChanges).length > 0) {
        console.log('Guardando cambios pendientes antes de enviar...');
        await saveDraft();
      }
      
      const updateResult = await updateManagerReport(reportId, { 
        status: 'submitted',
        submitted_date: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      if (updateResult.error) {
        throw updateResult.error;
      }

      console.log('Informe enviado exitosamente');

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
  };

  const organizeAssignments = () => {
    const organized: any = {};
    
    assignments.forEach(assignment => {
      const product = assignment.product;
      if (!product) return;
      
      const action = product.action;
      const axis = action?.strategic_axis;
      
      if (!axis) return;
      
      if (!organized[axis.id]) {
        organized[axis.id] = {
          ...axis,
          actions: {}
        };
      }
      
      if (!organized[axis.id].actions[action.id]) {
        organized[axis.id].actions[action.id] = {
          ...action,
          products: []
        };
      }
      
      organized[axis.id].actions[action.id].products.push({
        ...assignment,
        progressReport: getProgressReport(product.id, assignment.id)
      });
    });
    
    return Object.values(organized);
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

  if (loading) {
    return <div className="flex justify-center p-8">Cargando formulario de informe...</div>;
  }

  const organizedData = organizeAssignments();
  const canEdit = !isReadOnly && reportStatus === 'draft';
  const hasUnsavedChanges = Object.keys(localChanges).length > 0;
  const requiresImprovementPlan = overallProgress < 70;

  return (
    <div className="space-y-6">
      {/* Header del informe */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">
            {isReadOnly ? 'Vista de Informe de Progreso' : 'Mi Informe de Progreso'}
          </h2>
          <div className="flex items-center gap-4 mt-2">
            {getStatusBadge(reportStatus)}
            <span className="text-sm text-gray-600">
              {assignments.length} indicadores
            </span>
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
              <Button 
                onClick={saveDraft} 
                variant="outline" 
                disabled={saving}
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-2"></div>
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Guardar Borrador
                  </>
                )}
              </Button>
              <Button 
                onClick={submitReport} 
                disabled={submitting}
                className={requiresImprovementPlan ? "bg-yellow-600 hover:bg-yellow-700" : ""}
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Enviar Informe
                  </>
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

      {/* Resumen general del progreso */}
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
                <CardTitle className="text-lg text-blue-800">
                  {axis.code} - {axis.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {Object.values(axis.actions).map((action: any) => (
                  <div key={action.id} className="mb-6">
                    <h4 className="font-medium text-gray-800 mb-4">
                      {action.code} {action.name}
                    </h4>
                    
                    {/* Tabla de indicadores */}
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
                                <TableCell>
                                  <div className="font-medium">{product.name}</div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline">{assignment.assigned_hours}h</Badge>
                                </TableCell>
                                <TableCell>
                                  {canEdit ? (
                                    <Input
                                      type="number"
                                      min="0"
                                      max="100"
                                      value={progressReport.progress_percentage || 0}
                                      onChange={(e) => {
                                        const newPercentage = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
                                        updateLocalChanges(product.id, assignment.id, {
                                          progress_percentage: newPercentage
                                        });
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
                                    <Progress 
                                      value={progressReport.progress_percentage || 0} 
                                      className="flex-1"
                                    />
                                    <span className="text-xs text-gray-500 w-8">
                                      {progressReport.progress_percentage || 0}%
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {canEdit ? (
                                    <Textarea
                                      value={progressReport.observations || ''}
                                      onChange={(e) => {
                                        updateLocalChanges(product.id, assignment.id, {
                                          observations: e.target.value
                                        });
                                      }}
                                      placeholder="Observaciones sobre el progreso..."
                                      className="min-h-[60px] resize-none"
                                  ) : (
                                    <div className="text-sm text-gray-600 max-w-xs">
                                      {progressReport.observations || 'Sin observaciones'}
                                    </div>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <EvidenceUploader
                                    productId={product.id}
                                    reportId={reportId}
                                    currentFiles={progressReport.evidence_files || []}
                                    currentFileNames={progressReport.evidence_file_names || []}
                                    onFilesChange={(files, fileNames) => {
                                      updateLocalChanges(product.id, assignment.id, {
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
