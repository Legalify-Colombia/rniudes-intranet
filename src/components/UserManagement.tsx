import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

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
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    fullName: "",
    documentNumber: "",
    email: "",
    password: "",
    position: "",
    weeklyHours: 0,
    numberOfWeeks: 16,
  });

  const positions = [
    "Director DRNI",
    "Coordinador de Campus",
    "Director de Programa",
    "Gestor de Internacionalización"
  ].filter(Boolean); // Remove any falsy values

  const getRoleFromPosition = (position: string) => {
    switch (position) {
      case "Director DRNI":
      case "Coordinador de Campus":
        return "Administrador";
      case "Director de Programa":
        return "Coordinador";
      case "Gestor de Internacionalización":
        return "Gestor";
      default:
        return "";
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name');
      
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
    } finally {
      setLoading(false);
    }
  };

  const handlePositionChange = (position: string) => {
    // Only set position if it's not empty and is a valid position
    if (position && position.trim() !== "" && positions.includes(position)) {
      setFormData(prev => ({
        ...prev,
        position,
      }));
    }
  };

  const calculateTotalHours = () => {
    return formData.weeklyHours * formData.numberOfWeeks;
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

    try {
      if (editingUser) {
        // Update existing user
        const updates = {
          full_name: formData.fullName,
          document_number: formData.documentNumber,
          email: formData.email,
          position: formData.position,
          role: getRoleFromPosition(formData.position),
          ...(formData.position === "Gestor de Internacionalización" && {
            weekly_hours: formData.weeklyHours,
            number_of_weeks: formData.numberOfWeeks,
            total_hours: calculateTotalHours(),
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

        const { error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.fullName,
              document_number: formData.documentNumber,
              position: formData.position,
              role: getRoleFromPosition(formData.position),
              weekly_hours: formData.weeklyHours,
              number_of_weeks: formData.numberOfWeeks,
              total_hours: totalHours,
            }
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
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="institutional-gradient text-white">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Usuario
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
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
              
              <div className="space-y-2">
                <Label htmlFor="position">Cargo</Label>
                <Select 
                  value={formData.position || ""} 
                  onValueChange={handlePositionChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar cargo" />
                  </SelectTrigger>
                  <SelectContent>
                    {positions.map((position) => (
                      <SelectItem key={position} value={position}>
                        {position}
                      </SelectItem>
                    ))}
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
      </CardHeader>
      
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre Completo</TableHead>
              <TableHead>Documento</TableHead>
              <TableHead>Correo</TableHead>
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
            No hay usuarios registrados. Crear el primer usuario.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
