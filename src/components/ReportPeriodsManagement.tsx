import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useReportPeriods } from "@/hooks/useReportPeriods";
import { useReportSystem } from "@/hooks/useReportSystem";
import { Plus, Edit, Trash2, Calendar, Settings } from "lucide-react";

export function ReportPeriodsManagement() {
  const [periods, setPeriods] = useState<any[]>([]);
  const [systemConfig, setSystemConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  
  const { toast } = useToast();
  const {
    fetchReportPeriods,
    createReportPeriod,
    updateReportPeriod,
    deleteReportPeriod
  } = useReportPeriods();
  const {
    fetchReportSystemConfig,
    updateReportSystemConfig
  } = useReportSystem();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [periodsResult, configResult] = await Promise.all([
        fetchReportPeriods(),
        fetchReportSystemConfig()
      ]);
      
      if (periodsResult.data) setPeriods(periodsResult.data);
      if (configResult.data) setSystemConfig(configResult.data);
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Cargando períodos de reporte...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Gestión de Períodos de Reporte</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setConfigDialogOpen(true)}>
            <Settings className="h-4 w-4 mr-2" />
            Configuración
          </Button>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Período
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Períodos de Reporte
          </CardTitle>
        </CardHeader>
        <CardContent>
          {periods.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No hay períodos de reporte configurados.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Fecha Inicio</TableHead>
                  <TableHead>Fecha Fin</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {periods.map((period) => (
                  <TableRow key={period.id}>
                    <TableCell className="font-medium">{period.name}</TableCell>
                    <TableCell>{new Date(period.start_date).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(period.end_date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant={period.is_active ? 'default' : 'secondary'}>
                        {period.is_active ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Edit className="w-4 h-4" />
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
