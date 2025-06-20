
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { useToast } from "@/hooks/use-toast";
import { Plus, Upload, Download, CheckCircle, XCircle } from "lucide-react";

export function SniesConfigurationManagement() {
  const {
    fetchSniesCountries,
    fetchSniesMunicipalities,
    fetchSniesAcademicLevels,
    fetchSniesProgramTypes,
    fetchSniesRecognitionTypes,
    fetchSniesDepartments,
    createSniesCountry,
    createSniesMunicipality,
    createSniesAcademicLevel,
    createSniesProgramType,
    createSniesRecognitionType,
    createSniesDepartment,
    bulkCreateSniesCountries,
    bulkCreateSniesMunicipalities,
    bulkCreateSniesAcademicLevels,
    bulkCreateSniesProgramTypes,
    bulkCreateSniesRecognitionTypes,
    bulkCreateSniesDepartments,
    parseCSV
  } = useSupabaseData();
  
  const { toast } = useToast();

  // Estados para los datos
  const [countries, setCountries] = useState<any[]>([]);
  const [municipalities, setMunicipalities] = useState<any[]>([]);
  const [academicLevels, setAcademicLevels] = useState<any[]>([]);
  const [programTypes, setProgramTypes] = useState<any[]>([]);
  const [recognitionTypes, setRecognitionTypes] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);

  // Estados para formularios individuales
  const [newItem, setNewItem] = useState({ id: '', name: '', description: '', country_id: '' });
  
  // Estados para importación CSV
  const [csvData, setCsvData] = useState('');
  const [csvFile, setCsvFile] = useState<File | null>(null);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [
        countriesResult,
        municipalitiesResult,
        academicLevelsResult,
        programTypesResult,
        recognitionTypesResult,
        departmentsResult
      ] = await Promise.all([
        fetchSniesCountries(),
        fetchSniesMunicipalities(),
        fetchSniesAcademicLevels(),
        fetchSniesProgramTypes(),
        fetchSniesRecognitionTypes(),
        fetchSniesDepartments()
      ]);

      setCountries(countriesResult.data || []);
      setMunicipalities(municipalitiesResult.data || []);
      setAcademicLevels(academicLevelsResult.data || []);
      setProgramTypes(programTypesResult.data || []);
      setRecognitionTypes(recognitionTypesResult.data || []);
      setDepartments(departmentsResult.data || []);
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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/csv') {
      setCsvFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setCsvData(text);
      };
      reader.readAsText(file);
    } else {
      toast({
        title: "Error",
        description: "Por favor selecciona un archivo CSV válido",
        variant: "destructive",
      });
    }
  };

  const handleCreateItem = async (type: string) => {
    if (!newItem.id || !newItem.name) {
      toast({
        title: "Error",
        description: "ID y nombre son obligatorios",
        variant: "destructive",
      });
      return;
    }

    try {
      const itemData = {
        id: newItem.id,
        name: newItem.name,
        description: newItem.description || null,
        ...(type === 'departments' && { country_id: newItem.country_id }),
        is_active: true
      };

      let result;
      switch (type) {
        case 'countries':
          result = await createSniesCountry(itemData);
          break;
        case 'municipalities':
          result = await createSniesMunicipality(itemData);
          break;
        case 'academic_levels':
          result = await createSniesAcademicLevel(itemData);
          break;
        case 'program_types':
          result = await createSniesProgramType(itemData);
          break;
        case 'recognition_types':
          result = await createSniesRecognitionType(itemData);
          break;
        case 'departments':
          result = await createSniesDepartment(itemData);
          break;
        default:
          throw new Error('Tipo no válido');
      }

      if (result.error) throw result.error;

      toast({
        title: "Éxito",
        description: "Elemento creado correctamente",
      });

      setNewItem({ id: '', name: '', description: '', country_id: '' });
      await loadAllData();
    } catch (error) {
      console.error("Error creating item:", error);
      toast({
        title: "Error",
        description: "No se pudo crear el elemento",
        variant: "destructive",
      });
    }
  };

  const handleBulkCreate = async (type: string) => {
    if (!csvData) {
      toast({
        title: "Error",
        description: "No hay datos CSV para importar",
        variant: "destructive",
      });
      return;
    }

    try {
      const parsedData = parseCSV(csvData);
      if (!parsedData.length) {
        throw new Error("No se pudieron parsear los datos CSV");
      }

      let result;
      switch (type) {
        case 'countries':
          result = await bulkCreateSniesCountries(parsedData);
          break;
        case 'municipalities':
          result = await bulkCreateSniesMunicipalities(parsedData);
          break;
        case 'academic_levels':
          result = await bulkCreateSniesAcademicLevels(parsedData);
          break;
        case 'program_types':
          result = await bulkCreateSniesProgramTypes(parsedData);
          break;
        case 'recognition_types':
          result = await bulkCreateSniesRecognitionTypes(parsedData);
          break;
        case 'departments':
          result = await bulkCreateSniesDepartments(parsedData);
          break;
        default:
          throw new Error('Tipo no válido');
      }

      if (result.error) throw result.error;

      toast({
        title: "Éxito",
        description: `${parsedData.length} elementos importados correctamente`,
      });

      setCsvData('');
      setCsvFile(null);
      await loadAllData();
    } catch (error) {
      console.error("Error bulk creating:", error);
      toast({
        title: "Error",
        description: "No se pudieron importar los elementos",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <CheckCircle className="w-4 h-4 text-green-500" />
    ) : (
      <XCircle className="w-4 h-4 text-red-500" />
    );
  };

  const downloadCSVTemplate = (type: string) => {
    let headers = '';
    switch (type) {
      case 'countries':
        headers = 'id,name,description,alpha_2,alpha_3';
        break;
      case 'municipalities':
        headers = 'id,name,description,country_id';
        break;
      case 'departments':
        headers = 'id,name,description,country_id';
        break;
      default:
        headers = 'id,name,description';
    }

    const csvContent = `${headers}\n`;
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `template_${type}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return <div className="flex justify-center p-8">Cargando configuración SNIES...</div>;
  }

  const renderConfigSection = (title: string, data: any[], type: string) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {title}
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => downloadCSVTemplate(type)}>
              <Download className="w-4 h-4 mr-2" />
              Plantilla CSV
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Formulario individual */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg">
            <div>
              <Label htmlFor={`${type}_id`}>ID</Label>
              <Input
                id={`${type}_id`}
                value={newItem.id}
                onChange={(e) => setNewItem(prev => ({ ...prev, id: e.target.value }))}
                placeholder="ID único"
              />
            </div>
            <div>
              <Label htmlFor={`${type}_name`}>Nombre</Label>
              <Input
                id={`${type}_name`}
                value={newItem.name}
                onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nombre"
              />
            </div>
            <div>
              <Label htmlFor={`${type}_description`}>Descripción</Label>
              <Input
                id={`${type}_description`}
                value={newItem.description}
                onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descripción (opcional)"
              />
            </div>
            {type === 'departments' && (
              <div>
                <Label htmlFor={`${type}_country`}>País</Label>
                <select
                  id={`${type}_country`}
                  value={newItem.country_id}
                  onChange={(e) => setNewItem(prev => ({ ...prev, country_id: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Seleccionar país</option>
                  {countries.map(country => (
                    <option key={country.id} value={country.id}>{country.name}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="flex items-end">
              <Button onClick={() => handleCreateItem(type)} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Crear
              </Button>
            </div>
          </div>

          {/* Importación CSV */}
          <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
            <h4 className="font-medium">Importación Masiva (CSV)</h4>
            <div>
              <Label htmlFor={`${type}_csv`}>Archivo CSV</Label>
              <Input
                id={`${type}_csv`}
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
              />
            </div>
            <Button onClick={() => handleBulkCreate(type)} disabled={!csvData}>
              <Upload className="w-4 h-4 mr-2" />
              Importar CSV
            </Button>
          </div>

          {/* Lista de elementos */}
          <div>
            <h4 className="font-medium mb-3">Lista de {title}</h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Descripción</TableHead>
                  {type === 'departments' && <TableHead>País</TableHead>}
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono text-sm">{item.id}</TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.description || '-'}</TableCell>
                    {type === 'departments' && (
                      <TableCell>{item.country?.name || '-'}</TableCell>
                    )}
                    <TableCell>{getStatusBadge(item.is_active)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <Tabs defaultValue="countries" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="countries">Países</TabsTrigger>
          <TabsTrigger value="departments">Departamentos</TabsTrigger>
          <TabsTrigger value="municipalities">Municipios</TabsTrigger>
          <TabsTrigger value="academic_levels">Niveles Académicos</TabsTrigger>
          <TabsTrigger value="program_types">Tipos de Programa</TabsTrigger>
          <TabsTrigger value="recognition_types">Tipos de Reconocimiento</TabsTrigger>
        </TabsList>

        <TabsContent value="countries">
          {renderConfigSection("Países", countries, "countries")}
        </TabsContent>

        <TabsContent value="departments">
          {renderConfigSection("Departamentos", departments, "departments")}
        </TabsContent>

        <TabsContent value="municipalities">
          {renderConfigSection("Municipios", municipalities, "municipalities")}
        </TabsContent>

        <TabsContent value="academic_levels">
          {renderConfigSection("Niveles Académicos", academicLevels, "academic_levels")}
        </TabsContent>

        <TabsContent value="program_types">
          {renderConfigSection("Tipos de Programa", programTypes, "program_types")}
        </TabsContent>

        <TabsContent value="recognition_types">
          {renderConfigSection("Tipos de Reconocimiento", recognitionTypes, "recognition_types")}
        </TabsContent>
      </Tabs>
    </div>
  );
}
