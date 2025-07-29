
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { SearchableSelect } from "./SearchableSelect";
import { useToast } from "@/hooks/use-toast";

interface SniesReportFormProps {
  reportId?: string;
  templateId: string;
  onSave?: () => void;
}

interface StudentData {
  id: string;
  document_number: string;
  enrollment_date: string;
  first_name: string;
  second_name: string;
  first_surname: string;
  second_surname: string;
  birth_date: string;
  birth_country: string;
  birth_municipality: string;
  document_type: string;
  gender: string;
  marital_status: string;
  education_level: string;
  knowledge_area: string;
  institution: string;
  modality: string;
}

export default function SniesReportForm({ reportId, templateId, onSave }: SniesReportFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [studentsData, setStudentsData] = useState<StudentData[]>([]);
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
  } = useSupabaseData();

  useEffect(() => {
    loadSniesData();
    if (reportId) {
      loadExistingReport();
    }
  }, [reportId, templateId]);

  const loadSniesData = async () => {
    console.log("Loading SNIES data...");
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

      console.log("SNIES data loaded:", {
        countries: countriesRes.data?.length || 0,
        municipalities: municipalitiesRes.data?.length || 0,
        documentTypes: documentTypesRes.data?.length || 0,
      });

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
        setStudentsData(dataRes.data);
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

  const addNewStudent = () => {
    const newStudent: StudentData = {
      id: `temp-${Date.now()}`,
      document_number: "",
      enrollment_date: "",
      first_name: "",
      second_name: "",
      first_surname: "",
      second_surname: "",
      birth_date: "",
      birth_country: "",
      birth_municipality: "",
      document_type: "",
      gender: "",
      marital_status: "",
      education_level: "",
      knowledge_area: "",
      institution: "",
      modality: "",
    };
    setStudentsData([...studentsData, newStudent]);
  };

  const updateStudentData = (index: number, field: keyof StudentData, value: string) => {
    const updatedData = [...studentsData];
    updatedData[index] = { ...updatedData[index], [field]: value };
    
    // If country changes, clear municipality
    if (field === 'birth_country') {
      updatedData[index].birth_municipality = '';
    }
    
    setStudentsData(updatedData);
  };

  const removeStudent = (index: number) => {
    const updatedData = studentsData.filter((_, i) => i !== index);
    setStudentsData(updatedData);
  };

  const getFilteredMunicipalities = (countryId: string) => {
    if (!countryId || !sniesData.municipalities) return [];
    
    // For Colombia, filter by departments that belong to Colombia
    if (countryId === 'CO') {
      return sniesData.municipalities.filter(
        (municipality: any) => municipality.country_id === 'CO'
      );
    }
    
    return [];
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      let currentReportId = reportId;
      
      if (!currentReportId) {
        const reportRes = await createSniesReport({
          title: `Reporte SNIES - ${new Date().toLocaleDateString()}`,
          template_id: templateId,
          status: 'draft',
        });
        if (reportRes.error) throw reportRes.error;
        currentReportId = reportRes.data.id;
      }

      // Save student data
      for (const student of studentsData) {
        if (student.id.startsWith('temp-')) {
          await createSniesReportData({
            snies_report_id: currentReportId,
            data: student,
          });
        } else {
          await updateSniesReportData(student.id, { data: student });
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

  if (!sniesData.countries || sniesData.countries.length === 0) {
    return (
      <div className="p-4">
        <p>Cargando datos del reporte...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Formulario SNIES - Participantes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button onClick={addNewStudent} className="mb-4">
              Agregar Participante
            </Button>

            {studentsData.length > 0 && (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>N° Documento</TableHead>
                      <TableHead>Fecha Inscripción</TableHead>
                      <TableHead>Primer Nombre</TableHead>
                      <TableHead>Segundo Nombre</TableHead>
                      <TableHead>Primer Apellido</TableHead>
                      <TableHead>Segundo Apellido</TableHead>
                      <TableHead>Fecha Nacimiento</TableHead>
                      <TableHead>País Nacimiento</TableHead>
                      <TableHead>Municipio Nacimiento</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {studentsData.map((student, index) => (
                      <TableRow key={student.id}>
                        <TableCell>
                          <Input
                            value={student.document_number}
                            onChange={(e) => updateStudentData(index, 'document_number', e.target.value)}
                            placeholder="N° Documento"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="date"
                            value={student.enrollment_date}
                            onChange={(e) => updateStudentData(index, 'enrollment_date', e.target.value)}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={student.first_name}
                            onChange={(e) => updateStudentData(index, 'first_name', e.target.value)}
                            placeholder="Primer Nombre"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={student.second_name}
                            onChange={(e) => updateStudentData(index, 'second_name', e.target.value)}
                            placeholder="Segundo Nombre"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={student.first_surname}
                            onChange={(e) => updateStudentData(index, 'first_surname', e.target.value)}
                            placeholder="Primer Apellido"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={student.second_surname}
                            onChange={(e) => updateStudentData(index, 'second_surname', e.target.value)}
                            placeholder="Segundo Apellido"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="date"
                            value={student.birth_date}
                            onChange={(e) => updateStudentData(index, 'birth_date', e.target.value)}
                          />
                        </TableCell>
                        <TableCell>
                          <SearchableSelect
                            options={sniesData.countries}
                            value={student.birth_country}
                            onValueChange={(value) => updateStudentData(index, 'birth_country', value)}
                            placeholder="Seleccionar país"
                            searchPlaceholder="Buscar país..."
                            emptyMessage="No se encontraron países"
                          />
                        </TableCell>
                        <TableCell>
                          <SearchableSelect
                            options={getFilteredMunicipalities(student.birth_country)}
                            value={student.birth_municipality}
                            onValueChange={(value) => updateStudentData(index, 'birth_municipality', value)}
                            placeholder="Seleccionar municipio"
                            searchPlaceholder="Buscar municipio..."
                            emptyMessage="No se encontraron municipios"
                            disabled={!student.birth_country}
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removeStudent(index)}
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
