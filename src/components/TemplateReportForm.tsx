
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { useReportTemplates } from "@/hooks/useReportTemplates";
import { useReportManagement } from "@/hooks/useReportManagement";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft, Save, Send, FileText, Upload, Trash2, Globe } from "lucide-react";

interface TemplateReportFormProps {
  reportId: string;
  onSave: () => void;
}

export function TemplateReportForm({ reportId, onSave }: TemplateReportFormProps) {
  const { profile } = useAuth();
  const { toast } = useToast();
  const {
    fetchTemplateBasedReportDetails,
    updateTemplateBasedReport,
    submitTemplateBasedReport,
    uploadFile
  } = useReportManagement();

  const { fetchReportTemplates } = useReportTemplates();
  const {
    fetchStrategicAxes,
    fetchActions,
    fetchProducts
  } = useSupabaseData();

  const [report, setReport] = useState<any>(null);
  const [templates, setTemplates] = useState<any[]>([]);
  const [strategicAxes, setStrategicAxes] = useState<any[]>([]);
  const [actions, setActions] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [versions, setVersions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, [reportId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [reportResult, templatesResult, axesResult, actionsResult, productsResult] = await Promise.all([
        fetchTemplateBasedReportDetails(reportId),
        fetchReportTemplates(),
        fetchStrategicAxes(),
        fetchActions(),
        fetchProducts()
      ]);

      if (reportResult.data) {
        setReport(reportResult.data);
        setVersions(reportResult.data.versions || []);
      }

      setTemplates(templatesResult.data || []);
      setStrategicAxes(axesResult.data || []);
      setActions(actionsResult.data || []);
      setProducts(productsResult.data || []);
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

  const handleSave = async () => {
    if (!report) return;

    setSaving(true);
    try {
      await updateTemplateBasedReport(reportId, {
        ...report,
        versions: versions
      });

      toast({
        title: "Éxito",
        description: "Borrador guardado correctamente",
      });
    } catch (error) {
      console.error('Error saving report:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar el borrador",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!reportId) return;

    try {
      await submitTemplateBasedReport(reportId);
      toast({
        title: "Éxito",
        description: "Informe enviado correctamente",
      });
      onSave();
    } catch (error) {
      console.error('Error submitting report:', error);
      toast({
        title: "Error",
        description: "No se pudo enviar el informe",
        variant: "destructive",
      });
    }
  };

  const updateVersionData = (templateId: string, field: string, value: any) => {
    setVersions(prev => {
      const existing = prev.find(v => v.template_id === templateId);
      if (existing) {
        return prev.map(v => v.template_id === templateId ? { ...v, [field]: value } : v);
      } else {
        return [...prev, {
          template_id: templateId,
          version_number: 1,
          [field]: value,
          progress_percentage: 0,
          observations: '',
          evidence_links: []
        }];
      }
    });
  };

  const getVersionData = (templateId: string) => {
    return versions.find(v => v.template_id === templateId) || {
      progress_percentage: 0,
      sharepoint_folder_url: '',
      evidence_links: [],
      observations: ''
    };
  };

  const handleFileUpload = async (templateId: string, files: FileList) => {
    try {
      const newLinks: string[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileName = `evidence/${reportId}/${templateId}/${Date.now()}_${file.name}`;
        
        const { data, error } = await uploadFile(file, 'reports', fileName);
        if (error) throw error;
        
        newLinks.push(data.publicUrl);
      }

      const currentData = getVersionData(templateId);
      updateVersionData(templateId, 'evidence_links', [
        ...(currentData.evidence_links || []),
        ...newLinks
      ]);

      toast({
        title: "Éxito",
        description: "Evidencias subidas correctamente",
      });
    } catch (error) {
      console.error('Error uploading files:', error);
      toast({
        title: "Error",
        description: "No se pudieron subir las evidencias",
        variant: "destructive",
      });
    }
  };

  const getElementsForTemplate = (template: any) => {
    const elements = [];
    
    // Agregar ejes estratégicos
    if (template.strategic_axes_ids && template.strategic_axes_ids.length > 0) {
      template.strategic_axes_ids.forEach((axisId: string) => {
        const axis = strategicAxes.find(a => a.id === axisId);
        if (axis) {
          elements.push({
            type: 'axis',
            id: axis.id,
            code: axis.code,
            name: axis.name,
            fullName: `${axis.code} - ${axis.name}`
          });
        }
      });
    }

    // Agregar acciones
    if (template.actions_ids && template.actions_ids.length > 0) {
      template.actions_ids.forEach((actionId: string) => {
        const action = actions.find(a => a.id === actionId);
        if (action) {
          const axis = strategicAxes.find(ax => ax.id === action.strategic_axis_id);
          elements.push({
            type: 'action',
            id: action.id,
            code: action.code,
            name: action.name,
            fullName: `${action.code} - ${action.name}`,
            axisName: axis ? `${axis.code} - ${axis.name}` : 'Sin eje'
          });
        }
      });
    }

    // Agregar productos
    if (template.products_ids && template.products_ids.length > 0) {
      template.products_ids.forEach((productId: string) => {
        const product = products.find(p => p.id === productId);
        if (product) {
          const action = actions.find(a => a.id === product.action_id);
          const axis = action ? strategicAxes.find(ax => ax.id === action.strategic_axis_id) : null;
          
          elements.push({
            type: 'product',
            id: product.id,
            name: product.name,
            fullName: product.name,
            actionName: action ? `${action.code} - ${action.name}` : 'Sin acción',
            axisName: axis ? `${axis.code} - ${axis.name}` : 'Sin eje'
          });
        }
      });
    }

    return elements;
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
      {/* Header del informe */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onSave}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Mis Informes
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Informe por Plantilla</h1>
            <p className="text-gray-600">Complete las plantillas asignadas</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleSave}
            disabled={saving || report?.status !== 'draft'}
          >
            <Save className="h-4 w-4 mr-2" />
            Guardar Borrador
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={report?.status !== 'draft'}
            className="institutional-gradient text-white"
          >
            <Send className="h-4 w-4 mr-2" />
            Enviar Informe
          </Button>
        </div>
      </div>

      {/* Plantillas del Informe */}
      {templates.map((template) => {
        const versionData = getVersionData(template.id);
        const elements = getElementsForTemplate(template);

        return (
          <Card key={template.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {template.name}
              </CardTitle>
              {template.description && (
                <p className="text-sm text-gray-600">{template.description}</p>
              )}
            </CardHeader>
            <CardContent>
              {elements.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Eje Estratégico</TableHead>
                        <TableHead>Acción</TableHead>
                        <TableHead>Indicador/Producto</TableHead>
                        <TableHead>Progreso (%)</TableHead>
                        <TableHead>URL Evidencia</TableHead>
                        <TableHead>Evidencia Adjunta</TableHead>
                        <TableHead>Observaciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {elements.map((element, index) => (
                        <TableRow key={`${element.type}-${element.id}-${index}`}>
                          <TableCell>
                            <Badge 
                              variant={element.type === 'axis' ? 'default' : element.type === 'action' ? 'secondary' : 'outline'}
                            >
                              {element.type === 'axis' ? 'Eje' : element.type === 'action' ? 'Acción' : 'Producto'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {element.axisName || (element.type === 'axis' ? element.fullName : '-')}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {element.actionName || (element.type === 'action' ? element.fullName : '-')}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm font-medium">
                              {element.type === 'product' ? element.name : element.fullName}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                value={versionData[`${element.type}_${element.id}_progress`] || 0}
                                onChange={(e) => updateVersionData(template.id, `${element.type}_${element.id}_progress`, parseInt(e.target.value) || 0)}
                                className="w-20"
                              />
                              <Progress 
                                value={versionData[`${element.type}_${element.id}_progress`] || 0} 
                                className="w-24" 
                              />
                            </div>
                          </TableCell>
                          <TableCell>
                            <Input
                              value={versionData[`${element.type}_${element.id}_url`] || ''}
                              onChange={(e) => updateVersionData(template.id, `${element.type}_${element.id}_url`, e.target.value)}
                              placeholder="URL de evidencia"
                              className="w-48"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="file"
                              multiple
                              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                              onChange={(e) => {
                                if (e.target.files) {
                                  handleFileUpload(`${element.type}_${element.id}`, e.target.files);
                                }
                              }}
                              className="w-48"
                            />
                            {versionData[`${element.type}_${element.id}_files`]?.length > 0 && (
                              <div className="mt-1 text-xs text-gray-600">
                                {versionData[`${element.type}_${element.id}_files`].length} archivo(s)
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <Textarea
                              value={versionData[`${element.type}_${element.id}_observations`] || ''}
                              onChange={(e) => updateVersionData(template.id, `${element.type}_${element.id}_observations`, e.target.value)}
                              placeholder="Observaciones..."
                              rows={2}
                              className="w-64"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Esta plantilla no tiene elementos específicos configurados</p>
                  <p className="text-sm">Configure ejes, acciones o productos en la plantilla</p>
                </div>
              )}

              {/* Información general de la plantilla */}
              <div className="mt-6 pt-6 border-t">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Porcentaje General de Avance (%)
                    </label>
                    <div className="space-y-2">
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={versionData.progress_percentage || 0}
                        onChange={(e) => updateVersionData(template.id, 'progress_percentage', parseInt(e.target.value) || 0)}
                        className="w-24"
                      />
                      <Progress value={versionData.progress_percentage || 0} className="w-full" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      URL Carpeta SharePoint
                    </label>
                    <Input
                      value={versionData.sharepoint_folder_url || ''}
                      onChange={(e) => updateVersionData(template.id, 'sharepoint_folder_url', e.target.value)}
                      placeholder="URL específica del proyecto"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium mb-1">
                    Observaciones Generales
                  </label>
                  <Textarea
                    value={versionData.observations || ''}
                    onChange={(e) => updateVersionData(template.id, 'observations', e.target.value)}
                    placeholder="Observaciones generales sobre el progreso de la plantilla..."
                    rows={3}
                    className="w-full"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
