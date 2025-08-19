import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Agreement } from "@/hooks/useAgreements";
import { ExternalLink, Calendar, Globe, Building, Edit, Save, X } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface AgreementDetailsProps {
  agreement: Agreement;
  onUpdate: (id: string, updates: Partial<Agreement>) => Promise<any>;
  onDelete: (id: string) => Promise<void>;
  onClose: () => void;
}

export const AgreementDetails = ({ agreement, onUpdate, onDelete, onClose }: AgreementDetailsProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(agreement);
  const [loading, setLoading] = useState(false);

  const calculateStatus = (terminationDate?: string) => {
    if (!terminationDate) return 'Sin fecha';
    
    const today = new Date();
    const termination = new Date(terminationDate);
    const diffTime = termination.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Vencido';
    if (diffDays <= 180) return 'Próximo a vencer';
    return 'Vigente';
  };

  const getStatusBadge = (terminationDate?: string) => {
    const status = calculateStatus(terminationDate);
    const variants = {
      'Vigente': 'default',
      'Próximo a vencer': 'secondary', 
      'Vencido': 'destructive',
      'Sin fecha': 'outline'
    } as const;
    
    return <Badge variant={variants[status as keyof typeof variants] || 'outline'}>{status}</Badge>;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No especificada';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: es });
    } catch {
      return dateString;
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await onUpdate(agreement.id, editData);
      setIsEditing(false);
    } catch (error) {
      // Error handled in hook
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditData(agreement);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <DialogHeader>
        <div className="flex items-center justify-between">
          <DialogTitle className="flex items-center gap-2">
            <Building className="w-5 h-5" />
            {agreement.foreign_institution_name}
          </DialogTitle>
          <div className="flex items-center gap-2">
            {getStatusBadge(agreement.termination_date)}
            {!isEditing ? (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  onClick={handleSave} 
                  disabled={loading}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Guardar
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleCancel}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogHeader>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Información General
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Código</Label>
                {isEditing ? (
                  <Input
                    value={editData.code || ''}
                    onChange={(e) => setEditData({...editData, code: e.target.value})}
                  />
                ) : (
                  <div className="text-sm font-medium">{agreement.code || 'No especificado'}</div>
                )}
              </div>
              <div>
                <Label>País</Label>
                {isEditing ? (
                  <Input
                    value={editData.country}
                    onChange={(e) => setEditData({...editData, country: e.target.value})}
                  />
                ) : (
                  <div className="text-sm font-medium">{agreement.country}</div>
                )}
              </div>
            </div>

            <div>
              <Label>Institución Extranjera</Label>
              {isEditing ? (
                <Input
                  value={editData.foreign_institution_name}
                  onChange={(e) => setEditData({...editData, foreign_institution_name: e.target.value})}
                />
              ) : (
                <div className="text-sm font-medium">{agreement.foreign_institution_name}</div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Naturaleza del Convenio</Label>
                {isEditing ? (
                  <Input
                    value={editData.agreement_nature || ''}
                    onChange={(e) => setEditData({...editData, agreement_nature: e.target.value})}
                  />
                ) : (
                  <div className="text-sm">{agreement.agreement_nature || 'No especificada'}</div>
                )}
              </div>
              <div>
                <Label>Tipo de Convenio</Label>
                {isEditing ? (
                  <Input
                    value={editData.agreement_type || ''}
                    onChange={(e) => setEditData({...editData, agreement_type: e.target.value})}
                  />
                ) : (
                  <div className="text-sm">{agreement.agreement_type || 'No especificado'}</div>
                )}
              </div>
            </div>

            <div>
              <Label>Modalidad</Label>
              {isEditing ? (
                <Input
                  value={editData.modality || ''}
                  onChange={(e) => setEditData({...editData, modality: e.target.value})}
                />
              ) : (
                <div className="text-sm">{agreement.modality || 'No especificada'}</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Fechas y Vigencia
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Fecha de Firma/Inicio</Label>
                {isEditing ? (
                  <Input
                    type="date"
                    value={editData.signature_date || ''}
                    onChange={(e) => setEditData({...editData, signature_date: e.target.value})}
                  />
                ) : (
                  <div className="text-sm">{formatDate(agreement.signature_date)}</div>
                )}
              </div>
              <div>
                <Label>Fecha de Terminación</Label>
                {isEditing ? (
                  <Input
                    type="date"
                    value={editData.termination_date || ''}
                    onChange={(e) => setEditData({...editData, termination_date: e.target.value})}
                  />
                ) : (
                  <div className="text-sm">{formatDate(agreement.termination_date)}</div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Duración (años)</Label>
                {isEditing ? (
                  <Input
                    type="number"
                    value={editData.duration_years || ''}
                    onChange={(e) => setEditData({...editData, duration_years: parseFloat(e.target.value) || undefined})}
                  />
                ) : (
                  <div className="text-sm">{agreement.duration_years || 'No especificada'}</div>
                )}
              </div>
              <div>
                <Label>Estado de Vigencia</Label>
                <div className="flex items-center gap-2">
                  {getStatusBadge(editData.termination_date)}
                </div>
              </div>
            </div>

            <div>
              <Label>Información de Renovación</Label>
              {isEditing ? (
                <Textarea
                  value={editData.renewal_info || ''}
                  onChange={(e) => setEditData({...editData, renewal_info: e.target.value})}
                  rows={2}
                />
              ) : (
                <div className="text-sm">{agreement.renewal_info || 'No especificada'}</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Objeto del Convenio</CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <Textarea
              value={editData.object || ''}
              onChange={(e) => setEditData({...editData, object: e.target.value})}
              rows={3}
            />
          ) : (
            <div className="text-sm whitespace-pre-wrap">{agreement.object || 'No especificado'}</div>
          )}
        </CardContent>
      </Card>

      {agreement.programs && agreement.programs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Programas Relacionados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {agreement.programs.map((program, index) => (
                <Badge key={index} variant="secondary">{program}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Observaciones</CardTitle>
          <CardDescription>Notas y comentarios adicionales sobre el convenio</CardDescription>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <Textarea
              value={editData.observations || ''}
              onChange={(e) => setEditData({...editData, observations: e.target.value})}
              rows={4}
              placeholder="Agregar observaciones..."
            />
          ) : (
            <div className="text-sm whitespace-pre-wrap">
              {agreement.observations || 'Sin observaciones'}
            </div>
          )}
        </CardContent>
      </Card>

      {agreement.digital_folder_link && (
        <Card>
          <CardHeader>
            <CardTitle>Enlaces y Documentos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label>Carpeta Digital</Label>
              {isEditing ? (
                <Input
                  value={editData.digital_folder_link || ''}
                  onChange={(e) => setEditData({...editData, digital_folder_link: e.target.value})}
                  placeholder="https://..."
                />
              ) : (
                <Button 
                  variant="outline" 
                  asChild 
                  className="flex items-center gap-2"
                >
                  <a 
                    href={agreement.digital_folder_link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Acceder a Carpeta Digital
                  </a>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};