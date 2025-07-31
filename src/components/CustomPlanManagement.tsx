import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { usePlanTypes } from "@/hooks/usePlanTypes";
import { Eye, Edit, Plus, Settings } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CustomPlanForm } from "./CustomPlanForm";
import { CustomPlanSelector } from "./CustomPlanSelector";
import { PlanTypeConfiguration } from "./PlanTypeConfiguration";

export function CustomPlanManagement() {
  const [plans, setPlans] = useState<any[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<any | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [selectedPlanType, setSelectedPlanType] = useState<string>("");
  const [viewMode, setViewMode] = useState<'list' | 'form' | 'create' | 'config'>('list');
  const [isLoading, setIsLoading] = useState(false);
  
  const { profile } = useAuth();
  const { toast } = useToast();
  const { fetchWorkPlans } = useSupabaseData();

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setIsLoading(true);
      const result = await fetchWorkPlans();
      if (result.error) {
        console.error("Error loading plans:", result.error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los planes",
          variant: "destructive",
        });
      } else {
        // Filter plans to show custom plans only
        const customPlans = (result.data || []).filter(plan => plan.plan_type_id);
        setPlans(customPlans);
      }
    } catch (error) {
      console.error("Error loading plans:", error);
      toast({
        title: "Error",
        description: "Error inesperado al cargar los planes",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openPlanDetails = (plan: any) => {
    setSelectedPlan(plan);
    setSelectedPlanType(plan.plan_type_id); // Asegurar que el planTypeId se pase correctamente
    setViewMode('form');
  };

  const openCreatePlan = () => {
    setViewMode('create');
  };

  const openPlanTypeConfig = () => {
    setViewMode('config');
  };

  // Se ha mejorado la función para gestionar la creación del plan
  const handleCreatePlan = (planTypeId: string) => {
    setSelectedPlan(null); // Asegurarse de que no haya un plan seleccionado
    setSelectedPlanType(planTypeId);
    setViewMode('form');
  };

  const handleBack = () => {
    setSelectedPlan(null);
    setSelectedPlanType("");
    setViewMode('list');
    loadPlans();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="secondary">Borrador</Badge>;
      case 'submitted':
        return <Badge variant="outline">Enviado</Badge>;
      case 'approved':
        return <Badge className="bg-green-600">Aprobado</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rechazado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (viewMode === 'form') {
    return (
      <CustomPlanForm
        planId={selectedPlan?.id}
        planTypeId={selectedPlanType}
        onSave={handleBack}
      />
    );
  }

  if (viewMode === 'create') {
    return (
      <CustomPlanSelector
        onSelect={handleCreatePlan}
        onCancel={handleBack}
      />
    );
  }

  if (viewMode === 'config') {
    return (
      <PlanTypeConfiguration
        onBack={handleBack}
      />
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Planes Personalizados
            </CardTitle>
            <div className="flex gap-2">
              {profile?.role === 'Administrador' && (
                <Button variant="outline" onClick={openPlanTypeConfig}>
                  <Settings className="h-4 w-4 mr-2" />
                  Configurar Tipos
                </Button>
              )}
              <Button onClick={openCreatePlan}>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Plan
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <p>Cargando planes...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Tipo de Plan</TableHead>
                  <TableHead>Gestor</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha Creación</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plans.map((plan: any) => (
                  <TableRow key={plan.id}>
                    <TableCell className="font-medium">{plan.title}</TableCell>
                    <TableCell>{plan.plan_type?.name || 'No asignado'}</TableCell>
                    <TableCell>{plan.manager?.full_name || 'No asignado'}</TableCell>
                    <TableCell>{getStatusBadge(plan.status)}</TableCell>
                    <TableCell>
                      {new Date(plan.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => openPlanDetails(plan)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {(plan.status === 'draft' || plan.status === 'rejected') && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => openPlanDetails(plan)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {plans.length === 0 && !isLoading && (
            <div className="text-center py-8 text-gray-500">
              No hay planes personalizados registrados.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
