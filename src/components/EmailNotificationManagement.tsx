import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { EmailConfigurationForm } from "./EmailConfigurationForm";
import {
  Plus,
  Edit,
  Eye,
  Trash2,
  Mail,
  ListFilter,
  RefreshCcw,
  History,
} from "lucide-react";

interface Campus {
  id: string;
  name: string;
}

// Interfaz para la plantilla de email, con tipos corregidos
interface EmailTemplate {
  id: string;
  name: string;
  description: string;
  subject: string;
  html_content: string;
  template_type: string;
  is_active: boolean;
  campus_id: string;
  variables: string[] | null;
  created_at: string;
  updated_at: string;
  campus?: Campus;
}

const tableHeaders = [
  "Nombre",
  "Tipo",
  "Campus",
  "Asunto",
  "Estado",
  "Acciones",
];

const templateTypes = [
  { value: "plan_submitted", label: "Plan Enviado" },
  { value: "plan_approved", label: "Plan Aprobado" },
  { value: "plan_rejected", label: "Plan Rechazado" },
  { value: "report_submitted", label: "Informe Enviado" },
  { value: "snies_report_submitted", label: "Informe SNIES Enviado" },
  { value: "user_creation", label: "Creación de Usuario" },
  { value: "password_reset", label: "Restablecimiento de Contraseña" },
  { value: "welcome_message", label: "Mensaje de Bienvenida" },
  { value: "custom", label: "Personalizada" }
];

const defaultVariables = {
  plan_submitted: ["manager_name", "plan_title", "plan_type_name", "campus_name", "submitted_date"],
  plan_approved: ["manager_name", "plan_title", "approved_by", "campus_name", "approval_date"],
  plan_rejected: ["manager_name", "plan_title", "rejected_by", "campus_name", "rejection_reason"],
  report_submitted: ["manager_name", "report_title", "template_name", "report_period", "campus_name"],
  snies_report_submitted: ["manager_name", "report_title", "campus_name", "submitted_date"],
  user_creation: ["user_name", "user_email", "temporary_password", "campus_name", "role", "login_url"],
  password_reset: ["user_name", "temporary_password", "login_url", "campus_name"],
  welcome_message: ["user_name", "user_email", "role", "campus_name", "contact_email"],
  custom: []
};

