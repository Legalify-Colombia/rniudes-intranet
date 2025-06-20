
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { FileText, Plus, Calendar, AlertTriangle } from "lucide-react";

interface TemplateBasedReportSelectorProps {
  onReportCreated: () => void;
  existingReports: any[];
}

export function TemplateBasedReportSelector({ 
  onReportCreated, 
  existingReports 
}: TemplateBasedReportSelectorProps) {
  const { profile } = useAuth();
  const { toast } = useToast();
  const {
    fetchReportTemplates,
    fetchReportPeriods,
    createTemplateBasedReport
  } = useSupabaseData();

  const [templates, setTemplates] = useState<any[]>([]);
  const [periods, setPeriods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [templatesResult, periodsResult] = await Promise.all([
        fetchReportTemplates(),
        fetchReportPeriods()
      ]);

      // Filter templates with valid IDs
      if (templatesResult.data) {
        const validTemplates = templatesResult.data.filter(template => 
          template.id && 
          typeof template.id === 'string' && 
          template.id.trim().length > 0
        );
        setTemplates(validTemplates);
      }

      // Filter periods with valid IDs
      if (periodsResult.data) {
        const validPeriods = periodsResult.data.filter(period => 
          period.id && 
          typeof period.id === 'string' && 
          period.id.trim().length > 0
        );
        setPeriods(validPeriods);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las plantillas y períodos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getAvailableTemplates = () => {
    if (!selectedPeriod) return templates;
    
    return templates.filter(template => {
      // Verificar si ya existe un informe para esta plantilla en el período seleccionado
      const existingReport = existingReports.find(report => 
        report.report_template_id === template.id && 
        report.report_period_id === selectedPeriod
      );
      return !existingReport;
    });
  };

  const handleCreateReport = async () => {
    if (!profile?.id || !selectedTemplate || !selectedPeriod || !title.trim()) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive",
      });
      return;
    }

    setCreating(true);
    try {
      const reportData = {
        manager_id: profile.id,
        report_template_id: selectedTemplate,
        report_period_id: selectedPeriod,
        title: title.trim(),
        description: description.trim() || undefined
      };

      const result = await createTemplateBasedReport(reportData);
      
      if (result.error) {
        throw result.error;
      }

      toast({
        title: "Éxito",
        description: "Informe basado en plantilla creado correctamente",
      });

      // Limpiar formulario
      setSelectedTemplate("");
      setSelectedPeriod("");
      setTitle("");
      setDescription("");
      
      onReportCreated();
    } catch (error: any) {
      console.error('Error creating template-based report:', error);
      
      if (error.code === '23505') {
        toast({
          title: "Error",
          description: "Ya existe un informe para esta plantilla en el período seleccionado",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "No se pudo crear el informe",
          variant: "destructive",
        });
      }
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const availableTemplates = getAvailableTemplates();
  const selectedTemplateData = templates.find(t => t.id === selectedTemplate);
  const selectedPeriodData = periods.find(p => p.id === selectedPeriod);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Crear Informe Basado en Plantilla
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {templates.length === 0 && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              No hay plantillas de informes disponibles. Contacta con el administrador para crear plantillas.
            </AlertDescription>
          </Alert>
        )}

        {periods.length === 0 && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              No hay períodos de reporte activos. Contacta con el administrador para configurar períodos.
            </AlertDescription>
          </Alert>
        )}

        {templates.length > 0 && periods.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Período de Reporte *
                </label>
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar período" />
                  </SelectTrigger>
                  <SelectContent>
                    {periods
                      .filter(period => 
                        period.id && 
                        typeof period.id === 'string' && 
                        period.id.trim().length > 0
                      )
                      .map((period) => (
                        <SelectItem key={period.id} value={period.id}>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{period.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {new Date(period.start_date).toLocaleDateString()} - {new Date(period.end_date).toLocaleDateString()}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Plantilla de Informe *
                </label>
                <Select 
                  value={selectedTemplate} 
                  onValueChange={setSelectedTemplate}
                  disabled={!selectedPeriod}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar plantilla" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTemplates
                      .filter(template => 
                        template.id && 
                        typeof template.id === 'string' && 
                        template.id.trim().length > 0
                      )
                      .map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            <span>{template.name}</span>
                          </div>
                        </SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>
                {selectedPeriod && availableTemplates.length === 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    No hay plantillas disponibles para este período (ya tienes informes creados para todas las plantillas)
                  </p>
                )}
              </div>
            </div>

            {selectedTemplateData && (
              <Alert className="bg-blue-50 border-blue-200">
                <FileText className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  <strong>Plantilla seleccionada:</strong> {selectedTemplateData.description || selectedTemplateData.name}
                </AlertDescription>
              </Alert>
            )}

            <div>
              <label className="text-sm font-medium mb-2 block">
                Título del Informe *
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Título descriptivo para el informe"
                disabled={!selectedTemplate}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Descripción (opcional)
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descripción adicional del informe"
                disabled={!selectedTemplate}
                rows={3}
              />
            </div>

            <div className="flex justify-end">
              <Button
                onClick={handleCreateReport}
                disabled={creating || !selectedTemplate || !selectedPeriod || !title.trim()}
              >
                {creating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Creando...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Informe
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
