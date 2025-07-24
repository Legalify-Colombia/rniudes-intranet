
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { ArrowLeft, Settings } from "lucide-react";
import { HybridPlanTypeConfiguration } from "./HybridPlanTypeConfiguration";

interface PlanTypeConfigurationProps {
  onBack: () => void;
}

export function PlanTypeConfiguration({ onBack }: PlanTypeConfigurationProps) {
  const { toast } = useToast();
  const { fetchPlanTypes } = useSupabaseData();

  const [planTypes, setPlanTypes] = useState<any[]>([]);
  const [selectedPlanType, setSelectedPlanType] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const planTypesResult = await fetchPlanTypes();
      if (planTypesResult.data) setPlanTypes(planTypesResult.data);
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

  const handleBackToList = () => {
    setSelectedPlanType(null);
    loadData();
  };

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

  if (selectedPlanType) {
    return (
      <HybridPlanTypeConfiguration
        planType={selectedPlanType}
        onBack={handleBackToList}
        onSave={handleBackToList}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Configuración de Tipos de Plan</h2>
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
      </div>

      <div className="grid gap-4">
        {planTypes.map((planType) => (
          <Card key={planType.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{planType.name}</h3>
                  <p className="text-sm text-gray-600">{planType.description}</p>
                </div>
                <Button onClick={() => setSelectedPlanType(planType)}>
                  <Settings className="h-4 w-4 mr-2" />
                  Configurar Elementos
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {planTypes.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No hay tipos de plan disponibles para configurar.
        </div>
      )}
    </div>
  );
}
