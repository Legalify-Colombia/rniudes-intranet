
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { ArrowLeft, Save, Send, FileText } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StructuredCustomPlanForm } from "./StructuredCustomPlanForm";

interface CustomPlanFormProps {
  planId?: string;
  planTypeId?: string;
  onSave?: () => void;
  embedded?: boolean;
}

export function CustomPlanForm({ planId, planTypeId, onSave, embedded = false }: CustomPlanFormProps) {
  const [plan, setPlan] = useState<any>(null);
  const [planType, setPlanType] = useState<any>(null);
  const [fields, setFields] = useState<any[]>([]);
  const [responses, setResponses] = useState<{[key: string]: any}>({});
  const [strategicAxes, setStrategicAxes] = useState<any[]>([]);
  const [actions, setActions] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState("");
  
  const { profile } = useAuth();
  const { toast } = useToast();
  const { 
    fetchCustomPlanDetails, 
    fetchPlanFields, 
    updateCustomPlan, 
    submitCustomPlan, 
    upsertCustomPlanResponse,
    fetchStrategicAxes,
    fetchActions,
    fetchProducts,
    fetchPlanTypes,
    createCustomPlan
  } = useSupabaseData();

  useEffect(() => {
    if (planId) {
      loadPlanDetails();
    } else if (planTypeId) {
      loadPlanType();
    }
    loadMasterData();
  }, [planId, planTypeId]);

  const loadPlanDetails = async () => {
    if (!planId) return;
    
    try {
      setIsLoading(true);
      const result = await fetchCustomPlanDetails(planId);
      if (result.data) {
        setPlan(result.data);
        setPlanType(result.data.plan_type);
        setTitle(result.data.title);
        
        // Convert responses array to object
        const responsesMap: {[key: string]: any} = {};
        result.data.responses?.forEach((response: any) => {
          responsesMap[response.plan_field_id] = response.response_value;
        });
        setResponses(responsesMap);
        
        // Load fields for this plan type
        if (result.data.plan_type_id) {
          const fieldsResult = await fetchPlanFields(result.data.plan_type_id);
          if (fieldsResult.data) {
            setFields(fieldsResult.data);
          }
        }
      }
    } catch (error) {
      console.error("Error loading plan details:", error);
      toast({
        title: "Error",
        description: "No se pudo cargar el plan",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadPlanType = async () => {
    if (!planTypeId) return;
    
    try {
      setIsLoading(true);
      const { data: planTypes } = await fetchPlanTypes();
      const foundPlanType = planTypes?.find(pt => pt.id === planTypeId);
      if (foundPlanType) {
        setPlanType(foundPlanType);
        setTitle(`Plan de ${foundPlanType.name} - ${profile?.full_name}`);
      }
      
      const fieldsResult = await fetchPlanFields(planTypeId);
      if (fieldsResult.data) {
        setFields(fieldsResult.data);
      }
    } catch (error) {
      console.error("Error loading plan type:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMasterData = async () => {
    try {
      const [axesResult, actionsResult, productsResult] = await Promise.all([
        fetchStrategicAxes(),
        fetchActions(),
        fetchProducts()
      ]);
      
      if (axesResult.data) setStrategicAxes(axesResult.data);
      if (actionsResult.data) setActions(actionsResult.data);
      if (productsResult.data) setProducts(productsResult.data);
    } catch (error) {
      console.error("Error loading master data:", error);
    }
  };

  // If it's a structured plan type, use the StructuredCustomPlanForm
  if (planType?.uses_structured_elements) {
    return (
      <StructuredCustomPlanForm
        planId={planId}
        planTypeId={planTypeId}
        onSave={onSave}
      />
    );
  }

  const handleResponseChange = async (fieldId: string, value: any) => {
    setResponses(prev => ({ ...prev, [fieldId]: value }));
    
    if (plan?.id) {
      try {
        await upsertCustomPlanResponse({
          custom_plan_id: plan.id,
          plan_field_id: fieldId,
          response_value: value
        });
      } catch (error) {
        console.error("Error saving response:", error);
      }
    }
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      
      let currentPlan = plan;
      
      if (!currentPlan && planTypeId) {
        // Create new plan
        const planData = {
          title,
          plan_type_id: planTypeId,
          manager_id: profile?.id,
          status: 'draft'
        };
        
        const result = await createCustomPlan(planData);
        if (result.error) {
          throw new Error(result.error.message);
        }
        currentPlan = result.data;
        setPlan(currentPlan);
      }
      
      if (currentPlan) {
        // Update plan title
        await updateCustomPlan(currentPlan.id, { title });
        
        // Save all responses
        for (const [fieldId, value] of Object.entries(responses)) {
          if (value !== null && value !== undefined && value !== '') {
            await upsertCustomPlanResponse({
              custom_plan_id: currentPlan.id,
              plan_field_id: fieldId,
              response_value: value
            });
          }
        }
      }
      
      toast({
        title: "Éxito",
        description: "Plan guardado correctamente",
      });
      
      if (onSave) onSave();
    } catch (error) {
      console.error("Error saving plan:", error);
      toast({
        title: "Error",
        description: "No se pudo guardar el plan",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!plan?.id) {
      await handleSave();
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Asegurar que todas las respuestas estén guardadas antes del envío
      for (const [fieldId, value] of Object.entries(responses)) {
        if (value !== null && value !== undefined && value !== '') {
          await upsertCustomPlanResponse({
            custom_plan_id: plan.id,
            plan_field_id: fieldId,
            response_value: value
          });
        }
      }
      
      await submitCustomPlan(plan.id);
      
      toast({
        title: "Éxito",
        description: "Plan enviado para revisión con todas las asignaciones guardadas",
      });
      
      if (onSave) onSave();
    } catch (error) {
      console.error("Error submitting plan:", error);
      toast({
        title: "Error",
        description: "No se pudo enviar el plan",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderField = (field: any) => {
    const value = responses[field.id] || '';
    
    switch (field.field_type) {
      case 'text':
        return (
          <Input
            value={value}
            onChange={(e) => handleResponseChange(field.id, e.target.value)}
            placeholder={`Ingresa ${field.field_name.toLowerCase()}`}
            disabled={plan?.status === 'submitted' || plan?.status === 'approved'}
          />
        );
      
      case 'textarea':
        return (
          <Textarea
            value={value}
            onChange={(e) => handleResponseChange(field.id, e.target.value)}
            placeholder={`Describe ${field.field_name.toLowerCase()}`}
            rows={4}
            disabled={plan?.status === 'submitted' || plan?.status === 'approved'}
          />
        );
      
      case 'number':
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => handleResponseChange(field.id, parseInt(e.target.value) || 0)}
            placeholder="0"
            disabled={plan?.status === 'submitted' || plan?.status === 'approved'}
          />
        );
      
      case 'dropdown':
        return (
          <Select 
            value={value} 
            onValueChange={(val) => handleResponseChange(field.id, val)}
            disabled={plan?.status === 'submitted' || plan?.status === 'approved'}
          >
            <SelectTrigger>
              <SelectValue placeholder={`Selecciona ${field.field_name.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {field.dropdown_options?.map((option: string) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      case 'strategic_axes':
        return (
          <Select 
            value={value} 
            onValueChange={(val) => handleResponseChange(field.id, val)}
            disabled={plan?.status === 'submitted' || plan?.status === 'approved'}
          >
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
        );
      
      case 'actions':
        return (
          <Select 
            value={value} 
            onValueChange={(val) => handleResponseChange(field.id, val)}
            disabled={plan?.status === 'submitted' || plan?.status === 'approved'}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona una acción" />
            </SelectTrigger>
            <SelectContent>
              {actions.map((action) => (
                <SelectItem key={action.id} value={action.id}>
                  {action.code} - {action.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      case 'products':
        return (
          <Select 
            value={value} 
            onValueChange={(val) => handleResponseChange(field.id, val)}
            disabled={plan?.status === 'submitted' || plan?.status === 'approved'}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un producto" />
            </SelectTrigger>
            <SelectContent>
              {products.map((product) => (
                <SelectItem key={product.id} value={product.id}>
                  {product.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      default:
        return (
          <Input
            value={value}
            onChange={(e) => handleResponseChange(field.id, e.target.value)}
            placeholder={`Ingresa ${field.field_name.toLowerCase()}`}
            disabled={plan?.status === 'submitted' || plan?.status === 'approved'}
          />
        );
    }
  };

  if (isLoading && !embedded) {
    return <div className="flex justify-center p-8">Cargando...</div>;
  }

  const isReadOnly = plan?.status === 'submitted' || plan?.status === 'approved';

  if (embedded) {
    return (
      <div className="space-y-4">
        {fields.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campo</TableHead>
                <TableHead>Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fields.map((field) => {
                const value = responses[field.id];
                let displayValue = value || 'Sin especificar';
                
                // Format display value based on field type
                if (field.field_type === 'strategic_axes' && value) {
                  const axis = strategicAxes.find(a => a.id === value);
                  displayValue = axis ? `${axis.code} - ${axis.name}` : value;
                } else if (field.field_type === 'actions' && value) {
                  const action = actions.find(a => a.id === value);
                  displayValue = action ? `${action.code} - ${action.name}` : value;
                } else if (field.field_type === 'products' && value) {
                  const product = products.find(p => p.id === value);
                  displayValue = product ? product.name : value;
                }
                
                return (
                  <TableRow key={field.id}>
                    <TableCell className="font-medium">{field.field_name}</TableCell>
                    <TableCell>{displayValue}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-4 text-gray-500">
            No hay campos configurados para este tipo de plan
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {!embedded && (
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {plan ? 'Editar Plan' : 'Crear Plan'}
            </h1>
            <p className="text-gray-600">
              {planType?.name} - {planType?.description}
            </p>
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {planType?.name || 'Plan Personalizado'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="title">Título del Plan</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ingresa el título del plan"
              disabled={isReadOnly}
            />
          </div>

          {fields.length > 0 ? (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Campos del Plan</h3>
              <div className="grid gap-6">
                {fields.map((field) => (
                  <div key={field.id}>
                    <Label htmlFor={field.id} className="flex items-center gap-2">
                      {field.field_name}
                      {field.is_required && <Badge variant="secondary">Requerido</Badge>}
                    </Label>
                    {renderField(field)}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No hay campos configurados para este tipo de plan
            </div>
          )}

          {!embedded && !isReadOnly && (
            <div className="flex gap-4 pt-6">
              <Button onClick={handleSave} disabled={isLoading}>
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? 'Guardando...' : 'Guardar'}
              </Button>
              <Button onClick={handleSubmit} disabled={isLoading || !title.trim()}>
                <Send className="h-4 w-4 mr-2" />
                {isLoading ? 'Enviando...' : 'Enviar para Revisión'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
