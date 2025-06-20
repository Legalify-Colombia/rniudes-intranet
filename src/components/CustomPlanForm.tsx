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
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft, Save, Send } from "lucide-react";

interface CustomPlanFormProps {
  planId?: string;
  planTypeId?: string;
  onSave: () => void;
}

export function CustomPlanForm({ planId, planTypeId, onSave }: CustomPlanFormProps) {
  const { profile } = useAuth();
  const { toast } = useToast();
  const { 
    fetchCustomPlanDetails,
    fetchPlanFields,
    fetchStrategicAxes,
    updateCustomPlan,
    submitCustomPlan,
    upsertCustomPlanResponse,
    fetchAcademicPrograms,
    fetchActions,
    fetchProducts
  } = useSupabaseData();

  const [plan, setPlan] = useState<any>(null);
  const [planFields, setPlanFields] = useState<any[]>([]);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [strategicAxes, setStrategicAxes] = useState<any[]>([]);
  const [academicPrograms, setAcademicPrograms] = useState<any[]>([]);
  const [actions, setActions] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, [planId, planTypeId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [strategicAxesResult, programsResult, actionsResult, productsResult] = await Promise.all([
        fetchStrategicAxes(),
        fetchAcademicPrograms(),
        fetchActions(),
        fetchProducts()
      ]);

      if (strategicAxesResult.data) setStrategicAxes(strategicAxesResult.data);
      if (programsResult.data) setAcademicPrograms(programsResult.data);
      if (actionsResult.data) setActions(actionsResult.data);
      if (productsResult.data) setProducts(productsResult.data);

      if (planId) {
        const planResult = await fetchCustomPlanDetails(planId);
        if (planResult.data) {
          setPlan(planResult.data);
          
          // Cargar campos del tipo de plan
          const fieldsResult = await fetchPlanFields(planResult.data.plan_type_id);
          if (fieldsResult.data) {
            setPlanFields(fieldsResult.data.sort((a, b) => a.field_order - b.field_order));
          }

          // Cargar respuestas existentes
          const responsesMap: Record<string, any> = {};
          if (planResult.data.responses) {
            planResult.data.responses.forEach((response: any) => {
              responsesMap[response.plan_field_id] = response;
            });
          }
          setResponses(responsesMap);
        }
      } else if (planTypeId) {
        const fieldsResult = await fetchPlanFields(planTypeId);
        if (fieldsResult.data) {
          setPlanFields(fieldsResult.data.sort((a, b) => a.field_order - b.field_order));
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

  const getAutoFieldValue = (fieldType: string) => {
    if (!profile) return '';

    switch (fieldType) {
      case 'manager_name':
        return profile.full_name || '';
      case 'campus_name':
        return profile.campus?.name || '';
      case 'program_director':
        const userProgram = academicPrograms.find(p => p.manager_id === profile.id);
        return userProgram?.director_name || '';
      default:
        return '';
    }
  };

  const handleResponseChange = (fieldId: string, value: any) => {
    setResponses(prev => ({
      ...prev,
      [fieldId]: {
        ...prev[fieldId],
        plan_field_id: fieldId,
        custom_plan_id: planId || '',
        response_value: value,
        id: prev[fieldId]?.id || '',
        created_at: prev[fieldId]?.created_at || '',
        updated_at: prev[fieldId]?.updated_at || ''
      }
    }));
  };

  const handleSave = async () => {
    if (!profile?.id) return;

    setSaving(true);
    try {
      // Guardar respuestas
      for (const [fieldId, response] of Object.entries(responses)) {
        if (response.response_value !== undefined && response.response_value !== '') {
          await upsertCustomPlanResponse({
            ...response,
            custom_plan_id: planId
          });
        }
      }

      toast({
        title: "Éxito",
        description: "Plan guardado correctamente",
      });
    } catch (error) {
      console.error('Error saving plan:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar el plan",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!planId) return;

    try {
      await submitCustomPlan(planId);
      toast({
        title: "Éxito",
        description: "Plan enviado correctamente",
      });
      onSave();
    } catch (error) {
      console.error('Error submitting plan:', error);
      toast({
        title: "Error",
        description: "No se pudo enviar el plan",
        variant: "destructive",
      });
    }
  };

  const renderField = (field: any) => {
    const response = responses[field.id]?.response_value || '';

    // Para campos automáticos, mostrar valor automático
    if (['manager_name', 'campus_name', 'program_director'].includes(field.field_type)) {
      const autoValue = getAutoFieldValue(field.field_type);
      return (
        <Input
          value={autoValue}
          readOnly
          className="bg-gray-100"
        />
      );
    }

    // Para sección, mostrar como encabezado
    if (field.field_type === 'section') {
      return (
        <div className="col-span-2">
          <Separator className="my-4" />
          <h3 className="text-lg font-semibold text-blue-800 mb-2">{field.field_name}</h3>
        </div>
      );
    }

    // Para ejes estratégicos, mostrar selector múltiple con datos de la base de datos
    if (field.field_type === 'strategic_axes') {
      return (
        <div className="space-y-2">
          {strategicAxes.map((axis) => (
            <div key={axis.id} className="flex items-center space-x-2">
              <Checkbox
                id={`axis-${axis.id}`}
                checked={(response as string[])?.includes(axis.id) || false}
                onCheckedChange={(checked) => {
                  const currentAxes = (response as string[]) || [];
                  const newAxes = checked
                    ? [...currentAxes, axis.id]
                    : currentAxes.filter(id => id !== axis.id);
                  handleResponseChange(field.id, newAxes);
                }}
              />
              <Label htmlFor={`axis-${axis.id}`} className="text-sm">
                {axis.code} - {axis.name}
              </Label>
            </div>
          ))}
        </div>
      );
    }

    // Para acciones, mostrar selector múltiple con datos de la base de datos
    if (field.field_type === 'actions') {
      // Filtrar acciones por ejes estratégicos seleccionados si aplica
      const selectedAxes = responses[strategicAxes.find(a => a.field_type === 'strategic_axes')?.id]?.response_value || [];
      const filteredActions = selectedAxes.length > 0 
        ? actions.filter(action => selectedAxes.includes(action.strategic_axis_id))
        : actions;

      return (
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {filteredActions.map((action) => (
            <div key={action.id} className="flex items-center space-x-2">
              <Checkbox
                id={`action-${action.id}`}
                checked={(response as string[])?.includes(action.id) || false}
                onCheckedChange={(checked) => {
                  const currentActions = (response as string[]) || [];
                  const newActions = checked
                    ? [...currentActions, action.id]
                    : currentActions.filter(id => id !== action.id);
                  handleResponseChange(field.id, newActions);
                }}
              />
              <Label htmlFor={`action-${action.id}`} className="text-sm">
                {action.code} - {action.name}
              </Label>
            </div>
          ))}
        </div>
      );
    }

    // Para productos, mostrar selector múltiple con datos de la base de datos
    if (field.field_type === 'products') {
      // Filtrar productos por acciones seleccionadas si aplica
      const selectedActions = responses[actions.find(a => a.field_type === 'actions')?.id]?.response_value || [];
      const filteredProducts = selectedActions.length > 0 
        ? products.filter(product => selectedActions.includes(product.action_id))
        : products;

      return (
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {filteredProducts.map((product) => (
            <div key={product.id} className="flex items-center space-x-2">
              <Checkbox
                id={`product-${product.id}`}
                checked={(response as string[])?.includes(product.id) || false}
                onCheckedChange={(checked) => {
                  const currentProducts = (response as string[]) || [];
                  const newProducts = checked
                    ? [...currentProducts, product.id]
                    : currentProducts.filter(id => id !== product.id);
                  handleResponseChange(field.id, newProducts);
                }}
              />
              <Label htmlFor={`product-${product.id}`} className="text-sm">
                {product.name}
              </Label>
            </div>
          ))}
        </div>
      );
    }

    // Para otros tipos de campo
    switch (field.field_type) {
      case 'numeric':
        return (
          <Input
            type="number"
            value={response}
            onChange={(e) => handleResponseChange(field.id, parseFloat(e.target.value) || 0)}
            placeholder="Ingrese valor numérico"
          />
        );
      case 'short_text':
        return (
          <Input
            value={response}
            onChange={(e) => handleResponseChange(field.id, e.target.value)}
            placeholder="Ingrese texto corto"
            maxLength={255}
          />
        );
      case 'long_text':
        return (
          <Textarea
            value={response}
            onChange={(e) => handleResponseChange(field.id, e.target.value)}
            placeholder="Ingrese texto largo"
            rows={3}
          />
        );
      case 'dropdown':
        return (
          <Select
            value={response}
            onValueChange={(value) => handleResponseChange(field.id, value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar opción" />
            </SelectTrigger>
            <SelectContent>
              {field.dropdown_options?.map((option: string, index: number) => (
                <SelectItem key={index} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case 'file':
        return (
          <div className="space-y-2">
            <Input
              type="file"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleResponseChange(field.id, {
                    file_name: file.name,
                    file_url: '' // TODO: Implementar subida de archivo
                  });
                }
              }}
            />
            {response?.file_name && (
              <p className="text-sm text-gray-600">Archivo: {response.file_name}</p>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Cargando formulario...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onSave}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {plan ? `Editar: ${plan.title}` : 'Nuevo Plan Personalizado'}
            </h1>
            <p className="text-gray-600">Complete los campos requeridos</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleSave}
            disabled={saving || plan?.status !== 'draft'}
          >
            <Save className="h-4 w-4 mr-2" />
            Guardar Borrador
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={plan?.status !== 'draft'}
            className="institutional-gradient text-white"
          >
            <Send className="h-4 w-4 mr-2" />
            Enviar Plan
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {plan?.plan_type?.name || 'Formulario Personalizado'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {planFields.map((field) => {
              if (field.field_type === 'section') {
                return (
                  <div key={field.id} className="col-span-2">
                    <Separator className="my-4" />
                    <h3 className="text-lg font-semibold text-blue-800 mb-4">{field.field_name}</h3>
                  </div>
                );
              }

              return (
                <div key={field.id} className="space-y-2">
                  <Label htmlFor={field.id} className="text-sm font-medium">
                    {field.field_name}
                    {field.is_required && <span className="text-red-500 ml-1">*</span>}
                  </Label>
                  {renderField(field)}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
