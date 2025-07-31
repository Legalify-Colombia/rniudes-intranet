import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { ArrowLeft, Save, Send } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface StructuredCustomPlanFormProps {
  planId?: string;
  planTypeId?: string;
  onSave?: () => void;
}

export function StructuredCustomPlanForm({ planId, planTypeId, onSave }: StructuredCustomPlanFormProps) {
  const [plan, setPlan] = useState<any>(null);
  const [planType, setPlanType] = useState<any>(null);
  const [title, setTitle] = useState("");
  const [availableProducts, setAvailableProducts] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<{[key: string]: number}>({});
  const [isLoading, setIsLoading] = useState(false);
  
  const { profile } = useAuth();
  const { toast } = useToast();
  const { 
    fetchCustomPlanDetails,
    fetchPlanTypes,
    createCustomPlan,
    updateCustomPlan,
    submitCustomPlan,
    upsertCustomPlanAssignment,
    deleteCustomPlanAssignment,
    fetchPlanTypeElements
  } = useSupabaseData();

  useEffect(() => {
    if (planId) {
      loadPlanDetails();
    } else if (planTypeId) {
      loadPlanType();
    }
  }, [planId, planTypeId]);

  const loadPlanDetails = async () => {
    if (!planId) return;
    
    try {
      setIsLoading(true);
      const result = await fetchCustomPlanDetails(planId);
      if (result.data) {
        setPlan(result.data);
        setPlanType(result.data.plan_type);
        setTitle(result.data.title);
        
        const assignmentsMap: {[key: string]: number} = {};
        result.data.assignments?.forEach((assignment: any) => {
          if (assignment.product_id) {
            assignmentsMap[assignment.product_id] = assignment.assigned_hours;
          }
        });
        setAssignments(assignmentsMap);
        
        if (result.data.plan_type_id) {
          await loadPlanTypeProducts(result.data.plan_type_id);
        }
      }
    } catch (error) {
      console.error("Error loading plan details:", error);
      toast({
        title: "Error",
        description: "No se pudo cargar el plan",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadPlanType = async () => {
    if (!planTypeId) return;
    
    try {
      setIsLoading(true);
      const { data: planTypes } = await fetchPlanTypes();
      const foundPlanType = planTypes?.find(pt => pt.id === planTypeId);
      if (foundPlanType) {
        setPlanType(foundPlanType);
        setTitle(`Plan de ${foundPlanType.name} - ${profile?.full_name}`);
      }
      
      await loadPlanTypeProducts(planTypeId);
    } catch (error) {
      console.error("Error loading plan type:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadPlanTypeProducts = async (planTypeId: string) => {
    try {
      const elementsResult = await fetchPlanTypeElements(planTypeId);
      if (elementsResult.data) {
        const products = elementsResult.data.products?.map((item: any) => ({
          ...item.products,
          is_required: item.is_required
        })) || [];
        setAvailableProducts(products);
      }
    } catch (error) {
      console.error("Error loading plan type products:", error);
    }
  };

  const handleHoursChange = (productId: string, hours: number) => {
    setAssignments(prev => ({
      ...prev,
      [productId]: hours
    }));
  };

  const getTotalHours = () => {
    return Object.values(assignments).reduce((sum, hours) => sum + hours, 0);
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      
      let currentPlan = plan;
      
      // Validar si el título del plan está vacío
      if (!title.trim()) {
        toast({
          title: "Error de validación",
          description: "El título del plan no puede estar vacío.",
          variant: "destructive",
        });
        return;
      }
      
      if (!currentPlan && planTypeId) {
        const planData = {
          title,
          plan_type_id: planTypeId,
          manager_id: profile?.id,
          status: 'draft'
        };
        
        const result = await createCustomPlan(planData);
        if (result.error) {
          console.error("Error al crear el plan:", result.error);
          throw new Error(result.error.message);
        }
        currentPlan = result.data;
        setPlan(currentPlan);
      }
      
      if (currentPlan) {
        // CORRECCIÓN: Se actualiza solo el título para evitar el error 400
        const updateResult = await updateCustomPlan(currentPlan.id, { title: title });
        if (updateResult.error) {
          console.error("Error al actualizar el título del plan:", updateResult.error);
          throw new Error(updateResult.error.message);
        }
        
        // Log the data before sending to Supabase for debugging
        console.log("Saving assignments for plan:", currentPlan.id);
        
        for (const [productId, hours] of Object.entries(assignments)) {
          if (hours > 0) {
            const assignmentData = {
              custom_plan_id: currentPlan.id,
              product_id: productId,
              assigned_hours: hours
            };
            console.log("Upserting assignment:", assignmentData);
            const assignmentResult = await upsertCustomPlanAssignment(assignmentData);
            if (assignmentResult.error) {
              console.error("Error al guardar asignación:", assignmentResult.error);
              throw new Error(assignmentResult.error.message);
            }
          } else {
            console.log("Deleting assignment for product:", productId);
            await deleteCustomPlanAssignment(currentPlan.id, productId);
          }
        }
      }
      
      toast({
        title: "Éxito",
        description: "Plan guardado correctamente",
      });
      
      if (onSave) onSave();
    } catch (error) {
      console.error("Error saving plan:", error);
      toast({
        title: "Error",
        description: `No se pudo guardar el plan: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    // Primero, intenta guardar el plan. handleSave() se encargará de crear el plan si es nuevo.
    try {
      await handleSave();
    } catch (error) {
      console.error("Error durante el guardado previo al envío:", error);
      toast({
        title: "Error de guardado",
        description: "No se pudo guardar el plan antes de enviarlo. Intenta de nuevo.",
        variant: "destructive",
      });
      return;
    }
    
    // Asegurarse de que el plan ya tiene un ID después del guardado.
    if (!plan?.id) {
      toast({
        title: "Error",
        description: "No se pudo encontrar el plan para enviarlo.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsLoading(true);
      await submitCustomPlan(plan.id);
      
      toast({
        title: "Éxito",
        description: "Plan enviado para revisión",
      });
      
      if (onSave) onSave();
    } catch (error) {
      console.error("Error submitting plan:", error);
      toast({
        title: "Error",
        description: `No se pudo enviar el plan: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Cargando...</div>;
  }

  const isReadOnly = plan?.status === 'submitted' || plan?.status === 'approved';
  const maxTotalHours = profile?.total_hours || 0;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => window.history.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <div>
          <h1 className="text-2xl font-bold">
            {plan ? 'Editar Plan Estructurado' : 'Crear Plan Estructurado'}
          </h1>
          <p className="text-gray-600">
            {planType?.name} - {planType?.description}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información General</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Título del Plan</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ingresa el título del plan"
              disabled={isReadOnly}
            />
          </div>
          
          <div className="text-sm text-gray-600">
            <p>Horas totales disponibles: {maxTotalHours}</p>
            <p>Total horas asignadas: {getTotalHours()}</p>
            <p className={getTotalHours() > maxTotalHours ? "text-red-600 font-medium" : ""}>
              Horas restantes: {maxTotalHours - getTotalHours()}
            </p>
            <p className="text-xs text-gray-500">
              (Cálculo: {profile?.weekly_hours || 0} horas semanales × {profile?.number_of_weeks || 16} semanas = {maxTotalHours} horas totales)
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Asignación de Horas por Producto</CardTitle>
        </CardHeader>
        <CardContent>
          {availableProducts.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead>Requerido</TableHead>
                  <TableHead>Horas Asignadas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {availableProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{product.name}</div>
                        {product.description && (
                          <div className="text-sm text-gray-600">{product.description}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {product.is_required ? (
                        <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm">
                          Requerido
                        </span>
                      ) : (
                        <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm">
                          Opcional
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        max={maxTotalHours}
                        value={assignments[product.id] || 0}
                        onChange={(e) => handleHoursChange(product.id, parseInt(e.target.value) || 0)}
                        disabled={isReadOnly}
                        className="w-24"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No hay productos configurados para este tipo de plan
            </div>
          )}
        </CardContent>
      </Card>

      {!isReadOnly && (
        <div className="flex gap-4">
          <Button onClick={handleSave} disabled={isLoading || !title.trim() || getTotalHours() > maxTotalHours}>
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Guardando...' : 'Guardar'}
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isLoading || !title.trim() || getTotalHours() > maxTotalHours}
          >
            <Send className="h-4 w-4 mr-2" />
            {isLoading ? 'Enviando...' : 'Enviar para Revisión'}
          </Button>
        </div>
      )}
      
      {getTotalHours() > maxTotalHours && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 font-medium">
            Error: Has asignado más horas ({getTotalHours()}) de las disponibles ({maxTotalHours})
          </p>
        </div>
      )}
    </div>
  );
}
