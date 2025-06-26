import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { usePlanTypes } from "@/hooks/usePlanTypes";
import { ArrowLeft, Save } from "lucide-react";

interface PlanTypeElementsConfigurationProps {
  planTypeId: string;
  onBack: () => void;
}

export function PlanTypeElementsConfiguration({ planTypeId, onBack }: PlanTypeElementsConfigurationProps) {
  const [elements, setElements] = useState<any>({
    strategicAxes: [],
    actions: [],
    products: []
  });
  const [selectedElements, setSelectedElements] = useState<{
    strategicAxes: string[];
    actions: string[];
    products: string[];
  }>({
    strategicAxes: [],
    actions: [],
    products: []
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const { toast } = useToast();
  const { fetchStrategicAxes, fetchActions, fetchProducts } = useSupabaseData();
  const { fetchPlanTypeElements, configurePlanTypeElements } = usePlanTypes();

  useEffect(() => {
    loadData();
  }, [planTypeId]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load all available elements
      const [axesResult, actionsResult, productsResult, configResult] = await Promise.all([
        fetchStrategicAxes(),
        fetchActions(),
        fetchProducts(),
        fetchPlanTypeElements(planTypeId)
      ]);
      
      if (axesResult.data) setElements(prev => ({ ...prev, strategicAxes: axesResult.data }));
      if (actionsResult.data) setElements(prev => ({ ...prev, actions: actionsResult.data }));
      if (productsResult.data) setElements(prev => ({ ...prev, products: productsResult.data }));
      
      // Set currently selected elements
      if (configResult.data) {
        setSelectedElements({
          strategicAxes: configResult.data.strategicAxes?.map((item: any) => item.strategic_axis_id) || [],
          actions: configResult.data.actions?.map((item: any) => item.action_id) || [],
          products: configResult.data.products?.map((item: any) => item.product_id) || []
        });
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los elementos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await configurePlanTypeElements(planTypeId, selectedElements);
      
      toast({
        title: "Éxito",
        description: "Configuración guardada correctamente",
      });
      
      onBack();
    } catch (error) {
      console.error("Error saving configuration:", error);
      toast({
        title: "Error",
        description: "No se pudo guardar la configuración",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Cargando configuración...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Configurar Elementos del Plan</h1>
            <p className="text-gray-600">Selecciona los elementos disponibles para este tipo de plan</p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Guardando...' : 'Guardar'}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Ejes Estratégicos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {elements.strategicAxes.map((axis: any) => (
              <div key={axis.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`axis-${axis.id}`}
                  checked={selectedElements.strategicAxes.includes(axis.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedElements(prev => ({
                        ...prev,
                        strategicAxes: [...prev.strategicAxes, axis.id]
                      }));
                    } else {
                      setSelectedElements(prev => ({
                        ...prev,
                        strategicAxes: prev.strategicAxes.filter(id => id !== axis.id)
                      }));
                    }
                  }}
                />
                <label htmlFor={`axis-${axis.id}`} className="text-sm">
                  {axis.code} - {axis.name}
                </label>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Acciones</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {elements.actions.map((action: any) => (
              <div key={action.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`action-${action.id}`}
                  checked={selectedElements.actions.includes(action.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedElements(prev => ({
                        ...prev,
                        actions: [...prev.actions, action.id]
                      }));
                    } else {
                      setSelectedElements(prev => ({
                        ...prev,
                        actions: prev.actions.filter(id => id !== action.id)
                      }));
                    }
                  }}
                />
                <label htmlFor={`action-${action.id}`} className="text-sm">
                  {action.code} - {action.name}
                </label>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Productos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {elements.products.map((product: any) => (
              <div key={product.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`product-${product.id}`}
                  checked={selectedElements.products.includes(product.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedElements(prev => ({
                        ...prev,
                        products: [...prev.products, product.id]
                      }));
                    } else {
                      setSelectedElements(prev => ({
                        ...prev,
                        products: prev.products.filter(id => id !== product.id)
                      }));
                    }
                  }}
                />
                <label htmlFor={`product-${product.id}`} className="text-sm">
                  {product.name}
                </label>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
