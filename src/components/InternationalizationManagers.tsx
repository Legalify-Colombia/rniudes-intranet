
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, Trash2, FileText, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface WorkPlan {
  id: string;
  managerId: string;
  strategicAxes: StrategyAxis[];
  totalHoursUsed: number;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  comments?: string;
  coordinatorApproval?: {
    approved: boolean;
    comments: string;
    date: string;
  };
}

interface StrategyAxis {
  id: string;
  name: string;
  actions: Action[];
}

interface Action {
  id: string;
  name: string;
  products: Product[];
}

interface Product {
  id: string;
  name: string;
  evidence: string;
  hours: number;
}

interface Manager {
  id: string;
  name: string;
  email: string;
  programId: string;
  programName: string;
  weeklyHours: number;
  numberOfWeeks: number;
  totalHours: number;
  workPlan?: WorkPlan;
}

// Mock data for demonstration
const mockManagers: Manager[] = [
  {
    id: "1",
    name: "Dr. María González",
    email: "maria.gonzalez@universidad.edu.co",
    programId: "prog1",
    programName: "Ingeniería de Sistemas",
    weeklyHours: 10,
    numberOfWeeks: 16,
    totalHours: 160,
  },
  {
    id: "2",
    name: "Mg. Carlos Rodríguez",
    email: "carlos.rodriguez@universidad.edu.co",
    programId: "prog2",
    programName: "Administración de Empresas",
    weeklyHours: 8,
    numberOfWeeks: 16,
    totalHours: 128,
  }
];

