
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FileText, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { useAuth } from "@/hooks/useAuth";
import { WorkPlanForm } from "./WorkPlanForm";

export function InternationalizationManagers() {
  const { fetchManagers, fetchWorkPlans, updateWorkPlan } = useSupabaseData();
  const { profile } = useAuth();
  const { toast } = useToast();

  const [managers, setManagers] = useState<any[]>([]);
  const [workPlans, setWorkPlans] = useState<any[]>([]);
  const [selectedManager, setSelectedManager] = useState<any>(null);
  const [workPlanDialog, setWorkPlanDialog] = useState(false);
  const [approvalDialog, setApprovalDialog] = useState(false);
  const [approvalComments, setApprovalComments] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: managersData } = await fetchManagers();
      const { data: workPlansData } = await fetchWorkPlans();
      
      setManagers(managersData || []);
      setWorkPlans(workPlansData || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getManagerWorkPlan = (managerId: string) => {
    return workPlans.find(plan => plan.manager_id === managerId);
  };

  const getStatusText = (status?: string) => {
    switch (status) {
      case 'draft': return 'Borrador';
      case 'submitted': return 'En revisión';
      case 'approved': return 'Aprobado';
      case 'rejected': return 'Rechazado';
      default: return 'Sin plan';
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const openWorkPlan = (manager: any) => {
    setSelectedManager(manager);
    setWorkPlanDialog(true);
  };

  const handleApproval = async (approved: boolean) => {
    if (!selectedManager) return;

    const workPlan = getManagerWorkPlan(selectedManager.id);
    if (!workPlan) return;

    try {
      const updates = {
        status: approved ? 'approved' : 'rejected',
        coordinator_approval_date: new Date().toISOString(),
        coordinator_comments: approvalComments,
        approved_by: profile?.id
      };

      const { error } = await updateWorkPlan(workPlan.id, updates);
      
      if (error) {
        toast({
          title: "Error",
          description: "No se pudo actualizar el estado del plan",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: approved ? "Plan aprobado" : "Plan rechazado",
        description: approvalComments || (approved ? "Plan aprobado exitosamente" : "Plan rechazado")
      });

      setApprovalDialog(false);
      setApprovalComments('');
      loadData(); // Recargar datos
    } catch (error) {
      console.error('Error updating work plan:', error);
    }
  };

  const canReviewPlans = () => {
    return profile?.role === 'Administrador' || profile?.role === 'Coordinador';
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="p-8">
          <div className="flex justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
              <p className="mt-4 text-gray-600">Cargando gestores...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-primary">
          Gestores de Internacionalización
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {managers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No hay gestores asignados a programas académicos.
            <br />
            Los gestores aparecerán aquí una vez que se les asigne un programa en el módulo de Campus y Programas.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Gestor</TableHead>
                <TableHead>Programa</TableHead>
                <TableHead>Campus/Facultad</TableHead>
                <TableHead>Horas Semanales</TableHead>
                <TableHead>Total Horas</TableHead>
                <TableHead>Estado del Plan</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {managers.map((manager) => {
                const workPlan = getManagerWorkPlan(manager.id);
                const program = manager.academic_programs?.[0];
                
                return (
                  <TableRow key={manager.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div className="font-semibold">{manager.full_name}</div>
                        <div className="text-sm text-gray-500">{manager.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>{program?.name || 'Sin asignar'}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{program?.campus?.name}</div>
                        <div className="text-gray-500">{program?.faculty?.name}</div>
                      </div>
                    </TableCell>
                    <TableCell>{manager.weekly_hours || 0}</TableCell>
                    <TableCell>{manager.total_hours || 0}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(workPlan?.status)}`}>
                        {getStatusText(workPlan?.status)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => openWorkPlan(manager)}
                        >
                          <FileText className="w-4 h-4 mr-1" />
                          {workPlan ? 'Ver Plan' : 'Crear Plan'}
                        </Button>
                        {workPlan?.status === 'submitted' && canReviewPlans() && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setSelectedManager(manager);
                              setApprovalDialog(true);
                            }}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Revisar
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}

        {/* Work Plan Dialog */}
        <Dialog open={workPlanDialog} onOpenChange={setWorkPlanDialog}>
          <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto p-0">
            {selectedManager && (
              <WorkPlanForm
                manager={selectedManager}
                onClose={() => setWorkPlanDialog(false)}
                onSave={() => {
                  setWorkPlanDialog(false);
                  loadData();
                }}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Approval Dialog */}
        <Dialog open={approvalDialog} onOpenChange={setApprovalDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Revisión del Plan de Trabajo</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <p><strong>Gestor:</strong> {selectedManager?.full_name}</p>
                <p><strong>Programa:</strong> {selectedManager?.academic_programs?.[0]?.name}</p>
                <p><strong>Horas asignadas:</strong> {getManagerWorkPlan(selectedManager?.id)?.total_hours_assigned || 0}</p>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="approvalComments" className="text-sm font-medium">
                  Comentarios y Observaciones
                </label>
                <Textarea
                  id="approvalComments"
                  value={approvalComments}
                  onChange={(e) => setApprovalComments(e.target.value)}
                  placeholder="Escriba sus comentarios sobre el plan de trabajo..."
                  className="min-h-20"
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => handleApproval(false)}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Rechazar
                </Button>
                <Button 
                  onClick={() => handleApproval(true)}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Aprobar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
