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
import { Save, Send, Plus, Trash2, FileSpreadsheet, Users } from "lucide-react";
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils";
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { useCustomPlans } from "@/hooks/useCustomPlans";
import { usePlanTypes } from "@/hooks/usePlanTypes";

interface StructuredCustomPlanFormProps {
  planId?: string;
  planTypeId?: string;
  onSave: () => void;
  onCancel: () => void;
}

export function StructuredCustomPlanForm({ planId, planTypeId, onSave, onCancel }: StructuredCustomPlanFormProps) {
  const [planDetails, setPlanDetails] = useState<any>(null);
  const [planTypes, setPlanTypes] = useState<any[]>([]);
  const [planTypeElements, setPlanTypeElements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { profile } = useAuth();
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [date, setDate] = React.useState<Date | undefined>(new Date())

  const {
    fetchCustomPlanDetails,
    createCustomPlan,
    updateCustomPlan,
    submitCustomPlan,
    upsertCustomPlanAssignment,
    deleteCustomPlanAssignment
  } = useCustomPlans();

  const { 
    fetchPlanTypes,
    fetchPlanTypeElements
  } = usePlanTypes();

  useEffect(() => {
    loadData();
  }, [planId, planTypeId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [planTypesResult, planTypeElementsResult] = await Promise.all([
        fetchPlanTypes(),
        fetchPlanTypeElements(planTypeId || '')
      ]);

      setPlanTypes(planTypesResult.data || []);
      setPlanTypeElements(planTypeElementsResult.data || []);

      if (planId) {
        const planDetailsResult = await fetchCustomPlanDetails(planId);
        setPlanDetails(planDetailsResult.data || {});
        // Initialize form data with existing plan details
        const initialFormData: any = {};
        planTypeElementsResult.data?.forEach(element => {
          initialFormData[element.id] = planDetailsResult.data?.[element.id] || '';
        });
        setFormData(initialFormData);
      } else {
        // Initialize form data with empty values
        const initialFormData: any = {};
        planTypeElementsResult.data?.forEach(element => {
          initialFormData[element.id] = '';
        });
        setFormData(initialFormData);
      }
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

  const handleInputChange = (elementId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [elementId]: value
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Prepare plan data
      const planData = {
        plan_type_id: planTypeId,
        ...formData
      };

      let result;
      if (planId) {
        result = await updateCustomPlan(planId, planData);
      } else {
        result = await createCustomPlan(planData);
      }

      if (result.error) {
        console.error("Error saving plan:", result.error);
        toast({
          title: "Error",
          description: "No se pudo guardar el plan",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Éxito",
        description: "Plan guardado correctamente",
      });
      onSave();
    } catch (error) {
      console.error("Error submitting plan:", error);
      toast({
        title: "Error",
        description: "No se pudo enviar el plan",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
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
            <FileSpreadsheet className="h-5 w-5" />
            Formulario de Plan Personalizado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campo</TableHead>
                <TableHead>Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {planTypeElements.map((element) => {
                const elementValue = formData[element.id] || "";

                return (
                  <TableRow key={element.id}>
                    <TableCell className="font-medium">{element.label}</TableCell>
                    <TableCell>
                      {element.element_type === "text" && (
                        <Input
                          type="text"
                          value={elementValue || ""}
                          onChange={(e) => handleInputChange(element.id, e.target.value)}
                        />
                      )}
                      {element.element_type === "textarea" && (
                        <Textarea
                          value={elementValue || ""}
                          onChange={(e) => handleInputChange(element.id, e.target.value)}
                        />
                      )}
                      {element.element_type === "number" && (
                        <Input
                          type="number"
                          value={elementValue || ""}
                          onChange={(e) => handleInputChange(element.id, e.target.value)}
                        />
                      )}
                      {element.element_type === "select" && (
                        <Select
                          value={elementValue || ""}
                          onValueChange={(value) => handleInputChange(element.id, value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar" />
                          </SelectTrigger>
                          <SelectContent>
                            {element.element_options.split(",").map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                      {element.element_type === "date" && (
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-[240px] justify-start text-left font-normal",
                                !date && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {date ? format(date, "PPP") : <span>Pick a date</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="center">
                            <Calendar
                              mode="single"
                              selected={date}
                              onSelect={setDate}
                              disabled={(date) =>
                                date > new Date() || date < new Date("1900-01-01")
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
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
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Guardando...' : 'Guardar Plan'}
        </Button>
      </div>
    </div>
  );
}
