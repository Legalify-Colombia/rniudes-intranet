
import React, { useState, useEffect } from "react";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Building, GraduationCap, Users } from "lucide-react";

export function CampusManagement() {
  const { profile } = useAuth();
  const { toast } = useToast();
  
  const {
    fetchCampus,
    createCampus,
    updateCampus,
    deleteCampus,
    fetchFaculties,
    fetchFacultiesByCampus,
    createFaculty,
    updateFaculty,
    deleteFaculty,
    fetchAcademicPrograms,
    fetchAcademicProgramsByCampus,
    createAcademicProgram,
    updateAcademicProgram,
    deleteAcademicProgram,
    fetchManagers,
    getUserManagedCampus
  } = useSupabaseData();

  const [campuses, setCampuses] = useState<any[]>([]);
  const [faculties, setFaculties] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [managers, setManagers] = useState<any[]>([]);
  const [selectedCampus, setSelectedCampus] = useState<string>("");
  const [userManagedCampus, setUserManagedCampus] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Dialog states
  const [isCampusDialogOpen, setIsCampusDialogOpen] = useState(false);
  const [isFacultyDialogOpen, setIsFacultyDialogOpen] = useState(false);
  const [isProgramDialogOpen, setIsProgramDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [editType, setEditType] = useState<'campus' | 'faculty' | 'program'>('campus');

  // Form states
  const [campusForm, setCampusForm] = useState({
    name: "",
    description: "",
    address: ""
  });

  const [facultyForm, setFacultyForm] = useState({
    name: "",
    description: "",
    dean_name: "",
    campus_id: ""
  });

  const [programForm, setProgramForm] = useState({
    name: "",
    description: "",
    director_name: "",
    director_email: "",
    faculty_id: "",
    campus_id: "",
    manager_id: "",
  });

  const canManageCampus = (campusId: string) => {
    if (profile?.role !== 'Administrador') return false;
    if (!userManagedCampus || userManagedCampus.length === 0) return true; // Super admin
    return userManagedCampus.includes(campusId);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      // Load user's managed campus if they are an admin
      let managedCampusIds: string[] = [];
      if (profile?.id && profile?.role === 'Administrador') {
        const { data: managedData } = await getUserManagedCampus(profile.id);
        if (managedData) {
          managedCampusIds = managedData.managed_campus_ids || 
            (managedData.campus_id ? [managedData.campus_id] : []);
          setUserManagedCampus(managedCampusIds);
        }
      }

      // Load all data
      const [campusResult, facultiesResult, programsResult, managersResult] = await Promise.all([
        fetchCampus(),
        fetchFaculties(),
        fetchAcademicPrograms(),
        fetchManagers()
      ]);

      if (campusResult.data) {
        const filteredCampuses = managedCampusIds.length > 0 
          ? campusResult.data.filter(campus => managedCampusIds.includes(campus.id))
          : campusResult.data;
        setCampuses(filteredCampuses);
        
        if (filteredCampuses.length > 0 && !selectedCampus) {
          setSelectedCampus(filteredCampuses[0].id);
        }
      }

      if (facultiesResult.data) {
        const filteredFaculties = managedCampusIds.length > 0 
          ? facultiesResult.data.filter(faculty => managedCampusIds.includes(faculty.campus_id))
          : facultiesResult.data;
        setFaculties(filteredFaculties);
      }

      if (programsResult.data) {
        const filteredPrograms = managedCampusIds.length > 0 
          ? programsResult.data.filter(program => managedCampusIds.includes(program.campus_id))
          : programsResult.data;
        setPrograms(filteredPrograms);
      }

      if (managersResult.data) {
        setManagers(managersResult.data);
      }
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

  useEffect(() => {
    loadData();
  }, []);

  // Campus handlers
  const handleCreateCampus = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await createCampus(campusForm);
      if (error) {
        toast({
          title: "Error",
          description: "No se pudo crear el campus",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Éxito",
          description: "Campus creado correctamente",
        });
        setCampusForm({ name: "", description: "", address: "" });
        setIsCampusDialogOpen(false);
        loadData();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear el campus",
        variant: "destructive",
      });
    }
  };

  // Faculty handlers
  const handleCreateFaculty = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await createFaculty(facultyForm);
      if (error) {
        toast({
          title: "Error",
          description: "No se pudo crear la facultad",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Éxito",
          description: "Facultad creada correctamente",
        });
        setFacultyForm({ name: "", description: "", dean_name: "", campus_id: "" });
        setIsFacultyDialogOpen(false);
        loadData();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear la facultad",
        variant: "destructive",
      });
    }
  };

  // Program handlers
  const handleCreateProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await createAcademicProgram(programForm);
      if (error) {
        toast({
          title: "Error",
          description: "No se pudo crear el programa",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Éxito",
          description: "Programa creado correctamente",
        });
        setProgramForm({
          name: "",
          description: "",
          director_name: "",
          director_email: "",
          faculty_id: "",
          campus_id: "",
          manager_id: "",
        });
        setIsProgramDialogOpen(false);
        loadData();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear el programa",
        variant: "destructive",
      });
    }
  };

  // Edit handlers
  const handleEdit = (item: any, type: 'campus' | 'faculty' | 'program') => {
    setEditingItem(item);
    setEditType(type);
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let error;
      
      if (editType === 'campus') {
        ({ error } = await updateCampus(editingItem.id, editingItem));
      } else if (editType === 'faculty') {
        ({ error } = await updateFaculty(editingItem.id, editingItem));
      } else if (editType === 'program') {
        ({ error } = await updateAcademicProgram(editingItem.id, editingItem));
      }

      if (error) {
        toast({
          title: "Error",
          description: `No se pudo actualizar ${editType === 'campus' ? 'el campus' : editType === 'faculty' ? 'la facultad' : 'el programa'}`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Éxito",
          description: `${editType === 'campus' ? 'Campus' : editType === 'faculty' ? 'Facultad' : 'Programa'} actualizado correctamente`,
        });
        setIsEditDialogOpen(false);
        setEditingItem(null);
        loadData();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `No se pudo actualizar ${editType === 'campus' ? 'el campus' : editType === 'faculty' ? 'la facultad' : 'el programa'}`,
        variant: "destructive",
      });
    }
  };

  // Delete handlers
  const handleDelete = async (id: string, type: 'campus' | 'faculty' | 'program') => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar este ${type === 'campus' ? 'campus' : type === 'faculty' ? 'facultad' : 'programa'}?`)) {
      return;
    }
    
    try {
      let error;
      
      if (type === 'campus') {
        ({ error } = await deleteCampus(id));
      } else if (type === 'faculty') {
        ({ error } = await deleteFaculty(id));
      } else if (type === 'program') {
        ({ error } = await deleteAcademicProgram(id));
      }

      if (error) {
        toast({
          title: "Error",
          description: `No se pudo eliminar ${type === 'campus' ? 'el campus' : type === 'faculty' ? 'la facultad' : 'el programa'}`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Éxito",
          description: `${type === 'campus' ? 'Campus' : type === 'faculty' ? 'Facultad' : 'Programa'} eliminado correctamente`,
        });
        loadData();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `No se pudo eliminar ${type === 'campus' ? 'el campus' : type === 'faculty' ? 'la facultad' : 'el programa'}`,
        variant: "destructive",
      });
    }
  };

  const getCampusName = (campusId: string) => {
    const campus = campuses.find(c => c.id === campusId);
    return campus?.name || 'Sin asignar';
  };

  const getFacultyName = (facultyId: string) => {
    const faculty = faculties.find(f => f.id === facultyId);
    return faculty?.name || 'Sin asignar';
  };

  const getManagerName = (managerId: string) => {
    const manager = managers.find(m => m.id === managerId);
    return manager?.full_name || 'Sin asignar';
  };

  const getAvailableManagers = () => {
    return managers.filter(manager => 
      manager.role === 'Gestor' && 
      (!selectedCampus || manager.campus_id === selectedCampus)
    );
  };

  if (loading) {
    return <div className="flex justify-center p-8">Cargando datos...</div>;
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="campus" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="campus" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Campus
          </TabsTrigger>
          <TabsTrigger value="faculties" className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            Facultades
          </TabsTrigger>
          <TabsTrigger value="programs" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Programas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="campus">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Gestión de Campus</CardTitle>
                <Dialog open={isCampusDialogOpen} onOpenChange={setIsCampusDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar Campus
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Crear Nuevo Campus</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateCampus} className="space-y-4">
                      <div>
                        <Label htmlFor="name">Nombre del Campus</Label>
                        <Input
                          id="name"
                          value={campusForm.name}
                          onChange={(e) => setCampusForm(prev => ({ ...prev, name: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="address">Dirección</Label>
                        <Input
                          id="address"
                          value={campusForm.address}
                          onChange={(e) => setCampusForm(prev => ({ ...prev, address: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="description">Descripción</Label>
                        <Textarea
                          id="description"
                          value={campusForm.description}
                          onChange={(e) => setCampusForm(prev => ({ ...prev, description: e.target.value }))}
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={() => setIsCampusDialogOpen(false)}>
                          Cancelar
                        </Button>
                        <Button type="submit">Crear Campus</Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Dirección</TableHead>
                    <TableHead>Facultades</TableHead>
                    <TableHead>Programas</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campuses.map((campus) => (
                    <TableRow key={campus.id}>
                      <TableCell className="font-medium">{campus.name}</TableCell>
                      <TableCell>{campus.description}</TableCell>
                      <TableCell>{campus.address}</TableCell>
                      <TableCell>
                        {faculties.filter(f => f.campus_id === campus.id).length}
                      </TableCell>
                      <TableCell>
                        {programs.filter(p => p.campus_id === campus.id).length}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            onClick={() => handleEdit(campus, 'campus')}
                            variant="outline"
                            disabled={!canManageCampus(campus.id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive" 
                            onClick={() => handleDelete(campus.id, 'campus')}
                            disabled={!canManageCampus(campus.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="faculties">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Gestión de Facultades</CardTitle>
                <div className="flex space-x-2">
                  <Select value={selectedCampus} onValueChange={setSelectedCampus}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filtrar por campus" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos los campus</SelectItem>
                      {campuses.map(campus => (
                        <SelectItem key={campus.id} value={campus.id}>
                          {campus.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Dialog open={isFacultyDialogOpen} onOpenChange={setIsFacultyDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar Facultad
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Crear Nueva Facultad</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleCreateFaculty} className="space-y-4">
                        <div>
                          <Label htmlFor="campus">Campus</Label>
                          <Select onValueChange={(value) => setFacultyForm(prev => ({ ...prev, campus_id: value }))}>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar campus" />
                            </SelectTrigger>
                            <SelectContent>
                              {campuses.map(campus => (
                                <SelectItem key={campus.id} value={campus.id}>
                                  {campus.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="name">Nombre de la Facultad</Label>
                          <Input
                            id="name"
                            value={facultyForm.name}
                            onChange={(e) => setFacultyForm(prev => ({ ...prev, name: e.target.value }))}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="dean_name">Nombre del Decano</Label>
                          <Input
                            id="dean_name"
                            value={facultyForm.dean_name}
                            onChange={(e) => setFacultyForm(prev => ({ ...prev, dean_name: e.target.value }))}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="description">Descripción</Label>
                          <Textarea
                            id="description"
                            value={facultyForm.description}
                            onChange={(e) => setFacultyForm(prev => ({ ...prev, description: e.target.value }))}
                          />
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button type="button" variant="outline" onClick={() => setIsFacultyDialogOpen(false)}>
                            Cancelar
                          </Button>
                          <Button type="submit">Crear Facultad</Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Campus</TableHead>
                    <TableHead>Decano</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Programas</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {faculties
                    .filter(faculty => !selectedCampus || faculty.campus_id === selectedCampus)
                    .map((faculty) => (
                    <TableRow key={faculty.id}>
                      <TableCell className="font-medium">{faculty.name}</TableCell>
                      <TableCell>{getCampusName(faculty.campus_id)}</TableCell>
                      <TableCell>{faculty.dean_name}</TableCell>
                      <TableCell>{faculty.description}</TableCell>
                      <TableCell>
                        {programs.filter(p => p.faculty_id === faculty.id).length}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            onClick={() => handleEdit(faculty, 'faculty')}
                            variant="outline"
                            disabled={!canManageCampus(faculty.campus_id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive" 
                            onClick={() => handleDelete(faculty.id, 'faculty')}
                            disabled={!canManageCampus(faculty.campus_id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="programs">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Gestión de Programas Académicos</CardTitle>
                <div className="flex space-x-2">
                  <Select value={selectedCampus} onValueChange={setSelectedCampus}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filtrar por campus" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos los campus</SelectItem>
                      {campuses.map(campus => (
                        <SelectItem key={campus.id} value={campus.id}>
                          {campus.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Dialog open={isProgramDialogOpen} onOpenChange={setIsProgramDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar Programa
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Crear Nuevo Programa Académico</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleCreateProgram} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="campus">Campus</Label>
                            <Select onValueChange={(value) => {
                              setProgramForm(prev => ({ ...prev, campus_id: value }));
                              setSelectedCampus(value);
                            }}>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar campus" />
                              </SelectTrigger>
                              <SelectContent>
                                {campuses.map(campus => (
                                  <SelectItem key={campus.id} value={campus.id}>
                                    {campus.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="faculty">Facultad</Label>
                            <Select onValueChange={(value) => setProgramForm(prev => ({ ...prev, faculty_id: value }))}>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar facultad" />
                              </SelectTrigger>
                              <SelectContent>
                                {faculties
                                  .filter(f => !programForm.campus_id || f.campus_id === programForm.campus_id)
                                  .map(faculty => (
                                  <SelectItem key={faculty.id} value={faculty.id}>
                                    {faculty.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="name">Nombre del Programa</Label>
                          <Input
                            id="name"
                            value={programForm.name}
                            onChange={(e) => setProgramForm(prev => ({ ...prev, name: e.target.value }))}
                            required
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="director_name">Nombre del Director</Label>
                            <Input
                              id="director_name"
                              value={programForm.director_name}
                              onChange={(e) => setProgramForm(prev => ({ ...prev, director_name: e.target.value }))}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="director_email">Email del Director</Label>
                            <Input
                              id="director_email"
                              type="email"
                              value={programForm.director_email}
                              onChange={(e) => setProgramForm(prev => ({ ...prev, director_email: e.target.value }))}
                              required
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="manager">Gestor Asignado</Label>
                          <Select onValueChange={(value) => setProgramForm(prev => ({ ...prev, manager_id: value }))}>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar gestor (opcional)" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">Sin asignar</SelectItem>
                              {getAvailableManagers().map(manager => (
                                <SelectItem key={manager.id} value={manager.id}>
                                  {manager.full_name} ({manager.email})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="description">Descripción</Label>
                          <Textarea
                            id="description"
                            value={programForm.description}
                            onChange={(e) => setProgramForm(prev => ({ ...prev, description: e.target.value }))}
                          />
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button type="button" variant="outline" onClick={() => setIsProgramDialogOpen(false)}>
                            Cancelar
                          </Button>
                          <Button type="submit">Crear Programa</Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Campus</TableHead>
                    <TableHead>Facultad</TableHead>
                    <TableHead>Director</TableHead>
                    <TableHead>Gestor Asignado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {programs
                    .filter(program => !selectedCampus || program.campus_id === selectedCampus)
                    .map((program) => (
                    <TableRow key={program.id}>
                      <TableCell className="font-medium">{program.name}</TableCell>
                      <TableCell>{getCampusName(program.campus_id)}</TableCell>
                      <TableCell>{getFacultyName(program.faculty_id)}</TableCell>
                      <TableCell>{program.director_name}</TableCell>
                      <TableCell>
                        <Badge variant={program.manager_id ? "default" : "secondary"}>
                          {getManagerName(program.manager_id)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            onClick={() => handleEdit(program, 'program')}
                            variant="outline"
                            disabled={!canManageCampus(program.campus_id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive" 
                            onClick={() => handleDelete(program.id, 'program')}
                            disabled={!canManageCampus(program.campus_id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Editar {editType === 'campus' ? 'Campus' : editType === 'faculty' ? 'Facultad' : 'Programa'}
            </DialogTitle>
          </DialogHeader>
          {editingItem && (
            <form onSubmit={handleUpdate} className="space-y-4">
              {editType === 'campus' && (
                <>
                  <div>
                    <Label htmlFor="edit_name">Nombre</Label>
                    <Input
                      id="edit_name"
                      value={editingItem.name || ''}
                      onChange={(e) => setEditingItem(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit_address">Dirección</Label>
                    <Input
                      id="edit_address"
                      value={editingItem.address || ''}
                      onChange={(e) => setEditingItem(prev => ({ ...prev, address: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit_description">Descripción</Label>
                    <Textarea
                      id="edit_description"
                      value={editingItem.description || ''}
                      onChange={(e) => setEditingItem(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>
                </>
              )}

              {editType === 'faculty' && (
                <>
                  <div>
                    <Label htmlFor="edit_name">Nombre</Label>
                    <Input
                      id="edit_name"
                      value={editingItem.name || ''}
                      onChange={(e) => setEditingItem(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit_dean_name">Decano</Label>
                    <Input
                      id="edit_dean_name"
                      value={editingItem.dean_name || ''}
                      onChange={(e) => setEditingItem(prev => ({ ...prev, dean_name: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit_description">Descripción</Label>
                    <Textarea
                      id="edit_description"
                      value={editingItem.description || ''}
                      onChange={(e) => setEditingItem(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>
                </>
              )}

              {editType === 'program' && (
                <>
                  <div>
                    <Label htmlFor="edit_name">Nombre</Label>
                    <Input
                      id="edit_name"
                      value={editingItem.name || ''}
                      onChange={(e) => setEditingItem(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit_director_name">Director</Label>
                      <Input
                        id="edit_director_name"
                        value={editingItem.director_name || ''}
                        onChange={(e) => setEditingItem(prev => ({ ...prev, director_name: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit_director_email">Email del Director</Label>
                      <Input
                        id="edit_director_email"
                        type="email"
                        value={editingItem.director_email || ''}
                        onChange={(e) => setEditingItem(prev => ({ ...prev, director_email: e.target.value }))}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="edit_manager">Gestor Asignado</Label>
                    <Select 
                      value={editingItem.manager_id || ''} 
                      onValueChange={(value) => setEditingItem(prev => ({ ...prev, manager_id: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar gestor" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Sin asignar</SelectItem>
                        {managers
                          .filter(manager => 
                            manager.role === 'Gestor' && 
                            manager.campus_id === editingItem.campus_id
                          )
                          .map(manager => (
                          <SelectItem key={manager.id} value={manager.id}>
                            {manager.full_name} ({manager.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="edit_description">Descripción</Label>
                    <Textarea
                      id="edit_description"
                      value={editingItem.description || ''}
                      onChange={(e) => setEditingItem(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>
                </>
              )}

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Actualizar</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
