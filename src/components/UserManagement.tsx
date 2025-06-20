
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { getValidPositions, getRoleFromPosition, validatePosition, type Position } from '@/utils/positionUtils';
import { CampusSelector } from "./CampusSelector";
import { useSupabaseData } from "@/hooks/useSupabaseData";

interface User {
  id: string;
  full_name: string;
  document_number: string;
  email: string;
  position: string;
  role: string;
  weekly_hours?: number;
  number_of_weeks?: number;
  total_hours?: number;
  campus_id?: string;
  managed_campus_ids?: string[];
  campus?: {
    id: string;
    name: string;
  };
}

interface Campus {
  id: string;
  name: string;
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userManagedCampus, setUserManagedCampus] = useState<string[]>([]);
  const [selectedFilterCampus, setSelectedFilterCampus] = useState<string[]>([]);
  const { toast } = useToast();
  const { profile } = useAuth();

  const {
    fetchCampus,
    fetchUsersByCampus,
    getUserManagedCampus,
    updateUserCampusAccess
  } = useSupabaseData();

  const [formData, setFormData] = useState({
    fullName: "",
    documentNumber: "",
    email: "",
    password: "",
    position: "",
    campusId: "",
    managedCampusIds: [] as string[],
    weeklyHours: 0,
    numberOfWeeks: 16,
  });

  // Get positions and ensure they're all valid
  const positions = getValidPositions().filter(pos => pos && pos.trim().length > 0);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (userManagedCampus.length > 0 || profile?.role === 'Administrador') {
      loadUsers();
    }
  }, [selectedFilterCampus, userManagedCampus]);

  const loadInitialData = async () => {
    try {
      // Load campuses
      const { data: campusData } = await fetchCampus();
      setCampuses(campusData || []);

      // Load user's managed campus if they are an admin
      if (profile?.id && profile?.role === 'Administrador') {
        const { data: managedData } = await getUserManagedCampus(profile.id);
        if (managedData) {
          const managedIds = managedData.managed_campus_ids || 
            (managedData.campus_id ? [managedData.campus_id] : []);
          setUserManagedCampus(managedIds);
          setSelectedFilterCampus(managedIds);
        }
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos iniciales",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const campusFilter = selectedFilterCampus.length > 0 ? selectedFilterCampus : userManagedCampus;
      const { data, error } = await fetchUsersByCampus(
        profile?.role === 'Administrador' && userManagedCampus.length === 0 ? undefined : campusFilter
      );
      
      if (error) {
        console.error('Error loading users:', error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los usuarios",
          variant: "destructive"
        });
        return;
      }

      setUsers(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const handlePositionChange = (position: string) => {
    console.log('UserManagement - Position change called with:', position, 'Type:', typeof position);
    
    if (position && typeof position === 'string' && position.trim().length > 0 && validatePosition(position)) {
      console.log('UserManagement - Setting valid position:', position);
      setFormData(prev => ({
        ...prev,
        position: position.trim(),
      }));
    } else {
      console.log('UserManagement - Invalid position detected, not setting:', position);
      setFormData(prev => ({ ...prev, position: '' }));
    }
  };

  const calculateTotalHours = () => {
    return formData.weeklyHours * formData.numberOfWeeks;
  };

  const canCreateUserInCampus = (campusId: string) => {
    if (profile?.role !== 'Administrador') return false;
    return userManagedCampus.length === 0 || userManagedCampus.includes(campusId);
  };

  const getAvailableCampuses = () => {
    if (profile?.role === 'Administrador' && userManagedCampus.length === 0) {
      return campuses; // Super admin can see all campuses
    }
    return campuses.filter(campus => userManagedCampus.includes(campus.id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingUser && !formData.password) {
      toast({
        title: "Error",
        description: "La contraseña es requerida para nuevos usuarios",
        variant: "destructive"
      });
      return;
    }

    if (!formData.position || formData.position.trim() === "") {
      toast({
        title: "Error",
        description: "El cargo es requerido",
        variant: "destructive"
      });
      return;
    }

    if (!formData.campusId) {
      toast({
        title: "Error",
        description: "El campus es requerido",
        variant: "destructive"
      });
      return;
    }

    if (!canCreateUserInCampus(formData.campusId)) {
      toast({
        title: "Error",
        description: "No tiene permisos para crear usuarios en este campus",
        variant: "destructive"
      });
      return;
    }

    try {
      if (editingUser) {
        // Update existing user
        const updates = {
          full_name: formData.fullName,
          document_number: formData.documentNumber,
          email: formData.email,
          position: formData.position,
          role: getRoleFromPosition(formData.position),
          campus_id: formData.campusId,
          ...(formData.position === "Gestor de Internacionalización" && {
            weekly_hours: formData.weeklyHours,
            number_of_weeks: formData.numberOfWeeks,
            total_hours: calculateTotalHours(),
          }),
          ...(getRoleFromPosition(formData.position) === 'Administrador' && {
            managed_campus_ids: formData.managedCampusIds.length > 0 ? formData.managedCampusIds : null,
          }),
        };

        const { error } = await supabase
          .from('profiles')
          .update(updates)
          .eq('id', editingUser.id);

        if (error) {
          console.error('Error updating user:', error);
          toast({
            title: "Error",
            description: "No se pudo actualizar el usuario",
            variant: "destructive"
          });
          return;
        }

        toast({ title: "Usuario actualizado exitosamente" });
      } else {
        // Create new user
        const totalHours = formData.position === "Gestor de Internacionalización" 
          ? calculateTotalHours() 
          : undefined;

        const userData = {
          full_name: formData.fullName,
          document_number: formData.documentNumber,
          position: formData.position,
          role: getRoleFromPosition(formData.position),
          campus_id: formData.campusId,
          weekly_hours: formData.weeklyHours,
          number_of_weeks: formData.numberOfWeeks,
          total_hours: totalHours,
          ...(getRoleFromPosition(formData.position) === 'Administrador' && {
            managed_campus_ids: formData.managedCampusIds.length > 0 ? formData.managedCampusIds : null,
          }),
        };

        const { error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: userData
          }
        });

        if (error) {
          console.error('Error creating user:', error);
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive"
          });
          return;
        }

        toast({ title: "Usuario creado exitosamente" });
      }

      setFormData({
        fullName: "",
        documentNumber: "",
        email: "",
        password: "",
        position: "",
        campusId: "",
        managedCampusIds: [],
        weeklyHours: 0,
        numberOfWeeks: 16,
      });
      setEditingUser(null);
      setIsDialogOpen(false);
      loadUsers();
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Error",
        description: "Ocurrió un error inesperado",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      fullName: user.full_name,
      documentNumber: user.document_number,
      email: user.email,
      password: "",
      position: user.position,
      campusId: user.campus_id || "",
      managedCampusIds: user.managed_campus_ids || [],
      weeklyHours: user.weekly_hours || 0,
      numberOfWeeks: user.number_of_weeks || 16,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting user:', error);
        toast({
          title: "Error",
          description: "No se pudo eliminar el usuario",
          variant: "destructive"
        });
        return;
      }

      toast({ title: "Usuario eliminado exitosamente" });
      loadUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleUpdateCampusAccess = async () => {
    if (!profile?.id) return;

    try {
      const { error } = await updateUserCampusAccess(profile.id, selectedFilterCampus);
      if (error) {
        toast({
          title: "Error",
          description: "No se pudo actualizar el acceso a campus",
          variant: "destructive"
        });
        return;
      }

      setUserManagedCampus(selectedFilterCampus);
      toast({
        title: "Éxito",
        description: "Acceso a campus actualizado correctamente"
      });
    } catch (error) {
      console.error('Error updating campus access:', error);
    }
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="p-8">
          <div className="flex justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
              <p className="mt-4 text-gray-600">Cargando usuarios...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-2xl font-bold text-primary">Gestión de Usuarios</CardTitle>
        <div className="flex gap-2">
          {profile?.role === 'Administrador' && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  Gestionar Campus
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Gestionar Acceso a Campus</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <CampusSelector
                    campuses={campuses}
                    selectedCampusIds={selectedFilterCampus}
                    onSelectionChange={setSelectedFilterCampus}
                    mode="multiple"
                    label="Campus que puede gestionar"
                    placeholder="Seleccionar campus"
                  />
                  <div className="flex justify-end space-x-2">
                    <Button onClick={handleUpdateCampusAccess}>
                      Guardar Cambios
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="institutional-gradient text-white">
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Usuario
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingUser ? "Editar Usuario" : "Crear Nuevo Usuario"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nombre Completo</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="documentNumber">No. de Documento de Identidad</Label>
                  <Input
                    id="documentNumber"
                    value={formData.documentNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, documentNumber: e.target.value }))}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>

                {!editingUser && (
                  <div className="space-y-2">
                    <Label htmlFor="password">Contraseña</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      required
                      placeholder="Mínimo 6 caracteres"
                    />
                  </div>
                )}

                <CampusSelector
                  campuses={getAvailableCampuses()}
                  selectedCampusIds={formData.campusId ? [formData.campusId] : []}
                  onSelectionChange={(ids) => setFormData(prev => ({ ...prev, campusId: ids[0] || "" }))}
                  mode="single"
                  label="Campus"
                  placeholder="Seleccionar campus"
                  required
                />
                
                <div className="space-y-2">
                  <Label htmlFor="position">Cargo</Label>
                  <Select 
                    value={formData.position || undefined} 
                    onValueChange={handlePositionChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar cargo" />
                    </SelectTrigger>
                    <SelectContent>
                      {positions.map((position) => {
                        if (!position || typeof position !== 'string' || position.trim().length === 0) {
                          console.warn('UserManagement - Skipping invalid position:', position);
                          return null;
                        }
                        return (
                          <SelectItem key={position} value={position}>
                            {position}
                          </SelectItem>
                        );
                      }).filter(Boolean)}
                    </SelectContent>
                  </Select>
                </div>

                {formData.position && formData.position.trim() !== "" && (
                  <div className="space-y-2">
                    <Label>Rol en el Sistema</Label>
                    <Input
                      value={getRoleFromPosition(formData.position)}
                      disabled
                      className="bg-gray-100"
                    />
                  </div>
                )}

                {getRoleFromPosition(formData.position) === 'Administrador' && (
                  <CampusSelector
                    campuses={getAvailableCampuses()}
                    selectedCampusIds={formData.managedCampusIds}
                    onSelectionChange={(ids) => setFormData(prev => ({ ...prev, managedCampusIds: ids }))}
                    mode="multiple"
                    label="Campus que puede gestionar (Opcional)"
                    placeholder="Seleccionar campus a gestionar"
                  />
                )}

                {formData.position === "Gestor de Internacionalización" && (
                  <div className="space-y-4 border-t pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="weeklyHours">Horas Semanales Asignadas</Label>
                      <Input
                        id="weeklyHours"
                        type="number"
                        value={formData.weeklyHours}
                        onChange={(e) => setFormData(prev => ({ ...prev, weeklyHours: parseInt(e.target.value) || 0 }))}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="numberOfWeeks">Número de Semanas</Label>
                      <Input
                        id="numberOfWeeks"
                        type="number"
                        value={formData.numberOfWeeks}
                        onChange={(e) => setFormData(prev => ({ ...prev, numberOfWeeks: parseInt(e.target.value) || 16 }))}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Total de Horas Disponibles</Label>
                      <Input
                        value={calculateTotalHours()}
                        disabled
                        className="bg-blue-50 font-semibold"
                      />
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" className="institutional-gradient text-white">
                    {editingUser ? "Actualizar" : "Crear"} Usuario
                  </Button>
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
              <TableHead>Nombre Completo</TableHead>
              <TableHead>Documento</TableHead>
              <TableHead>Correo</TableHead>
              <TableHead>Campus</TableHead>
              <TableHead>Cargo</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Horas Totales</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.full_name}</TableCell>
                <TableCell>{user.document_number}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.campus?.name || 'Sin asignar'}</TableCell>
                <TableCell>{user.position}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user.role === 'Administrador' ? 'bg-blue-100 text-blue-800' :
                    user.role === 'Coordinador' ? 'bg-green-100 text-green-800' :
                    'bg-orange-100 text-orange-800'
                  }`}>
                    {user.role}
                  </span>
                </TableCell>
                <TableCell>{user.total_hours || '-'}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(user)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDelete(user.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {users.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No hay usuarios registrados en los campus seleccionados. Crear el primer usuario.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
