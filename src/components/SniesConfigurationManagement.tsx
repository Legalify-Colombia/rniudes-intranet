
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Download, Plus, Edit, Trash2, Database } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseData } from "@/hooks/useSupabaseData";

const SNIES_TABLES = {
  countries: {
    name: 'Países',
    fetchFunction: 'fetchSniesCountries',
    createFunction: 'createSniesCountry',
    bulkCreateFunction: 'bulkCreateSniesCountries',
    fields: [
      { key: 'id', label: 'ID', required: true },
      { key: 'name', label: 'Nombre', required: true },
      { key: 'alpha_3', label: 'Código Alpha-3', required: false },
      { key: 'alpha_2', label: 'Código Alpha-2', required: false }
    ],
    csvExample: "ID_PAIS\tDESC_PAIS\tALFA-3\tALFA-2\n535\tBONAIRE, SAN EUSTAQUIO Y SABA\tBES\tBQ"
  },
  municipalities: {
    name: 'Municipios',
    fetchFunction: 'fetchSniesMunicipalities',
    createFunction: 'createSniesMunicipality',
    bulkCreateFunction: 'bulkCreateSniesMunicipalities',
    fields: [
      { key: 'id', label: 'ID', required: true },
      { key: 'name', label: 'Nombre', required: true },
      { key: 'country_id', label: 'ID País', required: false },
      { key: 'department_code', label: 'Código Departamento', required: false }
    ],
    csvExample: "ID_MUNICIPIO\tDESC_MUNICIPIO\tID_PAIS\tCOD_DEPTO\n001\tBOGOTÁ\t170\t11"
  },
  education_levels: {
    name: 'Niveles de Formación',
    fetchFunction: 'fetchSniesEducationLevels',
    createFunction: 'createSniesEducationLevel',
    bulkCreateFunction: 'bulkCreateSniesEducationLevels',
    fields: [
      { key: 'id', label: 'ID', required: true },
      { key: 'name', label: 'Nombre', required: true },
      { key: 'description', label: 'Descripción', required: false }
    ],
    csvExample: "ID\tNOMBRE\tDESCRIPCION\nTC\tTécnico Profesional\tTécnico Profesional"
  },
  modalities: {
    name: 'Modalidades',
    fetchFunction: 'fetchSniesModalities',
    createFunction: 'createSniesModality',
    bulkCreateFunction: 'bulkCreateSniesModalities',
    fields: [
      { key: 'id', label: 'ID', required: true },
      { key: 'name', label: 'Nombre', required: true },
      { key: 'description', label: 'Descripción', required: false }
    ],
    csvExample: "ID\tNOMBRE\tDESCRIPCION\nPR\tPresencial\tPresencial"
  },
  methodologies: {
    name: 'Metodologías',
    fetchFunction: 'fetchSniesMethodologies',
    createFunction: 'createSniesMethodology',
    bulkCreateFunction: 'bulkCreateSniesMethodologies',
    fields: [
      { key: 'id', label: 'ID', required: true },
      { key: 'name', label: 'Nombre', required: true },
      { key: 'description', label: 'Descripción', required: false }
    ],
    csvExample: "ID\tNOMBRE\tDESCRIPCION\nPR\tPropia\tPropia"
  },
  knowledge_areas: {
    name: 'Áreas de Conocimiento',
    fetchFunction: 'fetchSniesKnowledgeAreas',
    createFunction: 'createSniesKnowledgeArea',
    bulkCreateFunction: 'bulkCreateSniesKnowledgeAreas',
    fields: [
      { key: 'id', label: 'ID', required: true },
      { key: 'name', label: 'Nombre', required: true },
      { key: 'description', label: 'Descripción', required: false },
      { key: 'parent_area_id', label: 'ID Área Padre', required: false }
    ],
    csvExample: "ID\tNOMBRE\tDESCRIPCION\tPARENT_AREA_ID\n01\tAGRONOMÍA, VETERINARIA Y AFINES\tAgronomía, Veterinaria y afines\t"
  },
  institutions: {
    name: 'Instituciones',
    fetchFunction: 'fetchSniesInstitutions',
    createFunction: 'createSniesInstitution',
    bulkCreateFunction: 'bulkCreateSniesInstitutions',
    fields: [
      { key: 'id', label: 'ID', required: true },
      { key: 'name', label: 'Nombre', required: true },
      { key: 'code', label: 'Código', required: false },
      { key: 'address', label: 'Dirección', required: false },
      { key: 'municipality_id', label: 'ID Municipio', required: false }
    ],
    csvExample: "ID\tNOMBRE\tCODIGO\tDIRECCION\tID_MUNICIPIO\n001\tUniversidad\t001\tCalle 123\t001"
  }
};

