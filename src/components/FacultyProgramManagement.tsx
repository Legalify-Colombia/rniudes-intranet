
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Plus, Edit, Trash, Users } from "lucide-react";

export function FacultyProgramManagement() {
  const [campuses, setCampuses] = useState<any[]>([]);
  const [faculties, setFaculties] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [managers, setManagers] = useState<any[]>([]);
  const [selectedCampus, setSelectedCampus] = useState<string>("");
  const [selectedFaculty, setSelectedFaculty] = useState<string>("");
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<any>(null);
  const [selectedManager, setSelectedManager] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const { profile } = useAuth();
  const { toast } = useToast();
  const {
    fetchCampus,
    fetchFaculties,
    fetchAcademicPrograms,
    fetchManagers,
    updateAcademicProgram
  } = useSupabaseData();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedCampus) {
      loadFacultiesAndPrograms();
    }
  }, [selectedCampus]);

  useEffect(() => {
    if (selectedFaculty) {
      loadPrograms();
    }
  }, [selectedFaculty]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Load campuses
      const { data: campusData } = await fetchCampus();
      if (campusData) {
        setCampuses(campusData);
      }

      // Load managers
      const { data: managerData } = await fetchManagers();
      if (managerData) {
        setManagers(managerData);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadFacultiesAndPrograms = async () => {
    if (!selectedCampus) return;

    try {
      // Load faculties for selected campus
      const { data: facultyData } = await fetchFaculties();
      if (facultyData) {
        const filteredFaculties = facultyData.filter(f => f.campus_id === selectedCampus);
        setFaculties(filteredFaculties);
      }

      // Load all programs for selected campus
      const { data: programData } = await fetchAcademicPrograms();
      if (programData) {
        const filteredPrograms = programData.filter(p => p.campus_id === selectedCampus);
        setPrograms(filteredPrograms);
      }
    } catch (error) {
      console.error("Error loading faculties and programs:", error);
    }
  };

  const loadPrograms = async () => {
    if (!selectedFaculty) return;

    try {
      const { data: programData } = await fetchAcademicPrograms();
      if (programData) {
        const filteredPrograms = programData.filter(p => p.faculty_id === selectedFaculty);
        setPrograms(filteredPrograms);
      }
    } catch (error) {
      console.error("Error loading programs:", error);
    }
  };

  const handleAssignManager = async () => {
    if (!selectedProgram || !selectedManager) {
      toast({
        title: "Error",
        description: "Seleccione un programa y un gestor",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await updateAcademicProgram(selectedProgram.id, {
        manager_id: selectedManager
      });

      if (error) {
        toast({
          title: "Error",
          description: "No se pudo asignar el gestor",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Éxito",
          description: "Gestor asignado correctamente",
        });
        setIsAssignDialogOpen(false);
        loadPrograms();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error inesperado al asignar el gestor",
        variant: "destructive",
      });
    }
  };

  const openAssignDialog = (program: any) => {
    setSelectedProgram(program);
    setSelectedManager(program.manager_id || "");
    setIsAssignDialogOpen(true);
  };

  const getManagerName = (managerId: string) => {
    const manager = managers.find(m => m.id === managerId);
    return manager ? manager.full_name : 'Sin asignar';
  };

  const getFacultyName = (facultyId: string) => {
    const faculty = faculties.find(f => f.id === facultyId);
    return faculty ? faculty.name : 'Sin facultad';
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
            Gestión de Facultades y Programas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <Label htmlFor="campus">Campus</Label>
              <Select value={selectedCampus} onValueChange={setSelectedCampus}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un campus" />
                </SelectTrigger>
                <SelectContent>
                  {campuses.map((campus) => (
                    <SelectItem key={campus.id} value={campus.id}>
                      {campus.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="faculty">Facultad (opcional)</Label>
              <Select value={selectedFaculty} onValueChange={setSelectedFaculty}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por facultad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas las facultades</SelectItem>
                  {faculties.map((faculty) => (
                    <SelectItem key={faculty.id} value={faculty.id}>
                      {faculty.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedCampus && (
            <div>
              <h3 className="text-lg font-medium mb-4">Programas Académicos</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Programa</TableHead>
                    <TableHead>Facultad</TableHead>
                    <TableHead>Director</TableHead>
                    <TableHead>Gestor Asignado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {programs.map((program) => (
                    <TableRow key={program.id}>
                      <TableCell className="font-medium">{program.name}</TableCell>
                      <TableCell>{getFacultyName(program.faculty_id)}</TableCell>
                      <TableCell>{program.director_name}</TableCell>
                      <TableCell>
                        <Badge variant={program.manager_id ? "default" : "secondary"}>
                          {getManagerName(program.manager_id)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => openAssignDialog(program)}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Asignar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {programs.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No hay programas académicos en este {selectedFaculty ? 'facultad' : 'campus'}.
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog para asignar gestor */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Asignar Gestor al Programa</DialogTitle>
          </DialogHeader>
          
          {selectedProgram && (
            <div className="space-y-4">
              <div>
                <Label>Programa</Label>
                <p className="font-medium">{selectedProgram.name}</p>
              </div>
              
              <div>
                <Label htmlFor="manager">Gestor de Internacionalización</Label>
                <Select value={selectedManager} onValueChange={setSelectedManager}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione un gestor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Sin asignar</SelectItem>
                    {managers.map((manager) => (
                      <SelectItem key={manager.id} value={manager.id}>
                        {manager.full_name} - {manager.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setIsAssignDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button onClick={handleAssignManager}>
                  Asignar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
