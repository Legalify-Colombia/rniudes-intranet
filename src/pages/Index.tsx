
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
import { WorkPlanApproval } from "@/components/WorkPlanApproval";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const [activeView, setActiveView] = useState("dashboard");
  const { profile } = useAuth();

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
      case "work-plan-approval":
        return <WorkPlanApproval />;
      case "my-report":
        return <div className="p-6"><h1>Mi Informe - En desarrollo</h1></div>;
      default:
        return <Dashboard />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <AppSidebar activeView={activeView} setActiveView={setActiveView} />
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Top Bar simplificada */}
          <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <SidebarTrigger />
              <div className="h-8 w-px bg-gray-200" />
              <img 
                src="https://udes.edu.co/images/logo/logo-con-acreditada-color.png" 
                alt="UDES Logo" 
                className="h-8 w-auto md:hidden"
              />
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Notificaciones</span>
              </Button>
              <div className="text-sm text-gray-600 hidden md:block">
                <p className="font-medium">{profile?.full_name}</p>
                <p className="text-xs">{profile?.position}</p>
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
