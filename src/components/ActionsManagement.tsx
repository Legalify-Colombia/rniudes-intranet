
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { Plus, Edit, Trash2, Save, X } from "lucide-react";
import { Action, StrategicAxis } from "@/types";

export function ActionsManagement() {
  const { toast } = useToast();
  const { 
    fetchActions, 
    createAction, 
    updateAction, 
    deleteAction,
    fetchStrategicAxes 
  } = useSupabaseData();

  const [actions, setActions] = useState<Action[]>([]);
  const [strategicAxes, setStrategicAxes] = useState<StrategicAxis[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingAction, setEditingAction] = useState<Action | null>(null);
  const [formData, setFormData] = useState({ 
    name: "", 
    code: "", 
    description: "", 
    strategic_axis_id: "" 
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [actionsResult, axesResult] = await Promise.all([
        fetchActions(),
        fetchStrategicAxes()
      ]);
      
      if (actionsResult.data) setActions(actionsResult.data);
      if (axesResult.data) setStrategicAxes(axesResult.data);
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

  const handleCreate = async () => {
    if (!formData.name.trim() || !formData.code.trim() || !formData.strategic_axis_id) return;

    try {
      const result = await createAction(formData);
      if (result.data) {
        setActions([...actions, result.data]);
        setFormData({ name: "", code: "", description: "", strategic_axis_id: "" });
        setIsCreating(false);
        toast({
          title: "Éxito",
          description: "Acción creada correctamente",
        });
      }
    } catch (error) {
      console.error('Error creating action:', error);
      toast({
        title: "Error",
        description: "No se pudo crear la acción",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (action: Action) => {
    setEditingAction(action);
    setFormData({ 
      name: action.name, 
      code: action.code, 
      description: action.description || "",
      strategic_axis_id: action.strategic_axis_id || ""
    });
  };

  const handleUpdate = async () => {
    if (!editingAction || !formData.name.trim() || !formData.code.trim()) return;

    try {
      const result = await updateAction(editingAction.id, formData);
      if (result.data) {
        setActions(actions.map(action => action.id === editingAction.id ? result.data : action));
        setEditingAction(null);
        setFormData({ name: "", code: "", description: "", strategic_axis_id: "" });
        toast({
          title: "Éxito",
          description: "Acción actualizada correctamente",
        });
      }
    } catch (error) {
      console.error('Error updating action:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la acción",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (action: Action) => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta acción?")) return;

    try {
      await deleteAction(action.id);
      setActions(actions.filter(a => a.id !== action.id));
      toast({
        title: "Éxito",
        description: "Acción eliminada correctamente",
      });
    } catch (error) {
      console.error('Error deleting action:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la acción",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Cargando acciones...</p>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Acciones</CardTitle>
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Acción
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {(isCreating || editingAction) && (
          <div className="p-4 border rounded-lg space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="code">Código</Label>
                <Input
                  id="code"
                  placeholder="Código de la acción"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  placeholder="Nombre de la acción"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="strategic_axis">Eje Estratégico</Label>
              <Select value={formData.strategic_axis_id} onValueChange={(value) => setFormData({ ...formData, strategic_axis_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un eje estratégico" />
                </SelectTrigger>
                <SelectContent>
                  {strategicAxes.map((axis) => (
                    <SelectItem key={axis.id} value={axis.id}>
                      {axis.code} - {axis.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                placeholder="Descripción de la acción"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={editingAction ? handleUpdate : handleCreate}>
                <Save className="h-4 w-4 mr-1" />
                {editingAction ? "Actualizar" : "Guardar"}
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => {
                  setIsCreating(false);
                  setEditingAction(null);
                  setFormData({ name: "", code: "", description: "", strategic_axis_id: "" });
                }}
              >
                <X className="h-4 w-4 mr-1" />
                Cancelar
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {actions.map((action) => (
            <div key={action.id} className="p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{action.code} - {action.name}</h3>
                  {action.description && (
                    <p className="text-sm text-gray-600">{action.description}</p>
                  )}
                  <p className="text-xs text-blue-600">
                    Eje: {strategicAxes.find(axis => axis.id === action.strategic_axis_id)?.name}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(action)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDelete(action)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
