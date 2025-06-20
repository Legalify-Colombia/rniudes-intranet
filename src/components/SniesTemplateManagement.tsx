
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Eye, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useSniesReports } from "@/hooks/useSniesReports";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

export function SniesTemplateManagement() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<any | null>(null);
  const [templateFields, setTemplateFields] = useState<any[]>([]);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [isFieldsDialogOpen, setIsFieldsDialogOpen] = useState(false);
  const [isEditingTemplate, setIsEditingTemplate] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { profile } = useAuth();
  const { toast } = useToast();
  const {
    fetchSniesReportTemplates,
    fetchSniesTemplateFields,
    createSniesReportTemplate,
    updateSniesReportTemplate,
    deleteSniesReportTemplate,
    createSniesTemplateField,
    updateSniesTemplateField,
    deleteSniesTemplateField
  } = useSniesReports();

  const [templateForm, setTemplateForm] = useState({
    name: '',
    description: ''
  });

  const [fieldForm, setFieldForm] = useState({
    field_name: '',
    field_label: '',
    field_type: 'text',
    is_required: false,
    relation_table: '',
    field_order: 0
  });

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setIsLoading(true);
      const result = await fetchSniesReportTemplates();
      if (result.error) {
        console.error('Error loading templates:', result.error);
        toast({
          title: "Error",
          description: "No se pudieron cargar las plantillas",
          variant: "destructive",
        });
      } else {
        setTemplates(result.data || []);
      }
    } catch (error) {
      console.error('Error loading templates:', error);
      toast({
        title: "Error",
        description: "Error inesperado al cargar las plantillas",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadTemplateFields = async (templateId: string) => {
    try {
      const result = await fetchSniesTemplateFields(templateId);
      if (result.error) {
        console.error('Error loading fields:', result.error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los campos",
          variant: "destructive",
        });
      } else {
        setTemplateFields(result.data || []);
      }
    } catch (error) {
      console.error('Error loading fields:', error);
      toast({
        title: "Error",
        description: "Error inesperado al cargar los campos",
        variant: "destructive",
      });
    }
  };

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!templateForm.name.trim()) {
      toast({
        title: "Error de validación",
        description: "El nombre de la plantilla es obligatorio",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const result = await createSniesReportTemplate({
        name: templateForm.name.trim(),
        description: templateForm.description.trim() || null,
        created_by: profile?.id,
        is_active: true
      });
      
      if (result.error) {
        console.error('Error creating template:', result.error);
        toast({
          title: "Error",
          description: "Error al crear la plantilla",
          variant: "destructive",
        });
        return;
      }

      toast({ 
        title: "Éxito",
        description: "Plantilla creada correctamente" 
      });
      
      setTemplateForm({ name: '', description: '' });
      setIsTemplateDialogOpen(false);
      await loadTemplates();
    } catch (error) {
      console.error('Unexpected error creating template:', error);
      toast({
        title: "Error",
        description: "Error inesperado al crear la plantilla",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTemplate || !templateForm.name.trim()) {
      toast({
        title: "Error de validación",
        description: "El nombre de la plantilla es obligatorio",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const result = await updateSniesReportTemplate(selectedTemplate.id, {
        name: templateForm.name.trim(),
        description: templateForm.description.trim() || null
      });
      
      if (result.error) {
        console.error('Error updating template:', result.error);
        toast({
          title: "Error",
          description: "Error al actualizar la plantilla",
          variant: "destructive",
        });
        return;
      }

      toast({ 
        title: "Éxito",
        description: "Plantilla actualizada correctamente" 
      });
      
      setTemplateForm({ name: '', description: '' });
      setIsTemplateDialogOpen(false);
      setIsEditingTemplate(false);
      setSelectedTemplate(null);
      await loadTemplates();
    } catch (error) {
      console.error('Unexpected error updating template:', error);
      toast({
        title: "Error",
        description: "Error inesperado al actualizar la plantilla",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm('¿Está seguro de que desea eliminar esta plantilla?')) {
      return;
    }

    try {
      setIsLoading(true);
      const result = await deleteSniesReportTemplate(templateId);
      
      if (result.error) {
        console.error('Error deleting template:', result.error);
        toast({
          title: "Error",
          description: "Error al eliminar la plantilla",
          variant: "destructive",
        });
        return;
      }

      toast({ 
        title: "Éxito",
        description: "Plantilla eliminada correctamente" 
      });
      
      await loadTemplates();
    } catch (error) {
      console.error('Unexpected error deleting template:', error);
      toast({
        title: "Error",
        description: "Error inesperado al eliminar la plantilla",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openEditTemplate = (template: any) => {
    setSelectedTemplate(template);
    setTemplateForm({
      name: template.name,
      description: template.description || ''
    });
    setIsEditingTemplate(true);
    setIsTemplateDialogOpen(true);
  };

  const openNewTemplate = () => {
    setSelectedTemplate(null);
    setTemplateForm({ name: '', description: '' });
    setIsEditingTemplate(false);
    setIsTemplateDialogOpen(true);
  };

  const openTemplateFields = async (template: any) => {
    setSelectedTemplate(template);
    await loadTemplateFields(template.id);
    setIsFieldsDialogOpen(true);
  };

  const handleCreateField = async () => {
    if (!selectedTemplate || !fieldForm.field_name.trim() || !fieldForm.field_label.trim()) {
      toast({
        title: "Error de validación",
        description: "El nombre y etiqueta del campo son obligatorios",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await createSniesTemplateField({
        template_id: selectedTemplate.id,
        field_name: fieldForm.field_name.trim(),
        field_label: fieldForm.field_label.trim(),
        field_type: fieldForm.field_type,
        is_required: fieldForm.is_required,
        relation_table: fieldForm.relation_table || null,
        field_order: fieldForm.field_order
      });
      
      if (result.error) {
        console.error('Error creating field:', result.error);
        toast({
          title: "Error",
          description: "Error al crear el campo",
          variant: "destructive",
        });
        return;
      }

      toast({ 
        title: "Éxito",
        description: "Campo creado correctamente" 
      });
      
      setFieldForm({
        field_name: '',
        field_label: '',
        field_type: 'text',
        is_required: false,
        relation_table: '',
        field_order: templateFields.length
      });
      
      await loadTemplateFields(selectedTemplate.id);
    } catch (error) {
      console.error('Unexpected error creating field:', error);
      toast({
        title: "Error",
        description: "Error inesperado al crear el campo",
        variant: "destructive",
      });
    }
  };

  const handleDeleteField = async (fieldId: string) => {
    if (!confirm('¿Está seguro de que desea eliminar este campo?')) {
      return;
    }

    try {
      const result = await deleteSniesTemplateField(fieldId);
      
      if (result.error) {
        console.error('Error deleting field:', result.error);
        toast({
          title: "Error",
          description: "Error al eliminar el campo",
          variant: "destructive",
        });
        return;
      }

      toast({ 
        title: "Éxito",
        description: "Campo eliminado correctamente" 
      });
      
      if (selectedTemplate) {
        await loadTemplateFields(selectedTemplate.id);
      }
    } catch (error) {
      console.error('Unexpected error deleting field:', error);
      toast({
        title: "Error",
        description: "Error inesperado al eliminar el campo",
        variant: "destructive",
      });
    }
  };

  const getFieldTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      'text': 'Texto',
      'numeric': 'Numérico',
      'date': 'Fecha',
      'relation': 'Relación'
    };
    return types[type] || type;
  };

  if (profile?.role !== 'Administrador') {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No tienes permisos para acceder a esta sección.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Plantillas SNIES
            </CardTitle>
            <Button 
              onClick={openNewTemplate}
              className="institutional-gradient text-white"
              disabled={isLoading}
            >
              <Plus className="w-4 h-4 mr-2" />
              Nueva Plantilla
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>No. de Campos</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha Creación</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.map((template: any) => (
                <TableRow key={template.id}>
                  <TableCell className="font-medium">{template.name}</TableCell>
                  <TableCell className="max-w-xs truncate">{template.description || '-'}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">0 campos</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={template.is_active ? "default" : "secondary"}>
                      {template.is_active ? 'Activa' : 'Inactiva'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(template.created_at).toLocaleDateString('es-ES')}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => openTemplateFields(template)}
                        disabled={isLoading}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => openEditTemplate(template)}
                        disabled={isLoading}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleDeleteTemplate(template.id)}
                        disabled={isLoading}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {templates.length === 0 && !isLoading && (
            <div className="text-center py-8 text-gray-500">
              No hay plantillas SNIES creadas. Haz clic en "Nueva Plantilla" para crear una.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog para crear/editar plantilla */}
      <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isEditingTemplate ? 'Editar Plantilla' : 'Nueva Plantilla SNIES'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={isEditingTemplate ? handleUpdateTemplate : handleCreateTemplate} className="space-y-4">
            <div>
              <Label htmlFor="templateName">
                Nombre de la Plantilla <span className="text-red-500">*</span>
              </Label>
              <Input
                id="templateName"
                value={templateForm.name}
                onChange={(e) => setTemplateForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nombre de la plantilla"
                required
                disabled={isLoading}
                maxLength={255}
              />
            </div>
            <div>
              <Label htmlFor="templateDescription">Descripción</Label>
              <Textarea
                id="templateDescription"
                value={templateForm.description}
                onChange={(e) => setTemplateForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descripción de la plantilla (opcional)"
                disabled={isLoading}
                rows={3}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsTemplateDialogOpen(false)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                className="institutional-gradient text-white"
                disabled={isLoading}
              >
                {isLoading ? 'Guardando...' : (isEditingTemplate ? 'Actualizar' : 'Crear Plantilla')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog para ver/editar campos de plantilla */}
      <Dialog open={isFieldsDialogOpen} onOpenChange={setIsFieldsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>
              Campos de la Plantilla: {selectedTemplate?.name}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Formulario para agregar nuevo campo */}
            <div className="border p-4 rounded-lg bg-gray-50">
              <h4 className="font-medium mb-4">Agregar Nuevo Campo</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fieldName">Nombre del Campo</Label>
                  <Input
                    id="fieldName"
                    value={fieldForm.field_name}
                    onChange={(e) => setFieldForm(prev => ({ ...prev, field_name: e.target.value }))}
                    placeholder="nombre_campo"
                  />
                </div>
                <div>
                  <Label htmlFor="fieldLabel">Etiqueta del Campo</Label>
                  <Input
                    id="fieldLabel"
                    value={fieldForm.field_label}
                    onChange={(e) => setFieldForm(prev => ({ ...prev, field_label: e.target.value }))}
                    placeholder="Etiqueta visible"
                  />
                </div>
                <div>
                  <Label htmlFor="fieldType">Tipo de Campo</Label>
                  <Select 
                    value={fieldForm.field_type} 
                    onValueChange={(value) => setFieldForm(prev => ({ ...prev, field_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Texto</SelectItem>
                      <SelectItem value="numeric">Numérico</SelectItem>
                      <SelectItem value="date">Fecha</SelectItem>
                      <SelectItem value="relation">Relación</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {fieldForm.field_type === 'relation' && (
                  <div>
                    <Label htmlFor="relationTable">Tabla de Relación</Label>
                    <Select 
                      value={fieldForm.relation_table} 
                      onValueChange={(value) => setFieldForm(prev => ({ ...prev, relation_table: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tabla" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="snies_countries">Países</SelectItem>
                        <SelectItem value="snies_municipalities">Municipios</SelectItem>
                        <SelectItem value="snies_document_types">Tipos de Documento</SelectItem>
                        <SelectItem value="snies_biological_sex">Sexo Biológico</SelectItem>
                        <SelectItem value="snies_marital_status">Estado Civil</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <Switch
                    id="fieldRequired"
                    checked={fieldForm.is_required}
                    onCheckedChange={(checked) => setFieldForm(prev => ({ ...prev, is_required: checked }))}
                  />
                  <Label htmlFor="fieldRequired">Campo Obligatorio</Label>
                </div>
                <div>
                  <Label htmlFor="fieldOrder">Orden</Label>
                  <Input
                    id="fieldOrder"
                    type="number"
                    value={fieldForm.field_order}
                    onChange={(e) => setFieldForm(prev => ({ ...prev, field_order: parseInt(e.target.value) || 0 }))}
                    min="0"
                  />
                </div>
              </div>
              <Button 
                onClick={handleCreateField}
                className="mt-4 institutional-gradient text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Agregar Campo
              </Button>
            </div>

            {/* Lista de campos existentes */}
            <div>
              <h4 className="font-medium mb-4">Campos Existentes ({templateFields.length})</h4>
              {templateFields.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Orden</TableHead>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Etiqueta</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Obligatorio</TableHead>
                      <TableHead>Tabla Relación</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {templateFields
                      .sort((a, b) => a.field_order - b.field_order)
                      .map((field: any) => (
                        <TableRow key={field.id}>
                          <TableCell>{field.field_order}</TableCell>
                          <TableCell className="font-mono text-sm">{field.field_name}</TableCell>
                          <TableCell>{field.field_label}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {getFieldTypeLabel(field.field_type)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {field.is_required ? (
                              <Badge variant="destructive">Sí</Badge>
                            ) : (
                              <Badge variant="secondary">No</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-sm">
                            {field.relation_table || '-'}
                          </TableCell>
                          <TableCell>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleDeleteField(field.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No hay campos definidos para esta plantilla.
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