export function InternationalizationManagers() {
  const [managers, setManagers] = useState<Manager[]>(mockManagers);
  const [selectedManager, setSelectedManager] = useState<Manager | null>(null);
  const [workPlanDialog, setWorkPlanDialog] = useState(false);
  const [approvalDialog, setApprovalDialog] = useState(false);
  const { toast } = useToast();

  const [workPlanForm, setWorkPlanForm] = useState<{
    strategicAxes: StrategyAxis[];
  }>({
    strategicAxes: []
  });

  const addStrategicAxis = () => {
    const newAxis: StrategyAxis = {
      id: Date.now().toString(),
      name: "",
      actions: []
    };
    setWorkPlanForm(prev => ({
      ...prev,
      strategicAxes: [...prev.strategicAxes, newAxis]
    }));
  };

  const updateAxisName = (axisId: string, name: string) => {
    setWorkPlanForm(prev => ({
      ...prev,
      strategicAxes: prev.strategicAxes.map(axis =>
        axis.id === axisId ? { ...axis, name } : axis
      )
    }));
  };

  const addAction = (axisId: string) => {
    const newAction: Action = {
      id: Date.now().toString(),
      name: "",
      products: []
    };
    setWorkPlanForm(prev => ({
      ...prev,
      strategicAxes: prev.strategicAxes.map(axis =>
        axis.id === axisId ? { ...axis, actions: [...axis.actions, newAction] } : axis
      )
    }));
  };

  const updateActionName = (axisId: string, actionId: string, name: string) => {
    setWorkPlanForm(prev => ({
      ...prev,
      strategicAxes: prev.strategicAxes.map(axis =>
        axis.id === axisId ? {
          ...axis,
          actions: axis.actions.map(action =>
            action.id === actionId ? { ...action, name } : action
          )
        } : axis
      )
    }));
  };

  const addProduct = (axisId: string, actionId: string) => {
    const newProduct: Product = {
      id: Date.now().toString(),
      name: "",
      evidence: "",
      hours: 0
    };
    setWorkPlanForm(prev => ({
      ...prev,
      strategicAxes: prev.strategicAxes.map(axis =>
        axis.id === axisId ? {
          ...axis,
          actions: axis.actions.map(action =>
            action.id === actionId ? { ...action, products: [...action.products, newProduct] } : action
          )
        } : axis
      )
    }));
  };

  const updateProduct = (axisId: string, actionId: string, productId: string, field: keyof Product, value: string | number) => {
    setWorkPlanForm(prev => ({
      ...prev,
      strategicAxes: prev.strategicAxes.map(axis =>
        axis.id === axisId ? {
          ...axis,
          actions: axis.actions.map(action =>
            action.id === actionId ? {
              ...action,
              products: action.products.map(product =>
                product.id === productId ? { ...product, [field]: value } : product
              )
            } : action
          )
        } : axis
      )
    }));
  };

  const calculateTotalHours = () => {
    return workPlanForm.strategicAxes.reduce((total, axis) =>
      total + axis.actions.reduce((axisTotal, action) =>
        axisTotal + action.products.reduce((actionTotal, product) =>
          actionTotal + product.hours, 0
        ), 0
      ), 0
    );
  };

  const openWorkPlan = (manager: Manager) => {
    setSelectedManager(manager);
    if (manager.workPlan) {
      setWorkPlanForm({ strategicAxes: manager.workPlan.strategicAxes });
    } else {
      setWorkPlanForm({ strategicAxes: [] });
    }
    setWorkPlanDialog(true);
  };

  const saveWorkPlan = () => {
    if (!selectedManager) return;

    const totalHours = calculateTotalHours();
    const newWorkPlan: WorkPlan = {
      id: selectedManager.workPlan?.id || Date.now().toString(),
      managerId: selectedManager.id,
      strategicAxes: workPlanForm.strategicAxes,
      totalHoursUsed: totalHours,
      status: 'draft'
    };

    setManagers(prev => prev.map(manager =>
      manager.id === selectedManager.id
        ? { ...manager, workPlan: newWorkPlan }
        : manager
    ));

    toast({ title: "Plan de trabajo guardado exitosamente" });
    setWorkPlanDialog(false);
  };

  const submitForApproval = () => {
    if (!selectedManager?.workPlan) return;

    setManagers(prev => prev.map(manager =>
      manager.id === selectedManager.id && manager.workPlan
        ? { 
            ...manager, 
            workPlan: { 
              ...manager.workPlan, 
              status: 'submitted' 
            } 
          }
        : manager
    ));

    toast({ title: "Plan enviado para aprobación" });
    setWorkPlanDialog(false);
  };

  const handleApproval = (approved: boolean, comments: string) => {
    if (!selectedManager?.workPlan) return;

    setManagers(prev => prev.map(manager =>
      manager.id === selectedManager.id && manager.workPlan
        ? {
            ...manager,
            workPlan: {
              ...manager.workPlan,
              status: approved ? 'approved' : 'rejected',
              coordinatorApproval: {
                approved,
                comments,
                date: new Date().toLocaleDateString()
              }
            }
          }
        : manager
    ));

    toast({ 
      title: approved ? "Plan aprobado exitosamente" : "Plan rechazado",
      description: comments 
    });
    setApprovalDialog(false);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-primary">Gestores de Internacionalización</CardTitle>
      </CardHeader>
      
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Programa</TableHead>
              <TableHead>Gestor</TableHead>
              <TableHead>Horas Semanales</TableHead>
              <TableHead>Total Horas</TableHead>
              <TableHead>Estado del Plan</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {managers.map((manager) => (
              <TableRow key={manager.id}>
                <TableCell className="font-medium">{manager.programName}</TableCell>
                <TableCell>{manager.name}</TableCell>
                <TableCell>{manager.weeklyHours}</TableCell>
                <TableCell>{manager.totalHours}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    !manager.workPlan ? 'bg-gray-100 text-gray-800' :
                    manager.workPlan.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                    manager.workPlan.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                    manager.workPlan.status === 'approved' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {!manager.workPlan ? 'Sin plan' :
                     manager.workPlan.status === 'draft' ? 'Borrador' :
                     manager.workPlan.status === 'submitted' ? 'En revisión' :
                     manager.workPlan.status === 'approved' ? 'Aprobado' :
                     'Rechazado'}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => openWorkPlan(manager)}
                    >
                      <FileText className="w-4 h-4 mr-1" />
                      {manager.workPlan ? 'Ver Plan' : 'Crear Plan'}
                    </Button>
                    {manager.workPlan?.status === 'submitted' && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          setSelectedManager(manager);
                          setApprovalDialog(true);
                        }}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Revisar
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Work Plan Dialog */}
        <Dialog open={workPlanDialog} onOpenChange={setWorkPlanDialog}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Plan de Trabajo - {selectedManager?.name}
              </DialogTitle>
              <div className="text-sm text-gray-600">
                Programa: {selectedManager?.programName} | 
                Horas disponibles: {selectedManager?.totalHours} | 
                Horas asignadas: {calculateTotalHours()}
              </div>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Ejes Estratégicos</h3>
                <Button onClick={addStrategicAxis} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Eje
                </Button>
              </div>

              {workPlanForm.strategicAxes.map((axis) => (
                <Card key={axis.id} className="border-2 border-blue-200">
                  <CardHeader className="bg-blue-50">
                    <div className="flex items-center space-x-2">
                      <Label>Eje Estratégico:</Label>
                      <Input
                        value={axis.name}
                        onChange={(e) => updateAxisName(axis.id, e.target.value)}
                        placeholder="Nombre del eje estratégico"
                        className="flex-1"
                      />
                      <Button onClick={() => addAction(axis.id)} size="sm">
                        <Plus className="w-4 h-4 mr-1" />
                        Acción
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {axis.actions.map((action) => (
                      <Card key={action.id} className="border border-green-200">
                        <CardHeader className="bg-green-50 pb-2">
                          <div className="flex items-center space-x-2">
                            <Label>Acción:</Label>
                            <Input
                              value={action.name}
                              onChange={(e) => updateActionName(axis.id, action.id, e.target.value)}
                              placeholder="Nombre de la acción"
                              className="flex-1"
                            />
                            <Button onClick={() => addProduct(axis.id, action.id)} size="sm">
                              <Plus className="w-4 h-4 mr-1" />
                              Producto
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {action.products.map((product) => (
                            <div key={product.id} className="grid grid-cols-4 gap-2 p-3 border border-gray-200 rounded">
                              <div>
                                <Label className="text-xs">Producto/Evidencia</Label>
                                <Input
                                  value={product.name}
                                  onChange={(e) => updateProduct(axis.id, action.id, product.id, 'name', e.target.value)}
                                  placeholder="Producto"
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Evidencia</Label>
                                <Input
                                  value={product.evidence}
                                  onChange={(e) => updateProduct(axis.id, action.id, product.id, 'evidence', e.target.value)}
                                  placeholder="Evidencia"
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Horas</Label>
                                <Input
                                  type="number"
                                  value={product.hours}
                                  onChange={(e) => updateProduct(axis.id, action.id, product.id, 'hours', parseInt(e.target.value) || 0)}
                                  placeholder="0"
                                />
                              </div>
                              <div className="flex items-end">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => {
                                    setWorkPlanForm(prev => ({
                                      ...prev,
                                      strategicAxes: prev.strategicAxes.map(a =>
                                        a.id === axis.id ? {
                                          ...a,
                                          actions: a.actions.map(ac =>
                                            ac.id === action.id ? {
                                              ...ac,
                                              products: ac.products.filter(p => p.id !== product.id)
                                            } : ac
                                          )
                                        } : a
                                      )
                                    }));
                                  }}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    ))}
                  </CardContent>
                </Card>
              ))}

              <Card className="bg-gray-50">
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Total Horas Asignadas</Label>
                      <div className="text-2xl font-bold text-blue-600">
                        {calculateTotalHours()}
                      </div>
                    </div>
                    <div>
                      <Label>Horas Disponibles</Label>
                      <div className="text-2xl font-bold text-green-600">
                        {selectedManager?.totalHours || 0}
                      </div>
                    </div>
                  </div>
                  <div className="mt-2">
                    <Label>Balance</Label>
                    <div className={`text-lg font-semibold ${
                      calculateTotalHours() <= (selectedManager?.totalHours || 0) 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      {(selectedManager?.totalHours || 0) - calculateTotalHours()} horas
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setWorkPlanDialog(false)}>
                  Cancelar
                </Button>
                <Button onClick={saveWorkPlan}>
                  Guardar Borrador
                </Button>
                <Button 
                  onClick={submitForApproval}
                  className="institutional-gradient text-white"
                  disabled={calculateTotalHours() > (selectedManager?.totalHours || 0)}
                >
                  Enviar para Aprobación
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Approval Dialog */}
        <Dialog open={approvalDialog} onOpenChange={setApprovalDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Revisión del Plan de Trabajo</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Gestor: {selectedManager?.name}</Label>
              </div>
              <div>
                <Label>Programa: {selectedManager?.programName}</Label>
              </div>
              <div>
                <Label>Horas asignadas: {selectedManager?.workPlan?.totalHoursUsed}</Label>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="approvalComments">Comentarios y Observaciones</Label>
                <Textarea
                  id="approvalComments"
                  placeholder="Escriba sus comentarios sobre el plan de trabajo..."
                  className="min-h-20"
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    const comments = (document.getElementById('approvalComments') as HTMLTextAreaElement)?.value || '';
                    handleApproval(false, comments);
                  }}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Rechazar
                </Button>
                <Button 
                  onClick={() => {
                    const comments = (document.getElementById('approvalComments') as HTMLTextAreaElement)?.value || '';
                    handleApproval(true, comments);
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Aprobar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        
        {managers.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No hay gestores registrados. Los gestores se crean desde el módulo de usuarios.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
