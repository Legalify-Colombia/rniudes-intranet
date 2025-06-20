import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Download, FileSpreadsheet, Database } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseData, SniesReportTemplate } from "@/hooks/useSupabaseData";
import { useAuth } from "@/hooks/useAuth";

export function SniesConsolidatedReports() {
  const [consolidatedReports, setConsolidatedReports] = useState<any[]>([]);
  const [templates, setTemplates] = useState<SniesReportTemplate[]>([]);
  const [isConsolidateDialogOpen, setIsConsolidateDialogOpen] = useState(false);
  const [selectedConsolidated, setSelectedConsolidated] = useState<any>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  
  const { profile } = useAuth();
  const { toast } = useToast();
  const {
    fetchSniesReportTemplates,
    consolidateSniesReports
  } = useSupabaseData();

  const [consolidateForm, setConsolidateForm] = useState({
    title: '',
    template_id: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const templatesResult = await fetchSniesReportTemplates();
      setTemplates(templatesResult.data || []);
      
      // Load consolidated reports from Supabase
      // This would need to be implemented in useSupabaseData
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos",
        variant: "destructive",
      });
    }
  };

  const handleConsolidate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const result = await consolidateSniesReports(consolidateForm.template_id, consolidateForm.title);
      if (result.error) throw result.error;

      toast({ 
        title: "Consolidación exitosa",
        description: `Se consolidaron ${result.data.total_records} registros de ${result.data.participating_managers} gestores`
      });
      
      setConsolidateForm({ title: '', template_id: '' });
      setIsConsolidateDialogOpen(false);
      loadData();
    } catch (error) {
      console.error('Error consolidating reports:', error);
      toast({
        title: "Error",
        description: "Error al consolidar los reportes",
        variant: "destructive",
      });
    }
  };

  const exportToCSV = (consolidatedData: any[]) => {
    if (!consolidatedData || consolidatedData.length === 0) return;

    const headers = Object.keys(consolidatedData[0]);
    const csvContent = [
      headers.join(','),
      ...consolidatedData.map(row => 
        headers.map(header => 
          typeof row[header] === 'string' && row[header].includes(',') 
            ? `"${row[header]}"` 
            : row[header]
        ).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `reporte_consolidado_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Reportes Consolidados SNIES
            </CardTitle>
            {profile?.role === 'Administrador' && (
              <Dialog open={isConsolidateDialogOpen} onOpenChange={setIsConsolidateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="institutional-gradient text-white">
                    <FileSpreadsheet className="w-4 h-4 mr-2" />
                    Consolidar Reportes
                  </Button>
                </DialogTrigger>
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
                <TableHead>Total Registros</TableHead>
                <TableHead>Gestores Participantes</TableHead>
                <TableHead>Fecha Consolidación</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {consolidatedReports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell className="font-medium">{report.title}</TableCell>
                  <TableCell>{report.template?.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{report.total_records}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{report.participating_managers}</Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(report.consolidation_date).toLocaleDateString('es-ES')}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          setSelectedConsolidated(report);
                          setIsViewDialogOpen(true);
                        }}
                      >
                        Ver Datos
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={() => exportToCSV(report.consolidated_data)}
                      >
                        <Download className="w-4 h-4 mr-1" />
                        CSV
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {consolidatedReports.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No hay reportes consolidados disponibles
            </div>
          )}
        </CardContent>
      </Card>

      {/* Consolidate Dialog */}
      <Dialog open={isConsolidateDialogOpen} onOpenChange={setIsConsolidateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Consolidar Reportes SNIES</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleConsolidate} className="space-y-4">
            <div>
              <Label htmlFor="consolidateTitle">Título del Consolidado</Label>
              <Input
                id="consolidateTitle"
                value={consolidateForm.title}
                onChange={(e) => setConsolidateForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Consolidado SNIES - Enero 2024"
                required
              />
            </div>
            <div>
              <Label htmlFor="consolidateTemplate">Plantilla</Label>
              <Select value={consolidateForm.template_id} onValueChange={(value) => setConsolidateForm(prev => ({ ...prev, template_id: value }))}>
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
              <Button type="button" variant="outline" onClick={() => setIsConsolidateDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="institutional-gradient text-white">
                Consolidar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Consolidated Data Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedConsolidated?.title}
            </DialogTitle>
          </DialogHeader>
          {selectedConsolidated && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  {selectedConsolidated.total_records} registros de {selectedConsolidated.participating_managers} gestores
                </div>
                <Button onClick={() => exportToCSV(selectedConsolidated.consolidated_data)}>
                  <Download className="w-4 h-4 mr-2" />
                  Exportar CSV
                </Button>
              </div>
              
              {selectedConsolidated.consolidated_data && selectedConsolidated.consolidated_data.length > 0 && (
                <div className="overflow-auto max-h-96">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {Object.keys(selectedConsolidated.consolidated_data[0]).map((key) => (
                          <TableHead key={key}>{key}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedConsolidated.consolidated_data.slice(0, 100).map((row: any, index: number) => (
                        <TableRow key={index}>
                          {Object.values(row).map((value: any, cellIndex) => (
                            <TableCell key={cellIndex}>{value}</TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {selectedConsolidated.consolidated_data.length > 100 && (
                    <div className="text-center py-2 text-sm text-gray-500">
                      Mostrando primeros 100 registros de {selectedConsolidated.consolidated_data.length}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
