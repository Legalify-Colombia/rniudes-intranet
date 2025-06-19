
import { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Dashboard } from "@/components/Dashboard";
import { UserManagement } from "@/components/UserManagement";
import { CampusManagement } from "@/components/CampusManagement";
import { InternationalizationManagers } from "@/components/InternationalizationManagers";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  const [activeView, setActiveView] = useState("dashboard");

  const renderContent = () => {
    switch (activeView) {
      case "users":
        return <UserManagement />;
      case "programs":
        return <CampusManagement />;
      case "managers":
        return <InternationalizationManagers />;
      default:
        return <Dashboard />;
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
              </nav>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4 mr-2" />
                Notificaciones
              </Button>
              <div className="text-sm text-gray-600">
                <p className="font-medium">Admin DRNI</p>
                <p className="text-xs">Administrador</p>
              </div>
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
