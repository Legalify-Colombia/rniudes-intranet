
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Download, Plus, Edit, Trash2, Database } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseData } from "@/hooks/useSupabaseData";

export function SniesConfigurationManagement() {
  const [countries, setCountries] = useState<any[]>([]);
  const [municipalities, setMunicipalities] = useState<any[]>([]);
  const [documentTypes, setDocumentTypes] = useState<any[]>([]);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [uploadType, setUploadType] = useState<'countries' | 'municipalities'>('countries');
  const [csvData, setCsvData] = useState('');
  const [isManualEntryOpen, setIsManualEntryOpen] = useState(false);
  const [manualEntryType, setManualEntryType] = useState<'country' | 'municipality'>('country');
  
  const { toast } = useToast();
  const {
    fetchSniesCountries,
    fetchSniesMunicipalities,
    fetchSniesDocumentTypes,
    bulkCreateSniesCountries,
    bulkCreateSniesMunicipalities,
    createSniesCountry,
    createSniesMunicipality
  } = useSupabaseData();

  const [countryForm, setCountryForm] = useState({
    id: '',
    name: '',
    alpha_3: '',
    alpha_2: ''
  });

  const [municipalityForm, setMunicipalityForm] = useState({
    id: '',
    name: '',
    country_id: '',
    department_code: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [countriesResult, municipalitiesResult, documentTypesResult] = await Promise.all([
        fetchSniesCountries(),
        fetchSniesMunicipalities(),
        fetchSniesDocumentTypes()
      ]);

      setCountries(countriesResult.data || []);
      setMunicipalities(municipalitiesResult.data || []);
      setDocumentTypes(documentTypesResult.data || []);
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
          obj[header.trim()] = values[index]?.trim() || '';
        });
        return obj;
      });

      if (uploadType === 'countries') {
        const countriesToInsert = data.map(item => ({
          id: item.ID_PAIS || item.id,
          name: item.DESC_PAIS || item.name,
          alpha_3: item['ALFA-3'] || item.alpha_3,
          alpha_2: item['ALFA-2'] || item.alpha_2
        }));

        const result = await bulkCreateSniesCountries(countriesToInsert);
        if (result.error) throw result.error;

        toast({
          title: "Éxito",
          description: `Se importaron ${countriesToInsert.length} países correctamente`,
        });
      } else {
        const municipalitiesToInsert = data.map(item => ({
          id: item.ID_MUNICIPIO || item.id,
          name: item.DESC_MUNICIPIO || item.name,
          country_id: item.ID_PAIS || item.country_id,
          department_code: item.COD_DEPTO || item.department_code
        }));

        const result = await bulkCreateSniesMunicipalities(municipalitiesToInsert);
        if (result.error) throw result.error;

        toast({
          title: "Éxito",
          description: `Se importaron ${municipalitiesToInsert.length} municipios correctamente`,
        });
      }

      setCsvData('');
      setIsUploadDialogOpen(false);
      loadData();
    } catch (error) {
      console.error('Error uploading data:', error);
      toast({
        title: "Error",
        description: "Error al importar los datos",
        variant: "destructive",
      });
    }
  };

  const handleManualEntry = async () => {
    try {
      if (manualEntryType === 'country') {
        if (!countryForm.id || !countryForm.name) {
          toast({
            title: "Error",
            description: "ID y nombre son requeridos",
            variant: "destructive",
          });
          return;
        }

        const result = await createSniesCountry(countryForm);
        if (result.error) throw result.error;

        toast({
          title: "Éxito",
          description: "País creado correctamente",
        });

        setCountryForm({ id: '', name: '', alpha_3: '', alpha_2: '' });
      } else {
        if (!municipalityForm.id || !municipalityForm.name) {
          toast({
            title: "Error",
            description: "ID y nombre son requeridos",
            variant: "destructive",
          });
          return;
        }

        const result = await createSniesMunicipality(municipalityForm);
        if (result.error) throw result.error;

        toast({
          title: "Éxito",
          description: "Municipio creado correctamente",
        });

        setMunicipalityForm({ id: '', name: '', country_id: '', department_code: '' });
      }

      setIsManualEntryOpen(false);
      loadData();
    } catch (error) {
      console.error('Error creating entry:', error);
      toast({
        title: "Error",
        description: "Error al crear la entrada",
        variant: "destructive",
      });
    }
  };

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
            <TabsList>
              <TabsTrigger value="countries">Países</TabsTrigger>
              <TabsTrigger value="municipalities">Municipios</TabsTrigger>
              <TabsTrigger value="documents">Tipos de Documento</TabsTrigger>
            </TabsList>

            <TabsContent value="countries">
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        onClick={() => {
                          setUploadType('countries');
                          setIsUploadDialogOpen(true);
                        }}
                        className="institutional-gradient text-white"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Importar Países
                      </Button>
                    </DialogTrigger>
                  </Dialog>

                  <Dialog open={isManualEntryOpen} onOpenChange={setIsManualEntryOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline"
                        onClick={() => {
                          setManualEntryType('country');
                          setIsManualEntryOpen(true);
                        }}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Agregar País
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Código Alpha-3</TableHead>
                      <TableHead>Código Alpha-2</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {countries.map((country) => (
                      <TableRow key={country.id}>
                        <TableCell>{country.id}</TableCell>
                        <TableCell>{country.name}</TableCell>
                        <TableCell>{country.alpha_3}</TableCell>
                        <TableCell>{country.alpha_2}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="municipalities">
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        onClick={() => {
                          setUploadType('municipalities');
                          setIsUploadDialogOpen(true);
                        }}
                        className="institutional-gradient text-white"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Importar Municipios
                      </Button>
                    </DialogTrigger>
                  </Dialog>

                  <Dialog open={isManualEntryOpen} onOpenChange={setIsManualEntryOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline"
                        onClick={() => {
                          setManualEntryType('municipality');
                          setIsManualEntryOpen(true);
                        }}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Agregar Municipio
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Nombre</TableHead>
                      <TableHead>ID País</TableHead>
                      <TableHead>Código Departamento</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {municipalities.map((municipality) => (
                      <TableRow key={municipality.id}>
                        <TableCell>{municipality.id}</TableCell>
                        <TableCell>{municipality.name}</TableCell>
                        <TableCell>{municipality.country_id}</TableCell>
                        <TableCell>{municipality.department_code}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

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
          </Tabs>
        </CardContent>
      </Card>

      {/* Upload Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Importar {uploadType === 'countries' ? 'Países' : 'Municipios'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Datos CSV (separados por tabulaciones)</Label>
              <Textarea
                value={csvData}
                onChange={(e) => setCsvData(e.target.value)}
                placeholder={
                  uploadType === 'countries' 
                    ? "ID_PAIS\tDESC_PAIS\tALFA-3\tALFA-2\n535\tBONAIRE, SAN EUSTAQUIO Y SABA\tBES\tBQ"
                    : "ID_MUNICIPIO\tDESC_MUNICIPIO\tID_PAIS\tCOD_DEPTO\n001\tBOGOTÁ\t170\t11"
                }
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
              Agregar {manualEntryType === 'country' ? 'País' : 'Municipio'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {manualEntryType === 'country' ? (
              <>
                <div>
                  <Label htmlFor="countryId">ID del País</Label>
                  <Input
                    id="countryId"
                    value={countryForm.id}
                    onChange={(e) => setCountryForm(prev => ({ ...prev, id: e.target.value }))}
                    placeholder="535"
                  />
                </div>
                <div>
                  <Label htmlFor="countryName">Nombre del País</Label>
                  <Input
                    id="countryName"
                    value={countryForm.name}
                    onChange={(e) => setCountryForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="BONAIRE, SAN EUSTAQUIO Y SABA"
                  />
                </div>
                <div>
                  <Label htmlFor="countryAlpha3">Código Alpha-3</Label>
                  <Input
                    id="countryAlpha3"
                    value={countryForm.alpha_3}
                    onChange={(e) => setCountryForm(prev => ({ ...prev, alpha_3: e.target.value }))}
                    placeholder="BES"
                  />
                </div>
                <div>
                  <Label htmlFor="countryAlpha2">Código Alpha-2</Label>
                  <Input
                    id="countryAlpha2"
                    value={countryForm.alpha_2}
                    onChange={(e) => setCountryForm(prev => ({ ...prev, alpha_2: e.target.value }))}
                    placeholder="BQ"
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <Label htmlFor="municipalityId">ID del Municipio</Label>
                  <Input
                    id="municipalityId"
                    value={municipalityForm.id}
                    onChange={(e) => setMunicipalityForm(prev => ({ ...prev, id: e.target.value }))}
                    placeholder="001"
                  />
                </div>
                <div>
                  <Label htmlFor="municipalityName">Nombre del Municipio</Label>
                  <Input
                    id="municipalityName"
                    value={municipalityForm.name}
                    onChange={(e) => setMunicipalityForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="BOGOTÁ"
                  />
                </div>
                <div>
                  <Label htmlFor="municipalityCountry">ID del País</Label>
                  <Input
                    id="municipalityCountry"
                    value={municipalityForm.country_id}
                    onChange={(e) => setMunicipalityForm(prev => ({ ...prev, country_id: e.target.value }))}
                    placeholder="170"
                  />
                </div>
                <div>
                  <Label htmlFor="municipalityDept">Código Departamento</Label>
                  <Input
                    id="municipalityDept"
                    value={municipalityForm.department_code}
                    onChange={(e) => setMunicipalityForm(prev => ({ ...prev, department_code: e.target.value }))}
                    placeholder="11"
                  />
                </div>
              </>
            )}
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
