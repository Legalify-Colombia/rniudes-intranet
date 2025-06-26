import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { useProductsManagement } from "@/hooks/useProductsManagement";
import { Plus, Edit, Trash2, Save, X } from "lucide-react";
import { Product, Action, StrategicAxis } from "@/types";
import { useAuth } from "@/hooks/useAuth";

export function ProductsManagement() {
  const { toast } = useToast();
  const { profile } = useAuth();
  const { 
    fetchActions,
    fetchStrategicAxes 
  } = useSupabaseData();
  const { 
    fetchProducts, 
    createProduct, 
    updateProduct, 
    deleteProduct
  } = useProductsManagement();

  const [products, setProducts] = useState<Product[]>([]);
  const [actions, setActions] = useState<Action[]>([]);
  const [strategicAxes, setStrategicAxes] = useState<StrategicAxis[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({ 
    name: "", 
    description: "", 
    action_id: "" 
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [productsResult, actionsResult, axesResult] = await Promise.all([
        fetchProducts(),
        fetchActions(),
        fetchStrategicAxes()
      ]);
      
      if (productsResult.data) setProducts(productsResult.data);
      
      // Filter actions with valid IDs
      if (actionsResult.data) {
        const validActions = actionsResult.data.filter(action => 
          action.id && 
          typeof action.id === 'string' && 
          action.id.trim().length > 0
        );
        setActions(validActions);
      }
      
      if (axesResult.data) setStrategicAxes(axesResult.data);
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

  const handleCreate = async () => {
    if (!formData.name.trim() || !formData.action_id || !profile?.id) return;

    try {
      const result = await createProduct({
        ...formData,
        created_by: profile.id
      });
      if (result.data) {
        setProducts([...products, result.data]);
        setFormData({ name: "", description: "", action_id: "" });
        setIsCreating(false);
        toast({
          title: "Éxito",
          description: "Producto creado correctamente",
        });
      }
    } catch (error) {
      console.error('Error creating product:', error);
      toast({
        title: "Error",
        description: "No se pudo crear el producto",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({ 
      name: product.name, 
      description: product.description || "",
      action_id: product.action_id || ""
    });
  };

  const handleUpdate = async () => {
    if (!editingProduct || !formData.name.trim()) return;

    try {
      const result = await updateProduct(editingProduct.id, formData);
      if (result.data) {
        setProducts(products.map(product => product.id === editingProduct.id ? result.data : product));
        setEditingProduct(null);
        setFormData({ name: "", description: "", action_id: "" });
        toast({
          title: "Éxito",
          description: "Producto actualizado correctamente",
        });
      }
    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el producto",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (product: Product) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este producto?")) return;

    try {
      await deleteProduct(product.id);
      setProducts(products.filter(p => p.id !== product.id));
      toast({
        title: "Éxito",
        description: "Producto eliminado correctamente",
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el producto",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Cargando productos...</p>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Productos</CardTitle>
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Producto
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {(isCreating || editingProduct) && (
          <div className="p-4 border rounded-lg space-y-3">
            <div>
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                placeholder="Nombre del producto"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="action">Acción</Label>
              <Select value={formData.action_id} onValueChange={(value) => setFormData({ ...formData, action_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una acción" />
                </SelectTrigger>
                <SelectContent>
                  {actions.map((action) => {
                    // Validate action ID before rendering
                    if (!action.id || typeof action.id !== 'string' || action.id.trim().length === 0) {
                      console.warn('ProductsManagement - Skipping invalid action:', action);
                      return null;
                    }
                    return (
                      <SelectItem key={action.id} value={action.id}>
                        {action.code} - {action.name}
                      </SelectItem>
                    );
                  }).filter(Boolean)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                placeholder="Descripción del producto"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={editingProduct ? handleUpdate : handleCreate}>
                <Save className="h-4 w-4 mr-1" />
                {editingProduct ? "Actualizar" : "Guardar"}
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => {
                  setIsCreating(false);
                  setEditingProduct(null);
                  setFormData({ name: "", description: "", action_id: "" });
                }}
              >
                <X className="h-4 w-4 mr-1" />
                Cancelar
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {products.map((product) => (
            <div key={product.id} className="p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{product.name}</h3>
                  {product.description && (
                    <p className="text-sm text-gray-600">{product.description}</p>
                  )}
                  <p className="text-xs text-blue-600">
                    Acción: {actions.find(action => action.id === product.action_id)?.name}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(product)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDelete(product)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
