import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, ArrowUp, ArrowDown, Mail, CheckSquare } from "lucide-react";
import { PlanElementOrderManagement } from "./PlanElementOrderManagement";
import { EmailNotificationManagement } from "./EmailNotificationManagement";
import { WorkPlanApproval } from "./WorkPlanApproval";
import { useAuth } from "@/hooks/useAuth";

export function CoordinatorSettings() {
  const [activeSection, setActiveSection] = useState<string>("approval");
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
          <div className="flex space-x-2 mb-6 flex-wrap gap-2">
            <Button
              variant={activeSection === "approval" ? "default" : "outline"}
              onClick={() => setActiveSection("approval")}
              className="flex items-center gap-2"
            >
              <CheckSquare className="h-4 w-4" />
              Aprobación de Planes
            </Button>
            
            <Button
              variant={activeSection === "notifications" ? "default" : "outline"}
              onClick={() => setActiveSection("notifications")}
              className="flex items-center gap-2"
            >
              <Mail className="h-4 w-4" />
              Notificaciones Email
            </Button>
            
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

          {activeSection === "approval" && <WorkPlanApproval />}
          {activeSection === "notifications" && <EmailNotificationManagement />}
          {activeSection === "order" && <PlanElementOrderManagement />}
        </CardContent>
      </Card>
    </div>
  );
}