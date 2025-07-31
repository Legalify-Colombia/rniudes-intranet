import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Settings, TestTube, History, Plus, Edit, Trash, Send } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface EmailConfiguration {
  id: string;
  campus_id: string;
  resend_api_key: string;
  from_email: string;
  from_name: string;
  is_active: boolean;
  test_email: string;
  campus?: { name: string };
}

interface EmailTemplate {
  id: string;
  name: string;
  description: string;
  template_type: string;
  subject: string;
  html_content: string;
  variables: string[];
  is_active: boolean;
  campus_id: string;
  campus?: { name: string };
}

interface EmailNotification {
  id: string;
  recipient_email: string;
  subject: string;
  status: string;
  sent_at: string;
  error_message: string;
  template?: { name: string };
}

export function EmailNotificationManagement() {
  const [configurations, setConfigurations] = useState<EmailConfiguration[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [notifications, setNotifications] = useState<EmailNotification[]>([]);
  const [campuses, setCampuses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingConfig, setEditingConfig] = useState<EmailConfiguration | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [testEmail, setTestEmail] = useState("");

  const { profile } = useAuth();
  const { toast } = useToast();

  const templateTypes = [
    { value: 'plan_submitted', label: 'Plan Presentado' },
    { value: 'plan_approved', label: 'Plan Aprobado' },
    { value: 'plan_rejected', label: 'Plan Rechazado' },
    { value: 'report_submitted', label: 'Informe Presentado' },
    { value: 'snies_report_submitted', label: 'Reporte SNIES Presentado' },
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      const [configsResult, templatesResult, notificationsResult, campusResult] = await Promise.all([
        supabase.from('email_configurations').select('*, campus(name)').order('created_at', { ascending: false }),
        supabase.from('email_templates').select('*, campus(name)').order('created_at', { ascending: false }),
        supabase.from('email_notifications').select('*, email_templates(name)').order('created_at', { ascending: false }).limit(50),
        supabase.from('campus').select('*').order('name')
      ]);

      if (configsResult.data) setConfigurations(configsResult.data);
      if (templatesResult.data) setTemplates(templatesResult.data);
      if (notificationsResult.data) setNotifications(notificationsResult.data);
      if (campusResult.data) setCampuses(campusResult.data);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveConfiguration = async (config: Partial<EmailConfiguration>) => {
    try {
      if (editingConfig?.id) {
        await supabase
          .from('email_configurations')
          .update(config)
          .eq('id', editingConfig.id);
      } else {
        await supabase
          .from('email_configurations')
          .insert(config);
      }
      
      toast({
        title: "Éxito",
        description: "Configuración guardada correctamente",
      });
      
      setEditingConfig(null);
      loadData();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar la configuración",
        variant: "destructive",
      });
    }
  };

  const saveTemplate = async (template: Partial<EmailTemplate>) => {
    try {
      if (editingTemplate?.id) {
        await supabase
          .from('email_templates')
          .update(template)
          .eq('id', editingTemplate.id);
      } else {
        await supabase
          .from('email_templates')
          .insert(template);
      }
      
      toast({
        title: "Éxito",
        description: "Plantilla guardada correctamente",
      });
      
      setEditingTemplate(null);
      loadData();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar la plantilla",
        variant: "destructive",
      });
    }
  };

  const testEmailConfiguration = async (configId: string) => {
    if (!testEmail) {
      toast({
        title: "Error",
        description: "Ingresa un email para la prueba",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      
      const config = configurations.find(c => c.id === configId);
      
      const { data, error } = await supabase.functions.invoke('test-email-config', {
        body: {
          campusId: config?.campus_id,
          testEmail: testEmail,
        }
      });

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Email de prueba enviado correctamente",
      });
      
      setTestEmail("");
      loadData();
    } catch (error) {
      console.error('Error testing email:', error);
      toast({
        title: "Error",
        description: "No se pudo enviar el email de prueba",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteConfiguration = async (id: string) => {
    try {
      await supabase.from('email_configurations').delete().eq('id', id);
      toast({
        title: "Éxito",
        description: "Configuración eliminada",
      });
      loadData();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la configuración",
        variant: "destructive",
      });
    }
  };

  const deleteTemplate = async (id: string) => {
    try {
      await supabase.from('email_templates').delete().eq('id', id);
      toast({
        title: "Éxito",
        description: "Plantilla eliminada",
      });
      loadData();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la plantilla",
        variant: "destructive",
      });
    }
  };

  if (profile?.role !== 'Administrador' && profile?.role !== 'Coordinador') {
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
            Gestión de Notificaciones por Email
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="configurations" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="configurations">Configuraciones</TabsTrigger>
              <TabsTrigger value="templates">Plantillas</TabsTrigger>
              <TabsTrigger value="history">Historial</TabsTrigger>
            </TabsList>

            <TabsContent value="configurations" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Configuraciones de Email</h3>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button onClick={() => setEditingConfig({} as EmailConfiguration)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Nueva Configuración
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>
                        {editingConfig?.id ? 'Editar' : 'Nueva'} Configuración de Email
                      </DialogTitle>
                    </DialogHeader>
                    <EmailConfigurationForm
                      config={editingConfig}
                      campuses={campuses}
                      onSave={saveConfiguration}
                      onCancel={() => setEditingConfig(null)}
                    />
                  </DialogContent>
                </Dialog>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campus</TableHead>
                    <TableHead>Email Remitente</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {configurations.map((config) => (
                    <TableRow key={config.id}>
                      <TableCell>{config.campus?.name || 'Global'}</TableCell>
                      <TableCell>{config.from_email}</TableCell>
                      <TableCell>
                        <Badge variant={config.is_active ? "default" : "secondary"}>
                          {config.is_active ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </TableCell>
                      <TableCell className="space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingConfig(config)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const email = prompt('Email para prueba:');
                            if (email) {
                              setTestEmail(email);
                              testEmailConfiguration(config.id);
                            }
                          }}
                        >
                          <TestTube className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            if (confirm('¿Eliminar configuración?')) {
                              deleteConfiguration(config.id);
                            }
                          }}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="templates" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Plantillas de Email</h3>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button onClick={() => setEditingTemplate({} as EmailTemplate)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Nueva Plantilla
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>
                        {editingTemplate?.id ? 'Editar' : 'Nueva'} Plantilla de Email
                      </DialogTitle>
                    </DialogHeader>
                    <EmailTemplateForm
                      template={editingTemplate}
                      campuses={campuses}
                      templateTypes={templateTypes}
                      onSave={saveTemplate}
                      onCancel={() => setEditingTemplate(null)}
                    />
                  </DialogContent>
                </Dialog>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Campus</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templates.map((template) => (
                    <TableRow key={template.id}>
                      <TableCell>{template.name}</TableCell>
                      <TableCell>
                        {templateTypes.find(t => t.value === template.template_type)?.label}
                      </TableCell>
                      <TableCell>{template.campus?.name || 'Global'}</TableCell>
                      <TableCell>
                        <Badge variant={template.is_active ? "default" : "secondary"}>
                          {template.is_active ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </TableCell>
                      <TableCell className="space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingTemplate(template)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            if (confirm('¿Eliminar plantilla?')) {
                              deleteTemplate(template.id);
                            }
                          }}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <h3 className="text-lg font-semibold">Historial de Notificaciones</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Destinatario</TableHead>
                    <TableHead>Asunto</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Plantilla</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {notifications.map((notification) => (
                    <TableRow key={notification.id}>
                      <TableCell>{notification.recipient_email}</TableCell>
                      <TableCell className="max-w-xs truncate">{notification.subject}</TableCell>
                      <TableCell>
                        <Badge variant={notification.status === 'sent' ? "default" : "destructive"}>
                          {notification.status === 'sent' ? 'Enviado' : 'Fallido'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {notification.sent_at ? new Date(notification.sent_at).toLocaleString('es-CO') : '-'}
                      </TableCell>
                      <TableCell>{notification.template?.name || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

// Formulario para configuración de email
function EmailConfigurationForm({
  config,
  campuses,
  onSave,
  onCancel
}: {
  config: EmailConfiguration | null;
  campuses: any[];
  onSave: (config: Partial<EmailConfiguration>) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    campus_id: config?.campus_id || '',
    resend_api_key: config?.resend_api_key || '',
    from_email: config?.from_email || 'no-reply@universidad.edu.co',
    from_name: config?.from_name || 'Sistema Universitario',
    is_active: config?.is_active ?? true,
    test_email: config?.test_email || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Campus</Label>
        <Select
          value={formData.campus_id}
          onValueChange={(value) => setFormData({ ...formData, campus_id: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecciona campus (opcional para global)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Global (todos los campus)</SelectItem>
            {campuses.map((campus) => (
              <SelectItem key={campus.id} value={campus.id}>
                {campus.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>API Key de Resend</Label>
        <Input
          type="password"
          value={formData.resend_api_key}
          onChange={(e) => setFormData({ ...formData, resend_api_key: e.target.value })}
          placeholder="re_xxxxxxxxxxxx"
          required
        />
      </div>

      <div>
        <Label>Email Remitente</Label>
        <Input
          type="email"
          value={formData.from_email}
          onChange={(e) => setFormData({ ...formData, from_email: e.target.value })}
          required
        />
      </div>

      <div>
        <Label>Nombre Remitente</Label>
        <Input
          value={formData.from_name}
          onChange={(e) => setFormData({ ...formData, from_name: e.target.value })}
          required
        />
      </div>

      <div>
        <Label>Email de Prueba</Label>
        <Input
          type="email"
          value={formData.test_email}
          onChange={(e) => setFormData({ ...formData, test_email: e.target.value })}
          placeholder="email@ejemplo.com"
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          checked={formData.is_active}
          onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
        />
        <Label>Configuración activa</Label>
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit">Guardar</Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}

// Formulario para plantillas de email
function EmailTemplateForm({
  template,
  campuses,
  templateTypes,
  onSave,
  onCancel
}: {
  template: EmailTemplate | null;
  campuses: any[];
  templateTypes: any[];
  onSave: (template: Partial<EmailTemplate>) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    name: template?.name || '',
    description: template?.description || '',
    template_type: template?.template_type || '',
    subject: template?.subject || '',
    html_content: template?.html_content || '',
    variables: template?.variables || [],
    is_active: template?.is_active ?? true,
    campus_id: template?.campus_id || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Nombre</Label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div>
          <Label>Tipo de Plantilla</Label>
          <Select
            value={formData.template_type}
            onValueChange={(value) => setFormData({ ...formData, template_type: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona tipo" />
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
      </div>

      <div>
        <Label>Campus</Label>
        <Select
          value={formData.campus_id}
          onValueChange={(value) => setFormData({ ...formData, campus_id: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecciona campus (opcional para global)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Global (todos los campus)</SelectItem>
            {campuses.map((campus) => (
              <SelectItem key={campus.id} value={campus.id}>
                {campus.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Descripción</Label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={2}
        />
      </div>

      <div>
        <Label>Asunto</Label>
        <Input
          value={formData.subject}
          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
          placeholder="Puede usar variables como {{variable_name}}"
          required
        />
      </div>

      <div>
        <Label>Contenido HTML</Label>
        <Textarea
          value={formData.html_content}
          onChange={(e) => setFormData({ ...formData, html_content: e.target.value })}
          rows={10}
          placeholder="Contenido HTML del email. Puede usar variables como {{variable_name}}"
          required
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          checked={formData.is_active}
          onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
        />
        <Label>Plantilla activa</Label>
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit">Guardar</Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}