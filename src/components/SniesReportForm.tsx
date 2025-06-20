
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseData, SniesReport, SniesTemplateField } from "@/hooks/useSupabaseData";
import { useAuth } from "@/hooks/useAuth";

interface SniesReportFormProps {
  report: SniesReport;
  onSave: () => void;
}

export function SniesReportForm({ report, onSave }: SniesReportFormProps) {
  const [fields, setFields] = useState<SniesTemplateField[]>([]);
  const [reportData, setReportData] = useState<any[]>([]);
  const [relationData, setRelationData] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);
  
  const { profile } = useAuth();
  const { toast } = useToast();
  const {
    fetchSniesTemplateFields,
    fetchSniesReportData,
    saveSniesReportData,
    fetchSniesDocumentTypes,
    fetchSniesCountries,
    fetchSniesMunicipalities,
    fetchSniesBiologicalSex,
    fetchSniesMaritalStatus
  } = useSupabaseData();

  useEffect(() => {
    loadFieldsAndData();
  }, [report]);

  const loadFieldsAndData = async () => {
    try {
      setIsLoading(true);
      
      // Load template fields
      const fieldsResult = await fetchSniesTemplateFields(report.template_id);
      const templateFields = fieldsResult.data || [];
      setFields(templateFields);

      // Load existing report data
      const dataResult = await fetchSniesReportData(report.id);
      const existingData = dataResult.data || [];
      
      if (existingData.length > 0) {
        setReportData(existingData.map(item => item.field_data));
      } else {
        // Initialize with empty row
        const emptyRow: any = {};
        templateFields.forEach(field => {
          emptyRow[field.field_name] = '';
        });
        setReportData([emptyRow]);
      }

      // Load relation data for dropdowns
      await loadRelationData(templateFields);
      
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos del reporte",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadRelationData = async (templateFields: SniesTemplateField[]) => {
    const relationTables = [...new Set(
      templateFields
        .filter(field => field.field_type === 'relation' && field.relation_table)
        .map(field => field.relation_table!)
    )];

    const relationDataMap: any = {};

    for (const table of relationTables) {
      try {
        let result;
        switch (table) {
          case 'snies_document_types':
            result = await fetchSniesDocumentTypes();
            break;
          case 'snies_countries':
            result = await fetchSniesCountries();
            break;
          case 'snies_municipalities':
            result = await fetchSniesMunicipalities();
            break;
          case 'snies_biological_sex':
            result = await fetchSniesBiologicalSex();
            break;
          case 'snies_marital_status':
            result = await fetchSniesMaritalStatus();
            break;
          default:
            continue;
        }
        relationDataMap[table] = result.data || [];
      } catch (error) {
        console.error(`Error loading ${table}:`, error);
        relationDataMap[table] = [];
      }
    }

    setRelationData(relationDataMap);
  };

  const addRow = () => {
    const emptyRow: any = {};
    fields.forEach(field => {
      emptyRow[field.field_name] = '';
    });
    setReportData(prev => [...prev, emptyRow]);
  };

  const removeRow = (index: number) => {
    setReportData(prev => prev.filter((_, i) => i !== index));
  };

  const updateCell = (rowIndex: number, fieldName: string, value: string) => {
    setReportData(prev => 
      prev.map((row, index) => 
        index === rowIndex 
          ? { ...row, [fieldName]: value }
          : row
      )
    );
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      
      const result = await saveSniesReportData(report.id, reportData);
      if (result.error) throw result.error;

      toast({
        title: "Éxito",
        description: "Datos del reporte guardados correctamente",
      });
      
      onSave();
    } catch (error) {
      console.error('Error saving report data:', error);
      toast({
        title: "Error",
        description: "Error al guardar los datos del reporte",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderField = (field: SniesTemplateField, rowIndex: number, value: string) => {
    const fieldId = `${field.field_name}_${rowIndex}`;
    
    if (field.field_type === 'relation' && field.relation_table) {
      const options = relationData[field.relation_table] || [];
      
      return (
        <Select
          value={value}
          onValueChange={(newValue) => updateCell(rowIndex, field.field_name, newValue)}
          disabled={report.status !== 'draft' || profile?.role !== 'Gestor'}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Seleccionar..." />
          </SelectTrigger>
          <SelectContent>
            {options.map((option: any) => (
              <SelectItem key={option.id} value={option.id}>
                {option.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    return (
      <Input
        id={fieldId}
        type={field.field_type === 'numeric' ? 'number' : 'text'}
        value={value}
        onChange={(e) => updateCell(rowIndex, field.field_name, e.target.value)}
        placeholder={field.field_label}
        disabled={report.status !== 'draft' || profile?.role !== 'Gestor'}
        className="w-full"
      />
    );
  };

  if (isLoading) {
    return <div className="text-center py-8">Cargando datos del reporte...</div>;
  }

  const canEdit = report.status === 'draft' && profile?.role === 'Gestor';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Datos del Reporte</h3>
          <p className="text-sm text-gray-600">
            {reportData.length} registro{reportData.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        <div className="flex space-x-2">
          {canEdit && (
            <>
              <Button onClick={addRow} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Agregar Fila
              </Button>
              <Button onClick={handleSave} className="institutional-gradient text-white">
                <Save className="w-4 h-4 mr-2" />
                Guardar
              </Button>
            </>
          )}
        </div>
      </div>

      {fields.length > 0 && (
        <div className="overflow-auto max-h-96">
          <Table>
            <TableHeader>
              <TableRow>
                {fields.map((field) => (
                  <TableHead key={field.id} className="min-w-32">
                    {field.field_label}
                    {field.is_required && <span className="text-red-500 ml-1">*</span>}
                  </TableHead>
                ))}
                {canEdit && <TableHead className="w-16">Acciones</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {reportData.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {fields.map((field) => (
                    <TableCell key={field.id} className="p-2">
                      {renderField(field, rowIndex, row[field.field_name] || '')}
                    </TableCell>
                  ))}
                  {canEdit && (
                    <TableCell className="p-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => removeRow(rowIndex)}
                        disabled={reportData.length === 1}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {reportData.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No hay datos en este reporte</p>
          {canEdit && (
            <Button onClick={addRow} className="mt-4">
              <Plus className="w-4 h-4 mr-2" />
              Agregar Primera Fila
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
