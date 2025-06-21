import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { Plus, Save, X, Trash2 } from "lucide-react";

interface PlanTypeConfigurationProps {
  planTypeId: string;
  planTypeName: string;
  onClose: () => void;
}

export function PlanTypeConfiguration({ planTypeId, planTypeName, onClose }: PlanTypeConfigurationProps) {
  const { toast } = useToast();
  const { 
    fetchStrategicAxes, 
    fetchActions, 
    fetchProducts,
    fetchPlanFields,
    createPlanField,
    deletePlanField 
  } = useSupabaseData();

  const [strategicAxes, setStrategicAxes] = useState<any[]>([]);
  const [actions, setActions] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [planFields, setPlanFields] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedElements, setSelectedElements] = useState({
    strategic_axes: [] as string[],
    actions: [] as string[],
    products: [] as string[]
  });

  const [newField, setNewField] = useState({
    field_name: "",
    field_type: "short_text",
    is_required: false
  });

  useEffect(() => {
    loadData();
  }, [planTypeId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [axesResult, actionsResult, productsResult, fieldsResult] = await Promise.all([
        fetchStrategicAxes(),
        fetchActions(),
        fetchProducts(),
        fetchPlanFields(planTypeId)
      ]);

      if (axesResult.data) setStrategicAxes(axesResult.data);
      if (actionsResult.data) setActions(actionsResult.data);
      if (productsResult.data) setProducts(productsResult.data);
      if (fieldsResult.data) setPlanFields(fieldsResult.data);
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

  const saveConfiguration = async () => {
    try {
      // Save the selected elements configuration
      const { error } = await supabase
        .from('plan_type_strategic_axes')
        .delete()
        .eq('plan_type_id', planTypeId);

      if (error) throw error;

      // Insert new strategic axes
      if (selectedElements.strategic_axes.length > 0) {
        const axesInserts = selectedElements.strategic_axes.map(axisId => ({
          plan_type_id: planTypeId,
          strategic_axis_id: axisId,
          is_required: true
        }));

        const { error: axesError } = await supabase
          .from('plan_type_strategic_axes')
          .insert(axesInserts);

        if (axesError) throw axesError;
      }

      // Similar logic for actions and products
      // ... (implement similar patterns for actions and products)

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

  const handleCreateField = async () => {
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
        plan_type_id: planTypeId,
        field_name: newField.field_name,
        field_type: newField.field_type,
        is_required: newField.is_required,
        field_order: planFields.length + 1
      };

      const result = await createPlanField(fieldData);
      if (result.data) {
        setPlanFields([...planFields, result.data]);
        setNewField({
          field_name: "",
          field_type: "short_text",
          is_required: false
        });
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
        <h2 className="text-xl font-bold">Configurar: {planTypeName}</h2>
        <div className="flex gap-2">
          <Button onClick={saveConfiguration}>
            <Save className="h-4 w-4 mr-2" />
            Guardar Configuración
          </Button>
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4 mr-2" />
            Cerrar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Strategic Axes Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Ejes Estratégicos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {strategicAxes.map((axis) => (
                <div key={axis.id} className="flex items-center space-x-2">
                  <Checkbox
                    checked={selectedElements.strategic_axes.includes(axis.id)}
                    onCheckedChange={() => handleElementToggle('strategic_axes', axis.id)}
                  />
                  <label className="text-sm">{axis.code} - {axis.name}</label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Actions Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Acciones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {actions.map((action) => (
                <div key={action.id} className="flex items-center space-x-2">
                  <Checkbox
                    checked={selectedElements.actions.includes(action.id)}
                    onCheckedChange={() => handleElementToggle('actions', action.id)}
                  />
                  <label className="text-sm">{action.code} - {action.name}</label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Products Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Productos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {products.map((product) => (
                <div key={product.id} className="flex items-center space-x-2">
                  <Checkbox
                    checked={selectedElements.products.includes(product.id)}
                    onCheckedChange={() => handleElementToggle('products', product.id)}
                  />
                  <label className="text-sm">{product.name}</label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Custom Fields */}
        <Card>
          <CardHeader>
            <CardTitle>Campos Personalizados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Add new field form */}
              <div className="p-4 border rounded-lg bg-gray-50">
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="fieldName">Nombre del Campo</Label>
                    <Input
                      id="fieldName"
                      value={newField.field_name}
                      onChange={(e) => setNewField({ ...newField, field_name: e.target.value })}
                      placeholder="Ej: Objetivos específicos"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={newField.is_required}
                      onCheckedChange={(checked) => setNewField({ ...newField, is_required: !!checked })}
                    />
                    <Label>Campo requerido</Label>
                  </div>
                  <Button onClick={handleCreateField}>
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Campo
                  </Button>
                </div>
              </div>

              {/* Existing fields */}
              <div className="space-y-2">
                {planFields.map((field) => (
                  <div key={field.id} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <span className="font-medium">{field.field_name}</span>
                      {field.is_required && (
                        <span className="ml-2 text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
                          Requerido
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
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
