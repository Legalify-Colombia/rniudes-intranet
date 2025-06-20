
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
import { Plus, Trash2, Send, Save } from 'lucide-react';
import { toast } from 'sonner';

interface ReportFormData {
  project_id: string;
  report_period_id: string;
  objectives_achieved: string;
  activities_executed: string;
  activities_in_progress: string;
  project_timing: string;
  difficulties: string[];
  project_status: string;
  abnormal_reason: string;
}

const InternationalizationReportForm: React.FC = () => {
  const { profile } = useAuth();
  const [formData, setFormData] = useState<ReportFormData>({
    project_id: '',
    report_period_id: '',
    objectives_achieved: '',
    activities_executed: '',
    activities_in_progress: '',
    project_timing: '',
    difficulties: [''],
    project_status: 'normal',
    abnormal_reason: ''
  });

  const [projects, setProjects] = useState<any[]>([]);
  const [reportPeriods, setReportPeriods] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    fetchInternationalizationProjects,
    fetchReportPeriods,
    createInternationalizationReport
  } = useSupabaseData();

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    const [projectsResult, periodsResult] = await Promise.all([
      fetchInternationalizationProjects(),
      fetchReportPeriods()
    ]);

    if (projectsResult.data) {
      setProjects(projectsResult.data.filter(p => 
        p.manager_id === profile?.id && p.status === 'approved'
      ));
    }
    if (periodsResult.data) {
      setReportPeriods(periodsResult.data.filter(p => p.is_active));
    }
  };

  const updateFormData = (field: keyof ReportFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addDifficulty = () => {
    setFormData(prev => ({
      ...prev,
      difficulties: [...prev.difficulties, '']
    }));
  };

  const updateDifficulty = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      difficulties: prev.difficulties.map((diff, i) => i === index ? value : diff)
    }));
  };

  const removeDifficulty = (index: number) => {
    setFormData(prev => ({
      ...prev,
      difficulties: prev.difficulties.filter((_, i) => i !== index)
    }));
  };

  const getWordCount = (text: string) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const validateForm = (): string[] => {
    const errors: string[] = [];
    
    if (!formData.project_id) errors.push('Proyecto es requerido');
    if (!formData.report_period_id) errors.push('Período de reporte es requerido');
    
    if (formData.objectives_achieved.length < 100 || formData.objectives_achieved.length > 1000) {
      errors.push('Los objetivos alcanzados deben tener entre 100 y 1000 palabras');
    }
    
    if (formData.activities_executed.length < 100 || formData.activities_executed.length > 1000) {
      errors.push('Las actividades ejecutadas deben tener entre 100 y 1000 palabras');
    }
    
    if (formData.activities_in_progress.length < 100 || formData.activities_in_progress.length > 1000) {
      errors.push('Las actividades en progreso deben tener entre 100 y 1000 palabras');
    }

    if (!formData.project_timing) {
      errors.push('El estado del proyecto según tiempo es requerido');
    }

    if (formData.project_status === 'abnormal' && !formData.abnormal_reason) {
      errors.push('Debe especificar el motivo del estado anormal');
    }

    if (formData.abnormal_reason && formData.abnormal_reason.length > 250) {
      errors.push('El motivo del estado anormal no puede exceder 250 palabras');
    }

    const validDifficulties = formData.difficulties.filter(d => d.trim().length > 0);
    for (const difficulty of validDifficulties) {
      if (getWordCount(difficulty) > 180) {
        errors.push('Cada dificultad no puede exceder 180 palabras');
        break;
      }
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
      const reportData = {
        ...formData,
        manager_id: profile?.id || '',
        status,
        difficulties: formData.difficulties.filter(d => d.trim().length > 0),
        submitted_date: status === 'submitted' ? new Date().toISOString() : undefined
      };

      const result = await createInternationalizationReport(reportData);
      
      if (result.error) {
        toast.error('Error creando informe');
        return;
      }

      toast.success(status === 'submitted' ? 'Informe enviado exitosamente' : 'Informe guardado como borrador');
      
      // Reset form
      setFormData({
        project_id: '',
        report_period_id: '',
        objectives_achieved: '',
        activities_executed: '',
        activities_in_progress: '',
        project_timing: '',
        difficulties: [''],
        project_status: 'normal',
        abnormal_reason: ''
      });

    } catch (error) {
      toast.error('Error inesperado');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedProject = projects.find(p => p.id === formData.project_id);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Informe de Proyecto de Internacionalización</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Selección de proyecto y período */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Proyecto *</label>
              <Select value={formData.project_id} onValueChange={(value) => updateFormData('project_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar proyecto" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.project_title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Período de Reporte *</label>
              <Select value={formData.report_period_id} onValueChange={(value) => updateFormData('report_period_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar período" />
                </SelectTrigger>
                <SelectContent>
                  {reportPeriods.map((period) => (
                    <SelectItem key={period.id} value={period.id}>
                      {period.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedProject && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Información del Proyecto</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div><strong>Título:</strong> {selectedProject.project_title}</div>
                <div><strong>Duración:</strong> {selectedProject.duration_months} meses</div>
                <div><strong>Estado:</strong> {selectedProject.status}</div>
              </div>
            </div>
          )}

          <Separator />

          {/* 2. Desarrollo del Proyecto */}
          <div>
            <h3 className="text-lg font-semibold mb-4">2. Desarrollo del Proyecto</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  2.1 Objetivos Alcanzados (100-1000 palabras) *
                  <Badge variant="outline" className="ml-2">
                    {getWordCount(formData.objectives_achieved)} palabras
                  </Badge>
                </label>
                <Textarea
                  value={formData.objectives_achieved}
                  onChange={(e) => updateFormData('objectives_achieved', e.target.value)}
                  placeholder="Describe los objetivos que se han alcanzado hasta el momento..."
                  rows={5}
                  className={getWordCount(formData.objectives_achieved) < 100 || getWordCount(formData.objectives_achieved) > 1000 ? 'border-red-500' : ''}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  2.2 Actividades ejecutadas para alcanzar las metas (100-1000 palabras) *
                  <Badge variant="outline" className="ml-2">
                    {getWordCount(formData.activities_executed)} palabras
                  </Badge>
                </label>
                <Textarea
                  value={formData.activities_executed}
                  onChange={(e) => updateFormData('activities_executed', e.target.value)}
                  placeholder="Describe las actividades que se han ejecutado..."
                  rows={5}
                  className={getWordCount(formData.activities_executed) < 100 || getWordCount(formData.activities_executed) > 1000 ? 'border-red-500' : ''}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  2.3 Actividades en proceso y fechas planeadas (100-1000 palabras) *
                  <Badge variant="outline" className="ml-2">
                    {getWordCount(formData.activities_in_progress)} palabras
                  </Badge>
                </label>
                <Textarea
                  value={formData.activities_in_progress}
                  onChange={(e) => updateFormData('activities_in_progress', e.target.value)}
                  placeholder="Describe las actividades en proceso e incluye las fechas planeadas..."
                  rows={5}
                  className={getWordCount(formData.activities_in_progress) < 100 || getWordCount(formData.activities_in_progress) > 1000 ? 'border-red-500' : ''}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* 3. Avance del Proyecto */}
          <div>
            <h3 className="text-lg font-semibold mb-4">3. Avance del Proyecto</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  De acuerdo con el tiempo de ejecución, el proyecto se encuentra *
                </label>
                <Select value={formData.project_timing} onValueChange={(value) => updateFormData('project_timing', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ahead">Adelantado</SelectItem>
                    <SelectItem value="on_time">A Tiempo</SelectItem>
                    <SelectItem value="delayed">Atrasado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium">
                    Dificultades identificadas que afectaron el desarrollo del proyecto (máximo 180 palabras cada una)
                  </label>
                  <Button type="button" size="sm" variant="outline" onClick={addDifficulty}>
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar Dificultad
                  </Button>
                </div>
                {formData.difficulties.map((difficulty, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">Dificultad {index + 1}</span>
                        <Badge variant="outline" className="text-xs">
                          {getWordCount(difficulty)} palabras
                        </Badge>
                      </div>
                      <Textarea
                        value={difficulty}
                        onChange={(e) => updateDifficulty(index, e.target.value)}
                        placeholder={`Describe la dificultad ${index + 1}...`}
                        rows={3}
                        className={getWordCount(difficulty) > 180 ? 'border-red-500' : ''}
                      />
                    </div>
                    {formData.difficulties.length > 1 && (
                      <Button 
                        type="button" 
                        size="sm" 
                        variant="destructive"
                        onClick={() => removeDifficulty(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  En qué estado se encuentra el proyecto actualmente *
                </label>
                <Select value={formData.project_status} onValueChange={(value) => updateFormData('project_status', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="abnormal">Anormal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.project_status === 'abnormal' && (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Especificar motivo del estado anormal (máximo 250 palabras) *
                    <Badge variant="outline" className="ml-2">
                      {getWordCount(formData.abnormal_reason)} palabras
                    </Badge>
                  </label>
                  <Textarea
                    value={formData.abnormal_reason}
                    onChange={(e) => updateFormData('abnormal_reason', e.target.value)}
                    placeholder="Explica por qué el proyecto se encuentra en estado anormal..."
                    rows={3}
                    className={getWordCount(formData.abnormal_reason) > 250 ? 'border-red-500' : ''}
                  />
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* 4. Responsabilidad */}
          <div>
            <h3 className="text-lg font-semibold mb-2">4. Responsabilidad</h3>
            <p className="text-sm text-gray-600">
              El gestor de internacionalización se compromete a la veracidad de la información reportada 
              y al cumplimiento de los objetivos establecidos en el proyecto.
            </p>
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
              Enviar Informe
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InternationalizationReportForm;
