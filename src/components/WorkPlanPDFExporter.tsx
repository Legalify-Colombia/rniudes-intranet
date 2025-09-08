import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { PDFExporter } from "@/utils/pdfExporter";
import { FileDown, Printer } from "lucide-react";

interface WorkPlanPDFExporterProps {
  workPlan: any;
  assignments: any[];
  className?: string;
}

export function WorkPlanPDFExporter({ workPlan, assignments, className }: WorkPlanPDFExporterProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [isExporting, setIsExporting] = useState(false);
  const [templates, setTemplates] = useState<any[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);

  const { toast } = useToast();
  const { fetchDocumentTemplates } = useSupabaseData();

  React.useEffect(() => {
    const loadTemplates = async () => {
      if (isDialogOpen && templates.length === 0) {
        setIsLoadingTemplates(true);
        try {
          const { data } = await fetchDocumentTemplates();
          // Filtrar plantillas específicas para planes de trabajo
          const workPlanTemplates = data?.filter(template => 
            template.template_type === 'work_plan' || 
            template.name.toLowerCase().includes('plan') ||
            template.template_type === 'pdf'
          ) || [];
          setTemplates(workPlanTemplates);
        } catch (error) {
          console.error("Error loading templates:", error);
          toast({
            title: "Error",
            description: "No se pudieron cargar las plantillas",
            variant: "destructive",
          });
        } finally {
          setIsLoadingTemplates(false);
        }
      }
    };

    loadTemplates();
  }, [isDialogOpen, templates.length, fetchDocumentTemplates, toast]);

  const extractWorkPlanData = () => {
    // Organizar asignaciones por eje estratégico
    const organizedAssignments = assignments.reduce((acc, assignment) => {
      if (!assignment.product?.action?.strategic_axis) return acc;
      
      const axis = assignment.product.action.strategic_axis;
      const action = assignment.product.action;
      const product = assignment.product;
      
      if (!acc[axis.id]) {
        acc[axis.id] = {
          name: axis.name,
          code: axis.code,
          actions: {}
        };
      }
      
      if (!acc[axis.id].actions[action.id]) {
        acc[axis.id].actions[action.id] = {
          name: action.name,
          code: action.code,
          products: []
        };
      }
      
      acc[axis.id].actions[action.id].products.push({
        name: product.name,
        hours: assignment.assigned_hours || 0
      });
      
      return acc;
    }, {});

    const totalHours = assignments.reduce((sum, assignment) => sum + (assignment.assigned_hours || 0), 0);
    
    // Crear lista de productos para la plantilla
    const productsList = assignments
      .filter(a => a.assigned_hours > 0)
      .map(a => `${a.product.name}: ${a.assigned_hours}h`)
      .join(', ');

    const now = new Date();
    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    return {
      // Datos del gestor
      manager_name: workPlan.manager?.full_name || 'N/A',
      manager_email: workPlan.manager?.email || 'N/A',
      manager_position: workPlan.manager?.position || 'N/A',
      manager_weekly_hours: workPlan.manager?.weekly_hours || 0,
      manager_total_hours: workPlan.manager?.total_hours || 0,

      // Datos del programa/campus
      program_name: workPlan.manager?.program?.name || 'N/A',
      campus_name: workPlan.manager?.campus?.name || 'N/A',
      faculty_name: workPlan.manager?.faculty?.name || 'N/A',
      director_name: 'N/A', // Se podría obtener de academic_programs
      director_email: 'N/A',

      // Datos del plan de trabajo
      work_plan_title: workPlan.title || 'Plan de Trabajo',
      work_plan_type: workPlan.plan_type?.name || 'N/A',
      work_plan_objectives: workPlan.title || workPlan.objectives || 'N/A',
      work_plan_total_hours: totalHours,
      work_plan_status: workPlan.status || 'N/A',
      work_plan_submitted_date: workPlan.submitted_date ? 
        new Date(workPlan.submitted_date).toLocaleDateString('es-ES') : 'N/A',
      work_plan_approved_date: workPlan.approved_date ? 
        new Date(workPlan.approved_date).toLocaleDateString('es-ES') : 'N/A',

      // Datos de productos
      products_list: productsList,
      products_total_count: assignments.filter(a => a.assigned_hours > 0).length,
      products_completed_count: 0, // Para planes de trabajo no aplica

      // Información de ejes estratégicos (para plantillas avanzadas)
      strategic_axes_summary: Object.values(organizedAssignments)
        .map((axis: any) => `${axis.code} - ${axis.name}`)
        .join(', '),
      
      // Fechas
      current_date: now.toLocaleDateString('es-ES'),
      current_year: now.getFullYear(),
      current_month: monthNames[now.getMonth()],

      // Datos adicionales para reportes
      report_title: `Plan de Trabajo - ${workPlan.title}`,
      report_period: 'Plan de Trabajo',
      report_total_progress: 0,
      report_submitted_date: workPlan.submitted_date ? 
        new Date(workPlan.submitted_date).toLocaleDateString('es-ES') : 'N/A',
    };
  };

  const handleExport = async () => {
    if (!selectedTemplate) {
      toast({
        title: "Error",
        description: "Por favor selecciona una plantilla",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsExporting(true);
      
      const template = templates.find(t => t.id === selectedTemplate);
      if (!template) {
        throw new Error("Plantilla no encontrada");
      }

      const data = extractWorkPlanData();
      const fileName = `plan_trabajo_${workPlan.manager?.full_name?.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`;
      
      // Pequeña pausa para mostrar el estado de carga
      await new Promise(resolve => setTimeout(resolve, 500));
      
      await PDFExporter.exportToPDF(template.content, data, fileName);
      
      toast({
        title: "Éxito",
        description: "PDF generado correctamente",
      });
      
      setIsDialogOpen(false);
      setSelectedTemplate(""); // Reset template selection
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo generar el PDF",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={`flex gap-2 ${className}`}>
      <Button
        variant="outline"
        size="sm"
        onClick={handlePrint}
        className="flex items-center gap-2"
      >
        <Printer className="h-4 w-4" />
        Imprimir
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <FileDown className="h-4 w-4" />
            Generar PDF
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Exportar Plan de Trabajo a PDF</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Seleccionar Plantilla</label>
              {isLoadingTemplates ? (
                <div className="text-sm text-gray-500">Cargando plantillas...</div>
              ) : (
                <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Selecciona una plantilla" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={isExporting}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleExport}
                disabled={!selectedTemplate || isExporting}
              >
                {isExporting ? "Generando..." : "Generar PDF"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}