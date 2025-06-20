
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { useToast } from "@/hooks/use-toast";

interface WorkPlanFormProps {
  manager: any;
  onClose: () => void;
  onSave: () => void;
}

export function WorkPlanForm({ manager, onClose, onSave }: WorkPlanFormProps) {
  const { 
    fetchStrategicAxes, 
    fetchActions, 
    fetchProducts, 
    fetchWorkPlans,
    fetchWorkPlanAssignments,
    createWorkPlan,
    updateWorkPlan,
    upsertWorkPlanAssignment 
  } = useSupabaseData();
  const { toast } = useToast();

  const [strategicAxes, setStrategicAxes] = useState<any[]>([]);
  const [actions, setActions] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [workPlan, setWorkPlan] = useState<any>(null);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputValues, setInputValues] = useState<{[key: string]: string}>({});

  useEffect(() => {
    loadData();
  }, [manager]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Cargar ejes estratégicos
      const { data: axesData } = await fetchStrategicAxes();
      setStrategicAxes(axesData || []);

      // Cargar acciones
      const { data: actionsData } = await fetchActions();
      setActions(actionsData || []);

      // Cargar productos
      const { data: productsData } = await fetchProducts();
      setProducts(productsData || []);

      // Buscar plan de trabajo existente
      const { data: workPlansData } = await fetchWorkPlans();
      const existingPlan = workPlansData?.find(
        (plan: any) => plan.manager_id === manager.id
      );

      if (existingPlan) {
        setWorkPlan(existingPlan);
        // Cargar asignaciones existentes
        const { data: assignmentsData } = await fetchWorkPlanAssignments(existingPlan.id);
        setAssignments(assignmentsData || []);
        
        // Inicializar valores de input
        const initialValues: {[key: string]: string} = {};
        assignmentsData?.forEach((assignment: any) => {
          initialValues[assignment.product_id] = assignment.assigned_hours.toString();
        });
        setInputValues(initialValues);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (productId: string, value: string) => {
    setInputValues(prev => ({ ...prev, [productId]: value }));
  };

  const handleInputBlur = async (productId: string, value: string) => {
    const hours = parseInt(value) || 0;
    await updateAssignment(productId, hours);
  };

  const updateAssignment = async (productId: string, hours: number) => {
    if (!workPlan) {
      // Crear plan de trabajo si no existe
      const newPlan = {
        manager_id: manager.id,
        program_id: manager.academic_programs[0]?.id,
        total_hours_assigned: 0,
        status: 'draft' as const
      };
      
      const { data: createdPlan, error } = await createWorkPlan(newPlan);
      if (error) {
        toast({ title: "Error", description: "No se pudo crear el plan de trabajo", variant: "destructive" });
        return;
      }
      setWorkPlan(createdPlan);
    }

    const planId = workPlan?.id;
    if (!planId) return;

    const assignment = {
      work_plan_id: planId,
      product_id: productId,
      assigned_hours: hours
    };

    const { error } = await upsertWorkPlanAssignment(assignment);
    if (error) {
      toast({ title: "Error", description: "No se pudo actualizar la asignación", variant: "destructive" });
      return;
    }

    // Actualizar estado local
    setAssignments(prev => {
      const existing = prev.find(a => a.product_id === productId);
      if (existing) {
        return prev.map(a => 
          a.product_id === productId 
            ? { ...a, assigned_hours: hours }
            : a
        );
      } else {
        return [...prev, assignment];
      }
    });

    // Actualizar total de horas del plan
    const totalHours = assignments.reduce((sum, a) => 
      a.product_id === productId ? sum + hours : sum + a.assigned_hours, 0
    );

    if (workPlan) {
      await updateWorkPlan(workPlan.id, { total_hours_assigned: totalHours });
      setWorkPlan(prev => ({ ...prev, total_hours_assigned: totalHours }));
    }
  };

  const getAssignedHours = (productId: string) => {
    return inputValues[productId] || '0';
  };

  const getTotalAssignedHours = () => {
    return assignments.reduce((sum, a) => sum + a.assigned_hours, 0);
  };

  const getAvailableHours = () => {
    return (manager.total_hours || 0) - getTotalAssignedHours();
  };

  const submitForApproval = async () => {
    if (!workPlan) return;

    const { error } = await updateWorkPlan(workPlan.id, { status: 'submitted' });
    if (error) {
      toast({ title: "Error", description: "No se pudo enviar para aprobación", variant: "destructive" });
      return;
    }

    toast({ title: "Éxito", description: "Plan enviado para aprobación" });
    setWorkPlan(prev => ({ ...prev, status: 'submitted' }));
    onSave();
  };

  if (loading) {
    return <div className="flex justify-center p-8">Cargando...</div>;
  }

  // Organizar datos por eje estratégico
  const organizedData = strategicAxes.map(axis => ({
    ...axis,
    actions: actions
      .filter(action => action.strategic_axis_id === axis.id)
      .map(action => ({
        ...action,
        products: products.filter(product => product.action_id === action.id)
      }))
  }));

  return (
    <Card className="w-full max-w-7xl">
      <CardHeader>
        <CardTitle className="text-xl font-bold">
          Plan de Trabajo - {manager.full_name}
        </CardTitle>
        <div className="text-sm text-gray-600 space-y-1">
          <p>Programa: {manager.academic_programs?.[0]?.name}</p>
          <p>Horas Disponibles: <span className="font-bold text-blue-600">{manager.total_hours}</span></p>
          <p>Horas Asignadas: <span className="font-bold text-green-600">{getTotalAssignedHours()}</span></p>
          <p>Balance: <span className={`font-bold ${getAvailableHours() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {getAvailableHours()}
          </span></p>
        </div>
      </CardHeader>
      
      <CardContent>
        <Table className="border">
          <TableHeader>
            <TableRow className="bg-blue-600">
              <TableHead className="text-white font-bold border border-gray-300 text-center w-20">
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
              axis.actions.map((action, actionIndex) => 
                action.products.map((product, productIndex) => {
                  const isFirstActionRow = productIndex === 0;
                  const isFirstAxisRow = actionIndex === 0 && productIndex === 0;
                  const axisRowspan = axis.actions.reduce((sum, a) => sum + a.products.length, 0);
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
                          value={getAssignedHours(product.id)}
                          onChange={(e) => handleInputChange(product.id, e.target.value)}
                          onBlur={(e) => handleInputBlur(product.id, e.target.value)}
                          className="w-16 h-8 text-center"
                          disabled={workPlan?.status === 'submitted' || workPlan?.status === 'approved'}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })
              )
            )}
          </TableBody>
        </Table>

        <div className="flex justify-between items-center mt-6 p-4 bg-gray-50 rounded">
          <div className="space-x-4">
            <span className="text-sm">
              <strong>Total Horas:</strong> {getTotalAssignedHours()} / {manager.total_hours}
            </span>
            <span className={`text-sm font-bold ${getAvailableHours() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              Balance: {getAvailableHours()}
            </span>
          </div>
          
          <div className="space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cerrar
            </Button>
            {workPlan?.status !== 'submitted' && workPlan?.status !== 'approved' && (
              <Button 
                onClick={submitForApproval}
                disabled={getAvailableHours() < 0}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Enviar para Aprobación
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
