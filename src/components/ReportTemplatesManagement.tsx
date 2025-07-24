import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Edit, Trash2, FileText, Globe, X, Link } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseData, ReportTemplate, StrategicAxis, Action, Product } from "@/hooks/useSupabaseData";
import { useAuth } from "@/hooks/useAuth";

export function ReportTemplatesManagement() {
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [strategicAxes, setStrategicAxes] = useState<StrategicAxis[]>([]);
  const [actions, setActions] = useState<Action[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [planTypes, setPlanTypes] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ReportTemplate | null>(null);
  const { toast } = useToast();
  const { profile } = useAuth();

  const {
    fetchReportTemplates,
    createReportTemplate,
    updateReportTemplate,
    deleteReportTemplate,
    fetchStrategicAxes,
    fetchActions,
    fetchProducts,
    fetchPlanTypes,
  } = useSupabaseData();

  const [templateForm, setTemplateForm] = useState({
    name: "",
    description: "",
    template_type: "manual",
    linked_plan_type_id: "",
    auto_generate_on_approval: false,
    selected_strategic_axes: [] as string[],
    selected_actions: [] as string[],
    selected_products: [] as string[],
    sharepoint_base_url: "",
    max_versions: 4,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [templatesResult, axesResult, actionsResult, productsResult, planTypesResult] = await Promise.all([
        fetchReportTemplates(),
        fetchStrategicAxes(),
        fetchActions(),
        fetchProducts(),
        fetchPlanTypes(),
      ]);

      setTemplates(templatesResult.data || []);
      setStrategicAxes(axesResult.data || []);
      setActions(actionsResult.data || []);
      setProducts(productsResult.data || []);
      setPlanTypes(planTypesResult.data || []);
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
      template_type: "manual",
      linked_plan_type_id: "",
      auto_generate_on_approval: false,
      selected_strategic_axes: [],
      selected_actions: [],
      selected_products: [],
      sharepoint_base_url: "",
      max_versions: 4,
    });
    setEditingTemplate(null);
  };

  const handleStrategicAxisToggle = (axisId: string) => {
    setTemplateForm(prev => {
      const newSelectedAxes = prev.selected_strategic_axes.includes(axisId)
        ? prev.selected_strategic_axes.filter(id => id !== axisId)
        : [...prev.selected_strategic_axes, axisId];
      
      // Filtrar acciones que pertenecen a los ejes seleccionados
      const validActions = actions.filter(action => 
        newSelectedAxes.includes(action.strategic_axis_id || '')
      ).map(action => action.id);
      
      const filteredSelectedActions = prev.selected_actions.filter(actionId =>
        validActions.includes(actionId)
      );

      // Filtrar productos que pertenecen a las acciones válidas
      const validProducts = products.filter(product =>
        filteredSelectedActions.includes(product.action_id || '')
      ).map(product => product.id);

      const filteredSelectedProducts = prev.selected_products.filter(productId =>
        validProducts.includes(productId)
      );

      return {
        ...prev,
        selected_strategic_axes: newSelectedAxes,
        selected_actions: filteredSelectedActions,
        selected_products: filteredSelectedProducts,
      };
    });
  };

  const handleActionToggle = (actionId: string) => {
    setTemplateForm(prev => {
      const newSelectedActions = prev.selected_actions.includes(actionId)
        ? prev.selected_actions.filter(id => id !== actionId)
        : [...prev.selected_actions, actionId];

      // Filtrar productos que pertenecen a las acciones seleccionadas
      const validProducts = products.filter(product =>
        newSelectedActions.includes(product.action_id || '')
      ).map(product => product.id);

      const filteredSelectedProducts = prev.selected_products.filter(productId =>
        validProducts.includes(productId)
      );

      return {
        ...prev,
        selected_actions: newSelectedActions,
        selected_products: filteredSelectedProducts,
      };
    });
  };

  const handleProductToggle = (productId: string) => {
    setTemplateForm(prev => ({
      ...prev,
      selected_products: prev.selected_products.includes(productId)
        ? prev.selected_products.filter(id => id !== productId)
        : [...prev.selected_products, productId]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile?.id) {
      toast({
        title: "Error",
        description: "No se pudo identificar el usuario",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const templateData = {
        name: templateForm.name,
        description: templateForm.description,
        template_type: templateForm.template_type,
        linked_plan_type_id: templateForm.linked_plan_type_id || null,
        auto_generate_on_approval: templateForm.auto_generate_on_approval,
        strategic_axes_ids: templateForm.selected_strategic_axes,
        actions_ids: templateForm.selected_actions,
        products_ids: templateForm.selected_products,
        sharepoint_base_url: templateForm.sharepoint_base_url,
        max_versions: templateForm.max_versions,
        is_active: true,
      };

      if (editingTemplate) {
        const { error } = await updateReportTemplate(editingTemplate.id, templateData);
        if (error) throw error;
        toast({ title: "Plantilla actualizada exitosamente" });
      } else {
        const { error } = await createReportTemplate({
          ...templateData,
          created_by: profile.id
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
      template_type: (template as any).template_type || "manual",
      linked_plan_type_id: (template as any).linked_plan_type_id || "",
      auto_generate_on_approval: (template as any).auto_generate_on_approval || false,
      selected_strategic_axes: template.strategic_axes_ids || [],
      selected_actions: template.actions_ids || [],
      selected_products: template.products_ids || [],
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

  // Filtrar acciones y productos basado en selecciones
  const availableActions = templateForm.template_type === 'manual' 
    ? actions.filter(action => templateForm.selected_strategic_axes.includes(action.strategic_axis_id || ''))
    : actions;

  const availableProducts = templateForm.template_type === 'manual'
    ? products.filter(product => templateForm.selected_actions.includes(product.action_id || ''))
    : products;

  const removeSelectedAxis = (axisId: string) => {
    handleStrategicAxisToggle(axisId);
  };

  const removeSelectedAction = (actionId: string) => {
    handleActionToggle(actionId);
  };

  const removeSelectedProduct = (productId: string) => {
    handleProductToggle(productId);
  };

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
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingTemplate ? 'Editar Plantilla' : 'Crear Plantilla de Informe'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6">
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

                {/* Configuración de tipo de plantilla */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="templateType">Tipo de Plantilla</Label>
                    <Select 
                      value={templateForm.template_type} 
                      onValueChange={(value) => setTemplateForm(prev => ({ ...prev, template_type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manual">Manual (Ejes/Acciones/Productos)</SelectItem>
                        <SelectItem value="plan_based">Basada en Tipo de Plan</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {templateForm.template_type === 'plan_based' && (
                    <div>
                      <Label htmlFor="linkedPlanType">Tipo de Plan Asociado</Label>
                      <Select 
                        value={templateForm.linked_plan_type_id} 
                        onValueChange={(value) => setTemplateForm(prev => ({ ...prev, linked_plan_type_id: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un tipo de plan" />
                        </SelectTrigger>
                        <SelectContent>
                          {planTypes.map((planType) => (
                            <SelectItem key={planType.id} value={planType.id}>
                              {planType.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                {/* Configuración de auto-generación */}
                {templateForm.template_type === 'plan_based' && templateForm.linked_plan_type_id && (
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label htmlFor="autoGenerate">Generación Automática</Label>
                      <p className="text-sm text-gray-600">
                        Generar automáticamente este informe cuando se apruebe un plan del tipo seleccionado
                      </p>
                    </div>
                    <Switch
                      id="autoGenerate"
                      checked={templateForm.auto_generate_on_approval}
                      onCheckedChange={(checked) => setTemplateForm(prev => ({ ...prev, auto_generate_on_approval: checked }))}
                    />
                  </div>
                )}

                {/* Configuración manual de elementos */}
                {templateForm.template_type === 'manual' && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      <h3 className="text-lg font-semibold">Configuración Manual de Elementos</h3>
                    </div>

                    {/* Ejes Estratégicos */}
                    <div>
                      <Label>Ejes Estratégicos</Label>
                      <div className="border rounded-lg p-4 max-h-48 overflow-y-auto">
                        {strategicAxes.map((axis) => (
                          <div key={axis.id} className="flex items-center space-x-2 mb-2">
                            <Checkbox
                              id={`axis-${axis.id}`}
                              checked={templateForm.selected_strategic_axes.includes(axis.id)}
                              onCheckedChange={() => handleStrategicAxisToggle(axis.id)}
                            />
                            <label htmlFor={`axis-${axis.id}`} className="text-sm">
                              {axis.code} - {axis.name}
                            </label>
                          </div>
                        ))}
                      </div>
                      {templateForm.selected_strategic_axes.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-600 mb-2">Ejes seleccionados:</p>
                          <div className="flex flex-wrap gap-2">
                            {templateForm.selected_strategic_axes.map((axisId) => {
                              const axis = strategicAxes.find(a => a.id === axisId);
                              return (
                                <Badge key={axisId} variant="outline" className="flex items-center gap-1">
                                  {axis?.code}
                                  <X 
                                    className="w-3 h-3 cursor-pointer" 
                                    onClick={() => removeSelectedAxis(axisId)}
                                  />
                                </Badge>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Acciones */}
                    <div>
                      <Label>Acciones</Label>
                      <div className="border rounded-lg p-4 max-h-48 overflow-y-auto">
                        {availableActions.map((action) => (
                          <div key={action.id} className="flex items-center space-x-2 mb-2">
                            <Checkbox
                              id={`action-${action.id}`}
                              checked={templateForm.selected_actions.includes(action.id)}
                              onCheckedChange={() => handleActionToggle(action.id)}
                            />
                            <label htmlFor={`action-${action.id}`} className="text-sm">
                              {action.code} - {action.name}
                            </label>
                          </div>
                        ))}
                        {availableActions.length === 0 && (
                          <p className="text-sm text-gray-500">Selecciona ejes estratégicos primero</p>
                        )}
                      </div>
                      {templateForm.selected_actions.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-600 mb-2">Acciones seleccionadas:</p>
                          <div className="flex flex-wrap gap-2">
                            {templateForm.selected_actions.map((actionId) => {
                              const action = actions.find(a => a.id === actionId);
                              return (
                                <Badge key={actionId} variant="secondary" className="flex items-center gap-1">
                                  {action?.code}
                                  <X 
                                    className="w-3 h-3 cursor-pointer" 
                                    onClick={() => removeSelectedAction(actionId)}
                                  />
                                </Badge>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Productos */}
                    <div>
                      <Label>Productos</Label>
                      <div className="border rounded-lg p-4 max-h-48 overflow-y-auto">
                        {availableProducts.map((product) => (
                          <div key={product.id} className="flex items-center space-x-2 mb-2">
                            <Checkbox
                              id={`product-${product.id}`}
                              checked={templateForm.selected_products.includes(product.id)}
                              onCheckedChange={() => handleProductToggle(product.id)}
                            />
                            <label htmlFor={`product-${product.id}`} className="text-sm">
                              {product.name}
                            </label>
                          </div>
                        ))}
                        {availableProducts.length === 0 && (
                          <p className="text-sm text-gray-500">Selecciona acciones primero</p>
                        )}
                      </div>
                      {templateForm.selected_products.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-600 mb-2">Productos seleccionados:</p>
                          <div className="flex flex-wrap gap-2">
                            {templateForm.selected_products.map((productId) => {
                              const product = products.find(p => p.id === productId);
                              return (
                                <Badge key={productId} variant="default" className="flex items-center gap-1">
                                  {product?.name}
                                  <X 
                                    className="w-3 h-3 cursor-pointer" 
                                    onClick={() => removeSelectedProduct(productId)}
                                  />
                                </Badge>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

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
              <TableHead>Nombre</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Plan Asociado</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {templates.map((template) => (
              <TableRow key={template.id}>
                <TableCell className="font-medium">{template.name}</TableCell>
                <TableCell>{template.description || 'Sin descripción'}</TableCell>
                <TableCell>
                  <Badge variant={
                    (template as any).template_type === 'plan_based' 
                      ? 'default' 
                      : 'secondary'
                  }>
                    {(template as any).template_type === 'plan_based' ? 'Basada en Plan' : 'Manual'}
                  </Badge>
                </TableCell>
                <TableCell>
                  {(template as any).linked_plan_type_id ? (
                    <div className="flex items-center gap-1">
                      <Link className="h-4 w-4" />
                      <span className="text-sm">
                        {planTypes.find(pt => pt.id === (template as any).linked_plan_type_id)?.name || 'Plan no encontrado'}
                      </span>
                      {(template as any).auto_generate_on_approval && (
                        <Badge variant="outline" className="text-xs">Auto</Badge>
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-500">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={template.is_active ? 'default' : 'secondary'}>
                    {template.is_active ? 'Activo' : 'Inactivo'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(template)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(template)}
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
  );
}