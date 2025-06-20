
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { Plus, Edit, Trash2, Save, X } from "lucide-react";
import { StrategicAxis } from "@/types";

export function StrategicAxesManagement() {
  const { toast } = useToast();
  const { fetchStrategicAxes, createStrategicAxis, updateStrategicAxis, deleteStrategicAxis } = useSupabaseData();

  const [axes, setAxes] = useState<StrategicAxis[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingAxis, setEditingAxis] = useState<StrategicAxis | null>(null);
  const [formData, setFormData] = useState({ name: "", code: "", description: "" });

  useEffect(() => {
    loadAxes();
  }, []);

  const loadAxes = async () => {
    setLoading(true);
    try {
      const result = await fetchStrategicAxes();
      if (result.data) {
        setAxes(result.data);
      }
    } catch (error) {
      console.error('Error loading axes:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los ejes estratégicos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.name.trim() || !formData.code.trim()) return;

    try {
      const result = await createStrategicAxis(formData);
      if (result.data) {
        setAxes([...axes, result.data]);
        setFormData({ name: "", code: "", description: "" });
        setIsCreating(false);
        toast({
          title: "Éxito",
          description: "Eje estratégico creado correctamente",
        });
      }
    } catch (error) {
      console.error('Error creating axis:', error);
      toast({
        title: "Error",
        description: "No se pudo crear el eje estratégico",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (axis: StrategicAxis) => {
    setEditingAxis(axis);
    setFormData({ name: axis.name, code: axis.code, description: axis.description || "" });
  };

  const handleUpdate = async () => {
    if (!editingAxis || !formData.name.trim() || !formData.code.trim()) return;

    try {
      const result = await updateStrategicAxis(editingAxis.id, formData);
      if (result.data) {
        setAxes(axes.map(axis => axis.id === editingAxis.id ? result.data : axis));
        setEditingAxis(null);
        setFormData({ name: "", code: "", description: "" });
        toast({
          title: "Éxito",
          description: "Eje estratégico actualizado correctamente",
        });
      }
    } catch (error) {
      console.error('Error updating axis:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el eje estratégico",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (axis: StrategicAxis) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este eje estratégico?")) return;

    try {
      await deleteStrategicAxis(axis.id);
      setAxes(axes.filter(a => a.id !== axis.id));
      toast({
        title: "Éxito",
        description: "Eje estratégico eliminado correctamente",
      });
    } catch (error) {
      console.error('Error deleting axis:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el eje estratégico",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Cargando ejes estratégicos...</p>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Ejes Estratégicos</CardTitle>
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Eje
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {(isCreating || editingAxis) && (
          <div className="p-4 border rounded-lg space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="code">Código</Label>
                <Input
                  id="code"
                  placeholder="Código del eje"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  placeholder="Nombre del eje"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                placeholder="Descripción del eje"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={editingAxis ? handleUpdate : handleCreate}>
                <Save className="h-4 w-4 mr-1" />
                {editingAxis ? "Actualizar" : "Guardar"}
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => {
                  setIsCreating(false);
                  setEditingAxis(null);
                  setFormData({ name: "", code: "", description: "" });
                }}
              >
                <X className="h-4 w-4 mr-1" />
                Cancelar
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {axes.map((axis) => (
            <div key={axis.id} className="p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{axis.code} - {axis.name}</h3>
                  {axis.description && (
                    <p className="text-sm text-gray-600">{axis.description}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(axis)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDelete(axis)}>
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
