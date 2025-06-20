
import { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Dashboard } from "@/components/Dashboard";
import { UserManagement } from "@/components/UserManagement";
import { CampusManagement } from "@/components/CampusManagement";
import { InternationalizationManagers } from "@/components/InternationalizationManagers";
import { StrategicConfiguration } from "@/components/StrategicConfiguration";
import { ManagerReports } from "@/components/ManagerReports";
import { ManagerWorkPlan } from "@/components/ManagerWorkPlan";
import { Bell, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [activeView, setActiveView] = useState("dashboard");
  const { profile, signOut } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Error al cerrar sesión",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const renderContent = () => {
    switch (activeView) {
      case "users":
        return <UserManagement />;
      case "programs":
        return <CampusManagement />;
      case "managers":
        return <InternationalizationManagers />;
      case "strategic":
        return <StrategicConfiguration />;
      case "manager-reports":
        return <ManagerReports />;
      case "manager-work-plan":
        return <ManagerWorkPlan />;
      default:
        return <Dashboard />;
    }
  };

  const canAccessSection = (section: string) => {
    if (!profile) return false;
    
    switch (section) {
      case "users":
      case "programs":
      case "strategic":
        return profile.role === "Administrador";
      case "managers":
      case "manager-reports":
        return ["Administrador", "Coordinador"].includes(profile.role);
      case "manager-work-plan":
        return profile.role === "Gestor";
      default:
        return true;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <AppSidebar />
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <SidebarTrigger />
              <div className="h-8 w-px bg-gray-200" />
              <nav className="flex space-x-1">
                <button
                  onClick={() => setActiveView("dashboard")}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeView === "dashboard"
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  Dashboard
                </button>
                
                {canAccessSection("users") && (
                  <button
                    onClick={() => setActiveView("users")}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeView === "users"
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    Usuarios
                  </button>
                )}
                
                {canAccessSection("programs") && (
                  <button
                    onClick={() => setActiveView("programs")}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeView === "programs"
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    Campus y Programas
                  </button>
                )}
                
                {canAccessSection("managers") && (
                  <button
                    onClick={() => setActiveView("managers")}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeView === "managers"
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    Gestores
                  </button>
                )}

                {canAccessSection("strategic") && (
                  <button
                    onClick={() => setActiveView("strategic")}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeView === "strategic"
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    Configuración Estratégica
                  </button>
                )}

                {canAccessSection("manager-reports") && (
                  <button
                    onClick={() => setActiveView("manager-reports")}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeView === "manager-reports"
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    Informes de Gestores
                  </button>
                )}

                {canAccessSection("manager-work-plan") && (
                  <button
                    onClick={() => setActiveView("manager-work-plan")}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeView === "manager-work-plan"
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    Mi Plan de Trabajo
                  </button>
                )}
              </nav>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4 mr-2" />
                Notificaciones
              </Button>
              <div className="text-sm text-gray-600">
                <p className="font-medium">{profile?.full_name}</p>
                <p className="text-xs">{profile?.position}</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Salir
              </Button>
            </div>
          </header>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {renderContent()}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Index;
