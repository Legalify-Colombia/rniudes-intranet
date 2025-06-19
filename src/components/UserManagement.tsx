
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  fullName: string;
  documentNumber: string;
  email: string;
  position: string;
  role: string;
  weeklyHours?: number;
  numberOfWeeks?: number;
  totalHours?: number;
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    fullName: "",
    documentNumber: "",
    email: "",
    position: "",
    weeklyHours: 0,
    numberOfWeeks: 16,
  });

  const positions = [
    "Director DRNI",
    "Coordinador de Campus",
    "Director de Programa",
    "Gestor de Internacionalización"
  ];

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

  const handlePositionChange = (position: string) => {
    setFormData(prev => ({
      ...prev,
      position,
    }));
  };

  const calculateTotalHours = () => {
    return formData.weeklyHours * formData.numberOfWeeks;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newUser: User = {
      id: editingUser?.id || Date.now().toString(),
      fullName: formData.fullName,
      documentNumber: formData.documentNumber,
      email: formData.email,
      position: formData.position,
      role: getRoleFromPosition(formData.position),
      ...(formData.position === "Gestor de Internacionalización" && {
        weeklyHours: formData.weeklyHours,
        numberOfWeeks: formData.numberOfWeeks,
        totalHours: calculateTotalHours(),
      }),
    };

    if (editingUser) {
      setUsers(users.map(user => user.id === editingUser.id ? newUser : user));
      toast({ title: "Usuario actualizado exitosamente" });
    } else {
      setUsers([...users, newUser]);
      toast({ title: "Usuario creado exitosamente" });
    }

    setFormData({
      fullName: "",
      documentNumber: "",
      email: "",
      position: "",
      weeklyHours: 0,
      numberOfWeeks: 16,
    });
    setEditingUser(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      fullName: user.fullName,
      documentNumber: user.documentNumber,
      email: user.email,
      position: user.position,
      weeklyHours: user.weeklyHours || 0,
      numberOfWeeks: user.numberOfWeeks || 16,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setUsers(users.filter(user => user.id !== id));
    toast({ title: "Usuario eliminado exitosamente" });
  };

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
              
              <div className="space-y-2">
                <Label htmlFor="position">Cargo</Label>
                <Select value={formData.position} onValueChange={handlePositionChange}>
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

              {formData.position && (
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
                <TableCell className="font-medium">{user.fullName}</TableCell>
                <TableCell>{user.documentNumber}</TableCell>
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
                <TableCell>{user.totalHours || '-'}</TableCell>
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
