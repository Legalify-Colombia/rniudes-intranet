
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Send, FileText, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useSniesReports } from "@/hooks/useSniesReports";
import { SniesReportForm } from "./SniesReportForm";

export function SniesReportManagement() {
  const [reports, setReports] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isReportFormOpen, setIsReportFormOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const { profile } = useAuth();
  const { toast } = useToast();
  const {
    fetchSniesReports,
    fetchSniesReportTemplates,
    createSniesReport,
    updateSniesReport
  } = useSniesReports();

  const [reportForm, setReportForm] = useState({
    title: '',
    template_id: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [reportsResult, templatesResult] = await Promise.all([
        fetchSniesReports(),
        fetchSniesReportTemplates()
      ]);

      if (reportsResult.error) {
        console.error('Error loading reports:', reportsResult.error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los reportes",
          variant: "destructive",
        });
      } else {
        setReports(reportsResult.data || []);
      }

      if (templatesResult.error) {
        console.error('Error loading templates:', templatesResult.error);
        toast({
          title: "Error",
          description: "No se pudieron cargar las plantillas",
          variant: "destructive",
        });
      } else {
        setTemplates(templatesResult.data || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Error inesperado al cargar los datos",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reportForm.title.trim() || !reportForm.template_id) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive",
      });
      return;
    }

    if (!profile?.id) {
      toast({
        title: "Error",
        description: "No se pudo identificar el usuario",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      console.log('Creating report with form data:', reportForm);
      
      const result = await createSniesReport({
        title: reportForm.title.trim(),
        template_id: reportForm.template_id
      });
      
      if (result.error) {
        console.error('Error creating report:', result.error);
        toast({
          title: "Error",
          description: `Error al crear el reporte: ${result.error.message || 'Error desconocido'}`,
          variant: "destructive",
        });
        return;
      }

      console.log('Report created successfully:', result.data);
      toast({ 
        title: "Éxito",
        description: "Reporte creado correctamente" 
      });
      
      setReportForm({ title: '', template_id: '' });
      setIsCreateDialogOpen(false);
      await loadData(); // Recargar datos
    } catch (error) {
      console.error('Unexpected error creating report:', error);
      toast({
        title: "Error",
        description: "Error inesperado al crear el reporte",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitReport = async (reportId: string) => {
    try {
      setIsLoading(true);
      const result = await updateSniesReport(reportId, {
        status: 'submitted',
        submitted_date: new Date().toISOString()
      });
      
      if (result.error) {
        console.error('Error submitting report:', result.error);
        toast({
          title: "Error",
          description: "Error al enviar el reporte",
          variant: "destructive",
        });
        return;
      }

      toast({ 
        title: "Éxito",
        description: "Reporte enviado correctamente" 
      });
      await loadData();
    } catch (error) {
      console.error('Unexpected error submitting report:', error);
      toast({
        title: "Error",
        description: "Error inesperado al enviar el reporte",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="secondary">Borrador</Badge>;
      case 'submitted':
        return <Badge variant="default">Enviado</Badge>;
      case 'reviewed':
        return <Badge variant="default" className="bg-green-600">Revisado</Badge>;
      default:
        return <Badge variant="outline">Sin estado</Badge>;
    }
  };

  const openReportForm = (report: any) => {
    setSelectedReport(report);
    setIsReportFormOpen(true);
  };

  const userReports = profile?.role === 'Gestor' 
    ? reports.filter(r => r.manager_id === profile.id)
    : reports;

  if (isLoading && reports.length === 0) {
    return (
      <div className="text-center py-8">
        <p>Cargando reportes SNIES...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Reportes SNIES
            </CardTitle>
            {profile?.role === 'Gestor' && (
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    className="institutional-gradient text-white"
                    disabled={isLoading}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Nuevo Reporte
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Crear Nuevo Reporte SNIES</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateReport} className="space-y-4">
                    <div>
                      <Label htmlFor="reportTitle">
                        Título del Reporte <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="reportTitle"
                        value={reportForm.title}
                        onChange={(e) => setReportForm(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Ingresa el título del reporte"
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <div>
                      <Label htmlFor="reportTemplate">
                        Plantilla <span className="text-red-500">*</span>
                      </Label>
                      <Select 
                        value={reportForm.template_id} 
                        onValueChange={(value) => setReportForm(prev => ({ ...prev, template_id: value }))}
                        disabled={isLoading}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar plantilla" />
                        </SelectTrigger>
                        <SelectContent>
                          {templates.map(template => (
                            <SelectItem key={template.id} value={template.id}>
                              {template.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsCreateDialogOpen(false)}
                        disabled={isLoading}
                      >
                        Cancelar
                      </Button>
                      <Button 
                        type="submit" 
                        className="institutional-gradient text-white"
                        disabled={isLoading}
                      >
                        {isLoading ? 'Creando...' : 'Crear Reporte'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Plantilla</TableHead>
                {profile?.role !== 'Gestor' && <TableHead>Gestor</TableHead>}
                <TableHead>Estado</TableHead>
                <TableHead>Fecha Creación</TableHead>
                <TableHead>Fecha Envío</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userReports.map((report: any) => (
                <TableRow key={report.id}>
                  <TableCell className="font-medium">{report.title}</TableCell>
                  <TableCell>{report.template?.name || 'Sin plantilla'}</TableCell>
                  {profile?.role !== 'Gestor' && (
                    <TableCell>{report.manager?.full_name || 'Sin asignar'}</TableCell>
                  )}
                  <TableCell>{getStatusBadge(report.status)}</TableCell>
                  <TableCell>
                    {new Date(report.created_at).toLocaleDateString('es-ES')}
                  </TableCell>
                  <TableCell>
                    {report.submitted_date ? 
                      new Date(report.submitted_date).toLocaleDateString('es-ES') : 
                      '-'
                    }
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => openReportForm(report)}
                        disabled={isLoading}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {report.status === 'draft' && profile?.role === 'Gestor' && (
                        <Button 
                          size="sm" 
                          onClick={() => handleSubmitReport(report.id)}
                          disabled={isLoading}
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {userReports.length === 0 && !isLoading && (
            <div className="text-center py-8 text-gray-500">
              {profile?.role === 'Gestor' ? 
                'No tienes reportes SNIES creados. Haz clic en "Nuevo Reporte" para crear uno.' :
                'No hay reportes SNIES disponibles.'
              }
            </div>
          )}
        </CardContent>
      </Card>

      {/* Report Form Dialog */}
      <Dialog open={isReportFormOpen} onOpenChange={setIsReportFormOpen}>
        <DialogContent className="max-w-7xl max-h-[95vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedReport?.title}
            </DialogTitle>
          </DialogHeader>
          {selectedReport && (
            <SniesReportForm 
              report={selectedReport}
              onSave={() => {
                setIsReportFormOpen(false);
                loadData();
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
