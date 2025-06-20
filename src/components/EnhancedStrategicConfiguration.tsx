
import React, { useState, useEffect } from 'react';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Save, X, Settings } from 'lucide-react';
import { toast } from 'sonner';
import SpecificLinesIndicatorsManagement from './SpecificLinesIndicatorsManagement';

const EnhancedStrategicConfiguration: React.FC = () => {
  const [strategicAxes, setStrategicAxes] = useState<any[]>([]);
  const [actions, setActions] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [editingType, setEditingType] = useState<'axis' | 'action' | 'product' | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const {
    fetchStrategicAxes,
    createStrategicAxis,
    updateStrategicAxisUsage,
    fetchActions,
    createAction,
    updateActionUsage,
    fetchProducts,
    createProduct,
    updateProductUsage
  } = useSupabaseData();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [axesResult, actionsResult, productsResult] = await Promise.all([
      fetchStrategicAxes(),
      fetchActions(),
      fetchProducts()
    ]);

    if (axesResult.data) setStrategicAxes(axesResult.data);
    if (actionsResult.data) setActions(actionsResult.data);
    if (productsResult.data) setProducts(productsResult.data);
  };

  const openDialog = (type: 'axis' | 'action' | 'product', item?: any) => {
    setEditingType(type);
    setEditingItem(item || null);
    setIsDialogOpen(true);
  };

  const handleSave = async (formData: any) => {
    if (!editingType) return;

    try {
      if (editingItem) {
        // Actualizar tipos de uso
        if (editingType === 'axis') {
          await updateStrategicAxisUsage(editingItem.id, formData.usage_type);
        } else if (editingType === 'action') {
          await updateActionUsage(editingItem.id, formData.usage_type);
        } else if (editingType === 'product') {
          await updateProductUsage(editingItem.id, formData.usage_type);
        }
      } else {
        // Crear nuevo elemento
        if (editingType === 'axis') {
          await createStrategicAxis(formData);
        } else if (editingType === 'action') {
          await createAction(formData);
        } else if (editingType === 'product') {
          await createProduct(formData);
        }
      }

      toast.success(editingItem ? 'Elemento actualizado' : 'Elemento creado');
      setIsDialogOpen(false);
      setEditingItem(null);
      setEditingType(null);
      loadData();
    } catch (error) {
      toast.error('Error guardando elemento');
    }
  };

  const getUsageTypeLabel = (type: string) => {
    const labels = {
      work_plan: 'Plan de Trabajo',
      report_template: 'Plantilla de Informe',
      internationalization: 'Internacionalización'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getUsageTypeBadgeVariant = (type: string) => {
    const variants = {
      work_plan: 'default',
      report_template: 'secondary',
      internationalization: 'outline'
    };
    return variants[type as keyof typeof variants] || 'default';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Configuración Estratégica Mejorada</h1>
      </div>

      <Tabs defaultValue="axes" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="axes">Ejes Estratégicos</TabsTrigger>
          <TabsTrigger value="actions">Acciones</TabsTrigger>
          <TabsTrigger value="products">Productos</TabsTrigger>
          <TabsTrigger value="lines-indicators">Líneas e Indicadores</TabsTrigger>
          <TabsTrigger value="usage-management">Gestión de Usos</TabsTrigger>
        </TabsList>

        <TabsContent value="axes" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Ejes Estratégicos</h2>
            <Button onClick={() => openDialog('axis')}>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Eje
            </Button>
          </div>

          <div className="grid gap-4">
            {strategicAxes.map((axis) => (
              <Card key={axis.id}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <CardTitle className="text-lg">{axis.code} - {axis.name}</CardTitle>
                      {axis.description && (
                        <p className="text-sm text-muted-foreground">{axis.description}</p>
                      )}
                      <div className="flex flex-wrap gap-1">
                        {(axis.usage_type || ['work_plan']).map((type: string) => (
                          <Badge key={type} variant={getUsageTypeBadgeVariant(type) as any}>
                            {getUsageTypeLabel(type)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => openDialog('axis', axis)}
                    >
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="actions" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Acciones</h2>
            <Button onClick={() => openDialog('action')}>
              <Plus className="w-4 h-4 mr-2" />
              Nueva Acción
            </Button>
          </div>

          <div className="grid gap-4">
            {actions.map((action) => (
              <Card key={action.id}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <CardTitle className="text-lg">{action.code} - {action.name}</CardTitle>
                      {action.description && (
                        <p className="text-sm text-muted-foreground">{action.description}</p>
                      )}
                      <div className="flex flex-wrap gap-1">
                        {(action.usage_type || ['work_plan']).map((type: string) => (
                          <Badge key={type} variant={getUsageTypeBadgeVariant(type) as any}>
                            {getUsageTypeLabel(type)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => openDialog('action', action)}
                    >
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Productos</h2>
            <Button onClick={() => openDialog('product')}>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Producto
            </Button>
          </div>

          <div className="grid gap-4">
            {products.map((product) => (
              <Card key={product.id}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <CardTitle className="text-lg">{product.name}</CardTitle>
                      {product.description && (
                        <p className="text-sm text-muted-foreground">{product.description}</p>
                      )}
                      <div className="flex flex-wrap gap-1">
                        {(product.usage_type || ['work_plan']).map((type: string) => (
                          <Badge key={type} variant={getUsageTypeBadgeVariant(type) as any}>
                            {getUsageTypeLabel(type)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => openDialog('product', product)}
                    >
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="lines-indicators">
          <SpecificLinesIndicatorsManagement />
        </TabsContent>

        <TabsContent value="usage-management" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Tipos de Uso</CardTitle>
              <p className="text-muted-foreground">
                Configure para qué módulos puede utilizarse cada elemento estratégico:
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-blue-600">Plan de Trabajo</h4>
                  <p className="text-sm text-muted-foreground">
                    Elementos disponibles para la creación de planes de trabajo de gestores.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-green-600">Plantillas de Informe</h4>
                  <p className="text-sm text-muted-foreground">
                    Elementos que pueden incluirse en plantillas de informe configurables.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-purple-600">Internacionalización</h4>
                  <p className="text-sm text-muted-foreground">
                    Elementos específicos para proyectos de internacionalización (gestores con 6+ horas).
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingItem 
                ? `Configurar ${editingType === 'axis' ? 'Eje Estratégico' : editingType === 'action' ? 'Acción' : 'Producto'}`
                : `Nuevo ${editingType === 'axis' ? 'Eje Estratégico' : editingType === 'action' ? 'Acción' : 'Producto'}`
              }
            </DialogTitle>
          </DialogHeader>

          <StrategicElementForm 
            type={editingType!}
            item={editingItem}
            strategicAxes={strategicAxes}
            onSave={handleSave}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

interface StrategicElementFormProps {
  type: 'axis' | 'action' | 'product';
  item: any;
  strategicAxes: any[];
  onSave: (data: any) => void;
  onCancel: () => void;
}

const StrategicElementForm: React.FC<StrategicElementFormProps> = ({ 
  type, 
  item, 
  strategicAxes, 
  onSave, 
  onCancel 
}) => {
  const [formData, setFormData] = useState({
    code: item?.code || '',
    name: item?.name || '',
    description: item?.description || '',
    strategic_axis_id: item?.strategic_axis_id || '',
    usage_type: item?.usage_type || ['work_plan'],
    created_by: ''
  });

  const usageTypes = [
    { id: 'work_plan', label: 'Plan de Trabajo', description: 'Para planes de trabajo de gestores' },
    { id: 'report_template', label: 'Plantilla de Informe', description: 'Para informes configurables' },
    { id: 'internationalization', label: 'Internacionalización', description: 'Para proyectos de internacionalización' }
  ];

  const updateUsageType = (typeId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      usage_type: checked 
        ? [...prev.usage_type, typeId]
        : prev.usage_type.filter(t => t !== typeId)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.usage_type.length === 0) {
      toast.error('Debe seleccionar al menos un tipo de uso');
      return;
    }

    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {type !== 'product' && (
        <div>
          <label className="block text-sm font-medium mb-1">Código *</label>
          <Input
            value={formData.code}
            onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
            required
            placeholder={type === 'axis' ? 'EJE-01' : 'ACC-01'}
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1">Nombre *</label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          required
          placeholder={`Nombre del ${type === 'axis' ? 'eje estratégico' : type === 'action' ? 'acción' : 'producto'}`}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Descripción</label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          rows={3}
          placeholder="Descripción opcional..."
        />
      </div>

      {type !== 'axis' && (
        <div>
          <label className="block text-sm font-medium mb-1">Eje Estratégico *</label>
          <select
            value={formData.strategic_axis_id}
            onChange={(e) => setFormData(prev => ({ ...prev, strategic_axis_id: e.target.value }))}
            className="w-full p-2 border rounded-md"
            required
          >
            <option value="">Seleccionar eje estratégico</option>
            {strategicAxes.map((axis) => (
              <option key={axis.id} value={axis.id}>
                {axis.code} - {axis.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-2">Tipos de Uso *</label>
        <div className="space-y-3">
          {usageTypes.map((usageType) => (
            <div key={usageType.id} className="flex items-start space-x-3">
              <Checkbox
                id={usageType.id}
                checked={formData.usage_type.includes(usageType.id)}
                onCheckedChange={(checked) => updateUsageType(usageType.id, checked as boolean)}
              />
              <div className="space-y-1">
                <label 
                  htmlFor={usageType.id} 
                  className="text-sm font-medium cursor-pointer"
                >
                  {usageType.label}
                </label>
                <p className="text-xs text-muted-foreground">
                  {usageType.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          <X className="w-4 h-4 mr-2" />
          Cancelar
        </Button>
        <Button type="submit">
          <Save className="w-4 h-4 mr-2" />
          Guardar
        </Button>
      </div>
    </form>
  );
};

export default EnhancedStrategicConfiguration;
