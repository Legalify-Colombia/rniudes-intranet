
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { useReportManagement } from "@/hooks/useReportManagement";
import { useToast } from "@/hooks/use-toast";
import { ProgressIndicatorCard } from "./ProgressIndicatorCard";
import { FileText, Save, Send, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface ImprovedDetailedReportFormProps {
  reportId: string;
  workPlanId: string;
  onSave: () => void;
  reportStatus?: string;
}

export function ImprovedDetailedReportForm({ 
  reportId, 
  workPlanId, 
  onSave,
  reportStatus = 'draft' 
}: ImprovedDetailedReportFormProps) {
  const {
    fetchWorkPlanAssignments,
    fetchProductProgressReports
  } = useSupabaseData();
  const {
    upsertProductProgressReport,
    uploadFile,
    updateManagerReport
  } = useReportManagement();
  const { toast } = useToast();

  const [assignments, setAssignments] = useState<any[]>([]);
  const [progressReports, setProgressReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [uploadingFiles, setUploadingFiles] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [overallProgress, setOverallProgress] = useState(0);

  useEffect(() => {
    loadData();
  }, [reportId, workPlanId]);

  useEffect(() => {
    calculateOverallProgress();
  }, [progressReports]);

  const loadData = async () => {
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const calculateOverallProgress = () => {
    if (progressReports.length === 0) {
      setOverallProgress(0);
      return;
    }

    const totalProgress = progressReports.reduce(
      (sum, report) => sum + (report.progress_percentage || 0), 
      0
    );
    const average = totalProgress / progressReports.length;
    setOverallProgress(Math.round(average));
  };

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
      loadData();
      
      toast({
        title: "Éxito",
        description: "Progreso guardado automáticamente",
      });
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
        if (file.size > 10 * 1024 * 1024) { // 10MB limit
          toast({
            title: "Error",
            description: `El archivo ${file.name} es demasiado grande. Máximo 10MB.`,
            variant: "destructive",
          });
          continue;
        }

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
        description: "No se pudieron subir todos los archivos",
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

  const submitReport = async () => {
    setSubmitting(true);
    try {
      // Validar que todos los indicadores tengan al menos algún progreso
      const incompleteIndicators = progressReports.filter(
        report => (report.progress_percentage || 0) === 0
      );

      if (incompleteIndicators.length > 0) {
        toast({
          title: "Advertencia",
          description: `Hay ${incompleteIndicators.length} indicadores sin progreso registrado.`,
          variant: "destructive",
        });
        setSubmitting(false);
        return;
      }

      // Actualizar el estado del informe a "submitted"
      await updateManagerReport(reportId, { status: 'submitted' });

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

  // Organizar asignaciones por eje estratégico
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
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Borrador</Badge>;
      case 'submitted':
        return <Badge variant="default"><Send className="w-3 h-3 mr-1" />Enviado</Badge>;
      case 'reviewed':
        return <Badge variant="default" className="bg-green-600"><CheckCircle className="w-3 h-3 mr-1" />Revisado</Badge>;
      default:
        return <Badge variant="outline">Sin estado</Badge>;
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Cargando formulario de informe...</div>;
  }

  const organizedData = organizeAssignments();
  const canSubmit = reportStatus === 'draft' && progressReports.length > 0;
  const requiresImprovementPlan = overallProgress < 70;

  return (
    <div className="space-y-6">
      {/* Header del informe */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Informe de Progreso</h2>
          <div className="flex items-center gap-4 mt-2">
            {getStatusBadge(reportStatus)}
            <span className="text-sm text-gray-600">
              {assignments.length} indicadores • {progressReports.length} con progreso registrado
            </span>
          </div>
        </div>
        <div className="text-right">
          <Button onClick={onSave} variant="outline" className="mr-2">
            <Save className="h-4 w-4 mr-2" />
            Guardar
          </Button>
          {canSubmit && (
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
              <div className="text-3xl font-bold text-gray-700 mb-2">{progressReports.length}</div>
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
                    
                    <div className="grid gap-4">
                      {action.products.map((assignment: any) => (
                        <ProgressIndicatorCard
                          key={assignment.id}
                          product={assignment.product}
                          assignment={assignment}
                          progressReport={assignment.progressReport}
                          onProgressUpdate={updateProgressReport}
                          onFileUpload={handleFileUpload}
                          onFileRemove={removeEvidence}
                          isLoading={saving === assignment.product.id}
                          isUploading={uploadingFiles === assignment.product.id}
                        />
                      ))}
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
