
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Globe, FileText, Clock, CheckCircle, Edit, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseData, ReportTemplate, ManagerReportVersion } from "@/hooks/useSupabaseData";

interface ReportTemplateFormProps {
  reportId: string;
  template: ReportTemplate;
  existingVersions: ManagerReportVersion[];
  onVersionCreated: () => void;
}

export function ReportTemplateForm({ reportId, template, existingVersions, onVersionCreated }: ReportTemplateFormProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingVersionId, setEditingVersionId] = useState<string | null>(null);
  const { toast } = useToast();

  const {
    createManagerReportVersion,
    updateManagerReportVersion,
    getNextVersionNumber,
  } = useSupabaseData();

  const [versionForm, setVersionForm] = useState({
    progress_percentage: 0,
    sharepoint_folder_url: "",
    evidence_links: [""],
    observations: "",
  });

  const latestVersion = existingVersions
    .filter(v => v.template_id === template.id)
    .sort((a, b) => b.version_number - a.version_number)[0];

  const canCreateNewVersion = !latestVersion || 
    (latestVersion.version_number < template.max_versions && latestVersion.submitted_at);

  const resetForm = () => {
    setVersionForm({
      progress_percentage: latestVersion?.progress_percentage || 0,
      sharepoint_folder_url: template.sharepoint_base_url || "",
      evidence_links: [""],
      observations: "",
    });
    setEditingVersionId(null);
  };

  const addEvidenceLink = () => {
    setVersionForm(prev => ({
      ...prev,
      evidence_links: [...prev.evidence_links, ""]
    }));
  };

  const updateEvidenceLink = (index: number, value: string) => {
    setVersionForm(prev => ({
      ...prev,
      evidence_links: prev.evidence_links.map((link, i) => i === index ? value : link)
    }));
  };

  const removeEvidenceLink = (index: number) => {
    setVersionForm(prev => ({
      ...prev,
      evidence_links: prev.evidence_links.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const filteredEvidenceLinks = versionForm.evidence_links.filter(link => link.trim() !== "");

      if (editingVersionId) {
        // Actualizar versión existente
        const { error } = await updateManagerReportVersion(editingVersionId, {
          progress_percentage: versionForm.progress_percentage,
          sharepoint_folder_url: versionForm.sharepoint_folder_url,
          evidence_links: filteredEvidenceLinks,
          observations: versionForm.observations,
        });
        if (error) throw error;

        toast({
          title: "Versión actualizada exitosamente",
          description: "Los cambios han sido guardados",
        });
      } else {
        // Crear nueva versión
        const { data: nextVersionData, error: versionError } = await getNextVersionNumber(reportId, template.id);
        if (versionError) throw versionError;

        const versionData = {
          manager_report_id: reportId,
          template_id: template.id,
          version_number: nextVersionData,
          progress_percentage: versionForm.progress_percentage,
          sharepoint_folder_url: versionForm.sharepoint_folder_url,
          evidence_links: filteredEvidenceLinks,
          observations: versionForm.observations,
        };

        const { error } = await createManagerReportVersion(versionData);
        if (error) throw error;

        toast({
          title: "Versión creada exitosamente",
          description: `Se ha creado la versión ${nextVersionData} del informe`,
        });
      }

      setIsDialogOpen(false);
      resetForm();
      onVersionCreated();
    } catch (error) {
      console.error('Error saving version:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar la versión del informe",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditVersion = (version: ManagerReportVersion) => {
    setVersionForm({
      progress_percentage: version.progress_percentage || 0,
      sharepoint_folder_url: version.sharepoint_folder_url || "",
      evidence_links: version.evidence_links?.length ? version.evidence_links : [""],
      observations: version.observations || "",
    });
    setEditingVersionId(version.id);
    setIsDialogOpen(true);
  };

  const openSharePointFolder = () => {
    if (template.sharepoint_base_url) {
      window.open(template.sharepoint_base_url, '_blank');
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            <span>{template.name}</span>
          </div>
          <div className="flex items-center gap-2">
            {template.sharepoint_base_url && (
              <Button size="sm" variant="outline" onClick={openSharePointFolder}>
                <Globe className="w-4 h-4 mr-1" />
                SharePoint
              </Button>
            )}
            {canCreateNewVersion && (
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" onClick={resetForm}>
                    <Plus className="w-4 h-4 mr-1" />
                    Nueva Versión
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>
                      {editingVersionId ? 'Editar Versión' : 'Nueva Versión'} - {template.name}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="progress">Porcentaje de Avance (%)</Label>
                      <div className="flex items-center gap-4">
                        <Input
                          id="progress"
                          type="number"
                          min="0"
                          max="100"
                          value={versionForm.progress_percentage}
                          onChange={(e) => setVersionForm(prev => ({ 
                            ...prev, 
                            progress_percentage: parseInt(e.target.value) || 0 
                          }))}
                          className="w-24"
                        />
                        <Progress value={versionForm.progress_percentage} className="flex-1" />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="sharepointFolder">URL de Carpeta SharePoint</Label>
                      <Input
                        id="sharepointFolder"
                        value={versionForm.sharepoint_folder_url}
                        onChange={(e) => setVersionForm(prev => ({ 
                          ...prev, 
                          sharepoint_folder_url: e.target.value 
                        }))}
                        placeholder="URL específica de la carpeta del proyecto"
                      />
                    </div>

                    <div>
                      <Label>Links de Evidencia</Label>
                      {versionForm.evidence_links.map((link, index) => (
                        <div key={index} className="flex gap-2 mb-2">
                          <Input
                            value={link}
                            onChange={(e) => updateEvidenceLink(index, e.target.value)}
                            placeholder="URL del documento de evidencia"
                          />
                          {versionForm.evidence_links.length > 1 && (
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="sm"
                              onClick={() => removeEvidenceLink(index)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        onClick={addEvidenceLink}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Agregar Link
                      </Button>
                    </div>

                    <div>
                      <Label htmlFor="observations">Observaciones</Label>
                      <Textarea
                        id="observations"
                        value={versionForm.observations}
                        onChange={(e) => setVersionForm(prev => ({ 
                          ...prev, 
                          observations: e.target.value 
                        }))}
                        placeholder="Observaciones sobre el progreso..."
                        rows={4}
                      />
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={loading}>
                        {loading ? "Guardando..." : editingVersionId ? "Actualizar" : "Crear"} Versión
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent>
        {template.description && (
          <p className="text-gray-600 mb-4">{template.description}</p>
        )}

        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {template.strategic_axes_ids?.map((axisId, index) => (
              <Badge key={index} variant="outline">Eje {index + 1}</Badge>
            ))}
            {template.actions_ids?.map((actionId, index) => (
              <Badge key={index} variant="secondary">Acción {index + 1}</Badge>
            ))}
            {template.products_ids?.map((productId, index) => (
              <Badge key={index} variant="default">Producto {index + 1}</Badge>
            ))}
          </div>

          <div className="text-sm text-gray-500">
            Máximo {template.max_versions} versiones por período
          </div>
        </div>

        {existingVersions.filter(v => v.template_id === template.id).length > 0 && (
          <div className="mt-4">
            <h4 className="font-medium mb-2">Versiones Creadas:</h4>
            <div className="space-y-2">
              {existingVersions
                .filter(v => v.template_id === template.id)
                .sort((a, b) => b.version_number - a.version_number)
                .map((version) => (
                  <div key={version.id} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Versión {version.version_number}</Badge>
                      <span className="text-sm">{version.progress_percentage}% completado</span>
                      {version.submitted_at && (
                        <Badge variant="default" className="bg-green-600">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Enviado
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">
                        {new Date(version.created_at).toLocaleDateString()}
                      </span>
                      {!version.submitted_at && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleEditVersion(version)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {!canCreateNewVersion && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-sm text-yellow-800">
              {latestVersion?.version_number >= template.max_versions 
                ? "Has alcanzado el máximo de versiones para este período"
                : "Debes enviar la versión actual antes de crear una nueva"
              }
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
