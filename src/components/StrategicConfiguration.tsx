
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseData, StrategicAxis, Action, Product } from "@/hooks/useSupabaseData";
import { ReportTemplatesManagement } from "./ReportTemplatesManagement";
import { DocumentTemplatesManagement } from "./DocumentTemplatesManagement";

export function StrategicConfiguration() {
  const [strategicAxes, setStrategicAxes] = useState<StrategicAxis[]>([]);
  const [actions, setActions] = useState<Action[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isAxisDialogOpen, setIsAxisDialogOpen] = useState(false);
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const { toast } = useToast();
  
  const {
    fetchStrategicAxes,
    createStrategicAxis,
    fetchActions,
    createAction,
    fetchProducts,
    createProduct,
  } = useSupabaseData();

  const [axisForm, setAxisForm] = useState({
    name: "",
    code: "",
  });

  const [actionForm, setActionForm] = useState({
    name: "",
    code: "",
    strategic_axis_id: "",
  });

  const [productForm, setProductForm] = useState({
    name: "",
    action_id: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [axesResult, actionsResult, productsResult] = await Promise.all([
      fetchStrategicAxes(),
      fetchActions(),
      fetchProducts(),
    ]);

    if (axesResult.data) setStrategicAxes(axesResult.data);
    if (actionsResult.data) setActions(actionsResult.data);
    if (productsResult.data) setProducts(productsResult.data);
  };

  const handleCreateAxis = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data, error } = await createStrategicAxis({
      ...axisForm,
      created_by: profile?.id || ''
    });
    
    if (error) {
      toast({
        title: "Error al crear eje estratégico",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Eje estratégico creado exitosamente" });
      setAxisForm({ name: "", code: "" });
      setIsAxisDialogOpen(false);
      loadData();
    }
  };

  const handleCreateAction = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data, error } = await createAction({
      ...actionForm,
      created_by: profile?.id || ''
    });
    
    if (error) {
      toast({
        title: "Error al crear acción",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Acción creada exitosamente" });
      setActionForm({ name: "", code: "", strategic_axis_id: "" });
      setIsActionDialogOpen(false);
      loadData();
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data, error } = await createProduct({
      ...productForm,
      created_by: profile?.id || ''
    });
    
    if (error) {
      toast({
        title: "Error al crear producto",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Producto creado exitosamente" });
      setProductForm({ name: "", action_id: "" });
      setIsProductDialogOpen(false);
      loadData();
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-primary">
          Configuración Estratégica
        </CardTitle>
        <p className="text-gray-600">
          Gestión de ejes estratégicos, acciones, productos, plantillas de informe y plantillas de documentos
        </p>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="axes" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="axes">Ejes Estratégicos</TabsTrigger>
            <TabsTrigger value="actions">Acciones</TabsTrigger>
            <TabsTrigger value="products">Productos</TabsTrigger>
            <TabsTrigger value="templates">Plantillas de Informe</TabsTrigger>
            <TabsTrigger value="documents">Plantillas PDF/DOC</TabsTrigger>
          </TabsList>

          {/* Ejes Estratégicos */}
          <TabsContent value="axes" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Ejes Estratégicos</h3>
              <Dialog open={isAxisDialogOpen} onOpenChange={setIsAxisDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="institutional-gradient text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Nuevo Eje
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Crear Eje Estratégico</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateAxis} className="space-y-4">
                    <div>
                      <Label htmlFor="axisCode">Código</Label>
                      <Input
                        id="axisCode"
                        value={axisForm.code}
                        onChange={(e) => setAxisForm(prev => ({ ...prev, code: e.target.value }))}
                        placeholder="Ej: EJE1"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="axisName">Nombre del Eje</Label>
                      <Input
                        id="axisName"
                        value={axisForm.name}
                        onChange={(e) => setAxisForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Nombre del eje estratégico"
                        required
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setIsAxisDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit" className="institutional-gradient text-white">
                        Crear Eje
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {strategicAxes.map((axis) => (
                  <TableRow key={axis.id}>
                    <TableCell className="font-medium">{axis.code}</TableCell>
                    <TableCell>{axis.name}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          {/* Acciones */}
          <TabsContent value="actions" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Acciones</h3>
              <Dialog open={isActionDialogOpen} onOpenChange={setIsActionDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="institutional-gradient text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Nueva Acción
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Crear Acción</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateAction} className="space-y-4">
                    <div>
                      <Label htmlFor="actionAxis">Eje Estratégico</Label>
                      <Select value={actionForm.strategic_axis_id} onValueChange={(value) => setActionForm(prev => ({ ...prev, strategic_axis_id: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar eje" />
                        </SelectTrigger>
                        <SelectContent>
                          {strategicAxes.map((axis) => (
                            <SelectItem key={axis.id} value={axis.id}>
                              {axis.code} - {axis.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="actionCode">Código</Label>
                      <Input
                        id="actionCode"
                        value={actionForm.code}
                        onChange={(e) => setActionForm(prev => ({ ...prev, code: e.target.value }))}
                        placeholder="Ej: A1.1"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="actionName">Nombre de la Acción</Label>
                      <Input
                        id="actionName"
                        value={actionForm.name}
                        onChange={(e) => setActionForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Nombre de la acción"
                        required
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setIsActionDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit" className="institutional-gradient text-white">
                        Crear Acción
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Eje Estratégico</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {actions.map((action) => (
                  <TableRow key={action.id}>
                    <TableCell className="font-medium">{action.code}</TableCell>
                    <TableCell>{action.name}</TableCell>
                    <TableCell>{action.strategic_axis?.name}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          {/* Productos */}
          <TabsContent value="products" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Productos</h3>
              <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="institutional-gradient text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Nuevo Producto
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Crear Producto</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateProduct} className="space-y-4">
                    <div>
                      <Label htmlFor="productAction">Acción</Label>
                      <Select value={productForm.action_id} onValueChange={(value) => setProductForm(prev => ({ ...prev, action_id: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar acción" />
                        </SelectTrigger>
                        <SelectContent>
                          {actions.map((action) => (
                            <SelectItem key={action.id} value={action.id}>
                              {action.code} - {action.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="productName">Nombre del Producto</Label>
                      <Input
                        id="productName"
                        value={productForm.name}
                        onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Nombre del producto"
                        required
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setIsProductDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit" className="institutional-gradient text-white">
                        Crear Producto
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead>Acción</TableHead>
                  <TableHead>Eje Estratégico</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.action?.name}</TableCell>
                    <TableCell>{product.action?.strategic_axis?.name}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          {/* Plantillas de Informe */}
          <TabsContent value="templates" className="space-y-4">
            <ReportTemplatesManagement />
          </TabsContent>

          {/* Plantillas de Documentos PDF/DOC */}
          <TabsContent value="documents" className="space-y-4">
            <DocumentTemplatesManagement />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
