import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { usePlanTypes } from "@/hooks/usePlanTypes";
import { ArrowLeft, Plus, Edit, Trash2, Settings } from "lucide-react";

interface PlanTypeConfigurationProps {
  onBack: () => void;
}

export function PlanTypeConfiguration({ onBack }: PlanTypeConfigurationProps) {
  const [planTypes, setPlanTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { toast } = useToast();
  const { fetchPlanTypes } = usePlanTypes();

  useEffect(() => {
    loadPlanTypes();
  }, []);

  const loadPlanTypes = async () => {
    try {
      setLoading(true);
      const result = await fetchPlanTypes();
      if (result.data) {
        setPlanTypes(result.data);
      }
    } catch (error) {
      console.error("Error loading plan types:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los tipos de plan",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Cargando tipos de plan...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Configuración de Tipos de Plan</h1>
          <p className="text-gray-600">Gestiona los tipos de planes disponibles</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Tipos de Plan</CardTitle>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Tipo
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {planTypes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No hay tipos de plan configurados.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Horas Semanales</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {planTypes.map((planType) => (
                  <TableRow key={planType.id}>
                    <TableCell className="font-medium">{planType.name}</TableCell>
                    <TableCell>{planType.description || '-'}</TableCell>
                    <TableCell>
                      {planType.min_weekly_hours || 0} - {planType.max_weekly_hours || '∞'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={planType.is_active ? 'default' : 'secondary'}>
                        {planType.is_active ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Settings className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
