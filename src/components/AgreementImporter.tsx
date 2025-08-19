import { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAgreements } from "@/hooks/useAgreements";
import { Upload, Download, FileText } from 'lucide-react';

export const AgreementImporter = () => {
  const { importAgreementsFromCSV } = useAgreements();
  const [file, setFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [importResults, setImportResults] = useState<{success: number; errors: string[]; skipped: number} | null>(null);

  const parseCSV = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    
    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      return row;
    });
  };

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
        setError('Por favor selecciona un archivo CSV válido');
        return;
      }
      
      setFile(selectedFile);
      setError('');
      
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const parsed = parseCSV(text);
          setCsvData(parsed);
          setPreviewData(parsed.slice(0, 5)); // Show first 5 rows for preview
        } catch (err) {
          setError('Error al procesar el archivo CSV');
        }
      };
      reader.readAsText(selectedFile);
    }
  }, []);

  const handleImport = async () => {
    if (!csvData.length) {
      setError('No hay datos para importar');
      return;
    }

    try {
      setLoading(true);
      setImportResults(null);
      const results = await importAgreementsFromCSV(csvData);
      setImportResults(results);
      
      // Clear form if import was successful or had only minor errors
      if (results && results.success > 0) {
        setFile(null);
        setCsvData([]);
        setPreviewData([]);
      }
    } catch (err) {
      // Error is handled in the hook
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const template = `Código,País,Nombre de la Institución Extranjera,Naturaleza del Convenio,Objeto,Tipo de Convenio,Modalidad,Fecha de Firma/Inicio,Fecha de Terminación,Duración en años,Días Faltantes,Estado,Renovación,Campus,Facultad,Programas,Observaciones,Fecha de Relación,Enlace Carpeta Digital
CON001,Colombia,Universidad Nacional,Internacional,Intercambio académico,Marco,Presencial,2024-01-01,2026-12-31,3,730,Vigente,Automática,Bogotá,Ingeniería,"Ing. Sistemas, Ing. Industrial",Convenio activo,2024-01-15,https://carpeta.digital/con001`;

    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'plantilla_convenios.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Importar Convenios desde CSV
          </CardTitle>
          <CardDescription>
            Importa múltiples convenios desde un archivo CSV. Descarga la plantilla para ver el formato requerido.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={downloadTemplate}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Descargar Plantilla CSV
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="csvFile">Seleccionar archivo CSV</Label>
            <Input
              id="csvFile"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium"
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {file && (
            <Alert>
              <FileText className="w-4 h-4" />
              <AlertDescription>
                Archivo seleccionado: {file.name} ({csvData.length} registros)
              </AlertDescription>
            </Alert>
          )}

          {importResults && (
            <div className="space-y-2">
              {importResults.success > 0 && (
                <Alert>
                  <AlertDescription>
                    ✅ {importResults.success} convenios importados exitosamente
                  </AlertDescription>
                </Alert>
              )}
              
              {importResults.errors && importResults.errors.length > 0 && (
                <Alert variant="destructive">
                  <AlertDescription>
                    <div className="space-y-1">
                      <div className="font-medium">⚠️ Errores encontrados ({importResults.errors.length}):</div>
                      <div className="text-sm max-h-40 overflow-y-auto">
                        {importResults.errors.slice(0, 10).map((error, index) => (
                          <div key={index} className="border-l-2 pl-2 mb-1">{error}</div>
                        ))}
                        {importResults.errors.length > 10 && (
                          <div className="text-xs text-muted-foreground mt-2">
                            ... y {importResults.errors.length - 10} errores más
                          </div>
                        )}
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
              
              {importResults.skipped > 0 && (
                <Alert>
                  <AlertDescription>
                    ⏭️ {importResults.skipped} filas omitidas por datos incompletos o errores
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {previewData.length > 0 && (
            <div className="space-y-2">
              <Label>Vista previa (primeros 5 registros)</Label>
              <div className="border rounded-lg overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="p-2 text-left">Código</th>
                      <th className="p-2 text-left">País</th>
                      <th className="p-2 text-left">Institución</th>
                      <th className="p-2 text-left">Tipo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.map((row, index) => (
                      <tr key={index} className="border-t">
                        <td className="p-2">{row.Código || row.code}</td>
                        <td className="p-2">{row.País || row.country}</td>
                        <td className="p-2">{row['Nombre de la Institución Extranjera'] || row.foreign_institution_name}</td>
                        <td className="p-2">{row['Tipo de Convenio'] || row.agreement_type}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <Button 
            onClick={handleImport} 
            disabled={!csvData.length || loading}
            className="w-full"
          >
            {loading ? 'Importando...' : `Importar ${csvData.length} convenios`}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};