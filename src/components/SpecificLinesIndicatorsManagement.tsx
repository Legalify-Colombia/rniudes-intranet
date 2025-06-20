
import React, { useState, useEffect } from 'react';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { toast } from 'sonner';

interface SpecificLine {
  id: string;
  title: string;
  description?: string;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface Indicator {
  id: string;
  name: string;
  data_type: 'numeric' | 'short_text' | 'long_text' | 'file' | 'link';
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

const SpecificLinesIndicatorsManagement: React.FC = () => {
  const [specificLines, setSpecificLines] = useState<SpecificLine[]>([]);
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [editingLine, setEditingLine] = useState<SpecificLine | null>(null);
  const [editingIndicator, setEditingIndicator] = useState<Indicator | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'line' | 'indicator'>('line');

  const {
    fetchSpecificLines,
    createSpecificLine,
    updateSpecificLine,
    deleteSpecificLine,
    fetchIndicators,
    createIndicator,
    updateIndicator,
    deleteIndicator
  } = useSupabaseData();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [linesResult, indicatorsResult] = await Promise.all([
      fetchSpecificLines(),
      fetchIndicators()
    ]);

    if (linesResult.data) {
      setSpecificLines(linesResult.data);
    }
    if (linesResult.error) {
      toast.error('Error cargando líneas específicas');
    }

    if (indicatorsResult.data) {
      setIndicators(indicatorsResult.data);
    }
    if (indicatorsResult.error) {
      toast.error('Error cargando indicadores');
    }
  };

  const handleSaveLine = async (lineData: Omit<SpecificLine, 'id' | 'created_at' | 'updated_at'>) => {
    const result = editingLine
      ? await updateSpecificLine(editingLine.id, lineData)
      : await createSpecificLine(lineData);

    if (result.error) {
      toast.error('Error guardando línea específica');
      return;
    }

    toast.success(editingLine ? 'Línea específica actualizada' : 'Línea específica creada');
    setEditingLine(null);
    setIsDialogOpen(false);
    loadData();
  };

  const handleSaveIndicator = async (indicatorData: Omit<Indicator, 'id' | 'created_at' | 'updated_at'>) => {
    const result = editingIndicator
      ? await updateIndicator(editingIndicator.id, indicatorData)
      : await createIndicator(indicatorData);

    if (result.error) {
      toast.error('Error guardando indicador');
      return;
    }

    toast.success(editingIndicator ? 'Indicador actualizado' : 'Indicador creado');
    setEditingIndicator(null);
    setIsDialogOpen(false);
    loadData();
  };

  const handleDeleteLine = async (id: string) => {
    const result = await deleteSpecificLine(id);
    if (result.error) {
      toast.error('Error eliminando línea específica');
      return;
    }
    toast.success('Línea específica eliminada');
    loadData();
  };

  const handleDeleteIndicator = async (id: string) => {
    const result = await deleteIndicator(id);
    if (result.error) {
      toast.error('Error eliminando indicador');
      return;
    }
    toast.success('Indicador eliminado');
    loadData();
  };

  const openDialog = (type: 'line' | 'indicator', item?: SpecificLine | Indicator) => {
    setDialogType(type);
    if (type === 'line') {
      setEditingLine(item as SpecificLine || null);
    } else {
      setEditingIndicator(item as Indicator || null);
    }
    setIsDialogOpen(true);
  };

  const getDataTypeLabel = (type: string) => {
    const labels = {
      numeric: 'Numérico',
      short_text: 'Texto Corto',
      long_text: 'Texto Largo',
      file: 'Archivo',
      link: 'Enlace'
    };
    return labels[type as keyof typeof labels] || type;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestión de Líneas Específicas e Indicadores</h1>
      </div>

      <Tabs defaultValue="lines" className="space-y-6">
        <TabsList>
          <TabsTrigger value="lines">Líneas Específicas</TabsTrigger>
          <TabsTrigger value="indicators">Indicadores</TabsTrigger>
        </TabsList>

        <TabsContent value="lines" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Líneas Específicas de Internacionalización</h2>
            <Button onClick={() => openDialog('line')}>
              <Plus className="w-4 h-4 mr-2" />
              Nueva Línea
            </Button>
          </div>

          <div className="grid gap-4">
            {specificLines.map((line) => (
              <Card key={line.id}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{line.title}</CardTitle>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => openDialog('line', line)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => handleDeleteLine(line.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                {line.description && (
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{line.description}</p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="indicators" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Indicadores Configurables</h2>
            <Button onClick={() => openDialog('indicator')}>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Indicador
            </Button>
          </div>

          <div className="grid gap-4">
            {indicators.map((indicator) => (
              <Card key={indicator.id}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <CardTitle className="text-lg">{indicator.name}</CardTitle>
                      <Badge variant="secondary">
                        {getDataTypeLabel(indicator.data_type)}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => openDialog('indicator', indicator)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => handleDeleteIndicator(indicator.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {dialogType === 'line' 
                ? (editingLine ? 'Editar Línea Específica' : 'Nueva Línea Específica')
                : (editingIndicator ? 'Editar Indicador' : 'Nuevo Indicador')
              }
            </DialogTitle>
          </DialogHeader>

          {dialogType === 'line' ? (
            <SpecificLineForm 
              line={editingLine}
              onSave={handleSaveLine}
              onCancel={() => setIsDialogOpen(false)}
            />
          ) : (
            <IndicatorForm 
              indicator={editingIndicator}
              onSave={handleSaveIndicator}
              onCancel={() => setIsDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

interface SpecificLineFormProps {
  line: SpecificLine | null;
  onSave: (data: Omit<SpecificLine, 'id' | 'created_at' | 'updated_at'>) => void;
  onCancel: () => void;
}

const SpecificLineForm: React.FC<SpecificLineFormProps> = ({ line, onSave, onCancel }) => {
  const [title, setTitle] = useState(line?.title || '');
  const [description, setDescription] = useState(line?.description || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title,
      description,
      is_active: true,
      created_by: ''
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Título</label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Descripción</label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
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

interface IndicatorFormProps {
  indicator: Indicator | null;
  onSave: (data: Omit<Indicator, 'id' | 'created_at' | 'updated_at'>) => void;
  onCancel: () => void;
}

const IndicatorForm: React.FC<IndicatorFormProps> = ({ indicator, onSave, onCancel }) => {
  const [name, setName] = useState(indicator?.name || '');
  const [dataType, setDataType] = useState<'numeric' | 'short_text' | 'long_text' | 'file' | 'link'>(
    indicator?.data_type || 'short_text'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      data_type: dataType,
      is_active: true,
      created_by: ''
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Nombre</label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Tipo de Dato</label>
        <Select value={dataType} onValueChange={(value: any) => setDataType(value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="numeric">Numérico</SelectItem>
            <SelectItem value="short_text">Texto Corto</SelectItem>
            <SelectItem value="long_text">Texto Largo</SelectItem>
            <SelectItem value="file">Archivo</SelectItem>
            <SelectItem value="link">Enlace</SelectItem>
          </SelectContent>
        </Select>
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

export default SpecificLinesIndicatorsManagement;
