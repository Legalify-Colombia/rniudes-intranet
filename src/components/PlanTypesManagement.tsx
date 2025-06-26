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
import { useAuth } from "@/hooks/useAuth";
import { usePlanTypes } from "@/hooks/usePlanTypes";
import { Plus, Edit, Trash2, Settings } from "lucide-react";

export function PlanTypesManagement() {
  const [planTypes, setPlanTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPlanType, setEditingPlanType] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    min_weekly_hours: 0,
    max_weekly_hours: 40,
    uses_structured_elements: false,
    is_active: true,
    is_visible: true
  });
  
  const { profile } = useAuth();
  const { toast } = useToast();
  const { 
    fetchPlanTypes,
    createPlanType,
    updatePlanType,
    deletePlanType,
    fetchPlanFields,
    createPlanField,
    updatePlanField,
    deletePlanField,
    configurePlanTypeElements
  } = usePlanTypes();

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPlanType) {
        await updatePlanType(editingPlanType.id, formData);
        toast({
          title: "Éxito",
          description: "Tipo de plan actualizado correctamente",
        });
      } else {
        await createPlanType(formData);
        toast({
          title: "Éxito",
          description: "Tipo de plan creado correctamente",
        });
      }
      setDialogOpen(false);
      setEditingPlanType(null);
      setFormData({
        name: '',
        description: '',
        min_weekly_hours: 0,
        max_weekly_hours: 40,
        uses_structured_elements: false,
        is_active: true,
        is_visible: true
      });
      loadPlanTypes();
    } catch (error) {
      console.error('Error saving plan type:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar el tipo de plan",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Cargando tipos de plan...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Gestión de Tipos de Plan</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Tipo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingPlanType ? 'Editar Tipo de Plan' : 'Nuevo Tipo de Plan'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="min_weekly_hours">Horas Mínimas Semanales</Label>
                  <Input
                    id="min_weekly_hours"
                    type="number"
                    value={formData.min_weekly_hours}
                    onChange={(e) => setFormData(prev => ({ ...prev, min_weekly_hours: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="max_weekly_hours">Horas Máximas Semanales</Label>
                  <Input
                    id="max_weekly_hours"
                    type="number"
                    value={formData.max_weekly_hours}
                    onChange={(e) => setFormData(prev => ({ ...prev, max_weekly_hours: parseInt(e.target.value) || 40 }))}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="uses_structured_elements"
                  checked={formData.uses_structured_elements}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, uses_structured_elements: checked }))}
                />
                <Label htmlFor="uses_structured_elements">Usar elementos estructurados</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                />
                <Label htmlFor="is_active">Activo</Label>
              </div>
              <div className="flex gap-2">
                <Button type="submit">
                  {editingPlanType ? 'Actualizar' : 'Crear'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tipos de Plan</CardTitle>
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
