import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { DocumentTemplate } from "@/types/supabase";
import { Plus, Edit, Trash2, FileText } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function DocumentTemplatesManagement() {
  const { toast } = useToast();
  const {
    fetchDocumentTemplates,
    createDocumentTemplate,
    updateDocumentTemplate,
    deleteDocumentTemplate,
  } = useSupabaseData();

  const [documentTemplates, setDocumentTemplates] = useState<DocumentTemplate[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    template_type: "pdf" as "pdf" | "doc",
    template_content: "",
  });

  useEffect(() => {
    loadDocumentTemplates();
  }, []);

  const loadDocumentTemplates = async () => {
    const { data, error } = await fetchDocumentTemplates();
    if (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar las plantillas de documentos",
        variant: "destructive",
      });
    } else {
      setDocumentTemplates(data || []);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile?.id) {
      toast({
        title: "Error",
        description: "No se pudo identificar el usuario",
        variant: "destructive",
      });
      return;
    }

    const templateData = {
      ...formData,
      created_by: profile.id,
      is_active: true
    };

    const { data, error } = await createDocumentTemplate(templateData);
    
    if (error) {
      console.error('Error creating document template:', error);
      toast({
        title: "Error",
        description: "No se pudo crear la plantilla de documento",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Éxito",
        description: "Plantilla de documento creada correctamente",
      });
      setFormData({ name: "", description: "", template_type: "pdf", template_content: "" });
      setIsCreateDialogOpen(false);
      loadDocumentTemplates();
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTemplate) return;

    const { data, error } = await updateDocumentTemplate(selectedTemplate.id, formData);
    
    if (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar la plantilla de documento",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Éxito",
        description: "Plantilla de documento actualizada correctamente",
      });
      setIsEditDialogOpen(false);
      setSelectedTemplate(null);
      loadDocumentTemplates();
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar esta plantilla?")) {
      const { error } = await deleteDocumentTemplate(id);
      
      if (error) {
        toast({
          title: "Error",
          description: "No se pudo eliminar la plantilla de documento",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Éxito",
          description: "Plantilla de documento eliminada correctamente",
        });
        loadDocumentTemplates();
      }
    }
  };

  const openEditDialog = (template: DocumentTemplate) => {
    setSelectedTemplate(template);
    setFormData({
      name: template.name,
      description: template.description || "",
      template_type: template.template_type,
      template_content: template.template_content,
    });
    setIsEditDialogOpen(true);
  };

  const openPreviewDialog = (template: DocumentTemplate) => {
    setSelectedTemplate(template);
    setPreviewDialogOpen(true);
  };

  const getPlaceholderExamples = () => {
    return `
Campos disponibles para usar en las plantillas (usar formato <>):

DATOS DEL GESTOR:
<manager_name> - Nombre completo del gestor
<manager_email> - Email del gestor
<manager_position> - Cargo del gestor
<manager_weekly_hours> - Horas semanales asignadas
<manager_total_hours> - Total de horas asignadas

DATOS DEL PROGRAMA:
<program_name> - Nombre del programa académico
<campus_name> - Nombre del campus
<faculty_name> - Nombre de la facultad
<director_name> - Nombre del director
<director_email> - Email del director

DATOS DEL PLAN DE TRABAJO:
<work_plan_objectives> - Objetivos del plan de trabajo
<work_plan_total_hours> - Total de horas del plan
<work_plan_status> - Estado del plan
<work_plan_submitted_date> - Fecha de envío
<work_plan_approved_date> - Fecha de aprobación

DATOS DEL INFORME:
<report_title> - Título del informe
<report_period> - Período del informe
<report_total_progress> - Progreso total del informe
<report_submitted_date> - Fecha de envío del informe

DATOS DE PRODUCTOS:
<products_list> - Lista de productos con progreso
<products_total_count> - Número total de productos
<products_completed_count> - Número de productos completados

FECHAS:
<current_date> - Fecha actual
<current_year> - Año actual
<current_month> - Mes actual

Ejemplo de uso:
"El gestor <manager_name> del programa <program_name> presenta su informe de progreso correspondiente al período <report_period> con un avance del <report_total_progress>%."
    `;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Plantillas de Documentos PDF/DOC</h3>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="institutional-gradient text-white">
              <Plus className="w-4 h-4 mr-2" />
              Nueva Plantilla
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>Crear Plantilla de Documento</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nombre de la Plantilla</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Nombre de la plantilla"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="template_type">Tipo de Documento</Label>
                  <Select 
                    value={formData.template_type} 
                    onValueChange={(value: "pdf" | "doc") => setFormData(prev => ({ ...prev, template_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="doc">DOC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="description">Descripción (opcional)</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descripción de la plantilla"
                />
              </div>
              <div>
                <Label htmlFor="template_content">Contenido de la Plantilla</Label>
                <Textarea
                  id="template_content"
                  value={formData.template_content}
                  onChange={(e) => setFormData(prev => ({ ...prev, template_content: e.target.value }))}
                  placeholder="Contenido de la plantilla con campos <> para datos dinámicos"
                  rows={8}
                  required
                />
              </div>
              <Alert>
                <AlertDescription>
                  <pre className="text-xs whitespace-pre-wrap">{getPlaceholderExamples()}</pre>
                </AlertDescription>
              </Alert>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="institutional-gradient text-white">
                  Crear Plantilla
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Plantillas de Documentos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Creado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documentTemplates.map((template) => (
                <TableRow key={template.id}>
                  <TableCell className="font-medium">{template.name}</TableCell>
                  <TableCell>
                    <Badge variant={template.template_type === 'pdf' ? 'default' : 'secondary'}>
                      {template.template_type.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>{template.description || '-'}</TableCell>
                  <TableCell>
                    {new Date(template.created_at).toLocaleDateString('es-ES')}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => openPreviewDialog(template)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => openEditDialog(template)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDelete(template.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Editar Plantilla de Documento</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_name">Nombre de la Plantilla</Label>
                <Input
                  id="edit_name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Nombre de la plantilla"
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit_template_type">Tipo de Documento</Label>
                <Select 
                  value={formData.template_type} 
                  onValueChange={(value: "pdf" | "doc") => setFormData(prev => ({ ...prev, template_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="doc">DOC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="edit_description">Descripción (opcional)</Label>
              <Input
                id="edit_description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descripción de la plantilla"
              />
            </div>
            <div>
              <Label htmlFor="edit_template_content">Contenido de la Plantilla</Label>
              <Textarea
                id="edit_template_content"
                value={formData.template_content}
                onChange={(e) => setFormData(prev => ({ ...prev, template_content: e.target.value }))}
                placeholder="Contenido de la plantilla con campos <> para datos dinámicos"
                rows={8}
                required
              />
            </div>
            <Alert>
              <AlertDescription>
                <pre className="text-xs whitespace-pre-wrap">{getPlaceholderExamples()}</pre>
              </AlertDescription>
            </Alert>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="institutional-gradient text-white">
                Actualizar Plantilla
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Vista Previa: {selectedTemplate?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold mb-2">Información de la Plantilla:</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><strong>Tipo:</strong> {selectedTemplate?.template_type.toUpperCase()}</div>
                <div><strong>Descripción:</strong> {selectedTemplate?.description || 'Sin descripción'}</div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Contenido de la Plantilla:</h4>
              <div className="p-4 border rounded-lg bg-white">
                <pre className="whitespace-pre-wrap text-sm">
                  {selectedTemplate?.template_content}
                </pre>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
