import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { useManagers } from "@/hooks/useManagers";
import { Plus, Edit, Trash2, Save, X, Clock, CheckCircle } from "lucide-react";
import { Action, StrategicAxis } from "@/types";
import { useAuth } from "@/hooks/useAuth";

export function ActionsManagement() {
  const { toast } = useToast();
  const { profile } = useAuth();
  const { 
    fetchActions, 
    createAction, 
    updateAction, 
    deleteAction,
    fetchStrategicAxes 
  } = useSupabaseData();
  const { fetchAvailablePlanTypes } = useManagers();

  const [actions, setActions] = useState<Action[]>([]);
  const [strategicAxes, setStrategicAxes] = useState<StrategicAxis[]>([]);
  const [availablePlanTypes, setAvailablePlanTypes] = useState<any[]>([]);
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

      // Load available plan types based on user's weekly hours
      if (profile?.id) {
        const planTypesResult = await fetchAvailablePlanTypes(profile.id);
        if (planTypesResult.data) {
          setAvailablePlanTypes(planTypesResult.data);
        }
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

  const getAppropriatePlanType = () => {
    if (!profile?.weekly_hours || availablePlanTypes.length === 0) {
      return null;
    }

    // Find the plan type that matches the user's weekly hours
    const matchingPlanType = availablePlanTypes.find(planType => {
      const weeklyHours = profile.weekly_hours || 0;
      const minHours = planType.min_weekly_hours || 0;
      const maxHours = planType.max_weekly_hours;
      
      if (maxHours === null) {
        return weeklyHours >= minHours;
      }
      
      return weeklyHours >= minHours && weeklyHours <= maxHours;
    });

    return matchingPlanType;
  };

  const appropriatePlanType = getAppropriatePlanType();

  const handleCreate = async () => {
    if (!formData.name.trim() || !formData.code.trim() || !formData.strategic_axis_id || !profile?.id) return;

    try {
      const result = await createAction({
        ...formData,
        created_by: profile.id
      });
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
    <div className="space-y-6">
      {/* Plan Type Information Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <CheckCircle className="h-5 w-5" />
            Tipo de Plan Asignado
          </CardTitle>
        </CardHeader>
        <CardContent>
          {profile?.weekly_hours ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-700">
                  <strong>Horas semanales asignadas:</strong> {profile.weekly_hours}
                </span>
                <Badge variant="outline" className="bg-blue-100 text-blue-800">
                  <Clock className="w-3 h-3 mr-1" />
                  {profile.weekly_hours} hrs/semana
                </Badge>
              </div>
              
              {appropriatePlanType ? (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-green-800">{appropriatePlanType.name}</p>
                      <p className="text-sm text-green-600">{appropriatePlanType.description}</p>
                      <p className="text-xs text-green-500 mt-1">
                        Rango de horas: {appropriatePlanType.min_weekly_hours} - {appropriatePlanType.max_weekly_hours || '∞'} por semana
                      </p>
                    </div>
                    <Badge className="bg-green-600">
                      Asignado
                    </Badge>
                  </div>
                </div>
              ) : (
                <Alert className="border-orange-200 bg-orange-50">
                  <AlertDescription className="text-orange-800">
                    No se encontró un tipo de plan que coincida con tus {profile.weekly_hours} horas semanales. 
                    Contacta al administrador para revisar la configuración de tipos de plan.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          ) : (
            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertDescription className="text-yellow-800">
                No tienes horas semanales configuradas. Contacta al administrador para configurar tus horas de trabajo.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

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
    </div>
  );
}
