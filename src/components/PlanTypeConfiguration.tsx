
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
import { Plus, Save, X, Trash2, ArrowLeft } from "lucide-react";

interface PlanTypeConfigurationProps {
  onBack: () => void;
}

export function PlanTypeConfiguration({ onBack }: PlanTypeConfigurationProps) {
  const { toast } = useToast();
  const { 
    fetchStrategicAxes, 
    fetchActions, 
    fetchProducts,
    fetchPlanTypes
  } = useSupabaseData();

  const [planTypes, setPlanTypes] = useState<any[]>([]);
  const [selectedPlanType, setSelectedPlanType] = useState<any | null>(null);
  const [strategicAxes, setStrategicAxes] = useState<any[]>([]);
  const [actions, setActions] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
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

  const handleElementToggle = (category: string, elementId: string) => {
    setSelectedElements(prev => ({
      ...prev,
      [category]: prev[category as keyof typeof prev].includes(elementId)
        ? prev[category as keyof typeof prev].filter(id => id !== elementId)
        : [...prev[category as keyof typeof prev], elementId]
    }));
  };

  const saveConfiguration = async () => {
    if (!selectedPlanType) return;

    try {
      // Save the selected elements configuration
      const { error } = await supabase
        .from('plan_type_strategic_axes')
        .delete()
        .eq('plan_type_id', selectedPlanType.id);

      if (error) throw error;

      // Insert new strategic axes
      if (selectedElements.strategic_axes.length > 0) {
        const axesInserts = selectedElements.strategic_axes.map(axisId => ({
          plan_type_id: selectedPlanType.id,
          strategic_axis_id: axisId,
          is_required: true
        }));

        const { error: axesError } = await supabase
          .from('plan_type_strategic_axes')
          .insert(axesInserts);

        if (axesError) throw axesError;
      }

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

  if (!selectedPlanType) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Configuración de Tipos de Plan</h2>
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </div>

        <div className="grid gap-4">
          {planTypes.map((planType) => (
            <Card key={planType.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{planType.name}</h3>
                    <p className="text-sm text-gray-600">{planType.description}</p>
                  </div>
                  <Button onClick={() => setSelectedPlanType(planType)}>
                    Configurar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {planTypes.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No hay tipos de plan disponibles para configurar.
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Configurar: {selectedPlanType.name}</h2>
        <div className="flex gap-2">
          <Button onClick={saveConfiguration}>
            <Save className="h-4 w-4 mr-2" />
            Guardar Configuración
          </Button>
          <Button variant="outline" onClick={() => setSelectedPlanType(null)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
      </div>
    </div>
  );
}
