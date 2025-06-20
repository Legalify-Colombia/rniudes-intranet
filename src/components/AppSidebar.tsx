
import { Calendar, Users, Building, UserCheck, BarChart3, FileText, CheckSquare } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface AppSidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

export function AppSidebar({ activeView, setActiveView }: AppSidebarProps) {
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

  const getMenuItems = () => {
    const baseItems = [
      {
        title: "Dashboard",
        url: "dashboard",
        icon: BarChart3,
        roles: ["Administrador", "Coordinador", "Gestor"]
      }
    ];

    const adminItems = [
      {
        title: "Gestión de Usuarios",
        url: "users",
        icon: Users,
        roles: ["Administrador"]
      },
      {
        title: "Campus y Programas",
        url: "programs",
        icon: Building,
        roles: ["Administrador"]
      },
      {
        title: "Configuración Estratégica",
        url: "strategic",
        icon: CheckSquare,
        roles: ["Administrador"]
      }
    ];

    const coordinatorItems = [
      {
        title: "Gestores de Internacionalización",
        url: "managers",
        icon: UserCheck,
        roles: ["Administrador", "Coordinador"]
      },
      {
        title: "Informes de Gestores",
        url: "manager-reports",
        icon: FileText,
        roles: ["Administrador", "Coordinador"]
      },
      {
        title: "Aprobación de Planes",
        url: "work-plan-approval",
        icon: CheckSquare,
        roles: ["Administrador", "Coordinador"]
      }
    ];

    const managerItems = [
      {
        title: "Mi Plan de Trabajo",
        url: "manager-work-plan",
        icon: Calendar,
        roles: ["Gestor"]
      },
      {
        title: "Mi Informe",
        url: "my-report",
        icon: FileText,
        roles: ["Gestor"]
      }
    ];

    const allItems = [...baseItems, ...adminItems, ...coordinatorItems, ...managerItems];
    
    return allItems.filter(item => 
      profile && item.roles.includes(profile.role)
    );
  };

  const menuItems = getMenuItems();

  return (
    <Sidebar className="border-r border-sidebar-border">
      <SidebarHeader className="p-6">
        <div className="text-sidebar-foreground flex items-center space-x-3">
          <img 
            src="https://udes.edu.co/images/logo/logo-con-acreditada-color.png" 
            alt="UDES Logo" 
            className="h-12 w-auto"
          />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/70">Menú Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    className={`text-sidebar-foreground hover:bg-sidebar-accent ${
                      activeView === item.url ? 'bg-sidebar-accent' : ''
                    }`}
                  >
                    <button 
                      onClick={() => setActiveView(item.url)}
                      className="flex items-center gap-3 w-full"
                    >
                      <item.icon size={18} />
                      <span>{item.title}</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-6">
        <div className="text-sm text-sidebar-foreground/70 space-y-2">
          <p><strong>Usuario:</strong> {profile?.full_name}</p>
          <p><strong>Rol:</strong> {profile?.role}</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleSignOut}
            className="w-full mt-2"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Salir
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
