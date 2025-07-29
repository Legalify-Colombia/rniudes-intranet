
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, XCircle, ArrowLeft } from "lucide-react";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { useToast } from "@/hooks/use-toast";

interface StructuredWorkPlanFormProps {
  planType: any;
  manager: any;
  onClose: () => void;
  onSave: () => void;
}

export function StructuredWorkPlanForm({ planType, manager, onClose, onSave }: StructuredWorkPlanFormProps) {
  const { 
    fetchPlanTypeElements, 
    createCustomPlan,
    updateCustomPlan,
    fetchCustomPlansByManager,
    upsertCustomPlanAssignment,
    fetchCustomPlanAssignments
  } = useSupabaseData();
  const { toast } = useToast();

  const [planElements, setPlanElements] = useState<any>({ strategicAxes: [], actions: [], products: [] });
  const [workPlan, setWorkPlan] = useState<any>(null);
  const [assignments, setAssignments] = useState<{[key: string]: number}>({});
  const [objectives, setObjectives] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [planType, manager]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Cargar elementos configurados para este tipo de plan
      const { data: elementsData } = await fetchPlanTypeElements(planType.id);
      if (elementsData) {
        setPlanElements(elementsData);
      }

      // Buscar plan existente
      const { data: existingPlans } = await fetchCustomPlansByManager(manager.id);
      const existingPlan = existingPlans?.find((plan: any) => plan.plan_type_id === planType.id);

      if (existingPlan) {
        setWorkPlan(existingPlan);
        setObjectives(existingPlan.title || '');
        
        // Cargar asignaciones existentes
        const { data: assignmentsData } = await fetchCustomPlanAssignments(existingPlan.id);
        if (assignmentsData) {
          const assignmentsMap: {[key: string]: number} = {};
          assignmentsData.forEach((assignment: any) => {
            if (assignment.product_id && assignment.assigned_hours) {
              assignmentsMap[assignment.product_id] = assignment.assigned_hours;
            }
          });
          setAssignments(assignmentsMap);
        }
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

  const handleHoursChange = (productId: string, hours: string) => {
    const numericHours = parseInt(hours) || 0;
    setAssignments(prev => ({ ...prev, [productId]: numericHours }));
  };

  const handleHoursBlur = async (productId: string, hours: string) => {
    const numericHours = parseInt(hours) || 0;
    await updateAssignment(productId, numericHours);
  };

  const updateAssignment = async (productId: string, hours: number) => {
    try {
      let currentWorkPlan = workPlan;

      if (!currentWorkPlan) {
        // Crear plan si no existe
        const newPlan = {
          manager_id: manager.id,
          plan_type_id: planType.id,
          title: objectives || 'Plan de Trabajo - Borrador',
          status: 'draft' as const
        };
        
        console.log('Creating new plan:', newPlan);
        const { data: createdPlan, error } = await createCustomPlan(newPlan);
        if (error) {
          console.error('Error creating plan:', error);
          toast({ title: "Error", description: `No se pudo crear el plan: ${error.message}`, variant: "destructive" });
          return;
        }
        currentWorkPlan = createdPlan;
        setWorkPlan(createdPlan);
        console.log('Plan created successfully:', createdPlan);
      }

      const assignment = {
        custom_plan_id: currentWorkPlan.id,
        product_id: productId,
        assigned_hours: hours || 0
      };

      console.log('Upserting assignment:', assignment);
      const { data, error } = await upsertCustomPlanAssignment(assignment);
      if (error) {
        console.error('Error upserting assignment:', error);
        toast({ title: "Error", description: `No se pudo actualizar la asignación: ${error.message}`, variant: "destructive" });
      } else {
        console.log('Assignment upserted successfully:', data);
        toast({ title: "Éxito", description: "Horas asignadas correctamente" });
      }
    } catch (error) {
      console.error('Unexpected error in updateAssignment:', error);
      toast({ title: "Error", description: "Error inesperado al asignar horas", variant: "destructive" });
    }
  };

  const getTotalAssignedHours = () => {
    return Object.values(assignments).reduce((sum, hours) => sum + hours, 0);
  };

  const getAvailableHours = () => {
    // CORREGIDO: Usar total_hours en lugar de weekly_hours
    const totalHours = manager.total_hours || 0;
    console.log("Manager total_hours:", totalHours);
    console.log("Total assigned hours:", getTotalAssignedHours());
    return totalHours - getTotalAssignedHours();
  };

  const submitForApproval = async () => {
    if (!workPlan) {
      toast({ title: "Error", description: "No hay plan para enviar", variant: "destructive" });
      return;
    }

    if (!objectives.trim()) {
      toast({ title: "Error", description: "Debe agregar objetivos antes de enviar", variant: "destructive" });
      return;
    }

    // VALIDACIÓN CRÍTICA: Evitar envío con 0 horas
    const totalHours = getTotalAssignedHours();
    if (totalHours === 0) {
      toast({ 
        title: "Error", 
        description: "No se puede enviar un plan con 0 horas asignadas. Debe asignar al menos 1 hora a algún producto.", 
        variant: "destructive" 
      });
      return;
    }

    // VALIDACIÓN CRÍTICA: Evitar balance negativo
    const availableHours = getAvailableHours();
    if (availableHours < 0) {
      toast({ 
        title: "Error", 
        description: `No se puede enviar un plan que excede las horas disponibles. Balance actual: ${availableHours} horas.`, 
        variant: "destructive" 
      });
      return;
    }

    const { error } = await updateCustomPlan(workPlan.id, { 
      status: 'submitted',
      submitted_date: new Date().toISOString(),
      title: objectives
    });
    
    if (error) {
      toast({ title: "Error", description: "No se pudo enviar para aprobación", variant: "destructive" });
      return;
    }

    toast({ title: "Éxito", description: "Plan enviado para aprobación" });
    setWorkPlan(prev => ({ ...prev, status: 'submitted', submitted_date: new Date().toISOString() }));
    onSave();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Borrador</Badge>;
      case 'submitted':
        return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />Pendiente</Badge>;
      case 'approved':
        return <Badge className="bg-green-600"><CheckCircle className="h-3 w-3 mr-1" />Aprobado</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rechazado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Cargando...</div>;
  }

  const isReadOnly = workPlan?.status === 'submitted' || workPlan?.status === 'approved';

  // Organizar productos por eje estratégico y acción
  const organizedData = planElements.strategicAxes?.map((axisConfig: any) => {
    const axis = axisConfig.strategic_axes;
    const axisActions = planElements.actions?.filter((actionConfig: any) => 
      actionConfig.actions?.strategic_axis_id === axis.id
    ) || [];
    
    return {
      ...axis,
      actions: axisActions.map((actionConfig: any) => {
        const action = actionConfig.actions;
        const actionProducts = planElements.products?.filter((productConfig: any) => 
          productConfig.products?.action_id === action.id
        ) || [];
        
        return {
          ...action,
          products: actionProducts.map((productConfig: any) => productConfig.products)
        };
      }).filter(action => action.products.length > 0)
    };
  }).filter((axis: any) => axis.actions.length > 0) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Plan de Trabajo Estructurado</h1>
          <p className="text-gray-600">{planType.name} - {manager.full_name}</p>
        </div>
        <Button variant="outline" onClick={onClose}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Plan de Trabajo - {manager.full_name}</CardTitle>
            {workPlan?.status && getStatusBadge(workPlan.status)}
          </div>
          <div className="text-sm text-gray-600 space-y-1">
            <p>Tipo de Plan: {planType.name}</p>
            <p>Horas Totales Disponibles: <span className="font-bold text-blue-600">{manager.total_hours || 0}</span></p>
            <p>Horas Asignadas: <span className="font-bold text-green-600">{getTotalAssignedHours()}</span></p>
            <p>Balance: <span className={`font-bold ${getAvailableHours() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {getAvailableHours()}
            </span></p>
            <p className="text-xs text-gray-500">
              (Cálculo: {manager.weekly_hours || 0} horas semanales × {manager.number_of_weeks || 16} semanas = {manager.total_hours || 0} horas totales)
            </p>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Objetivos del Plan de Trabajo:
            </label>
            <Textarea
              value={objectives}
              onChange={(e) => setObjectives(e.target.value)}
              placeholder="Describe los objetivos principales de tu plan de trabajo..."
              className="min-h-[100px]"
              disabled={isReadOnly}
            />
          </div>

          {organizedData.length > 0 ? (
            <Table className="border">
              <TableHeader>
                <TableRow className="bg-blue-600">
                  <TableHead className="text-white font-bold border border-gray-300 text-center">
                    EJE ESTRATÉGICO
                  </TableHead>
                  <TableHead className="text-white font-bold border border-gray-300 text-center">
                    ACCIÓN
                  </TableHead>
                  <TableHead className="text-white font-bold border border-gray-300 text-center">
                    PRODUCTO
                  </TableHead>
                  <TableHead className="text-white font-bold border border-gray-300 text-center w-24">
                    HORAS
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {organizedData.map(axis => 
                  axis.actions.map((action: any, actionIndex: number) => 
                    action.products.map((product: any, productIndex: number) => {
                      const isFirstActionRow = productIndex === 0;
                      const isFirstAxisRow = actionIndex === 0 && productIndex === 0;
                      const axisRowspan = axis.actions.reduce((sum: number, a: any) => sum + a.products.length, 0);
                      const actionRowspan = action.products.length;

                      return (
                        <TableRow key={product.id} className="border">
                          {isFirstAxisRow && (
                            <TableCell 
                              rowSpan={axisRowspan}
                              className="border border-gray-300 text-center font-medium bg-blue-50 align-middle"
                            >
                              <div className="writing-vertical text-sm font-bold">
                                {axis.code} - {axis.name}
                              </div>
                            </TableCell>
                          )}
                          {isFirstActionRow && (
                            <TableCell 
                              rowSpan={actionRowspan}
                              className="border border-gray-300 text-sm p-2 align-middle"
                            >
                              <div className="font-medium text-gray-800">
                                {action.code} {action.name}
                              </div>
                            </TableCell>
                          )}
                          <TableCell className="border border-gray-300 text-sm p-2">
                            {product.name}
                          </TableCell>
                          <TableCell className="border border-gray-300 text-center p-1">
                            <Input
                              type="number"
                              min="0"
                              value={assignments[product.id] || 0}
                              onChange={(e) => handleHoursChange(product.id, e.target.value)}
                              onBlur={(e) => handleHoursBlur(product.id, e.target.value)}
                              className="w-16 h-8 text-center"
                              disabled={isReadOnly}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )
                )}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No hay elementos configurados para este tipo de plan.
              <br />
              Contacte al administrador para configurar los ejes, acciones y productos.
            </div>
          )}

          <div className="flex justify-between items-center mt-6 p-4 bg-gray-50 rounded">
            <div className="space-x-4">
              <span className="text-sm">
                <strong>Total Horas:</strong> {getTotalAssignedHours()} / {manager.total_hours || 0}
              </span>
              <span className={`text-sm font-bold ${getAvailableHours() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                Balance: {getAvailableHours()}
              </span>
            </div>
            
            <div className="space-x-2">
              <Button variant="outline" onClick={onClose}>
                Cerrar
              </Button>
              {(workPlan?.status === 'draft' || !workPlan) && (
                <Button 
                  onClick={submitForApproval}
                  disabled={getAvailableHours() < 0 || getTotalAssignedHours() === 0 || !objectives.trim()}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Enviar para Aprobación
                </Button>
              )}
              {workPlan?.status === 'rejected' && (
                <Button 
                  onClick={submitForApproval}
                  disabled={getAvailableHours() < 0 || getTotalAssignedHours() === 0 || !objectives.trim()}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Reenviar para Aprobación
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
