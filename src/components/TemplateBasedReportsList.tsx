
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { FileText, Calendar, Eye, Edit3, Trash2, Send, Clock, CheckCircle } from "lucide-react";

interface TemplateBasedReportsListProps {
  reports: any[];
  onEditReport: (report: any) => void;
  onDeleteReport?: (reportId: string) => void;
  showDeleteButton?: boolean;
}

export function TemplateBasedReportsList({ 
  reports, 
  onEditReport, 
  onDeleteReport,
  showDeleteButton = false 
}: TemplateBasedReportsListProps) {
  const { profile } = useAuth();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return (
          <Badge variant="secondary">
            <Clock className="w-3 h-3 mr-1" />
            Borrador
          </Badge>
        );
      case 'submitted':
        return (
          <Badge variant="default">
            <Send className="w-3 h-3 mr-1" />
            Enviado
          </Badge>
        );
      case 'reviewed':
        return (
          <Badge variant="default" className="bg-green-600">
            <CheckCircle className="w-3 h-3 mr-1" />
            Revisado
          </Badge>
        );
      default:
        return <Badge variant="outline">Sin estado</Badge>;
    }
  };

  const canEdit = (report: any) => {
    return report.manager_id === profile?.id && report.status === 'draft';
  };

  const canDelete = (report: any) => {
    return showDeleteButton && (
      profile?.role === 'Administrador' || 
      profile?.role === 'Coordinador' ||
      (report.manager_id === profile?.id && report.status === 'draft')
    );
  };

  if (reports.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No hay informes basados en plantillas</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {reports.map((report) => (
        <Card key={report.id} className="hover:bg-gray-50">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-medium">{report.title}</h3>
                  {getStatusBadge(report.status)}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600 mb-2">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span>Plantilla: {report.template_name}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Período: {report.period_name}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Creado: {new Date(report.created_at).toLocaleDateString()}</span>
                  </div>
                  
                  {report.submitted_date && (
                    <div className="flex items-center gap-2">
                      <Send className="h-4 w-4" />
                      <span>Enviado: {new Date(report.submitted_date).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                {report.description && (
                  <p className="text-sm text-gray-600 mb-2">{report.description}</p>
                )}

                {showDeleteButton && (
                  <div className="text-xs text-gray-500">
                    Gestor: {report.manager_name} ({report.manager_email})
                  </div>
                )}
              </div>

              <div className="flex gap-2 ml-4">
                <Button
                  variant={canEdit(report) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onEditReport(report)}
                >
                  {canEdit(report) ? (
                    <>
                      <Edit3 className="h-4 w-4 mr-2" />
                      Editar
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-2" />
                      Ver
                    </>
                  )}
                </Button>

                {canDelete(report) && onDeleteReport && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDeleteReport(report.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
