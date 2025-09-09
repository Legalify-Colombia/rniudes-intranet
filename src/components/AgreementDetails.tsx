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
  const [expandedEntries, setExpandedEntries] = useState<string[]>([]);
  
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
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-start gap-3">
            <Building className="w-6 h-6 text-primary" />
            <div>
              <h3 className="text-lg font-semibold">{agreement.foreign_institution_name}</h3>
              <p className="text-sm text-muted-foreground">{agreement.code ? `Código: ${agreement.code}` : 'Sin código'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block">{getStatusBadge(agreement.termination_date)}</div>
            <div className="flex items-center gap-2">
              {!isEditing ? (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <Button size="sm" onClick={handleSave} disabled={loading}>
                    <Save className="w-4 h-4 mr-2" />
                    Guardar
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleCancel}>
                    <X className="w-4 h-4 mr-2" />
                    Cancelar
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main column: detalles y contenido textual */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Globe className="w-4 h-4"/> Información general</CardTitle>
              <CardDescription className="ml-0">Datos principales del convenio</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Institución</Label>
                {isEditing ? (
                  <Input value={editData.foreign_institution_name} onChange={(e) => setEditData({...editData, foreign_institution_name: e.target.value})} />
                ) : (
                  <div className="text-sm font-medium">{agreement.foreign_institution_name}</div>
                )}
              </div>
              <div>
                <Label>País</Label>
                {isEditing ? (
                  <Input value={editData.country || ''} onChange={(e) => setEditData({...editData, country: e.target.value})} />
                ) : (
                  <div className="text-sm">{agreement.country || 'No especificado'}</div>
                )}
              </div>

              <div>
                <Label>Tipo</Label>
                {isEditing ? (
                  <Input value={editData.agreement_type || ''} onChange={(e) => setEditData({...editData, agreement_type: e.target.value})} />
                ) : (
                  <div className="text-sm">{agreement.agreement_type || 'No especificado'}</div>
                )}
              </div>
              <div>
                <Label>Modalidad</Label>
                {isEditing ? (
                  <Input value={editData.modality || ''} onChange={(e) => setEditData({...editData, modality: e.target.value})} />
                ) : (
                  <div className="text-sm">{agreement.modality || 'No especificada'}</div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Objeto del convenio</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <Textarea value={editData.object || ''} onChange={(e) => setEditData({...editData, object: e.target.value})} rows={4} />
              ) : (
                <div className="text-sm whitespace-pre-wrap">{agreement.object || 'No especificado'}</div>
              )}
            </CardContent>
          </Card>

          {agreement.programs && agreement.programs.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Programas relacionados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {agreement.programs.map((p, i) => (
                    <Badge key={i} className="bg-slate-100 text-slate-800">{p}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Observaciones</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <Textarea value={editData.observations || ''} onChange={(e) => setEditData({...editData, observations: e.target.value})} rows={4} />
              ) : (
                <div className="text-sm whitespace-pre-wrap">{agreement.observations || 'Sin observaciones'}</div>
              )}
            </CardContent>
          </Card>

          {agreement.digital_folder_link && (
            <Card>
              <CardHeader>
                <CardTitle>Enlaces y documentos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  {isEditing ? (
                    <Input value={editData.digital_folder_link || ''} onChange={(e) => setEditData({...editData, digital_folder_link: e.target.value})} />
                  ) : (
                    <Button variant="outline" asChild>
                      <a href={agreement.digital_folder_link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                        <ExternalLink className="w-4 h-4" />
                        Acceder a Carpeta Digital
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Bitácora como timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Clock className="w-4 h-4"/> Bitácora</CardTitle>
              <CardDescription>Registros de acciones y observaciones</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-end mb-3">
                <Button variant="outline" size="sm" onClick={() => setShowObservationDialog(true)}>
                  <MessageSquare className="w-4 h-4 mr-2" />Agregar observación
                </Button>
              </div>

              {auditLoading ? (
                <p className="text-sm text-muted-foreground">Cargando bitácora...</p>
              ) : auditLog.length === 0 ? (
                <p className="text-sm text-muted-foreground">No hay registros en la bitácora</p>
              ) : (
                <ul className="space-y-4">
                  {auditLog.map((entry) => (
                    <li key={entry.id} className="flex items-start gap-4">
                      <div className="flex flex-col items-center">
                        <span className="w-3 h-3 rounded-full bg-primary mt-1" />
                        <span className="h-full w-px bg-gray-200" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Badge className="text-xs" variant="outline">{getActionTypeLabel(entry.action_type)}</Badge>
                            <div className="text-sm font-medium">{entry.user_name || 'Usuario'}</div>
                          </div>
                          <div className="text-xs text-muted-foreground">{formatAuditDate(entry.created_at)}</div>
                        </div>
                        <div className="mt-2">
                          {entry.action_type === 'status_change' && (
                            <div className="text-sm text-muted-foreground">{entry.previous_status && `De: ${entry.previous_status}`} {entry.new_status && `→ ${entry.new_status}`}</div>
                          )}
                          {entry.comment && (
                            <div className="mt-2 p-3 rounded bg-muted/50 text-sm text-muted-foreground">{entry.comment}</div>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column: tarjeta resumen y acciones rápidas */}
        <aside className="space-y-4">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Resumen</CardTitle>
              <CardDescription>Información rápida</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">Estado</div>
                <div>{getStatusBadge(agreement.termination_date)}</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">Firma</div>
                <div className="text-sm">{agreement.signature_date ? formatDate(agreement.signature_date) : 'No'}</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">Terminación</div>
                <div className="text-sm">{agreement.termination_date ? formatDate(agreement.termination_date) : 'Indefinido'}</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">Duración</div>
                <div className="text-sm">{agreement.duration_years || 'No especificada'}</div>
              </div>
              <Separator />
              <div className="space-y-2">
                <Button variant="ghost" className="w-full justify-start" onClick={() => { navigator.clipboard?.writeText(agreement.digital_folder_link || ''); }}>
                  <ExternalLink className="w-4 h-4 mr-2"/> Copiar enlace
                </Button>
                <Button variant="outline" className="w-full" onClick={() => onClose()}>
                  Cerrar
                </Button>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>

      {/* Dialog para agregar observación */}
      <Dialog open={showObservationDialog} onOpenChange={setShowObservationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Observación</DialogTitle>
            <DialogDescription>Agregue una observación o comentario sobre este convenio.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea placeholder="Escriba su observación aquí..." value={observationText} onChange={(e) => setObservationText(e.target.value)} rows={4} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowObservationDialog(false)}>Cancelar</Button>
            <Button onClick={handleAddObservation} disabled={loading || !observationText.trim()}>{loading ? 'Guardando...' : 'Agregar Observación'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};