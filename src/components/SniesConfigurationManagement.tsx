import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { useToast } from "@/hooks/use-toast";
import { Plus, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

export function SniesConfigurationManagement() {
  const {
    fetchSniesCountries,
    createSniesCountry,
    bulkCreateSniesCountries,
    fetchSniesMunicipalities,
    createSniesMunicipality,
    bulkCreateSniesMunicipalities,
  } = useSupabaseData();
  const { toast } = useToast();

  const [countries, setCountries] = useState<any[]>([]);
  const [municipalities, setMunicipalities] = useState<any[]>([]);
  const [newCountryName, setNewCountryName] = useState("");
  const [newCountryCode, setNewCountryCode] = useState("");
  const [newCountryAlpha2, setNewCountryAlpha2] = useState("");
  const [newCountryAlpha3, setNewCountryAlpha3] = useState("");
  const [bulkCountryData, setBulkCountryData] = useState("");
  const [newMunicipalityName, setNewMunicipalityName] = useState("");
  const [newMunicipalityCode, setNewMunicipalityCode] = useState("");
  const [bulkMunicipalityData, setBulkMunicipalityData] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [countriesResult, municipalitiesResult] = await Promise.all([
        fetchSniesCountries(),
        fetchSniesMunicipalities(),
      ]);

      setCountries(countriesResult.data || []);
      setMunicipalities(municipalitiesResult.data || []);
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

  const handleCreateCountry = async () => {
    if (!newCountryName || !newCountryCode) {
      toast({
        title: "Error",
        description: "El nombre y el código del país son obligatorios",
        variant: "destructive",
      });
      return;
    }

    try {
      const validCountryData = {
        id: newCountryCode,
        name: newCountryName,
        alpha_2: newCountryAlpha2 || null,
        alpha_3: newCountryAlpha3 || null,
        is_active: true
      };

      const { error } = await createSniesCountry(validCountryData);

      if (error) {
        throw error;
      }

      toast({
        title: "Éxito",
        description: "País creado correctamente",
      });

      setNewCountryName("");
      setNewCountryCode("");
      setNewCountryAlpha2("");
      setNewCountryAlpha3("");
      await loadData();
    } catch (error) {
      console.error("Error creating country:", error);
      toast({
        title: "Error",
        description: "No se pudo crear el país",
        variant: "destructive",
      });
    }
  };

  const handleBulkCreateCountries = async () => {
    if (!bulkCountryData) {
      toast({
        title: "Error",
        description: "Los datos del país a granel son obligatorios",
        variant: "destructive",
      });
      return;
    }

    try {
      const countriesData = JSON.parse(bulkCountryData);
      if (!Array.isArray(countriesData)) {
        throw new Error("Los datos deben ser un array de países");
      }

      const { error } = await bulkCreateSniesCountries(countriesData);

      if (error) {
        throw error;
      }

      toast({
        title: "Éxito",
        description: "Países creados correctamente a granel",
      });

      setBulkCountryData("");
      await loadData();
    } catch (error) {
      console.error("Error creating countries in bulk:", error);
      toast({
        title: "Error",
        description: "No se pudieron crear los países a granel",
        variant: "destructive",
      });
    }
  };

  const handleCreateMunicipality = async () => {
    if (!newMunicipalityName || !newMunicipalityCode) {
      toast({
        title: "Error",
        description: "El nombre y el código del municipio son obligatorios",
        variant: "destructive",
      });
      return;
    }

    try {
      const municipalityData = {
        id: newMunicipalityCode,
        name: newMunicipalityName,
        is_active: true,
      };

      const { error } = await createSniesMunicipality(municipalityData);

      if (error) {
        throw error;
      }

      toast({
        title: "Éxito",
        description: "Municipio creado correctamente",
      });

      setNewMunicipalityName("");
      setNewMunicipalityCode("");
      await loadData();
    } catch (error) {
      console.error("Error creating municipality:", error);
      toast({
        title: "Error",
        description: "No se pudo crear el municipio",
        variant: "destructive",
      });
    }
  };

  const handleBulkCreateMunicipalities = async () => {
    if (!bulkMunicipalityData) {
      toast({
        title: "Error",
        description: "Los datos del municipio a granel son obligatorios",
        variant: "destructive",
      });
      return;
    }

    try {
      const municipalitiesData = JSON.parse(bulkMunicipalityData);
      if (!Array.isArray(municipalitiesData)) {
        throw new Error("Los datos deben ser un array de municipios");
      }

      const { error } = await bulkCreateSniesMunicipalities(municipalitiesData);

      if (error) {
        throw error;
      }

      toast({
        title: "Éxito",
        description: "Municipios creados correctamente a granel",
      });

      setBulkMunicipalityData("");
      await loadData();
    } catch (error) {
      console.error("Error creating municipalities in bulk:", error);
      toast({
        title: "Error",
        description: "No se pudieron crear los municipios a granel",
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

  if (loading) {
    return <div className="flex justify-center p-8">Cargando datos...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Configuración de Países SNIES</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Crear País</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="countryName">Nombre del País</Label>
                <Input
                  type="text"
                  id="countryName"
                  value={newCountryName}
                  onChange={(e) => setNewCountryName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="countryCode">Código del País</Label>
                <Input
                  type="text"
                  id="countryCode"
                  value={newCountryCode}
                  onChange={(e) => setNewCountryCode(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="countryAlpha2">Código Alpha-2</Label>
                <Input
                  type="text"
                  id="countryAlpha2"
                  value={newCountryAlpha2}
                  onChange={(e) => setNewCountryAlpha2(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="countryAlpha3">Código Alpha-3</Label>
                <Input
                  type="text"
                  id="countryAlpha3"
                  value={newCountryAlpha3}
                  onChange={(e) => setNewCountryAlpha3(e.target.value)}
                />
              </div>
            </div>
            <Button onClick={handleCreateCountry}>Crear País</Button>

            <h3 className="text-lg font-medium mt-6">Creación Masiva de Países (JSON)</h3>
            <div>
              <Label htmlFor="bulkCountryData">Datos JSON de Países</Label>
              <Input
                type="textarea"
                id="bulkCountryData"
                value={bulkCountryData}
                onChange={(e) => setBulkCountryData(e.target.value)}
                placeholder="[{&quot;id&quot;: &quot;USA&quot;, &quot;name&quot;: &quot;Estados Unidos&quot;}, ...]"
              />
            </div>
            <Button onClick={handleBulkCreateCountries}>Crear Países en Lote</Button>

            <h3 className="text-lg font-medium mt-6">Lista de Países</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {countries.map((country) => (
                  <TableRow key={country.id}>
                    <TableCell>{country.id}</TableCell>
                    <TableCell>{country.name}</TableCell>
                    <TableCell>{getStatusBadge(country.is_active)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Configuración de Municipios SNIES</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Crear Municipio</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="municipalityName">Nombre del Municipio</Label>
                <Input
                  type="text"
                  id="municipalityName"
                  value={newMunicipalityName}
                  onChange={(e) => setNewMunicipalityName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="municipalityCode">Código del Municipio</Label>
                <Input
                  type="text"
                  id="municipalityCode"
                  value={newMunicipalityCode}
                  onChange={(e) => setNewMunicipalityCode(e.target.value)}
                />
              </div>
            </div>
            <Button onClick={handleCreateMunicipality}>Crear Municipio</Button>

            <h3 className="text-lg font-medium mt-6">Creación Masiva de Municipios (JSON)</h3>
            <div>
              <Label htmlFor="bulkMunicipalityData">Datos JSON de Municipios</Label>
              <Input
                type="textarea"
                id="bulkMunicipalityData"
                value={bulkMunicipalityData}
                onChange={(e) => setBulkMunicipalityData(e.target.value)}
                placeholder="[{&quot;id&quot;: &quot;11001&quot;, &quot;name&quot;: &quot;Bogotá D.C.&quot;}, ...]"
              />
            </div>
            <Button onClick={handleBulkCreateMunicipalities}>
              Crear Municipios en Lote
            </Button>

            <h3 className="text-lg font-medium mt-6">Lista de Municipios</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {municipalities.map((municipality) => (
                  <TableRow key={municipality.id}>
                    <TableCell>{municipality.id}</TableCell>
                    <TableCell>{municipality.name}</TableCell>
                    <TableCell>{getStatusBadge(municipality.is_active)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
