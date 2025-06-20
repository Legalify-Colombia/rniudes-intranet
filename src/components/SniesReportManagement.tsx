
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
      const [reportsResult, templatesResult] = await Promise.all([
        fetchSniesReports(),
        fetchSniesReportTemplates()
      ]);

      if (reportsResult.error) {
        console.error('Error loading reports:', reportsResult.error);
      } else {
        setReports(reportsResult.data || []);
      }

      if (templatesResult.error) {
        console.error('Error loading templates:', templatesResult.error);
      } else {
        setTemplates(templatesResult.data || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos",
        variant: "destructive",
      });
    }
  };

  const handleCreateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reportForm.title || !reportForm.template_id) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Creating report with data:', reportForm);
      const result = await createSniesReport(reportForm);
      
      if (result.error) {
        console.error('Error creating report:', result.error);
        throw result.error;
      }

      toast({ 
        title: "Éxito",
        description: "Reporte creado correctamente" 
      });
      
      setReportForm({ title: '', template_id: '' });
      setIsCreateDialogOpen(false);
      loadData();
    } catch (error) {
      console.error('Error creating report:', error);
      toast({
        title: "Error",
        description: "Error al crear el reporte",
        variant: "destructive",
      });
    }
  };

  const handleSubmitReport = async (reportId: string) => {
    try {
      const result = await updateSniesReport(reportId, {
        status: 'submitted',
        submitted_date: new Date().toISOString()
      });
      if (result.error) throw result.error;

      toast({ 
        title: "Éxito",
        description: "Reporte enviado correctamente" 
      });
      loadData();
    } catch (error) {
      console.error('Error submitting report:', error);
      toast({
        title: "Error",
        description: "Error al enviar el reporte",
        variant: "destructive",
      });
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
                  <Button className="institutional-gradient text-white">
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
                      <Label htmlFor="reportTitle">Título del Reporte</Label>
                      <Input
                        id="reportTitle"
                        value={reportForm.title}
                        onChange={(e) => setReportForm(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Título del reporte"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="reportTemplate">Plantilla</Label>
                      <Select 
                        value={reportForm.template_id} 
                        onValueChange={(value) => setReportForm(prev => ({ ...prev, template_id: value }))}
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
                      <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit" className="institutional-gradient text-white">
                        Crear Reporte
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
                      <Button size="sm" variant="outline" onClick={() => openReportForm(report)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      {report.status === 'draft' && profile?.role === 'Gestor' && (
                        <Button size="sm" onClick={() => handleSubmitReport(report.id)}>
                          <Send className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {userReports.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No hay reportes disponibles
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
