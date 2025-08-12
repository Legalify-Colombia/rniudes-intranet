import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { Plus, Edit, Save, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export function UserManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [campuses, setCampuses] = useState<any[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const { profile } = useAuth();
  const { toast } = useToast();
  const { fetchUsersByCampus, fetchCampus, updateUserProfile } = useSupabaseData();

  const [userForm, setUserForm] = useState({
    email: '',
    password: '',
    full_name: '',
    document_number: '',
    position: '',
    role: '',
    weekly_hours: '',
    number_of_weeks: '16',
    total_hours: '',
    campus_id: '',
    managed_campus_ids: [] as string[]
  });

  const [editForm, setEditForm] = useState({
    weekly_hours: '',
    number_of_weeks: '',
    managed_campus_ids: [] as string[]
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Calculate total hours when weekly hours or weeks change
    const weeklyHours = parseInt(userForm.weekly_hours) || 0;
    const numberOfWeeks = parseInt(userForm.number_of_weeks) || 16;
    const totalHours = weeklyHours * numberOfWeeks;
    
    if (userForm.weekly_hours && totalHours !== parseInt(userForm.total_hours)) {
      setUserForm(prev => ({ ...prev, total_hours: totalHours.toString() }));
    }
  }, [userForm.weekly_hours, userForm.number_of_weeks]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Load campuses
      const campusResult = await fetchCampus();
      if (campusResult.data) {
        // Filter campuses with valid IDs
        const validCampuses = campusResult.data.filter(campus => 
          campus.id && 
          typeof campus.id === 'string' && 
          campus.id.trim().length > 0
        );
        setCampuses(validCampuses);
      }

      // For super admin, load all users. For campus admin, load only their managed campuses
      let campusIds: string[] | undefined;
      if (profile?.role === 'Administrador' && profile.managed_campus_ids) {
        campusIds = profile.managed_campus_ids;
      }

      const usersResult = await fetchUsersByCampus(campusIds);
      if (usersResult.data) {
        setUsers(usersResult.data);
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

  const handlePositionChange = (position: string) => {
    let role = '';
    
    switch (position) {
      case 'Director DRNI':
      case 'Coordinador de Campus':
        role = 'Administrador';
        break;
      case 'Director de Programa':
        role = 'Coordinador';
        break;
      case 'Gestor de Internacionalización':
        role = 'Gestor';
        break;
      default:
        role = '';
    }
    
    setUserForm(prev => ({ 
      ...prev, 
      position: position,
      role: role 
    }));
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userForm.email || !userForm.full_name || !userForm.position || !userForm.password) {
      toast({
        title: "Error de validación",
        description: "Email, nombre completo, cargo y contraseña son obligatorios",
        variant: "destructive",
      });
      return;
    }

    if (userForm.role === 'Gestor' && (!userForm.weekly_hours || !userForm.campus_id)) {
      toast({
        title: "Error de validación",
        description: "Para gestores, las horas semanales y el campus son obligatorios",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      
      // CORRECCIÓN: Asegurar que los campos numéricos sean null si están vacíos
      const weeklyHours = userForm.weekly_hours ? parseInt(userForm.weekly_hours) : null;
      const numberOfWeeks = userForm.number_of_weeks ? parseInt(userForm.number_of_weeks) : null;
      const totalHours = weeklyHours && numberOfWeeks ? weeklyHours * numberOfWeeks : null;

      const userData = {
        email: userForm.email,
        password: userForm.password,
        email_confirm: true,
        user_metadata: {
          full_name: userForm.full_name,
          document_number: userForm.document_number,
          position: userForm.position,
          role: userForm.role,
          weekly_hours: weeklyHours,
          number_of_weeks: numberOfWeeks,
          total_hours: totalHours,
          campus_id: userForm.campus_id || null,
          managed_campus_ids: userForm.role === 'Administrador' ? userForm.managed_campus_ids : null
        }
      };

      const { data, error } = await supabase.auth.admin.createUser(userData);

      if (error) {
        console.error("Error creating user:", error);
        toast({
          title: "Error",
          description: "Error al crear el usuario: " + error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Éxito",
        description: "Usuario creado correctamente",
      });

      setUserForm({
        email: '',
        password: '',
        full_name: '',
        document_number: '',
        position: '',
        role: '',
        weekly_hours: '',
        number_of_weeks: '16',
        total_hours: '',
        campus_id: '',
        managed_campus_ids: []
      });
      
      setIsCreateDialogOpen(false);
      await loadData();
    } catch (error) {
      console.error("Error creating user:", error);
      toast({
        title: "Error",
        description: "Error inesperado al crear el usuario",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const startEditUser = (user: any) => {
    setEditingUser(user.id);
    setEditForm({
      weekly_hours: user.weekly_hours?.toString() || '',
      number_of_weeks: user.number_of_weeks?.toString() || '16',
      managed_campus_ids: user.managed_campus_ids || []
    });
  };

  const cancelEdit = () => {
    setEditingUser(null);
    setEditForm({
      weekly_hours: '',
      number_of_weeks: '',
      managed_campus_ids: []
    });
  };

  const saveUserChanges = async (userId: string) => {
    try {
      setIsLoading(true);
      
      // CORRECCIÓN: Asegurar que los campos numéricos sean null si están vacíos
      const weeklyHours = editForm.weekly_hours ? parseInt(editForm.weekly_hours) : null;
      const numberOfWeeks = editForm.number_of_weeks ? parseInt(editForm.number_of_weeks) : null;
      const totalHours = weeklyHours && numberOfWeeks ? weeklyHours * numberOfWeeks : null;

      const updates: any = {
        weekly_hours: weeklyHours,
        number_of_weeks: numberOfWeeks,
        total_hours: totalHours
      };

      // Only update managed_campus_ids for administrators
      const user = users.find(u => u.id === userId);
      if (user?.role === 'Administrador') {
        updates.managed_campus_ids = editForm.managed_campus_ids.length > 0 ? editForm.managed_campus_ids : null;
      }

      const { data, error } = await updateUserProfile(userId, updates);

      if (error) {
        console.error("Error updating user:", error);
        toast({
          title: "Error",
          description: "Error al actualizar el usuario: " + error.message,
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Éxito",
        description: "Usuario actualizado correctamente",
      });

      setEditingUser(null);
      await loadData();
    } catch (error) {
      console.error("Error updating user:", error);
      toast({
        title: "Error",
        description: "Error inesperado al actualizar el usuario",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'Administrador':
        return 'bg-red-100 text-red-800';
      case 'Coordinador':
        return 'bg-blue-100 text-blue-800';
      case 'Gestor':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCampusName = (campusId: string) => {
    const campus = campuses.find(c => c.id === campusId);
    return campus?.name || 'Sin asignar';
  };

  const getManagedCampusNames = (campusIds: string[]) => {
    if (!campusIds || campusIds.length === 0) return 'Todos los campus';
    return campusIds.map(id => getCampusName(id)).join(', ');
  };

  const canManageUser = (user: any) => {
    if (profile?.role === 'Administrador') {
      // Super admin can manage all
      if (!profile.managed_campus_ids) return true;
      // Campus admin can only manage users in their campuses
      return user.campus_id && profile.managed_campus_ids.includes(user.campus_id);
    }
    return false;
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
          <div className="flex items-center justify-between">
            <CardTitle>Gestión de Usuarios</CardTitle>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="institutional-gradient text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo Usuario
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Crear Nuevo Usuario</DialogTitle>
                </DialogHeader>
                
                <form onSubmit={handleCreateUser} className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={userForm.email}
                      onChange={(e) => setUserForm(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="password">Contraseña</Label>
                    <Input
                      id="password"
                      type="password"
                      value={userForm.password}
                      onChange={(e) => setUserForm(prev => ({ ...prev, password: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="full_name">Nombre Completo</Label>
                    <Input
                      id="full_name"
                      value={userForm.full_name}
                      onChange={(e) => setUserForm(prev => ({ ...prev, full_name: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="document_number">Número de Documento</Label>
                    <Input
                      id="document_number"
                      value={userForm.document_number}
                      onChange={(e) => setUserForm(prev => ({ ...prev, document_number: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="position">Cargo</Label>
                    <Select onValueChange={handlePositionChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar cargo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Director DRNI">Director DRNI</SelectItem>
                        <SelectItem value="Coordinador de Campus">Coordinador de Campus</SelectItem>
                        <SelectItem value="Director de Programa">Director de Programa</SelectItem>
                        <SelectItem value="Gestor de Internacionalización">Gestor de Internacionalización</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {userForm.role && (
                    <div>
                      <Label>Rol Asignado</Label>
                      <div className="p-2 bg-gray-100 rounded">
                        <Badge className={getRoleBadgeColor(userForm.role)}>
                          {userForm.role}
                        </Badge>
                      </div>
                    </div>
                  )}

                  {(userForm.role === 'Gestor' || userForm.role === 'Coordinador' || userForm.role === 'Administrador') && (
                    <div>
                      <Label htmlFor="campus_id">Campus</Label>
                      <Select onValueChange={(value) => setUserForm(prev => ({ ...prev, campus_id: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar campus" />
                        </SelectTrigger>
                        <SelectContent>
                          {campuses.map(campus => {
                            // Validate campus ID before rendering
                            if (!campus.id || typeof campus.id !== 'string' || campus.id.trim().length === 0) {
                              console.warn('UserManagement - Skipping invalid campus:', campus);
                              return null;
                            }
                            return (
                              <SelectItem key={campus.id} value={campus.id}>
                                {campus.name}
                              </SelectItem>
                            );
                          }).filter(Boolean)}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  
                  {userForm.role === 'Gestor' && (
                    <>
                      <div>
                        <Label htmlFor="weekly_hours">Horas Semanales</Label>
                        <Input
                          id="weekly_hours"
                          type="number"
                          value={userForm.weekly_hours}
                          onChange={(e) => setUserForm(prev => ({ ...prev, weekly_hours: e.target.value }))}
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="number_of_weeks">Número de Semanas</Label>
                        <Input
                          id="number_of_weeks"
                          type="number"
                          value={userForm.number_of_weeks}
                          onChange={(e) => setUserForm(prev => ({ ...prev, number_of_weeks: e.target.value }))}
                        />
                      </div>

                      {userForm.weekly_hours && (
                        <div>
                          <Label>Total de Horas</Label>
                          <div className="p-2 bg-blue-50 rounded">
                            <span className="font-medium text-blue-800">
                              {userForm.total_hours} horas
                            </span>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {userForm.role === 'Administrador' && (
                    <div>
                      <Label>Campus que puede gestionar</Label>
                      <div className="mt-2 space-y-2 max-h-32 overflow-y-auto">
                        {campuses.map(campus => {
                          // Validate campus ID before rendering
                          if (!campus.id || typeof campus.id !== 'string' || campus.id.trim().length === 0) {
                            console.warn('UserManagement - Skipping invalid campus for checkbox:', campus);
                            return null;
                          }
                          return (
                            <div key={campus.id} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={`campus_${campus.id}`}
                                checked={userForm.managed_campus_ids.includes(campus.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setUserForm(prev => ({
                                      ...prev,
                                      managed_campus_ids: [...prev.managed_campus_ids, campus.id]
                                    }));
                                  } else {
                                    setUserForm(prev => ({
                                      ...prev,
                                      managed_campus_ids: prev.managed_campus_ids.filter(id => id !== campus.id)
                                    }));
                                  }
                                }}
                                className="w-3 h-3"
                              />
                              <label htmlFor={`campus_${campus.id}`} className="text-xs">
                                {campus.name}
                              </label>
                            </div>
                          );
                        }).filter(Boolean)}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Si no selecciona ninguno, podrá gestionar todos los campus
                      </p>
                    </div>
                  )}
                  
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit" className="institutional-gradient text-white" disabled={isLoading}>
                      {isLoading ? 'Creando...' : 'Crear Usuario'}
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
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Campus</TableHead>
                <TableHead>Horas/Semana</TableHead>
                <TableHead>Total Horas</TableHead>
                <TableHead>Campus Gestionados</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user: any) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.full_name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.position}</TableCell>
                  <TableCell>
                    <Badge className={getRoleBadgeColor(user.role)}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>{getCampusName(user.campus_id)}</TableCell>
                  <TableCell>
                    {editingUser === user.id ? (
                      <div className="flex items-center space-x-2">
                        <Input
                          type="number"
                          value={editForm.weekly_hours}
                          onChange={(e) => setEditForm(prev => ({ ...prev, weekly_hours: e.target.value }))}
                          className="w-20"
                          placeholder="Horas"
                        />
                      </div>
                    ) : (
                      <span>{user.weekly_hours || '-'}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingUser === user.id ? (
                      <span>{editForm.weekly_hours ? parseInt(editForm.weekly_hours) * parseInt(editForm.number_of_weeks) : user.total_hours}</span>
                    ) : (
                      <span>{user.total_hours || '-'}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingUser === user.id && user.role === 'Administrador' ? (
                      <div className="max-w-xs">
                        <div className="space-y-1 max-h-20 overflow-y-auto">
                          {campuses.map(campus => {
                            // Validate campus ID before rendering
                            if (!campus.id || typeof campus.id !== 'string' || campus.id.trim().length === 0) {
                              console.warn('UserManagement - Skipping invalid campus for edit:', campus);
                              return null;
                            }
                            return (
                              <div key={campus.id} className="flex items-center space-x-1">
                                <input
                                  type="checkbox"
                                  id={`edit_campus_${campus.id}`}
                                  checked={editForm.managed_campus_ids.includes(campus.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setEditForm(prev => ({
                                        ...prev,
                                        managed_campus_ids: [...prev.managed_campus_ids, campus.id]
                                      }));
                                    } else {
                                      setEditForm(prev => ({
                                        ...prev,
                                        managed_campus_ids: prev.managed_campus_ids.filter(id => id !== campus.id)
                                      }));
                                    }
                                  }}
                                  className="w-3 h-3"
                                />
                                <label htmlFor={`edit_campus_${campus.id}`} className="text-xs">
                                  {campus.name}
                                </label>
                              </div>
                            );
                          }).filter(Boolean)}
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm">
                        {user.role === 'Administrador' 
                          ? getManagedCampusNames(user.managed_campus_ids)
                          : '-'
                        }
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {canManageUser(user) && (
                      <div className="flex space-x-2">
                        {editingUser === user.id ? (
                          <>
                            <Button 
                              size="sm" 
                              onClick={() => saveUserChanges(user.id)}
                              disabled={isLoading}
                            >
                              <Save className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={cancelEdit}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </>
                        ) : (
                          (user.role === 'Gestor' || user.role === 'Administrador') && (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => startEditUser(user)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          )
                        )}
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {users.length === 0 && !isLoading && (
            <div className="text-center py-8 text-gray-500">
              No hay usuarios registrados.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
