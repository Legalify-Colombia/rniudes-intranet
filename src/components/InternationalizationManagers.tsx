
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { useToast } from "@/hooks/use-toast";
import { WorkPlanForm } from "./WorkPlanForm";
import { Edit, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";

export function InternationalizationManagers() {
  const { 
    fetchManagers, 
    updateManagerHours,
    fetchCampus
  } = useSupabaseData();
  const { toast } = useToast();
  
  const [managers, setManagers] = useState<any[]>([]);
  const [campuses, setCampuses] = useState<any[]>([]);
  const [filteredManagers, setFilteredManagers] = useState<any[]>([]);
  const [selectedCampus, setSelectedCampus] = useState<string>("todos");
  const [loading, setLoading] = useState(true);
  const [selectedManager, setSelectedManager] = useState<any>(null);
  const [showWorkPlanForm, setShowWorkPlanForm] = useState(false);
  const [editingHours, setEditingHours] = useState<{[key: string]: {weekly: string, weeks: string}}>({});

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterManagers();
  }, [managers, selectedCampus]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Cargar campus
      const { data: campusData } = await fetchCampus();
      setCampuses(campusData || []);

      // Cargar gestores con sus relaciones
      const { data: managersData } = await fetchManagers();
      console.log('Managers data:', managersData);
      setManagers(managersData || []);
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

  const filterManagers = () => {
    if (selectedCampus === "todos") {
      setFilteredManagers(managers);
    } else {
      const filtered = managers.filter(manager => 
        manager.academic_programs?.some((program: any) => 
          program.campus_id === selectedCampus
        )
      );
      setFilteredManagers(filtered);
    }
  };

  const getManagerProgram = (manager: any) => {
    return manager.academic_programs?.[0] || null;
  };

  const getManagerCampus = (manager: any) => {
    const program = getManagerProgram(manager);
    return program?.campus?.name || "Sin asignar";
  };

  const getManagerFaculty = (manager: any) => {
    const program = getManagerProgram(manager);
    return program?.faculty?.name || "Sin asignar";
  };

  const getManagerProgramName = (manager: any) => {
    const program = getManagerProgram(manager);
    return program?.name || "Sin asignar";
  };

  const handleEditHours = (managerId: string) => {
    const manager = managers.find(m => m.id === managerId);
    if (manager) {
      setEditingHours(prev => ({
        ...prev,
        [managerId]: {
          weekly: (manager.weekly_hours || 0).toString(),
          weeks: (manager.number_of_weeks || 16).toString()
        }
      }));
    }
  };

  const handleSaveHours = async (managerId: string) => {
    const values = editingHours[managerId];
    if (!values) return;

    const weeklyHours = parseInt(values.weekly) || 0;
    const numberOfWeeks = parseInt(values.weeks) || 16;

    const { error } = await updateManagerHours(managerId, weeklyHours, numberOfWeeks);
    
    if (error) {
      toast({
        title: "Error",
        description: "No se pudieron actualizar las horas",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Éxito",
      description: "Horas actualizadas correctamente",
    });

    setEditingHours(prev => {
      const newState = { ...prev };
      delete newState[managerId];
      return newState;
    });

    loadData();
  };

  const handleCancelEdit = (managerId: string) => {
    setEditingHours(prev => {
      const newState = { ...prev };
      delete newState[managerId];
      return newState;
    });
  };

  const handleWorkPlanClick = (manager: any) => {
    setSelectedManager(manager);
    setShowWorkPlanForm(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="secondary"><Edit className="w-3 h-3 mr-1" />Borrador</Badge>;
      case 'submitted':
        return <Badge variant="default"><Clock className="w-3 h-3 mr-1" />Enviado</Badge>;
      case 'approved':
        return <Badge variant="default" className="bg-green-600"><CheckCircle className="w-3 h-3 mr-1" />Aprobado</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rechazado</Badge>;
      default:
        return <Badge variant="outline"><AlertCircle className="w-3 h-3 mr-1" />Sin plan</Badge>;
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Cargando gestores...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Gestores de Internacionalización</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <Select value={selectedCampus} onValueChange={setSelectedCampus}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Filtrar por campus" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los campus</SelectItem>
                {campuses.map((campus) => (
                  <SelectItem key={campus.id} value={campus.id}>
                    {campus.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Gestor</TableHead>
                <TableHead>Campus</TableHead>
                <TableHead>Facultad</TableHead>
                <TableHead>Programa</TableHead>
                <TableHead>Horas/Semana</TableHead>
                <TableHead>Semanas</TableHead>
                <TableHead>Total Horas</TableHead>
                <TableHead>Estado Plan</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredManagers.map((manager) => (
                <TableRow key={manager.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{manager.full_name}</div>
                      <div className="text-sm text-gray-500">{manager.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>{getManagerCampus(manager)}</TableCell>
                  <TableCell>{getManagerFaculty(manager)}</TableCell>
                  <TableCell>{getManagerProgramName(manager)}</TableCell>
                  <TableCell>
                    {editingHours[manager.id] ? (
                      <Input
                        type="number"
                        value={editingHours[manager.id].weekly}
                        onChange={(e) => setEditingHours(prev => ({
                          ...prev,
                          [manager.id]: {
                            ...prev[manager.id],
                            weekly: e.target.value
                          }
                        }))}
                        className="w-20"
                      />
                    ) : (
                      <span onClick={() => handleEditHours(manager.id)} className="cursor-pointer hover:bg-gray-100 p-1 rounded">
                        {manager.weekly_hours || 0}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingHours[manager.id] ? (
                      <Input
                        type="number"
                        value={editingHours[manager.id].weeks}
                        onChange={(e) => setEditingHours(prev => ({
                          ...prev,
                          [manager.id]: {
                            ...prev[manager.id],
                            weeks: e.target.value
                          }
                        }))}
                        className="w-20"
                      />
                    ) : (
                      <span onClick={() => handleEditHours(manager.id)} className="cursor-pointer hover:bg-gray-100 p-1 rounded">
                        {manager.number_of_weeks || 16}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">
                    {manager.total_hours || 0}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge('draft')}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {editingHours[manager.id] ? (
                        <>
                          <Button size="sm" onClick={() => handleSaveHours(manager.id)}>
                            Guardar
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleCancelEdit(manager.id)}>
                            Cancelar
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button 
                            size="sm" 
                            onClick={() => handleEditHours(manager.id)}
                            variant="outline"
                          >
                            Editar Horas
                          </Button>
                          <Button 
                            size="sm" 
                            onClick={() => handleWorkPlanClick(manager)}
                            disabled={!manager.total_hours || manager.total_hours === 0}
                          >
                            Plan de Trabajo
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showWorkPlanForm} onOpenChange={setShowWorkPlanForm}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Plan de Trabajo</DialogTitle>
          </DialogHeader>
          {selectedManager && (
            <WorkPlanForm
              manager={selectedManager}
              onClose={() => setShowWorkPlanForm(false)}
              onSave={() => {
                setShowWorkPlanForm(false);
                loadData();
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
