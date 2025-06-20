
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { WorkPlanForm } from "./WorkPlanForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export function ManagerWorkPlan() {
  const { profile } = useAuth();
  const { fetchManagers } = useSupabaseData();
  const [managerData, setManagerData] = useState<any>(null);
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
    } catch (error) {
      console.error('Error loading manager data:', error);
    } finally {
      setLoading(false);
    }
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Mi Plan de Trabajo</CardTitle>
        </CardHeader>
        <CardContent>
          <WorkPlanForm
            manager={managerData}
            onClose={() => {}}
            onSave={() => loadManagerData()}
          />
        </CardContent>
      </Card>
    </div>
  );
}