export function SniesConfigurationManagement() {
  const [tableData, setTableData] = useState<Record<string, any[]>>({});
  const [documentTypes, setDocumentTypes] = useState<any[]>([]);
  const [biologicalSex, setBiologicalSex] = useState<any[]>([]);
  const [maritalStatus, setMaritalStatus] = useState<any[]>([]);
  
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<string>('countries');
  const [csvData, setCsvData] = useState('');
  const [isManualEntryOpen, setIsManualEntryOpen] = useState(false);
  const [manualEntryTable, setManualEntryTable] = useState<string>('countries');
  const [formData, setFormData] = useState<Record<string, string>>({});
  
  const { toast } = useToast();
  const supabaseData = useSupabaseData();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const promises = [];
      
      // Cargar todas las tablas SNIES
      for (const [key, config] of Object.entries(SNIES_TABLES)) {
        const fetchFunction = (supabaseData as any)[config.fetchFunction];
        if (fetchFunction) {
          promises.push(
            fetchFunction().then((result: any) => ({ key, data: result.data || [] }))
          );
        }
      }
      
      // Cargar tablas adicionales
      promises.push(
        supabaseData.fetchSniesDocumentTypes().then((result: any) => ({ key: 'documents', data: result.data || [] })),
        supabaseData.fetchSniesBiologicalSex().then((result: any) => ({ key: 'biological_sex', data: result.data || [] })),
        supabaseData.fetchSniesMaritalStatus().then((result: any) => ({ key: 'marital_status', data: result.data || [] }))
      );

      const results = await Promise.all(promises);
      
      const newTableData: Record<string, any[]> = {};
      results.forEach(result => {
        if (result.key === 'documents') {
          setDocumentTypes(result.data);
        } else if (result.key === 'biological_sex') {
          setBiologicalSex(result.data);
        } else if (result.key === 'marital_status') {
          setMaritalStatus(result.data);
        } else {
          newTableData[result.key] = result.data;
        }
      });
      
      setTableData(newTableData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos de configuración",
        variant: "destructive",
      });
    }
  };

  const handleCsvUpload = async () => {
    if (!csvData.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa los datos CSV",
        variant: "destructive",
      });
      return;
    }

    try {
      const lines = csvData.trim().split('\n');
      const headers = lines[0].split('\t');
      const data = lines.slice(1).map(line => {
        const values = line.split('\t');
        const obj: any = {};
        headers.forEach((header, index) => {
          const cleanHeader = header.trim();
          const value = values[index]?.trim() || '';
          
          // Mapear headers comunes a nombres de campos
          const fieldMap: Record<string, string> = {
            'ID_PAIS': 'id',
            'DESC_PAIS': 'name',
            'ALFA-3': 'alpha_3',
            'ALFA-2': 'alpha_2',
            'ID_MUNICIPIO': 'id',
            'DESC_MUNICIPIO': 'name',
            'COD_DEPTO': 'department_code',
            'ID': 'id',
            'NOMBRE': 'name',
            'DESCRIPCION': 'description',
            'PARENT_AREA_ID': 'parent_area_id',
            'CODIGO': 'code',
            'DIRECCION': 'address',
            'ID_MUNICIPIO': 'municipality_id'
          };
          
          const fieldName = fieldMap[cleanHeader] || cleanHeader.toLowerCase();
          obj[fieldName] = value;
        });
        return obj;
      });

      const config = SNIES_TABLES[selectedTable as keyof typeof SNIES_TABLES];
      if (!config) {
        throw new Error('Tabla no encontrada');
      }

      const bulkCreateFunction = (supabaseData as any)[config.bulkCreateFunction];
      if (!bulkCreateFunction) {
        throw new Error('Función de creación masiva no encontrada');
      }

      const result = await bulkCreateFunction(data);
      if (result.error) throw result.error;

      toast({
        title: "Éxito",
        description: `Se importaron ${data.length} registros correctamente`,
      });

      setCsvData('');
      setIsUploadDialogOpen(false);
      loadData();
    } catch (error) {
      console.error('Error uploading data:', error);
      toast({
        title: "Error",
        description: "Error al importar los datos: " + (error as Error).message,
        variant: "destructive",
      });
    }
  };

  const handleManualEntry = async () => {
    try {
      const config = SNIES_TABLES[manualEntryTable as keyof typeof SNIES_TABLES];
      if (!config) {
        throw new Error('Tabla no encontrada');
      }

      const requiredFields = config.fields.filter(field => field.required);
      for (const field of requiredFields) {
        if (!formData[field.key]) {
          toast({
            title: "Error",
            description: `${field.label} es requerido`,
            variant: "destructive",
          });
          return;
        }
      }

      const createFunction = (supabaseData as any)[config.createFunction];
      if (!createFunction) {
        throw new Error('Función de creación no encontrada');
      }

      const result = await createFunction(formData);
      if (result.error) throw result.error;

      toast({
        title: "Éxito",
        description: "Registro creado correctamente",
      });

      setFormData({});
      setIsManualEntryOpen(false);
      loadData();
    } catch (error) {
      console.error('Error creating entry:', error);
      toast({
        title: "Error",
        description: "Error al crear el registro: " + (error as Error).message,
        variant: "destructive",
      });
    }
  };

  const renderTableData = (tableName: string, data: any[], fields: any[]) => (
    <Table>
      <TableHeader>
        <TableRow>
          {fields.map(field => (
            <TableHead key={field.key}>{field.label}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item) => (
          <TableRow key={item.id}>
            {fields.map(field => (
              <TableCell key={field.key}>{item[field.key] || '-'}</TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Configuración de Datos SNIES
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="countries" className="space-y-4">
            <TabsList className="grid grid-cols-4 lg:grid-cols-8">
              {Object.entries(SNIES_TABLES).map(([key, config]) => (
                <TabsTrigger key={key} value={key} className="text-xs">
                  {config.name}
                </TabsTrigger>
              ))}
              <TabsTrigger value="documents" className="text-xs">Documentos</TabsTrigger>
              <TabsTrigger value="biological_sex" className="text-xs">Sexo</TabsTrigger>
              <TabsTrigger value="marital_status" className="text-xs">Estado Civil</TabsTrigger>
            </TabsList>

            {Object.entries(SNIES_TABLES).map(([key, config]) => (
              <TabsContent key={key} value={key}>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Dialog open={isUploadDialogOpen && selectedTable === key} onOpenChange={setIsUploadDialogOpen}>
                      <DialogTrigger asChild>
                        <Button 
                          onClick={() => {
                            setSelectedTable(key);
                            setIsUploadDialogOpen(true);
                          }}
                          className="institutional-gradient text-white"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Importar {config.name}
                        </Button>
                      </DialogTrigger>
                    </Dialog>

                    <Dialog open={isManualEntryOpen && manualEntryTable === key} onOpenChange={setIsManualEntryOpen}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline"
                          onClick={() => {
                            setManualEntryTable(key);
                            setIsManualEntryOpen(true);
                            setFormData({});
                          }}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Agregar {config.name.slice(0, -1)}
                        </Button>
                      </DialogTrigger>
                    </Dialog>
                  </div>

                  {renderTableData(key, tableData[key] || [], config.fields)}
                </div>
              </TabsContent>
            ))}

            <TabsContent value="documents">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Descripción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documentTypes.map((docType) => (
                    <TableRow key={docType.id}>
                      <TableCell>{docType.id}</TableCell>
                      <TableCell>{docType.name}</TableCell>
                      <TableCell>{docType.description}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="biological_sex">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Nombre</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {biologicalSex.map((sex) => (
                    <TableRow key={sex.id}>
                      <TableCell>{sex.id}</TableCell>
                      <TableCell>{sex.name}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="marital_status">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Nombre</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {maritalStatus.map((status) => (
                    <TableRow key={status.id}>
                      <TableCell>{status.id}</TableCell>
                      <TableCell>{status.name}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Upload Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Importar {SNIES_TABLES[selectedTable as keyof typeof SNIES_TABLES]?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Datos CSV (separados por tabulaciones)</Label>
              <Textarea
                value={csvData}
                onChange={(e) => setCsvData(e.target.value)}
                placeholder={SNIES_TABLES[selectedTable as keyof typeof SNIES_TABLES]?.csvExample}
                rows={10}
                className="font-mono text-sm"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCsvUpload} className="institutional-gradient text-white">
                Importar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Manual Entry Dialog */}
      <Dialog open={isManualEntryOpen} onOpenChange={setIsManualEntryOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Agregar {SNIES_TABLES[manualEntryTable as keyof typeof SNIES_TABLES]?.name.slice(0, -1)}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {SNIES_TABLES[manualEntryTable as keyof typeof SNIES_TABLES]?.fields.map(field => (
              <div key={field.key}>
                <Label htmlFor={field.key}>
                  {field.label} {field.required && '*'}
                </Label>
                <Input
                  id={field.key}
                  value={formData[field.key] || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
                  placeholder={field.label}
                  required={field.required}
                />
              </div>
            ))}
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsManualEntryOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleManualEntry} className="institutional-gradient text-white">
                Crear
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
