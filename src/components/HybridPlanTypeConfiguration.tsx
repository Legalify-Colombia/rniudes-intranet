import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { usePlanTypes } from "@/hooks/usePlanTypes";
import { Save, ArrowLeft, Plus, X, Settings, FileText } from "lucide-react";

interface HybridPlanTypeConfigurationProps {
  planType: any;
  onBack: () => void;
  onSave: () => void;
}

export function HybridPlanTypeConfiguration({ planType, onBack, onSave }: HybridPlanTypeConfigurationProps) {
  const { toast } = useToast();
  const { 
    fetchStrategicAxes, 
    fetchActions, 
    fetchProducts,
    fetchPlanTypeElements,
    configurePlanTypeElements,
    fetchPlanFields,
    createPlanField,
    updatePlanField,
    deletePlanField,
  } = useSupabaseData();
  
  const { updatePlanType } = usePlanTypes();

  const [strategicAxes, setStrategicAxes] = useState<any[]>([]);
  const [actions, setActions] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [customFields, setCustomFields] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Configuración de elementos estructurados
  const [selectedElements, setSelectedElements] = useState({
    strategicAxes: [] as string[],
    actions: [] as string[],
    products: [] as string[],
    requiredStrategicAxes: [] as string[],
    requiredActions: [] as string[],
    requiredProducts: [] as string[]
  });

  // Configuración híbrida
  const [hybridConfig, setHybridConfig] = useState({
    allow_custom_fields: planType?.allow_custom_fields || false,
    allow_structured_elements: planType?.allow_structured_elements || false,
  });

  // Nuevo campo personalizado
  const [newField, setNewField] = useState({
    field_name: '',
    field_type: 'text',
    is_required: false,
    dropdown_options: [] as string[],
    field_order: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [axesResult, actionsResult, productsResult, elementsResult, fieldsResult] = await Promise.all([
        fetchStrategicAxes(),
        fetchActions(),
        fetchProducts(),
        fetchPlanTypeElements(planType.id),
        fetchPlanFields(planType.id)
      ]);

      if (axesResult.data) setStrategicAxes(axesResult.data);
      if (actionsResult.data) setActions(actionsResult.data);
      if (productsResult.data) setProducts(productsResult.data);
      if (fieldsResult.data) setCustomFields(fieldsResult.data);

      // Cargar configuración existente de elementos estructurados
      if (elementsResult.data) {
        const existingConfig = elementsResult.data;
        setSelectedElements({
          strategicAxes: existingConfig.strategicAxes?.map((item: any) => item.strategic_axis_id) || [],
          actions: existingConfig.actions?.map((item: any) => item.action_id) || [],
          products: existingConfig.products?.map((item: any) => item.product_id) || [],
          requiredStrategicAxes: existingConfig.strategicAxes?.filter((item: any) => item.is_required).map((item: any) => item.strategic_axis_id) || [],
          requiredActions: existingConfig.actions?.filter((item: any) => item.is_required).map((item: any) => item.action_id) || [],
          requiredProducts: existingConfig.products?.filter((item: any) => item.is_required).map((item: any) => item.product_id) || []
        });
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleElementToggle = (category: string, elementId: string) => {
    setSelectedElements(prev => ({
      ...prev,
      [category]: prev[category as keyof typeof prev].includes(elementId)
        ? prev[category as keyof typeof prev].filter(id => id !== elementId)
        : [...prev[category as keyof typeof prev], elementId]
    }));
  };

  const handleRequiredToggle = (category: string, elementId: string) => {
    const requiredCategory = `required${category.charAt(0).toUpperCase() + category.slice(1)}` as keyof typeof selectedElements;
    setSelectedElements(prev => ({
      ...prev,
      [requiredCategory]: prev[requiredCategory].includes(elementId)
        ? prev[requiredCategory].filter(id => id !== elementId)
        : [...prev[requiredCategory], elementId]
    }));
  };

  const handleAddCustomField = async () => {
    if (!newField.field_name.trim()) {
      toast({
        title: "Error",
        description: "El nombre del campo es requerido",
        variant: "destructive",
      });
      return;
    }

    try {
      const fieldData = {
        ...newField,
        plan_type_id: planType.id,
        field_order: customFields.length + 1
      };

      const result = await createPlanField(fieldData);
      if (result.error) throw result.error;

      setCustomFields(prev => [...prev, result.data]);
      setNewField({
        field_name: '',
        field_type: 'text',
        is_required: false,
        dropdown_options: [],
        field_order: 0
      });

      toast({
        title: "Éxito",
        description: "Campo personalizado agregado correctamente",
      });
    } catch (error) {
      console.error('Error adding custom field:', error);
      toast({
        title: "Error",
        description: "No se pudo agregar el campo personalizado",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCustomField = async (fieldId: string) => {
    try {
      const result = await deletePlanField(fieldId);
      if (result.error) throw result.error;

      setCustomFields(prev => prev.filter(field => field.id !== fieldId));
      toast({
        title: "Éxito",
        description: "Campo personalizado eliminado",
      });
    } catch (error) {
      console.error('Error deleting custom field:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el campo personalizado",
        variant: "destructive",
      });
    }
  };

  const saveConfiguration = async () => {
    try {
      setLoading(true);
      
      // Actualizar configuración híbrida del tipo de plan
      await updatePlanType(planType.id, {
        allow_custom_fields: hybridConfig.allow_custom_fields,
        allow_structured_elements: hybridConfig.allow_structured_elements
      });

      // Guardar configuración de elementos estructurados si está habilitada
      if (hybridConfig.allow_structured_elements) {
        const elementsResult = await configurePlanTypeElements(planType.id, selectedElements);
        if (elementsResult.error) throw elementsResult.error;
      }

      toast({
        title: "Éxito",
        description: "Configuración guardada correctamente",
      });
      onSave();
    } catch (error) {
      console.error('Error saving configuration:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar la configuración",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addDropdownOption = (option: string) => {
    if (option.trim() && !newField.dropdown_options.includes(option.trim())) {
      setNewField(prev => ({
        ...prev,
        dropdown_options: [...prev.dropdown_options, option.trim()]
      }));
    }
  };

  const removeDropdownOption = (optionToRemove: string) => {
    setNewField(prev => ({
      ...prev,
      dropdown_options: prev.dropdown_options.filter(option => option !== optionToRemove)
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Cargando configuración...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Configuración Híbrida: {planType.name}</h2>
        <div className="flex gap-2">
          <Button onClick={saveConfiguration} disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            Guardar Configuración
          </Button>
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </div>
      </div>

      {/* Configuración de habilitación */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuración de Funcionalidades
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="allow_structured_elements">Permitir Elementos Estructurados</Label>
              <p className="text-sm text-gray-600">Habilita la selección de ejes estratégicos, acciones y productos</p>
            </div>
            <Switch
              id="allow_structured_elements"
              checked={hybridConfig.allow_structured_elements}
              onCheckedChange={(checked) => setHybridConfig(prev => ({ ...prev, allow_structured_elements: checked }))}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="allow_custom_fields">Permitir Campos Personalizados</Label>
              <p className="text-sm text-gray-600">Habilita la creación de campos adicionales personalizados</p>
            </div>
            <Switch
              id="allow_custom_fields"
              checked={hybridConfig.allow_custom_fields}
              onCheckedChange={(checked) => setHybridConfig(prev => ({ ...prev, allow_custom_fields: checked }))}
            />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="structured" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="structured" disabled={!hybridConfig.allow_structured_elements}>
            Elementos Estructurados
          </TabsTrigger>
          <TabsTrigger value="custom" disabled={!hybridConfig.allow_custom_fields}>
            Campos Personalizados
          </TabsTrigger>
        </TabsList>

        <TabsContent value="structured" className="space-y-6">
          {hybridConfig.allow_structured_elements ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Ejes Estratégicos */}
              <Card>
                <CardHeader>
                  <CardTitle>Ejes Estratégicos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {strategicAxes.map((axis) => (
                      <div key={axis.id} className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            checked={selectedElements.strategicAxes.includes(axis.id)}
                            onCheckedChange={() => handleElementToggle('strategicAxes', axis.id)}
                          />
                          <label className="text-sm font-medium">{axis.code} - {axis.name}</label>
                        </div>
                        {selectedElements.strategicAxes.includes(axis.id) && (
                          <div className="ml-6">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                checked={selectedElements.requiredStrategicAxes.includes(axis.id)}
                                onCheckedChange={() => handleRequiredToggle('strategicAxes', axis.id)}
                              />
                              <label className="text-xs text-gray-600">Requerido</label>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Acciones */}
              <Card>
                <CardHeader>
                  <CardTitle>Acciones</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {actions.map((action) => (
                      <div key={action.id} className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            checked={selectedElements.actions.includes(action.id)}
                            onCheckedChange={() => handleElementToggle('actions', action.id)}
                          />
                          <label className="text-sm font-medium">{action.code} - {action.name}</label>
                        </div>
                        {selectedElements.actions.includes(action.id) && (
                          <div className="ml-6">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                checked={selectedElements.requiredActions.includes(action.id)}
                                onCheckedChange={() => handleRequiredToggle('actions', action.id)}
                              />
                              <label className="text-xs text-gray-600">Requerido</label>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Productos */}
              <Card>
                <CardHeader>
                  <CardTitle>Productos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {products.map((product) => (
                      <div key={product.id} className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            checked={selectedElements.products.includes(product.id)}
                            onCheckedChange={() => handleElementToggle('products', product.id)}
                          />
                          <label className="text-sm font-medium">{product.name}</label>
                        </div>
                        {selectedElements.products.includes(product.id) && (
                          <div className="ml-6">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                checked={selectedElements.requiredProducts.includes(product.id)}
                                onCheckedChange={() => handleRequiredToggle('products', product.id)}
                              />
                              <label className="text-xs text-gray-600">Requerido</label>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="p-6">
                <p className="text-gray-500 text-center">
                  Los elementos estructurados están deshabilitados para este tipo de plan.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="custom" className="space-y-6">
          {hybridConfig.allow_custom_fields ? (
            <>
              {/* Agregar nuevo campo personalizado */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Agregar Campo Personalizado
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="field_name">Nombre del Campo</Label>
                      <Input
                        id="field_name"
                        value={newField.field_name}
                        onChange={(e) => setNewField(prev => ({ ...prev, field_name: e.target.value }))}
                        placeholder="Ej: Número de horas"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="field_type">Tipo de Campo</Label>
                      <Select 
                        value={newField.field_type} 
                        onValueChange={(value) => setNewField(prev => ({ ...prev, field_type: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">Texto corto</SelectItem>
                          <SelectItem value="textarea">Texto largo</SelectItem>
                          <SelectItem value="number">Numérico</SelectItem>
                          <SelectItem value="dropdown">Selección múltiple</SelectItem>
                          <SelectItem value="file">Archivo adjunto</SelectItem>
                          <SelectItem value="date">Fecha</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {newField.field_type === 'dropdown' && (
                    <div>
                      <Label>Opciones de Selección</Label>
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <Input
                            placeholder="Agregar opción"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                addDropdownOption(e.currentTarget.value);
                                e.currentTarget.value = '';
                              }
                            }}
                          />
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={(e) => {
                              const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                              addDropdownOption(input.value);
                              input.value = '';
                            }}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {newField.dropdown_options.map((option, index) => (
                            <Badge key={index} variant="secondary" className="flex items-center gap-1">
                              {option}
                              <X 
                                className="h-3 w-3 cursor-pointer" 
                                onClick={() => removeDropdownOption(option)}
                              />
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={newField.is_required}
                      onCheckedChange={(checked) => setNewField(prev => ({ ...prev, is_required: checked as boolean }))}
                    />
                    <Label>Campo requerido</Label>
                  </div>

                  <Button onClick={handleAddCustomField} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Campo
                  </Button>
                </CardContent>
              </Card>

              {/* Lista de campos personalizados existentes */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Campos Personalizados Existentes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {customFields.length > 0 ? (
                    <div className="space-y-3">
                      {customFields.map((field) => (
                        <div key={field.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <div className="font-medium">{field.field_name}</div>
                            <div className="text-sm text-gray-600">
                              Tipo: {field.field_type} {field.is_required && <Badge variant="secondary">Requerido</Badge>}
                            </div>
                          </div>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleDeleteCustomField(field.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">
                      No hay campos personalizados configurados
                    </p>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="p-6">
                <p className="text-gray-500 text-center">
                  Los campos personalizados están deshabilitados para este tipo de plan.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}