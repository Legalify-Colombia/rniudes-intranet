import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Settings, TestTube, Save, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface EmailConfiguration {
  id?: string;
  campus_id?: string;
  resend_api_key?: string;
  from_email: string;
  from_name: string;
  test_email?: string;
  is_active: boolean;
}

export function EmailConfigurationForm() {
  const [config, setConfig] = useState<EmailConfiguration>({
    from_email: 'no-reply@universidad.edu.co',
    from_name: 'Sistema Universitario',
    is_active: true
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  
  const { profile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadConfiguration();
  }, [profile?.campus_id]);

  const loadConfiguration = async () => {
    if (!profile?.campus_id) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('email_configurations')
        .select('*')
        .eq('campus_id', profile.campus_id)
        .single();

      if (data) {
        setConfig(data);
      }
    } catch (error) {
      console.error('Error loading email configuration:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      
      const configData = {
        ...config,
        campus_id: profile?.campus_id,
        created_by: profile?.id
      };

      let result;
      if (config.id) {
        result = await supabase
          .from('email_configurations')
          .update(configData)
          .eq('id', config.id)
          .select()
          .single();
      } else {
        result = await supabase
          .from('email_configurations')
          .insert(configData)
          .select()
          .single();
      }

      if (result.error) {
        throw result.error;
      }

      setConfig(result.data);
      toast({
        title: "Éxito",
        description: "Configuración de email guardada correctamente",
      });
    } catch (error: any) {
      console.error('Error saving email configuration:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar la configuración",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestEmail = async () => {
    if (!config.test_email) {
      toast({
        title: "Error",
        description: "Ingresa un email de prueba",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsTesting(true);
      
      const { data, error } = await supabase.functions.invoke('send-email-notification', {
        body: {
          templateType: 'test_email',
          recipientEmails: [config.test_email],
          variables: {
            recipient_name: 'Usuario de Prueba',
            test_message: 'Este es un email de prueba del sistema'
          },
          campusId: profile?.campus_id
        }
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Éxito",
        description: "Email de prueba enviado correctamente",
      });
    } catch (error: any) {
      console.error('Error sending test email:', error);
      toast({
        title: "Error",
        description: `Error al enviar email de prueba: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Configuración de Notificaciones por Email
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="resend_api_key">API Key de Resend *</Label>
            <Input
              id="resend_api_key"
              type="password"
              value={config.resend_api_key || ''}
              onChange={(e) => setConfig(prev => ({ ...prev, resend_api_key: e.target.value }))}
              placeholder="re_xxxxxxxxxxxxxxxxxxxxxxxxx"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Obtén tu API key en <a href="https://resend.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-primary underline">resend.com/api-keys</a>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="from_email">Email Remitente *</Label>
              <Input
                id="from_email"
                type="email"
                value={config.from_email}
                onChange={(e) => setConfig(prev => ({ ...prev, from_email: e.target.value }))}
                placeholder="no-reply@universidad.edu.co"
              />
            </div>

            <div>
              <Label htmlFor="from_name">Nombre Remitente *</Label>
              <Input
                id="from_name"
                value={config.from_name}
                onChange={(e) => setConfig(prev => ({ ...prev, from_name: e.target.value }))}
                placeholder="Sistema Universitario"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="test_email">Email de Prueba</Label>
            <Input
              id="test_email"
              type="email"
              value={config.test_email || ''}
              onChange={(e) => setConfig(prev => ({ ...prev, test_email: e.target.value }))}
              placeholder="tu-email@universidad.edu.co"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Email para enviar notificaciones de prueba
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={config.is_active ? "default" : "secondary"}>
            {config.is_active ? "Activo" : "Inactivo"}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setConfig(prev => ({ ...prev, is_active: !prev.is_active }))}
          >
            {config.is_active ? "Desactivar" : "Activar"}
          </Button>
        </div>

        <div className="flex gap-3 pt-4 border-t">
          <Button 
            onClick={handleSave} 
            disabled={isLoading || !config.from_email || !config.from_name}
          >
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Guardando...' : 'Guardar Configuración'}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleTestEmail}
            disabled={isTesting || !config.resend_api_key || !config.test_email}
          >
            <TestTube className="h-4 w-4 mr-2" />
            {isTesting ? 'Enviando...' : 'Enviar Prueba'}
          </Button>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium flex items-center gap-2 mb-2">
            <Mail className="h-4 w-4" />
            Configuración de Resend
          </h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>1. Crea una cuenta en <a href="https://resend.com" target="_blank" className="text-primary underline">resend.com</a></li>
            <li>2. Verifica tu dominio en <a href="https://resend.com/domains" target="_blank" className="text-primary underline">resend.com/domains</a></li>
            <li>3. Genera un API key en <a href="https://resend.com/api-keys" target="_blank" className="text-primary underline">resend.com/api-keys</a></li>
            <li>4. Configura el email remitente con un dominio verificado</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}