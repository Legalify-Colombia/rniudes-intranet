import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, Send, FileText, PlusCircle, Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/hooks/useAuth";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { useToast } from "@/hooks/use-toast";

interface StructuredCustomPlanFormProps {
  planId?: string;
  planTypeId?: string;
  onSave?: () => void;
}

// Interfaz para definir la estructura de un elemento estructurado
interface StructuredElement {
  id: string; // Un ID único para la fila
  strategic_axis_id: string;
  action_id: string;
  product_id: string;
  target: string;
  status: string;
}

export function StructuredCustomPlanForm({
  planId,
  planTypeId,
  onSave,
}: StructuredCustomPlanFormProps) {
  const [plan, setPlan] = useState<any>(null);
  const [planType, setPlanType] = useState<any>(null);
  const [title, setTitle] = useState("");
  const [structuredElements, setStructuredElements] = useState<StructuredElement[]>([]);
  const [strategicAxes, setStrategicAxes] = useState<any[]>([]);
  const [actions, setActions] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { profile } = useAuth();
  const { toast } = useToast();
  const {
    fetchCustomPlanDetails,
    updateCustomPlan,
    submitCustomPlan,
    fetchStrategicAxes,
    fetchActions,
    fetchProducts,
    createCustomPlan,
    upsertCustomPlanStructuredElements,
    deleteCustomPlanStructuredElement,
  } = useSupabaseData();

  useEffect(() => {
    // Cargar los datos del plan si existe un planId
    const loadData = async () => {
      setIsLoading(true);
      try {
        if (planId) {
          const result = await fetchCustomPlanDetails(planId);
          if (result.data) {
            setPlan(result.data);
            setPlanType(result.data.plan_type);
            setTitle(result.data.title);
            // Asegurarse de que los elementos estructurados se carguen correctamente
            if (result.data.structured_elements) {
              setStructuredElements(
                result.data.structured_elements.map((el: any) => ({
                  ...el,
                  id: el.id || crypto.randomUUID(), // Usar el id de supabase o generar uno nuevo
                }))
              );
            }
          }
        }
        
        // Cargar los datos maestros
        const [axesResult, actionsResult, productsResult] = await Promise.all([
          fetchStrategicAxes(),
          fetchActions(),
          fetchProducts(),
        ]);

        if (axesResult.data) setStrategicAxes(axesResult.data);
        if (actionsResult.data) setActions(actionsResult.data);
        if (productsResult.data) setProducts(productsResult.data);
        
      } catch (error) {
        console.error("Error loading structured plan data:", error);
        toast({
          title: "Error",
          description: "No se pudo cargar la información del plan.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [planId]);

  const handleElementChange = (index: number, field: string, value: any) => {
    setStructuredElements((prevElements) => {
      const newElements = [...prevElements];
      newElements[index] = { ...newElements[index], [field]: value };
      return newElements;
    });
  };

  const handleAddElement = () => {
    setStructuredElements((prevElements) => [
      ...prevElements,
      {
        id: crypto.randomUUID(),
        strategic_axis_id: "",
        action_id: "",
        product_id: "",
        target: "",
        status: "draft",
      },
    ]);
  };

  const handleDeleteElement = async (elementId: string) => {
    // Si el elemento ya existe en la base de datos, lo borramos de allí
    if (planId) {
      try {
        await deleteCustomPlanStructuredElement(elementId);
        toast({
          title: "Éxito",
          description: "Elemento eliminado correctamente de la base de datos.",
        });
      } catch (error) {
        console.error("Error deleting structured element:", error);
        toast({
          title: "Error",
          description: "No se pudo eliminar el elemento de la base de datos.",
          variant: "destructive",
        });
      }
    }
    // Actualizar el estado para reflejar la eliminación
    setStructuredElements((prevElements) =>
      prevElements.filter((el) => el.id !== elementId)
    );
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);

      let currentPlan = plan;

      if (!currentPlan && planTypeId) {
        const planData = {
          title,
          plan_type_id: planTypeId,
          manager_id: profile?.id,
          status: "draft",
        };
        const result = await createCustomPlan(planData);
        if (result.error) {
          throw new Error(result.error.message);
        }
        currentPlan = result.data;
        setPlan(currentPlan);
      }

      if (currentPlan) {
        await updateCustomPlan(currentPlan.id, { title });
        await upsertCustomPlanStructuredElements(
          currentPlan.id,
          structuredElements.map(({ id, ...rest }) => rest)
        );
      }

      toast({
        title: "Éxito",
        description: "Plan guardado correctamente.",
      });

      if (onSave) onSave();
    } catch (error) {
      console.error("Error saving structured plan:", error);
      toast({
        title: "Error",
        description: "No se pudo guardar el plan.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!plan?.id) {
      await handleSave();
      return;
    }

    try {
      setIsLoading(true);
      await upsertCustomPlanStructuredElements(
        plan.id,
        structuredElements.map(({ id, ...rest }) => rest)
      );
      await submitCustomPlan(plan.id);

      toast({
        title: "Éxito",
        description:
          "Plan enviado para revisión con todas las asignaciones guardadas.",
      });

      if (onSave) onSave();
    } catch (error) {
      console.error("Error submitting structured plan:", error);
      toast({
        title: "Error",
        description: "No se pudo enviar el plan.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isReadOnly = plan?.status === "approved" && profile?.role !== "Administrador";

  if (isLoading) {
    return <div className="flex justify-center p-8">Cargando...</div>;
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => window.history.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <div>
          <h1 className="text-2xl font-bold">
            {plan ? "Editar Plan Estructurado" : "Crear Plan Estructurado"}
          </h1>
          <p className="text-gray-600">
            {planType?.name} - {planType?.description}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {planType?.name || "Plan Estructurado"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
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

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Elementos del Plan</h3>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Eje Estratégico</TableHead>
                    <TableHead>Acción</TableHead>
                    <TableHead>Producto</TableHead>
                    <TableHead>Meta</TableHead>
                    <TableHead className="w-[100px]">Estado</TableHead>
                    {!isReadOnly && <TableHead className="w-[50px]">Acciones</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {structuredElements.length > 0 ? (
                    structuredElements.map((element, index) => (
                      <TableRow key={element.id}>
                        <TableCell>
                          <Select
                            value={element.strategic_axis_id}
                            onValueChange={(val) =>
                              handleElementChange(index, "strategic_axis_id", val)
                            }
                            disabled={isReadOnly}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar" />
                            </SelectTrigger>
                            <SelectContent>
                              {strategicAxes.map((axis) => (
                                <SelectItem key={axis.id} value={axis.id}>
                                  {axis.code} - {axis.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={element.action_id}
                            onValueChange={(val) =>
                              handleElementChange(index, "action_id", val)
                            }
                            disabled={isReadOnly}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar" />
                            </SelectTrigger>
                            <SelectContent>
                              {actions.map((action) => (
                                <SelectItem key={action.id} value={action.id}>
                                  {action.code} - {action.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={element.product_id}
                            onValueChange={(val) =>
                              handleElementChange(index, "product_id", val)
                            }
                            disabled={isReadOnly}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar" />
                            </SelectTrigger>
                            <SelectContent>
                              {products.map((product) => (
                                <SelectItem key={product.id} value={product.id}>
                                  {product.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="text"
                            value={element.target}
                            onChange={(e) =>
                              handleElementChange(index, "target", e.target.value)
                            }
                            disabled={isReadOnly}
                          />
                        </TableCell>
                        <TableCell>
                          <Select
                            value={element.status}
                            onValueChange={(val) =>
                              handleElementChange(index, "status", val)
                            }
                            disabled={isReadOnly}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="draft">Borrador</SelectItem>
                              <SelectItem value="progress">En Progreso</SelectItem>
                              <SelectItem value="completed">Completado</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        {!isReadOnly && (
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteElement(element.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-gray-500 py-4">
                        No hay elementos estructurados, agrega uno para empezar.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            {!isReadOnly && (
              <Button onClick={handleAddElement} variant="outline" className="w-full">
                <PlusCircle className="h-4 w-4 mr-2" />
                Agregar Elemento
              </Button>
            )}
          </div>
          
          <div className="flex gap-4 pt-6">
            <Button onClick={handleSave} disabled={isLoading || isReadOnly}>
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? "Guardando..." : "Guardar"}
            </Button>
            {plan?.status !== "submitted" && (
              <Button onClick={handleSubmit} disabled={isLoading || isReadOnly || !title.trim()}>
                <Send className="h-4 w-4 mr-2" />
                {isLoading ? "Enviando..." : "Enviar para Revisión"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
