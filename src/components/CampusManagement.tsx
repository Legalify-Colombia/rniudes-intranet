import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const campusSchema = z.object({
  name: z.string().min(2, {
    message: "El nombre del campus debe tener al menos 2 caracteres.",
  }),
  description: z.string().optional(),
});

type CampusSchemaType = z.infer<typeof campusSchema>;

export function CampusManagement() {
  const [campuses, setCampuses] = useState<any[]>([]);
  const [faculties, setFaculties] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedCampus, setSelectedCampus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userManagedCampus, setUserManagedCampus] = useState<string[]>([]);
  const { toast } = useToast();

  const {
    fetchCampus,
    createCampus,
    updateCampus,
    deleteCampus,
    fetchFacultiesByCampus,
    getUserManagedCampus,
    profile
  } = useSupabaseData();

  const form = useForm<CampusSchemaType>({
    resolver: zodResolver(campusSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const editForm = useForm<CampusSchemaType>({
    resolver: zodResolver(campusSchema),
    defaultValues: {
      name: "",
      description: "",
    },
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

      // Load campus with proper filtering
      const { data: campusData } = await fetchCampus();
      const filteredCampuses = managedCampusIds.length > 0 
        ? (campusData || []).filter(campus => managedCampusIds.includes(campus.id))
        : campusData || [];
      setCampuses(filteredCampuses);

      // Load faculties with proper filtering
      const { data: facultiesData } = await fetchFacultiesByCampus(managedCampusIds.length > 0 ? managedCampusIds : undefined);
      setFaculties(facultiesData || []);
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

  const onSubmit = async (values: CampusSchemaType) => {
    try {
      const { error } = await createCampus(values);
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
        form.reset();
        setOpen(false);
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

  const onEditSubmit = async (values: CampusSchemaType) => {
    if (!selectedCampus) return;
    try {
      const { error } = await updateCampus(selectedCampus.id, values);
      if (error) {
        toast({
          title: "Error",
          description: "No se pudo actualizar el campus",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Éxito",
          description: "Campus actualizado correctamente",
        });
        editForm.reset();
        setEditOpen(false);
        loadData();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el campus",
        variant: "destructive",
      });
    }
  };

  const onDelete = async (id: string) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este campus?")) {
      return;
    }
    try {
      const { error } = await deleteCampus(id);
      if (error) {
        toast({
          title: "Error",
          description: "No se pudo eliminar el campus",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Éxito",
          description: "Campus eliminado correctamente",
        });
        loadData();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el campus",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (campus: any) => {
    setSelectedCampus(campus);
    editForm.setValue("name", campus.name);
    editForm.setValue("description", campus.description || "");
    setEditOpen(true);
  };

  if (loading) {
    return <div className="flex justify-center p-8">Cargando campus...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            Gestión de Campus
            {userManagedCampus.length > 0 && (
              <span className="text-sm font-normal text-gray-600 block">
                Campus: {campuses.filter(c => userManagedCampus.includes(c.id)).map(c => c.name).join(', ')}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Facultades</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campuses.map((campus) => (
                <TableRow key={campus.id}>
                  <TableCell className="font-medium">{campus.name}</TableCell>
                  <TableCell>{campus.description}</TableCell>
                  <TableCell>
                    {faculties.filter((faculty) => faculty.campus_id === campus.id).length}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        onClick={() => handleEdit(campus)}
                        variant="outline"
                        disabled={!canManageCampus(campus.id)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive" 
                        onClick={() => onDelete(campus.id)}
                        disabled={!canManageCampus(campus.id)}
                      >
                        <Trash className="h-4 w-4 mr-2" />
                        Eliminar
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Agregar Campus
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Campus</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="name">Nombre del Campus</Label>
              <Input id="name" placeholder="Nombre" {...form.register("name")} />
              {form.formState.errors.name && (
                <p className="text-red-500 text-sm">{form.formState.errors.name.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="description">Descripción</Label>
              <Textarea id="description" placeholder="Descripción" {...form.register("description")} />
            </div>
            <Button type="submit">Crear Campus</Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Campus</DialogTitle>
          </DialogHeader>
          {selectedCampus && (
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="name">Nombre del Campus</Label>
                <Input id="name" placeholder="Nombre" {...editForm.register("name")} />
                {editForm.formState.errors.name && (
                  <p className="text-red-500 text-sm">{editForm.formState.errors.name.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea id="description" placeholder="Descripción" {...editForm.register("description")} />
              </div>
              <Button type="submit">Actualizar Campus</Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
