import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Mail, FileText } from "lucide-react";
import { EmailConfigurationForm } from "./EmailConfigurationForm";
import { EmailNotificationManagement } from "./EmailNotificationManagement";
import { useAuth } from "@/hooks/useAuth";

export function EmailManagementSettings() {
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
            <Mail className="h-5 w-5" />
            Gestión de Email
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="configuration" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="configuration" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Configuración
              </TabsTrigger>
              <TabsTrigger value="templates" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Plantillas
              </TabsTrigger>
            </TabsList>
            <TabsContent value="configuration" className="mt-6">
              <EmailConfigurationForm />
            </TabsContent>
            <TabsContent value="templates" className="mt-6">
              <EmailNotificationManagement />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}