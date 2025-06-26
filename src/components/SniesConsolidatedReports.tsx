import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useReportPeriods } from "@/hooks/useReportPeriods";
import { useSniesManagement } from "@/hooks/useSniesManagement";
import { FileSpreadsheet, Download, TrendingUp, Calendar } from "lucide-react";

export function SniesConsolidatedReports() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [periods, setPeriods] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [reportData, setReportData] = useState<any[]>([]);
  const [templateFields, setTemplateFields] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const { fetchReportPeriods } = useReportPeriods();
  const {
    fetchSniesReportTemplates,
    consolidateSniesReports,
    fetchSniesReports,
    fetchSniesReportData,
    fetchSniesTemplateFields
  } = useSniesManagement();

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedTemplate && selectedPeriod) {
      loadReports();
    } else {
      setReports([]);
      setReportData([]);
      setTemplateFields([]);
    }
  }, [selectedTemplate, selectedPeriod]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [templatesResult, periodsResult] = await Promise.all([
        fetchSniesReportTemplates(),
        fetchReportPeriods()
      ]);
      if (templatesResult.data) setTemplates(templatesResult.data);
      if (periodsResult.data) setPeriods(periodsResult.data);
    } catch (error) {
      console.error("Error loading initial data:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las plantillas o períodos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadReports = async () => {
    try {
      setLoading(true);
      const reportsResult = await fetchSniesReports();
      if (reportsResult.data) {
        const filteredReports = reportsResult.data.filter(
          (r) => r.template_id === selectedTemplate && r.period_id === selectedPeriod
        );
        setReports(filteredReports);

        if (filteredReports.length > 0) {
          const reportId = filteredReports[0].id;
          const reportDataResult = await fetchSniesReportData(reportId);
          if (reportDataResult.data) setReportData(reportDataResult.data);
        } else {
          setReportData([]);
        }

        const templateFieldsResult = await fetchSniesTemplateFields(selectedTemplate);
        if (templateFieldsResult.data) setTemplateFields(templateFieldsResult.data);
      }
    } catch (error) {
      console.error("Error loading reports:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los reportes o datos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConsolidate = async () => {
    if (!selectedTemplate || !selectedPeriod) {
      toast({
        title: "Error",
        description: "Por favor selecciona una plantilla y un período",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const { error } = await consolidateSniesReports(selectedTemplate, selectedPeriod);
      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Consolidación completada correctamente",
      });

      loadReports();
    } catch (error) {
      console.error("Error consolidating reports:", error);
      toast({
        title: "Error",
        description: "No se pudo consolidar los reportes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Cargando consolidado SNIES...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FileSpreadsheet className="h-6 w-6" />
          Consolidados SNIES
        </h1>
        <div className="flex gap-2">
          <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Selecciona una plantilla" />
            </SelectTrigger>
            <SelectContent>
              {templates.map((template) => (
                <SelectItem key={template.id} value={template.id}>
                  {template.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Selecciona un período" />
            </SelectTrigger>
            <SelectContent>
              {periods.map((period) => (
                <SelectItem key={period.id} value={period.id}>
                  {period.name} ({new Date(period.start_date).toLocaleDateString()} - {new Date(period.end_date).toLocaleDateString()})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button onClick={handleConsolidate} disabled={!selectedTemplate || !selectedPeriod}>
            <TrendingUp className="w-4 h-4 mr-1" />
            Consolidar
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Reportes Consolidados
          </CardTitle>
        </CardHeader>
        <CardContent>
          {reports.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No hay reportes consolidados para la plantilla y período seleccionados.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID Reporte</TableHead>
                  {templateFields.map((field) => (
                    <TableHead key={field.id}>{field.field_name}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => {
                  const dataForReport = reportData.filter(d => d.report_id === report.id);
                  return (
                    <TableRow key={report.id}>
                      <TableCell>{report.id}</TableCell>
                      {templateFields.map((field) => {
                        const fieldData = dataForReport.find(d => d.field_id === field.id);
                        return (
                          <TableCell key={field.id}>
                            {fieldData ? fieldData.value : "-"}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
