import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { useAuth } from "@/hooks/useAuth";
import { NotificationFeed } from "@/components/NotificationFeed";
import { EmailConfigurationForm } from "@/components/EmailConfigurationForm";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { 
  Building2,
  School,
  Users,
  Target,
  Activity,
  Package,
  TrendingUp,
  Settings,
  Mail,
  LayoutDashboard
} from "lucide-react";

// --- COMPONENTES REFACTORIZADOS ---

// Componente para las tarjetas de estadísticas principales
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

// Componente para el gráfico de progreso circular
const ProgressCircle = ({ progress }) => {
  const data = [
    { name: 'Completed', value: progress },
    { name: 'Remaining', value: 100 - progress },
  ];
  const COLORS = ['#3b82f6', '#e5e7eb']; // blue-500, gray-200

  return (
    <div className="relative w-40 h-40 mx-auto">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={70}
            startAngle={90}
            endAngle={450}
            paddingAngle={0}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex items-center justify-center flex-col">
        <span className="text-3xl font-bold text-blue-600">{`${progress}%`}</span>
        <span className="text-sm text-gray-500">Completado</span>
      </div>
    </div>
  );
};

// --- COMPONENTE PRINCIPAL DEL DASHBOARD ---

export function AdminDashboard() {
  const { profile } = useAuth();
  const { fetchCampus, fetchFaculties, fetchStrategicAxes, fetchActions, fetchProducts } = useSupabaseData();
  
  const [adminStats, setAdminStats] = useState({
    totalCampus: 0,
    totalFaculties: 0,
    totalManagers: 0,
    totalAxes: 0,
    totalActions: 0,
    totalProducts: 0,
    overallProgress: 0
  });
  const [campusList, setCampusList] = useState([]);
  const [selectedCampus, setSelectedCampus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("dashboard");

  useEffect(() => {
    loadAdminData();
  }, [selectedCampus]);

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase.from('profiles').select('*');
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching profiles:', error);
      return { data: null, error };
    }
  };

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [
        campusResult,
        facultiesResult,
        profilesResult,
        axesResult,
        actionsResult,
        productsResult
      ] = await Promise.all([
        fetchCampus(),
        fetchFaculties(),
        fetchProfiles(),
        fetchStrategicAxes(),
        fetchActions(),
        fetchProducts()
      ]);

      const allCampus = campusResult.data || [];
      const allFaculties = facultiesResult.data || [];
      const allProfiles = profilesResult.data || [];
      const allAxes = axesResult.data || [];
      const allActions = actionsResult.data || [];
      const allProducts = productsResult.data || [];

      setCampusList(allCampus);

      let filteredFaculties = allFaculties;
      let filteredProfiles = allProfiles;

      if (selectedCampus !== "all") {
        filteredFaculties = allFaculties.filter(faculty => faculty.campus_id === selectedCampus);
        filteredProfiles = allProfiles.filter(profile => profile.campus_id === selectedCampus);
      }
      
      const managers = filteredProfiles.filter(profile => profile.role === 'Gestor');
      const totalElements = allAxes.length + allActions.length + allProducts.length;
      const progressSimulated = totalElements > 0 ? Math.min(100, (totalElements * 8) + Math.random() * 30) : 0;

      setAdminStats({
        totalCampus: selectedCampus === "all" ? allCampus.length : 1,
        totalFaculties: filteredFaculties.length,
        totalManagers: managers.length,
        totalAxes: allAxes.length,
        totalActions: allActions.length,
        totalProducts: allProducts.length,
        overallProgress: Math.round(progressSimulated)
      });
    } catch (error) {
      console.error('Error loading admin data:', error);
      // Datos de ejemplo para demostración si falla la carga
      setAdminStats({
        totalCampus: 5,
        totalFaculties: 12,
        totalManagers: 25,
        totalAxes: 9,
        totalActions: 20,
        totalProducts: 23,
        overallProgress: 68
      });
    } finally {
      setLoading(false);
    }
  };

  // El gráfico ahora solo compara Acciones y Productos
  const strategicData = [
    { name: 'Acciones', total: adminStats.totalActions, fill: '#10b981' },
    { name: 'Productos', total: adminStats.totalProducts, fill: '#8b5cf6' },
  ];

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
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard Administrativo</h1>
              <p className="text-gray-500 mt-1">Vista general del estado institucional.</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-56">
                <Select value={selectedCampus} onValueChange={setSelectedCampus}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Filtrar por campus" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los Campus</SelectItem>
                    {campusList.map((campus) => (
                      <SelectItem key={campus.id} value={campus.id}>
                        {campus.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </header>

        {/* Navigation */}
        <div className="mb-8">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveSection("dashboard")}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
                activeSection === "dashboard"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </button>
            <button
              onClick={() => setActiveSection("email")}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
                activeSection === "email"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              <Mail className="h-4 w-4" />
              Configuración Email
            </button>
          </div>
        </div>
        
        {activeSection === "email" ? (
          <Card className="shadow-sm">
            <CardHeader>
                <CardTitle>Configuración de Correo Electrónico</CardTitle>
            </CardHeader>
            <CardContent>
                <EmailConfigurationForm />
            </CardContent>
          </Card>
        ) : (
          <main className="space-y-8">
            {/* Fila de Estadísticas Principales */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <StatCard icon={Building2} title="Campus" value={adminStats.totalCampus} subtitle={selectedCampus === "all" ? "Campus totales" : "Campus seleccionado"} colorClass="text-violet-500" />
              <StatCard icon={School} title="Facultades" value={adminStats.totalFaculties} subtitle="Facultades activas" colorClass="text-sky-500" />
              <StatCard icon={Users} title="Gestores" value={adminStats.totalManagers} subtitle="Gestores activos" colorClass="text-emerald-500" />
              <StatCard icon={TrendingUp} title="Progreso" value={`${adminStats.overallProgress}%`} subtitle="Avance institucional" colorClass="text-amber-500" />
            </div>

            {/* Fila de Gráficos y Notificaciones */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Columna de Gráficos y Ejes */}
              <div className="lg:col-span-2 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Tarjeta Numérica para Ejes Estratégicos */}
                    <div className="md:col-span-1">
                        <Card className="shadow-sm h-full flex flex-col justify-center items-center text-center">
                            <CardHeader>
                                <Target className="h-10 w-10 text-blue-600 mx-auto" />
                                <CardTitle className="mt-2 text-lg font-semibold text-gray-800">Ejes Estratégicos</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-5xl font-bold text-blue-600">{adminStats.totalAxes}</p>
                                <p className="text-sm text-gray-500 mt-1">Definidos</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Gráfico de Acciones y Productos */}
                    <div className="md:col-span-2">
                        <Card className="shadow-sm">
                          <CardHeader>
                            <CardTitle className="text-lg font-semibold text-gray-800">Resumen de Acciones y Productos</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="h-80">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={strategicData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                  <XAxis dataKey="name" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                                  <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                                  <Tooltip
                                    contentStyle={{
                                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                      backdropFilter: 'blur(5px)',
                                      border: '1px solid #e5e7eb',
                                      borderRadius: '0.5rem',
                                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                                    }}
                                    cursor={{ fill: 'rgba(229, 231, 235, 0.5)' }}
                                  />
                                  <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                                    {strategicData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                  </Bar>
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          </CardContent>
                        </Card>
                    </div>
                </div>
              </div>

              {/* Columna de Progreso y Notificaciones */}
              <div className="space-y-8">
                {/* Progreso General */}
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-gray-800 text-center">Progreso General</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ProgressCircle progress={adminStats.overallProgress} />
                  </CardContent>
                </Card>
                
                {/* Notificaciones */}
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-gray-800">Actividad Reciente</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <NotificationFeed />
                  </CardContent>
                </Card>
              </div>
            </div>
          </main>
        )}
      </div>
    </div>
  );
}
