
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { useAuth } from "@/hooks/useAuth";
import { Plus, FileText } from "lucide-react";

interface CustomPlanSelectorProps {
  onSelect: (planId: string, planType: string) => void;
  onCancel: () => void;
}

export function CustomPlanSelector({ onSelect, onCancel }: CustomPlanSelectorProps) {
  const { profile } = useAuth();
  const { toast } = useToast();
  const { fetchPlanTypes, createCustomPlan } = useSupabaseData();

  const [planTypes, setPlanTypes] = useState<any[]>([]);
  const [selectedPlanType, setSelectedPlanType] = useState<string>("");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadPlanTypes();
  }, []);

  const loadPlanTypes = async () => {
    setLoading(true);
    try {
      const result = await fetchPlanTypes();
      if (result.data) {
        // Filter plan types with valid IDs
        const validPlanTypes = result.data.filter(planType => 
          planType.id && 
          typeof planType.id === 'string' && 
          planType.id.trim().length > 0
        );
        setPlanTypes(validPlanTypes);
      }
    } catch (error) {
      console.error('Error loading plan types:', error);
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

      if (result.data) {
        toast({
          title: "Éxito",
          description: "Plan creado correctamente",
        });
        onSelect(result.data.id, 'custom_plan');
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
          <Select value={selectedPlanType} onValueChange={setSelectedPlanType}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un tipo de plan" />
            </SelectTrigger>
            <SelectContent>
              {planTypes
                .filter(planType => 
                  planType.id && 
                  typeof planType.id === 'string' && 
                  planType.id.trim().length > 0
                )
                .map((planType) => (
                  <SelectItem key={planType.id} value={planType.id}>
                    {planType.name}
                  </SelectItem>
                ))
              }
            </SelectContent>
          </Select>
          {selectedPlanType && (
            <p className="text-sm text-gray-600">
              {planTypes.find(pt => pt.id === selectedPlanType)?.description}
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
            disabled={creating || !selectedPlanType || !title.trim()}
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
