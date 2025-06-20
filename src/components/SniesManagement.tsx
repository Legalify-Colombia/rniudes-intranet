
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { SniesConfigurationManagement } from "./SniesConfigurationManagement";
import { SniesTemplateManagement } from "./SniesTemplateManagement";
import { SniesReportManagement } from "./SniesReportManagement";
import { SniesConsolidatedReports } from "./SniesConsolidatedReports";

export function SniesManagement() {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState("configuration");

  if (!profile) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Cargando información del usuario...
        </AlertDescription>
      </Alert>
    );
  }

  if (profile.role !== 'Administrador' && profile.role !== 'Coordinador' && profile.role !== 'Gestor') {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No tienes permisos para acceder a esta sección.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Reportes SNIES</h1>
        <p className="text-gray-600">Gestión de reportes del Sistema Nacional de Información de la Educación Superior</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-4 w-full">
          {(profile.role === 'Administrador') && (
            <TabsTrigger value="configuration">Configuración</TabsTrigger>
          )}
          {(profile.role === 'Administrador') && (
            <TabsTrigger value="templates">Plantillas</TabsTrigger>
          )}
          <TabsTrigger value="reports">Reportes</TabsTrigger>
          <TabsTrigger value="consolidated">Consolidados</TabsTrigger>
        </TabsList>

        {profile.role === 'Administrador' && (
          <TabsContent value="configuration">
            <SniesConfigurationManagement />
          </TabsContent>
        )}

        {profile.role === 'Administrador' && (
          <TabsContent value="templates">
            <SniesTemplateManagement />
          </TabsContent>
        )}

        <TabsContent value="reports">
          <SniesReportManagement />
        </TabsContent>

        <TabsContent value="consolidated">
          <SniesConsolidatedReports />
        </TabsContent>
      </Tabs>
    </div>
  );
}
