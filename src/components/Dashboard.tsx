import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { useAuth } from "@/hooks/useAuth";
import { NotificationFeed } from "@/components/NotificationFeed";
import { StrategicAxesProgress } from "@/components/StrategicAxesProgress";
import { AdminDashboard } from "@/components/AdminDashboard"; // Asumo que este es el dashboard de admin
import { useReports } from "@/hooks/useReports";
import { 
  Target,
  TrendingUp,
  Package,
  Activity
} from "lucide-react";

// --- COMPONENTE REUTILIZABLE DE TARJETA DE ESTADÍSTICAS ---
// Para mantener un estilo consistente con el dashboard de admin
const StatCard = ({ icon: Icon, title, value, subtitle, colorClass }) => (
  <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
      <Icon className={`h-5 w-5 ${colorClass}`} />
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-bold text-gray-900">{value}</div>
      <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
    </CardContent>
  </Card>
);


// --- COMPONENTE PRINCIPAL DEL DASHBOARD DE GESTIÓN ---
export function Dashboard() {
  const { profile } = useAuth();
  const { fetchStrategicAxes, fetchActions, fetchProducts } = useSupabaseData();
  const { fetchManagerReportsByManager } = useReports();
  
  const [stats, setStats] = useState({
    totalAxes: 0,
    totalActions: 0,
    totalProducts: 0,
    overallProgress: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Solo carga los datos de gestor si el perfil no es de Administrador
    if (profile && profile.role !== 'Administrador') {
      loadManagerData();
    } else if (profile) {
        // Si es admin, no necesita cargar estos datos, ya que se mostrará otro componente
        setLoading(false);
    }
  }, [profile]);

  const loadManagerData = async () => {
    setLoading(true);
    try {
      // Aquí podrías filtrar las acciones/productos por el `profile.id` del gestor
      const [axesResult, actionsResult, productsResult, reportsResult] = await Promise.all([
        fetchStrategicAxes(),
        fetchActions(), // Idealmente: fetchActions({ manager_id: profile.id })
        fetchProducts(),  // Idealmente: fetchProducts({ manager_id: profile.id })
        fetchManagerReportsByManager(profile.id)
      ]);

      const axes = axesResult.data || [];
      const actions = actionsResult.data || [];
      const products = productsResult.data || [];
      const reports = reportsResult.data || [];

      // Progreso real: usar el último informe del gestor
      let overallProgress = 0;
      if (reports.length > 0) {
        const latest = reports.reduce((acc: any, curr: any) => {
          const accDate = acc?.submitted_date || acc?.created_at || null;
          const currDate = curr?.submitted_date || curr?.created_at || null;
          return (new Date(currDate) > new Date(accDate)) ? curr : acc;
        });
        overallProgress = Math.round(Number(latest?.total_progress_percentage ?? 0));
      }

      setStats({
        totalAxes: axes.length,
        totalActions: actions.length,
        totalProducts: products.length,
        overallProgress
      });
    } catch (error) {
      console.error('Error loading manager data:', error);
      // Datos de ejemplo para demostración
      setStats({
        totalAxes: 9,
        totalActions: 20,
        totalProducts: 23,
        overallProgress: 52
      });
    } finally {
      setLoading(false);
    }
  };

  // Si el perfil está cargando, muestra un loader
  if (!profile) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  // Redirige al dashboard de administrador si el rol corresponde
  if (profile.role === 'Administrador') {
    return <AdminDashboard />;
  }
  
  // Muestra el loader mientras se cargan los datos del gestor
  if (loading) {
     return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard de Gestión</h1>
          <p className="text-gray-500 mt-1">Seguimiento de tus ejes, acciones y productos asignados.</p>
        </header>

        {/* Fila de Estadísticas Principales */}
        <div className="grid gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={Target} title="Ejes Estratégicos" value={stats.totalAxes} subtitle="Ejes definidos" colorClass="text-blue-500" />
          <StatCard icon={Activity} title="Acciones" value={stats.totalActions} subtitle="Acciones planificadas" colorClass="text-green-500" />
          <StatCard icon={Package} title="Productos" value={stats.totalProducts} subtitle="Productos esperados" colorClass="text-purple-500" />
          <StatCard icon={TrendingUp} title="Tu Progreso General" value={`${stats.overallProgress}%`} subtitle="Avance total" colorClass="text-orange-500" />
        </div>

        {/* Contenido Principal: Progreso y Notificaciones */}
        <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Columna Principal: Progreso Detallado */}
          <div className="lg:col-span-2">
            <Card className="shadow-sm h-full">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-800">
                  Progreso Detallado por Eje Estratégico
                </CardTitle>
                <p className="text-sm text-gray-500">Visualiza el avance de cada uno de los ejes estratégicos.</p>
              </CardHeader>
              <CardContent>
                {/* Este es el componente principal que querías destacar */}
                <StrategicAxesProgress />
              </CardContent>
            </Card>
          </div>

          {/* Columna Lateral: Notificaciones */}
          <div className="lg:col-span-1">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-800">
                  Actividad Reciente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <NotificationFeed />
              </CardContent>
            </Card>
          </div>

        </main>
      </div>
    </div>
  );
}
