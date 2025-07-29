import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useSnies } from "@/hooks/useSnies";
import { useSniesReports } from "@/hooks/useSniesReports";
import { SearchableSelect } from "./SearchableSelect";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

interface DynamicSniesReportFormProps {
  reportId?: string;
  templateId: string;
  onSave?: () => void;
}

interface TemplateField {
  id: string;
  field_name: string;
  field_label: string;
  field_type: 'text' | 'numeric' | 'date' | 'relation';
  is_required: boolean;
  relation_table?: string;
  field_order: number;
}

interface ParticipantData {
  id: string;
  [key: string]: any;
}

export function DynamicSniesReportForm({ reportId, templateId, onSave }: DynamicSniesReportFormProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [templateFields, setTemplateFields] = useState<TemplateField[]>([]);
  const [participantsData, setParticipantsData] = useState<ParticipantData[]>([]);
  const [sniesData, setSniesData] = useState({
    countries: [],
    municipalities: [],
    documentTypes: [],
    genders: [],
    maritalStatuses: [],
    educationLevels: [],
    knowledgeAreas: [],
    institutions: [],
    modalities: [],
  });
  
  const {
    fetchSniesCountries,
    fetchSniesMunicipalities,
    fetchSniesDocumentTypes,
    fetchSniesGenders,
    fetchSniesMaritalStatus,
    fetchSniesEducationLevels,
    fetchSniesKnowledgeAreas,
    fetchSniesInstitutions,
    fetchSniesModalities,
    createSniesReport,
    updateSniesReport,
    fetchSniesReportById,
    createSniesReportData,
    updateSniesReportData,
    fetchSniesReportData,
  } = useSnies();

  const {
    fetchSniesTemplateFields,
  } = useSniesReports();

  useEffect(() => {
    loadSniesData();
    loadTemplateFields();
    if (reportId) {
      loadExistingReport();
    }
  }, [reportId, templateId]);

  const loadTemplateFields = async () => {
    try {
      console.log("Loading template fields for template:", templateId);
      const result = await fetchSniesTemplateFields(templateId);
      if (result.error) {
        console.error('Error loading template fields:', result.error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los campos de la plantilla",
          variant: "destructive",
        });
      } else {
        console.log("Template fields loaded:", result.data);
        setTemplateFields(result.data || []);
      }
    } catch (error) {
      console.error('Error loading template fields:', error);
      toast({
        title: "Error",
        description: "Error al cargar los campos de la plantilla",
        variant: "destructive",
      });
    }
  };

  const loadSniesData = async () => {
    console.log("Loading SNIES configuration data...");
    try {
      const [
        countriesRes,
        municipalitiesRes,
        documentTypesRes,
        gendersRes,
        maritalStatusRes,
        educationLevelsRes,
        knowledgeAreasRes,
        institutionsRes,
        modalitiesRes,
      ] = await Promise.all([
        fetchSniesCountries(),
        fetchSniesMunicipalities(),
        fetchSniesDocumentTypes(),
        fetchSniesGenders(),
        fetchSniesMaritalStatus(),
        fetchSniesEducationLevels(),
        fetchSniesKnowledgeAreas(),
        fetchSniesInstitutions(),
        fetchSniesModalities(),
      ]);

      setSniesData({
        countries: countriesRes.data || [],
        municipalities: municipalitiesRes.data || [],
        documentTypes: documentTypesRes.data || [],
        genders: gendersRes.data || [],
        maritalStatuses: maritalStatusRes.data || [],
        educationLevels: educationLevelsRes.data || [],
        knowledgeAreas: knowledgeAreasRes.data || [],
        institutions: institutionsRes.data || [],
        modalities: modalitiesRes.data || [],
      });
    } catch (error) {
      console.error("Error loading SNIES data:", error);
      toast({
        title: "Error",
        description: "Error al cargar los datos de configuración SNIES",
        variant: "destructive",
      });
    }
  };

  const loadExistingReport = async () => {
    if (!reportId) return;
    
    try {
      const reportRes = await fetchSniesReportById(reportId);
      if (reportRes.error) throw reportRes.error;

      const dataRes = await fetchSniesReportData(reportId);
      if (dataRes.data) {
        setParticipantsData(dataRes.data);
      }
    } catch (error) {
      console.error("Error loading existing report:", error);
      toast({
        title: "Error",
        description: "Error al cargar el reporte existente",
        variant: "destructive",
      });
    }
  };

  const addNewParticipant = () => {
    const newParticipant: ParticipantData = {
      id: `temp-${Date.now()}`,
    };
    
    // Inicializar campos según la plantilla
    templateFields.forEach(field => {
      newParticipant[field.field_name] = "";
    });
    
    setParticipantsData([...participantsData, newParticipant]);
  };

  const updateParticipantData = (index: number, field: string, value: string) => {
    const updatedData = [...participantsData];
    updatedData[index] = { ...updatedData[index], [field]: value };
    
    // Si el campo es country, limpiar municipality
    if (field.includes('country')) {
      const municipalityField = field.replace('country', 'municipality');
      updatedData[index][municipalityField] = '';
    }
    
    setParticipantsData(updatedData);
  };

  const removeParticipant = (index: number) => {
    const updatedData = participantsData.filter((_, i) => i !== index);
    setParticipantsData(updatedData);
  };

  const getRelationOptions = (relationTable: string) => {
    const tableMap: { [key: string]: any[] } = {
      'snies_countries': sniesData.countries,
      'snies_municipalities': sniesData.municipalities,
      'snies_document_types': sniesData.documentTypes,
      'snies_genders': sniesData.genders,
      'snies_marital_status': sniesData.maritalStatuses,
      'snies_education_levels': sniesData.educationLevels,
      'snies_knowledge_areas': sniesData.knowledgeAreas,
      'snies_institutions': sniesData.institutions,
      'snies_modalities': sniesData.modalities,
    };
    return tableMap[relationTable] || [];
  };

  const getFilteredMunicipalities = (countryId: string) => {
    if (!countryId || !sniesData.municipalities) return [];
    return sniesData.municipalities.filter(
      (municipality: any) => municipality.country_id === countryId
    );
  };

  const renderField = (field: TemplateField, participant: ParticipantData, index: number) => {
    const value = participant[field.field_name] || "";
    
    switch (field.field_type) {
      case 'text':
        return (
          <Input
            value={value}
            onChange={(e) => updateParticipantData(index, field.field_name, e.target.value)}
            placeholder={field.field_label}
            required={field.is_required}
          />
        );
      
      case 'numeric':
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => updateParticipantData(index, field.field_name, e.target.value)}
            placeholder={field.field_label}
            required={field.is_required}
          />
        );
      
      case 'date':
        return (
          <Input
            type="date"
            value={value}
            onChange={(e) => updateParticipantData(index, field.field_name, e.target.value)}
            required={field.is_required}
          />
        );
      
      case 'relation':
        if (!field.relation_table) return null;
        
        // Caso especial para municipios que dependen del país
        if (field.relation_table === 'snies_municipalities') {
          const countryField = templateFields.find(f => f.relation_table === 'snies_countries');
          const countryValue = countryField ? participant[countryField.field_name] : '';
          return (
            <SearchableSelect
              options={getFilteredMunicipalities(countryValue)}
              value={value}
              onValueChange={(newValue) => updateParticipantData(index, field.field_name, newValue)}
              placeholder={field.field_label}
              searchPlaceholder={`Buscar ${field.field_label.toLowerCase()}...`}
              emptyMessage={`No se encontraron ${field.field_label.toLowerCase()}`}
              disabled={!countryValue}
            />
          );
        }
        
        return (
          <SearchableSelect
            options={getRelationOptions(field.relation_table)}
            value={value}
            onValueChange={(newValue) => updateParticipantData(index, field.field_name, newValue)}
            placeholder={field.field_label}
            searchPlaceholder={`Buscar ${field.field_label.toLowerCase()}...`}
            emptyMessage={`No se encontraron ${field.field_label.toLowerCase()}`}
          />
        );
      
      default:
        return (
          <Input
            value={value}
            onChange={(e) => updateParticipantData(index, field.field_name, e.target.value)}
            placeholder={field.field_label}
            required={field.is_required}
          />
        );
    }
  };

  const handleSave = async () => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "Usuario no autenticado",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      let currentReportId = reportId;
      
      if (!currentReportId) {
        const reportRes = await createSniesReport({
          title: `Reporte SNIES - ${new Date().toLocaleDateString()}`,
          template_id: templateId,
          manager_id: user.id,
          status: 'draft',
        });
        if (reportRes.error) throw reportRes.error;
        currentReportId = reportRes.data.id;
      }

      // Guardar datos de participantes
      for (const participant of participantsData) {
        if (participant.id.startsWith('temp-')) {
          await createSniesReportData({
            snies_report_id: currentReportId,
            data: participant,
          });
        } else {
          await updateSniesReportData(participant.id, { data: participant });
        }
      }

      toast({
        title: "Éxito",
        description: "Reporte guardado correctamente",
      });

      if (onSave) onSave();
    } catch (error) {
      console.error("Error saving report:", error);
      toast({
        title: "Error",
        description: "Error al guardar el reporte",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (templateFields.length === 0) {
    return (
      <div className="p-4">
        <p>Cargando plantilla del reporte...</p>
      </div>
    );
  }

  // Ordenar campos por field_order
  const sortedFields = [...templateFields].sort((a, b) => a.field_order - b.field_order);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Formulario SNIES - Plantilla Dinámica</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button onClick={addNewParticipant} className="mb-4">
              Agregar Participante
            </Button>

            {participantsData.length > 0 && (
              <div className="border rounded-lg overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {sortedFields.map((field) => (
                        <TableHead key={field.id}>
                          {field.field_label}
                          {field.is_required && <span className="text-red-500 ml-1">*</span>}
                        </TableHead>
                      ))}
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {participantsData.map((participant, index) => (
                      <TableRow key={participant.id}>
                        {sortedFields.map((field) => (
                          <TableCell key={field.id} className="min-w-48">
                            {renderField(field, participant, index)}
                          </TableCell>
                        ))}
                        <TableCell>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removeParticipant(index)}
                          >
                            Eliminar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            <div className="flex gap-2 justify-end">
              <Button onClick={handleSave} disabled={loading}>
                {loading ? "Guardando..." : "Guardar Reporte"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}