
import React, { useState, useEffect } from 'react';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Upload, Save, Send, FileText, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface TemplateReportFormProps {
  templateId: string;
  periodId: string;
  existingReport?: any;
  onSave?: () => void;
}

const EnhancedTemplateReportForm: React.FC<TemplateReportFormProps> = ({
  templateId,
  periodId,
  existingReport,
  onSave
}) => {
  const { profile } = useAuth();
  const [reportData, setReportData] = useState({
    title: '',
    description: '',
    status: 'draft' as 'draft' | 'submitted'
  });

  const [responses, setResponses] = useState<any[]>([]);
  const [template, setTemplate] = useState<any>(null);
  const [strategicAxes, setStrategicAxes] = useState<any[]>([]);
  const [actions, setActions] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [period, setPeriod] = useState<any>(null);
  const [canEdit, setCanEdit] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    fetchReportTemplates,
    fetchStrategicAxes,
    fetchActions,
    fetchProducts,
    fetchReportPeriods,
    createTemplateBasedReport,
    updateTemplateBasedReport,
    fetchTemplateReportResponses,
    upsertTemplateReportResponse,
    uploadFile,
    checkReportEditPermission
  } = useSupabaseData();

  useEffect(() => {
    loadInitialData();
    if (existingReport) {
      loadExistingReport();
    }
  }, [templateId, periodId, existingReport]);

  const loadInitialData = async () => {
    // Cargar plantilla
    const templatesResult = await fetchReportTemplates();
    const currentTemplate = templatesResult.data?.find(t => t.id === templateId);
    setTemplate(currentTemplate);

    // Cargar período
    const periodsResult = await fetchReportPeriods();
    const currentPeriod = periodsResult.data?.find(p => p.id === periodId);
    setPeriod(currentPeriod);

    // Verificar si puede editar (basado en fecha del período)
    if (existingReport) {
      const editResult = await checkReportEditPermission(existingReport.id);
      setCanEdit(editResult.data || false);
    } else {
      // Para nuevos reportes, verificar si el período está activo
      const today = new Date();
      const periodEnd = new Date(currentPeriod?.end_date || '');
      setCanEdit(today <= periodEnd);
    }

    // Cargar datos estratégicos
    const [axesResult, actionsResult, productsResult] = await Promise.all([
      fetchStrategicAxes(),
      fetchActions(),
      fetchProducts()
    ]);

    setStrategicAxes(axesResult.data || []);
    setActions(actionsResult.data || []);
    setProducts(productsResult.data || []);

    // Inicializar respuestas basadas en la plantilla
    if (currentTemplate) {
      initializeResponses(currentTemplate);
    }
  };

  const loadExistingReport = async () => {
    setReportData({
      title: existingReport.title || '',
      description: existingReport.description || '',
      status: existingReport.status || 'draft'
    });

    // Cargar respuestas existentes
    const responsesResult = await fetchTemplateReportResponses(existingReport.id);
    if (responsesResult.data) {
      setResponses(responsesResult.data);
    }
  };

  const initializeResponses = (template: any) => {
    const initialResponses: any[] = [];

    // Crear respuestas para ejes estratégicos
    if (template.strategic_axes_ids?.length > 0) {
      template.strategic_axes_ids.forEach((axisId: string) => {
        initialResponses.push({
          strategic_axis_id: axisId,
          response_text: '',
          progress_percentage: 0,
          observations: '',
          evidence_files: [],
          evidence_file_names: []
        });
      });
    }

    // Crear respuestas para acciones
    if (template.actions_ids?.length > 0) {
      template.actions_ids.forEach((actionId: string) => {
        initialResponses.push({
          action_id: actionId,
          response_text: '',
          progress_percentage: 0,
          observations: '',
          evidence_files: [],
          evidence_file_names: []
        });
      });
    }

    // Crear respuestas para productos
    if (template.products_ids?.length > 0) {
      template.products_ids.forEach((productId: string) => {
        initialResponses.push({
          product_id: productId,
          response_text: '',
          progress_percentage: 0,
          observations: '',
          evidence_files: [],
          evidence_file_names: []
        });
      });
    }

    // Si hay elementos individuales (compatibilidad)
    if (template.strategic_axis_id) {
      initialResponses.push({
        strategic_axis_id: template.strategic_axis_id,
        response_text: '',
        progress_percentage: 0,
        observations: '',
        evidence_files: [],
        evidence_file_names: []
      });
    }

    if (template.action_id) {
      initialResponses.push({
        action_id: template.action_id,
        response_text: '',
        progress_percentage: 0,
        observations: '',
        evidence_files: [],
        evidence_file_names: []
      });
    }

    if (template.product_id) {
      initialResponses.push({
        product_id: template.product_id,
        response_text: '',
        progress_percentage: 0,
        observations: '',
        evidence_files: [],
        evidence_file_names: []
      });
    }

    setResponses(initialResponses);
  };

  const updateResponse = (index: number, field: string, value: any) => {
    setResponses(prev => prev.map((response, i) => 
      i === index ? { ...response, [field]: value } : response
    ));
  };

  const handleFileUpload = async (index: number, files: FileList) => {
    const uploadPromises = Array.from(files).map(file => uploadFile(file, 'reports'));
    const results = await Promise.all(uploadPromises);
    
    const successfulUploads = results.filter(result => !result.error);
    if (successfulUploads.length === 0) {
      toast.error('Error subiendo archivos');
      return;
    }

    const newFiles = successfulUploads.map(result => result.data!.publicUrl);
    const newFileNames = Array.from(files).slice(0, successfulUploads.length).map(file => file.name);

    updateResponse(index, 'evidence_files', [...(responses[index].evidence_files || []), ...newFiles]);
    updateResponse(index, 'evidence_file_names', [...(responses[index].evidence_file_names || []), ...newFileNames]);

    toast.success(`${successfulUploads.length} archivo(s) subido(s) exitosamente`);
  };

  const removeFile = (responseIndex: number, fileIndex: number) => {
    const response = responses[responseIndex];
    const newFiles = response.evidence_files.filter((_: any, i: number) => i !== fileIndex);
    const newFileNames = response.evidence_file_names.filter((_: any, i: number) => i !== fileIndex);
    
    updateResponse(responseIndex, 'evidence_files', newFiles);
    updateResponse(responseIndex, 'evidence_file_names', newFileNames);
  };

  const calculateOverallProgress = () => {
    if (responses.length === 0) return 0;
    const totalProgress = responses.reduce((sum, response) => sum + (response.progress_percentage || 0), 0);
    return Math.round(totalProgress / responses.length);
  };

  const getItemName = (response: any) => {
    if (response.strategic_axis_id) {
      const axis = strategicAxes.find(a => a.id === response.strategic_axis_id);
      return axis ? `${axis.code} - ${axis.name}` : 'Eje Estratégico';
    }
    if (response.action_id) {
      const action = actions.find(a => a.id === response.action_id);
      return action ? `${action.code} - ${action.name}` : 'Acción';
    }
    if (response.product_id) {
      const product = products.find(p => p.id === response.product_id);
      return product ? product.name : 'Producto';
    }
    return 'Elemento';
  };

  const getItemType = (response: any) => {
    if (response.strategic_axis_id) return 'Eje Estratégico';
    if (response.action_id) return 'Acción';
    if (response.product_id) return 'Producto';
    return 'Elemento';
  };

  const validateReport = () => {
    const errors: string[] = [];
    
    if (!reportData.title.trim()) {
      errors.push('El título del informe es requerido');
    }

    const incompleteResponses = responses.filter(response => 
      !response.response_text?.trim() || response.progress_percentage === 0
    );

    if (incompleteResponses.length > 0) {
      errors.push(`${incompleteResponses.length} elemento(s) no tienen información completa`);
    }

    return errors;
  };

  const handleSave = async (status: 'draft' | 'submitted') => {
    if (!canEdit) {
      toast.error('No puede editar este informe después de la fecha límite del período');
      return;
    }

    const errors = status === 'submitted' ? validateReport() : [];
    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
      return;
    }

    setIsSubmitting(true);

    try {
      let reportId = existingReport?.id;

      if (!reportId) {
        // Crear nuevo informe
        const reportResult = await createTemplateBasedReport({
          report_template_id: templateId,
          report_period_id: periodId,
          title: reportData.title,
          description: reportData.description,
          status,
          submitted_date: status === 'submitted' ? new Date().toISOString() : undefined
        });

        if (reportResult.error) {
          toast.error('Error creando informe');
          return;
        }

        reportId = reportResult.data!.id;
      } else {
        // Actualizar informe existente
        await updateTemplateBasedReport(reportId, {
          title: reportData.title,
          description: reportData.description,
          status,
          submitted_date: status === 'submitted' ? new Date().toISOString() : undefined
        });
      }

      // Guardar respuestas
      for (const response of responses) {
        await upsertTemplateReportResponse({
          template_report_id: reportId,
          ...response
        });
      }

      toast.success(status === 'submitted' ? 'Informe enviado exitosamente' : 'Informe guardado');
      
      if (onSave) {
        onSave();
      }

    } catch (error) {
      toast.error('Error inesperado');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!template || !period) {
    return <div>Cargando...</div>;
  }

  const overallProgress = calculateOverallProgress();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{template.name}</CardTitle>
              <p className="text-muted-foreground mt-2">{template.description}</p>
              <div className="flex gap-2 mt-2">
                <Badge variant="outline">Período: {period.name}</Badge>
                <Badge variant={canEdit ? "default" : "destructive"}>
                  {canEdit ? "Editable" : "Solo lectura"}
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground mb-1">Progreso General</div>
              <div className="flex items-center gap-2">
                <Progress value={overallProgress} className="w-20" />
                <span className="text-sm font-medium">{overallProgress}%</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {!canEdit && (
            <div className="flex items-center gap-2 p-3 bg-yellow-50 text-yellow-800 rounded-lg">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">
                Este informe no puede ser editado porque el período ha finalizado.
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Título del Informe *</label>
              <Input
                value={reportData.title}
                onChange={(e) => setReportData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Título del informe..."
                disabled={!canEdit}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Estado</label>
              <Badge variant={reportData.status === 'submitted' ? 'default' : 'secondary'}>
                {reportData.status === 'submitted' ? 'Enviado' : 'Borrador'}
              </Badge>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Descripción</label>
            <Textarea
              value={reportData.description}
              onChange={(e) => setReportData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descripción general del informe..."
              rows={3}
              disabled={!canEdit}
            />
          </div>

          <Separator />

          {/* Respuestas por elemento */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Elementos del Informe</h3>
            
            {responses.map((response, index) => (
              <Card key={index} className="border-l-4 border-l-blue-500">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{getItemName(response)}</CardTitle>
                      <Badge variant="outline" className="mt-1">
                        {getItemType(response)}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground mb-1">Progreso</div>
                      <div className="flex items-center gap-2">
                        <Progress value={response.progress_percentage || 0} className="w-20" />
                        <span className="text-sm font-medium">{response.progress_percentage || 0}%</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Desarrollo/Respuesta *</label>
                    <Textarea
                      value={response.response_text || ''}
                      onChange={(e) => updateResponse(index, 'response_text', e.target.value)}
                      placeholder="Describe el desarrollo de este elemento..."
                      rows={4}
                      disabled={!canEdit}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Porcentaje de Progreso *</label>
                    <div className="flex items-center gap-4">
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={response.progress_percentage || 0}
                        onChange={(e) => updateResponse(index, 'progress_percentage', parseInt(e.target.value) || 0)}
                        className="w-24"
                        disabled={!canEdit}
                      />
                      <Progress value={response.progress_percentage || 0} className="flex-1" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Observaciones</label>
                    <Textarea
                      value={response.observations || ''}
                      onChange={(e) => updateResponse(index, 'observations', e.target.value)}
                      placeholder="Observaciones adicionales..."
                      rows={2}
                      disabled={!canEdit}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Evidencias</label>
                    {canEdit && (
                      <Input
                        type="file"
                        multiple
                        onChange={(e) => e.target.files && handleFileUpload(index, e.target.files)}
                        className="mb-2"
                      />
                    )}
                    
                    {response.evidence_file_names?.length > 0 && (
                      <div className="space-y-2">
                        {response.evidence_file_names.map((fileName: string, fileIndex: number) => (
                          <div key={fileIndex} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4" />
                              <span className="text-sm">{fileName}</span>
                            </div>
                            {canEdit && (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => removeFile(index, fileIndex)}
                              >
                                Eliminar
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {canEdit && (
            <>
              <Separator />
              <div className="flex gap-4 justify-end">
                <Button 
                  variant="outline"
                  onClick={() => handleSave('draft')}
                  disabled={isSubmitting}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Borrador
                </Button>
                <Button 
                  onClick={() => handleSave('submitted')}
                  disabled={isSubmitting}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Enviar Informe
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedTemplateReportForm;
