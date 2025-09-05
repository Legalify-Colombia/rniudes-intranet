import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { CheckCircle, Clock, XCircle } from "lucide-react";
import { WorkPlanPDFExporter } from "./WorkPlanPDFExporter";
import { WorkPlanPrintView } from "./WorkPlanPrintView";

interface WorkPlanPreviewProps {
  workPlanId: string;
}

// Interfaz para definir la estructura de los datos del plan, mejorando la legibilidad
interface Profile {
  full_name: string;
  email: string;
  position?: string; // Asumiendo que 'position' puede existir en el perfil
  campus?: { name: string };
  program?: { name: string };
  faculty?: { name: string };
}

interface Plan {
  status: string;
  manager: Profile;
  plan_type: { name: string };
  objectives?: string;
  submitted_date?: string;
  total_hours_assigned?: number;
}

export function WorkPlanPreview({ workPlanId }: WorkPlanPreviewProps) {
  const { fetchCustomPlanDetails, fetchCustomPlanAssignments } = useSupabaseData();
  const [workPlan, setWorkPlan] = useState<Plan | null>(null);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadWorkPlanData = async () => {
      setLoading(true);
      try {
        // Cargar datos del plan de trabajo (la consulta ya fue corregida en el hook)
        const { data: planData, error: planError } = await fetchCustomPlanDetails(workPlanId);
        if (planError) throw planError;
        setWorkPlan(planData);

        // Cargar asignaciones con datos completos
        const { data: assignmentsData, error: assignmentsError } = await fetchCustomPlanAssignments(workPlanId);
        if (assignmentsError) throw assignmentsError;
        setAssignments(assignmentsData || []);

      } catch (error) {
        console.error('Error loading work plan data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (workPlanId) {
      loadWorkPlanData();
    }
  }, [workPlanId]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Borrador</Badge>;
      case 'submitted': // Añadido para que coincida con el estado real
        return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />Enviado</Badge>;
      case 'approved':
        return <Badge className="bg-green-600"><CheckCircle className="h-3 w-3 mr-1" />Aprobado</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rechazado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const organizeAssignments = () => {
    if (!assignments || assignments.length === 0) {
      return [];
    }
    const axesMap = new Map();
    assignments.forEach(assignment => {
      if (assignment.product?.action?.strategic_axis && (assignment.assigned_hours || 0) > 0) {
        const axis = assignment.product.action.strategic_axis;
        const action = assignment.product.action;
        const product = assignment.product;

        if (!axesMap.has(axis.id)) {
          axesMap.set(axis.id, { ...axis, actions: new Map() });
        }
        const axisData = axesMap.get(axis.id);
        
        if (!axisData.actions.has(action.id)) {
          axisData.actions.set(action.id, { ...action, products: [] });
        }
        const actionData = axisData.actions.get(action.id);

        actionData.products.push({ ...product, assigned_hours: assignment.assigned_hours });
      }
    });
    return Array.from(axesMap.values()).map(axis => ({
      ...axis,
      actions: Array.from(axis.actions.values())
    }));
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
    return <div className="text-center text-gray-500">No se pudo cargar el plan de trabajo.</div>;
  }

  const organizedData = organizeAssignments();
  const totalHours = assignments?.reduce((sum, assignment) => sum + (assignment.assigned_hours || 0), 0) || 0;

  return (
    <div className="space-y-6">
      <div className="no-print flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Vista Previa del Plan</h2>
        <WorkPlanPDFExporter 
          workPlan={workPlan} 
          assignments={assignments}
          className="no-print"
        />
      </div>

      <WorkPlanPrintView workPlan={workPlan} assignments={assignments} />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Información del Plan</CardTitle>
            {getStatusBadge(workPlan.status)}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* --- INICIO DE CORRECCIONES --- */}
          {/* Se accede a los datos anidados del gestor y tipo de plan */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Gestor:</span> {workPlan.manager?.full_name || 'N/A'}
            </div>
            <div>
              <span className="font-medium">Email:</span> {workPlan.manager?.email || 'N/A'}
            </div>
            <div>
              <span className="font-medium">Cargo:</span> {workPlan.manager?.position || 'N/A'}
            </div>
            <div>
              <span className="font-medium">Tipo de Plan:</span> {workPlan.plan_type?.name || 'N/A'}
            </div>
            <div>
              <span className="font-medium">Campus:</span> {workPlan.manager?.campus?.name || 'N/A'}
            </div>
            <div>
              <span className="font-medium">Programa:</span> {workPlan.manager?.program?.name || 'N/A'}
            </div>
            <div>
              <span className="font-medium">Facultad:</span> {workPlan.manager?.faculty?.name || 'N/A'}
            </div>
            <div>
              <span className="font-medium">Total Horas:</span> {totalHours}
            </div>
          </div>
          {/* --- FIN DE CORRECCIONES --- */}
          
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
                <TableRow className="bg-blue-600 hover:bg-blue-700">
                  <TableHead className="text-white font-bold border-r text-center">EJE ESTRATÉGICO</TableHead>
                  <TableHead className="text-white font-bold border-r text-center">ACCIÓN</TableHead>
                  <TableHead className="text-white font-bold border-r text-center">PRODUCTO</TableHead>
                  <TableHead className="text-white font-bold text-center w-24">HORAS</TableHead>
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
                        <TableRow key={product.id}>
                          {isFirstAxisRow && (
                            <TableCell rowSpan={axisRowspan} className="border-r align-middle text-center font-medium bg-blue-50">
                              <div className="text-sm font-bold">{axis.code} - {axis.name}</div>
                            </TableCell>
                          )}
                          {isFirstActionRow && (
                            <TableCell rowSpan={actionRowspan} className="border-r align-middle text-sm p-2">
                              <div className="font-medium text-gray-800">{action.code} {action.name}</div>
                            </TableCell>
                          )}
                          <TableCell className="border-r text-sm p-2">{product.name}</TableCell>
                          <TableCell className="text-center p-2 font-medium">{product.assigned_hours}</TableCell>
                        </TableRow>
                      );
                    })
                  )
                )}
                <TableRow className="bg-gray-100 font-bold">
                  <TableCell colSpan={3} className="text-right p-2">TOTAL:</TableCell>
                  <TableCell className="text-center text-lg p-2">{totalHours}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
