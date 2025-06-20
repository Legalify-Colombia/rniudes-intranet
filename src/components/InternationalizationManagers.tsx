
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { Eye, Users } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function InternationalizationManagers() {
  const [managers, setManagers] = useState<any[]>([]);
  const [selectedManager, setSelectedManager] = useState<any | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { profile } = useAuth();
  const { toast } = useToast();
  const { fetchManagersByCampus } = useSupabaseData();

  useEffect(() => {
    loadManagers();
  }, []);

  const loadManagers = async () => {
    try {
      setIsLoading(true);
      
      let campusIds: string[] | undefined;
      if (profile?.role === 'Administrador' && profile.managed_campus_ids) {
        campusIds = profile.managed_campus_ids;
      }

      const result = await fetchManagersByCampus(campusIds);
      if (result.error) {
        console.error("Error loading managers:", result.error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los gestores",
          variant: "destructive",
        });
      } else {
        console.log("Managers data:", result.data);
        setManagers(result.data || []);
      }
    } catch (error) {
      console.error("Error loading managers:", error);
      toast({
        title: "Error",
        description: "Error inesperado al cargar los gestores",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openManagerDetails = (manager: any) => {
    setSelectedManager(manager);
    setIsDetailsDialogOpen(true);
  };

  const getStatusBadge = (manager: any) => {
    const hasHours = manager.weekly_hours && manager.number_of_weeks;
    return hasHours ? (
      <Badge variant="default" className="bg-green-600">Configurado</Badge>
    ) : (
      <Badge variant="secondary">Sin configurar</Badge>
    );
  };

  if (profile?.role !== 'Administrador') {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No tienes permisos para acceder a esta sección.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Gestores de Internacionalización
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <p>Cargando gestores...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Campus</TableHead>
                  <TableHead>Programas Asignados</TableHead>
                  <TableHead>Horas Semanales</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {managers.map((manager: any) => (
                  <TableRow key={manager.id}>
                    <TableCell className="font-medium">{manager.full_name}</TableCell>
                    <TableCell>{manager.email}</TableCell>
                    <TableCell>{manager.campus || 'Sin asignar'}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {manager.academic_programs?.length || 0} programas
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {manager.weekly_hours ? (
                        <span>{manager.weekly_hours} horas/semana</span>
                      ) : (
                        <span className="text-gray-500">No configurado</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(manager)}
                    </TableCell>
                    <TableCell>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => openManagerDetails(manager)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {managers.length === 0 && !isLoading && (
            <div className="text-center py-8 text-gray-500">
              No hay gestores de internacionalización registrados.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog para ver detalles del gestor */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalles del Gestor</DialogTitle>
          </DialogHeader>
          
          {selectedManager && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-700">Información Personal</h4>
                  <div className="mt-2 space-y-2">
                    <p><span className="font-medium">Nombre:</span> {selectedManager.full_name}</p>
                    <p><span className="font-medium">Email:</span> {selectedManager.email}</p>
                    <p><span className="font-medium">Documento:</span> {selectedManager.document_number || 'No registrado'}</p>
                    <p><span className="font-medium">Campus:</span> {selectedManager.campus || 'Sin asignar'}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-700">Carga Académica</h4>
                  <div className="mt-2 space-y-2">
                    <p><span className="font-medium">Horas semanales:</span> {selectedManager.weekly_hours || 'No configurado'}</p>
                    <p><span className="font-medium">Número de semanas:</span> {selectedManager.number_of_weeks || 'No configurado'}</p>
                    <p><span className="font-medium">Total de horas:</span> {selectedManager.total_hours || 'No calculado'}</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-700 mb-3">Programas Académicos Asignados</h4>
                {selectedManager.academic_programs && selectedManager.academic_programs.length > 0 ? (
                  <div className="space-y-3">
                    {selectedManager.academic_programs.map((program: any) => (
                      <div key={program.id} className="border rounded-lg p-3 bg-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <div>
                            <p className="font-medium">{program.name}</p>
                            <p className="text-sm text-gray-600">Director: {program.director_name}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Campus: {program.campus?.name}</p>
                            <p className="text-sm text-gray-600">Facultad: {program.faculty?.name}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No tiene programas académicos asignados.</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
