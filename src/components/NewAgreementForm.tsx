import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Agreement } from "@/hooks/useAgreements";
import { Globe, Calendar, FileText, Save, X } from 'lucide-react';

interface NewAgreementFormProps {
  onCreate: (agreement: Pick<Agreement, 'country' | 'foreign_institution_name'> & Partial<Agreement>) => Promise<any>;
  onClose: () => void;
}

export const NewAgreementForm = ({ onCreate, onClose }: NewAgreementFormProps) => {
  const [loading, setLoading] = useState(false);
  const [isIndefinite, setIsIndefinite] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    country: '',
    foreign_institution_name: '',
    agreement_nature: '',
    agreement_type: '',
    modality: '',
    object: '',
    signature_date: '',
    termination_date: '',
    duration_years: '',
    renewal_info: '',
    observations: '',
    digital_folder_link: '',
    programs: [] as string[]
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.country || !formData.foreign_institution_name) {
      return;
    }

    try {
      setLoading(true);
      
      const agreementData = {
        ...formData,
        termination_date: isIndefinite ? null : (formData.termination_date || null),
        duration_years: formData.duration_years ? parseFloat(formData.duration_years) : undefined,
        programs: formData.programs.filter(p => p.trim() !== '')
      };

      await onCreate(agreementData);
      onClose();
    } catch (error) {
      console.error('Error creating agreement:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProgramsChange = (value: string) => {
    const programs = value.split(',').map(p => p.trim()).filter(p => p !== '');
    setFormData({ ...formData, programs });
  };

  return (
    <div className="space-y-6">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Globe className="w-5 h-5" />
          Nuevo Convenio
        </DialogTitle>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Globe className="w-4 h-4" />
              Información General (Requerida)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="code">Código</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="COV-2024-001"
                />
              </div>
              <div>
                <Label htmlFor="country">País *</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  placeholder="Colombia, México, España..."
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="foreign_institution_name">Institución Extranjera *</Label>
              <Input
                id="foreign_institution_name"
                value={formData.foreign_institution_name}
                onChange={(e) => setFormData({ ...formData, foreign_institution_name: e.target.value })}
                placeholder="Universidad Nacional de..."
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="agreement_nature">Naturaleza del Convenio</Label>
                <Select value={formData.agreement_nature} onValueChange={(value) => setFormData({ ...formData, agreement_nature: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar naturaleza" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Académico">Académico</SelectItem>
                    <SelectItem value="Investigación">Investigación</SelectItem>
                    <SelectItem value="Intercambio">Intercambio</SelectItem>
                    <SelectItem value="Cooperación">Cooperación</SelectItem>
                    <SelectItem value="Marco">Marco</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="agreement_type">Tipo de Convenio</Label>
                <Select value={formData.agreement_type} onValueChange={(value) => setFormData({ ...formData, agreement_type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Bilateral">Bilateral</SelectItem>
                    <SelectItem value="Multilateral">Multilateral</SelectItem>
                    <SelectItem value="Específico">Específico</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="modality">Modalidad</Label>
              <Select value={formData.modality} onValueChange={(value) => setFormData({ ...formData, modality: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar modalidad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Presencial">Presencial</SelectItem>
                  <SelectItem value="Virtual">Virtual</SelectItem>
                  <SelectItem value="Mixta">Mixta</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="w-4 h-4" />
              Fechas y Vigencia
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="signature_date">Fecha de Firma/Inicio</Label>
                <Input
                  id="signature_date"
                  type="date"
                  value={formData.signature_date}
                  onChange={(e) => setFormData({ ...formData, signature_date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="duration_years">Duración (años)</Label>
                <Input
                  id="duration_years"
                  type="number"
                  step="0.5"
                  min="0"
                  value={formData.duration_years}
                  onChange={(e) => setFormData({ ...formData, duration_years: e.target.value })}
                  placeholder="2, 3, 5..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="indefinite" 
                  checked={isIndefinite}
                  onCheckedChange={(checked) => {
                    setIsIndefinite(checked as boolean);
                    if (checked) {
                      setFormData({ ...formData, termination_date: '' });
                    }
                  }}
                />
                <Label htmlFor="indefinite">Vigencia indefinida</Label>
              </div>
              
              {!isIndefinite && (
                <div>
                  <Label htmlFor="termination_date">Fecha de Terminación</Label>
                  <Input
                    id="termination_date"
                    type="date"
                    value={formData.termination_date}
                    onChange={(e) => setFormData({ ...formData, termination_date: e.target.value })}
                  />
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="renewal_info">Información de Renovación</Label>
              <Textarea
                id="renewal_info"
                value={formData.renewal_info}
                onChange={(e) => setFormData({ ...formData, renewal_info: e.target.value })}
                rows={2}
                placeholder="Condiciones de renovación automática..."
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="w-4 h-4" />
              Información Adicional
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="object">Objeto del Convenio</Label>
              <Textarea
                id="object"
                value={formData.object}
                onChange={(e) => setFormData({ ...formData, object: e.target.value })}
                rows={3}
                placeholder="Describir el propósito y objetivos del convenio..."
              />
            </div>

            <div>
              <Label htmlFor="programs">Programas Relacionados</Label>
              <Input
                id="programs"
                value={formData.programs.join(', ')}
                onChange={(e) => handleProgramsChange(e.target.value)}
                placeholder="Ingeniería de Sistemas, Medicina, Derecho... (separar con comas)"
              />
            </div>

            <div>
              <Label htmlFor="digital_folder_link">Enlace a Carpeta Digital</Label>
              <Input
                id="digital_folder_link"
                type="url"
                value={formData.digital_folder_link}
                onChange={(e) => setFormData({ ...formData, digital_folder_link: e.target.value })}
                placeholder="https://drive.google.com/..."
              />
            </div>

            <div>
              <Label htmlFor="observations">Observaciones</Label>
              <Textarea
                id="observations"
                value={formData.observations}
                onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                rows={3}
                placeholder="Notas y comentarios adicionales..."
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose}>
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
          <Button type="submit" disabled={loading || !formData.country || !formData.foreign_institution_name}>
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Guardando...' : 'Crear Convenio'}
          </Button>
        </div>
      </form>
    </div>
  );
};