import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useManagers } from "@/hooks/useManagers";
import { Eye, Users, FileText, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useSupabaseData } from "@/hooks/useSupabaseData";

export function InternationalizationManagers() {
  const [managers, setManagers] = useState<any[]>([]);
  const [selectedManager, setSelectedManager] = useState<any | null>(null);
  const [managerPlanTypes, setManagerPlanTypes] = useState<any[]>([]);
  const [availablePlanTypes, setAvailablePlanTypes] = useState<any[]>([]);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isAssignPlanDialogOpen, setIsAssignPlanDialogOpen] = useState(false);
  const [selectedPlanTypeForAssignment, setSelectedPlanTypeForAssignment] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  
  const { profile } = useAuth();
  const { toast } = useToast();
  const { fetchManagersByCampus, fetchAvailablePlanTypes } = useManagers();
  const { fetchPlanTypes, createCustomPlan } = useSupabaseData();

  useEffect(() => {
    loadManagers();
    loadAvailablePlanTypes();
  }, []);

  const loadAvailablePlanTypes = async () => {
    try {
      const result = await fetchPlanTypes();
      if (result.data) {
        setAvailablePlanTypes(result.data);
      }
    } catch (error) {
      console.error("Error loading plan types:", error);
    }
  };

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

  const openManagerDetails = async (manager: any) => {
    setSelectedManager(manager);
    
    // Load available plan types for this manager
    try {
      const planTypesResult = await fetchAvailablePlanTypes(manager.id);
      if (planTypesResult.data) {
        setManagerPlanTypes(planTypesResult.data);
      }
    } catch (error) {
      console.error("Error loading plan types:", error);
    }
    
    setIsDetailsDialogOpen(true);
  };

  const openAssignPlanDialog = (manager: any) => {
    setSelectedManager(manager);
    setIsAssignPlanDialogOpen(true);
  };

  const handleAssignPlan = async () => {
    if (!selectedManager || !selectedPlanTypeForAssignment) {
      toast({
        title: "Error",
        description: "Debe seleccionar un tipo de plan",
        variant: "destructive",
      });
      return;
    }

    try {
      const planType = availablePlanTypes.find(pt => pt.id === selectedPlanTypeForAssignment);
      const result = await createCustomPlan({
        plan_type_id: selectedPlanTypeForAssignment,
        title: `Plan de ${planType?.name} - ${selectedManager.full_name}`,
        manager_id: selectedManager.id,
        status: 'draft'
      });

      if (result.data) {
        toast({
          title: "Éxito",
          description: "Plan asignado correctamente al gestor",
        });
        setIsAssignPlanDialogOpen(false);
        setSelectedPlanTypeForAssignment("");
        loadManagers();
      }
    } catch (error) {
      console.error("Error assigning plan:", error);
      toast({
        title: "Error",
        description: "No se pudo asignar el plan",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (manager: any) => {
    const hasHours = manager.weekly_hours && manager.number_of_weeks;
    const hasProgram = manager.academic_programs && manager.academic_programs.length > 0;
    
    if (hasHours && hasProgram) {
      return <Badge variant="default" className="bg-green-600">Configurado</Badge>;
    } else if (hasProgram) {
      return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Programa asignado</Badge>;
    } else {
      return <Badge variant="secondary">Sin configurar</Badge>;
    }
  };

  const getAssignedProgram = (manager: any) => {
    if (manager.academic_programs && manager.academic_programs.length > 0) {
      const program = manager.academic_programs[0];
      return {
        name: program.name,
        campus: program.campus?.name || 'Sin campus',
        faculty: program.faculty?.name || 'Sin facultad'
      };
    }
    return null;
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
                  <TableHead>Programa Asignado</TableHead>
                  <TableHead>Campus</TableHead>
                  <TableHead>Horas Semanales</TableHead>
                  <TableHead>Total Horas</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {managers.map((manager: any) => {
                  const assignedProgram = getAssignedProgram(manager);
                  return (
                    <TableRow key={manager.id}>
                      <TableCell className="font-medium">{manager.full_name}</TableCell>
                      <TableCell>{manager.email}</TableCell>
                      <TableCell>
                        {assignedProgram ? (
                          <div>
                            <p className="font-medium">{assignedProgram.name}</p>
                            <p className="text-sm text-gray-500">{assignedProgram.faculty}</p>
                          </div>
                        ) : (
                          <span className="text-gray-500">Sin asignar</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {assignedProgram?.campus || 'Sin asignar'}
                      </TableCell>
                      <TableCell>
                        {manager.weekly_hours ? (
                          <span>{manager.weekly_hours} horas/semana</span>
                        ) : (
                          <span className="text-gray-500">No configurado</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {manager.total_hours ? (
                          <span>{manager.total_hours} horas</span>
                        ) : (
                          <span className="text-gray-500">No calculado</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(manager)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => openManagerDetails(manager)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => openAssignPlanDialog(manager)}
                            className="bg-blue-50 hover:bg-blue-100"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
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
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles del Gestor</DialogTitle>
          </DialogHeader>
          
          {selectedManager && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-700 mb-3">Información Personal</h4>
                  <div className="space-y-2">
                    <p><span className="font-medium">Nombre:</span> {selectedManager.full_name}</p>
                    <p><span className="font-medium">Email:</span> {selectedManager.email}</p>
                    <p><span className="font-medium">Documento:</span> {selectedManager.document_number || 'No registrado'}</p>
                    <p><span className="font-medium">Cargo:</span> {selectedManager.position}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-700 mb-3">Carga Académica</h4>
                  <div className="space-y-2">
                    <p><span className="font-medium">Horas semanales:</span> {selectedManager.weekly_hours || 'No configurado'}</p>
                    <p><span className="font-medium">Número de semanas:</span> {selectedManager.number_of_weeks || 'No configurado'}</p>
                    <p><span className="font-medium">Total de horas:</span> {selectedManager.total_hours || 'No calculado'}</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-700 mb-3">Programa Académico Asignado</h4>
                {selectedManager.academic_programs && selectedManager.academic_programs.length > 0 ? (
                  <div className="space-y-3">
                    {selectedManager.academic_programs.map((program: any) => (
                      <div key={program.id} className="border rounded-lg p-4 bg-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="font-medium text-lg">{program.name}</p>
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
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-yellow-800">Este gestor no tiene programas académicos asignados.</p>
                    <p className="text-sm text-yellow-600 mt-1">Para asignar un programa, edite el programa académico correspondiente y seleccione este gestor como responsable.</p>
                  </div>
                )}
              </div>

              <div>
                <h4 className="font-medium text-gray-700 mb-3">Tipos de Plan Disponibles</h4>
                {selectedManager.weekly_hours ? (
                  <div className="space-y-3">
                    {managerPlanTypes.length > 0 ? (
                      managerPlanTypes.map((planType: any) => (
                        <div key={planType.id} className="border rounded-lg p-3 bg-blue-50">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{planType.name}</p>
                              <p className="text-sm text-gray-600">{planType.description}</p>
                              <p className="text-xs text-gray-500">
                                Horas: {planType.min_weekly_hours} - {planType.max_weekly_hours || '∞'} por semana
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">
                                <FileText className="w-3 h-3 mr-1" />
                                {planType.field_count} campos
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                        <p className="text-gray-600">No hay tipos de plan disponibles para este gestor con {selectedManager.weekly_hours} horas semanales.</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="text-orange-800">Debe configurar las horas semanales del gestor para ver los tipos de plan disponibles.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog para asignar plan */}
      <Dialog open={isAssignPlanDialogOpen} onOpenChange={setIsAssignPlanDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Asignar Tipo de Plan</DialogTitle>
          </DialogHeader>
          
          {selectedManager && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">Gestor:</p>
                <p className="font-medium">{selectedManager.full_name}</p>
                <p className="text-sm text-gray-500">{selectedManager.email}</p>
              </div>

              <div>
                <Label htmlFor="planType">Tipo de Plan</Label>
                <Select 
                  value={selectedPlanTypeForAssignment} 
                  onValueChange={setSelectedPlanTypeForAssignment}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un tipo de plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {availablePlanTypes.map((planType) => (
                      <SelectItem key={planType.id} value={planType.id}>
                        <div>
                          <div className="font-medium">{planType.name}</div>
                          <div className="text-xs text-gray-500">
                            {planType.min_weekly_hours} - {planType.max_weekly_hours || '∞'} hrs/semana
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedPlanTypeForAssignment && (
                  <p className="text-sm text-gray-600 mt-2">
                    {availablePlanTypes.find(pt => pt.id === selectedPlanTypeForAssignment)?.description}
                  </p>
                )}
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleAssignPlan} disabled={!selectedPlanTypeForAssignment}>
                  Asignar Plan
                </Button>
                <Button variant="outline" onClick={() => setIsAssignPlanDialogOpen(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
