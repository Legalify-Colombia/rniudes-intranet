
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
    fetchReportTemplates,
    updateTemplateBasedReport,
    submitTemplateBasedReport,
    uploadFile
  } = useSupabaseData();

  const [report, setReport] = useState<any>(null);
  const [templates, setTemplates] = useState<any[]>([]);
  const [versions, setVersions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, [reportId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [reportResult, templatesResult] = await Promise.all([
        fetchTemplateBasedReportDetails(reportId),
        fetchReportTemplates()
      ]);

      if (reportResult.data) {
        setReport(reportResult.data);
        setVersions(reportResult.data.versions || []);
      }

      setTemplates(templatesResult.data || []);
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Plantillas del Informe
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1/4">Título del Indicador</TableHead>
                  <TableHead className="w-2/5">Campo de Reporte</TableHead>
                  <TableHead className="w-1/3">Observaciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.map((template) => {
                  const versionData = getVersionData(template.id);
                  return (
                    <TableRow key={template.id}>
                      <TableCell className="align-top">
                        <div className="space-y-2">
                          <p className="font-medium">{template.name}</p>
                          {template.description && (
                            <p className="text-sm text-gray-600">{template.description}</p>
                          )}
                          <div className="flex flex-wrap gap-1">
                            {template.strategic_axes_ids?.map((axisId: string, index: number) => (
                              <Badge key={index} variant="outline">Eje {index + 1}</Badge>
                            ))}
                          </div>
                          {template.sharepoint_base_url && (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => window.open(template.sharepoint_base_url, '_blank')}
                            >
                              <Globe className="w-4 h-4 mr-1" />
                              SharePoint
                            </Button>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="align-top">
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium mb-1">
                              Porcentaje de avance (%)
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

                          <div>
                            <label className="block text-sm font-medium mb-1">
                              Evidencias
                            </label>
                            <Input
                              type="file"
                              multiple
                              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                              onChange={(e) => {
                                if (e.target.files) {
                                  handleFileUpload(template.id, e.target.files);
                                }
                              }}
                            />
                            {versionData.evidence_links?.length > 0 && (
                              <div className="mt-2 space-y-1">
                                {versionData.evidence_links.map((link: string, index: number) => (
                                  <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded text-sm">
                                    <span>Evidencia {index + 1}</span>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        const newLinks = [...versionData.evidence_links];
                                        newLinks.splice(index, 1);
                                        updateVersionData(template.id, 'evidence_links', newLinks);
                                      }}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="align-top">
                        <Textarea
                          value={versionData.observations || ''}
                          onChange={(e) => updateVersionData(template.id, 'observations', e.target.value)}
                          placeholder="Observaciones sobre el progreso..."
                          rows={4}
                          className="w-full"
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
