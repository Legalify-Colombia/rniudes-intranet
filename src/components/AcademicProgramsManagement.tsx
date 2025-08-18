import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAcademicPrograms } from "@/hooks/useAcademicPrograms";
import { useUsers } from "@/hooks/useUsers";
import { useCampus } from "@/hooks/useCampus";
import { useFaculties } from "@/hooks/useFaculties";
import { useAuth } from "@/hooks/useAuth";
import { Plus, Edit, Trash2, User } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export function AcademicProgramsManagement() {
  const { profile } = useAuth();
  const { toast } = useToast();
  
  const { 
    fetchAcademicPrograms, 
    createAcademicProgram, 
    updateAcademicProgram, 
    deleteAcademicProgram 
  } = useAcademicPrograms();
  
  const { fetchUsersByCampus } = useUsers();
  const { fetchCampus } = useCampus();
  const { fetchFaculties } = useFaculties();
  
  const [programs, setPrograms] = useState([]);
  const [campusList, setCampusList] = useState([]);
  const [facultiesList, setFacultiesList] = useState([]);
  const [managersList, setManagersList] = useState([]);
  const [directorsList, setDirectorsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState(null);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    director_name: "",
    director_email: "",
    campus_id: "",
    faculty_id: "",
    manager_id: "",
    coordinador_id: ""
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [programsResult, campusResult, facultiesResult, usersResult] = await Promise.all([
        fetchAcademicPrograms(),
        fetchCampus(),
        fetchFaculties(),
        fetchUsersByCampus()
      ]);

      setPrograms(programsResult.data || []);
      setCampusList(campusResult.data || []);
      setFacultiesList(facultiesResult.data || []);
      
      const users = usersResult.data || [];
      setManagersList(users.filter(user => user.role === 'Gestor'));
      // Permitir que cualquier usuario registrado pueda ser director de programa
      setDirectorsList(users.filter(user => user.role !== 'Gestor'));
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Error al cargar los datos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProgram) {
        await updateAcademicProgram(editingProgram.id, formData);
        toast({
          title: "Éxito",
          description: "Programa académico actualizado correctamente",
        });
      } else {
        await createAcademicProgram(formData);
        toast({
          title: "Éxito",
          description: "Programa académico creado correctamente",
        });
      }
      
      setDialogOpen(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error saving program:', error);
      toast({
        title: "Error",
        description: "Error al guardar el programa académico",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (program) => {
    setEditingProgram(program);
    setFormData({
      name: program.name || "",
      description: program.description || "",
      director_name: program.director_name || "",
      director_email: program.director_email || "",
      campus_id: program.campus_id || "",
      faculty_id: program.faculty_id || "",
      manager_id: program.manager_id || "",
      coordinador_id: program.coordinador_id || ""
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este programa?')) {
      try {
        await deleteAcademicProgram(id);
        toast({
          title: "Éxito",
          description: "Programa académico eliminado correctamente",
        });
        loadData();
      } catch (error) {
        console.error('Error deleting program:', error);
        toast({
          title: "Error",
          description: "Error al eliminar el programa académico",
          variant: "destructive",
        });
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      director_name: "",
      director_email: "",
      campus_id: "",
      faculty_id: "",
      manager_id: "",
      coordinador_id: ""
    });
    setEditingProgram(null);
  };

  if (profile?.role !== 'Administrador' && profile?.role !== 'Coordinador') {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No tienes permisos para acceder a esta sección.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Gestión de Programas Académicos</CardTitle>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Nuevo Programa
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingProgram ? 'Editar Programa' : 'Nuevo Programa Académico'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nombre del Programa</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="campus_id">Campus</Label>
                      <Select
                        value={formData.campus_id}
                        onValueChange={(value) => setFormData({ ...formData, campus_id: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar campus" />
                        </SelectTrigger>
                        <SelectContent>
                          {campusList.map((campus) => (
                            <SelectItem key={campus.id} value={campus.id}>
                              {campus.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="faculty_id">Facultad</Label>
                      <Select
                        value={formData.faculty_id}
                        onValueChange={(value) => setFormData({ ...formData, faculty_id: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar facultad" />
                        </SelectTrigger>
                        <SelectContent>
                          {facultiesList.map((faculty) => (
                            <SelectItem key={faculty.id} value={faculty.id}>
                              {faculty.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="manager_id">Gestor Asignado</Label>
                      <Select
                        value={formData.manager_id}
                        onValueChange={(value) => setFormData({ ...formData, manager_id: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar gestor" />
                        </SelectTrigger>
                        <SelectContent>
                          {managersList.map((manager) => (
                            <SelectItem key={manager.id} value={manager.id}>
                              {manager.full_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="coordinador_id">Director de Programa</Label>
                      <Select
                        value={formData.coordinador_id}
                        onValueChange={(value) => setFormData({ ...formData, coordinador_id: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar director" />
                        </SelectTrigger>
                        <SelectContent>
                          {directorsList.map((director) => (
                            <SelectItem key={director.id} value={director.id}>
                              {director.full_name} - {director.email} ({director.role})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="director_name">Nombre del Director (Manual)</Label>
                      <Input
                        id="director_name"
                        value={formData.director_name}
                        onChange={(e) => setFormData({ ...formData, director_name: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="director_email">Email del Director</Label>
                    <Input
                      id="director_email"
                      type="email"
                      value={formData.director_email}
                      onChange={(e) => setFormData({ ...formData, director_email: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descripción</Label>
                    <Input
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit">
                      {editingProgram ? 'Actualizar' : 'Crear'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Programa</th>
                  <th className="text-left p-2">Campus</th>
                  <th className="text-left p-2">Facultad</th>
                  <th className="text-left p-2">Gestor</th>
                  <th className="text-left p-2">Director</th>
                  <th className="text-left p-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {programs.map((program) => (
                  <tr key={program.id} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-medium">{program.name}</td>
                    <td className="p-2">{program.campus?.name || 'N/A'}</td>
                    <td className="p-2">{program.faculty?.name || 'N/A'}</td>
                    <td className="p-2">
                      {program.manager ? (
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-green-500" />
                          {program.manager.full_name}
                        </div>
                      ) : (
                        <span className="text-gray-400">Sin asignar</span>
                      )}
                    </td>
                    <td className="p-2">
                      {program.coordinador ? (
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-blue-500" />
                          {program.coordinador.full_name}
                        </div>
                      ) : program.director_name ? (
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-500" />
                          {program.director_name}
                        </div>
                      ) : (
                        <span className="text-gray-400">Sin asignar</span>
                      )}
                    </td>
                    <td className="p-2">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(program)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(program.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}