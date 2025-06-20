
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { Plus, Edit, Trash2, Settings, Save, X, Eye, EyeOff } from "lucide-react";
import { PlanType, PlanField, StrategicAxis, Action, Product } from "@/types";

interface PlanFieldForm {
  field_name: string;
  field_type: "numeric" | "short_text" | "long_text" | "dropdown" | "file" | "section" | "manager_name" | "campus_name" | "program_director" | "strategic_axes";
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

  const [planTypes, setPlanTypes] = useState<(PlanType & { field_count?: number })[]>([]);
  const [strategicAxes, setStrategicAxes] = useState<StrategicAxis[]>([]);
  const [actions, setActions] = useState<Action[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedPlanType, setSelectedPlanType] = useState<PlanType | null>(null);
  const [planFields, setPlanFields] = useState<PlanField[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isCreating, setIsCreating] = useState(false);
  const [editingPlanType, setEditingPlanType] = useState<PlanType | null>(null);
  const [newPlanType, setNewPlanType] = useState({ 
    name: "", 
    description: "",
    min_weekly_hours: 0,
    max_weekly_hours: null as number | null,
    is_visible: true
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
        const newTypeWithCount = { ...result.data, field_count: 0 };
        setPlanTypes([...planTypes, newTypeWithCount]);
        setNewPlanType({ 
          name: "", 
          description: "",
          min_weekly_hours: 0,
          max_weekly_hours: null,
          is_visible: true
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
        description: "No se pudo crear el tipo de plan",
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
        is_visible: planType.is_visible
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
        
        // Actualizar conteo de campos
        setPlanTypes(planTypes.map(pt => 
          pt.id === selectedPlanType.id 
            ? { ...pt, field_count: (pt.field_count || 0) + 1 }
            : pt
        ));

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

      {/* Lista de Tipos de Plan en Tabla */}
      <Card>
        <CardHeader>
          <CardTitle>Tipos de Plan</CardTitle>
        </CardHeader>
        <CardContent>
          {isCreating && (
            <div className="p-4 border rounded-lg space-y-3 mb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input
                  placeholder="Nombre del tipo de plan"
                  value={newPlanType.name}
                  onChange={(e) => setNewPlanType({ ...newPlanType, name: e.target.value })}
                />
                <Input
                  type="number"
                  placeholder="Horas mínimas semanales"
                  value={newPlanType.min_weekly_hours}
                  onChange={(e) => setNewPlanType({ ...newPlanType, min_weekly_hours: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input
                  type="number"
                  placeholder="Horas máximas semanales (opcional)"
                  value={newPlanType.max_weekly_hours || ''}
                  onChange={(e) => setNewPlanType({ ...newPlanType, max_weekly_hours: e.target.value ? parseInt(e.target.value) : null })}
                />
                <div className="flex items-center space-x-2">
                  <Switch
                    id="visible"
                    checked={newPlanType.is_visible}
                    onCheckedChange={(checked) => setNewPlanType({ ...newPlanType, is_visible: checked })}
                  />
                  <Label htmlFor="visible">Visible para gestores</Label>
                </div>
              </div>
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

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre del Plan</TableHead>
                <TableHead>No. de Campos</TableHead>
                <TableHead>Horas (Min-Max)</TableHead>
                <TableHead>Mostrar</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {planTypes.map((planType) => (
                <TableRow key={planType.id}>
                  <TableCell>
                    {editingPlanType?.id === planType.id ? (
                      <Input
                        value={editingPlanType.name}
                        onChange={(e) => setEditingPlanType({ ...editingPlanType, name: e.target.value })}
                        className="w-full"
                      />
                    ) : (
                      <div>
                        <div className="font-medium">{planType.name}</div>
                        {planType.description && (
                          <div className="text-sm text-gray-600">{planType.description}</div>
                        )}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                      {planType.field_count || 0}
                    </span>
                  </TableCell>
                  <TableCell>
                    {editingPlanType?.id === planType.id ? (
                      <div className="flex gap-1">
                        <Input
                          type="number"
                          value={editingPlanType.min_weekly_hours || 0}
                          onChange={(e) => setEditingPlanType({ 
                            ...editingPlanType, 
                            min_weekly_hours: parseInt(e.target.value) || 0 
                          })}
                          className="w-16"
                        />
                        <span className="self-center">-</span>
                        <Input
                          type="number"
                          value={editingPlanType.max_weekly_hours || ''}
                          onChange={(e) => setEditingPlanType({ 
                            ...editingPlanType, 
                            max_weekly_hours: e.target.value ? parseInt(e.target.value) : null 
                          })}
                          placeholder="∞"
                          className="w-16"
                        />
                      </div>
                    ) : (
                      <span className="text-sm">
                        {planType.min_weekly_hours || 0} - {planType.max_weekly_hours || '∞'}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingPlanType?.id === planType.id ? (
                      <Switch
                        checked={editingPlanType.is_visible}
                        onCheckedChange={(checked) => setEditingPlanType({ 
                          ...editingPlanType, 
                          is_visible: checked 
                        })}
                      />
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleVisibility(planType)}
                      >
                        {planType.is_visible ? (
                          <Eye className="h-4 w-4 text-green-600" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {editingPlanType?.id === planType.id ? (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleUpdatePlanType(editingPlanType)}
                          >
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingPlanType(null)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingPlanType(planType)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedPlanType(planType);
                              loadPlanFields(planType.id);
                            }}
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
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
                      <SelectItem value="section">Sección</SelectItem>
                      <SelectItem value="manager_name">Nombre del Gestor</SelectItem>
                      <SelectItem value="campus_name">Campus</SelectItem>
                      <SelectItem value="program_director">Director de Programa</SelectItem>
                      <SelectItem value="strategic_axes">Ejes Estratégicos</SelectItem>
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
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleDeleteField(field.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
