
import React, { useEffect, useState } from "react";
import { AdminReportManagement } from "./AdminReportManagement";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, User, Clock, CheckCircle } from "lucide-react";

export function ManagerReports() {
  const { profile } = useAuth();
  const [managerData, setManagerData] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.position === 'Director de Programa') {
      loadProgramManagerData();
    }
  }, [profile]);

  const loadProgramManagerData = async () => {
    try {
      // Buscar el programa académico donde este usuario es coordinador
      const { data: programData } = await supabase
        .from('academic_programs')
        .select(`
          id,
          name,
          manager_id,
          profiles:manager_id (
            id,
            full_name,
            email,
            position
          )
        `)
        .eq('coordinador_id', profile.id)
        .single();

      if (programData && programData.profiles) {
        setManagerData(programData.profiles);
        
        // Cargar reportes del gestor
        const { data: reportsData } = await supabase
          .from('manager_reports')
          .select(`
            *,
            report_periods (name, start_date, end_date)
          `)
          .eq('manager_id', programData.manager_id)
          .order('created_at', { ascending: false });

        setReports(reportsData || []);
      }
    } catch (error) {
      console.error('Error loading program manager data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Si es director de programa, mostrar vista específica
  if (profile?.position === 'Director de Programa') {
    if (loading) {
      return (
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Informes de Mi Gestor</h1>
            <p className="text-gray-600">Seguimiento a los informes de tu gestor asignado</p>
          </div>
        </div>

        {managerData ? (
          <div className="grid gap-6">
            {/* Información del gestor */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Información del Gestor
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Nombre</p>
                    <p className="text-lg font-semibold">{managerData.full_name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="text-lg">{managerData.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Cargo</p>
                    <p className="text-lg">{managerData.position}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lista de reportes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Reportes del Gestor ({reports.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {reports.length > 0 ? (
                  <div className="space-y-4">
                    {reports.map((report) => (
                      <div key={report.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{report.title}</h3>
                            <p className="text-sm text-gray-600 mt-1">{report.description || 'Sin descripción'}</p>
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {new Date(report.created_at).toLocaleDateString()}
                              </span>
                              {report.report_periods && (
                                <span>Período: {report.report_periods.name}</span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              report.status === 'submitted' 
                                ? 'bg-blue-100 text-blue-800'
                                : report.status === 'draft'
                                ? 'bg-gray-100 text-gray-800' 
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {report.status === 'submitted' ? 'Enviado' : 
                               report.status === 'draft' ? 'Borrador' : 'Finalizado'}
                            </span>
                            {report.total_progress_percentage !== null && (
                              <span className="text-sm font-medium text-gray-700">
                                {Math.round(report.total_progress_percentage)}%
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No hay reportes disponibles</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-8">
              <User className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No se encontró gestor asignado</h3>
              <p className="text-gray-600">No tienes un gestor asignado a tu programa académico.</p>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Para administradores y coordinadores de campus, mostrar la vista completa
  return <AdminReportManagement />;
}