export function EmailNotificationManagement() {
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState<
    Partial<EmailTemplate>
  >({
    name: "",
    subject: "",
    html_content: "",
    template_type: "plan_approval",
    description: "",
    is_active: true,
    campus_id: "",
    variables: [],
  });
  const { profile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    const { data: templatesData, error: templatesError } = await supabase
      .from("email_templates")
      .select(`*, campus:campus_id(name)`);

    const { data: campusesData, error: campusesError } = await supabase
      .from("campus")
      .select("*");

    const { data: notificationsData, error: notificationsError } = await supabase
      .from("email_notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (templatesError) {
      setError(templatesError.message);
      toast({
        title: "Error al cargar plantillas",
        description: templatesError.message,
        variant: "destructive",
      });
    } else {
      const processedTemplates: EmailTemplate[] = templatesData.map((template: any) => ({
        ...template,
        variables: template.variables ? template.variables : null,
      }));
      setEmailTemplates(processedTemplates);
    }

    if (campusesError) {
      setError(campusesError.message);
      toast({
        title: "Error al cargar campus",
        description: campusesError.message,
        variant: "destructive",
      });
    } else {
      setCampuses(campusesData || []);
    }

    if (!notificationsError) {
      setNotifications(notificationsData || []);
    }

    setLoading(false);
  };

  const handleCreateOrUpdate = async () => {
    const { id, ...templateData } = currentTemplate;
    const { data: { user } } = await supabase.auth.getUser();

    try {
      if (isEditMode && id) {
        // Actualizar plantilla existente
        const { error } = await supabase
          .from("email_templates")
          .update(templateData)
          .eq("id", id);

        if (error) throw error;
        toast({
          title: "Éxito",
          description: "Plantilla actualizada correctamente.",
        });
      } else {
        // Crear nueva plantilla
        const { campus, ...cleanedData } = templateData;
        const newTemplate = {
          ...cleanedData,
          name: currentTemplate.name || "",
          subject: currentTemplate.subject || "",
          html_content: currentTemplate.html_content || "",
          template_type: currentTemplate.template_type || "plan_approval",
          created_by: user?.id,
          variables: currentTemplate.variables || [],
        };
        const { error } = await supabase
          .from("email_templates")
          .insert(newTemplate);

        if (error) throw error;
        toast({
          title: "Éxito",
          description: "Plantilla creada correctamente.",
        });
      }
      setIsDialogOpen(false);
      fetchData();
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Error",
        description: `Error al guardar la plantilla: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const openNewTemplateDialog = () => {
    setIsEditMode(false);
    setCurrentTemplate({
      name: "",
      subject: "",
      html_content: "",
      template_type: "plan_submitted",
      description: "",
      is_active: true,
      campus_id: "",
      variables: defaultVariables.plan_submitted,
    });
    setIsDialogOpen(true);
  };

  const openEditTemplateDialog = (template: EmailTemplate) => {
    setIsEditMode(true);
    setCurrentTemplate(template);
    setIsDialogOpen(true);
  };

  if (profile?.role !== "Administrador" && profile?.role !== "Coordinador") {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">
          No tienes permisos para acceder a esta sección.
        </p>
      </div>
    );
  }

  if (loading) {
    return <div className="flex justify-center p-8">Cargando...</div>;
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="configuration" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="configuration">Configuración</TabsTrigger>
          <TabsTrigger value="templates">Plantillas</TabsTrigger>
          <TabsTrigger value="history">Historial</TabsTrigger>
        </TabsList>
        
        <TabsContent value="configuration">
          <EmailConfigurationForm />
        </TabsContent>
        
        <TabsContent value="templates">
          <Card className="w-full">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Gestión de Plantillas de Correo
                </CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={fetchData}>
                    <RefreshCcw className="w-4 h-4 mr-2" />
                    Actualizar
                  </Button>
                  <Button onClick={openNewTemplateDialog}>
                    <Plus className="w-4 h-4 mr-2" />
                    Nueva Plantilla
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
        {emailTemplates.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No hay plantillas de correo electrónico registradas.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                {tableHeaders.map((header) => (
                  <TableHead key={header}>{header}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {emailTemplates.map((template) => (
                <TableRow key={template.id}>
                  <TableCell className="font-medium">{template.name}</TableCell>
                  <TableCell>{template.template_type}</TableCell>
                  <TableCell>{template.campus?.name || "Global"}</TableCell>
                  <TableCell>{template.subject}</TableCell>
                  <TableCell>
                    {template.is_active ? (
                      <Badge className="bg-green-500 hover:bg-green-500">
                        Activa
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Inactiva</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditTemplateDialog(template)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  </TabsContent>
        
  <TabsContent value="history">
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Historial de Notificaciones
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Destinatario</TableHead>
              <TableHead>Asunto</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Tipo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {notifications.map((notification) => (
              <TableRow key={notification.id}>
                <TableCell>
                  {new Date(notification.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>{notification.recipient_email}</TableCell>
                <TableCell>{notification.subject}</TableCell>
                <TableCell>
                  <Badge 
                    variant={
                      notification.status === 'sent' ? "default" : 
                      notification.status === 'failed' ? "destructive" : 
                      "secondary"
                    }
                  >
                    {notification.status === 'sent' ? 'Enviado' : 
                     notification.status === 'failed' ? 'Fallido' : 
                     'Pendiente'}
                  </Badge>
                </TableCell>
                <TableCell>{notification.related_entity_type}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  </TabsContent>
</Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Editar Plantilla" : "Crear Nueva Plantilla"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre de la Plantilla</Label>
                <Input
                  id="name"
                  value={currentTemplate.name}
                  onChange={(e) =>
                    setCurrentTemplate({
                      ...currentTemplate,
                      name: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Asunto</Label>
                <Input
                  id="subject"
                  value={currentTemplate.subject}
                  onChange={(e) =>
                    setCurrentTemplate({
                      ...currentTemplate,
                      subject: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={currentTemplate.description}
                onChange={(e) =>
                  setCurrentTemplate({
                    ...currentTemplate,
                    description: e.target.value,
                  })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="template_type">Tipo de Plantilla</Label>
                <Select
                  value={currentTemplate.template_type}
                  onValueChange={(value) => {
                    const variables = defaultVariables[value as keyof typeof defaultVariables] || [];
                    setCurrentTemplate({
                      ...currentTemplate,
                      template_type: value,
                      variables: variables
                    });
                  }}
                >
                  <SelectTrigger id="template_type">
                    <SelectValue placeholder="Selecciona un tipo" />
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
              <div className="space-y-2">
                <Label htmlFor="campus">Campus</Label>
                <Select
                  value={currentTemplate.campus_id || ""}
                  onValueChange={(value) =>
                    setCurrentTemplate({
                      ...currentTemplate,
                      campus_id: value,
                    })
                  }
                >
                  <SelectTrigger id="campus">
                    <SelectValue placeholder="Selecciona un campus" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Global</SelectItem>
                    {campuses.map((campus) => (
                      <SelectItem key={campus.id} value={campus.id}>
                        {campus.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="html_content">Contenido HTML del Correo</Label>
              <div className="text-sm text-gray-600 mb-2">
                Variables disponibles: {currentTemplate.variables?.map(v => `{{${v}}}`).join(", ") || "Ninguna"}
              </div>
              <Textarea
                id="html_content"
                value={currentTemplate.html_content}
                onChange={(e) =>
                  setCurrentTemplate({
                    ...currentTemplate,
                    html_content: e.target.value,
                  })
                }
                className="min-h-[300px] font-mono text-sm"
                placeholder={`Ejemplo de contenido HTML:
<!DOCTYPE html>
<html>
<head>
    <title>{{subject}}</title>
</head>
<body>
    <h1>¡Hola {{user_name}}!</h1>
    <p>Este es un mensaje desde {{campus_name}}.</p>
    <p>Saludos cordiales,<br/>El equipo administrativo</p>
</body>
</html>`}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="variables">Variables Personalizadas (separadas por coma)</Label>
              <Input
                id="variables"
                value={currentTemplate.variables?.join(", ") || ""}
                onChange={(e) => 
                  setCurrentTemplate({
                    ...currentTemplate,
                    variables: e.target.value.split(",").map(v => v.trim()).filter(v => v),
                  })
                }
                placeholder="Ej: custom_field, special_note, deadline_date"
              />
              <div className="text-xs text-gray-500">
                Agregue variables adicionales si necesita campos personalizados más allá de las variables por defecto del tipo seleccionado.
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_active"
                checked={currentTemplate.is_active}
                onCheckedChange={(checked) =>
                  setCurrentTemplate({
                    ...currentTemplate,
                    is_active: checked as boolean,
                  })
                }
              />
              <Label htmlFor="is_active">Activa</Label>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateOrUpdate}>
              {isEditMode ? "Guardar Cambios" : "Crear Plantilla"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
