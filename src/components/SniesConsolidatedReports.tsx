import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { FileText } from "lucide-react";

export function SniesConsolidatedReports() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string | undefined>(undefined);
  const [consolidatedReports, setConsolidatedReports] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConsolidating, setIsConsolidating] = useState(false);

  const { toast } = useToast();
  const { fetchSniesReportTemplates, consolidateSniesReports, fetchSniesReports } = useSupabaseData();

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

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Consolidación de Informes SNIES</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select onValueChange={setSelectedTemplate}>
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Informes Consolidados</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Cargando informes...</p>
          ) : consolidatedReports.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="mx-auto h-6 w-6 text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">No hay informes consolidados disponibles.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Template ID</TableHead>
                  <TableHead>Created At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {consolidatedReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>{report.id}</TableCell>
                    <TableCell>{report.template_id}</TableCell>
                    <TableCell>{report.created_at}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
