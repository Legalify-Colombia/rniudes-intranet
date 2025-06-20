import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, FileText, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseData, ReportTemplate, StrategicAxis, Action, Product } from "@/hooks/useSupabaseData";

export function ReportTemplatesManagement() {
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [strategicAxes, setStrategicAxes] = useState<StrategicAxis[]>([]);
  const [actions, setActions] = useState<Action[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ReportTemplate | null>(null);
  const { toast } = useToast();

  const {
    fetchReportTemplates,
    createReportTemplate,
    updateReportTemplate,
    deleteReportTemplate,
    fetchStrategicAxes,
    fetchActions,
    fetchProducts,
  } = useSupabaseData();

  const [templateForm, setTemplateForm] = useState({
    name: "",
    description: "",
    strategic_axis_id: "",
    action_id: "",
    product_id: "",
    sharepoint_base_url: "",
    max_versions: 4,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [templatesResult, axesResult, actionsResult, productsResult] = await Promise.all([
        fetchReportTemplates(),
        fetchStrategicAxes(),
        fetchActions(),
        fetchProducts(),
      ]);

      setTemplates(templatesResult.data || []);
      setStrategicAxes(axesResult.data || []);
      setActions(actionsResult.data || []);
      setProducts(productsResult.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las plantillas",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setTemplateForm({
      name: "",
      description: "",
      strategic_axis_id: "",
      action_id: "",
      product_id: "",
      sharepoint_base_url: "",
      max_versions: 4,
    });
    setEditingTemplate(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingTemplate) {
        const { error } = await updateReportTemplate(editingTemplate.id, templateForm);
        if (error) throw error;
        toast({ title: "Plantilla actualizada exitosamente" });
      } else {
        const { error } = await createReportTemplate({
          ...templateForm,
          is_active: true,
          created_by: 'current-user-id' // Este se manejará automáticamente por RLS
        });
        if (error) throw error;
        toast({ title: "Plantilla creada exitosamente" });
      }

      resetForm();
      setIsDialogOpen(false);
      loadData();
    } catch (error) {
      console.error('Error saving template:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar la plantilla",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (template: ReportTemplate) => {
    setTemplateForm({
      name: template.name,
      description: template.description || "",
      strategic_axis_id: template.strategic_axis_id || "",
      action_id: template.action_id || "",
      product_id: template.product_id || "",
      sharepoint_base_url: template.sharepoint_base_url || "",
      max_versions: template.max_versions,
    });
    setEditingTemplate(template);
    setIsDialogOpen(true);
  };

  const handleDelete = async (template: ReportTemplate) => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta plantilla?")) return;

    try {
      const { error } = await deleteReportTemplate(template.id);
      if (error) throw error;
      
      toast({ title: "Plantilla eliminada exitosamente" });
      loadData();
    } catch (error) {
      console.error('Error deleting template:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la plantilla",
        variant: "destructive",
      });
    }
  };

  const filteredActions = actions.filter(action => 
    !templateForm.strategic_axis_id || action.strategic_axis_id === templateForm.strategic_axis_id
  );

  const filteredProducts = products.filter(product => 
    !templateForm.action_id || product.action_id === templateForm.action_id
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Plantillas de Informe
          </CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} className="institutional-gradient text-white">
                <Plus className="w-4 h-4 mr-2" />
                Nueva Plantilla
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingTemplate ? 'Editar Plantilla' : 'Crear Plantilla de Informe'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="templateName">Nombre de la Plantilla</Label>
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

                <div>
                  <Label htmlFor="strategicAxis">Eje Estratégico</Label>
                  <Select 
                    value={templateForm.strategic_axis_id} 
                    onValueChange={(value) => setTemplateForm(prev => ({ 
                      ...prev, 
                      strategic_axis_id: value,
                      action_id: "",
                      product_id: ""
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar eje estratégico" />
                    </SelectTrigger>
                    <SelectContent>
                      {strategicAxes.map((axis) => (
                        <SelectItem key={axis.id} value={axis.id}>
                          {axis.code} - {axis.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="action">Acción</Label>
                  <Select 
                    value={templateForm.action_id} 
                    onValueChange={(value) => setTemplateForm(prev => ({ 
                      ...prev, 
                      action_id: value,
                      product_id: ""
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar acción" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredActions.map((action) => (
                        <SelectItem key={action.id} value={action.id}>
                          {action.code} - {action.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="product">Producto</Label>
                  <Select 
                    value={templateForm.product_id} 
                    onValueChange={(value) => setTemplateForm(prev => ({ ...prev, product_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar producto" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredProducts.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="sharepointUrl">URL Base de SharePoint</Label>
                  <Input
                    id="sharepointUrl"
                    value={templateForm.sharepoint_base_url}
                    onChange={(e) => setTemplateForm(prev => ({ ...prev, sharepoint_base_url: e.target.value }))}
                    placeholder="https://empresa.sharepoint.com/sites/proyecto"
                  />
                </div>

                <div>
                  <Label htmlFor="maxVersions">Máximo de Versiones</Label>
                  <Input
                    id="maxVersions"
                    type="number"
                    min="1"
                    max="10"
                    value={templateForm.max_versions}
                    onChange={(e) => setTemplateForm(prev => ({ ...prev, max_versions: parseInt(e.target.value) }))}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" className="institutional-gradient text-white">
                    {editingTemplate ? 'Actualizar' : 'Crear'} Plantilla
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Plantilla</TableHead>
              <TableHead>Eje / Acción / Producto</TableHead>
              <TableHead>SharePoint</TableHead>
              <TableHead>Max. Versiones</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {templates.map((template) => (
              <TableRow key={template.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{template.name}</div>
                    {template.description && (
                      <div className="text-sm text-gray-500">{template.description}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    {template.strategic_axis && (
                      <Badge variant="outline" className="mr-1">
                        {template.strategic_axis.code}
                      </Badge>
                    )}
                    {template.action && (
                      <Badge variant="secondary" className="mr-1">
                        {template.action.code}
                      </Badge>
                    )}
                    {template.product && (
                      <Badge variant="default" className="mr-1">
                        {template.product.name}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {template.sharepoint_base_url ? (
                    <Badge variant="outline" className="text-blue-600">
                      <Globe className="w-3 h-3 mr-1" />
                      Configurado
                    </Badge>
                  ) : (
                    <span className="text-gray-400">No configurado</span>
                  )}
                </TableCell>
                <TableCell>{template.max_versions}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(template)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDelete(template)}>
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
  );
}
