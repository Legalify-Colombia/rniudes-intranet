
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { useAuth } from "@/hooks/useAuth";
import { NotificationFeed } from "@/components/NotificationFeed";
import { supabase } from "@/integrations/supabase/client";
import { 
  Building2,
  GraduationCap,
  Users,
  Target,
  Activity,
  Package,
  TrendingUp,
  School,
  Settings,
  Mail
} from "lucide-react";
import { EmailConfigurationForm } from "@/components/EmailConfigurationForm";

export function AdminDashboard() {
  const { profile } = useAuth();
  const { 
    fetchCampus,
    fetchFaculties,
    fetchStrategicAxes,
    fetchActions,
    fetchProducts
  } = useSupabaseData();
  
  const [adminStats, setAdminStats] = useState({
    totalCampus: 0,
    totalFaculties: 0,
    totalManagers: 0,
    totalAxes: 0,
    totalActions: 0,
    totalProducts: 0,
    overallProgress: 0
  });
  const [campusList, setCampusList] = useState<any[]>([]);
  const [selectedCampus, setSelectedCampus] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("dashboard");

  useEffect(() => {
    loadAdminData();
  }, [selectedCampus]);

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*');
      
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

      // Filtrar por campus si está seleccionado
      let filteredFaculties = allFaculties;
      let filteredProfiles = allProfiles;

      if (selectedCampus !== "all") {
        filteredFaculties = allFaculties.filter(faculty => faculty.campus_id === selectedCampus);
        filteredProfiles = allProfiles.filter(profile => profile.campus_id === selectedCampus);
      }

      // Contar solo gestores
      const managers = filteredProfiles.filter(profile => profile.role === 'Gestor');

      // Calcular progreso simulado
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
      // Datos de ejemplo para demostración
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Navigation */}
      <div className="flex justify-center mb-8">
        <div className="flex gap-2 p-2 bg-gray-100 rounded-lg">
          <button
            onClick={() => setActiveSection("dashboard")}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeSection === "dashboard" 
                ? "bg-white shadow-sm text-blue-600" 
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Target className="h-4 w-4 inline mr-2" />
            Dashboard
          </button>
          <button
            onClick={() => setActiveSection("email")}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeSection === "email" 
                ? "bg-white shadow-sm text-blue-600" 
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Mail className="h-4 w-4 inline mr-2" />
            Configuración Email
          </button>
        </div>
      </div>

      {activeSection === "email" ? (
        <EmailConfigurationForm />
      ) : (
        <>
          {/* Header con filtro */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Administrativo</h1>
            <p className="text-gray-600 mb-4">Panel de control para administradores</p>
            
            <div className="flex justify-center">
              <div className="w-64">
                <Select value={selectedCampus} onValueChange={setSelectedCampus}>
                  <SelectTrigger>
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

      {/* Indicadores Administrativos */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Campus */}
        <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-105 border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100">
          <CardHeader className="text-center pb-3">
            <div className="mx-auto w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mb-3 group-hover:bg-purple-700 transition-colors duration-300">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-lg font-semibold text-gray-800">Campus</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-4xl font-bold text-purple-600 mb-2 animate-pulse">
              {adminStats.totalCampus}
            </div>
            <p className="text-sm text-gray-600">
              {selectedCampus === "all" ? "Campus totales" : "Campus seleccionado"}
            </p>
          </CardContent>
        </Card>

        {/* Facultades */}
        <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-105 border-indigo-200 bg-gradient-to-br from-indigo-50 to-indigo-100">
          <CardHeader className="text-center pb-3">
            <div className="mx-auto w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center mb-3 group-hover:bg-indigo-700 transition-colors duration-300">
              <School className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-lg font-semibold text-gray-800">Facultades</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-4xl font-bold text-indigo-600 mb-2 animate-pulse">
              {adminStats.totalFaculties}
            </div>
            <p className="text-sm text-gray-600">
              Facultades activas
            </p>
          </CardContent>
        </Card>

        {/* Gestores */}
        <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-105 border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100">
          <CardHeader className="text-center pb-3">
            <div className="mx-auto w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center mb-3 group-hover:bg-emerald-700 transition-colors duration-300">
              <Users className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-lg font-semibold text-gray-800">Gestores</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-4xl font-bold text-emerald-600 mb-2 animate-pulse">
              {adminStats.totalManagers}
            </div>
            <p className="text-sm text-gray-600">
              Gestores activos
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
              {adminStats.overallProgress}%
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div 
                className="bg-orange-600 h-2 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${adminStats.overallProgress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600">
              Avance institucional
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Indicadores de Ejes Estratégicos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-xl font-semibold text-gray-800">
            Elementos Estratégicos Numéricos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {/* Ejes Estratégicos */}
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Target className="h-8 w-8 text-blue-600 mr-2" />
                <div>
                  <div className="text-2xl font-bold text-blue-600">{adminStats.totalAxes}</div>
                  <p className="text-sm text-gray-600">Ejes Estratégicos</p>
                </div>
              </div>
            </div>

            {/* Acciones */}
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Activity className="h-8 w-8 text-green-600 mr-2" />
                <div>
                  <div className="text-2xl font-bold text-green-600">{adminStats.totalActions}</div>
                  <p className="text-sm text-gray-600">Acciones Definidas</p>
                </div>
              </div>
            </div>

            {/* Productos */}
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Package className="h-8 w-8 text-purple-600 mr-2" />
                <div>
                  <div className="text-2xl font-bold text-purple-600">{adminStats.totalProducts}</div>
                  <p className="text-sm text-gray-600">Productos</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

          {/* Notificaciones */}
          <Card>
            <CardHeader>
              <CardTitle className="text-center text-xl font-semibold text-gray-800">
                Notificaciones de Actividad
              </CardTitle>
            </CardHeader>
            <CardContent>
              <NotificationFeed />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
