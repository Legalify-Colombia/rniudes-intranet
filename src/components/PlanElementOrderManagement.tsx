import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowUp, ArrowDown, Eye, EyeOff, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { Input } from "@/components/ui/input";

export function PlanElementOrderManagement() {
  const [planTypes, setPlanTypes] = useState<any[]>([]);
  const [selectedPlanType, setSelectedPlanType] = useState<string>("");
  const [elements, setElements] = useState<any[]>([]);
  const [elementOrder, setElementOrder] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const { profile } = useAuth();
  const { toast } = useToast();
  const { 
    fetchPlanTypes, 
    fetchPlanTypeElements,
    savePlanElementOrder,
    fetchPlanElementOrder
  } = useSupabaseData();

  useEffect(() => {
    loadPlanTypes();
  }, []);

  useEffect(() => {
    if (selectedPlanType) {
      loadPlanElements();
    }
  }, [selectedPlanType]);

  const loadPlanTypes = async () => {
    try {
      const { data, error } = await fetchPlanTypes();
      if (error) throw error;
      setPlanTypes(data || []);
    } catch (error) {
      console.error('Error loading plan types:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los tipos de plan",
        variant: "destructive",
      });
    }
  };

  const loadPlanElements = async () => {
    setIsLoading(true);
    try {
      const { data: elementsData } = await fetchPlanTypeElements(selectedPlanType);
      const { data: orderData } = await fetchPlanElementOrder(selectedPlanType);
      
      if (elementsData) {
        // Organizar elementos por categoría
        const organized = [];
        
        // Agregar ejes estratégicos
        elementsData.strategicAxes?.forEach((axisConfig: any, index: number) => {
          const existingOrder = orderData?.find(
            (o: any) => o.element_type === 'strategic_axis' && o.element_id === axisConfig.strategic_axes.id
          );
          
          organized.push({
            id: axisConfig.strategic_axes.id,
            type: 'strategic_axis',
            name: `${axisConfig.strategic_axes.code} - ${axisConfig.strategic_axes.name}`,
            display_order: existingOrder?.display_order ?? index,
            is_visible: existingOrder?.is_visible ?? true,
            element: axisConfig.strategic_axes
          });
        });

        // Agregar acciones
        elementsData.actions?.forEach((actionConfig: any, index: number) => {
          const existingOrder = orderData?.find(
            (o: any) => o.element_type === 'action' && o.element_id === actionConfig.actions.id
          );
          
          organized.push({
            id: actionConfig.actions.id,
            type: 'action',
            name: `${actionConfig.actions.code} - ${actionConfig.actions.name}`,
            display_order: existingOrder?.display_order ?? index,
            is_visible: existingOrder?.is_visible ?? true,
            element: actionConfig.actions
          });
        });

        // Agregar productos
        elementsData.products?.forEach((productConfig: any, index: number) => {
          const existingOrder = orderData?.find(
            (o: any) => o.element_type === 'product' && o.element_id === productConfig.products.id
          );
          
          organized.push({
            id: productConfig.products.id,
            type: 'product',
            name: productConfig.products.name,
            display_order: existingOrder?.display_order ?? index,
            is_visible: existingOrder?.is_visible ?? true,
            element: productConfig.products
          });
        });

        setElements(organized);
        setElementOrder(organized);
      }
    } catch (error) {
      console.error('Error loading plan elements:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los elementos del plan",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const moveElement = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...elementOrder];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (newIndex >= 0 && newIndex < newOrder.length) {
      // Intercambiar elementos
      [newOrder[index], newOrder[newIndex]] = [newOrder[newIndex], newOrder[index]];
      
      // Actualizar display_order
      newOrder[index].display_order = index;
      newOrder[newIndex].display_order = newIndex;
      
      setElementOrder(newOrder);
    }
  };

  const toggleVisibility = (index: number) => {
    const newOrder = [...elementOrder];
    newOrder[index].is_visible = !newOrder[index].is_visible;
    setElementOrder(newOrder);
  };

  const updateDisplayOrder = (index: number, newOrder: number) => {
    const updated = [...elementOrder];
    updated[index].display_order = newOrder;
    setElementOrder(updated);
  };

  const saveOrder = async () => {
    if (!selectedPlanType) return;
    
    setIsLoading(true);
    try {
      for (const element of elementOrder) {
        await savePlanElementOrder({
          plan_type_id: selectedPlanType,
          element_type: element.type,
          element_id: element.id,
          display_order: element.display_order,
          is_visible: element.is_visible
        });
      }
      
      toast({
        title: "Éxito",
        description: "Orden de elementos guardado correctamente",
      });
    } catch (error) {
      console.error('Error saving order:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar el orden de elementos",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      'strategic_axis': 'Eje Estratégico',
      'action': 'Acción',
      'product': 'Producto'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getTypeBadgeColor = (type: string) => {
    const colors = {
      'strategic_axis': 'bg-blue-600',
      'action': 'bg-green-600',
      'product': 'bg-purple-600'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-600';
  };

  if (profile?.role !== 'Coordinador' && profile?.role !== 'Administrador') {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No tienes permisos para acceder a esta sección.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configurar Orden de Elementos del Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Seleccionar Tipo de Plan:
              </label>
              <Select value={selectedPlanType} onValueChange={setSelectedPlanType}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un tipo de plan" />
                </SelectTrigger>
                <SelectContent>
                  {planTypes.map(type => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedPlanType && (
              <>
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Elementos del Plan</h3>
                  <Button 
                    onClick={saveOrder} 
                    disabled={isLoading}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isLoading ? 'Guardando...' : 'Guardar Orden'}
                  </Button>
                </div>

                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Orden</TableHead>
                        <TableHead>Visible</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {elementOrder.map((element, index) => (
                        <TableRow key={`${element.type}-${element.id}`}>
                          <TableCell>
                            <Badge className={`${getTypeBadgeColor(element.type)} text-white`}>
                              {getTypeLabel(element.type)}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">
                            {element.name}
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={element.display_order}
                              onChange={(e) => updateDisplayOrder(index, parseInt(e.target.value) || 0)}
                              className="w-20"
                              min="0"
                            />
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleVisibility(index)}
                              className={element.is_visible ? "text-green-600" : "text-gray-400"}
                            >
                              {element.is_visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                            </Button>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-1">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => moveElement(index, 'up')}
                                disabled={index === 0}
                              >
                                <ArrowUp className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => moveElement(index, 'down')}
                                disabled={index === elementOrder.length - 1}
                              >
                                <ArrowDown className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {elementOrder.length === 0 && !isLoading && (
                  <div className="text-center py-8 text-gray-500">
                    No hay elementos configurados para este tipo de plan.
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}