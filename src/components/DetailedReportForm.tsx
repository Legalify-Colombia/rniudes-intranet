import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { useToast } from "@/hooks/use-toast";
import { FileText, Upload, Trash2, Save, AlertCircle } from "lucide-react";

interface DetailedReportFormProps {
  reportId: string;
  customPlanId: string;
  onSave: () => void;
}

export function DetailedReportForm({ reportId, customPlanId, onSave }: DetailedReportFormProps) {
  const {
    fetchCustomPlanAssignments, // <--- La función ahora se llama así
    fetchProductProgressReports,
    upsertProductProgressReport,
    deleteProductProgressReport,
    uploadFile,
    updateManagerReport
  } = useSupabaseData();
  const { toast } = useToast();

  const [assignments, setAssignments] = useState<any[]>([]);
  const [progressReports, setProgressReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [uploadingFiles, setUploadingFiles] = useState<string | null>(null);
  const [errorState, setErrorState] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setErrorState(null);
    try {
      if (!customPlanId) {
        setErrorState("El ID del plan de trabajo no es válido. No se puede cargar el informe.");
        console.error("customPlanId is undefined, cannot load data.");
        setLoading(false);
        return;
      }

      console.log('Loading data for customPlanId:', customPlanId, 'reportId:', reportId);
      
      const [assignmentsResult, progressResult] = await Promise.all([
        fetchCustomPlanAssignments(customPlanId), // <--- La llamada se ha corregido aquí
        fetchProductProgressReports(reportId)
      ]);

      console.log('Assignments result:', assignmentsResult);
      console.log('Progress result:', progressResult);

      setAssignments(assignmentsResult.data || []);
      setProgressReports(progressResult.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
      setErrorState("No se pudieron cargar los datos del informe. Revise su conexión o los permisos.");
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos del informe",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [reportId, customPlanId, fetchCustomPlanAssignments, fetchProductProgressReports, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getProgressReport = (productId: string, assignmentId: string) => {
    return progressReports.find(pr => pr.product_id === productId) || {
      progress_percentage: 0,
      observations: '',
      evidence_files: [],
      evidence_file_names: []
    };
  };

  const updateProgressReport = async (productId: string, assignmentId: string, updates: any) => {
    setSaving(productId);
    try {
      const reportData = {
        manager_report_id: reportId,
        product_id: productId,
        work_plan_assignment_id: assignmentId,
        ...updates
      };

      await upsertProductProgressReport(reportData);
      
      toast({
        title: "Éxito",
        description: "Progreso guardado correctamente",
      });
      
      loadData();
    } catch (error) {
      console.error('Error saving progress:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar el progreso",
        variant: "destructive",
      });
    } finally {
      setSaving(null);
    }
  };

  const handleFileUpload = async (productId: string, assignmentId: string, files: FileList) => {
    setUploadingFiles(productId);
    try {
      const currentReport = getProgressReport(productId, assignmentId);
      const newFiles: string[] = [];
      const newFileNames: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileName = `evidence/${reportId}/${productId}/${Date.now()}_${file.name}`;
        
        const { data, error } = await uploadFile(file, 'reports', fileName);
        if (error) throw error;
        
        newFiles.push(data.publicUrl);
        newFileNames.push(file.name);
      }

      const updatedReport = {
        ...currentReport,
        evidence_files: [...(currentReport.evidence_files || []), ...newFiles],
        evidence_file_names: [...(currentReport.evidence_file_names || []), ...newFileNames]
      };

      await updateProgressReport(productId, assignmentId, updatedReport);
    } catch (error) {
      console.error('Error uploading files:', error);
      toast({
        title: "Error",
        description: "No se pudieron subir los archivos",
        variant: "destructive",
      });
    } finally {
      setUploadingFiles(null);
    }
  };

  const removeEvidence = async (productId: string, assignmentId: string, fileIndex: number) => {
    try {
      const currentReport = getProgressReport(productId, assignmentId);
      const newFiles = [...(currentReport.evidence_files || [])];
      const newFileNames = [...(currentReport.evidence_file_names || [])];
      
      newFiles.splice(fileIndex, 1);
      newFileNames.splice(fileIndex, 1);

      const updatedReport = {
        ...currentReport,
        evidence_files: newFiles,
        evidence_file_names: newFileNames
      };

      await updateProgressReport(productId, assignmentId, updatedReport);
    } catch (error) {
      console.error('Error removing evidence:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la evidencia",
        variant: "destructive",
      });
    }
  };

  const organizeAssignments = () => {
    console.log('Organizing assignments:', assignments);
    
    if (!assignments || assignments.length === 0) {
      return [];
    }

    const organized: any = {};
    
    assignments.forEach(assignment => {
      console.log('Processing assignment:', assignment);
      
      const product = assignment.product;
      if (!product) {
        console.log('No product found in assignment:', assignment);
        return;
      }
      
      const action = assignment.action;
      if (!action) {
        console.log('No action found in assignment:', assignment);
        return;
      }
      
      const axis = assignment.strategic_axis;
      if (!axis) {
        console.log('No strategic_axis found in assignment:', assignment);
        return;
      }
      
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
    
    const result = Object.values(organized);
    console.log('Organized data:', result);
    return result;
  };

  if (loading) {
    return <div className="flex justify-center p-8">Cargando formulario de informe...</div>;
  }

  if (errorState) {
    return (
      <div className="p-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error al cargar el informe</AlertTitle>
          <AlertDescription>{errorState}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const organizedData = organizeAssignments();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Informe Detallado de Progreso</h2>
        <Button onClick={onSave} variant="outline">
          <Save className="h-4 w-4 mr-2" />
          Guardar y Cerrar
        </Button>
      </div>

      {organizedData.length === 0 ? (
        <Alert>
          <FileText className="h-4 w-4" />
          <AlertDescription>
            No hay productos asignados en el plan de trabajo para reportar.
            {assignments.length > 0 && (
              <div className="mt-2 text-sm">
                <p>Datos de debug:</p>
                <p>Asignaciones encontradas: {assignments.length}</p>
                <p>Reportes de progreso: {progressReports.length}</p>
              </div>
            )}
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
                    
                    <div className="space-y-4">
                      {action.products.map((assignment: any) => {
                        const product = assignment.product;
                        const progressReport = assignment.progressReport;
                        
                        return (
                          <Card key={assignment.id} className="border-l-4 border-l-blue-500">
                            <CardContent className="pt-4">
                              <div className="grid gap-4">
                                <div>
                                  <h5 className="font-medium">{product.name}</h5>
                                  <p className="text-sm text-gray-600">
                                    Horas asignadas: {assignment.assigned_hours}
                                  </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-sm font-medium mb-2">
                                      Porcentaje de avance (%)
                                    </label>
                                    <div className="space-y-2">
                                      <Input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={progressReport.progress_percentage}
                                        onChange={(e) => {
                                          const newPercentage = parseInt(e.target.value) || 0;
                                          updateProgressReport(product.id, assignment.id, {
                                            ...progressReport,
                                            progress_percentage: newPercentage
                                          });
                                        }}
                                        disabled={saving === product.id}
                                      />
                                      <Progress value={progressReport.progress_percentage} className="w-full" />
                                    </div>
                                  </div>

                                  <div>
                                    <label className="block text-sm font-medium mb-2">
                                      Evidencias
                                    </label>
                                    <div className="space-y-2">
                                      <Input
                                        type="file"
                                        multiple
                                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                        onChange={(e) => {
                                          if (e.target.files) {
                                            handleFileUpload(product.id, assignment.id, e.target.files);
                                          }
                                        }}
                                        disabled={uploadingFiles === product.id}
                                      />
                                      {progressReport.evidence_file_names?.length > 0 && (
                                        <div className="space-y-1">
                                          {progressReport.evidence_file_names.map((fileName: string, index: number) => (
                                            <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                              <span className="text-sm">{fileName}</span>
                                              <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => removeEvidence(product.id, assignment.id, index)}
                                              >
                                                <Trash2 className="h-3 w-3" />
                                              </Button>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-sm font-medium mb-2">
                                    Observaciones
                                  </label>
                                  <Textarea
                                    value={progressReport.observations || ''}
                                    onChange={(e) => {
                                      updateProgressReport(product.id, assignment.id, {
                                        ...progressReport,
                                        observations: e.target.value
                                      });
                                    }}
                                    placeholder="Describe el progreso, dificultades encontradas, logros obtenidos..."
                                    disabled={saving === product.id}
                                  />
                                </div>

                                {saving === product.id && (
                                  <div className="text-sm text-blue-600">Guardando...</div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
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
