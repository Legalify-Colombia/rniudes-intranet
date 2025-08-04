
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { CheckCircle, Clock, XCircle } from "lucide-react";

interface WorkPlanPreviewProps {
  workPlanId: string;
}

export function WorkPlanPreview({ workPlanId }: WorkPlanPreviewProps) {
  const { fetchCustomPlanDetails, fetchCustomPlanAssignments, fetchStrategicAxes, fetchActions, fetchProducts } = useSupabaseData();
  const [workPlan, setWorkPlan] = useState<any>(null);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [strategicAxes, setStrategicAxes] = useState<any[]>([]);
  const [actions, setActions] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWorkPlanData();
  }, [workPlanId]);

  const loadWorkPlanData = async () => {
    setLoading(true);
    try {
      // Cargar datos del plan de trabajo usando la función optimizada
      const { data: planData, error: planError } = await fetchCustomPlanDetails(workPlanId);
      if (planError) throw planError;
      setWorkPlan(planData);

      // Cargar asignaciones con datos completos
      const { data: assignmentsData, error: assignmentsError } = await fetchCustomPlanAssignments(workPlanId);
      if (assignmentsError) throw assignmentsError;
      setAssignments(assignmentsData || []);

      // Cargar datos de referencia
      const [axesRes, actionsRes, productsRes] = await Promise.all([
        fetchStrategicAxes(),
        fetchActions(),
        fetchProducts()
      ]);

      setStrategicAxes(axesRes.data || []);
      setActions(actionsRes.data || []);
      setProducts(productsRes.data || []);
    } catch (error) {
      console.error('Error loading work plan data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Borrador</Badge>;
      case 'pending':
        return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />Pendiente</Badge>;
      case 'approved':
        return <Badge className="bg-green-600"><CheckCircle className="h-3 w-3 mr-1" />Aprobado</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rechazado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Organizar asignaciones por eje estratégico
  const organizeAssignments = () => {
    if (!assignments || assignments.length === 0) {
      return [];
    }

    // Crear mapa de asignaciones por producto
    const assignmentMap = new Map();
    assignments.forEach(assignment => {
      if (assignment.product_id && assignment.assigned_hours > 0) {
        assignmentMap.set(assignment.product_id, assignment.assigned_hours);
      }
    });

    // Organizar usando los datos relacionados de las asignaciones
    const axesMap = new Map();
    
    assignments.forEach(assignment => {
      if (assignment.product?.action?.strategic_axis && assignment.assigned_hours > 0) {
        const axis = assignment.product.action.strategic_axis;
        const action = assignment.product.action;
        const product = assignment.product;

        if (!axesMap.has(axis.id)) {
          axesMap.set(axis.id, {
            ...axis,
            actions: new Map()
          });
        }

        const axisData = axesMap.get(axis.id);
        
        if (!axisData.actions.has(action.id)) {
          axisData.actions.set(action.id, {
            ...action,
            products: []
          });
        }

        const actionData = axisData.actions.get(action.id);
        actionData.products.push({
          ...product,
          assigned_hours: assignment.assigned_hours
        });
      }
    });

    // Convertir Maps a arrays
    const organized = Array.from(axesMap.values()).map(axis => ({
      ...axis,
      actions: Array.from(axis.actions.values())
    }));

    return organized;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!workPlan) {
    return <div className="text-center text-gray-500">No se pudo cargar el plan de trabajo</div>;
  }

  const organizedData = organizeAssignments();

  return (
    <div className="space-y-6">
      {/* Información básica del plan */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Información del Plan</CardTitle>
            {getStatusBadge(workPlan.status)}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Gestor:</span> {workPlan.manager_name || 'N/A'}
            </div>
            <div>
              <span className="font-medium">Email:</span> {workPlan.manager_email || 'N/A'}
            </div>
            <div>
              <span className="font-medium">Cargo:</span> {workPlan.manager_position || 'N/A'}
            </div>
            <div>
              <span className="font-medium">Tipo de Plan:</span> {workPlan.plan_type_name || 'N/A'}
            </div>
            <div>
              <span className="font-medium">Campus:</span> {workPlan.campus_name || 'N/A'}
            </div>
            <div>
              <span className="font-medium">Programa:</span> {workPlan.program_name || 'N/A'}
            </div>
            <div>
              <span className="font-medium">Facultad:</span> {workPlan.faculty_name || 'N/A'}
            </div>
            <div>
              <span className="font-medium">Total Horas:</span> {workPlan.total_hours_assigned || assignments?.reduce((sum, assignment) => sum + (assignment.assigned_hours || 0), 0) || 0}
            </div>
          </div>
          
          {workPlan.objectives && (
            <div>
              <span className="font-medium">Objetivos:</span>
              <p className="mt-1 text-sm text-gray-700 bg-gray-50 p-3 rounded">
                {workPlan.objectives}
              </p>
            </div>
          )}

          {workPlan.submitted_date && (
            <div>
              <span className="font-medium">Fecha de envío:</span> {new Date(workPlan.submitted_date).toLocaleDateString()}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detalle de asignaciones */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Asignación de Horas por Producto</CardTitle>
        </CardHeader>
        <CardContent>
          {organizedData.length === 0 ? (
            <p className="text-center text-gray-500">No hay asignaciones de horas</p>
          ) : (
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
                              <div className="text-sm font-bold">
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
                          <TableCell className="border border-gray-300 text-center p-2 font-medium">
                            {product.assigned_hours}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )
                )}
                <TableRow className="bg-gray-100">
                  <TableCell colSpan={3} className="border border-gray-300 text-right font-bold">
                    TOTAL:
                  </TableCell>
                  <TableCell className="border border-gray-300 text-center font-bold text-lg">
                    {assignments?.reduce((sum, assignment) => sum + (assignment.assigned_hours || 0), 0) || 0}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
