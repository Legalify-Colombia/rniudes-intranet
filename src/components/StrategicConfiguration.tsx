
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StrategicAxesManagement } from "./StrategicAxesManagement";
import { ActionsManagement } from "./ActionsManagement";
import { ProductsManagement } from "./ProductsManagement";
import { ReportTemplatesManagement } from "./ReportTemplatesManagement";
import { PlanTypesManagement } from "./PlanTypesManagement";
import { PlanElementOrderManagement } from "./PlanElementOrderManagement";
import { SniesManagement } from "./SniesManagement";
import { IndicatorsManagement } from "./IndicatorsManagement";
import { ReportPeriodsManagement } from "./ReportPeriodsManagement";
import { AgreementsManagement } from "./AgreementsManagement";

export function StrategicConfiguration() {
  const [activeTab, setActiveTab] = useState("axes");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Configuración Estratégica</h1>
        <p className="text-gray-600">Gestiona la estructura estratégica de la organización</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-10 w-full">
          <TabsTrigger value="axes">Ejes Estratégicos</TabsTrigger>
          <TabsTrigger value="actions">Acciones</TabsTrigger>
          <TabsTrigger value="products">Productos</TabsTrigger>
          <TabsTrigger value="plans">Tipos de Plan</TabsTrigger>
          <TabsTrigger value="order">Orden</TabsTrigger>
          <TabsTrigger value="templates">Plantillas</TabsTrigger>
          <TabsTrigger value="indicators">Indicadores</TabsTrigger>
          <TabsTrigger value="periods">Períodos</TabsTrigger>
          <TabsTrigger value="snies">SNIES</TabsTrigger>
          <TabsTrigger value="agreements">Convenios</TabsTrigger>
        </TabsList>

        <TabsContent value="axes">
          <StrategicAxesManagement />
        </TabsContent>
        
        <TabsContent value="actions">
          <ActionsManagement />
        </TabsContent>
        
        <TabsContent value="products">
          <ProductsManagement />
        </TabsContent>

        <TabsContent value="plans">
          <PlanTypesManagement />
        </TabsContent>

        <TabsContent value="order">
          <PlanElementOrderManagement />
        </TabsContent>

        <TabsContent value="templates">
          <ReportTemplatesManagement />
        </TabsContent>

        <TabsContent value="indicators">
          <IndicatorsManagement />
        </TabsContent>

        <TabsContent value="periods">
          <ReportPeriodsManagement />
        </TabsContent>

        <TabsContent value="snies">
          <SniesManagement />
        </TabsContent>

        <TabsContent value="agreements">
          <AgreementsManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}
