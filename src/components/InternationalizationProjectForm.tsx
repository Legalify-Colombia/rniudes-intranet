import React, { useState, useEffect } from 'react';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, Trash2, Upload, Send, Save } from 'lucide-react';
import { toast } from 'sonner';

interface FormData {
  program_id: string;
  schedule_description: string;
  project_title: string;
  strategic_axis_id: string;
  specific_line_id: string;
  duration_months: number;
  project_summary: string;
  introduction: string;
  general_objective: string;
  specific_objectives: string[];
  methodology: string;
  activities_schedule: string;
  results: string;
  indicators_text: string;
  impact: string;
  bibliography: string;
  participation_letter_url?: string;
  participation_letter_name?: string;
}

interface PartnerInstitution {
  institution_name: string;
  country: string;
  contact_professor_name: string;
  contact_professor_email: string;
}

const InternationalizationProjectForm: React.FC = () => {
  const { profile } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    program_id: '',
    schedule_description: '',
    project_title: '',
    strategic_axis_id: '',
    specific_line_id: '',
    duration_months: 6,
    project_summary: '',
    introduction: '',
    general_objective: '',
    specific_objectives: [''],
    methodology: '',
    activities_schedule: '',
    results: '',
    indicators_text: '',
    impact: '',
    bibliography: ''
  });

  const [partnerInstitutions, setPartnerInstitutions] = useState<PartnerInstitution[]>([
    { institution_name: '', country: '', contact_professor_name: '', contact_professor_email: '' }
  ]);

  const [academicPrograms, setAcademicPrograms] = useState<any[]>([]);
  const [strategicAxes, setStrategicAxes] = useState<any[]>([]);
  const [specificLines, setSpecificLines] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    fetchAcademicPrograms,
    fetchStrategicAxes,
    fetchSpecificLines,
    createInternationalizationProject,
    createPartnerInstitution,
    uploadFile
  } = useSupabaseData();

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    const [programsResult, axesResult, linesResult] = await Promise.all([
      fetchAcademicPrograms(),
      fetchStrategicAxes(),
      fetchSpecificLines()
    ]);

    if (programsResult.data) setAcademicPrograms(programsResult.data);
    if (axesResult.data) setStrategicAxes(axesResult.data.filter(axis => 
      axis.usage_type?.includes('internationalization') || axis.usage_type?.includes('work_plan')
    ));
    if (linesResult.data) setSpecificLines(linesResult.data);
  };

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addSpecificObjective = () => {
    setFormData(prev => ({
      ...prev,
      specific_objectives: [...prev.specific_objectives, '']
    }));
  };

  const updateSpecificObjective = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      specific_objectives: prev.specific_objectives.map((obj, i) => i === index ? value : obj)
    }));
  };

  const removeSpecificObjective = (index: number) => {
    setFormData(prev => ({
      ...prev,
      specific_objectives: prev.specific_objectives.filter((_, i) => i !== index)
    }));
  };

  const addPartnerInstitution = () => {
    if (partnerInstitutions.length < 2) {
      setPartnerInstitutions(prev => [...prev, 
        { institution_name: '', country: '', contact_professor_name: '', contact_professor_email: '' }
      ]);
    }
  };

  const updatePartnerInstitution = (index: number, field: keyof PartnerInstitution, value: string) => {
    setPartnerInstitutions(prev => prev.map((inst, i) => 
      i === index ? { ...inst, [field]: value } : inst
    ));
  };

  const removePartnerInstitution = (index: number) => {
    if (partnerInstitutions.length > 1) {
      setPartnerInstitutions(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleFileUpload = async (file: File) => {
    const result = await uploadFile(file, 'reports');
    if (result.error) {
      toast.error('Error subiendo archivo');
      return;
    }
    
    updateFormData('participation_letter_url', result.data?.publicUrl);
    updateFormData('participation_letter_name', file.name);
    toast.success('Archivo subido exitosamente');
  };

  const validateForm = (): string[] => {
    const errors: string[] = [];
    
    if (!formData.program_id) errors.push('Programa académico es requerido');
    if (!formData.project_title) errors.push('Título del proyecto es requerido');
    if (!formData.strategic_axis_id) errors.push('Eje estratégico es requerido');
    if (!formData.specific_line_id) errors.push('Línea específica es requerida');
    
    if (formData.project_summary.length < 150 || formData.project_summary.length > 200) {
      errors.push('El resumen debe tener entre 150 y 200 palabras');
    }
    
    if (formData.introduction.length < 250 || formData.introduction.length > 300) {
      errors.push('La introducción debe tener entre 250 y 300 palabras');
    }
    
    if (formData.methodology.length > 1000) {
      errors.push('La metodología no puede exceder 1000 palabras');
    }
    
    if (formData.activities_schedule.length > 1000) {
      errors.push('Las actividades y cronograma no pueden exceder 1000 palabras');
    }
    
    if (formData.results.length < 150 || formData.results.length > 500) {
      errors.push('Los resultados deben tener entre 150 y 500 palabras');
    }
    
    if (formData.indicators_text.length < 150 || formData.indicators_text.length > 500) {
      errors.push('Los indicadores deben tener entre 150 y 500 palabras');
    }
    
    if (formData.impact.length < 100 || formData.impact.length > 800) {
      errors.push('El impacto debe tener entre 100 y 800 palabras');
    }

    if (!formData.participation_letter_url) {
      errors.push('La carta de participación es obligatoria');
    }

    const validInstitutions = partnerInstitutions.filter(inst => 
      inst.institution_name && inst.country && inst.contact_professor_name && inst.contact_professor_email
    );
    
    if (validInstitutions.length === 0) {
      errors.push('Debe agregar al menos una institución aliada');
    }

    return errors;
  };

  const handleSubmit = async (status: 'draft' | 'submitted') => {
    const errors = status === 'submitted' ? validateForm() : [];
    
    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
      return;
    }

    setIsSubmitting(true);

    try {
      const projectData = {
        ...formData,
        manager_id: profile?.id || '',
        status,
        submitted_date: status === 'submitted' ? new Date().toISOString() : undefined
      };

      const projectResult = await createInternationalizationProject(projectData);
      
      if (projectResult.error) {
        toast.error('Error creando proyecto');
        return;
      }

      // Crear instituciones aliadas
      const validInstitutions = partnerInstitutions.filter(inst => 
        inst.institution_name && inst.country && inst.contact_professor_name && inst.contact_professor_email
      );

      for (const institution of validInstitutions) {
        await createPartnerInstitution({
          project_id: projectResult.data!.id,
          ...institution
        });
      }

      toast.success(status === 'submitted' ? 'Proyecto enviado exitosamente' : 'Proyecto guardado como borrador');
      
      // Reset form
      setFormData({
        program_id: '',
        schedule_description: '',
        project_title: '',
        strategic_axis_id: '',
        specific_line_id: '',
        duration_months: 6,
        project_summary: '',
        introduction: '',
        general_objective: '',
        specific_objectives: [''],
        methodology: '',
        activities_schedule: '',
        results: '',
        indicators_text: '',
        impact: '',
        bibliography: ''
      });
      setPartnerInstitutions([{ institution_name: '', country: '', contact_professor_name: '', contact_professor_email: '' }]);

    } catch (error) {
      toast.error('Error inesperado');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getWordCount = (text: string) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const selectedProgram = academicPrograms.find(p => p.id === formData.program_id);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Formato de Proyecto de Internacionalización</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Datos básicos del programa */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Programa Académico *</label>
              <Select value={formData.program_id} onValueChange={(value) => updateFormData('program_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar programa" />
                </SelectTrigger>
                <SelectContent>
                  {academicPrograms.map((program) => (
                    <SelectItem key={program.id} value={program.id}>
                      {program.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedProgram && (
              <div className="space-y-2">
                <div className="text-sm">
                  <strong>Campus:</strong> {selectedProgram.campus?.name}
                </div>
                <div className="text-sm">
                  <strong>Facultad:</strong> {selectedProgram.faculty?.name}
                </div>
                <div className="text-sm">
                  <strong>Director:</strong> {selectedProgram.director_name}
                </div>
                <div className="text-sm">
                  <strong>Gestor:</strong> {profile?.full_name}
                </div>
                <div className="text-sm">
                  <strong>Email:</strong> {profile?.email}
                </div>
                <div className="text-sm">
                  <strong>Horas asignadas:</strong> {profile?.weekly_hours} horas/semana por {profile?.number_of_weeks} semanas
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Horario destinado al proyecto</label>
            <Textarea
              value={formData.schedule_description}
              onChange={(e) => updateFormData('schedule_description', e.target.value)}
              placeholder="Describe el horario que destinarás al proyecto..."
              rows={2}
            />
          </div>

          <Separator />

          {/* Datos del proyecto */}
          <div>
            <label className="block text-sm font-medium mb-1">Título del Proyecto *</label>
            <Input
              value={formData.project_title}
              onChange={(e) => updateFormData('project_title', e.target.value)}
              placeholder="Título del proyecto de internacionalización"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Eje Estratégico de Internacionalización *</label>
              <Select value={formData.strategic_axis_id} onValueChange={(value) => updateFormData('strategic_axis_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar eje estratégico" />
                </SelectTrigger>
                <SelectContent>
                  {strategicAxes.map((axis) => (
                    <SelectItem key={axis.id} value={axis.id}>
                      {axis.code} - {axis.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Línea Específica *</label>
              <Select value={formData.specific_line_id} onValueChange={(value) => updateFormData('specific_line_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar línea específica" />
                </SelectTrigger>
                <SelectContent>
                  {specificLines.map((line) => (
                    <SelectItem key={line.id} value={line.id}>
                      {line.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Duración (meses)</label>
            <Input
              type="number"
              value={formData.duration_months}
              onChange={(e) => updateFormData('duration_months', parseInt(e.target.value))}
              min="1"
              max="24"
            />
          </div>

          <Separator />

          {/* Instituciones aliadas */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Instituciones Aliadas (máximo 2)</h3>
              {partnerInstitutions.length < 2 && (
                <Button type="button" variant="outline" onClick={addPartnerInstitution}>
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Institución
                </Button>
              )}
            </div>

            {partnerInstitutions.map((institution, index) => (
              <Card key={index} className="mb-4">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-sm">Institución {index + 1}</CardTitle>
                    {partnerInstitutions.length > 1 && (
                      <Button 
                        type="button" 
                        size="sm" 
                        variant="destructive"
                        onClick={() => removePartnerInstitution(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Nombre de la Institución</label>
                      <Input
                        value={institution.institution_name}
                        onChange={(e) => updatePartnerInstitution(index, 'institution_name', e.target.value)}
                        placeholder="Universidad..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">País</label>
                      <Input
                        value={institution.country}
                        onChange={(e) => updatePartnerInstitution(index, 'country', e.target.value)}
                        placeholder="País de la institución"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Nombre del Profesor Contacto</label>
                      <Input
                        value={institution.contact_professor_name}
                        onChange={(e) => updatePartnerInstitution(index, 'contact_professor_name', e.target.value)}
                        placeholder="Dr. Juan Pérez"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Correo del Profesor</label>
                      <Input
                        type="email"
                        value={institution.contact_professor_email}
                        onChange={(e) => updatePartnerInstitution(index, 'contact_professor_email', e.target.value)}
                        placeholder="profesor@universidad.edu"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Separator />

          {/* Resumen e Introducción */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Resumen del Proyecto (150-200 palabras) *
              <Badge variant="outline" className="ml-2">
                {getWordCount(formData.project_summary)} palabras
              </Badge>
            </label>
            <Textarea
              value={formData.project_summary}
              onChange={(e) => updateFormData('project_summary', e.target.value)}
              placeholder="Resumen ejecutivo del proyecto..."
              rows={4}
              className={getWordCount(formData.project_summary) < 150 || getWordCount(formData.project_summary) > 200 ? 'border-red-500' : ''}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Introducción (250-300 palabras) *
              <Badge variant="outline" className="ml-2">
                {getWordCount(formData.introduction)} palabras
              </Badge>
            </label>
            <Textarea
              value={formData.introduction}
              onChange={(e) => updateFormData('introduction', e.target.value)}
              placeholder="Introducción y contexto del proyecto..."
              rows={5}
              className={getWordCount(formData.introduction) < 250 || getWordCount(formData.introduction) > 300 ? 'border-red-500' : ''}
            />
          </div>

          <Separator />

          {/* Objetivos */}
          <div>
            <label className="block text-sm font-medium mb-1">Objetivo General *</label>
            <Textarea
              value={formData.general_objective}
              onChange={(e) => updateFormData('general_objective', e.target.value)}
              placeholder="Objetivo general del proyecto..."
              rows={3}
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium">Objetivos Específicos *</label>
              <Button type="button" size="sm" variant="outline" onClick={addSpecificObjective}>
                <Plus className="w-4 h-4 mr-2" />
                Agregar Objetivo
              </Button>
            </div>
            {formData.specific_objectives.map((objective, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <Textarea
                  value={objective}
                  onChange={(e) => updateSpecificObjective(index, e.target.value)}
                  placeholder={`Objetivo específico ${index + 1}...`}
                  rows={2}
                  className="flex-1"
                />
                {formData.specific_objectives.length > 1 && (
                  <Button 
                    type="button" 
                    size="sm" 
                    variant="destructive"
                    onClick={() => removeSpecificObjective(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <Separator />

          {/* Implementación */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Implementación o Metodología (máximo 1000 palabras) *
              <Badge variant="outline" className="ml-2">
                {getWordCount(formData.methodology)} palabras
              </Badge>
            </label>
            <Textarea
              value={formData.methodology}
              onChange={(e) => updateFormData('methodology', e.target.value)}
              placeholder="Describe la metodología a implementar..."
              rows={6}
              className={getWordCount(formData.methodology) > 1000 ? 'border-red-500' : ''}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Descripción de las Actividades y Cronograma (máximo 1000 palabras) *
              <Badge variant="outline" className="ml-2">
                {getWordCount(formData.activities_schedule)} palabras
              </Badge>
            </label>
            <Textarea
              value={formData.activities_schedule}
              onChange={(e) => updateFormData('activities_schedule', e.target.value)}
              placeholder="Describe las actividades y cronograma..."
              rows={6}
              className={getWordCount(formData.activities_schedule) > 1000 ? 'border-red-500' : ''}
            />
          </div>

          <Separator />

          {/* Resultados e Impacto */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Resultados (150-500 palabras) *
              <Badge variant="outline" className="ml-2">
                {getWordCount(formData.results)} palabras
              </Badge>
            </label>
            <Textarea
              value={formData.results}
              onChange={(e) => updateFormData('results', e.target.value)}
              placeholder="Resultados esperados del proyecto..."
              rows={4}
              className={getWordCount(formData.results) < 150 || getWordCount(formData.results) > 500 ? 'border-red-500' : ''}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Indicadores (150-500 palabras) *
              <Badge variant="outline" className="ml-2">
                {getWordCount(formData.indicators_text)} palabras
              </Badge>
            </label>
            <Textarea
              value={formData.indicators_text}
              onChange={(e) => updateFormData('indicators_text', e.target.value)}
              placeholder="Indicadores de medición del proyecto..."
              rows={4}
              className={getWordCount(formData.indicators_text) < 150 || getWordCount(formData.indicators_text) > 500 ? 'border-red-500' : ''}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Impacto (100-800 palabras) *
              <Badge variant="outline" className="ml-2">
                {getWordCount(formData.impact)} palabras
              </Badge>
            </label>
            <Textarea
              value={formData.impact}
              onChange={(e) => updateFormData('impact', e.target.value)}
              placeholder="Impacto esperado del proyecto..."
              rows={5}
              className={getWordCount(formData.impact) < 100 || getWordCount(formData.impact) > 800 ? 'border-red-500' : ''}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Referencias Bibliográficas</label>
            <Textarea
              value={formData.bibliography}
              onChange={(e) => updateFormData('bibliography', e.target.value)}
              placeholder="Referencias bibliográficas del proyecto..."
              rows={4}
            />
          </div>

          <Separator />

          {/* Carta de participación */}
          <div>
            <label className="block text-sm font-medium mb-1">Carta de Participación de la Institución Aliada *</label>
            <div className="space-y-2">
              <Input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                }}
              />
              {formData.participation_letter_name && (
                <div className="text-sm text-green-600">
                  Archivo subido: {formData.participation_letter_name}
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Botones de acción */}
          <div className="flex gap-4 justify-end">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => handleSubmit('draft')}
              disabled={isSubmitting}
            >
              <Save className="w-4 h-4 mr-2" />
              Guardar Borrador
            </Button>
            <Button 
              type="button"
              onClick={() => handleSubmit('submitted')}
              disabled={isSubmitting}
            >
              <Send className="w-4 h-4 mr-2" />
              Enviar Proyecto
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InternationalizationProjectForm;
