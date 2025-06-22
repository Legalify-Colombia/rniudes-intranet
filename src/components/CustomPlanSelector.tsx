
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { usePlanTypes } from "@/hooks/usePlanTypes";
import { useCustomPlans } from "@/hooks/useCustomPlans";
import { useAuth } from "@/hooks/useAuth";
import { Plus, FileText } from "lucide-react";

interface CustomPlanSelectorProps {
  onSelect: (planId: string, planType: string) => void;
  onCancel: () => void;
}

export function CustomPlanSelector({ onSelect, onCancel }: CustomPlanSelectorProps) {
  const { profile } = useAuth();
  const { toast } = useToast();
  const { fetchPlanTypes } = usePlanTypes();
  const { createCustomPlan } = useCustomPlans();

  const [planTypes, setPlanTypes] = useState<any[]>([]);
  const [selectedPlanType, setSelectedPlanType] = useState<string>("");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadPlanTypes();
  }, []);

  const loadPlanTypes = async () => {
    console.log("CustomPlanSelector: Starting to load plan types");
    setLoading(true);
    try {
      const result = await fetchPlanTypes();
      console.log("CustomPlanSelector: Plan types result:", result);
      
      // Ensure we always have a valid array
      let validPlanTypes: any[] = [];
      
      if (result && result.data && Array.isArray(result.data)) {
        // Filter plan types with valid IDs and ensure array is not empty
        validPlanTypes = result.data.filter(planType => {
          const isValid = planType && 
            typeof planType === 'object' &&
            planType.id && 
            typeof planType.id === 'string' && 
            planType.id.trim().length > 0 &&
            planType.name &&
            typeof planType.name === 'string' &&
            planType.name.trim().length > 0;
          
          if (!isValid) {
            console.warn("CustomPlanSelector: Invalid plan type found:", planType);
          }
          return isValid;
        });
      }
      
      console.log("CustomPlanSelector: Valid plan types:", validPlanTypes);
      console.log("CustomPlanSelector: Setting planTypes state with:", validPlanTypes);
      setPlanTypes(validPlanTypes);
      
      if (validPlanTypes.length === 0) {
        console.warn("CustomPlanSelector: No valid plan types found");
        toast({
          title: "Información",
          description: "No hay tipos de plan disponibles en este momento",
          variant: "default",
        });
      }
    } catch (error) {
      console.error('CustomPlanSelector: Error loading plan types:', error);
      setPlanTypes([]);
      toast({
        title: "Error",
        description: "No se pudieron cargar los tipos de plan",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!selectedPlanType || !title.trim() || !profile?.id) {
      toast({
        title: "Error",
        description: "Por favor selecciona un tipo de plan y proporciona un título",
        variant: "destructive",
      });
      return;
    }

    setCreating(true);
    try {
      const result = await createCustomPlan({
        plan_type_id: selectedPlanType,
        title: title.trim(),
        manager_id: profile.id,
        status: 'draft'
      });

      if (result && result.data && result.data.id) {
        toast({
          title: "Éxito",
          description: "Plan creado correctamente",
        });
        onSelect(result.data.id, 'custom_plan');
      } else {
        const errorMessage = result?.error?.message || "Error creating plan";
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Error creating custom plan:', error);
      toast({
        title: "Error",
        description: "No se pudo crear el plan",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Cargando tipos de plan...</p>
        </div>
      </div>
    );
  }

  // Ensure planTypes is always an array before rendering
  const safePlanTypes = Array.isArray(planTypes) ? planTypes : [];
  const hasValidPlanTypes = safePlanTypes.length > 0;

  console.log("CustomPlanSelector: Rendering with planTypes:", safePlanTypes);
  console.log("CustomPlanSelector: hasValidPlanTypes:", hasValidPlanTypes);

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Crear Nuevo Plan
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="planType">Tipo de Plan</Label>
          {hasValidPlanTypes ? (
            <div>
              <Select 
                value={selectedPlanType} 
                onValueChange={(value) => {
                  console.log("CustomPlanSelector: Select onValueChange called with:", value);
                  setSelectedPlanType(value);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un tipo de plan" />
                </SelectTrigger>
                <SelectContent>
                  {safePlanTypes.map((planType) => {
                    console.log("CustomPlanSelector: Rendering SelectItem for:", planType);
                    return (
                      <SelectItem key={planType.id} value={planType.id}>
                        {planType.name}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="text-sm text-gray-500 p-2 border rounded">
              No hay tipos de plan disponibles
            </div>
          )}
          {selectedPlanType && hasValidPlanTypes && (
            <p className="text-sm text-gray-600">
              {safePlanTypes.find(pt => pt.id === selectedPlanType)?.description || "Sin descripción"}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="title">Título del Plan</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ingresa el título del plan"
          />
        </div>

        <div className="flex gap-2 pt-4">
          <Button
            onClick={handleCreate}
            disabled={creating || !selectedPlanType || !title.trim() || !hasValidPlanTypes}
            className="flex-1"
          >
            <Plus className="h-4 w-4 mr-2" />
            {creating ? "Creando..." : "Crear Plan"}
          </Button>
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
