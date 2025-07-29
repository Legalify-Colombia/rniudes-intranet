import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseDataSnies } from "@/hooks/useSupabaseDataSnies";
import { useSnies } from "@/hooks/useSnies";
import { FileText, Download, FileSpreadsheet } from "lucide-react";
import * as XLSX from 'xlsx';

export function SniesConsolidatedReports() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string | undefined>(undefined);
  const [consolidatedReports, setConsolidatedReports] = useState<any[]>([]);
  const [reportData, setReportData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConsolidating, setIsConsolidating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const { toast } = useToast();
  const { 
    fetchSniesReportTemplates, 
    consolidateSniesReports, 
    fetchSniesReports,
    fetchSniesTemplateFields 
  } = useSupabaseDataSnies();
  
  const { fetchSniesReportData } = useSnies();

  useEffect(() => {
    loadTemplates();
    loadConsolidatedReports();
  }, []);

  const loadTemplates = async () => {
    setIsLoading(true);
    try {
      const result = await fetchSniesReportTemplates();
      if (result.error) {
        throw result.error;
      }
      setTemplates(result.data || []);
    } catch (error) {
      console.error('Error loading templates:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las plantillas",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadConsolidatedReports = async () => {
    setIsLoading(true);
    try {
      const result = await fetchSniesReports();
      if (result.error) {
        throw result.error;
      }
      setConsolidatedReports(result.data || []);
    } catch (error) {
      console.error('Error loading consolidated reports:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los informes consolidados",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadConsolidatedData = async (templateId: string) => {
    try {
      setIsLoading(true);
      
      // Obtener todos los reportes de la plantilla seleccionada
      const reportsResult = await fetchSniesReports();
      if (reportsResult.error) throw reportsResult.error;
      
      const templateReports = (reportsResult.data || []).filter(
        report => report.template_id === templateId
      );

      // Obtener los datos de cada reporte
      const allData: any[] = [];
      for (const report of templateReports) {
        const dataResult = await fetchSniesReportData(report.id);
        if (dataResult.data) {
          dataResult.data.forEach((item: any) => {
            allData.push({
              ...item.field_data,
              report_id: report.id,
              report_title: report.title,
              created_at: report.created_at
            });
          });
        }
      }
      
      setReportData(allData);
    } catch (error) {
      console.error('Error loading consolidated data:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos consolidados",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConsolidation = async () => {
    setIsConsolidating(true);
    try {
      if (!selectedTemplate) {
        toast({
          title: "Error",
          description: "Selecciona una plantilla para consolidar",
          variant: "destructive",
        });
        return;
      }

      const result = await consolidateSniesReports(selectedTemplate);
      if (result.error) {
        throw result.error;
      }

      toast({
        title: "Éxito",
        description: "Informes consolidados exitosamente",
      });
      
      await loadConsolidatedReports();
    } catch (error) {
      console.error('Error consolidating reports:', error);
      toast({
        title: "Error",
        description: "Error al consolidar los informes",
        variant: "destructive",
      });
    } finally {
      setIsConsolidating(false);
    }
  };

  const exportToExcel = async () => {
    if (!selectedTemplate || reportData.length === 0) {
      toast({
        title: "Error",
        description: "Selecciona una plantilla y consolida los datos primero",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsExporting(true);
      
      // Obtener los campos de la plantilla para los headers
      const fieldsResult = await fetchSniesTemplateFields(selectedTemplate);
      const templateFields = fieldsResult.data || [];
      
      // Crear headers
      const headers = [
        'ID Reporte',
        'Título Reporte',
        'Fecha Creación',
        ...templateFields.map(field => field.field_label || field.name)
      ];
      
      // Preparar los datos
      const exportData = reportData.map(row => {
        const rowData = [
          row.report_id,
          row.report_title,
          new Date(row.created_at).toLocaleDateString('es-ES')
        ];
        
        templateFields.forEach(field => {
          rowData.push(row[field.field_name || field.name] || '');
        });
        
        return rowData;
      });
      
      // Crear el workbook
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet([headers, ...exportData]);
      
      // Configurar el ancho de las columnas
      const colWidths = headers.map(() => ({ width: 20 }));
      ws['!cols'] = colWidths;
      
      XLSX.utils.book_append_sheet(wb, ws, 'Datos Consolidados');
      
      // Obtener el nombre de la plantilla para el archivo
      const selectedTemplateData = templates.find(t => t.id === selectedTemplate);
      const fileName = `SNIES_${selectedTemplateData?.name || 'Consolidado'}_${new Date().toISOString().split('T')[0]}.xlsx`;
      
      XLSX.writeFile(wb, fileName);
      
      toast({
        title: "Éxito",
        description: "Archivo Excel exportado correctamente",
      });
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      toast({
        title: "Error",
        description: "Error al exportar a Excel",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const exportToCSV = async () => {
    if (!selectedTemplate || reportData.length === 0) {
      toast({
        title: "Error",
        description: "Selecciona una plantilla y consolida los datos primero",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsExporting(true);
      
      // Obtener los campos de la plantilla para los headers
      const fieldsResult = await fetchSniesTemplateFields(selectedTemplate);
      const templateFields = fieldsResult.data || [];
      
      // Crear headers
      const headers = [
        'ID Reporte',
        'Título Reporte', 
        'Fecha Creación',
        ...templateFields.map(field => field.field_label || field.name)
      ];
      
      // Preparar los datos
      const csvRows = [headers];
      
      reportData.forEach(row => {
        const rowData = [
          row.report_id,
          `"${row.report_title}"`, // Escapar comillas para CSV
          new Date(row.created_at).toLocaleDateString('es-ES')
        ];
        
        templateFields.forEach(field => {
          const value = row[field.field_name || field.name] || '';
          // Escapar comillas y comas en CSV
          rowData.push(`"${String(value).replace(/"/g, '""')}"`);
        });
        
        csvRows.push(rowData);
      });
      
      // Convertir a CSV
      const csvContent = csvRows.map(row => row.join(',')).join('\n');
      
      // Crear y descargar el archivo
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      const selectedTemplateData = templates.find(t => t.id === selectedTemplate);
      const fileName = `SNIES_${selectedTemplateData?.name || 'Consolidado'}_${new Date().toISOString().split('T')[0]}.csv`;
      
      link.setAttribute('href', url);
      link.setAttribute('download', fileName);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Éxito",
        description: "Archivo CSV exportado correctamente",
      });
    } catch (error) {
      console.error('Error exporting to CSV:', error);
      toast({
        title: "Error",
        description: "Error al exportar a CSV",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);
    loadConsolidatedData(templateId);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Consolidación de Informes SNIES</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4 items-center">
            <Select onValueChange={handleTemplateChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Seleccionar Plantilla" />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button onClick={handleConsolidation} disabled={isConsolidating}>
              {isConsolidating ? "Consolidando..." : "Consolidar Informes"}
            </Button>
            
            {reportData.length > 0 && (
              <div className="flex gap-2">
                <Button 
                  onClick={exportToExcel} 
                  disabled={isExporting}
                  variant="outline"
                  size="sm"
                >
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  {isExporting ? "Exportando..." : "Exportar Excel"}
                </Button>
                
                <Button 
                  onClick={exportToCSV} 
                  disabled={isExporting}
                  variant="outline"
                  size="sm"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {isExporting ? "Exportando..." : "Exportar CSV"}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Datos Consolidados
            {reportData.length > 0 && (
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({reportData.length} registros)
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Cargando datos consolidados...</p>
          ) : reportData.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="mx-auto h-6 w-6 text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">
                {selectedTemplate 
                  ? "No hay datos consolidados para esta plantilla."
                  : "Selecciona una plantilla para ver los datos consolidados."
                }
              </p>
            </div>
          ) : (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="overflow-auto max-h-[60vh]" style={{ maxWidth: '100%' }}>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Reporte</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Registros</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {consolidatedReports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell>{report.title}</TableCell>
                        <TableCell>
                          {new Date(report.created_at).toLocaleDateString('es-ES')}
                        </TableCell>
                        <TableCell>
                          {reportData.filter(data => data.report_id === report.id).length}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
