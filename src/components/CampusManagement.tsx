
import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Building, GraduationCap, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useCampus } from "@/hooks/useCampus";
import { useFaculties } from "@/hooks/useFaculties";
import { useAcademicPrograms } from "@/hooks/useAcademicPrograms";
import { useManagers } from "@/hooks/useManagers";
import type { Campus, Faculty, AcademicProgram } from "@/types/supabase";

interface Manager {
  id: string;
  full_name: string;
  email: string;
  role: string;
  campus_id: string;
}

type EditType = 'campus' | 'faculty' | 'program';

const CampusManagement = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const { fetchCampus, createCampus, updateCampus, deleteCampus, getUserManagedCampus } = useCampus();
  const { fetchFaculties, createFaculty, updateFaculty, deleteFaculty } = useFaculties();
  const { 
    fetchAcademicPrograms, 
    createAcademicProgram, 
    updateAcademicProgram, 
    deleteAcademicProgram 
  } = useAcademicPrograms();
  const { fetchManagers } = useManagers();

  // State Variables
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [programs, setPrograms] = useState<AcademicProgram[]>([]);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [selectedCampus, setSelectedCampus] = useState<string>("all");
  const [userManagedCampus, setUserManagedCampus] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
 
  // Dialog states
  const [isCampusDialogOpen, setIsCampusDialogOpen] = useState<boolean>(false);
  const [isFacultyDialogOpen, setIsFacultyDialogOpen] = useState<boolean>(false);
  const [isProgramDialogOpen, setIsProgramDialogOpen] = useState<boolean>(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [editType, setEditType] = useState<EditType>('campus');

  // Form states
  const [campusForm, setCampusForm] = useState({ name: "", description: "", address: "" });
  const [facultyForm, setFacultyForm] = useState({ name: "", description: "", dean_name: "", campus_id: "" });
  const [programForm, setProgramForm] = useState<Omit<AcademicProgram, 'id' | 'created_at' | 'updated_at'>>({ 
    name: "", 
    description: "", 
    director_name: "", 
    director_email: "", 
    faculty_id: "", 
    campus_id: "", 
    manager_id: null 
  });

  // Functions
  const canManageCampus = (campusId: string): boolean => {
    if (profile?.role !== 'Administrador') return false;
    if (!userManagedCampus || userManagedCampus.length === 0) return true;
    return userManagedCampus.includes(campusId);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      let managedCampusIds: string[] = [];
      if (profile?.id && profile?.role === 'Administrador') {
        const { data: managedData } = await getUserManagedCampus(profile.id);
        if (managedData) {
          managedCampusIds = managedData.managed_campus_ids || [];
          setUserManagedCampus(managedCampusIds);
        }
      }

      const [campusResult, facultiesResult, programsResult, managersResult] = await Promise.all([
        fetchCampus(), 
        fetchFaculties(), 
        fetchAcademicPrograms(), 
        fetchManagers()
      ]);

      const filterByManaged = (items: any[], idField: string = 'campus_id') => managedCampusIds.length > 0
        ? items.filter(item => managedCampusIds.includes(item[idField]))
        : items;

      if (campusResult.data) setCampuses(filterByManaged(campusResult.data, 'id'));
      if (facultiesResult.data) setFaculties(filterByManaged(facultiesResult.data));
      if (programsResult.data) setPrograms(filterByManaged(programsResult.data));
      if (managersResult.data) setManagers(managersResult.data);

    } catch (error) {
      console.error('Error loading data:', error);
      toast({ title: "Error", description: "No se pudieron cargar los datos", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // CRUD Handlers
  const handleCreateCampus = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await createCampus(campusForm);
    if (error) {
      toast({ title: "Error", description: "No se pudo crear el campus", variant: "destructive" });
    } else {
      toast({ title: "Éxito", description: "Campus creado correctamente" });
      setIsCampusDialogOpen(false);
      setCampusForm({ name: "", description: "", address: "" });
      loadData();
    }
  };

  const handleCreateFaculty = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await createFaculty(facultyForm);
    if (error) {
      toast({ title: "Error", description: "No se pudo crear la facultad", variant: "destructive" });
    } else {
      toast({ title: "Éxito", description: "Facultad creada correctamente" });
      setIsFacultyDialogOpen(false);
      setFacultyForm({ name: "", description: "", dean_name: "", campus_id: "" });
      loadData();
    }
  };

  const handleCreateProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await createAcademicProgram(programForm);
    if (error) {
      toast({ title: "Error", description: "No se pudo crear el programa", variant: "destructive" });
    } else {
      toast({ title: "Éxito", description: "Programa creado correctamente" });
      setIsProgramDialogOpen(false);
      setProgramForm({ 
        name: "", 
        description: "", 
        director_name: "", 
        director_email: "", 
        faculty_id: "", 
        campus_id: "", 
        manager_id: null 
      });
      loadData();
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    let error;
    const typeName = editType === 'campus' ? 'el campus' : editType === 'faculty' ? 'la facultad' : 'el programa';

    if (editType === 'campus') {
      ({ error } = await updateCampus(editingItem.id, editingItem));
    } else if (editType === 'faculty') {
      ({ error } = await updateFaculty(editingItem.id, editingItem));
    } else if (editType === 'program') {
      ({ error } = await updateAcademicProgram(editingItem.id, editingItem));
    }

    if (error) {
      toast({ title: "Error", description: `No se pudo actualizar ${typeName}`, variant: "destructive" });
    } else {
      toast({ title: "Éxito", description: `${typeName.charAt(0).toUpperCase() + typeName.slice(1)} actualizado` });
      setIsEditDialogOpen(false);
      setEditingItem(null);
      loadData();
    }
  };

  const handleDelete = async (id: string, type: EditType) => {
    const typeName = type === 'campus' ? 'el campus' : type === 'faculty' ? 'la facultad' : 'el programa';
    if (!window.confirm(`¿Estás seguro de que deseas eliminar ${typeName}?`)) return;
    
    let error;
    if (type === 'campus') {
      ({ error } = await deleteCampus(id));
    } else if (type === 'faculty') {
      ({ error } = await deleteFaculty(id));
    } else if (type === 'program') {
      ({ error } = await deleteAcademicProgram(id));
    }

    if (error) {
      toast({ title: "Error", description: `No se pudo eliminar ${typeName}`, variant: "destructive" });
    } else {
      toast({ title: "Éxito", description: "Elemento eliminado." });
      loadData();
    }
  };

  const handleEdit = (item: any, type: EditType) => {
    setEditingItem(item);
    setEditType(type);
    setIsEditDialogOpen(true);
  };
  
  const getCampusName = (campusId: string) => campuses.find(c => c.id === campusId)?.name || 'N/A';
  const getFacultyName = (facultyId: string) => faculties.find(f => f.id === facultyId)?.name || 'N/A';
  const getManagerName = (managerId: string | null) => managerId ? managers.find(m => m.id === managerId)?.full_name : 'Sin asignar';
  const getAvailableManagers = (campusId?: string) => managers.filter(m => m.role === 'Gestor' && (!campusId || m.campus_id === campusId));

  if (loading) {
    return <div className="flex justify-center items-center h-64">Cargando datos...</div>;
  }

  return (
    <div className="p-4 md:p-6 space-y-6 bg-gray-50 min-h-screen">
      <Tabs defaultValue="campus">
        <TabsList>
          <TabsTrigger value="campus"><Building className="h-4 w-4 mr-2" />Campus</TabsTrigger>
          <TabsTrigger value="faculties"><GraduationCap className="h-4 w-4 mr-2" />Facultades</TabsTrigger>
          <TabsTrigger value="programs"><Users className="h-4 w-4 mr-2" />Programas</TabsTrigger>
        </TabsList>
        
        <TabsContent value="campus">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Gestión de Campus</CardTitle>
                <Dialog open={isCampusDialogOpen} onOpenChange={setIsCampusDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => setIsCampusDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />Agregar Campus
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Crear Nuevo Campus</DialogTitle></DialogHeader>
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
                    <TableHead>Facultades</TableHead>
                    <TableHead>Programas</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campuses.map((campus) => (
                    <TableRow key={campus.id}>
                      <TableCell className="font-medium">{campus.name}</TableCell>
                      <TableCell>{faculties.filter(f => f.campus_id === campus.id).length}</TableCell>
                      <TableCell>{programs.filter(p => p.campus_id === campus.id).length}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleEdit(campus, 'campus')} 
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
                <div className="flex items-center space-x-2">
                  <Select value={selectedCampus} onValueChange={setSelectedCampus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filtrar por campus"/>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los Campus</SelectItem>
                      {campuses.map(campus => (
                        <SelectItem key={campus.id} value={campus.id}>{campus.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Dialog open={isFacultyDialogOpen} onOpenChange={setIsFacultyDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={() => setIsFacultyDialogOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />Agregar Facultad
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader><DialogTitle>Crear Nueva Facultad</DialogTitle></DialogHeader>
                      <form onSubmit={handleCreateFaculty} className="space-y-4">
                        <div>
                          <Label htmlFor="campus">Campus</Label>
                          <Select 
                            onValueChange={(value) => setFacultyForm(prev => ({...prev, campus_id: value}))} 
                            value={facultyForm.campus_id}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar campus"/>
                            </SelectTrigger>
                            <SelectContent>
                              {campuses.map(campus => (
                                <SelectItem key={campus.id} value={campus.id}>{campus.name}</SelectItem>
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
                    <TableHead>Programas</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {faculties.filter(f => selectedCampus === 'all' || f.campus_id === selectedCampus).map(faculty => (
                    <TableRow key={faculty.id}>
                      <TableCell className="font-medium">{faculty.name}</TableCell>
                      <TableCell>{getCampusName(faculty.campus_id)}</TableCell>
                      <TableCell>{faculty.dean_name}</TableCell>
                      <TableCell>{programs.filter(p => p.faculty_id === faculty.id).length}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleEdit(faculty, 'faculty')} 
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
                <CardTitle>Gestión de Programas</CardTitle>
                <div className="flex items-center space-x-2">
                  <Select value={selectedCampus} onValueChange={setSelectedCampus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filtrar por campus"/>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los Campus</SelectItem>
                      {campuses.map(campus => (
                        <SelectItem key={campus.id} value={campus.id}>{campus.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Dialog open={isProgramDialogOpen} onOpenChange={setIsProgramDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={() => setIsProgramDialogOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />Agregar Programa
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader><DialogTitle>Crear Nuevo Programa Académico</DialogTitle></DialogHeader>
                      <form onSubmit={handleCreateProgram} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Campus</Label>
                            <Select 
                              onValueChange={(value) => setProgramForm(p => ({...p, campus_id: value, faculty_id: ''}))} 
                              value={programForm.campus_id}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar campus"/>
                              </SelectTrigger>
                              <SelectContent>
                                {campuses.map(c => (
                                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Facultad</Label>
                            <Select 
                              onValueChange={(value) => setProgramForm(p => ({...p, faculty_id: value}))} 
                              value={programForm.faculty_id}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar facultad"/>
                              </SelectTrigger>
                              <SelectContent>
                                {faculties.filter(f => f.campus_id === programForm.campus_id).map(f => (
                                  <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div>
                          <Label>Nombre del Programa</Label>
                          <Input 
                            value={programForm.name} 
                            onChange={e => setProgramForm(p => ({...p, name: e.target.value}))} 
                            required 
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Nombre del Director</Label>
                            <Input 
                              value={programForm.director_name} 
                              onChange={e => setProgramForm(p => ({...p, director_name: e.target.value}))} 
                              required 
                            />
                          </div>
                          <div>
                            <Label>Email del Director</Label>
                            <Input 
                              type="email" 
                              value={programForm.director_email} 
                              onChange={e => setProgramForm(p => ({...p, director_email: e.target.value}))} 
                              required 
                            />
                          </div>
                        </div>
                        <div>
                          <Label>Gestor Asignado</Label>
                          <Select 
                            onValueChange={(value) => setProgramForm(p => ({...p, manager_id: value === 'unassigned' ? null : value}))} 
                            value={programForm.manager_id || 'unassigned'}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar gestor"/>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="unassigned">Sin Asignar</SelectItem>
                              {getAvailableManagers(programForm.campus_id).map(m => (
                                <SelectItem key={m.id} value={m.id}>{m.full_name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Descripción</Label>
                          <Textarea 
                            value={programForm.description} 
                            onChange={e => setProgramForm(p => ({...p, description: e.target.value}))} 
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
                    <TableHead>Facultad</TableHead>
                    <TableHead>Director</TableHead>
                    <TableHead>Gestor</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {programs.filter(p => selectedCampus === 'all' || p.campus_id === selectedCampus).map(program => (
                    <TableRow key={program.id}>
                      <TableCell className="font-medium">{program.name}</TableCell>
                      <TableCell>{getFacultyName(program.faculty_id)}</TableCell>
                      <TableCell>{program.director_name}</TableCell>
                      <TableCell>
                        <Badge variant={program.manager_id ? 'default' : 'secondary'}>
                          {getManagerName(program.manager_id)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleEdit(program, 'program')} 
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
      
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Editar {editType}</DialogTitle></DialogHeader>
          {editingItem && (
            <form onSubmit={handleUpdate} className="space-y-4">
              {editType === 'campus' && (
                <>
                  <div>
                    <Label>Nombre</Label>
                    <Input 
                      value={editingItem.name} 
                      onChange={e => setEditingItem({...editingItem, name: e.target.value})} 
                      required
                    />
                  </div>
                  <div>
                    <Label>Dirección</Label>
                    <Input 
                      value={editingItem.address} 
                      onChange={e => setEditingItem({...editingItem, address: e.target.value})} 
                      required
                    />
                  </div>
                  <div>
                    <Label>Descripción</Label>
                    <Textarea 
                      value={editingItem.description || ''} 
                      onChange={e => setEditingItem({...editingItem, description: e.target.value})}
                    />
                  </div>
                </>
              )}
              {editType === 'faculty' && (
                <>
                  <div>
                    <Label>Nombre</Label>
                    <Input 
                      value={editingItem.name} 
                      onChange={e => setEditingItem({...editingItem, name: e.target.value})} 
                      required
                    />
                  </div>
                  <div>
                    <Label>Decano</Label>
                    <Input 
                      value={editingItem.dean_name} 
                      onChange={e => setEditingItem({...editingItem, dean_name: e.target.value})} 
                      required
                    />
                  </div>
                  <div>
                    <Label>Descripción</Label>
                    <Textarea 
                      value={editingItem.description || ''} 
                      onChange={e => setEditingItem({...editingItem, description: e.target.value})}
                    />
                  </div>
                </>
              )}
              {editType === 'program' && (
                <>
                  <div>
                    <Label>Nombre</Label>
                    <Input 
                      value={editingItem.name} 
                      onChange={e => setEditingItem({...editingItem, name: e.target.value})} 
                      required
                    />
                  </div>
                  <div>
                    <Label>Director</Label>
                    <Input 
                      value={editingItem.director_name} 
                      onChange={e => setEditingItem({...editingItem, director_name: e.target.value})} 
                      required
                    />
                  </div>
                  <div>
                    <Label>Email Director</Label>
                    <Input 
                      type="email" 
                      value={editingItem.director_email} 
                      onChange={e => setEditingItem({...editingItem, director_email: e.target.value})} 
                      required
                    />
                  </div>
                  <div>
                    <Label>Gestor Asignado</Label>
                    <Select 
                      onValueChange={(value) => setEditingItem({...editingItem, manager_id: value === 'unassigned' ? null : value})} 
                      value={editingItem.manager_id || 'unassigned'}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned">Sin Asignar</SelectItem>
                        {getAvailableManagers(editingItem.campus_id).map(m => (
                          <SelectItem key={m.id} value={m.id}>{m.full_name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Descripción</Label>
                    <Textarea 
                      value={editingItem.description || ''} 
                      onChange={e => setEditingItem({...editingItem, description: e.target.value})}
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
};

export default CampusManagement;
