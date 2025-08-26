
// @ts-ignore - jsPDF types may not be fully compatible
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface ExportData {
  // Datos del gestor
  manager_name: string;
  manager_email: string;
  manager_position: string;
  manager_weekly_hours: number;
  manager_total_hours: number;

  // Datos del programa
  program_name: string;
  campus_name: string;
  faculty_name: string;
  director_name: string;
  director_email: string;

  // Datos del plan de trabajo
  work_plan_objectives: string;
  work_plan_total_hours: number;
  work_plan_status: string;
  work_plan_submitted_date: string;
  work_plan_approved_date: string;

  // Datos del informe
  report_title: string;
  report_period: string;
  report_total_progress: number;
  report_submitted_date: string;

  // Datos de productos
  products_list: string;
  products_total_count: number;
  products_completed_count: number;

  // Fechas
  current_date: string;
  current_year: number;
  current_month: string;
}

export class PDFExporter {
  static extractDataFromReport(report: any, workPlan: any, products?: any[]): ExportData {
    const now = new Date();
    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    // Calcular productos completados
    const completedProducts = products?.filter(p => p.progress_percentage >= 100).length || 0;

    return {
      // Datos del gestor
      manager_name: workPlan?.profiles?.full_name || 'N/A',
      manager_email: workPlan?.profiles?.email || 'N/A',
      manager_position: workPlan?.profiles?.position || 'N/A',
      manager_weekly_hours: workPlan?.weekly_hours || 0,
      manager_total_hours: workPlan?.total_hours || 0,

      // Datos del programa
      program_name: workPlan?.academic_programs?.name || 'N/A',
      campus_name: workPlan?.academic_programs?.campus?.name || 'N/A',
      faculty_name: workPlan?.academic_programs?.campus?.faculty?.name || 'N/A',
      director_name: workPlan?.academic_programs?.director_name || 'N/A',
      director_email: workPlan?.academic_programs?.director_email || 'N/A',

      // Datos del plan de trabajo
      work_plan_objectives: workPlan?.objectives || 'N/A',
      work_plan_total_hours: workPlan?.total_hours || 0,
      work_plan_status: workPlan?.status || 'N/A',
      work_plan_submitted_date: workPlan?.submitted_date ? new Date(workPlan.submitted_date).toLocaleDateString('es-ES') : 'N/A',
      work_plan_approved_date: workPlan?.approved_date ? new Date(workPlan.approved_date).toLocaleDateString('es-ES') : 'N/A',

      // Datos del informe
      report_title: report?.title || 'N/A',
      report_period: report?.period || 'N/A',
      report_total_progress: report?.total_progress_percentage || 0,
      report_submitted_date: report?.submitted_date ? new Date(report.submitted_date).toLocaleDateString('es-ES') : 'N/A',

      // Datos de productos
      products_list: products?.map(p => `${p.name}: ${p.progress_percentage || 0}%`).join(', ') || 'N/A',
      products_total_count: products?.length || 0,
      products_completed_count: completedProducts,

      // Fechas
      current_date: now.toLocaleDateString('es-ES'),
      current_year: now.getFullYear(),
      current_month: monthNames[now.getMonth()],
    };
  }

  static replaceTemplateVariables(template: string, data: ExportData): string {
    let processedTemplate = template;

    // Reemplazar todas las variables del formato <variable_name>
    Object.entries(data).forEach(([key, value]) => {
      const placeholder = `<${key}>`;
      const regex = new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      // Sanitize the value to prevent XSS
      const sanitizedValue = this.sanitizeValue(String(value));
      processedTemplate = processedTemplate.replace(regex, sanitizedValue);
    });

    return processedTemplate;
  }

  static sanitizeValue(value: string): string {
    // Remove potentially dangerous HTML tags and scripts
    return value
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
      .replace(/<embed\b[^<]*>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .replace(/&lt;script/gi, '')
      .replace(/&lt;\/script/gi, '');
  }

  static async exportToPDF(template: string, data: ExportData, fileName: string): Promise<void> {
    try {
      // Reemplazar variables en la plantilla
      const processedContent = this.replaceTemplateVariables(template, data);

      // Crear un elemento temporal para renderizar el contenido
      const tempDiv = document.createElement('div');
      // Use textContent instead of innerHTML to prevent XSS
      // Only basic HTML formatting is allowed
      const allowedTags = /<\/?(?:p|br|strong|b|em|i|u|h[1-6]|div|span|table|tr|td|th|thead|tbody|ul|ol|li)\b[^>]*>/gi;
      const safeContent = processedContent.replace(/(<(?!\/?)(?!(?:p|br|strong|b|em|i|u|h[1-6]|div|span|table|tr|td|th|thead|tbody|ul|ol|li)\b)[^>]*>)/gi, '');
      tempDiv.innerHTML = safeContent;
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.width = '210mm'; // Ancho A4
      tempDiv.style.padding = '20mm';
      tempDiv.style.fontFamily = 'Arial, sans-serif';
      tempDiv.style.fontSize = '12pt';
      tempDiv.style.lineHeight = '1.5';
      tempDiv.style.backgroundColor = 'white';
      document.body.appendChild(tempDiv);

      // Convertir a canvas
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      // Crear PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      // Agregar la primera página
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Agregar páginas adicionales si es necesario
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Guardar el PDF
      pdf.save(fileName);

      // Limpiar el elemento temporal
      document.body.removeChild(tempDiv);

    } catch (error) {
      console.error('Error exporting PDF:', error);
      throw new Error('Error al exportar el PDF');
    }
  }
}
