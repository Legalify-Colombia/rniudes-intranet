
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Target, CheckCircle2 } from "lucide-react";
import { useSupabaseData } from "@/hooks/useSupabaseData";

export function StrategicAxesProgress() {
  const [strategicAxes, setStrategicAxes] = useState<any[]>([]);
  const [actions, setActions] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const { 
    fetchStrategicAxes, 
    fetchActions, 
    fetchProducts, 
    fetchWorkPlans 
  } = useSupabaseData();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [axesResult, actionsResult, productsResult, workPlansResult] = await Promise.all([
        fetchStrategicAxes(),
        fetchActions(),
        fetchProducts(),
        fetchWorkPlans()
      ]);

      if (axesResult.data) setStrategicAxes(axesResult.data);
      if (actionsResult.data) setActions(actionsResult.data);
      if (productsResult.data) setProducts(productsResult.data);
      
      console.log('Strategic axes loaded:', axesResult.data);
      console.log('Actions loaded:', actionsResult.data);
      console.log('Products loaded:', productsResult.data);
      console.log('Work plans loaded:', workPlansResult.data);
    } catch (error) {
      console.error('Error loading strategic data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAxisProgress = (axisId: string) => {
    const axisActions = actions.filter(action => action.strategic_axis_id === axisId);
    const axisProducts = products.filter(product => 
      axisActions.some(action => action.id === product.action_id)
    );
    
    if (axisProducts.length === 0) return 0;
    
    // Simulamos progreso basado en la cantidad de productos
    // En una implementación real, esto vendría de los reportes de progreso
    return Math.min(100, (axisProducts.length * 15) + Math.random() * 30);
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "bg-green-500";
    if (progress >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getStatusBadge = (progress: number) => {
    if (progress >= 80) {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          En Objetivo
        </Badge>
      );
    }
    if (progress >= 50) {
      return (
        <Badge variant="default" className="bg-yellow-100 text-yellow-800">
          <TrendingUp className="w-3 h-3 mr-1" />
          En Progreso
        </Badge>
      );
    }
    return (
      <Badge variant="destructive">
        <Target className="w-3 h-3 mr-1" />
        Requiere Atención
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Progreso por Ejes Estratégicos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalAxes = strategicAxes.length;
  const totalActions = actions.length;
  const totalProducts = products.length;
  const overallProgress = strategicAxes.length > 0 
    ? strategicAxes.reduce((acc, axis) => acc + calculateAxisProgress(axis.id), 0) / strategicAxes.length 
    : 0;

  return (
    <div className="space-y-6">
      {/* Resumen General */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ejes Estratégicos</p>
                <p className="text-2xl font-bold text-primary">{totalAxes}</p>
              </div>
              <Target className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Acciones</p>
                <p className="text-2xl font-bold text-blue-600">{totalActions}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Productos</p>
                <p className="text-2xl font-bold text-green-600">{totalProducts}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Progreso General</p>
                <p className="text-2xl font-bold text-purple-600">{Math.round(overallProgress)}%</p>
              </div>
              <div className="h-8 w-8">
                <Progress value={overallProgress} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progreso por Eje Estratégico */}
      <Card>
        <CardHeader>
          <CardTitle>Progreso Detallado por Eje Estratégico</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {strategicAxes.map((axis) => {
              const progress = calculateAxisProgress(axis.id);
              const axisActions = actions.filter(action => action.strategic_axis_id === axis.id);
              const axisProducts = products.filter(product => 
                axisActions.some(action => action.id === product.action_id)
              );

              return (
                <div key={axis.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{axis.code} - {axis.name}</h3>
                      <p className="text-sm text-gray-600">
                        {axisActions.length} acciones • {axisProducts.length} productos
                      </p>
                    </div>
                    {getStatusBadge(progress)}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progreso</span>
                      <span className="font-medium">{Math.round(progress)}%</span>
                    </div>
                    <Progress 
                      value={progress} 
                      className="h-2"
                    />
                  </div>

                  {axisActions.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium text-sm mb-2">Acciones:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {axisActions.map((action) => {
                          const actionProducts = products.filter(p => p.action_id === action.id);
                          return (
                            <div key={action.id} className="bg-gray-50 p-2 rounded text-sm">
                              <div className="font-medium">{action.code} - {action.name}</div>
                              <div className="text-gray-600">
                                {actionProducts.length} producto{actionProducts.length !== 1 ? 's' : ''}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {strategicAxes.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No hay ejes estratégicos configurados. 
              Ve a Configuración Estratégica para crear el primer eje.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
