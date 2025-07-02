
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { Plus, Edit, Trash2, Settings, Save, X, Eye, EyeOff } from "lucide-react";
import { PlanType, PlanField, StrategicAxis, Action, Product } from "@/types";
import { PlanTypeElementsConfiguration } from "./PlanTypeElementsConfiguration";

interface PlanFieldForm {
  field_name: string;
  field_type: "numeric" | "short_text" | "long_text" | "dropdown" | "file" | "section" | "manager_name" | "campus_name" | "program_director" | "strategic_axes";
  dropdown_options?: string[];
  is_required: boolean;
  field_order: number;
}

export function PlanTypesManagement() {
  const { toast } = useToast();
  const { profile } = useAuth();
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

  const [planTypes, setPlanTypes] = useState<(PlanType & { field_count?: number })[]>([]);
  const [strategicAxes, setStrategicAxes] = useState<StrategicAxis[]>([]);
  const [actions, setActions] = useState<Action[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedPlanType, setSelectedPlanType] = useState<PlanType | null>(null);
  const [planFields, setPlanFields] = useState<PlanField[]>([]);
  const [loading, setLoading] = useState(true);
  const [configMode, setConfigMode] = useState<'fields' | 'elements'>('fields');
  
  const [isCreating, setIsCreating] = useState(false);
  const [editingPlanType, setEditingPlanType] = useState<PlanType | null>(null);
  const [newPlanType, setNewPlanType] = useState({ 
    name: "", 
    description: "",
    min_weekly_hours: 0,
    max_weekly_hours: null as number | null,
    is_visible: true,
    uses_structured_elements: false
  });
  
  const [isCreatingField, setIsCreatingField] = useState(false);
  const [editingField, setEditingField] = useState<PlanField | null>(null);
  const [newField, setNewField] = useState<PlanFieldForm>({
    field_name: "",
    field_type: "short_text",
    dropdown_options: [],
    is_required: false,
    field_order: 0
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

      if (planTypesResult.data) {
        // Obtener conteo de campos para cada tipo de plan
        const planTypesWithCount = await Promise.all(
          planTypesResult.data.map(async (planType) => {
            const fieldsResult = await fetchPlanFields(planType.id);
            return {
              ...planType,
              field_count: fieldsResult.data?.length || 0
            };
          })
        );
        setPlanTypes(planTypesWithCount);
      }
      
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
        setPlanFields(result.data.sort((a, b) => a.field_order - b.field_order));
      }
    } catch (error) {
      console.error('Error loading plan fields:', error);
    }
  };

  const handleCreatePlanType = async () => {
    if (!newPlanType.name.trim()) {
      toast({
        title: "Error",
        description: "El nombre del tipo de plan es requerido",
        variant: "destructive",
      });
      return;
    }

    if (!profile?.id) {
      toast({
        title: "Error",
        description: "Usuario no autenticado",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await createPlanType({
        ...newPlanType,
        created_by: profile.id
      });
      
      if (result.error) {
        console.error('Error creating plan type:', result.error);
        toast({
          title: "Error",
          description: "No se pudo crear el tipo de plan: " + result.error.message,
          variant: "destructive",
        });
        return;
      }

      if (result.data) {
        const newTypeWithCount = { ...result.data, field_count: 0 };
        setPlanTypes([...planTypes, newTypeWithCount]);
        setNewPlanType({ 
          name: "", 
          description: "",
          min_weekly_hours: 0,
          max_weekly_hours: null,
          is_visible: true,
          uses_structured_elements: false
        });
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
        description: "Error inesperado al crear el tipo de plan",
        variant: "destructive",
      });
    }
  };

  const handleUpdatePlanType = async (planType: PlanType & { field_count?: number }) => {
    try {
      const updateData = {
        name: planType.name,
        description: planType.description,
        min_weekly_hours: planType.min_weekly_hours,
        max_weekly_hours: planType.max_weekly_hours,
        is_visible: planType.is_visible,
        uses_structured_elements: planType.uses_structured_elements
      };

      const result = await updatePlanType(planType.id, updateData);
      if (result.data) {
        setPlanTypes(planTypes.map(pt => 
          pt.id === planType.id ? { ...result.data, field_count: pt.field_count } : pt
        ));
        setEditingPlanType(null);
        toast({
          title: "Éxito",
          description: "Tipo de plan actualizado correctamente",
        });
      }
    } catch (error) {
      console.error('Error updating plan type:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el tipo de plan",
        variant: "destructive",
      });
    }
  };

  const handleDeletePlanType = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este tipo de plan?')) return;

    try {
      await deletePlanType(id);
      setPlanTypes(planTypes.filter(pt => pt.id !== id));
      if (selectedPlanType?.id === id) {
        setSelectedPlanType(null);
        setPlanFields([]);
      }
      toast({
        title: "Éxito",
        description: "Tipo de plan eliminado correctamente",
      });
    } catch (error) {
      console.error('Error deleting plan type:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el tipo de plan",
        variant: "destructive",
      });
    }
  };

  const handleCreateField = async () => {
    if (!selectedPlanType || !newField.field_name.trim()) {
      toast({
        title: "Error",
        description: "Selecciona un tipo de plan y proporciona un nombre para el campo",
        variant: "destructive",
      });
      return;
    }

    // Validar que para dropdown se hayan proporcionado opciones
    if (newField.field_type === 'dropdown' && (!newField.dropdown_options || newField.dropdown_options.length === 0)) {
      toast({
        title: "Error",
        description: "Para campos de lista desplegable debes proporcionar al menos una opción",
        variant: "destructive",
      });
      return;
    }

    try {
      // Calcular el siguiente order basado en los campos existentes
      const nextOrder = planFields.length > 0 
        ? Math.max(...planFields.map(f => f.field_order)) + 1 
        : 1;

      const fieldData = {
        plan_type_id: selectedPlanType.id,
        field_name: newField.field_name.trim(),
        field_type: newField.field_type,
        dropdown_options: newField.field_type === 'dropdown' && newField.dropdown_options 
          ? newField.dropdown_options.filter(opt => opt.trim()) 
          : null,
        is_required: newField.is_required,
        field_order: nextOrder
      };

      console.log('Creating field with data:', fieldData);

      const result = await createPlanField(fieldData);
      if (result.data) {
        setPlanFields([...planFields, result.data].sort((a, b) => a.field_order - b.field_order));
        
        // Actualizar conteo de campos
        setPlanTypes(planTypes.map(pt => 
          pt.id === selectedPlanType.id 
            ? { ...pt, field_count: (pt.field_count || 0) + 1 }
            : pt
        ));

        // Resetear formulario
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
        description: `No se pudo crear el campo: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        variant: "destructive",
      });
    }
  };

  const handleDeleteField = async (fieldId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este campo?')) return;

    try {
      await deletePlanField(fieldId);
      setPlanFields(planFields.filter(f => f.id !== fieldId));
      
      // Actualizar conteo de campos
      if (selectedPlanType) {
        setPlanTypes(planTypes.map(pt => 
          pt.id === selectedPlanType.id 
            ? { ...pt, field_count: Math.max((pt.field_count || 1) - 1, 0) }
            : pt
        ));
      }

      toast({
        title: "Éxito",
        description: "Campo eliminado correctamente",
      });
    } catch (error) {
      console.error('Error deleting field:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el campo",
        variant: "destructive",
      });
    }
  };

  const getFieldTypeLabel = (fieldType: string) => {
    const labels = {
      'numeric': 'Numérico',
      'short_text': 'Texto Corto',
      'long_text': 'Texto Extenso',
      'dropdown': 'Lista Desplegable',
      'file': 'Archivo',
      'section': 'Sección',
      'manager_name': 'Nombre del Gestor',
      'campus_name': 'Campus',
      'program_director': 'Director de Programa',
      'strategic_axes': 'Ejes Estratégicos'
    };
    return labels[fieldType as keyof typeof labels] || fieldType;
  };

  const toggleVisibility = async (planType: PlanType & { field_count?: number }) => {
    try {
      const updatedPlanType = { ...planType, is_visible: !planType.is_visible };
      await handleUpdatePlanType(updatedPlanType);
    } catch (error) {
      console.error('Error toggling visibility:', error);
    }
  };

  const handleConfigurePlanType = (planType: PlanType & { field_count?: number }) => {
    setSelectedPlanType(planType);
    if (planType.uses_structured_elements) {
      setConfigMode('elements');
    } else {
      setConfigMode('fields');
      loadPlanFields(planType.id);
    }
  };

  const handleBackToList = () => {
    setSelectedPlanType(null);
    setPlanFields([]);
    setConfigMode('fields');
    loadData();
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

  // Mostrar configuración de elementos si está seleccionado un plan tipo estructurado
  if (selectedPlanType && configMode === 'elements') {
    return (
      <PlanTypeElementsConfiguration
        planType={selectedPlanType}
        onBack={handleBackToList}
        onSave={handleBackToList}
      />
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

      {/* Lista de Tipos de Plan */}
      <Card>
        <CardHeader>
          <CardTitle>Tipos de Plan</CardTitle>
        </CardHeader>
        <CardContent>
          {isCreating && (
            <div className="p-4 border rounded-lg space-y-3 mb-4 bg-blue-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="planName">Nombre del Plan *</Label>
                  <Input
                    id="planName"
                    placeholder="Nombre del tipo de plan"
                    value={newPlanType.name}
                    onChange={(e) => setNewPlanType({ ...newPlanType, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="minHours">Horas Mínimas Semanales</Label>
                  <Input
                    id="minHours"
                    type="number"
                    placeholder="0"
                    value={newPlanType.min_weekly_hours}
                    onChange={(e) => setNewPlanType({ ...newPlanType, min_weekly_hours: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="maxHours">Horas Máximas Semanales</Label>
                  <Input
                    id="maxHours"
                    type="number"
                    placeholder="Sin límite"
                    value={newPlanType.max_weekly_hours || ''}
                    onChange={(e) => setNewPlanType({ ...newPlanType, max_weekly_hours: e.target.value ? parseInt(e.target.value) : null })}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="visible"
                      checked={newPlanType.is_visible}
                      onCheckedChange={(checked) => setNewPlanType({ ...newPlanType, is_visible: checked })}
                    />
                    <Label htmlFor="visible">Visible para gestores</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="structured"
                      checked={newPlanType.uses_structured_elements}
                      onCheckedChange={(checked) => setNewPlanType({ ...newPlanType, uses_structured_elements: checked })}
                    />
                    <Label htmlFor="structured">Usa ejes, acciones y productos</Label>
                  </div>
                </div>
              </div>
              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  placeholder="Descripción del tipo de plan (opcional)"
                  value={newPlanType.description}
                  onChange={(e) => setNewPlanType({ ...newPlanType, description: e.target.value })}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleCreatePlanType}>
                  <Save className="h-4 w-4 mr-1" />
                  Guardar
                </Button>
                <Button variant="outline" onClick={() => setIsCreating(false)}>
                  <X className="h-4 w-4 mr-1" />
                  Cancelar
                </Button>
              </div>
            </div>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre del Plan</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>No. de Campos</TableHead>
                <TableHead>Horas (Min-Max)</TableHead>
                <TableHead>Visible</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {planTypes.map((planType) => (
                <TableRow key={planType.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{planType.name}</div>
                      {planType.description && (
                        <div className="text-sm text-gray-600">{planType.description}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {planType.uses_structured_elements ? (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                        Estructurado
                      </span>
                    ) : (
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                        Campos
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                      {planType.field_count || 0}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {planType.min_weekly_hours || 0} - {planType.max_weekly_hours || '∞'}
                    </span>
                  </TableCell>
                  <TableCell>
                    {planType.is_visible ? (
                      <Eye className="h-4 w-4 text-green-600" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleConfigurePlanType(planType)}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeletePlanType(planType.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Configuración de Campos (solo para tipos tradicionales) */}
      {selectedPlanType && configMode === 'fields' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Configurar Campos: {selectedPlanType.name}</CardTitle>
              <Button variant="outline" onClick={handleBackToList}>
                Volver a la Lista
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label className="text-base font-medium">Campos del Plan</Label>
                <Button size="sm" onClick={() => setIsCreatingField(true)}>
                  <Plus className="h-4 w-4 mr-1" />
                  Agregar Campo
                </Button>
              </div>

              {isCreatingField && (
                <div className="p-4 border rounded-lg space-y-4 mb-4 bg-green-50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fieldName">Nombre del Campo *</Label>
                      <Input
                        id="fieldName"
                        placeholder="Ej: Objetivos del Plan"
                        value={newField.field_name}
                        onChange={(e) => setNewField({ ...newField, field_name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="fieldType">Tipo de Campo *</Label>
                      <Select
                        value={newField.field_type}
                        onValueChange={(value: any) => setNewField({ 
                          ...newField, 
                          field_type: value,
                          dropdown_options: value === 'dropdown' ? [] : undefined
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="section">📋 Sección (Título)</SelectItem>
                          <SelectItem value="manager_name">👤 Nombre del Gestor</SelectItem>
                          <SelectItem value="campus_name">🏢 Campus</SelectItem>
                          <SelectItem value="program_director">👨‍💼 Director de Programa</SelectItem>
                          <SelectItem value="strategic_axes">🎯 Ejes Estratégicos</SelectItem>
                          <SelectItem value="numeric">🔢 Numérico</SelectItem>
                          <SelectItem value="short_text">📝 Texto Corto</SelectItem>
                          <SelectItem value="long_text">📄 Texto Extenso</SelectItem>
                          <SelectItem value="dropdown">📋 Lista Desplegable</SelectItem>
                          <SelectItem value="file">📎 Archivo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {newField.field_type === 'dropdown' && (
                    <div>
                      <Label htmlFor="dropdownOptions">Opciones (una por línea) *</Label>
                      <Textarea
                        id="dropdownOptions"
                        placeholder="Opción 1&#10;Opción 2&#10;Opción 3"
                        value={newField.dropdown_options?.join('\n') || ''}
                        onChange={(e) => setNewField({ 
                          ...newField, 
                          dropdown_options: e.target.value.split('\n').filter(option => option.trim())
                        })}
                        rows={4}
                      />
                      <p className="text-xs text-gray-600 mt-1">
                        Escribe cada opción en una línea separada
                      </p>
                    </div>
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
                    <Button onClick={handleCreateField}>
                      <Save className="h-4 w-4 mr-1" />
                      Guardar Campo
                    </Button>
                    <Button variant="outline" onClick={() => {
                      setIsCreatingField(false);
                      setNewField({
                        field_name: "",
                        field_type: "short_text",
                        dropdown_options: [],
                        is_required: false,
                        field_order: 0
                      });
                    }}>
                      <X className="h-4 w-4 mr-1" />
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {planFields.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No hay campos configurados para este tipo de plan</p>
                    <p className="text-sm">Haz clic en "Agregar Campo" para comenzar</p>
                  </div>
                ) : (
                  planFields.map((field, index) => (
                    <div key={field.id} className="p-3 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-sm bg-gray-200 text-gray-700 px-2 py-1 rounded">
                            {index + 1}
                          </span>
                          <div>
                            <span className="font-medium">{field.field_name}</span>
                            <span className="ml-2 text-sm text-gray-500">
                              ({getFieldTypeLabel(field.field_type)})
                            </span>
                            {field.is_required && (
                              <span className="ml-2 text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
                                Requerido
                              </span>
                            )}
                            {field.field_type === 'section' && (
                              <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                                Sección
                              </span>
                            )}
                          </div>
                        </div>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleDeleteField(field.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                      {field.dropdown_options && (
                        <div className="mt-2 ml-12">
                          <p className="text-xs text-gray-600">
                            Opciones: {JSON.stringify(field.dropdown_options).slice(1, -1)}
                          </p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
