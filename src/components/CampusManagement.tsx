
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit, Trash2, Building, GraduationCap, School } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseData, Campus, Faculty, AcademicProgram } from "@/hooks/useSupabaseData";
import { Checkbox } from "@/components/ui/checkbox";

export function CampusManagement() {
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [programs, setPrograms] = useState<AcademicProgram[]>([]);
  const [managers, setManagers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("campuses");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const {
    fetchCampus,
    createCampus,
    updateCampus,
    deleteCampus,
    fetchFaculties,
    createFaculty,
    updateFaculty,
    deleteFaculty,
    fetchAcademicPrograms,
    createAcademicProgram,
    updateAcademicProgram,
    deleteAcademicProgram,
    fetchManagers,
    updateManagerHours
  } = useSupabaseData();

  // Campus Management
  const [campusDialog, setCampusDialog] = useState(false);
  const [campusForm, setCampusForm] = useState({ name: "", address: "" });
  const [editingCampus, setEditingCampus] = useState<Campus | null>(null);

  // Faculty Management
  const [facultyDialog, setFacultyDialog] = useState(false);
  const [facultyForm, setFacultyForm] = useState({ 
    name: "", 
    dean_name: "", 
    campus_ids: [] as string[],
    manager_id: "",
    weekly_hours: 0,
    number_of_weeks: 16
  });
  const [editingFaculty, setEditingFaculty] = useState<Faculty | null>(null);

  // Program Management
  const [programDialog, setProgramDialog] = useState(false);
  const [programForm, setProgramForm] = useState({
    name: "",
    campus_id: "",
    faculty_id: "",
    director_name: "",
    director_email: "",
    manager_id: ""
  });
  const [editingProgram, setEditingProgram] = useState<AcademicProgram | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [campusResult, facultiesResult, programsResult, managersResult] = await Promise.all([
        fetchCampus(),
        fetchFaculties(),
        fetchAcademicPrograms(),
        fetchManagers()
      ]);

      if (campusResult.error) console.error('Error loading campus:', campusResult.error);
      else setCampuses(campusResult.data || []);

      if (facultiesResult.error) console.error('Error loading faculties:', facultiesResult.error);
      else setFaculties(facultiesResult.data || []);

      if (programsResult.error) console.error('Error loading programs:', programsResult.error);
      else setPrograms(programsResult.data || []);

      if (managersResult.error) console.error('Error loading managers:', managersResult.error);
      else setManagers(managersResult.data || []);

    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Campus Functions
  const handleCampusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingCampus) {
        const { error } = await updateCampus(editingCampus.id, {
          name: campusForm.name,
          address: campusForm.address,
        });

        if (error) {
          toast({
            title: "Error",
            description: "No se pudo actualizar el campus",
            variant: "destructive"
          });
          return;
        }

        toast({ title: "Campus actualizado exitosamente" });
      } else {
        const { error } = await createCampus({
          name: campusForm.name,
          address: campusForm.address,
        });

        if (error) {
          toast({
            title: "Error",
            description: "No se pudo crear el campus",
            variant: "destructive"
          });
          return;
        }

        toast({ title: "Campus creado exitosamente" });
      }

      setCampusForm({ name: "", address: "" });
      setEditingCampus(null);
      setCampusDialog(false);
      loadData();
    } catch (error) {
      console.error('Error submitting campus:', error);
    }
  };

  // Faculty Functions
  const handleFacultySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const facultyData = {
        name: facultyForm.name,
        dean_name: facultyForm.dean_name,
        campus_id: facultyForm.campus_ids[0], // Primer campus seleccionado como principal
        campus_ids: facultyForm.campus_ids,
      };
      
      if (editingFaculty) {
        const { error } = await updateFaculty(editingFaculty.id, facultyData);

        if (error) {
          toast({
            title: "Error",
            description: "No se pudo actualizar la facultad",
            variant: "destructive"
          });
          return;
        }

        toast({ title: "Facultad actualizada exitosamente" });
      } else {
        const { error } = await createFaculty(facultyData);

        if (error) {
          toast({
            title: "Error",
            description: "No se pudo crear la facultad",
            variant: "destructive"
          });
          return;
        }

        toast({ title: "Facultad creada exitosamente" });
      }

      // Si se asignó un gestor y se definieron horas, actualizar las horas del gestor
      if (facultyForm.manager_id && facultyForm.manager_id !== "none" && facultyForm.weekly_hours > 0) {
        const { error: hoursError } = await updateManagerHours(
          facultyForm.manager_id, 
          facultyForm.weekly_hours, 
          facultyForm.number_of_weeks
        );

        if (hoursError) {
          console.error('Error updating manager hours:', hoursError);
          toast({
            title: "Advertencia",
            description: "Facultad creada pero no se pudieron actualizar las horas del gestor",
            variant: "destructive"
          });
        }
      }

      setFacultyForm({ 
        name: "", 
        dean_name: "", 
        campus_ids: [],
        manager_id: "",
        weekly_hours: 0,
        number_of_weeks: 16
      });
      setEditingFaculty(null);
      setFacultyDialog(false);
      loadData();
    } catch (error) {
      console.error('Error submitting faculty:', error);
    }
  };

  // Program Functions
  const handleProgramSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const programData = {
        name: programForm.name,
        campus_id: programForm.campus_id,
        faculty_id: programForm.faculty_id,
        director_name: programForm.director_name,
        director_email: programForm.director_email,
        manager_id: programForm.manager_id === "none" ? undefined : programForm.manager_id || undefined,
      };

      if (editingProgram) {
        const { error } = await updateAcademicProgram(editingProgram.id, programData);

        if (error) {
          toast({
            title: "Error",
            description: "No se pudo actualizar el programa",
            variant: "destructive"
          });
          return;
        }

        toast({ title: "Programa actualizado exitosamente" });
      } else {
        const { error } = await createAcademicProgram(programData);

        if (error) {
          toast({
            title: "Error",
            description: "No se pudo crear el programa",
            variant: "destructive"
          });
          return;
        }

        toast({ title: "Programa creado exitosamente" });
      }

      setProgramForm({ 
        name: "", 
        campus_id: "", 
        faculty_id: "", 
        director_name: "", 
        director_email: "",
        manager_id: ""
      });
      setEditingProgram(null);
      setProgramDialog(false);
      loadData();
    } catch (error) {
      console.error('Error submitting program:', error);
    }
  };

  const handleDeleteCampus = async (id: string) => {
    try {
      const { error } = await deleteCampus(id);
      if (error) {
        toast({
          title: "Error",
          description: "No se pudo eliminar el campus",
          variant: "destructive"
        });
        return;
      }
      toast({ title: "Campus eliminado" });
      loadData();
    } catch (error) {
      console.error('Error deleting campus:', error);
    }
  };

  const handleDeleteFaculty = async (id: string) => {
    try {
      const { error } = await deleteFaculty(id);
      if (error) {
        toast({
          title: "Error",
          description: "No se pudo eliminar la facultad",
          variant: "destructive"
        });
        return;
      }
      toast({ title: "Facultad eliminada" });
      loadData();
    } catch (error) {
      console.error('Error deleting faculty:', error);
    }
  };

  const handleDeleteProgram = async (id: string) => {
    try {
      const { error } = await deleteAcademicProgram(id);
      if (error) {
        toast({
          title: "Error",
          description: "No se pudo eliminar el programa",
          variant: "destructive"
        });
        return;
      }
      toast({ title: "Programa eliminado" });
      loadData();
    } catch (error) {
      console.error('Error deleting program:', error);
    }
  };

  const availableFaculties = faculties.filter(f => 
    !programForm.campus_id || 
    f.faculty_campus?.some(fc => fc.campus.id === programForm.campus_id)
  );
  
  const availableManagers = managers.filter(m => m.role === 'Gestor');

  // Función para obtener los campus asociados a una facultad
  const getFacultyCampusNames = (faculty: Faculty) => {
    if (faculty.faculty_campus && faculty.faculty_campus.length > 0) {
      return faculty.faculty_campus.map(fc => fc.campus.name).join(', ');
    }
    return faculty.campus?.name || 'Sin campus asignado';
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="p-8">
          <div className="flex justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
              <p className="mt-4 text-gray-600">Cargando datos...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-primary">Gestión de Campus, Facultades y Programas</CardTitle>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="campuses" className="flex items-center gap-2">
              <Building className="w-4 h-4" />
              Campus
            </TabsTrigger>
            <TabsTrigger value="faculties" className="flex items-center gap-2">
              <School className="w-4 h-4" />
              Facultades
            </TabsTrigger>
            <TabsTrigger value="programs" className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4" />
              Programas
            </TabsTrigger>
          </TabsList>

          {/* Campus Tab */}
          <TabsContent value="campuses" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Campus Universitarios</h3>
              <Dialog open={campusDialog} onOpenChange={setCampusDialog}>
                <DialogTrigger asChild>
                  <Button className="institutional-gradient text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Nuevo Campus
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingCampus ? "Editar" : "Crear"} Campus</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCampusSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="campusName">Nombre del Campus</Label>
                      <Input
                        id="campusName"
                        value={campusForm.name}
                        onChange={(e) => setCampusForm(prev => ({ ...prev, name: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="campusAddress">Dirección del Campus</Label>
                      <Input
                        id="campusAddress"
                        value={campusForm.address}
                        onChange={(e) => setCampusForm(prev => ({ ...prev, address: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setCampusDialog(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit" className="institutional-gradient text-white">
                        {editingCampus ? "Actualizar" : "Crear"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campus</TableHead>
                  <TableHead>Dirección</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campuses.map((campus) => (
                  <TableRow key={campus.id}>
                    <TableCell className="font-medium">{campus.name}</TableCell>
                    <TableCell>{campus.address}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" onClick={() => {
                          setEditingCampus(campus);
                          setCampusForm({ name: campus.name, address: campus.address });
                          setCampusDialog(true);
                        }}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDeleteCampus(campus.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          {/* Faculties Tab */}
          <TabsContent value="faculties" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Facultades</h3>
              <Dialog open={facultyDialog} onOpenChange={setFacultyDialog}>
                <DialogTrigger asChild>
                  <Button className="institutional-gradient text-white" disabled={campuses.length === 0}>
                    <Plus className="w-4 h-4 mr-2" />
                    Nueva Facultad
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>{editingFaculty ? "Editar" : "Crear"} Facultad</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleFacultySubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="facultyName">Nombre de la Facultad</Label>
                      <Input
                        id="facultyName"
                        value={facultyForm.name}
                        onChange={(e) => setFacultyForm(prev => ({ ...prev, name: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="deanName">Nombre del Decano</Label>
                      <Input
                        id="deanName"
                        value={facultyForm.dean_name}
                        onChange={(e) => setFacultyForm(prev => ({ ...prev, dean_name: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Campus Asociados (Seleccione al menos uno)</Label>
                      <div className="space-y-2 max-h-32 overflow-y-auto border rounded p-2">
                        {campuses.map((campus) => (
                          <div key={campus.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`campus-${campus.id}`}
                              checked={facultyForm.campus_ids.includes(campus.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setFacultyForm(prev => ({
                                    ...prev,
                                    campus_ids: [...prev.campus_ids, campus.id]
                                  }));
                                } else {
                                  setFacultyForm(prev => ({
                                    ...prev,
                                    campus_ids: prev.campus_ids.filter(id => id !== campus.id)
                                  }));
                                }
                              }}
                            />
                            <Label htmlFor={`campus-${campus.id}`} className="text-sm">
                              {campus.name}
                            </Label>
                          </div>
                        ))}
                      </div>
                      {facultyForm.campus_ids.length === 0 && (
                        <p className="text-sm text-gray-500">Seleccione al menos un campus</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="facultyManager">Gestor Asignado (Opcional)</Label>
                      <Select value={facultyForm.manager_id || "none"} onValueChange={(value) => setFacultyForm(prev => ({ ...prev, manager_id: value === "none" ? "" : value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar gestor" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Sin asignar</SelectItem>
                          {availableManagers.map((manager) => (
                            <SelectItem key={manager.id} value={manager.id}>
                              {manager.full_name} - {manager.document_number}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {facultyForm.manager_id && facultyForm.manager_id !== "none" && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="weeklyHours">Horas Semanales Asignadas</Label>
                          <Input
                            id="weeklyHours"
                            type="number"
                            min="1"
                            max="40"
                            value={facultyForm.weekly_hours}
                            onChange={(e) => setFacultyForm(prev => ({ ...prev, weekly_hours: parseInt(e.target.value) || 0 }))}
                            placeholder="Ej: 20"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="numberOfWeeks">Número de Semanas del Periodo</Label>
                          <Input
                            id="numberOfWeeks"
                            type="number"
                            min="1"
                            max="52"
                            value={facultyForm.number_of_weeks}
                            onChange={(e) => setFacultyForm(prev => ({ ...prev, number_of_weeks: parseInt(e.target.value) || 16 }))}
                            placeholder="16"
                          />
                        </div>
                        {facultyForm.weekly_hours > 0 && (
                          <div className="bg-blue-50 p-3 rounded-md">
                            <p className="text-sm text-blue-800">
                              <strong>Total de horas calculadas:</strong> {facultyForm.weekly_hours * facultyForm.number_of_weeks} horas
                            </p>
                          </div>
                        )}
                      </>
                    )}
                    
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setFacultyDialog(false)}>
                        Cancelar
                      </Button>
                      <Button 
                        type="submit" 
                        className="institutional-gradient text-white"
                        disabled={facultyForm.campus_ids.length === 0}
                      >
                        {editingFaculty ? "Actualizar" : "Crear"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Facultad</TableHead>
                  <TableHead>Decano</TableHead>
                  <TableHead>Campus Asociados</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {faculties.map((faculty) => (
                  <TableRow key={faculty.id}>
                    <TableCell className="font-medium">{faculty.name}</TableCell>
                    <TableCell>{faculty.dean_name}</TableCell>
                    <TableCell>{getFacultyCampusNames(faculty)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" onClick={() => {
                          setEditingFaculty(faculty);
                          const campusIds = faculty.faculty_campus ? 
                            faculty.faculty_campus.map(fc => fc.campus.id) : 
                            (faculty.campus_id ? [faculty.campus_id] : []);
                          setFacultyForm({ 
                            name: faculty.name, 
                            dean_name: faculty.dean_name, 
                            campus_ids: campusIds,
                            manager_id: "",
                            weekly_hours: 0,
                            number_of_weeks: 16
                          });
                          setFacultyDialog(true);
                        }}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDeleteFaculty(faculty.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          {/* Programs Tab */}
          <TabsContent value="programs" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Programas Académicos</h3>
              <Dialog open={programDialog} onOpenChange={setProgramDialog}>
                <DialogTrigger asChild>
                  <Button className="institutional-gradient text-white" disabled={faculties.length === 0}>
                    <Plus className="w-4 h-4 mr-2" />
                    Nuevo Programa
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>{editingProgram ? "Editar" : "Crear"} Programa Académico</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleProgramSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="programCampus">Campus de Oferta</Label>
                      <Select value={programForm.campus_id} onValueChange={(value) => {
                        setProgramForm(prev => ({ ...prev, campus_id: value, faculty_id: "" }));
                      }}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar campus" />
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
                    
                    <div className="space-y-2">
                      <Label htmlFor="programFaculty">Facultad Asociada</Label>
                      <Select value={programForm.faculty_id} onValueChange={(value) => setProgramForm(prev => ({ ...prev, faculty_id: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar facultad" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableFaculties.map((faculty) => (
                            <SelectItem key={faculty.id} value={faculty.id}>
                              {faculty.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="programName">Nombre del Programa</Label>
                      <Input
                        id="programName"
                        value={programForm.name}
                        onChange={(e) => setProgramForm(prev => ({ ...prev, name: e.target.value }))}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="directorName">Director de Programa</Label>
                      <Input
                        id="directorName"
                        value={programForm.director_name}
                        onChange={(e) => setProgramForm(prev => ({ ...prev, director_name: e.target.value }))}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="directorEmail">Correo del Director</Label>
                      <Input
                        id="directorEmail"
                        type="email"
                        value={programForm.director_email}
                        onChange={(e) => setProgramForm(prev => ({ ...prev, director_email: e.target.value }))}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="managerId">Gestor Asignado (Opcional)</Label>
                      <Select value={programForm.manager_id || "none"} onValueChange={(value) => setProgramForm(prev => ({ ...prev, manager_id: value === "none" ? "" : value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar gestor" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Sin asignar</SelectItem>
                          {availableManagers.map((manager) => (
                            <SelectItem key={manager.id} value={manager.id}>
                              {manager.full_name} - {manager.document_number}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => {
                        setProgramDialog(false);
                        setEditingProgram(null);
                        setProgramForm({ 
                          name: "", 
                          campus_id: "", 
                          faculty_id: "", 
                          director_name: "", 
                          director_email: "",
                          manager_id: ""
                        });
                      }}>
                        Cancelar
                      </Button>
                      <Button type="submit" className="institutional-gradient text-white">
                        {editingProgram ? "Actualizar" : "Crear"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Facultad</TableHead>
                  <TableHead>Programa</TableHead>
                  <TableHead>Campus</TableHead>
                  <TableHead>Director</TableHead>
                  <TableHead>Gestor Relacionado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {programs.map((program) => (
                  <TableRow key={program.id}>
                    <TableCell>{program.faculty?.name}</TableCell>
                    <TableCell className="font-medium">{program.name}</TableCell>
                    <TableCell>{program.campus?.name}</TableCell>
                    <TableCell>{program.director_name}</TableCell>
                    <TableCell>
                      {program.manager ? (
                        <span className="text-green-600 font-medium">{program.manager.full_name}</span>
                      ) : (
                        <span className="text-gray-400">Sin asignar</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" onClick={() => {
                          setEditingProgram(program);
                          setProgramForm({
                            name: program.name,
                            campus_id: program.campus_id,
                            faculty_id: program.faculty_id,
                            director_name: program.director_name,
                            director_email: program.director_email,
                            manager_id: program.manager_id || ""
                          });
                          setProgramDialog(true);
                        }}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDeleteProgram(program.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
        
        {campuses.length === 0 && activeTab === "campuses" && (
          <div className="text-center py-8 text-gray-500">
            No hay campus registrados. Crear el primer campus.
          </div>
        )}
        
        {campuses.length === 0 && activeTab === "faculties" && (
          <div className="text-center py-8 text-gray-500">
            Primero debe crear al menos un campus para poder crear facultades.
          </div>
        )}
        
        {faculties.length === 0 && activeTab === "programs" && (
          <div className="text-center py-8 text-gray-500">
            Primero debe crear al menos una facultad para poder crear programas académicos.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
