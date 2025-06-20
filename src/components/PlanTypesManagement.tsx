
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { Plus, Edit, Trash2, Settings, Save, X } from "lucide-react";
import { PlanType, PlanField, StrategicAxis, Action, Product } from "@/types";

interface PlanFieldForm {
  field_name: string;
  field_type: "numeric" | "short_text" | "long_text" | "dropdown" | "file";
  dropdown_options?: string[];
  is_required: boolean;
  field_order: number;
}

export function PlanTypesManagement() {
  const { toast } = useToast();
  const { 
    fetchPlanTypes, 
    createPlanType, 
    updatePlanType, 
    deletePlanType,
    fetchPlanFields,
    createPlanField,
    updatePlanField,
    deletePlanField,
    fetchStrategicAxes,
    fetchActions,
    fetchProducts,
    configurePlanTypeElements
  } = useSupabaseData();

  const [planTypes, setPlanTypes] = useState<PlanType[]>([]);
  const [strategicAxes, setStrategicAxes] = useState<StrategicAxis[]>([]);
  const [actions, setActions] = useState<Action[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedPlanType, setSelectedPlanType] = useState<PlanType | null>(null);
  const [planFields, setPlanFields] = useState<PlanField[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isCreating, setIsCreating] = useState(false);
  const [editingPlanType, setEditingPlanType] = useState<PlanType | null>(null);
  const [newPlanType, setNewPlanType] = useState({ name: "", description: "" });
  
  const [isCreatingField, setIsCreatingField] = useState(false);
  const [editingField, setEditingField] = useState<PlanField | null>(null);
  const [newField, setNewField] = useState<PlanFieldForm>({
    field_name: "",
    field_type: "short_text",
    dropdown_options: [],
    is_required: false,
    field_order: 0
  });

  const [selectedElements, setSelectedElements] = useState({
    strategic_axes: [] as string[],
    actions: [] as string[],
    products: [] as string[]
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [planTypesResult, axesResult, actionsResult, productsResult] = await Promise.all([
        fetchPlanTypes(),
        fetchStrategicAxes(),
        fetchActions(),
        fetchProducts()
      ]);

      if (planTypesResult.data) setPlanTypes(planTypesResult.data);
      if (axesResult.data) setStrategicAxes(axesResult.data);
      if (actionsResult.data) setActions(actionsResult.data);
      if (productsResult.data) setProducts(productsResult.data);
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

  const loadPlanFields = async (planTypeId: string) => {
    try {
      const result = await fetchPlanFields(planTypeId);
      if (result.data) {
        setPlanFields(result.data);
      }
    } catch (error) {
      console.error('Error loading plan fields:', error);
    }
  };

  const handleCreatePlanType = async () => {
    if (!newPlanType.name.trim()) return;

    try {
      const result = await createPlanType(newPlanType);
      if (result.data) {
        setPlanTypes([...planTypes, result.data]);
        setNewPlanType({ name: "", description: "" });
        setIsCreating(false);
        toast({
          title: "Éxito",
          description: "Tipo de plan creado correctamente",
        });
      }
    } catch (error) {
      console.error('Error creating plan type:', error);
      toast({
        title: "Error",
        description: "No se pudo crear el tipo de plan",
        variant: "destructive",
      });
    }
  };

  const handleCreateField = async () => {
    if (!selectedPlanType || !newField.field_name.trim()) return;

    try {
      const fieldData = {
        ...newField,
        plan_type_id: selectedPlanType.id,
        dropdown_options: newField.field_type === 'dropdown' ? newField.dropdown_options : null
      };

      const result = await createPlanField(fieldData);
      if (result.data) {
        setPlanFields([...planFields, result.data]);
        setNewField({
          field_name: "",
          field_type: "short_text",
          dropdown_options: [],
          is_required: false,
          field_order: 0
        });
        setIsCreatingField(false);
        toast({
          title: "Éxito",
          description: "Campo creado correctamente",
        });
      }
    } catch (error) {
      console.error('Error creating field:', error);
      toast({
        title: "Error",
        description: "No se pudo crear el campo",
        variant: "destructive",
      });
    }
  };

  const handleSaveConfiguration = async () => {
    if (!selectedPlanType) return;

    try {
      await configurePlanTypeElements(selectedPlanType.id, selectedElements);
      toast({
        title: "Éxito",
        description: "Configuración guardada correctamente",
      });
    } catch (error) {
      console.error('Error saving configuration:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar la configuración",
        variant: "destructive",
      });
    }
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
        <div>
          <h1 className="text-2xl font-bold">Configuración de Tipos de Plan</h1>
          <p className="text-gray-600">Gestiona los tipos de planes y sus campos configurables</p>
        </div>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Tipo de Plan
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lista de Tipos de Plan */}
        <Card>
          <CardHeader>
            <CardTitle>Tipos de Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {isCreating && (
                <div className="p-4 border rounded-lg space-y-3">
                  <Input
                    placeholder="Nombre del tipo de plan"
                    value={newPlanType.name}
                    onChange={(e) => setNewPlanType({ ...newPlanType, name: e.target.value })}
                  />
                  <Textarea
                    placeholder="Descripción (opcional)"
                    value={newPlanType.description}
                    onChange={(e) => setNewPlanType({ ...newPlanType, description: e.target.value })}
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleCreatePlanType}>
                      <Save className="h-4 w-4 mr-1" />
                      Guardar
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setIsCreating(false)}>
                      <X className="h-4 w-4 mr-1" />
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}

              {planTypes.map((planType) => (
                <div
                  key={planType.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedPlanType?.id === planType.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => {
                    setSelectedPlanType(planType);
                    loadPlanFields(planType.id);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{planType.name}</h3>
                      {planType.description && (
                        <p className="text-sm text-gray-600">{planType.description}</p>
                      )}
                    </div>
                    <Button size="sm" variant="ghost">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Configuración del Tipo de Plan Seleccionado */}
        {selectedPlanType && (
          <Card>
            <CardHeader>
              <CardTitle>Configurar: {selectedPlanType.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Campos del Plan */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-base font-medium">Campos del Plan</Label>
                  <Button size="sm" onClick={() => setIsCreatingField(true)}>
                    <Plus className="h-4 w-4 mr-1" />
                    Agregar Campo
                  </Button>
                </div>

                {isCreatingField && (
                  <div className="p-3 border rounded-lg space-y-3 mb-3">
                    <Input
                      placeholder="Nombre del campo"
                      value={newField.field_name}
                      onChange={(e) => setNewField({ ...newField, field_name: e.target.value })}
                    />
                    <Select
                      value={newField.field_type}
                      onValueChange={(value: any) => setNewField({ ...newField, field_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Tipo de campo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="numeric">Numérico</SelectItem>
                        <SelectItem value="short_text">Texto Corto</SelectItem>
                        <SelectItem value="long_text">Texto Extenso</SelectItem>
                        <SelectItem value="dropdown">Lista Desplegable</SelectItem>
                        <SelectItem value="file">Archivo</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    {newField.field_type === 'dropdown' && (
                      <Textarea
                        placeholder="Opciones (una por línea)"
                        value={newField.dropdown_options?.join('\n') || ''}
                        onChange={(e) => setNewField({ 
                          ...newField, 
                          dropdown_options: e.target.value.split('\n').filter(option => option.trim())
                        })}
                      />
                    )}

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="required"
                        checked={newField.is_required}
                        onCheckedChange={(checked) => setNewField({ ...newField, is_required: !!checked })}
                      />
                      <Label htmlFor="required">Campo requerido</Label>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleCreateField}>
                        <Save className="h-4 w-4 mr-1" />
                        Guardar
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setIsCreatingField(false)}>
                        <X className="h-4 w-4 mr-1" />
                        Cancelar
                      </Button>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  {planFields.map((field) => (
                    <div key={field.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium">{field.field_name}</span>
                          <span className="ml-2 text-sm text-gray-500">
                            ({field.field_type === 'numeric' ? 'Numérico' :
                              field.field_type === 'short_text' ? 'Texto Corto' :
                              field.field_type === 'long_text' ? 'Texto Extenso' :
                              field.field_type === 'dropdown' ? 'Lista' : 'Archivo'})
                          </span>
                          {field.is_required && (
                            <span className="ml-2 text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
                              Requerido
                            </span>
                          )}
                        </div>
                        <Button size="sm" variant="ghost">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Configuración de Elementos Estratégicos */}
              <div>
                <Label className="text-base font-medium">Elementos Estratégicos Disponibles</Label>
                
                <div className="space-y-4 mt-3">
                  <div>
                    <Label className="text-sm">Ejes Estratégicos</Label>
                    <div className="grid grid-cols-1 gap-2 mt-2 max-h-32 overflow-y-auto">
                      {strategicAxes.map((axis) => (
                        <div key={axis.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`axis-${axis.id}`}
                            checked={selectedElements.strategic_axes.includes(axis.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedElements({
                                  ...selectedElements,
                                  strategic_axes: [...selectedElements.strategic_axes, axis.id]
                                });
                              } else {
                                setSelectedElements({
                                  ...selectedElements,
                                  strategic_axes: selectedElements.strategic_axes.filter(id => id !== axis.id)
                                });
                              }
                            }}
                          />
                          <Label htmlFor={`axis-${axis.id}`} className="text-sm">{axis.name}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm">Acciones</Label>
                    <div className="grid grid-cols-1 gap-2 mt-2 max-h-32 overflow-y-auto">
                      {actions.map((action) => (
                        <div key={action.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`action-${action.id}`}
                            checked={selectedElements.actions.includes(action.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedElements({
                                  ...selectedElements,
                                  actions: [...selectedElements.actions, action.id]
                                });
                              } else {
                                setSelectedElements({
                                  ...selectedElements,
                                  actions: selectedElements.actions.filter(id => id !== action.id)
                                });
                              }
                            }}
                          />
                          <Label htmlFor={`action-${action.id}`} className="text-sm">{action.name}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm">Productos</Label>
                    <div className="grid grid-cols-1 gap-2 mt-2 max-h-32 overflow-y-auto">
                      {products.map((product) => (
                        <div key={product.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`product-${product.id}`}
                            checked={selectedElements.products.includes(product.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedElements({
                                  ...selectedElements,
                                  products: [...selectedElements.products, product.id]
                                });
                              } else {
                                setSelectedElements({
                                  ...selectedElements,
                                  products: selectedElements.products.filter(id => id !== product.id)
                                });
                              }
                            }}
                          />
                          <Label htmlFor={`product-${product.id}`} className="text-sm">{product.name}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <Button onClick={handleSaveConfiguration} className="w-full mt-4">
                  <Save className="h-4 w-4 mr-2" />
                  Guardar Configuración
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
