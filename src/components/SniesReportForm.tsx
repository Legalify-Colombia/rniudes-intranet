import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Save, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { useAuth } from "@/hooks/useAuth";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";

interface SniesReportFormProps {
  report: any;
  onSave: () => void;
}

export function SniesReportForm({ report, onSave }: SniesReportFormProps) {
  const [fields, setFields] = useState<any[]>([]);
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

  const loadRelationData = async (templateFields: any[]) => {
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
    if (reportData.length === 1) {
      toast({
        title: "Advertencia",
        description: "Debe mantener al menos una fila",
        variant: "destructive",
      });
      return;
    }
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

  const SearchableSelect = ({ field, rowIndex, value }: { field: any, rowIndex: number, value: string }) => {
    const [open, setOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    
    let options = relationData[field.relation_table] || [];
    
    // Filtrar municipios solo para Colombia si es el campo de municipios
    if (field.relation_table === 'snies_municipalities') {
      const currentRow = reportData[rowIndex];
      const selectedCountry = currentRow?.country_id || currentRow?.pais_id;
      
      if (selectedCountry === '170') {
        options = relationData[field.relation_table] || [];
      } else {
        options = [];
      }
    }

    // Filtrar opciones basado en búsqueda por ID o nombre
    const filteredOptions = options.filter((option: any) => 
      option.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      option.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const selectedOption = options.find((option: any) => option.id === value);

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-8 text-xs"
            disabled={report.status !== 'draft' || profile?.role !== 'Gestor'}
          >
            {selectedOption ? `${selectedOption.id} - ${selectedOption.name}` : 
             field.relation_table === 'snies_municipalities' && options.length === 0
               ? "Seleccione Colombia primero"
               : "Seleccionar..."}
            <Search className="ml-2 h-3 w-3 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0">
          <Command>
            <CommandInput 
              placeholder={`Buscar por código o nombre...`} 
              value={searchTerm}
              onValueChange={setSearchTerm}
            />
            <CommandEmpty>No se encontraron resultados.</CommandEmpty>
            <CommandGroup className="max-h-48 overflow-auto">
              {filteredOptions.map((option: any) => (
                <CommandItem
                  key={option.id}
                  value={option.id}
                  onSelect={() => {
                    updateCell(rowIndex, field.field_name, option.id);
                    setOpen(false);
                    setSearchTerm("");
                  }}
                  className="text-xs"
                >
                  <span className="font-mono mr-2">{option.id}</span>
                  <span>{option.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    );
  };

  const renderField = (field: any, rowIndex: number, value: string) => {
    const fieldId = `${field.field_name}_${rowIndex}`;
    
    // Campo de fecha manual
    if (field.field_type === 'date') {
      return (
        <Input
          id={fieldId}
          type="text"
          value={value}
          onChange={(e) => {
            let inputValue = e.target.value.replace(/\D/g, ''); // Solo números
            if (inputValue.length >= 2) {
              inputValue = inputValue.substring(0, 2) + '/' + inputValue.substring(2);
            }
            if (inputValue.length >= 5) {
              inputValue = inputValue.substring(0, 5) + '/' + inputValue.substring(5, 9);
            }
            updateCell(rowIndex, field.field_name, inputValue);
          }}
          placeholder="DD/MM/AAAA"
          maxLength={10}
          disabled={report.status !== 'draft' || profile?.role !== 'Gestor'}
          className="w-full h-8 text-xs border-gray-300 focus:border-blue-500"
        />
      );
    }
    
    if (field.field_type === 'relation' && field.relation_table) {
      // Usar el componente de búsqueda para países y municipios
      if (field.relation_table === 'snies_countries' || field.relation_table === 'snies_municipalities') {
        return <SearchableSelect field={field} rowIndex={rowIndex} value={value} />;
      }
      
      // Para otros campos de relación, usar select normal
      let options = relationData[field.relation_table] || [];
      
      return (
        <Select
          value={value}
          onValueChange={(newValue) => updateCell(rowIndex, field.field_name, newValue)}
          disabled={report.status !== 'draft' || profile?.role !== 'Gestor'}
        >
          <SelectTrigger className="w-full h-8 text-xs">
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
        className="w-full h-8 text-xs border-gray-300 focus:border-blue-500"
      />
    );
  };

  if (isLoading) {
    return <div className="text-center py-8">Cargando datos del reporte...</div>;
  }

  const canEdit = report.status === 'draft' && profile?.role === 'Gestor';

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Datos del Reporte</h3>
          <p className="text-sm text-gray-600">
            {reportData.length} registro{reportData.length !== 1 ? 's' : ''} • 
            Estado: <span className="font-medium">{report.status === 'draft' ? 'Borrador' : 'Enviado'}</span>
          </p>
        </div>
        
        <div className="flex space-x-2">
          {canEdit && (
            <>
              <Button onClick={addRow} variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Agregar Fila
              </Button>
              <Button onClick={handleSave} className="institutional-gradient text-white" size="sm">
                <Save className="w-4 h-4 mr-2" />
                Guardar
              </Button>
            </>
          )}
        </div>
      </div>

      {fields.length > 0 && (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-auto max-h-[60vh]" style={{ maxWidth: '100%' }}>
            <Table className="w-full">
              <TableHeader>
                <TableRow className="bg-gray-100">
                  <TableHead className="w-12 text-center font-semibold border-r">#</TableHead>
                  {fields.map((field) => (
                    <TableHead 
                      key={field.id} 
                      className="min-w-40 max-w-60 font-semibold border-r text-center bg-gray-50"
                      style={{ fontSize: '12px' }}
                    >
                      <div className="flex flex-col">
                        <span>{field.field_label}</span>
                        {field.is_required && <span className="text-red-500 text-xs">*</span>}
                      </div>
                    </TableHead>
                  ))}
                  {canEdit && <TableHead className="w-16 text-center font-semibold">Acciones</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportData.map((row, rowIndex) => (
                  <TableRow 
                    key={rowIndex} 
                    className={`hover:bg-gray-50 ${rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}
                  >
                    <TableCell className="text-center font-medium border-r bg-gray-50 text-xs">
                      {rowIndex + 1}
                    </TableCell>
                    {fields.map((field) => (
                      <TableCell key={field.id} className="p-1 border-r">
                        {renderField(field, rowIndex, row[field.field_name] || '')}
                      </TableCell>
                    ))}
                    {canEdit && (
                      <TableCell className="p-1 text-center">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeRow(rowIndex)}
                          className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
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
        </div>
      )}

      {reportData.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-500 mb-4">No hay datos en este reporte</p>
          {canEdit && (
            <Button onClick={addRow} className="institutional-gradient text-white">
              <Plus className="w-4 h-4 mr-2" />
              Agregar Primera Fila
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
