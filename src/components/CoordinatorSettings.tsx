import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, ArrowUp, ArrowDown } from "lucide-react";
import { PlanElementOrderManagement } from "./PlanElementOrderManagement";
import { useAuth } from "@/hooks/useAuth";

export function CoordinatorSettings() {
  const [activeSection, setActiveSection] = useState<string>("order");
  const { profile } = useAuth();

  if (profile?.role !== 'Coordinador' && profile?.role !== 'Administrador') {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No tienes permisos para acceder a esta sección.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuración del Coordinador
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2 mb-6">
            <Button
              variant={activeSection === "order" ? "default" : "outline"}
              onClick={() => setActiveSection("order")}
              className="flex items-center gap-2"
            >
              <ArrowUp className="h-4 w-4" />
              <ArrowDown className="h-4 w-4" />
              Orden de Elementos
            </Button>
          </div>

          {activeSection === "order" && <PlanElementOrderManagement />}
        </CardContent>
      </Card>
    </div>
  );
}