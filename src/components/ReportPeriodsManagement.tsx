
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Plus, Edit, Trash2, Calendar, Settings } from "lucide-react";

export function ReportPeriodsManagement() {
  const { 
    fetchReportPeriods, 
    createReportPeriod, 
    updateReportPeriod, 
    deleteReportPeriod,
    fetchReportSystemConfig,
    updateReportSystemConfig 
  } = useSupabaseData();
  const { profile } = useAuth();
  const { toast } = useToast();
  
  const [periods, setPeriods] = useState<any[]>([]);
  const [systemConfig, setSystemConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    is_active: true
  });
  const [configData, setConfigData] = useState({
    max_reports_per_period: 4,
    reports_enabled: true,
    auto_calculate_progress: true,
    require_evidence: true
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [periodsResult, configResult] = await Promise.all([
        fetchReportPeriods(),
        fetchReportSystemConfig()
      ]);

      setPeriods(periodsResult.data || []);
      if (configResult.data) {
        setSystemConfig(configResult.data);
        setConfigData(configResult.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const periodData = {
        ...formData,
        created_by: profile?.id || ''
      };

      if (editingPeriod) {
        await updateReportPeriod(editingPeriod.id, formData);
        toast({
          title: "Éxito",
          description: "Período actualizado correctamente",
        });
      } else {
        await createReportPeriod(periodData);
        toast({
          title: "Éxito",
          description: "Período creado correctamente",
        });
      }

      setDialogOpen(false);
      setEditingPeriod(null);
      setFormData({
        name: '',
        description: '',
        start_date: '',
        end_date: '',
        is_active: true
      });
      loadData();
    } catch (error) {
      console.error('Error saving period:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar el período",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (period: any) => {
    setEditingPeriod(period);
    setFormData({
      name: period.name,
      description: period.description || '',
      start_date: period.start_date,
      end_date: period.end_date,
      is_active: period.is_active
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Está seguro de que desea eliminar este período?')) {
      try {
        await deleteReportPeriod(id);
        toast({
          title: "Éxito",
          description: "Período eliminado correctamente",
        });
        loadData();
      } catch (error) {
        console.error('Error deleting period:', error);
        toast({
          title: "Error",
          description: "No se pudo eliminar el período",
          variant: "destructive",
        });
      }
    }
  };

  const handleConfigSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateReportSystemConfig(configData);
      toast({
        title: "Éxito",
        description: "Configuración actualizada correctamente",
      });
      setConfigDialogOpen(false);
      loadData();
    } catch (error) {
      console.error('Error updating config:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la configuración",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Cargando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Gestión de Períodos de Reportes</h1>
        <div className="flex gap-2">
          <Dialog open={configDialogOpen} onOpenChange={setConfigDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Configuración
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Configuración del Sistema de Reportes</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleConfigSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Máximo de reportes por período
                  </label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={configData.max_reports_per_period}
                    onChange={(e) => setConfigData(prev => ({
                      ...prev,
                      max_reports_per_period: parseInt(e.target.value)
                    }))}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={configData.reports_enabled}
                    onCheckedChange={(checked) => setConfigData(prev => ({
                      ...prev,
                      reports_enabled: checked
                    }))}
                  />
                  <label className="text-sm font-medium">Reportes habilitados</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={configData.auto_calculate_progress}
                    onCheckedChange={(checked) => setConfigData(prev => ({
                      ...prev,
                      auto_calculate_progress: checked
                    }))}
                  />
                  <label className="text-sm font-medium">Calcular progreso automáticamente</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={configData.require_evidence}
                    onCheckedChange={(checked) => setConfigData(prev => ({
                      ...prev,
                      require_evidence: checked
                    }))}
                  />
                  <label className="text-sm font-medium">Evidencias requeridas</label>
                </div>
                <div className="flex gap-2">
                  <Button type="submit">Guardar</Button>
                  <Button type="button" variant="outline" onClick={() => setConfigDialogOpen(false)}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Período
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingPeriod ? 'Editar Período' : 'Nuevo Período de Reportes'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nombre</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Descripción</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Fecha de inicio</label>
                    <Input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Fecha de fin</label>
                    <Input
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                      required
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                  />
                  <label className="text-sm font-medium">Período activo</label>
                </div>
                <div className="flex gap-2">
                  <Button type="submit">
                    {editingPeriod ? 'Actualizar' : 'Crear'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Períodos de Reportes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {periods.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No hay períodos de reportes configurados.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Descripción</TableHead>
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
                    <TableCell>{period.description || '-'}</TableCell>
                    <TableCell>{new Date(period.start_date).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(period.end_date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant={period.is_active ? "default" : "secondary"}>
                        {period.is_active ? "Activo" : "Inactivo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(period)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDelete(period.id)}>
                          <Trash2 className="h-4 w-4" />
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

      {systemConfig && (
        <Card>
          <CardHeader>
            <CardTitle>Configuración Actual del Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Máximo reportes por período:</span> {systemConfig.max_reports_per_period}
              </div>
              <div>
                <span className="font-medium">Reportes habilitados:</span> {systemConfig.reports_enabled ? 'Sí' : 'No'}
              </div>
              <div>
                <span className="font-medium">Cálculo automático:</span> {systemConfig.auto_calculate_progress ? 'Sí' : 'No'}
              </div>
              <div>
                <span className="font-medium">Evidencias requeridas:</span> {systemConfig.require_evidence ? 'Sí' : 'No'}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
