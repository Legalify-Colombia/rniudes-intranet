import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useEmailNotifications } from '@/hooks/useEmailNotifications';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export function EmailNotificationTest() {
  const [templateType, setTemplateType] = useState('plan_submitted');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [testVariables, setTestVariables] = useState(`{
  "manager_name": "Juan Pérez",
  "plan_title": "Plan de Trabajo Test",
  "plan_type_name": "Plan Docente",
  "campus_name": "Campus Valledupar",
  "program_name": "Psicología",
  "director_name": "Director Test",
  "submitted_date": "2025-08-27"
}`);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { sendTestEmail } = useEmailNotifications();
  const { profile } = useAuth();

  const templateTypes = [
    { value: 'plan_submitted', label: 'Plan Presentado' },
    { value: 'plan_approved', label: 'Plan Aprobado' },
    { value: 'plan_rejected', label: 'Plan Rechazado' },
    { value: 'report_submitted', label: 'Informe Presentado' },
    { value: 'snies_report_submitted', label: 'Reporte SNIES Presentado' }
  ];

  const handleTestNotification = async () => {
    if (!recipientEmail) {
      toast({
        title: "Error",
        description: "Por favor ingrese un email de destinatario",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      
      let variables;
      try {
        variables = JSON.parse(testVariables);
      } catch (error) {
        toast({
          title: "Error",
          description: "El JSON de variables no es válido",
          variant: "destructive",
        });
        return;
      }

      const result = await sendTestEmail(
        templateType,
        recipientEmail,
        variables,
        profile?.campus_id
      );

      if (result.error) {
        throw new Error(result.error.message || 'Error enviando email');
      }

      toast({
        title: "Éxito",
        description: "Email de prueba enviado correctamente",
      });
    } catch (error) {
      console.error('Error sending test email:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error enviando email de prueba",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestPlanSubmission = async () => {
    if (!profile?.id) {
      toast({
        title: "Error",
        description: "Usuario no autenticado",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      
      // Crear un plan de prueba temporal
      const { data: testPlan, error: createError } = await supabase
        .from('custom_plans')
        .insert({
          title: 'Plan de Prueba - Test de Notificaciones',
          manager_id: profile.id,
          plan_type_id: '00000000-0000-0000-0000-000000000001', // Usar un UUID ficticio o uno que exista
          status: 'draft'
        })
        .select()
        .single();

      if (createError) {
        throw createError;
      }

      // Simular la presentación del plan (cambiar status a 'submitted')
      const { error: updateError } = await supabase
        .from('custom_plans')
        .update({ 
          status: 'submitted',
          submitted_date: new Date().toISOString()
        })
        .eq('id', testPlan.id);

      if (updateError) {
        throw updateError;
      }

      // Limpiar el plan de prueba después de un momento
      setTimeout(async () => {
        await supabase
          .from('custom_plans')
          .delete()
          .eq('id', testPlan.id);
      }, 5000);

      toast({
        title: "Éxito",
        description: "Prueba de presentación de plan ejecutada. Revise los logs de la base de datos para ver si se envió el email.",
      });
    } catch (error) {
      console.error('Error testing plan submission:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error probando presentación de plan",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Prueba de Notificaciones por Email</CardTitle>
        <CardDescription>
          Herramienta para probar el envío de notificaciones por email y verificar que funcionan correctamente
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="templateType">Tipo de Plantilla</Label>
            <Select value={templateType} onValueChange={setTemplateType}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccione tipo de plantilla" />
              </SelectTrigger>
              <SelectContent>
                {templateTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="recipientEmail">Email Destinatario</Label>
            <Input
              id="recipientEmail"
              type="email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              placeholder="destinatario@example.com"
            />
          </div>

          <div>
            <Label htmlFor="testVariables">Variables de Prueba (JSON)</Label>
            <Textarea
              id="testVariables"
              value={testVariables}
              onChange={(e) => setTestVariables(e.target.value)}
              rows={8}
              className="font-mono text-sm"
            />
          </div>

          <div className="flex gap-4">
            <Button 
              onClick={handleTestNotification}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? 'Enviando...' : 'Enviar Email de Prueba'}
            </Button>
            
            <Button 
              onClick={handleTestPlanSubmission}
              disabled={isLoading}
              variant="outline"
              className="flex-1"
            >
              {isLoading ? 'Probando...' : 'Probar Trigger de Plan'}
            </Button>
          </div>
        </div>

        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h4 className="font-semibold mb-2">Instrucciones:</h4>
          <ul className="text-sm space-y-1 text-muted-foreground">
            <li>• <strong>Enviar Email de Prueba:</strong> Envía un email usando la función directa</li>
            <li>• <strong>Probar Trigger de Plan:</strong> Simula la presentación de un plan para probar el trigger automático</li>
            <li>• Asegúrese de que hay una configuración de email activa en el sistema</li>
            <li>• Revise los logs de Supabase para ver detalles del envío</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}