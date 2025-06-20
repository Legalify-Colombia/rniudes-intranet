
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { useToast } from "@/hooks/use-toast";
import { Plus, Upload, Download, CheckCircle, XCircle } from "lucide-react";
import { PaginatedTable } from "./PaginatedTable";

export function SniesConfigurationManagement() {
  const {
    fetchSniesCountries,
    fetchSniesMunicipalities,
    fetchSniesDocumentTypes,
    fetchSniesBiologicalSex,
    fetchSniesMaritalStatus,
    createSniesCountry,
    createSniesMunicipality,
    bulkCreateSniesCountries,
    bulkCreateSniesMunicipalities,
  } = useSupabaseData();
  
  const { toast } = useToast();

  // Estados para los datos
  const [countries, setCountries] = useState<any[]>([]);
  const [municipalities, setMunicipalities] = useState<any[]>([]);
  const [documentTypes, setDocumentTypes] = useState<any[]>([]);
  const [biologicalSex, setBiologicalSex] = useState<any[]>([]);
  const [maritalStatus, setMaritalStatus] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);

  // Estados para formularios individuales
  const [newItem, setNewItem] = useState({ id: '', name: '', description: '', department_id: '' });
  
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
        documentTypesResult,
        biologicalSexResult,
        maritalStatusResult
      ] = await Promise.all([
        fetchSniesCountries(),
        fetchSniesMunicipalities(),
        fetchSniesDocumentTypes(),
        fetchSniesBiologicalSex(),
        fetchSniesMaritalStatus()
      ]);

      setCountries(countriesResult.data || []);
      setMunicipalities(municipalitiesResult.data || []);
      setDocumentTypes(documentTypesResult.data || []);
      setBiologicalSex(biologicalSexResult.data || []);
      setMaritalStatus(maritalStatusResult.data || []);
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

  // Función mejorada para parsear CSV con mapeo de columnas
  const parseCSVWithMapping = (csvText: string, type: string): any[] => {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) return [];
    
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const result = [];
    
    // Mapeo de columnas según el tipo
    const columnMappings: { [key: string]: { [key: string]: string } } = {
      countries: {
        'ID_PAIS': 'id',
        'DESC_PAIS': 'name',
        'ALFA-3': 'alpha_3',
        'ALFA-2': 'alpha_2',
        'id': 'id',
        'name': 'name',
        'description': 'description',
        'alpha_3': 'alpha_3',
        'alpha_2': 'alpha_2'
      },
      municipalities: {
        'ID_MUNICIPIO': 'id',
        'ID_DEPARTAMENTO': 'department_id',
        'DESC_MUNICIPIO': 'name',
        'id': 'id',
        'department_id': 'department_id',
        'name': 'name'
      }
    };

    const mapping = columnMappings[type] || {};
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      if (values.length === headers.length) {
        const row: any = {};
        headers.forEach((header, index) => {
          const mappedColumn = mapping[header] || header.toLowerCase();
          row[mappedColumn] = values[index];
        });
        // Agregar campos por defecto
        row.is_active = true;
        // Para municipios, solo asignar Colombia como país por defecto
        if (type === 'municipalities') {
          row.country_id = '170'; // ID de Colombia
        }
        result.push(row);
      }
    }
    
    return result;
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
      const itemData: any = {
        id: newItem.id,
        name: newItem.name,
        is_active: true
      };

      // Para países, agregar description si existe
      if (type === 'countries' && newItem.description) {
        itemData.description = newItem.description;
      }

      // Para municipios, agregar department_id y country_id por defecto (Colombia)
      if (type === 'municipalities') {
        if (!newItem.department_id) {
          toast({
            title: "Error",
            description: "ID del departamento es obligatorio para municipios",
            variant: "destructive",
          });
          return;
        }
        itemData.department_id = newItem.department_id;
        itemData.country_id = '170'; // Colombia por defecto
      }

      let result;
      switch (type) {
        case 'countries':
          result = await createSniesCountry(itemData);
          break;
        case 'municipalities':
          result = await createSniesMunicipality(itemData);
          break;
        default:
          throw new Error('Tipo no válido');
      }

      if (result.error) throw result.error;

      toast({
        title: "Éxito",
        description: "Elemento creado correctamente",
      });

      setNewItem({ id: '', name: '', description: '', department_id: '' });
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
      const parsedData = parseCSVWithMapping(csvData, type);
      if (!parsedData.length) {
        throw new Error("No se pudieron parsear los datos CSV");
      }

      console.log('Parsed data for', type, ':', parsedData);

      let result;
      switch (type) {
        case 'countries':
          result = await bulkCreateSniesCountries(parsedData);
          break;
        case 'municipalities':
          result = await bulkCreateSniesMunicipalities(parsedData);
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
        headers = 'ID_MUNICIPIO,ID_DEPARTAMENTO,DESC_MUNICIPIO';
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
          {/* Formulario individual - Solo para países y municipios */}
          {(type === 'countries' || type === 'municipalities') && (
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
              {type === 'municipalities' ? (
                <div>
                  <Label htmlFor={`${type}_department`}>ID Departamento</Label>
                  <Input
                    id={`${type}_department`}
                    value={newItem.department_id}
                    onChange={(e) => setNewItem(prev => ({ ...prev, department_id: e.target.value }))}
                    placeholder="ID del departamento"
                  />
                </div>
              ) : (
                <div>
                  <Label htmlFor={`${type}_description`}>Descripción</Label>
                  <Input
                    id={`${type}_description`}
                    value={newItem.description}
                    onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descripción (opcional)"
                  />
                </div>
              )}
              <div className="flex items-end">
                <Button onClick={() => handleCreateItem(type)} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Crear
                </Button>
              </div>
            </div>
          )}

          {/* Importación CSV - Solo para países y municipios */}
          {(type === 'countries' || type === 'municipalities') && (
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
          )}

          {/* Lista de elementos con paginación */}
          {type === 'countries' && (
            <PaginatedTable
              data={data}
              columns={[
                { key: 'id', label: 'ID' },
                { key: 'name', label: 'Nombre' },
                { key: 'alpha_2', label: 'Alpha-2' },
                { key: 'alpha_3', label: 'Alpha-3' },
                { 
                  key: 'is_active', 
                  label: 'Estado',
                  render: (value) => getStatusBadge(value)
                }
              ]}
              searchFields={['id', 'name', 'alpha_2', 'alpha_3']}
              title={`Lista de ${title}`}
            />
          )}

          {type === 'municipalities' && (
            <PaginatedTable
              data={data}
              columns={[
                { key: 'id', label: 'ID Municipio' },
                { key: 'department_id', label: 'ID Departamento' },
                { key: 'name', label: 'Nombre' },
                { 
                  key: 'is_active', 
                  label: 'Estado',
                  render: (value) => getStatusBadge(value)
                }
              ]}
              searchFields={['id', 'name', 'department_id']}
              title={`Lista de ${title}`}
            />
          )}

          {(type === 'document_types' || type === 'biological_sex' || type === 'marital_status') && (
            <PaginatedTable
              data={data}
              columns={[
                { key: 'id', label: 'ID' },
                { key: 'name', label: 'Nombre' },
                { 
                  key: 'is_active', 
                  label: 'Estado',
                  render: (value) => getStatusBadge(value)
                }
              ]}
              searchFields={['id', 'name']}
              title={`Lista de ${title}`}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <Tabs defaultValue="countries" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="countries">Países</TabsTrigger>
          <TabsTrigger value="municipalities">Municipios</TabsTrigger>
          <TabsTrigger value="document_types">Tipos de Documento</TabsTrigger>
          <TabsTrigger value="biological_sex">Sexo Biológico</TabsTrigger>
          <TabsTrigger value="marital_status">Estado Civil</TabsTrigger>
        </TabsList>

        <TabsContent value="countries">
          {renderConfigSection("Países", countries, "countries")}
        </TabsContent>

        <TabsContent value="municipalities">
          {renderConfigSection("Municipios", municipalities, "municipalities")}
        </TabsContent>

        <TabsContent value="document_types">
          {renderConfigSection("Tipos de Documento", documentTypes, "document_types")}
        </TabsContent>

        <TabsContent value="biological_sex">
          {renderConfigSection("Sexo Biológico", biologicalSex, "biological_sex")}
        </TabsContent>

        <TabsContent value="marital_status">
          {renderConfigSection("Estado Civil", maritalStatus, "marital_status")}
        </TabsContent>
      </Tabs>
    </div>
  );
}
