import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Plus, Edit, Trash2, FileText, Eye, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { useCustomPlans } from "@/hooks/useCustomPlans";
import { usePlanTypes } from "@/hooks/usePlanTypes";

interface StructuredWorkPlanFormProps {
  onSave: () => void;
  onCancel: () => void;
}

export function StructuredWorkPlanForm({ onSave, onCancel }: StructuredWorkPlanFormProps) {
  const [elements, setElements] = useState<any[]>([]);
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(new Date())
  const { toast } = useToast();
  const { profile } = useAuth();

  const {
    createCustomPlan,
    updateCustomPlan,
    fetchCustomPlansByManager,
    upsertCustomPlanAssignment
  } = useCustomPlans();

  const { fetchPlanTypeElements } = usePlanTypes();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Assuming a fixed plan type ID for work plans
      const planTypeId = "0a5b9c8d-4e2f-4b1a-9c3e-5a7b8d9f1c23"; // Replace with actual ID
      const elementsResult = await fetchPlanTypeElements(planTypeId);

      if (elementsResult.error) {
        console.error('Error loading plan type elements:', elementsResult.error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los elementos del plan",
          variant: "destructive",
        });
      } else {
        setElements(elementsResult.data || []);
        // Initialize form data with empty values for each element
        const initialFormData: any = {};
        elementsResult.data?.forEach(element => {
          initialFormData[element.id] = ''; // Or a more appropriate default value
        });
        setFormData(initialFormData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Error inesperado al cargar los datos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (elementId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [elementId]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      setIsCreating(true);

      // Validate required fields
      for (const element of elements) {
        if (element.is_required && !formData[element.id]) {
          toast({
            title: "Error de validación",
            description: `El campo "${element.element_label}" es obligatorio`,
            variant: "destructive",
          });
          return;
        }
      }

      // Prepare data for custom_plans table
      const planData = {
        plan_type_id: "0a5b9c8d-4e2f-4b1a-9c3e-5a7b8d9f1c23", // Fixed plan type ID
        title: 'Plan de Trabajo', // Or get from user input
        description: 'Plan de Trabajo Detallado', // Or get from user input
        start_date: selectedDate?.toISOString(),
        end_date: selectedDate?.toISOString(),
        is_active: true,
        progress_percentage: 0,
        status: 'draft'
      };

      // Create the custom plan
      const createResult = await createCustomPlan(planData);
      if (createResult.error) {
        console.error('Error creating custom plan:', createResult.error);
        toast({
          title: "Error",
          description: "Error al crear el plan de trabajo",
          variant: "destructive",
        });
        return;
      }

      const newPlanId = createResult.data?.id;

      // Create assignments for each element
      for (const element of elements) {
        const assignmentData = {
          custom_plan_id: newPlanId,
          plan_type_element_id: element.id,
          element_value: formData[element.id]
        };
        const assignmentResult = await upsertCustomPlanAssignment(assignmentData);
        if (assignmentResult.error) {
          console.error(`Error creating assignment for element ${element.id}:`, assignmentResult.error);
          toast({
            title: "Error",
            description: `Error al guardar el campo "${element.element_label}"`,
            variant: "destructive",
          });
          return;
        }
      }

      toast({
        title: "Éxito",
        description: "Plan de trabajo creado correctamente",
      });
      onSave();
    } catch (error) {
      console.error('Unexpected error creating plan:', error);
      toast({
        title: "Error",
        description: "Error inesperado al crear el plan de trabajo",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Cargando formulario...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Formulario de Plan de Trabajo
          </CardTitle>
        </CardHeader>
        <CardContent>

        <div className="grid gap-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title">Fecha</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-[240px] justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) =>
                      date > new Date()
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campo</TableHead>
                <TableHead>Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {elements.map((element) => (
                <TableRow key={element.id}>
                  <TableCell className="font-medium">{element.element_label}</TableCell>
                  <TableCell>
                    {element.element_type === "text" && (
                      <Input
                        type="text"
                        value={formData[element.id] || ""}
                        onChange={(e) => handleInputChange(element.id, e.target.value)}
                      />
                    )}
                    {element.element_type === "textarea" && (
                      <Textarea
                        value={formData[element.id] || ""}
                        onChange={(e) => handleInputChange(element.id, e.target.value)}
                      />
                    )}
                    {element.element_type === "number" && (
                      <Input
                        type="number"
                        value={formData[element.id] || ""}
                        onChange={(e) => handleInputChange(element.id, e.target.value)}
                      />
                    )}
                    {element.element_type === "select" && (
                      <Select
                        value={formData[element.id] || ""}
                        onValueChange={(value) => handleInputChange(element.id, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent>
                          {element.element_options?.split(",").map((option: string) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          className="institutional-gradient text-white"
          onClick={handleSubmit}
          disabled={isCreating}
        >
          {isCreating ? 'Creando...' : 'Guardar Plan de Trabajo'}
        </Button>
      </div>
    </div>
  );
}
