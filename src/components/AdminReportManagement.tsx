
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { FileText, Eye, Clock, CheckCircle, Send, AlertCircle, Filter } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EditableReportForm } from "./EditableReportForm";

export function AdminReportManagement() {
  const { 
    fetchManagerReports,
    fetchReportPeriods,
    fetchCampus,
    fetchFaculties,
    fetchAcademicPrograms,
    updateManagerReport
  } = useSupabaseData();
  const { profile } = useAuth();
  const { toast } = useToast();
  
  const [reports, setReports] = useState<any[]>([]);
  const [reportPeriods, setReportPeriods] = useState<any[]>([]);
  const [campuses, setCampuses] = useState<any[]>([]);
  const [faculties, setFaculties] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailFormOpen, setDetailFormOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  
  // Filtros
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');
  const [selectedCampus, setSelectedCampus] = useState<string>('all');
  const [selectedFaculty, setSelectedFaculty] = useState<string>('all');
  const [selectedProgram, setSelectedProgram] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  useEffect(() => {
    if (profile?.role === 'Administrador' || profile?.role === 'Coordinador') {
      loadData();
    }
  }, [profile]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [reportsResult, periodsResult, campusResult, facultiesResult, programsResult] = await Promise.all([
        fetchManagerReports(),
        fetchReportPeriods(),
        fetchCampus(),
        fetchFaculties(),
        fetchAcademicPrograms()
      ]);

      setReports(reportsResult.data || []);
      setReportPeriods(periodsResult.data || []);
      setCampuses(campusResult.data || []);
      setFaculties(facultiesResult.data || []);
      setPrograms(programsResult.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los informes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Borrador</Badge>;
      case 'submitted':
        return <Badge variant="default"><Send className="w-3 h-3 mr-1" />Enviado</Badge>;
      case 'reviewed':
        return <Badge variant="default" className="bg-green-600"><CheckCircle className="w-3 h-3 mr-1" />Revisado</Badge>;
      default:
        return <Badge variant="outline">Sin estado</Badge>;
    }
  };

  const markAsReviewed = async (reportId: string) => {
    try {
      await updateManagerReport(reportId, { status: 'reviewed' });
      toast({
        title: "Éxito",
        description: "Informe marcado como revisado",
      });
      loadData();
    } catch (error) {
      console.error('Error updating report:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el informe",
        variant: "destructive",
      });
    }
  };

  const openDetailForm = (report: any) => {
    setSelectedReport(report);
    setDetailFormOpen(true);
  };

  const handleDetailFormSave = () => {
    setDetailFormOpen(false);
    setSelectedReport(null);
    loadData();
  };

  // Filtrar informes
  const filteredReports = reports.filter(report => {
    if (selectedPeriod !== 'all' && report.report_period_id !== selectedPeriod) return false;
    if (selectedStatus !== 'all' && report.status !== selectedStatus) return false;
    
    // Filtros por campus, facultad y programa a través del work_plan
    const workPlan = report.work_plan;
    if (!workPlan) return true;
    
    const program = programs.find(p => p.id === workPlan.program_id);
    if (!program) return true;
    
    const faculty = faculties.find(f => f.id === program.faculty_id);
    const campus = campuses.find(c => c.id === program.campus_id);
    
    if (selectedProgram !== 'all' && program.id !== selectedProgram) return false;
    if (selectedFaculty !== 'all' && faculty?.id !== selectedFaculty) return false;
    if (selectedCampus !== 'all' && campus?.id !== selectedCampus) return false;
    
    return true;
  });

  // Verificar permisos del usuario
  if (!profile) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Cargando información del usuario...
        </AlertDescription>
      </Alert>
    );
  }

  if (profile.role !== 'Administrador' && profile.role !== 'Coordinador') {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No tienes permisos para acceder a esta sección. Solo los administradores y coordinadores pueden gestionar informes.
        </AlertDescription>
      </Alert>
    );
  }

  if (loading) {
    return <div className="flex justify-center p-8">Cargando informes...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Gestión de Informes</h1>
        <Badge variant="outline">
          {filteredReports.length} de {reports.length} informes
        </Badge>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Label>Período</Label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los períodos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los períodos</SelectItem>
                  {reportPeriods.map(period => (
                    <SelectItem key={period.id} value={period.id}>
                      {period.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Estado</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="draft">Borrador</SelectItem>
                  <SelectItem value="submitted">Enviado</SelectItem>
                  <SelectItem value="reviewed">Revisado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Campus</Label>
              <Select value={selectedCampus} onValueChange={setSelectedCampus}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los campus" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los campus</SelectItem>
                  {campuses.map(campus => (
                    <SelectItem key={campus.id} value={campus.id}>
                      {campus.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Facultad</Label>
              <Select value={selectedFaculty} onValueChange={setSelectedFaculty}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas las facultades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las facultades</SelectItem>
                  {faculties.map(faculty => (
                    <SelectItem key={faculty.id} value={faculty.id}>
                      {faculty.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Programa</Label>
              <Select value={selectedProgram} onValueChange={setSelectedProgram}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los programas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los programas</SelectItem>
                  {programs.map(program => (
                    <SelectItem key={program.id} value={program.id}>
                      {program.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Informes de Gestores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Gestor</TableHead>
                <TableHead>Programa</TableHead>
                <TableHead>Campus</TableHead>
                <TableHead>Período</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Progreso</TableHead>
                <TableHead>Completitud</TableHead>
                <TableHead>Fecha Envío</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReports.map((report) => {
                const workPlan = report.work_plan;
                const program = programs.find(p => p.id === workPlan?.program_id);
                const faculty = faculties.find(f => f.id === program?.faculty_id);
                const campus = campuses.find(c => c.id === program?.campus_id);
                
                return (
                  <TableRow key={report.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{report.manager?.full_name}</div>
                        <div className="text-sm text-gray-500">{report.manager?.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{program?.name}</div>
                        <div className="text-sm text-gray-500">{faculty?.name}</div>
                      </div>
                    </TableCell>
                    <TableCell>{campus?.name}</TableCell>
                    <TableCell>{report.report_period?.name}</TableCell>
                    <TableCell>{report.title}</TableCell>
                    <TableCell>{getStatusBadge(report.status)}</TableCell>
                    <TableCell>
                      {report.total_progress_percentage ? (
                        <div className="flex items-center gap-2">
                          <Progress value={report.total_progress_percentage} className="w-16" />
                          <span className="text-sm">{report.total_progress_percentage.toFixed(1)}%</span>
                        </div>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      {report.completion_percentage ? (
                        <div className="flex items-center gap-2">
                          <Progress 
                            value={report.completion_percentage} 
                            className={`w-16 ${
                              report.completion_percentage >= 70 ? '[&_.bg-primary]:bg-green-600' : 
                              report.completion_percentage >= 50 ? '[&_.bg-primary]:bg-yellow-600' : '[&_.bg-primary]:bg-red-600'
                            }`}
                          />
                          <span className="text-sm">{report.completion_percentage.toFixed(1)}%</span>
                          {report.requires_improvement_plan && (
                            <Badge variant="destructive" className="text-xs">
                              Plan mejora
                            </Badge>
                          )}
                        </div>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      {report.submitted_date ? 
                        new Date(report.submitted_date).toLocaleDateString('es-ES') : 
                        '-'
                      }
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => openDetailForm(report)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Ver
                        </Button>
                        {report.status === 'submitted' && (
                          <Button 
                            size="sm" 
                            onClick={() => markAsReviewed(report.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Revisar
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {filteredReports.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No se encontraron informes con los filtros seleccionados
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={detailFormOpen} onOpenChange={setDetailFormOpen}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedReport?.title || 'Detalle del Informe'}
            </DialogTitle>
          </DialogHeader>
          {selectedReport && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Gestor</Label>
                  <div className="mt-1 text-sm font-medium">{selectedReport.manager?.full_name}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Estado</Label>
                  <div className="mt-1">{getStatusBadge(selectedReport.status)}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Período</Label>
                  <div className="mt-1 text-sm">{selectedReport.report_period?.name}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Fecha de Envío</Label>
                  <div className="mt-1 text-sm">
                    {selectedReport.submitted_date 
                      ? new Date(selectedReport.submitted_date).toLocaleDateString('es-ES')
                      : 'No enviado'
                    }
                  </div>
                </div>
              </div>

              <EditableReportForm
                reportId={selectedReport.id}
                workPlanId={selectedReport.work_plan_id}
                reportStatus={selectedReport.status}
                isReadOnly={true}
                onSave={handleDetailFormSave}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
