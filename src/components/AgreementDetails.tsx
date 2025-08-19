import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Agreement } from "@/hooks/useAgreements";
import { useAgreementAuditLog } from "@/hooks/useAgreementAuditLog";
import { ExternalLink, Calendar, Globe, Building, Edit, Save, X, MessageSquare, Clock, User } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface AgreementDetailsProps {
  agreement: Agreement;
  onUpdate: (id: string, updates: Partial<Agreement>) => Promise<any>;
  onUpdateStatus: (id: string, newStatus: string, comment?: string) => Promise<any>;
  onDelete: (id: string) => Promise<void>;
  onClose: () => void;
}

export const AgreementDetails = ({ agreement, onUpdate, onUpdateStatus, onDelete, onClose }: AgreementDetailsProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(agreement);
  const [loading, setLoading] = useState(false);
  const [showObservationDialog, setShowObservationDialog] = useState(false);
  const [observationText, setObservationText] = useState('');
  
  const { 
    auditLog, 
    loading: auditLoading, 
    addObservation, 
    getActionTypeLabel, 
    formatDate: formatAuditDate 
  } = useAgreementAuditLog(agreement.id);

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

  const handleAddObservation = async () => {
    if (!observationText.trim()) return;
    
    try {
      setLoading(true);
      await addObservation(agreement.id, observationText);
      setObservationText('');
      setShowObservationDialog(false);
    } catch (error) {
      console.error('Error adding observation:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <DialogHeader>
        <div className="flex items-center justify-between">
          <DialogTitle className="flex items-center gap-2">
            <Building className="w-5 h-5" />
            {agreement.foreign_institution_name}
            <Badge variant={agreement.is_international ? "default" : "secondary"} className="ml-2">
              {agreement.is_international ? "Internacional" : "Nacional"}
            </Badge>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información principal - 2 columnas */}
        <div className="lg:col-span-2 space-y-6">
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
                      <div className="space-y-2">
                        <Input
                          type="date"
                          value={editData.termination_date || ''}
                          onChange={(e) => setEditData({...editData, termination_date: e.target.value})}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setEditData({...editData, termination_date: ''})}
                        >
                          Marcar como indefinido
                        </Button>
                      </div>
                    ) : (
                      <div className="text-sm">
                        {agreement.termination_date ? formatDate(agreement.termination_date) : 'Indefinido'}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Duración (años)</Label>
                    {isEditing ? (
                      <Input
                        type="number"
                        step="0.5"
                        min="0"
                        value={editData.duration_years || ''}
                        onChange={(e) => setEditData({...editData, duration_years: parseFloat(e.target.value) || undefined})}
                        placeholder="Ej: 2, 3, 5 o indefinido"
                      />
                    ) : (
                      <div className="text-sm">{agreement.duration_years || 'No especificada'}</div>
                    )}
                  </div>
                  <div>
                    <Label>Estado de Vigencia</Label>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(editData.termination_date)}
                      {!editData.termination_date && (
                        <span className="text-xs text-muted-foreground">(Indefinido)</span>
                      )}
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

        {/* Bitácora - 1 columna */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Bitácora del Convenio
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowObservationDialog(true)}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Agregar Observación
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {auditLoading ? (
                <p className="text-sm text-muted-foreground">Cargando bitácora...</p>
              ) : auditLog.length === 0 ? (
                <p className="text-sm text-muted-foreground">No hay registros en la bitácora</p>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {auditLog.map((entry) => (
                    <div key={entry.id} className="border-l-2 border-primary/20 pl-4 py-2">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          {getActionTypeLabel(entry.action_type)}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatAuditDate(entry.created_at)}
                        </span>
                      </div>
                      <div className="mt-1">
                        <p className="text-sm font-medium flex items-center gap-2">
                          <User className="w-3 h-3" />
                          {entry.user_name || 'Usuario'}
                        </p>
                        {entry.action_type === 'status_change' && (
                          <p className="text-xs text-muted-foreground">
                            {entry.previous_status && `De: ${entry.previous_status}`} 
                            {entry.new_status && ` → A: ${entry.new_status}`}
                          </p>
                        )}
                        {entry.comment && (
                          <p className="text-sm mt-1 bg-muted/50 p-2 rounded text-muted-foreground">
                            {entry.comment}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialog para agregar observación */}
      <Dialog open={showObservationDialog} onOpenChange={setShowObservationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Observación</DialogTitle>
            <DialogDescription>
              Agregue una observación o comentario sobre este convenio.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Escriba su observación aquí..."
              value={observationText}
              onChange={(e) => setObservationText(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowObservationDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddObservation} disabled={loading || !observationText.trim()}>
              {loading ? 'Guardando...' : 'Agregar Observación'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};