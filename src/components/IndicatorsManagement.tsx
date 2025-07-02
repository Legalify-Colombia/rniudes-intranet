
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { useAuth } from "@/hooks/useAuth";
import { Plus, Edit, Trash2, BarChart3 } from "lucide-react";

type Indicator = {
  id: string;
  name: string;
  data_type: "numeric" | "short_text" | "long_text" | "file" | "link";
  is_active: boolean;
  created_at: string;
  created_by: string;
};

export function IndicatorsManagement() {
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedIndicator, setSelectedIndicator] = useState<Indicator | null>(null);
  const { toast } = useToast();
  const { profile } = useAuth();

  const { fetchIndicators, createIndicator, updateIndicator, deleteIndicator } = useSupabaseData();

  const [formData, setFormData] = useState({
    name: "",
    data_type: "numeric" as "numeric" | "short_text" | "long_text" | "file" | "link",
  });

  useEffect(() => {
    loadIndicators();
  }, []);

  const loadIndicators = async () => {
    const { data, error } = await fetchIndicators();
    if (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los indicadores",
        variant: "destructive",
      });
    } else {
      // Filter indicators with valid IDs and cast data_type
      const typedIndicators = (data || [])
        .filter(indicator => 
          indicator.id && 
          typeof indicator.id === 'string' && 
          indicator.id.trim().length > 0
        )
        .map(indicator => ({
          ...indicator,
          data_type: indicator.data_type as "numeric" | "short_text" | "long_text" | "file" | "link"
        }));
      setIndicators(typedIndicators);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile?.id) {
      toast({
        title: "Error",
        description: "No se pudo identificar el usuario",
        variant: "destructive",
      });
      return;
    }

    const indicatorData = {
      ...formData,
      created_by: profile.id,
      is_active: true
    };

    const { data, error } = await createIndicator(indicatorData);
    
    if (error) {
      console.error('Error creating indicator:', error);
      toast({
        title: "Error",
        description: "No se pudo crear el indicador",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Éxito",
        description: "Indicador creado correctamente",
      });
      setFormData({ name: "", data_type: "numeric" });
      setIsCreateDialogOpen(false);
      loadIndicators();
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIndicator) return;

    const { data, error } = await updateIndicator(selectedIndicator.id, formData);
    
    if (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el indicador",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Éxito",
        description: "Indicador actualizado correctamente",
      });
      setIsEditDialogOpen(false);
      setSelectedIndicator(null);
      loadIndicators();
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar este indicador?")) {
      const { error } = await deleteIndicator(id);
      
      if (error) {
        toast({
          title: "Error",
          description: "No se pudo eliminar el indicador",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Éxito",
          description: "Indicador eliminado correctamente",
        });
        loadIndicators();
      }
    }
  };

  const openEditDialog = (indicator: Indicator) => {
    setSelectedIndicator(indicator);
    setFormData({
      name: indicator.name,
      data_type: indicator.data_type,
    });
    setIsEditDialogOpen(true);
  };

  const getDataTypeBadge = (dataType: string) => {
    const typeMap = {
      numeric: { label: "Numérico", variant: "default" as const },
      short_text: { label: "Texto Corto", variant: "secondary" as const },
      long_text: { label: "Texto Largo", variant: "outline" as const },
      file: { label: "Adjunto", variant: "destructive" as const },
      link: { label: "Link", variant: "secondary" as const },
    };
    
    const type = typeMap[dataType as keyof typeof typeMap] || typeMap.numeric;
    return <Badge variant={type.variant}>{type.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Consolidado de Cifras</h3>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="institutional-gradient text-white">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Indicador
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Indicador</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <Label htmlFor="name">Nombre del Indicador</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Nombre del indicador"
                  required
                />
              </div>
              <div>
                <Label htmlFor="data_type">Tipo de Dato</Label>
                <Select 
                  value={formData.data_type} 
                  onValueChange={(value: "numeric" | "short_text" | "long_text" | "file" | "link") => 
                    setFormData(prev => ({ ...prev, data_type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="numeric">Numérico</SelectItem>
                    <SelectItem value="short_text">Texto Corto</SelectItem>
                    <SelectItem value="long_text">Texto Largo</SelectItem>
                    <SelectItem value="file">Adjunto</SelectItem>
                    <SelectItem value="link">Link</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="institutional-gradient text-white">
                  Crear Indicador
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Indicadores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Tipo de Dato</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Creado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {indicators.map((indicator) => (
                <TableRow key={indicator.id}>
                  <TableCell className="font-medium">{indicator.name}</TableCell>
                  <TableCell>{getDataTypeBadge(indicator.data_type)}</TableCell>
                  <TableCell>
                    <Badge variant={indicator.is_active ? "default" : "secondary"}>
                      {indicator.is_active ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(indicator.created_at).toLocaleDateString('es-ES')}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => openEditDialog(indicator)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDelete(indicator.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Indicador</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div>
              <Label htmlFor="edit_name">Nombre del Indicador</Label>
              <Input
                id="edit_name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nombre del indicador"
                required
              />
            </div>
            <div>
              <Label htmlFor="edit_data_type">Tipo de Dato</Label>
              <Select 
                value={formData.data_type} 
                onValueChange={(value: "numeric" | "short_text" | "long_text" | "file" | "link") => 
                  setFormData(prev => ({ ...prev, data_type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="numeric">Numérico</SelectItem>
                  <SelectItem value="short_text">Texto Corto</SelectItem>
                  <SelectItem value="long_text">Texto Largo</SelectItem>
                  <SelectItem value="file">Adjunto</SelectItem>
                  <SelectItem value="link">Link</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="institutional-gradient text-white">
                Actualizar Indicador
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
