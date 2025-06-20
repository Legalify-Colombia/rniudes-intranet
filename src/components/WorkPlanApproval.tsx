
import { useState, useEffect } from "react";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function WorkPlanApproval() {
  const { fetchPendingWorkPlans, approveWorkPlan } = useSupabaseData();
  const [workPlans, setWorkPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [comments, setComments] = useState<{ [key: string]: string }>({});
  const { toast } = useToast();

  useEffect(() => {
    loadPendingWorkPlans();
  }, []);

  const loadPendingWorkPlans = async () => {
    try {
      const { data, error } = await fetchPendingWorkPlans();
      if (error) throw error;
      setWorkPlans(data || []);
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

  const handleApproval = async (workPlanId: string, status: 'approved' | 'rejected') => {
    setActionLoading(workPlanId);
    try {
      const { error } = await approveWorkPlan(workPlanId, status, comments[workPlanId]);
      if (error) throw error;

      toast({
        title: "Éxito",
        description: `Plan de trabajo ${status === 'approved' ? 'aprobado' : 'rechazado'} correctamente`,
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
        description: "No se pudo procesar la aprobación",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

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
                  Plan de Trabajo - {plan.manager?.full_name}
                </CardTitle>
                <Badge variant="secondary">
                  <Clock className="h-3 w-3 mr-1" />
                  Pendiente
                </Badge>
              </div>
              <div className="text-sm text-gray-600">
                <p><strong>Gestor:</strong> {plan.manager?.full_name}</p>
                <p><strong>Email:</strong> {plan.manager?.email}</p>
                <p><strong>Cargo:</strong> {plan.manager?.position}</p>
                <p><strong>Fecha de envío:</strong> {new Date(plan.submitted_date).toLocaleDateString()}</p>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Objetivos:</h4>
                <p className="text-sm text-gray-700">{plan.objectives}</p>
              </div>

              <div>
                <h4 className="font-medium mb-2">Horas totales asignadas:</h4>
                <p className="text-sm">{plan.total_assigned_hours} horas</p>
              </div>

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
