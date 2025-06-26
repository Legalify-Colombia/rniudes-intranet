import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { useReportPeriods } from "@/hooks/useReportPeriods";
import { useReportManagement } from "@/hooks/useReportManagement";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { FileText, Eye, CheckCircle, XCircle, Clock, Filter } from "lucide-react";

export function AdminReportManagement() {
  const { 
    fetchManagerReports,
    fetchFaculties,
    fetchCampus
  } = useSupabaseData();
  const { fetchReportPeriods } = useReportPeriods();
  const { updateManagerReport } = useReportManagement();
  const { profile } = useAuth();
  const { toast } = useToast();

  const [reports, setReports] = useState<any[]>([]);
  const [faculties, setFaculties] = useState<any[]>([]);
  const [campus, setCampus] = useState<any[]>([]);
  const [periods, setPeriods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFaculty, setSelectedFaculty] = useState("");
  const [selectedCampus, setSelectedCampus] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("");
  const [reportStatusFilter, setReportStatusFilter] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [reportsResult, facultiesResult, campusResult, periodsResult] = await Promise.all([
        fetchManagerReports(),
        fetchFaculties(),
        fetchCampus(),
        fetchReportPeriods()
      ]);

      setReports(reportsResult.data || []);
      setFaculties(facultiesResult.data || []);
      setCampus(campusResult.data || []);
      setPeriods(periodsResult.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (reportId: string, newStatus: string) => {
    try {
      await updateManagerReport(reportId, { status: newStatus });
      setReports(reports.map(report =>
        report.id === reportId ? { ...report, status: newStatus } : report
      ));
      toast({
        title: "Éxito",
        description: "Estado del reporte actualizado correctamente",
      });
    } catch (error) {
      console.error('Error updating report status:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado del reporte",
        variant: "destructive",
      });
    }
  };

  const filteredReports = reports.filter(report => {
    if (selectedFaculty && report.faculty_id !== selectedFaculty) {
      return false;
    }
    if (selectedCampus && report.campus_id !== selectedCampus) {
      return false;
    }
    if (selectedPeriod && report.report_period_id !== selectedPeriod) {
      return false;
    }
    if (reportStatusFilter && report.status !== reportStatusFilter) {
      return false;
    }
    return true;
  });

  if (loading) {
    return <div className="flex justify-center p-8">Cargando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Gestión de Reportes</h1>
        <div className="flex gap-2">
          <Select value={selectedFaculty} onValueChange={setSelectedFaculty}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por Facultad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todas las Facultades</SelectItem>
              {faculties.map(faculty => (
                <SelectItem key={faculty.id} value={faculty.id}>
                  {faculty.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedCampus} onValueChange={setSelectedCampus}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por Campus" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos los Campus</SelectItem>
              {campus.map(campus => (
                <SelectItem key={campus.id} value={campus.id}>
                  {campus.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos los Períodos</SelectItem>
              {periods.map(period => (
                <SelectItem key={period.id} value={period.id}>
                  {period.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={reportStatusFilter} onValueChange={setReportStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos los Estados</SelectItem>
              <SelectItem value="draft">Borrador</SelectItem>
              <SelectItem value="submitted">Enviado</SelectItem>
              <SelectItem value="reviewed">Revisado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Lista de Reportes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredReports.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No hay reportes que coincidan con los filtros seleccionados.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Facultad</TableHead>
                  <TableHead>Campus</TableHead>
                  <TableHead>Período</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports.map(report => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">{report.title}</TableCell>
                    <TableCell>{faculties.find(f => f.id === report.faculty_id)?.name || '-'}</TableCell>
                    <TableCell>{campus.find(c => c.id === report.campus_id)?.name || '-'}</TableCell>
                    <TableCell>{periods.find(p => p.id === report.report_period_id)?.name || '-'}</TableCell>
                    <TableCell>
                      {report.status === 'draft' && <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Borrador</Badge>}
                      {report.status === 'submitted' && <Badge><Clock className="w-3 h-3 mr-1" />Enviado</Badge>}
                      {report.status === 'reviewed' && <Badge variant="outline"><CheckCircle className="w-3 h-3 mr-1" />Revisado</Badge>}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {report.status === 'submitted' && (
                          <Button size="sm" variant="outline" onClick={() => handleStatusUpdate(report.id, 'reviewed')}>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          </Button>
                        )}
                        {report.status === 'submitted' && (
                          <Button size="sm" variant="outline" onClick={() => handleStatusUpdate(report.id, 'draft')}>
                            <XCircle className="h-4 w-4 text-red-500" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
