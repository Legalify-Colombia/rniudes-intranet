
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { Save, ArrowLeft } from "lucide-react";

interface PlanTypeElementsConfigurationProps {
  planType: any;
  onBack: () => void;
  onSave: () => void;
}

export function PlanTypeElementsConfiguration({ planType, onBack, onSave }: PlanTypeElementsConfigurationProps) {
  const { toast } = useToast();
  const { 
    fetchStrategicAxes, 
    fetchActions, 
    fetchProducts,
    fetchPlanTypeElements,
    configurePlanTypeElements
  } = useSupabaseData();

  const [strategicAxes, setStrategicAxes] = useState<any[]>([]);
  const [actions, setActions] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedElements, setSelectedElements] = useState({
    strategicAxes: [] as string[],
    actions: [] as string[],
    products: [] as string[],
    requiredStrategicAxes: [] as string[],
    requiredActions: [] as string[],
    requiredProducts: [] as string[]
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [axesResult, actionsResult, productsResult, elementsResult] = await Promise.all([
        fetchStrategicAxes(),
        fetchActions(),
        fetchProducts(),
        fetchPlanTypeElements(planType.id)
      ]);

      if (axesResult.data) setStrategicAxes(axesResult.data);
      if (actionsResult.data) setActions(actionsResult.data);
      if (productsResult.data) setProducts(productsResult.data);

      // Load existing configuration
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

  const saveConfiguration = async () => {
    try {
      setLoading(true);
      const result = await configurePlanTypeElements(planType.id, selectedElements);
      
      if (result.error) {
        throw result.error;
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
        <h2 className="text-xl font-bold">Configurar Elementos: {planType.name}</h2>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Strategic Axes Selection */}
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

        {/* Actions Selection */}
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

        {/* Products Selection */}
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
    </div>
  );
}
