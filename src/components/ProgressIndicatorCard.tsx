
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Upload, Trash2, FileText } from 'lucide-react';

interface ProgressIndicatorCardProps {
  product: any;
  assignment: any;
  progressReport: any;
  onProgressUpdate: (productId: string, assignmentId: string, updates: any) => void;
  onFileUpload: (productId: string, assignmentId: string, files: FileList) => void;
  onFileRemove: (productId: string, assignmentId: string, fileIndex: number) => void;
  isLoading?: boolean;
  isUploading?: boolean;
}

export function ProgressIndicatorCard({
  product,
  assignment,
  progressReport,
  onProgressUpdate,
  onFileUpload,
  onFileRemove,
  isLoading = false,
  isUploading = false
}: ProgressIndicatorCardProps) {
  const getProgressColor = (percentage: number) => {
    if (percentage >= 70) return 'bg-green-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getProgressStatus = (percentage: number) => {
    if (percentage >= 100) return { label: 'Completado', variant: 'default', className: 'bg-green-600' };
    if (percentage >= 70) return { label: 'En progreso', variant: 'default', className: 'bg-blue-600' };
    if (percentage >= 50) return { label: 'Avance medio', variant: 'secondary' };
    if (percentage > 0) return { label: 'Iniciado', variant: 'outline' };
    return { label: 'No iniciado', variant: 'destructive' };
  };

  const status = getProgressStatus(progressReport.progress_percentage || 0);

  return (
    <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-base font-medium text-gray-900 mb-2">
              {product.name}
            </CardTitle>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>Horas asignadas: <strong>{assignment.assigned_hours}h</strong></span>
              <Badge 
                variant={status.variant as any} 
                className={status.className}
              >
                {status.label}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Indicador de progreso visual */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              Porcentaje de avance
            </label>
            <span className="text-lg font-semibold text-gray-900">
              {progressReport.progress_percentage || 0}%
            </span>
          </div>
          
          <div className="relative">
            <Progress 
              value={progressReport.progress_percentage || 0} 
              className="h-3"
            />
            <div 
              className={`absolute top-0 left-0 h-3 rounded-full transition-all duration-300 ${getProgressColor(progressReport.progress_percentage || 0)}`}
              style={{ width: `${progressReport.progress_percentage || 0}%` }}
            />
          </div>
          
          <Input
            type="number"
            min="0"
            max="100"
            value={progressReport.progress_percentage || 0}
            onChange={(e) => {
              const newPercentage = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
              onProgressUpdate(product.id, assignment.id, {
                ...progressReport,
                progress_percentage: newPercentage
              });
            }}
            className="w-20 h-8 text-center"
            disabled={isLoading}
          />
        </div>

        {/* Observaciones */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Observaciones y descripción del avance
          </label>
          <Textarea
            value={progressReport.observations || ''}
            onChange={(e) => {
              onProgressUpdate(product.id, assignment.id, {
                ...progressReport,
                observations: e.target.value
              });
            }}
            placeholder="Describe el progreso realizado, logros obtenidos, dificultades encontradas..."
            className="min-h-[80px] resize-none"
            disabled={isLoading}
          />
        </div>

        {/* Evidencias */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700">
            Archivos de evidencia
          </label>
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-400 transition-colors">
            <div className="text-center">
              <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <label htmlFor={`file-upload-${product.id}`} className="cursor-pointer">
                <span className="text-sm text-blue-600 hover:text-blue-500 font-medium">
                  {isUploading ? 'Subiendo...' : 'Subir archivos'}
                </span>
                <input
                  id={`file-upload-${product.id}`}
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xls,.xlsx"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      onFileUpload(product.id, assignment.id, e.target.files);
                      e.target.value = '';
                    }
                  }}
                  className="hidden"
                  disabled={isUploading}
                />
              </label>
              <p className="text-xs text-gray-500 mt-1">
                PDF, DOC, DOCX, JPG, PNG, XLS, XLSX (máx. 10MB cada uno)
              </p>
            </div>
          </div>

          {/* Lista de archivos */}
          {progressReport.evidence_file_names?.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700">Archivos subidos:</h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {progressReport.evidence_file_names.map((fileName: string, index: number) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded border">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-700 truncate" title={fileName}>
                        {fileName}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onFileRemove(product.id, assignment.id, index)}
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                      disabled={isLoading}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Mensaje de ayuda para meta mínima */}
        {(progressReport.progress_percentage || 0) < 70 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <div className="text-yellow-600">⚠️</div>
              <div className="text-sm text-yellow-800">
                <strong>Meta mínima:</strong> Se requiere al menos 70% de avance para cumplir con los objetivos del plan de trabajo.
              </div>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="text-sm text-blue-600 flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            Guardando cambios...
          </div>
        )}
      </CardContent>
    </Card>
  );
}
