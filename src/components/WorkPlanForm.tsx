import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, XCircle } from "lucide-react";
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
    fetchPlanTypes,
    createCustomPlan,
    updateCustomPlan,
    upsertCustomPlanAssignment,
    submitCustomPlan // Asegúrate de que esta función esté disponible en useSupabaseData
  } = useSupabaseData();
  const { toast } = useToast();

  const [strategicAxes, setStrategicAxes] = useState<any[]>([]);
  const [actions, setActions] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [planTypes, setPlanTypes] = useState<any[]>([]);
  const [workPlan, setWorkPlan] = useState<any>(null);
  const [objectives, setObjectives] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [inputValues, setInputValues] = useState<{[key: string]: number}>({});

  useEffect(() => {
    loadData();
  }, [manager]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [
        { data: axesData },
        { data: actionsData },
        { data: productsData },
        { data: customPlansData },
        { data: planTypesData }
      ] = await Promise.all([
        fetchStrategicAxes(),
        fetchActions(),
        fetchProducts(),
        fetchWorkPlans(),
        fetchPlanTypes(),
      ]);

      const validAxes = (axesData || []).filter(axis => axis.id && typeof axis.id === 'string' && axis.id.trim().length > 0);
      setStrategicAxes(validAxes);

      const validActions = (actionsData || []).filter(action => action.id && typeof action.id === 'string' && action.id.trim().length > 0);
      setActions(validActions);

      const validProducts = (productsData || []).filter(product => product.id && typeof product.id === 'string' && product.id.trim().length > 0);
      setProducts(validProducts);

      setPlanTypes(planTypesData || []);

      const existingPlan = customPlansData?.find(
        (plan: any) => plan.manager_id === manager.id
      );

      if (existingPlan) {
        setWorkPlan(existingPlan);
        const planObjectives = existingPlan.title || '';
        setObjectives(planObjectives);
        
        const { data: assignmentsData } = await fetchWorkPlanAssignments(existingPlan.id);
        const initialValues: {[key: string]: number} = {};
        assignmentsData?.forEach((assignment: any) => {
          initialValues[assignment.product_id] = assignment.assigned_hours;
        });
        setInputValues(initialValues);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast({ title: "Error", description: "No se pudieron cargar los datos", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleHoursChange = (productId: string, value: string) => {
    const numericValue = parseInt(value) || 0;
    setInputValues(prev => ({ ...prev, [productId]: numericValue }));
  };

  const handleSave = async () => {
    let currentWorkPlan = workPlan;

    try {
      setLoading(true);
      if (!currentWorkPlan) {
        const chosenPlanTypeId = (manager as any).plan_type_id || planTypes?.[0]?.id;
        if (!chosenPlanTypeId) {
          toast({ title: "Asigne un tipo de plan", description: "No se encontró un tipo de plan válido para este gestor.", variant: "destructive" });
          setLoading(false);
          return;
        }
        const newPlan = {
          manager_id: manager.id,
          plan_type_id: chosenPlanTypeId,
          title: objectives,
          status: 'draft'
        };
        const { data: createdPlan, error } = await createCustomPlan(newPlan);
        if (error) {
          throw error;
        }
        currentWorkPlan = createdPlan;
        setWorkPlan(createdPlan);
      } else {
        await updateCustomPlan(currentWorkPlan.id, { title: objectives });
      }

      await Promise.all(
        Object.entries(inputValues).map(async ([productId, hours]) => {
          if (hours > 0) {
            await upsertCustomPlanAssignment({
              custom_plan_id: currentWorkPlan.id,
              product_id: productId,
              assigned_hours: hours
            });
          }
        })
      );

      toast({ title: "Éxito", description: "Plan guardado correctamente" });
    } catch (error) {
      console.error('Error saving data:', error);
      toast({ title: "Error", description: "No se pudo guardar el plan", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const submitForApproval = async () => {
    if (!workPlan) {
      toast({ title: "Error", description: "No hay plan de trabajo para enviar", variant: "destructive" });
      return;
    }
    if (!objectives.trim()) {
      toast({ title: "Error", description: "Debe agregar objetivos antes de enviar", variant: "destructive" });
      return;
    }
    if (getAvailableHours() < 0) {
      toast({ title: "Error", description: "Las horas asignadas superan las disponibles", variant: "destructive" });
      return;
    }

    try {
      setLoading(true);
      await submitCustomPlan(workPlan.id);
      toast({ title: "Éxito", description: "Plan enviado para aprobación" });
      onSave();
    } catch (error) {
      console.error('Error submitting plan:', error);
      toast({ title: "Error", description: "No se pudo enviar el plan para aprobación", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const getAssignedHours = (productId: string) => {
    return inputValues[productId] || 0;
  };

  const getTotalAssignedHours = () => {
    return Object.values(inputValues).reduce((sum, hours) => sum + hours, 0);
  };

  const getAvailableHours = () => {
    const totalHours = manager.total_hours || 0;
    return totalHours - getTotalAssignedHours();
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

  const organizedData = strategicAxes.map(axis => ({
    ...axis,
    actions: actions
      .filter(action => action.strategic_axis_id === axis.id)
      .map(action => ({
        ...action,
        products: products.filter(product => product.action_id === action.id)
      }))
  }));

  const isReadOnly = workPlan?.status === 'submitted' || workPlan?.status === 'approved';

  return (
    <Card className="w-full max-w-7xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold">
            Plan de Trabajo - {manager.full_name}
          </CardTitle>
          {workPlan?.status && getStatusBadge(workPlan.status)}
        </div>
        <div className="text-sm text-gray-600 space-y-1">
          <p>Programa: {manager.academic_programs?.[0]?.name}</p>
          <p>Horas Totales Disponibles: <span className="font-bold text-blue-600">{manager.total_hours || 0}</span></p>
          <p>Horas Asignadas: <span className="font-bold text-green-600">{getTotalAssignedHours()}</span></p>
          <p>Balance: <span className={`font-bold ${getAvailableHours() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {getAvailableHours()}
          </span></p>
          <p className="text-xs text-gray-500">
            (Cálculo: {manager.weekly_hours || 0} horas semanales × {manager.number_of_weeks || 16} semanas = {manager.total_hours || 0} horas totales)
          </p>
        </div>

        {workPlan?.status === 'rejected' && workPlan?.approval_comments && (
          <Alert className="border-red-200 bg-red-50">
            <XCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>Plan rechazado:</strong> {workPlan.approval_comments}
            </AlertDescription>
          </Alert>
        )}

        {workPlan?.status === 'approved' && workPlan?.approval_comments && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>Plan aprobado:</strong> {workPlan.approval_comments}
            </AlertDescription>
          </Alert>
        )}
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
                          value={getAssignedHours(product.id)}
                          onChange={(e) => handleHoursChange(product.id, e.target.value)}
                          onBlur={handleSave}
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
            {workPlan?.status === 'draft' && (
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
  );
}
