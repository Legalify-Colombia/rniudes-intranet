import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { Upload, Link, X, FileText, AlertTriangle } from "lucide-react";

interface EvidenceUploaderProps {
  productId: string;
  reportId: string;
  currentFiles?: string[];
  currentFileNames?: string[];
  onFilesChange: (files: string[], fileNames: string[]) => void;
  disabled?: boolean;
}

export function EvidenceUploader({
  productId,
  reportId,
  currentFiles = [],
  currentFileNames = [],
  onFilesChange,
  disabled = false
}: EvidenceUploaderProps) {
  const { uploadFile } = useSupabaseData();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [uploading, setUploading] = useState(false);
  const [driveLink, setDriveLink] = useState("");
  const [showDriveInput, setShowDriveInput] = useState(false);

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Verificar tamaño del archivo
    if (file.size > MAX_FILE_SIZE) {
      setShowDriveInput(true);
      toast({
        title: "Archivo demasiado grande",
        description: `El archivo supera los 5MB (${(file.size / 1024 / 1024).toFixed(2)}MB). Por favor, súbelo a Drive y comparte el enlace.`,
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const fileName = `${reportId}/${productId}/${Date.now()}_${file.name}`;
      const uploadResult = await uploadFile(file, 'reports', fileName);
      
      if (uploadResult.error) {
        throw uploadResult.error;
      }

      const newFiles = [...currentFiles, uploadResult.data.publicUrl];
      const newFileNames = [...currentFileNames, file.name];
      
      onFilesChange(newFiles, newFileNames);
      
      toast({
        title: "Éxito",
        description: "Archivo subido correctamente",
      });

      // Limpiar el input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Error",
        description: "No se pudo subir el archivo",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDriveLinkAdd = () => {
    if (!driveLink.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa un enlace válido",
        variant: "destructive",
      });
      return;
    }

    // Validar que sea un enlace de Google Drive
    if (!driveLink.includes('drive.google.com')) {
      toast({
        title: "Error",
        description: "Por favor ingresa un enlace válido de Google Drive",
        variant: "destructive",
      });
      return;
    }

    const newFiles = [...currentFiles, driveLink];
    const newFileNames = [...currentFileNames, `Drive: ${driveLink.split('/').pop() || 'Documento'}`];
    
    onFilesChange(newFiles, newFileNames);
    
    toast({
      title: "Éxito",
      description: "Enlace de Drive agregado correctamente",
    });

    setDriveLink("");
    setShowDriveInput(false);
  };

  const removeFile = (index: number) => {
    const newFiles = currentFiles.filter((_, i) => i !== index);
    const newFileNames = currentFileNames.filter((_, i) => i !== index);
    onFilesChange(newFiles, newFileNames);
    
    toast({
      title: "Archivo eliminado",
      description: "El archivo ha sido removido de las evidencias",
    });
  };

  return (
    <div className="space-y-3">
      {/* Botones de acción */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || uploading}
          className="flex items-center gap-2"
        >
          {uploading ? (
            <>
              <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
              Subiendo...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              Subir archivo
            </>
          )}
        </Button>
        
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowDriveInput(!showDriveInput)}
          disabled={disabled}
          className="flex items-center gap-2"
        >
          <Link className="w-4 h-4" />
          Enlace Drive
        </Button>
      </div>

      {/* Input oculto para archivos */}
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xlsx,.xls"
      />

      {/* Input para enlace de Drive */}
      {showDriveInput && (
        <div className="flex gap-2">
          <Input
            placeholder="Pega aquí el enlace de Google Drive"
            value={driveLink}
            onChange={(e) => setDriveLink(e.target.value)}
            className="flex-1"
          />
          <Button
            type="button"
            size="sm"
            onClick={handleDriveLinkAdd}
            disabled={!driveLink.trim()}
          >
            Agregar
          </Button>
        </div>
      )}

      {/* Alerta sobre tamaño de archivos */}
      <Alert className="border-blue-200 bg-blue-50">
        <AlertTriangle className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800 text-sm">
          Archivos hasta 5MB se suben directamente. Para archivos más grandes, usa la opción de enlace de Drive.
        </AlertDescription>
      </Alert>

      {/* Lista de archivos actuales */}
      {currentFileNames.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Evidencias adjuntas:</p>
          {currentFileNames.map((fileName, index) => (
            <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700 truncate max-w-xs" title={fileName}>
                  {fileName}
                </span>
                {fileName.startsWith('Drive:') && (
                  <Badge variant="secondary" className="text-xs">Drive</Badge>
                )}
              </div>
              {!disabled && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
