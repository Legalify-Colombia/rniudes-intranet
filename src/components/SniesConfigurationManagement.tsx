import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useSniesManagement } from "@/hooks/useSniesManagement";
import { Plus, Upload, Download, Settings } from "lucide-react";

export function SniesConfigurationManagement() {
  const [countries, setCountries] = useState<any[]>([]);
  const [municipalities, setMunicipalities] = useState<any[]>([]);
  const [documentTypes, setDocumentTypes] = useState<any[]>([]);
  const [biologicalSex, setBiologicalSex] = useState<any[]>([]);
  const [maritalStatus, setMaritalStatus] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const {
    fetchSniesCountries,
    fetchSniesMunicipalities,
    fetchSniesDocumentTypes,
    fetchSniesBiologicalSex,
    fetchSniesMaritalStatus,
    createSniesCountry,
    createSniesMunicipality,
    bulkCreateSniesCountries,
    bulkCreateSniesMunicipalities
  } = useSniesManagement();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [
        countriesResult,
        municipalitiesResult,
        documentTypesResult,
        biologicalSexResult,
        maritalStatusResult,
      ] = await Promise.all([
        fetchSniesCountries(),
        fetchSniesMunicipalities(),
        fetchSniesDocumentTypes(),
        fetchSniesBiologicalSex(),
        fetchSniesMaritalStatus(),
      ]);

      if (countriesResult.data) setCountries(countriesResult.data);
      if (municipalitiesResult.data) setMunicipalities(municipalitiesResult.data);
      if (documentTypesResult.data) setDocumentTypes(documentTypesResult.data);
      if (biologicalSexResult.data) setBiologicalSex(biologicalSexResult.data);
      if (maritalStatusResult.data) setMaritalStatus(maritalStatusResult.data);
    } catch (error) {
      console.error("Error loading SNIES configuration data:", error);
      toast({
        title: "Error",
        description: "Failed to load SNIES configuration data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading SNIES Configuration...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>SNIES Configuration Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Countries</TableCell>
                <TableCell>
                  <Button variant="outline">Manage</Button>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Municipalities</TableCell>
                <TableCell>
                  <Button variant="outline">Manage</Button>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Document Types</TableCell>
                <TableCell>
                  <Button variant="outline">Manage</Button>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Biological Sex</TableCell>
                <TableCell>
                  <Button variant="outline">Manage</Button>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Marital Status</TableCell>
                <TableCell>
                  <Button variant="outline">Manage</Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
