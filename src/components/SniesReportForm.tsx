import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useSnies } from "@/hooks/useSnies";
import { useSniesManagement } from "@/hooks/useSniesManagement";
import { Save, Send, Plus, Trash2, FileSpreadsheet, Users } from "lucide-react";

interface SniesReportFormProps {
  reportId?: string;
  templateId: string;
  onSave: () => void;
}

export function SniesReportForm({ reportId, templateId, onSave }: SniesReportFormProps) {
  const [reportData, setReportData] = useState<any[]>([]);
  const [templateFields, setTemplateFields] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { profile } = useAuth();

  const {
    fetchSniesReports,
    fetchSniesReportTemplates,
    fetchSniesTemplateFields,
    createSniesReport,
    updateSniesReport,
    submitSniesReport,
    createSniesReportData,
    updateSniesReportData,
    deleteSniesReportData
  } = useSnies();

  const { fetchSniesReportData, upsertSniesReportData } = useSniesManagement();

  useEffect(() => {
    loadData();
  }, [templateId, reportId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [templateFieldsResult, reportDataResult] = await Promise.all([
        fetchSniesTemplateFields(templateId),
        reportId ? fetchSniesReportData(reportId) : Promise.resolve({ data: [] })
      ]);

      setTemplateFields(templateFieldsResult.data || []);
      setReportData(reportDataResult.data || []);
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = async (fieldId: string, value: any) => {
    try {
      const existingData = reportData.find(item => item.field_id === fieldId);

      if (existingData) {
        // Update existing data
        await upsertSniesReportData({
          id: existingData.id,
          report_id: reportId,
          field_id: fieldId,
          field_value: value,
        });
      } else {
        // Create new data
        await upsertSniesReportData({
          report_id: reportId,
          field_id: fieldId,
          field_value: value,
        });
      }

      // Refresh data
      loadData();
    } catch (error) {
      console.error("Error saving field data:", error);
      toast({
        title: "Error",
        description: "No se pudo guardar el valor del campo",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async () => {
    try {
      await submitSniesReport(reportId);
      toast({
        title: "Éxito",
        description: "Informe enviado correctamente",
      });
      onSave();
    } catch (error) {
      console.error("Error submitting report:", error);
      toast({
        title: "Error",
        description: "No se pudo enviar el informe",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Cargando formulario...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Formulario de Reporte SNIES
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campo</TableHead>
                <TableHead>Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templateFields.map((field) => {
                const reportItem = reportData.find(item => item.field_id === field.id);
                const fieldValue = reportItem ? reportItem.field_value : "";

                return (
                  <TableRow key={field.id}>
                    <TableCell className="font-medium">{field.field_label}</TableCell>
                    <TableCell>
                      {field.field_type === "text" && (
                        <Input
                          type="text"
                          value={fieldValue || ""}
                          onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        />
                      )}
                      {field.field_type === "textarea" && (
                        <Textarea
                          value={fieldValue || ""}
                          onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        />
                      )}
                      {field.field_type === "number" && (
                        <Input
                          type="number"
                          value={fieldValue || ""}
                          onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        />
                      )}
                      {field.field_type === "select" && (
                        <Select
                          value={fieldValue || ""}
                          onValueChange={(value) => handleFieldChange(field.id, value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar" />
                          </SelectTrigger>
                          <SelectContent>
                            {field.field_options.split(",").map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onSave}>
          Cancelar
        </Button>
        <Button className="institutional-gradient text-white" onClick={handleSubmit}>
          Enviar Informe
        </Button>
      </div>
    </div>
  );
}
