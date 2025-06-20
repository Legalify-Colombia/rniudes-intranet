
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseData, DocumentTemplate } from "@/hooks/useSupabaseData";
import { PDFExporter, ExportData } from "@/utils/pdfExporter";
import { Download, FileText } from "lucide-react";

interface ReportExporterProps {
  report: any;
  workPlan: any;
  products?: any[];
  className?: string;
}

export function ReportExporter({ report, workPlan, products, className }: ReportExporterProps) {
  const [documentTemplates, setDocumentTemplates] = useState<DocumentTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const { fetchDocumentTemplates } = useSupabaseData();

  useEffect(() => {
    loadDocumentTemplates();
  }, []);

  const loadDocumentTemplates = async () => {
    const { data, error } = await fetchDocumentTemplates();
    if (error) {
      console.error("Error loading document templates:", error);
    } else {
      setDocumentTemplates(data || []);
    }
  };

  const handleExport = async () => {
    if (!selectedTemplateId) {
      toast({
        title: "Error",
        description: "Por favor selecciona una plantilla",
        variant: "destructive",
      });
      return;
    }

    const selectedTemplate = documentTemplates.find(t => t.id === selectedTemplateId);
    if (!selectedTemplate) {
      toast({
        title: "Error",
        description: "Plantilla no encontrada",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);
    try {
      // Extraer datos del informe y plan de trabajo
      const exportData: ExportData = PDFExporter.extractDataFromReport(report, workPlan, products);
      
      // Generar nombre del archivo
      const fileName = `${report.title || 'Informe'}_${new Date().toISOString().split('T')[0]}.pdf`;
      
      // Exportar PDF
      await PDFExporter.exportToPDF(selectedTemplate.template_content, exportData, fileName);
      
      toast({
        title: "Éxito",
        description: "Documento exportado correctamente",
      });
      
      setIsDialogOpen(false);
      setSelectedTemplateId("");
      
    } catch (error) {
      console.error("Error exporting document:", error);
      toast({
        title: "Error",
        description: "No se pudo exportar el documento",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  if (documentTemplates.length === 0) {
    return null;
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className={className}>
          <Download className="w-4 h-4 mr-2" />
          Exportar PDF
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Exportar Informe a PDF
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="template-select">Seleccionar Plantilla</Label>
            <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una plantilla PDF" />
              </SelectTrigger>
              <SelectContent>
                {documentTemplates
                  .filter(template => template.template_type === 'pdf')
                  .map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              onClick={() => setIsDialogOpen(false)}
              disabled={isExporting}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleExport}
              disabled={!selectedTemplateId || isExporting}
              className="institutional-gradient text-white"
            >
              {isExporting ? "Exportando..." : "Exportar PDF"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
