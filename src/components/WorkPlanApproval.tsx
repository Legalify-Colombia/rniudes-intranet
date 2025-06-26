
import { useState, useEffect } from "react";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { useWorkPlans } from "@/hooks/useWorkPlans";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CheckCircle, XCircle, Clock, AlertCircle, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { WorkPlanPreview } from "./WorkPlanPreview";
import { useAuth } from "@/hooks/useAuth";

export function WorkPlanApproval() {
  const { fetchCustomPlans } = useSupabaseData();
  const { approveWorkPlan } = useWorkPlans();
  const { profile } = useAuth();
  const [workPlans, setWorkPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [comments, setComments] = useState<{ [key: string]: string }>({});
  const [previewOpen, setPreviewOpen] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!profile) {
      setLoading(false);
      return;
    }

    if (!['Coordinador', 'Administrador'].includes(profile.role)) {
      setLoading(false);
      return;
    }

    loadPendingWorkPlans();
  }, [profile]);

  const loadPendingWorkPlans = async () => {
    try {
      console.log('Cargando planes pendientes para aprobación...');
      const { data, error } = await fetchCustomPlans();
      
      if (error) {
        console.error('Error al cargar planes:', error);
        throw error;
      }
      
      console.log('Todos los planes cargados:', data);
      
      // Filtrar solo los planes que están enviados (submitted) y pendientes de aprobación
      const pendingPlans = (data || []).filter(plan => 
        plan.status === 'submitted'
      );
      
      console.log('Planes pendientes de aprobación:', pendingPlans);
      setWorkPlans(pendingPlans);
    } catch (error) {
      console.error('Error loading pending work plans:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los planes de trabajo pendientes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (workPlanId: string, newStatus: 'approved' | 'rejected') => {
    if (!profile) {
      toast({
        title: "Error",
        description: "No se encontró el perfil del usuario",
        variant: "destructive",
      });
      return;
    }

    setActionLoading(workPlanId);
    try {
      console.log('Iniciando aprobación:', { 
        workPlanId, 
        newStatus, 
        comments: comments[workPlanId],
        approvedBy: profile.id
      });
      
      const { data, error } = await approveWorkPlan(
        workPlanId, 
        profile.id, 
        comments[workPlanId]
      );
      
      if (error) {
        console.error('Error en aprobación:', error);
        throw error;
      }

      console.log('Aprobación exitosa:', data);

      toast({
        title: "Éxito",
        description: `Plan de trabajo ${newStatus === 'approved' ? 'aprobado' : 'rechazado'} correctamente`,
      });

      // Recargar la lista
      await loadPendingWorkPlans();
      
      // Limpiar comentarios
      setComments(prev => {
        const newComments = { ...prev };
        delete newComments[workPlanId];
        return newComments;
      });
    } catch (error) {
      console.error('Error approving work plan:', error);
      toast({
        title: "Error",
        description: `No se pudo ${newStatus === 'approved' ? 'aprobar' : 'rechazar'} el plan de trabajo`,
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Verificar permisos del usuario
  if (!profile) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Cargando información del usuario...
        </AlertDescription>
      </Alert>
    );
  }

  if (!['Coordinador', 'Administrador'].includes(profile.role)) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No tienes permisos para aprobar planes de trabajo. Solo coordinadores y administradores pueden realizar esta acción.
        </AlertDescription>
      </Alert>
    );
  }

  if (loading) {
    return <div className="flex justify-center p-8">Cargando planes pendientes...</div>;
  }

  if (workPlans.length === 0) {
    return (
      <Alert>
        <Clock className="h-4 w-4" />
        <AlertDescription>
          No hay planes de trabajo pendientes por aprobar.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Aprobación de Planes de Trabajo</h1>
        <Badge variant="outline">
          {workPlans.length} pendiente{workPlans.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      <div className="grid gap-6">
        {workPlans.map((plan) => (
          <Card key={plan.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  Plan de Trabajo - {plan.title}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Dialog open={previewOpen === plan.id} onOpenChange={(open) => setPreviewOpen(open ? plan.id : null)}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        Previsualizar
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-6xl max-h-[90vh] overflow-auto">
                      <DialogHeader>
                        <DialogTitle>Previsualización del Plan de Trabajo</DialogTitle>
                      </DialogHeader>
                      <WorkPlanPreview workPlanId={plan.id} />
                    </DialogContent>
                  </Dialog>
                  <Badge variant="secondary">
                    <Clock className="h-3 w-3 mr-1" />
                    Enviado
                  </Badge>
                </div>
              </div>
              <div className="text-sm text-gray-600">
                <p><strong>Título:</strong> {plan.title}</p>
                <p><strong>Fecha de envío:</strong> {plan.submitted_date ? new Date(plan.submitted_date).toLocaleDateString('es-ES') : 'No disponible'}</p>
                <p><strong>Estado actual:</strong> {plan.status}</p>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Comentarios de aprobación:
                </label>
                <Textarea
                  value={comments[plan.id] || ''}
                  onChange={(e) => setComments(prev => ({
                    ...prev,
                    [plan.id]: e.target.value
                  }))}
                  placeholder="Agregar comentarios sobre la aprobación o rechazo..."
                  className="min-h-[100px]"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => handleApproval(plan.id, 'approved')}
                  disabled={actionLoading === plan.id}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {actionLoading === plan.id ? 'Procesando...' : 'Aprobar'}
                </Button>
                <Button
                  onClick={() => handleApproval(plan.id, 'rejected')}
                  disabled={actionLoading === plan.id}
                  variant="destructive"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  {actionLoading === plan.id ? 'Procesando...' : 'Rechazar'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
