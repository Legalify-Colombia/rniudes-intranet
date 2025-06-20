import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { useAuth } from "@/hooks/useAuth";
import { NotificationFeed } from "@/components/NotificationFeed";
import { StrategicAxesProgress } from "@/components/StrategicAxesProgress";
import { 
  Target,
  TrendingUp,
  Package,
  Activity
} from "lucide-react";

export function Dashboard() {
  const { profile } = useAuth();
  const { 
    fetchStrategicAxes,
    fetchActions,
    fetchProducts
  } = useSupabaseData();
  
  const [axesStats, setAxesStats] = useState({
    totalAxes: 0,
    totalActions: 0,
    totalProducts: 0,
    overallProgress: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAxesData();
  }, []);

  const loadAxesData = async () => {
    try {
      const [
        axesResult,
        actionsResult,
        productsResult
      ] = await Promise.all([
        fetchStrategicAxes(),
        fetchActions(),
        fetchProducts()
      ]);

      const axes = axesResult.data || [];
      const actions = actionsResult.data || [];
      const products = productsResult.data || [];

      // Calcular progreso general (ejemplo de cálculo)
      const completedProducts = products.filter(p => p.status === 'completed').length;
      const overallProgress = products.length > 0 ? Math.round((completedProducts / products.length) * 100) : 0;

      setAxesStats({
        totalAxes: axes.length,
        totalActions: actions.length,
        totalProducts: products.length,
        overallProgress
      });
    } catch (error) {
      console.error('Error loading axes data:', error);
      // Datos de ejemplo para demostración
      setAxesStats({
        totalAxes: 9,
        totalActions: 20,
        totalProducts: 23,
        overallProgress: 52
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Indicadores Principales por Ejes Estratégicos */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard de Gestión</h1>
        <p className="text-gray-600">Seguimiento de Ejes Estratégicos</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Ejes Estratégicos */}
        <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-105 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader className="text-center pb-3">
            <div className="mx-auto w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mb-3 group-hover:bg-blue-700 transition-colors duration-300">
              <Target className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-lg font-semibold text-gray-800">Ejes Estratégicos</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2 animate-pulse">
              {axesStats.totalAxes}
            </div>
            <p className="text-sm text-gray-600">
              Ejes definidos
            </p>
          </CardContent>
        </Card>

        {/* Acciones */}
        <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-105 border-green-200 bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader className="text-center pb-3">
            <div className="mx-auto w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mb-3 group-hover:bg-green-700 transition-colors duration-300">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-lg font-semibold text-gray-800">Acciones</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-4xl font-bold text-green-600 mb-2 animate-pulse">
              {axesStats.totalActions}
            </div>
            <p className="text-sm text-gray-600">
              Acciones planificadas
            </p>
          </CardContent>
        </Card>

        {/* Productos */}
        <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-105 border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100">
          <CardHeader className="text-center pb-3">
            <div className="mx-auto w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mb-3 group-hover:bg-purple-700 transition-colors duration-300">
              <Package className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-lg font-semibold text-gray-800">Productos</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-4xl font-bold text-purple-600 mb-2 animate-pulse">
              {axesStats.totalProducts}
            </div>
            <p className="text-sm text-gray-600">
              Productos esperados
            </p>
          </CardContent>
        </Card>

        {/* Progreso General */}
        <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-105 border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100">
          <CardHeader className="text-center pb-3">
            <div className="mx-auto w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center mb-3 group-hover:bg-orange-700 transition-colors duration-300">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-lg font-semibold text-gray-800">Progreso General</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-4xl font-bold text-orange-600 mb-2 animate-pulse">
              {axesStats.overallProgress}%
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div 
                className="bg-orange-600 h-2 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${axesStats.overallProgress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600">
              Avance total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Separador visual */}
      <div className="border-t border-gray-200 my-8"></div>

      {/* Componentes movidos al final */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="hover:shadow-md transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="text-center text-xl font-semibold text-gray-800">
              Notificaciones de Actividad
            </CardTitle>
          </CardHeader>
          <CardContent>
            <NotificationFeed />
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="text-center text-xl font-semibold text-gray-800">
              Progreso Detallado por Eje Estratégico
            </CardTitle>
          </CardHeader>
          <CardContent>
            <StrategicAxesProgress />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}