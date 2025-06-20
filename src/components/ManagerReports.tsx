
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { useToast } from "@/hooks/use-toast";
import { FileText, Eye, CheckCircle, Clock, Edit } from "lucide-react";

export function ManagerReports() {
  const { fetchManagerReports, fetchWorkPlans } = useSupabaseData();
  const { toast } = useToast();
  
  const [reports, setReports] = useState<any[]>([]);
  const [workPlans, setWorkPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [reportsResult, workPlansResult] = await Promise.all([
        fetchManagerReports(),
        fetchWorkPlans()
      ]);

      setReports(reportsResult.data || []);
      setWorkPlans(workPlansResult.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los informes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="secondary"><Edit className="w-3 h-3 mr-1" />Borrador</Badge>;
      case 'submitted':
        return <Badge variant="default"><Clock className="w-3 h-3 mr-1" />Enviado</Badge>;
      case 'reviewed':
        return <Badge variant="default" className="bg-green-600"><CheckCircle className="w-3 h-3 mr-1" />Revisado</Badge>;
      default:
        return <Badge variant="outline">Sin estado</Badge>;
    }
  };

  const getApprovedWorkPlans = () => {
    return workPlans.filter(plan => plan.status === 'approved');
  };

  const getReportForWorkPlan = (workPlanId: string) => {
    return reports.find(report => report.work_plan_id === workPlanId);
  };

  if (loading) {
    return <div className="flex justify-center p-8">Cargando informes...</div>;
  }

  const approvedWorkPlans = getApprovedWorkPlans();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Informes de Gestores
          </CardTitle>
        </CardHeader>
        <CardContent>
          {approvedWorkPlans.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No hay planes de trabajo aprobados para generar informes.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Gestor</TableHead>
                  <TableHead>Programa</TableHead>
                  <TableHead>Campus</TableHead>
                  <TableHead>Plan de Trabajo</TableHead>
                  <TableHead>Estado del Informe</TableHead>
                  <TableHead>Fecha de Envío</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {approvedWorkPlans.map((workPlan) => {
                  const report = getReportForWorkPlan(workPlan.id);
                  return (
                    <TableRow key={workPlan.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{workPlan.manager?.full_name}</div>
                          <div className="text-sm text-gray-500">{workPlan.manager?.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>{workPlan.program?.name}</TableCell>
                      <TableCell>{workPlan.program?.campus?.name}</TableCell>
                      <TableCell>
                        <Badge variant="default" className="bg-green-600">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Aprobado
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {report ? getStatusBadge(report.status) : (
                          <Badge variant="outline">Sin informe</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {report?.submitted_date ? 
                          new Date(report.submitted_date).toLocaleDateString('es-ES') : 
                          '-'
                        }
                      </TableCell>
                      <TableCell>
                        {report ? (
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4 mr-1" />
                            Ver Informe
                          </Button>
                        ) : (
                          <span className="text-sm text-gray-500">
                            Esperando informe del gestor
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
