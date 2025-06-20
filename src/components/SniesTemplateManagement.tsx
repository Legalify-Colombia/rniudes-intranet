
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
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Edit, Trash2, FileText, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseData, SniesReportTemplate, SniesTemplateField } from "@/hooks/useSupabaseData";

export function SniesTemplateManagement() {
  const [templates, setTemplates] = useState<SniesReportTemplate[]>([]);
  const [fields, setFields] = useState<SniesTemplateField[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<SniesReportTemplate | null>(null);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [isFieldDialogOpen, setIsFieldDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<SniesReportTemplate | null>(null);
  const [editingField, setEditingField] = useState<SniesTemplateField | null>(null);
  
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
  } = useSupabaseData();

  const [templateForm, setTemplateForm] = useState({
    name: '',
    description: ''
  });

  const [fieldForm, setFieldForm] = useState({
    field_name: '',
    field_label: '',
    field_type: 'text' as 'text' | 'numeric' | 'relation',
    relation_table: '',
    relation_id_field: '',
    relation_display_field: '',
    is_required: false,
    field_order: 0
  });

  const relationTables = [
    { value: 'snies_document_types', label: 'Tipos de Documento', id_field: 'id', display_field: 'name' },
    { value: 'snies_biological_sex', label: 'Sexo Biológico', id_field: 'id', display_field: 'name' },
    { value: 'snies_marital_status', label: 'Estado Civil', id_field: 'id', display_field: 'name' },
    { value: 'snies_countries', label: 'Países', id_field: 'id', display_field: 'name' },
    { value: 'snies_municipalities', label: 'Municipios', id_field: 'id', display_field: 'name' }
  ];

  useEffect(() => {
    loadTemplates();
  }, []);

  useEffect(() => {
    if (selectedTemplate) {
      loadFields(selectedTemplate.id);
    }
  }, [selectedTemplate]);

  const loadTemplates = async () => {
    try {
      const result = await fetchSniesReportTemplates();
      setTemplates(result.data || []);
    } catch (error) {
      console.error('Error loading templates:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las plantillas",
        variant: "destructive",
      });
    }
  };

  const loadFields = async (templateId: string) => {
    try {
      const result = await fetchSniesTemplateFields(templateId);
      setFields(result.data || []);
    } catch (error) {
      console.error('Error loading fields:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los campos",
        variant: "destructive",
      });
    }
  };

  const handleTemplateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingTemplate) {
        const result = await updateSniesReportTemplate(editingTemplate.id, templateForm);
        if (result.error) throw result.error;
        toast({ title: "Plantilla actualizada correctamente" });
      } else {
        const result = await createSniesReportTemplate(templateForm);
        if (result.error) throw result.error;
        toast({ title: "Plantilla creada correctamente" });
      }

      resetTemplateForm();
      setIsTemplateDialogOpen(false);
      loadTemplates();
    } catch (error) {
      console.error('Error saving template:', error);
      toast({
        title: "Error",
        description: "Error al guardar la plantilla",
        variant: "destructive",
      });
    }
  };

  const handleFieldSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTemplate) return;

    try {
      const fieldData = {
        ...fieldForm,
        template_id: selectedTemplate.id
      };

      if (editingField) {
        const result = await updateSniesTemplateField(editingField.id, fieldData);
        if (result.error) throw result.error;
        toast({ title: "Campo actualizado correctamente" });
      } else {
        const result = await createSniesTemplateField(fieldData);
        if (result.error) throw result.error;
        toast({ title: "Campo creado correctamente" });
      }

      resetFieldForm();
      setIsFieldDialogOpen(false);
      loadFields(selectedTemplate.id);
    } catch (error) {
      console.error('Error saving field:', error);
      toast({
        title: "Error",
        description: "Error al guardar el campo",
        variant: "destructive",
      });
    }
  };

  const resetTemplateForm = () => {
    setTemplateForm({ name: '', description: '' });
    setEditingTemplate(null);
  };

  const resetFieldForm = () => {
    setFieldForm({
      field_name: '',
      field_label: '',
      field_type: 'text',
      relation_table: '',
      relation_id_field: '',
      relation_display_field: '',
      is_required: false,
      field_order: 0
    });
    setEditingField(null);
  };

  const handleDeleteTemplate = async (template: SniesReportTemplate) => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta plantilla?")) return;

    try {
      const result = await deleteSniesReportTemplate(template.id);
      if (result.error) throw result.error;
      
      toast({ title: "Plantilla eliminada correctamente" });
      loadTemplates();
      if (selectedTemplate?.id === template.id) {
        setSelectedTemplate(null);
        setFields([]);
      }
    } catch (error) {
      console.error('Error deleting template:', error);
      toast({
        title: "Error",
        description: "Error al eliminar la plantilla",
        variant: "destructive",
      });
    }
  };

  const handleDeleteField = async (field: SniesTemplateField) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este campo?")) return;

    try {
      const result = await deleteSniesTemplateField(field.id);
      if (result.error) throw result.error;
      
      toast({ title: "Campo eliminado correctamente" });
      if (selectedTemplate) {
        loadFields(selectedTemplate.id);
      }
    } catch (error) {
      console.error('Error deleting field:', error);
      toast({
        title: "Error",
        description: "Error al eliminar el campo",
        variant: "destructive",
      });
    }
  };

  const handleEditTemplate = (template: SniesReportTemplate) => {
    setTemplateForm({
      name: template.name,
      description: template.description || ''
    });
    setEditingTemplate(template);
    setIsTemplateDialogOpen(true);
  };

  const handleEditField = (field: SniesTemplateField) => {
    setFieldForm({
      field_name: field.field_name,
      field_label: field.field_label,
      field_type: field.field_type,
      relation_table: field.relation_table || '',
      relation_id_field: field.relation_id_field || '',
      relation_display_field: field.relation_display_field || '',
      is_required: field.is_required,
      field_order: field.field_order
    });
    setEditingField(field);
    setIsFieldDialogOpen(true);
  };

  const handleRelationTableChange = (tableName: string) => {
    const table = relationTables.find(t => t.value === tableName);
    if (table) {
      setFieldForm(prev => ({
        ...prev,
        relation_table: tableName,
        relation_id_field: table.id_field,
        relation_display_field: table.display_field
      }));
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Templates */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Plantillas SNIES
            </CardTitle>
            <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetTemplateForm} className="institutional-gradient text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Nueva Plantilla
                </Button>
              </DialogTrigger>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.map((template) => (
                <TableRow 
                  key={template.id}
                  className={selectedTemplate?.id === template.id ? "bg-blue-50" : "cursor-pointer hover:bg-gray-50"}
                  onClick={() => setSelectedTemplate(template)}
                >
                  <TableCell className="font-medium">{template.name}</TableCell>
                  <TableCell>{template.description}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); handleEditTemplate(template); }}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); handleDeleteTemplate(template); }}>
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

      {/* Fields */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Campos de la Plantilla
              {selectedTemplate && <Badge variant="outline">{selectedTemplate.name}</Badge>}
            </CardTitle>
            <Dialog open={isFieldDialogOpen} onOpenChange={setIsFieldDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  onClick={resetFieldForm} 
                  disabled={!selectedTemplate}
                  className="institutional-gradient text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo Campo
                </Button>
              </DialogTrigger>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {selectedTemplate ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Orden</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Etiqueta</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Requerido</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fields.map((field) => (
                  <TableRow key={field.id}>
                    <TableCell>{field.field_order}</TableCell>
                    <TableCell className="font-mono text-sm">{field.field_name}</TableCell>
                    <TableCell>{field.field_label}</TableCell>
                    <TableCell>
                      <Badge variant={field.field_type === 'relation' ? 'default' : 'secondary'}>
                        {field.field_type}
                        {field.field_type === 'relation' && field.relation_table && (
                          <span className="ml-1 text-xs">
                            ({relationTables.find(t => t.value === field.relation_table)?.label})
                          </span>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {field.is_required ? <Badge variant="destructive">Sí</Badge> : <Badge variant="outline">No</Badge>}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" onClick={() => handleEditField(field)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDeleteField(field)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Selecciona una plantilla para ver sus campos
            </div>
          )}
        </CardContent>
      </Card>

      {/* Template Dialog */}
      <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? 'Editar Plantilla' : 'Nueva Plantilla SNIES'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleTemplateSubmit} className="space-y-4">
            <div>
              <Label htmlFor="templateName">Nombre</Label>
              <Input
                id="templateName"
                value={templateForm.name}
                onChange={(e) => setTemplateForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nombre de la plantilla"
                required
              />
            </div>
            <div>
              <Label htmlFor="templateDescription">Descripción</Label>
              <Textarea
                id="templateDescription"
                value={templateForm.description}
                onChange={(e) => setTemplateForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descripción de la plantilla"
                rows={3}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsTemplateDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="institutional-gradient text-white">
                {editingTemplate ? 'Actualizar' : 'Crear'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Field Dialog */}
      <Dialog open={isFieldDialogOpen} onOpenChange={setIsFieldDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingField ? 'Editar Campo' : 'Nuevo Campo'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleFieldSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fieldName">Nombre del Campo</Label>
                <Input
                  id="fieldName"
                  value={fieldForm.field_name}
                  onChange={(e) => setFieldForm(prev => ({ ...prev, field_name: e.target.value }))}
                  placeholder="ID_TIPO_DOCUMENTO"
                  required
                />
              </div>
              <div>
                <Label htmlFor="fieldLabel">Etiqueta</Label>
                <Input
                  id="fieldLabel"
                  value={fieldForm.field_label}
                  onChange={(e) => setFieldForm(prev => ({ ...prev, field_label: e.target.value }))}
                  placeholder="Tipo de Documento"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fieldType">Tipo de Campo</Label>
                <Select value={fieldForm.field_type} onValueChange={(value: 'text' | 'numeric' | 'relation') => setFieldForm(prev => ({ ...prev, field_type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Texto</SelectItem>
                    <SelectItem value="numeric">Numérico</SelectItem>
                    <SelectItem value="relation">Relación</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="fieldOrder">Orden</Label>
                <Input
                  id="fieldOrder"
                  type="number"
                  value={fieldForm.field_order}
                  onChange={(e) => setFieldForm(prev => ({ ...prev, field_order: parseInt(e.target.value) }))}
                  min="0"
                />
              </div>
            </div>

            {fieldForm.field_type === 'relation' && (
              <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                <h4 className="font-medium">Configuración de Relación</h4>
                <div>
                  <Label htmlFor="relationTable">Tabla de Relación</Label>
                  <Select value={fieldForm.relation_table} onValueChange={handleRelationTableChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tabla" />
                    </SelectTrigger>
                    <SelectContent>
                      {relationTables.map(table => (
                        <SelectItem key={table.value} value={table.value}>
                          {table.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="relationIdField">Campo ID</Label>
                    <Input
                      id="relationIdField"
                      value={fieldForm.relation_id_field}
                      onChange={(e) => setFieldForm(prev => ({ ...prev, relation_id_field: e.target.value }))}
                      placeholder="id"
                    />
                  </div>
                  <div>
                    <Label htmlFor="relationDisplayField">Campo a Mostrar</Label>
                    <Input
                      id="relationDisplayField"
                      value={fieldForm.relation_display_field}
                      onChange={(e) => setFieldForm(prev => ({ ...prev, relation_display_field: e.target.value }))}
                      placeholder="name"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isRequired"
                checked={fieldForm.is_required}
                onCheckedChange={(checked) => setFieldForm(prev => ({ ...prev, is_required: !!checked }))}
              />
              <Label htmlFor="isRequired">Campo requerido</Label>
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsFieldDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="institutional-gradient text-white">
                {editingField ? 'Actualizar' : 'Crear'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
