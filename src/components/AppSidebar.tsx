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
        color: "text-blue-600"
      }
    ];

    const adminItems = [
      {
        title: "Gestión de Usuarios",
        url: "users",
        icon: Users,
        roles: ["Administrador"],
        color: "text-green-600"
      },
      {
        title: "Campus y Programas",
        url: "programs",
        icon: Building,
        roles: ["Administrador"],
        color: "text-purple-600"
      },
      {
        title: "Configuración Estratégica",
        url: "strategic",
        icon: CheckSquare,
        roles: ["Administrador"],
        color: "text-red-600"
      }
    ];

    const coordinatorItems = [
      {
        title: "Gestores de Internacionalización",
        url: "managers",
        icon: UserCheck,
        roles: ["Administrador", "Coordinador"],
        color: "text-indigo-600"
      },
      {
        title: "Informes de Gestores",
        url: "manager-reports",
        icon: FileText,
        roles: ["Administrador", "Coordinador"],
        color: "text-orange-600"
      },
      {
        title: "Aprobación de Planes",
        url: "work-plan-approval",
        icon: CheckSquare,
        roles: ["Administrador", "Coordinador"],
        color: "text-teal-600"
      }
    ];

    const managerItems = [
      {
        title: "Mi Plan de Trabajo",
        url: "manager-work-plan",
        icon: Calendar,
        roles: ["Gestor"],
        color: "text-pink-600"
      },
      {
        title: "Mi Informe",
        url: "my-report",
        icon: FileText,
        roles: ["Gestor"],
        color: "text-cyan-600"
      }
    ];

    const allItems = [...baseItems, ...adminItems, ...coordinatorItems, ...managerItems];
    
    return allItems.filter(item => 
      profile && item.roles.includes(profile.role)
    );
  };

  const menuItems = getMenuItems();

  return (
    <>
      <style>{`
        @keyframes slideInFromLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
      <Sidebar className="border-r border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-700">
        <SidebarHeader className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3 group">
            <div className="relative overflow-hidden rounded-lg bg-white p-2 shadow-sm group-hover:shadow-md transition-all duration-300">
              <img 
                src="https://udes.edu.co/images/logo/logo-con-acreditada-color.png" 
                alt="UDES Logo" 
                className="h-8 w-auto transition-transform duration-300 group-hover:scale-105"
              />
            </div>
           </div>
        </SidebarHeader>
        
        <SidebarContent className="bg-white dark:bg-gray-900 p-4">
          <SidebarGroup>
            <SidebarGroupLabel className="text-gray-600 dark:text-gray-300 font-medium text-sm mb-3 px-2">
              Menú Principal
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {menuItems.map((item, index) => (
                  <SidebarMenuItem key={item.title} className="relative">
                    <SidebarMenuButton 
                      asChild 
                      className={`
                        relative overflow-hidden rounded-xl transition-all duration-300 ease-in-out
                        hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 
                        hover:shadow-sm hover:scale-[1.02] hover:translate-x-1
                        dark:hover:from-gray-800 dark:hover:to-gray-700
                        ${activeView === item.url 
                          ? 'bg-gradient-to-r from-blue-100 to-indigo-100 shadow-md scale-[1.02] translate-x-1 dark:from-blue-900/20 dark:to-indigo-900/20' 
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                        }
                        group
                      `}
                      style={{
                        animationDelay: `${index * 50}ms`,
                        animation: 'slideInFromLeft 0.5s ease-out forwards'
                      }}
                    >
                      <button 
                        onClick={() => handleMenuClick(item.url)}
                        className="flex items-center gap-3 w-full p-3 text-left relative"
                      >
                        {/* Indicador activo */}
                        {activeView === item.url && (
                          <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-r-full" />
                        )}
                        
                        {/* Icono con animación */}
                        <div className={`
                          relative p-2 rounded-lg transition-all duration-300
                          ${activeView === item.url 
                            ? 'bg-white shadow-sm dark:bg-gray-800' 
                            : 'group-hover:bg-white group-hover:shadow-sm dark:group-hover:bg-gray-800'
                          }
                        `}>
                          <item.icon 
                            size={18} 
                            className={`
                              transition-all duration-300
                              ${activeView === item.url 
                                ? `${item.color} transform rotate-3` 
                                : 'text-gray-600 dark:text-gray-300 group-hover:text-blue-600 group-hover:scale-110'
                              }
                            `}
                          />
                        </div>
                        
                        {/* Texto */}
                        <span className={`
                          font-medium transition-all duration-300
                          ${activeView === item.url 
                            ? 'text-gray-900 dark:text-white' 
                            : 'text-gray-700 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white'
                          }
                        `}>
                          {item.title}
                        </span>

                        {/* Efecto de brillo en hover */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        
        <SidebarFooter className="p-6 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 border-t border-gray-200 dark:border-gray-700">
          <div className="space-y-4">
            {/* Información del usuario */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {profile?.full_name?.split(' ').map(name => name[0]).join('').slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {profile?.full_name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {profile?.role}
                  </p>
                </div>
              </div>
            </div>

            {/* Botón de salir */}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSignOut}
              disabled={isLoggingOut}
              className="
                w-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 
                hover:bg-red-50 hover:border-red-200 hover:text-red-700
                dark:hover:bg-red-900/20 dark:hover:border-red-700 dark:hover:text-red-400
                transition-all duration-300 ease-in-out
                hover:scale-105 hover:shadow-md
                disabled:opacity-50 disabled:cursor-not-allowed
                group
              "
            >
              <LogOut className={`
                h-4 w-4 mr-2 transition-all duration-300
                ${isLoggingOut ? 'animate-spin' : 'group-hover:rotate-12'}
              `} />
              {isLoggingOut ? 'Cerrando...' : 'Salir'}
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>
    </>
  )
}
