
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { usePlanTypes } from "@/hooks/usePlanTypes";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft, Plus, Edit, Trash2, Save, X } from "lucide-react";

interface PlanTypeConfigurationProps {
  onBack: () => void;
}

export function PlanTypeConfiguration({ onBack }: PlanTypeConfigurationProps) {
  const { profile } = useAuth();
  const { toast } = useToast();
  const { 
    fetchPlanTypes,
    fetchStrategicAxes,
    fetchActions,
    fetchProducts
  } = useSupabaseData();
  const { 
    createPlanType,
    updatePlanType,
    deletePlanType,
    createPlanField,
    updatePlanField,
    deletePlanField
  } = usePlanTypes();

  const [planTypes, setPlanTypes] = useState<any[]>([]);
  const [strategicAxes, setStrategicAxes] = useState<any[]>([]);
  const [actions, setActions] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedPlanType, setSelectedPlanType] = useState<any | null>(null);
  const [planFields, setPlanFields] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreatingType, setIsCreatingType] = useState(false);
  const [isCreatingField, setIsCreatingField] = useState(false);
  const [editingField, setEditingField] = useState<any | null>(null);

  const [planTypeForm, setPlanTypeForm] = useState({
    name: "",
    description: "",
    min_weekly_hours: 0,
    max_weekly_hours: null as number | null,
  });

  const [fieldForm, setFieldForm] = useState({
    field_name: "",
    field_type: "short_text",
    is_required: false,
    field_order: 0,
    dropdown_options: [] as string[],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [planTypesResult, axesResult, actionsResult, productsResult] = await Promise.all([
        fetchPlanTypes(),
        fetchStrategicAxes(),
        fetchActions(),
        fetchProducts()
      ]);

      if (planTypesResult.data) setPlanTypes(planTypesResult.data);
      if (axesResult.data) setStrategicAxes(axesResult.data);
      if (actionsResult.data) setActions(actionsResult.data);
      if (productsResult.data) setProducts(productsResult.data);
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

  const loadPlanFields = async (planTypeId: string) => {
    try {
      const { data, error } = await supabase
        .from("plan_fields")
        .select("*")
        .eq("plan_type_id", planTypeId)
        .order("field_order");

      if (error) throw error;
      setPlanFields(data || []);
    } catch (error) {
      console.error('Error loading plan fields:', error);
    }
  };

  const handleCreatePlanType = async () => {
    if (!planTypeForm.name.trim() || !profile?.id) return;

    try {
      const result = await createPlanType({
        ...planTypeForm,
        created_by: profile.id
      });

      if (result.data) {
        setPlanTypes([...planTypes, result.data]);
        setPlanTypeForm({ name: "", description: "", min_weekly_hours: 0, max_weekly_hours: null });
        setIsCreatingType(false);
        toast({
          title: "Éxito",
          description: "Tipo de plan creado correctamente",
        });
      }
    } catch (error) {
      console.error('Error creating plan type:', error);
      toast({
        title: "Error",
        description: "No se pudo crear el tipo de plan",
        variant: "destructive",
      });
    }
  };

  const handleCreateField = async () => {
    if (!fieldForm.field_name.trim() || !selectedPlanType) return;

    try {
      const result = await createPlanField({
        ...fieldForm,
        plan_type_id: selectedPlanType.id
      });

      if (result.data) {
        setPlanFields([...planFields, result.data]);
        setFieldForm({
          field_name: "",
          field_type: "short_text",
          is_required: false,
          field_order: 0,
          dropdown_options: [],
        });
        setIsCreatingField(false);
        toast({
          title: "Éxito",
          description: "Campo creado correctamente",
        });
      }
    } catch (error) {
      console.error('Error creating field:', error);
      toast({
        title: "Error",
        description: "No se pudo crear el campo",
        variant: "destructive",
      });
    }
  };

  const fieldTypes = [
    { value: "short_text", label: "Texto Corto" },
    { value: "long_text", label: "Texto Largo" },
    { value: "numeric", label: "Numérico" },
    { value: "dropdown", label: "Lista Desplegable" },
    { value: "strategic_axes", label: "Ejes Estratégicos" },
    { value: "actions", label: "Acciones" },
    { value: "products", label: "Productos" },
    { value: "file", label: "Archivo" },
    { value: "section", label: "Sección" },
    { value: "manager_name", label: "Nombre del Gestor (Auto)" },
    { value: "campus_name", label: "Nombre del Campus (Auto)" },
    { value: "program_director", label: "Director del Programa (Auto)" },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Cargando configuración...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <h1 className="text-2xl font-bold">Configuración de Tipos de Plan</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tipos de Plan */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Tipos de Plan</CardTitle>
              <Button onClick={() => setIsCreatingType(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Tipo
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {isCreatingType && (
              <div className="p-4 border rounded-lg space-y-3">
                <div>
                  <Label htmlFor="typeName">Nombre</Label>
                  <Input
                    id="typeName"
                    value={planTypeForm.name}
                    onChange={(e) => setPlanTypeForm({ ...planTypeForm, name: e.target.value })}
                    placeholder="Nombre del tipo de plan"
                  />
                </div>
                <div>
                  <Label htmlFor="typeDescription">Descripción</Label>
                  <Textarea
                    id="typeDescription"
                    value={planTypeForm.description}
                    onChange={(e) => setPlanTypeForm({ ...planTypeForm, description: e.target.value })}
                    placeholder="Descripción del tipo de plan"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="minHours">Horas Mínimas</Label>
                    <Input
                      id="minHours"
                      type="number"
                      value={planTypeForm.min_weekly_hours}
                      onChange={(e) => setPlanTypeForm({ ...planTypeForm, min_weekly_hours: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxHours">Horas Máximas</Label>
                    <Input
                      id="maxHours"
                      type="number"
                      value={planTypeForm.max_weekly_hours || ""}
                      onChange={(e) => setPlanTypeForm({ ...planTypeForm, max_weekly_hours: parseInt(e.target.value) || null })}
                      placeholder="Opcional"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleCreatePlanType}>
                    <Save className="h-4 w-4 mr-1" />
                    Guardar
                  </Button>
                  <Button variant="outline" onClick={() => setIsCreatingType(false)}>
                    <X className="h-4 w-4 mr-1" />
                    Cancelar
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {planTypes.map((planType) => (
                <div 
                  key={planType.id} 
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedPlanType?.id === planType.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => {
                    setSelectedPlanType(planType);
                    loadPlanFields(planType.id);
                  }}
                >
                  <h3 className="font-medium">{planType.name}</h3>
                  <p className="text-sm text-gray-600">{planType.description}</p>
                  <p className="text-xs text-blue-600 mt-1">
                    Horas: {planType.min_weekly_hours} - {planType.max_weekly_hours || '∞'}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Campos del Tipo de Plan */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                Campos {selectedPlanType ? `- ${selectedPlanType.name}` : ''}
              </CardTitle>
              {selectedPlanType && (
                <Button onClick={() => setIsCreatingField(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Campo
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {!selectedPlanType ? (
              <p className="text-gray-500 text-center py-8">
                Selecciona un tipo de plan para ver sus campos
              </p>
            ) : (
              <>
                {isCreatingField && (
                  <div className="p-4 border rounded-lg space-y-3">
                    <div>
                      <Label htmlFor="fieldName">Nombre del Campo</Label>
                      <Input
                        id="fieldName"
                        value={fieldForm.field_name}
                        onChange={(e) => setFieldForm({ ...fieldForm, field_name: e.target.value })}
                        placeholder="Nombre del campo"
                      />
                    </div>
                    <div>
                      <Label htmlFor="fieldType">Tipo de Campo</Label>
                      <Select 
                        value={fieldForm.field_type} 
                        onValueChange={(value) => setFieldForm({ ...fieldForm, field_type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {fieldTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="isRequired"
                        checked={fieldForm.is_required}
                        onCheckedChange={(checked) => setFieldForm({ ...fieldForm, is_required: !!checked })}
                      />
                      <Label htmlFor="isRequired">Campo requerido</Label>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleCreateField}>
                        <Save className="h-4 w-4 mr-1" />
                        Guardar
                      </Button>
                      <Button variant="outline" onClick={() => setIsCreatingField(false)}>
                        <X className="h-4 w-4 mr-1" />
                        Cancelar
                      </Button>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {planFields.map((field) => (
                    <div key={field.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{field.field_name}</h4>
                          <p className="text-sm text-gray-600">
                            {fieldTypes.find(t => t.value === field.field_type)?.label}
                            {field.is_required && <span className="text-red-500 ml-1">*</span>}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
