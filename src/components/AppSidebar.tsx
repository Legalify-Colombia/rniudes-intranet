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
import { useState } from "react"

interface AppSidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

export function AppSidebar({ activeView, setActiveView }: AppSidebarProps) {
  const { profile, signOut } = useAuth();
  const { toast } = useToast();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Error al cerrar sesión",
        description: error.message,
        variant: "destructive",
      });
    }
    setIsLoggingOut(false);
  };

  const handleMenuClick = (url: string) => {
    setActiveView(url);
  };

  const getMenuItems = () => {
    const baseItems = [
      {
        title: "Dashboard",
        url: "dashboard",
        icon: BarChart3,
        roles: ["Administrador", "Coordinador", "Gestor"],
        color: "text-emerald-600",
        bgColor: "bg-emerald-50",
        borderColor: "border-emerald-200",
        hoverColor: "hover:bg-emerald-100"
      }
    ];

    const adminItems = [
      {
        title: "Gestión de Usuarios",
        url: "users",
        icon: Users,
        roles: ["Administrador"],
        color: "text-blue-600",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200",
        hoverColor: "hover:bg-blue-100"
      },
      {
        title: "Campus y Programas",
        url: "programs",
        icon: Building,
        roles: ["Administrador"],
        color: "text-purple-600",
        bgColor: "bg-purple-50",
        borderColor: "border-purple-200",
        hoverColor: "hover:bg-purple-100"
      },
      {
        title: "Configuración Estratégica",
        url: "strategic",
        icon: CheckSquare,
        roles: ["Administrador"],
        color: "text-red-600",
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
        hoverColor: "hover:bg-red-100"
      }
    ];

    const coordinatorItems = [
      {
        title: "Gestores de Internacionalización",
        url: "managers",
        icon: UserCheck,
        roles: ["Administrador", "Coordinador"],
        color: "text-amber-600",
        bgColor: "bg-amber-50",
        borderColor: "border-amber-200",
        hoverColor: "hover:bg-amber-100"
      },
      {
        title: "Informes de Gestores",
        url: "manager-reports",
        icon: FileText,
        roles: ["Administrador", "Coordinador"],
        color: "text-cyan-600",
        bgColor: "bg-cyan-50",
        borderColor: "border-cyan-200",
        hoverColor: "hover:bg-cyan-100"
      },
      {
        title: "Aprobación de Planes",
        url: "work-plan-approval",
        icon: CheckSquare,
        roles: ["Administrador", "Coordinador"],
        color: "text-teal-600",
        bgColor: "bg-teal-50",
        borderColor: "border-teal-200",
        hoverColor: "hover:bg-teal-100"
      }
    ];

    const managerItems = [
      {
        title: "Mi Plan de Trabajo",
        url: "manager-work-plan",
        icon: Calendar,
        roles: ["Gestor"],
        color: "text-pink-600",
        bgColor: "bg-pink-50",
        borderColor: "border-pink-200",
        hoverColor: "hover:bg-pink-100"
      },
      {
        title: "Mi Informe",
        url: "my-report",
        icon: FileText,
        roles: ["Gestor"],
        color: "text-indigo-600",
        bgColor: "bg-indigo-50",
        borderColor: "border-indigo-200",
        hoverColor: "hover:bg-indigo-100"
      }
    ];

    const allItems = [...baseItems, ...adminItems, ...coordinatorItems, ...managerItems];
    
    return allItems.filter(item => 
      profile && item.roles.includes(profile.role)
    );
  };

  const menuItems = getMenuItems();

  return (
    <Sidebar className="border-r border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-700">
      {/* Header con logo más limpio */}
      <SidebarHeader className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-center">
          <div className="transition-transform duration-300 hover:scale-105">
            <img 
              src="https://udes.edu.co/images/logo/logo-con-acreditada-color.png" 
              alt="UDES Logo" 
              className="h-10 w-auto max-w-full object-contain"
            />
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="bg-white dark:bg-gray-900 p-3">
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-600 dark:text-gray-300 font-medium text-xs mb-3 px-2 uppercase tracking-wide">
            Menú Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    className="p-0 hover:bg-transparent"
                  >
                    <button 
                      onClick={() => handleMenuClick(item.url)}
                      className={`
                        w-full flex items-center gap-3 p-2.5 text-left rounded-lg 
                        transition-all duration-200 ease-in-out relative
                        ${activeView === item.url 
                          ? `${item.bgColor} ${item.borderColor} border shadow-sm` 
                          : `hover:bg-gray-50 dark:hover:bg-gray-800 ${item.hoverColor}`
                        }
                      `}
                    >
                      {/* Indicador activo */}
                      {activeView === item.url && (
                        <div className={`absolute left-0 top-1/2 -translate-y-1/2 h-4 w-1 ${item.color.replace('text-', 'bg-')} rounded-r`} />
                      )}
                      
                      {/* Icono */}
                      <div className={`
                        flex-shrink-0 p-1.5 rounded-md transition-colors duration-200
                        ${activeView === item.url 
                          ? 'bg-white shadow-sm' 
                          : 'group-hover:bg-white group-hover:shadow-sm'
                        }
                      `}>
                        <item.icon 
                          size={16} 
                          className={`
                            transition-colors duration-200
                            ${activeView === item.url 
                              ? item.color 
                              : 'text-gray-600 dark:text-gray-300'
                            }
                          `}
                        />
                      </div>
                      
                      {/* Texto */}
                      <span className={`
                        flex-1 font-medium text-sm leading-tight truncate
                        transition-colors duration-200
                        ${activeView === item.url 
                          ? 'text-gray-900 dark:text-white' 
                          : 'text-gray-700 dark:text-gray-200'
                        }
                      `}>
                        {item.title}
                      </span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      {/* Footer más compacto */}
      <SidebarFooter className="p-3 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 border-t border-gray-200 dark:border-gray-700">
        <div className="space-y-3">
          {/* Información del usuario compacta */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
                {profile?.full_name?.split(' ').map(name => name[0]).join('').slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                  {profile?.full_name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {profile?.role}
                </p>
              </div>
            </div>
          </div>

          {/* Botón de salir compacto */}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleSignOut}
            disabled={isLoggingOut}
            className="
              w-full h-8 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 
              hover:bg-red-50 hover:border-red-200 hover:text-red-700
              dark:hover:bg-red-900/20 dark:hover:border-red-700 dark:hover:text-red-400
              transition-all duration-200 text-xs font-medium
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            <LogOut className={`h-3 w-3 mr-1.5 ${isLoggingOut ? 'animate-spin' : ''}`} />
            {isLoggingOut ? 'Cerrando...' : 'Salir'}
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}