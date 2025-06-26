
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Minus, Save, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSniesReports } from "@/hooks/useSniesReports";
import { useSnies } from "@/hooks/useSnies";

// SearchableSelect component for better UX
const SearchableSelect = ({ 
  options, 
  value, 
  onChange, 
  placeholder, 
  disabled = false,
  displayField = 'name',
  valueField = 'id'
}: {
  options: any[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  disabled?: boolean;
  displayField?: string;
  valueField?: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredOptions = options.filter(option => 
    option[displayField]?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedOption = options.find(option => 
    String(option[valueField]) === String(value)
  );

  return (
    <div className="relative">
      <Input
        value={selectedOption ? selectedOption[displayField] : ''}
        onChange={(e) => setSearchTerm(e.target.value)}
        onFocus={() => setIsOpen(true)}
        placeholder={placeholder}
        disabled={disabled}
        readOnly
      />
      {isOpen && !disabled && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar..."
            className="m-2 w-auto"
            autoFocus
          />
          {filteredOptions.map((option) => (
            <div
              key={option[valueField]}
              className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => {
                onChange(String(option[valueField]));
                setIsOpen(false);
                setSearchTerm('');
              }}
            >
              {option[displayField]}
            </div>
          ))}
        </div>
      )}
      {isOpen && (
        <div 
          className="fixed inset-0 z-5" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

interface SniesReportFormProps {
  report: any;
  onSave: () => void;
}

export function SniesReportForm({ report, onSave }: SniesReportFormProps) {
  const [reportData, setReportData] = useState<any[]>([]);
  const [templateFields, setTemplateFields] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // SNIES data
  const [countries, setCountries] = useState<any[]>([]);
  const [municipalities, setMunicipalities] = useState<any[]>([]);
  const [documentTypes, setDocumentTypes] = useState<any[]>([]);
  const [biologicalSex, setBiologicalSex] = useState<any[]>([]);
  const [maritalStatus, setMaritalStatus] = useState<any[]>([]);
  const [educationLevels, setEducationLevels] = useState<any[]>([]);
  const [knowledgeAreas, setKnowledgeAreas] = useState<any[]>([]);
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [methodologies, setMethodologies] = useState<any[]>([]);
  const [modalities, setModalities] = useState<any[]>([]);

  const { toast } = useToast();
  const { fetchSniesReportData, upsertSniesReportData, fetchSniesTemplateFields } = useSniesReports();
  const { 
    fetchCountries, 
    fetchMunicipalities, 
    fetchDocumentTypes,
    fetchBiologicalSex,
    fetchMaritalStatus,
    fetchEducationLevels,
    fetchKnowledgeAreas,
    fetchInstitutions,
    fetchMethodologies,
    fetchModalities
  } = useSnies();

  useEffect(() => {
    loadFormData();
  }, [report]);

  const loadFormData = async () => {
    try {
      setLoading(true);
      
      // Load template fields
      const fieldsResult = await fetchSniesTemplateFields(report.template_id);
      if (fieldsResult.error) {
        console.error('Error loading template fields:', fieldsResult.error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los campos de la plantilla",
          variant: "destructive",
        });
        return;
      }
      setTemplateFields(fieldsResult.data || []);

      // Load existing report data
      const dataResult = await fetchSniesReportData(report.id);
      if (dataResult.error) {
        console.error('Error loading report data:', dataResult.error);
      } else {
        setReportData(dataResult.data || []);
      }

      // Load SNIES catalog data
      const [
        countriesResult,
        municipalitiesResult,
        documentTypesResult,
        biologicalSexResult,
        maritalStatusResult,
        educationLevelsResult,
        knowledgeAreasResult,
        institutionsResult,
        methodologiesResult,
        modalitiesResult
      ] = await Promise.all([
        fetchCountries(),
        fetchMunicipalities(),
        fetchDocumentTypes(),
        fetchBiologicalSex(),
        fetchMaritalStatus(),
        fetchEducationLevels(),
        fetchKnowledgeAreas(),
        fetchInstitutions(),
        fetchMethodologies(),
        fetchModalities()
      ]);

      setCountries(countriesResult.data || []);
      setMunicipalities(municipalitiesResult.data || []);
      setDocumentTypes(documentTypesResult.data || []);
      setBiologicalSex(biologicalSexResult.data || []);
      setMaritalStatus(maritalStatusResult.data || []);
      setEducationLevels(educationLevelsResult.data || []);
      setKnowledgeAreas(knowledgeAreasResult.data || []);
      setInstitutions(institutionsResult.data || []);
      setMethodologies(methodologiesResult.data || []);
      setModalities(modalitiesResult.data || []);

    } catch (error) {
      console.error('Error loading form data:', error);
      toast({
        title: "Error",
        description: "Error al cargar los datos del formulario",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addNewRow = () => {
    const newRow = {
      row_index: reportData.length,
      field_data: templateFields.reduce((acc, field) => {
        acc[field.field_name] = '';
        return acc;
      }, {})
    };
    setReportData([...reportData, newRow]);
  };

  const removeRow = (index: number) => {
    const newData = reportData.filter((_, i) => i !== index);
    // Reindex rows
    const reindexedData = newData.map((row, i) => ({ ...row, row_index: i }));
    setReportData(reindexedData);
  };

  const updateFieldValue = (rowIndex: number, fieldName: string, value: string) => {
    const newData = [...reportData];
    if (!newData[rowIndex]) {
      newData[rowIndex] = {
        row_index: rowIndex,
        field_data: {}
      };
    }
    newData[rowIndex].field_data = {
      ...newData[rowIndex].field_data,
      [fieldName]: value
    };
    setReportData(newData);
  };

  const getFieldOptions = (field: any) => {
    switch (field.relation_table) {
      case 'snies_countries':
        return countries;
      case 'snies_municipalities':
        return municipalities;
      case 'snies_document_types':
        return documentTypes;
      case 'snies_biological_sex':
        return biologicalSex;
      case 'snies_marital_status':
        return maritalStatus;
      case 'snies_education_levels':
        return educationLevels;
      case 'snies_knowledge_areas':
        return knowledgeAreas;
      case 'snies_institutions':
        return institutions;
      case 'snies_methodologies':
        return methodologies;
      case 'snies_modalities':
        return modalities;
      default:
        return field.field_options ? Object.entries(field.field_options).map(([key, value]) => ({
          id: key,
          name: value
        })) : [];
    }
  };

  const getFilteredMunicipalities = (countryValue: string) => {
    // Only show municipalities when Colombia (ID: 170) is selected
    if (countryValue === '170') {
      return municipalities.filter(municipality => municipality.country_id === '170');
    }
    return [];
  };

  const isMunicipalityFieldDisabled = (rowIndex: number, field: any) => {
    if (field.relation_table !== 'snies_municipalities') return false;
    
    // Find the country field value for this row
    const countryField = templateFields.find(f => f.relation_table === 'snies_countries');
    if (!countryField) return true;
    
    const countryValue = reportData[rowIndex]?.field_data?.[countryField.field_name];
    return countryValue !== '170'; // Only enable for Colombia
  };

  const renderFieldInput = (field: any, rowIndex: number, value: string) => {
    switch (field.field_type) {
      case 'select':
        const options = field.relation_table === 'snies_municipalities' 
          ? getFilteredMunicipalities(
              reportData[rowIndex]?.field_data?.[
                templateFields.find(f => f.relation_table === 'snies_countries')?.field_name
              ] || ''
            )
          : getFieldOptions(field);

        return (
          <SearchableSelect
            options={options}
            value={value}
            onChange={(newValue) => updateFieldValue(rowIndex, field.field_name, newValue)}
            placeholder={`Seleccionar ${field.field_label}`}
            disabled={isMunicipalityFieldDisabled(rowIndex, field)}
            displayField={field.relation_display_field || 'name'}
            valueField={field.relation_id_field || 'id'}
          />
        );
      case 'number':
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => updateFieldValue(rowIndex, field.field_name, e.target.value)}
          />
        );
      case 'date':
        return (
          <Input
            type="date"
            value={value}
            onChange={(e) => updateFieldValue(rowIndex, field.field_name, e.target.value)}
          />
        );
      default:
        return (
          <Input
            type="text"
            value={value}
            onChange={(e) => updateFieldValue(rowIndex, field.field_name, e.target.value)}
          />
        );
    }
  };

  const saveReportData = async () => {
    if (reportData.length === 0) {
      toast({
        title: "Error",
        description: "Debe agregar al menos una fila de datos",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      // Validate required fields
      for (let i = 0; i < reportData.length; i++) {
        const row = reportData[i];
        for (const field of templateFields) {
          if (field.is_required && !row.field_data[field.field_name]) {
            toast({
              title: "Error de validación",
              description: `El campo "${field.field_label}" es obligatorio en la fila ${i + 1}`,
              variant: "destructive",
            });
            return;
          }
        }
      }

      // Save each row
      for (const row of reportData) {
        const result = await upsertSniesReportData({
          report_id: report.id,
          row_index: row.row_index,
          field_data: row.field_data
        });

        if (result.error) {
          console.error('Error saving row:', result.error);
          toast({
            title: "Error",
            description: `Error al guardar la fila ${row.row_index + 1}`,
            variant: "destructive",
          });
          return;
        }
      }

      toast({
        title: "Éxito",
        description: "Datos guardados correctamente",
      });
      onSave();
    } catch (error) {
      console.error('Error saving report data:', error);
      toast({
        title: "Error",
        description: "Error inesperado al guardar los datos",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <p>Cargando formulario...</p>
      </div>
    );
  }

  if (templateFields.length === 0) {
    return (
      <div className="text-center py-8">
        <p>No hay campos configurados para esta plantilla.</p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          {report.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-between items-center">
          <Button onClick={addNewRow} className="institutional-gradient text-white">
            <Plus className="w-4 h-4 mr-2" />
            Agregar Fila
          </Button>
          <Button 
            onClick={saveReportData} 
            disabled={isSaving}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Guardando...' : 'Guardar Datos'}
          </Button>
        </div>

        {reportData.length > 0 && (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">#</TableHead>
                  {templateFields.map((field) => (
                    <TableHead key={field.id} className="min-w-40">
                      {field.field_label}
                      {field.is_required && <span className="text-red-500 ml-1">*</span>}
                    </TableHead>
                  ))}
                  <TableHead className="w-16">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportData.map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    <TableCell>{rowIndex + 1}</TableCell>
                    {templateFields.map((field) => (
                      <TableCell key={field.id}>
                        {renderFieldInput(
                          field, 
                          rowIndex, 
                          row.field_data?.[field.field_name] || ''
                        )}
                      </TableCell>
                    ))}
                    <TableCell>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeRow(rowIndex)}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {reportData.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No hay datos ingresados. Haz clic en "Agregar Fila" para comenzar.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
