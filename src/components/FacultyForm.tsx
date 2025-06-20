
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CampusSelector } from "@/components/CampusSelector";
import { useToast } from "@/hooks/use-toast";
import { useFaculties } from "@/hooks/useFaculties";
import type { Faculty, Campus } from "@/types/supabase";

interface FacultyFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  campuses: Campus[];
  editingFaculty?: Faculty | null;
}

export function FacultyForm({ isOpen, onClose, onSuccess, campuses, editingFaculty }: FacultyFormProps) {
  const { toast } = useToast();
  const { createFaculty, updateFaculty, addFacultyToCampus, removeFacultyFromCampus, getFacultyCampuses } = useFaculties();
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    dean_name: "",
  });
  const [selectedCampusIds, setSelectedCampusIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingFaculty) {
      setFormData({
        name: editingFaculty.name || "",
        description: editingFaculty.description || "",
        dean_name: editingFaculty.dean_name || "",
      });
      
      // Cargar los campus asociados a la facultad
      getFacultyCampuses(editingFaculty.id).then(({ data }) => {
        if (data) {
          setSelectedCampusIds(data);
        }
      });
    } else {
      setFormData({ name: "", description: "", dean_name: "" });
      setSelectedCampusIds([]);
    }
  }, [editingFaculty, getFacultyCampuses]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCampusIds.length === 0) {
      toast({
        title: "Error",
        description: "Debes seleccionar al menos un campus",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      let facultyId: string;
      
      if (editingFaculty) {
        // Actualizar facultad existente
        const { error } = await updateFaculty(editingFaculty.id, formData);
        if (error) throw error;
        facultyId = editingFaculty.id;
        
        // Obtener campus actuales
        const { data: currentCampuses } = await getFacultyCampuses(facultyId);
        const currentCampusIds = currentCampuses || [];
        
        // Remover campus que ya no están seleccionados
        for (const campusId of currentCampusIds) {
          if (!selectedCampusIds.includes(campusId)) {
            await removeFacultyFromCampus(facultyId, campusId);
          }
        }
        
        // Agregar nuevos campus
        for (const campusId of selectedCampusIds) {
          if (!currentCampusIds.includes(campusId)) {
            await addFacultyToCampus(facultyId, campusId);
          }
        }
        
        toast({
          title: "Éxito",
          description: "Facultad actualizada correctamente"
        });
      } else {
        // Crear nueva facultad
        const { data, error } = await createFaculty(formData);
        if (error) throw error;
        facultyId = data!.id;
        
        // Agregar relaciones con campus
        for (const campusId of selectedCampusIds) {
          await addFacultyToCampus(facultyId, campusId);
        }
        
        toast({
          title: "Éxito",
          description: "Facultad creada correctamente"
        });
      }
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving faculty:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar la facultad",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {editingFaculty ? "Editar Facultad" : "Crear Nueva Facultad"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nombre de la Facultad</Label>
            <Input 
              id="name" 
              value={formData.name} 
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} 
              required 
            />
          </div>
          
          <div>
            <Label htmlFor="dean_name">Nombre del Decano</Label>
            <Input 
              id="dean_name" 
              value={formData.dean_name} 
              onChange={(e) => setFormData(prev => ({ ...prev, dean_name: e.target.value }))} 
              required 
            />
          </div>
          
          <CampusSelector
            campuses={campuses}
            selectedCampusIds={selectedCampusIds}
            onSelectionChange={setSelectedCampusIds}
            mode="multiple"
            label="Campus donde estará disponible"
            placeholder="Seleccionar campus"
            required
          />
          
          <div>
            <Label htmlFor="description">Descripción</Label>
            <Textarea 
              id="description" 
              value={formData.description} 
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} 
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : editingFaculty ? "Actualizar" : "Crear Facultad"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
