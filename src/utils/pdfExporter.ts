
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface ExportData {
  // Datos del gestor
  manager_name?: string;
  manager_email?: string;
  manager_position?: string;
  manager_weekly_hours?: number;
  manager_total_hours?: number;
  
  // Datos del programa
  program_name?: string;
  campus_name?: string;
  faculty_name?: string;
  director_name?: string;
  director_email?: string;
  
  // Datos del plan de trabajo
  work_plan_objectives?: string;
  work_plan_total_hours?: number;
  work_plan_status?: string;
  work_plan_submitted_date?: string;
  work_plan_approved_date?: string;
  
  // Datos del informe
  report_title?: string;
  report_period?: string;
  report_total_progress?: number;
  report_submitted_date?: string;
  
  // Datos de productos
  products_list?: string;
  products_total_count?: number;
  products_completed_count?: number;
  
  // Fechas
  current_date?: string;
  current_year?: number;
  current_month?: string;
}

export class PDFExporter {
  private static replacePlaceholders(template: string, data: ExportData): string {
    let content = template;
    
    // Reemplazar todos los placeholders
    Object.entries(data).forEach(([key, value]) => {
      const placeholder = `<${key}>`;
      const replacement = value?.toString() || '';
      content = content.replace(new RegExp(placeholder, 'g'), replacement);
    });
    
    // Agregar fechas automáticas si no se proporcionaron
    const now = new Date();
    if (!data.current_date) {
      content = content.replace(/<current_date>/g, now.toLocaleDateString('es-ES'));
    }
    if (!data.current_year) {
      content = content.replace(/<current_year>/g, now.getFullYear().toString());
    }
    if (!data.current_month) {
      content = content.replace(/<current_month>/g, now.toLocaleDateString('es-ES', { month: 'long' }));
    }
    
    return content;
  }

  public static async exportToPDF(
    templateContent: string,
    data: ExportData,
    fileName: string = 'documento.pdf'
  ): Promise<void> {
    try {
      // Reemplazar placeholders
      const processedContent = this.replacePlaceholders(templateContent, data);
      
      // Crear elemento temporal para renderizar el contenido
      const tempDiv = document.createElement('div');
      tempDiv.style.cssText = `
        position: absolute;
        top: -9999px;
        left: -9999px;
        width: 794px;
        padding: 40px;
        font-family: Arial, sans-serif;
        font-size: 12px;
        line-height: 1.6;
        color: #333;
        background: white;
      `;
      
      // Convertir saltos de línea y formatear el texto
      tempDiv.innerHTML = processedContent
        .replace(/\n/g, '<br>')
        .replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;');
      
      document.body.appendChild(tempDiv);
      
      // Generar canvas del contenido
      const canvas = await html2canvas(tempDiv, {
        width: 794,
        height: tempDiv.scrollHeight,
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      
      // Remover elemento temporal
      document.body.removeChild(tempDiv);
      
      // Crear PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      
      let position = 0;
      
      // Agregar primera página
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      // Agregar páginas adicionales si es necesario
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      // Descargar el PDF
      pdf.save(fileName);
      
    } catch (error) {
      console.error('Error al exportar PDF:', error);
      throw new Error('Error al generar el documento PDF');
    }
  }

  public static extractDataFromWorkPlan(workPlan: any, manager: any, program: any): ExportData {
    return {
      // Datos del gestor
      manager_name: manager?.full_name,
      manager_email: manager?.email,
      manager_position: manager?.position,
      manager_weekly_hours: manager?.weekly_hours,
      manager_total_hours: manager?.total_hours,
      
      // Datos del programa
      program_name: program?.name,
      campus_name: program?.campus?.name,
      faculty_name: program?.faculty?.name,
      director_name: program?.director_name,
      director_email: program?.director_email,
      
      // Datos del plan de trabajo
      work_plan_objectives: workPlan?.objectives,
      work_plan_total_hours: workPlan?.total_hours_assigned,
      work_plan_status: workPlan?.status,
      work_plan_submitted_date: workPlan?.submitted_date ? 
        new Date(workPlan.submitted_date).toLocaleDateString('es-ES') : undefined,
      work_plan_approved_date: workPlan?.approved_date ? 
        new Date(workPlan.approved_date).toLocaleDateString('es-ES') : undefined,
    };
  }

  public static extractDataFromReport(report: any, workPlan: any, products?: any[]): ExportData {
    const workPlanData = this.extractDataFromWorkPlan(
      workPlan, 
      report?.manager || workPlan?.manager, 
      workPlan?.program
    );
    
    // Generar lista de productos
    let productsList = '';
    let completedCount = 0;
    
    if (products && products.length > 0) {
      productsList = products.map((product, index) => {
        const progress = product.progress_percentage || 0;
        if (progress >= 100) completedCount++;
        return `${index + 1}. ${product.product?.name || product.name} - ${progress}% completado`;
      }).join('\n');
    }
    
    return {
      ...workPlanData,
      
      // Datos del informe
      report_title: report?.title,
      report_period: report?.report_period?.name,
      report_total_progress: report?.total_progress_percentage,
      report_submitted_date: report?.submitted_date ? 
        new Date(report.submitted_date).toLocaleDateString('es-ES') : undefined,
      
      // Datos de productos
      products_list: productsList,
      products_total_count: products?.length || 0,
      products_completed_count: completedCount,
    };
  }
}
