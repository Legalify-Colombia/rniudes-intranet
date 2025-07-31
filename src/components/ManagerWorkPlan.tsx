import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { CustomPlanForm } from "./CustomPlanForm";
import { StructuredWorkPlanForm } from "./StructuredWorkPlanForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, FileText, Clock, CheckCircle, Edit } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function ManagerWorkPlan() {
  const { profile } = useAuth();
  const { fetchManagers, fetchWorkPlans, fetchPlanTypes } = useSupabaseData();
  const [managerData, setManagerData] = useState<any>(null);
  const [assignedPlans, setAssignedPlans] = useState<any[]>([]);
  const [planTypes, setPlanTypes] = useState<any[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadManagerData();
  }, [profile]);

  const loadManagerData = async () => {
    if (!profile || profile.role !== 'Gestor') {
      setLoading(false);
      return;
    }

    try {
      const { data: managers } = await fetchManagers();
      const currentManager = managers?.find(m => m.id === profile.id);
      setManagerData(currentManager);

      const { data: workPlans } = await fetchWorkPlans();
      const managerPlans = workPlans?.filter(plan => plan.manager_id === profile.id) || [];
      setAssignedPlans(managerPlans);

      const { data: planTypesData } = await fetchPlanTypes();
      setPlanTypes(planTypesData || []);
    } catch (error) {
      console.error('Error loading manager data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Borrador</Badge>;
      case 'submitted':
        return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />Enviado</Badge>;
      case 'approved':
        return <Badge className="bg-green-600"><CheckCircle className="h-3 w-3 mr-1" />Aprobado</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rechazado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleEditPlan = (plan: any) => {
    setSelectedPlan(plan);
  };
  
  const handleBackToList = () => {
    setSelectedPlan(null);
    // REMOVED: loadManagerData() call to prevent unnecessary data reload
  };

  if (loading) {
    return <div className="flex justify-center p-8">Cargando...</div>;
  }

  if (profile?.role !== 'Gestor') {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No tienes permisos para acceder a esta sección.
        </AlertDescription>
      </Alert>
    );
  }

  if (!managerData) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No se encontraron datos de gestor para tu usuario.
        </AlertDescription>
      </Alert>
    );
  }
  
  if (!managerData.total_hours || managerData.total_hours === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Tu perfil no tiene horas de trabajo asignadas. Contacta al administrador para que configure tus horas de trabajo.
        </AlertDescription>
      </Alert>
    );
  }

  if (selectedPlan) {
    const planType = planTypes.find(pt => pt.id === selectedPlan.plan_type_id);
    const isStructured = planType?.uses_structured_elements;

    if (isStructured) {
      return (
        <StructuredWorkPlanForm
          planType={planType}
          manager={managerData}
          onClose={handleBackToList}
          onSave={handleBackToList}
        />
      );
    } else {
      return (
        <CustomPlanForm
          planId={selectedPlan.id}
          planTypeId={selectedPlan.plan_type_id}
          onSave={handleBackToList}
          embedded={false}
        />
      );
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Mis Planes de Trabajo
          </CardTitle>
        </CardHeader>
        <CardContent>
          {assignedPlans.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No tienes planes de trabajo asignados. Contacta al administrador para que te asigne un plan de trabajo.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid gap-4">
              {assignedPlans.map((plan) => (
                <Card key={plan.id} className="border-l-4 border-l-blue-500">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{plan.title}</h3>
                        <p className="text-sm text-gray-600">{plan.plan_type?.name}</p>
                      </div>
                      {getStatusBadge(plan.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-4">
                      <p className="text-sm text-gray-700">{plan.plan_type?.description}</p>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Fecha de creación:</span>
                          <p>{new Date(plan.created_at).toLocaleDateString()}</p>
                        </div>
                        {plan.submitted_date && (
                          <div>
                            <span className="font-medium">Fecha de envío:</span>
                            <p>{new Date(plan.submitted_date).toLocaleDateString()}</p>
                          </div>
                        )}
                        {plan.approved_date && (
                          <div>
                            <span className="font-medium">Fecha de aprobación:</span>
                            <p>{new Date(plan.approved_date).toLocaleDateString()}</p>
                          </div>
                        )}
                      </div>

                      {plan.approval_comments && (
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <span className="font-medium text-sm">Comentarios:</span>
                          <p className="text-sm text-gray-700 mt-1">{plan.approval_comments}</p>
                        </div>
                      )}

                      <div className="pt-4">
                        {(plan.status === 'draft' || plan.status === 'rejected') ? (
                          <Button 
                            onClick={() => handleEditPlan(plan)}
                            className="w-full"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            {plan.status === 'rejected' ? 'Editar y Reenviar Plan' : 'Editar Plan'}
                          </Button>
                        ) : (
                          <Button 
                            variant="outline"
                            onClick={() => handleEditPlan(plan)}
                            className="w-full"
                          >
                            Ver Plan
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
