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
        gradient: "from-emerald-500 to-teal-600",
        bgGradient: "from-emerald-50 to-teal-50",
        iconColor: "text-emerald-600",
        shadow: "shadow-emerald-200"
      }
    ];

    const adminItems = [
      {
        title: "Gestión de Usuarios",
        url: "users",
        icon: Users,
        roles: ["Administrador"],
        gradient: "from-blue-500 to-indigo-600",
        bgGradient: "from-blue-50 to-indigo-50",
        iconColor: "text-blue-600",
        shadow: "shadow-blue-200"
      },
      {
        title: "Campus y Programas",
        url: "programs",
        icon: Building,
        roles: ["Administrador"],
        gradient: "from-purple-500 to-violet-600",
        bgGradient: "from-purple-50 to-violet-50",
        iconColor: "text-purple-600",
        shadow: "shadow-purple-200"
      },
      {
        title: "Configuración Estratégica",
        url: "strategic",
        icon: CheckSquare,
        roles: ["Administrador"],
        gradient: "from-red-500 to-rose-600",
        bgGradient: "from-red-50 to-rose-50",
        iconColor: "text-red-600",
        shadow: "shadow-red-200"
      }
    ];

    const coordinatorItems = [
      {
        title: "Gestores de Internacionalización",
        url: "managers",
        icon: UserCheck,
        roles: ["Administrador", "Coordinador"],
        gradient: "from-amber-500 to-orange-600",
        bgGradient: "from-amber-50 to-orange-50",
        iconColor: "text-amber-600",
        shadow: "shadow-amber-200"
      },
      {
        title: "Informes de Gestores",
        url: "manager-reports",
        icon: FileText,
        roles: ["Administrador", "Coordinador"],
        gradient: "from-cyan-500 to-sky-600",
        bgGradient: "from-cyan-50 to-sky-50",
        iconColor: "text-cyan-600",
        shadow: "shadow-cyan-200"
      },
      {
        title: "Aprobación de Planes",
        url: "work-plan-approval",
        icon: CheckSquare,
        roles: ["Administrador", "Coordinador"],
        gradient: "from-teal-500 to-emerald-600",
        bgGradient: "from-teal-50 to-emerald-50",
        iconColor: "text-teal-600",
        shadow: "shadow-teal-200"
      }
    ];

    const managerItems = [
      {
        title: "Mi Plan de Trabajo",
        url: "manager-work-plan",
        icon: Calendar,
        roles: ["Gestor"],
        gradient: "from-pink-500 to-rose-600",
        bgGradient: "from-pink-50 to-rose-50",
        iconColor: "text-pink-600",
        shadow: "shadow-pink-200"
      },
      {
        title: "Mi Informe",
        url: "my-report",
        icon: FileText,
        roles: ["Gestor"],
        gradient: "from-indigo-500 to-purple-600",
        bgGradient: "from-indigo-50 to-purple-50",
        iconColor: "text-indigo-600",
        shadow: "shadow-indigo-200"
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
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
        }
        
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        
        .menu-item-enter {
          animation: slideInFromLeft 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        
        .shimmer-effect {
          position: relative;
          overflow: hidden;
        }
        
        .shimmer-effect::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transition: left 0.5s;
        }
        
        .shimmer-effect:hover::before {
          left: 100%;
        }
      `}</style>
      
      <Sidebar className="border-r border-gray-200/60 bg-gradient-to-b from-white via-slate-50/30 to-white dark:from-gray-900 dark:via-gray-800/30 dark:to-gray-900 dark:border-gray-700/60 backdrop-blur-sm">
        
        {/* Header con logo mejorado */}
        <SidebarHeader className="p-8 bg-gradient-to-br from-slate-50/80 via-blue-50/50 to-indigo-50/80 dark:from-gray-800/80 dark:via-gray-700/50 dark:to-gray-600/80 border-b border-gray-200/40 dark:border-gray-700/40 backdrop-blur-sm">
          <div className="flex items-center justify-center group">
            <div className="relative">
              <div className="absolute -inset-2 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-all duration-500 animate-pulse"></div>
              <div className="relative bg-white/70 backdrop-blur-sm rounded-2xl p-4 shadow-lg shadow-blue-500/10 group-hover:shadow-xl group-hover:shadow-blue-500/20 transition-all duration-500 border border-white/50">
                <img 
                  src="https://udes.edu.co/images/logo/logo-con-acreditada-color.png" 
                  alt="UDES Logo" 
                  className="h-12 w-auto transition-all duration-500 group-hover:scale-110 group-hover:brightness-110"
                />
              </div>
            </div>
          </div>
        </SidebarHeader>
        
        <SidebarContent className="bg-gradient-to-b from-white/50 to-slate-50/30 dark:from-gray-900/50 dark:to-gray-800/30 p-6 backdrop-blur-sm">
          <SidebarGroup>
            <SidebarGroupLabel className="text-slate-600 dark:text-slate-300 font-semibold text-sm mb-6 px-3 tracking-wide">
              MENÚ PRINCIPAL
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-3">
                {menuItems.map((item, index) => (
                  <SidebarMenuItem key={item.title} className="relative menu-item-enter" style={{ animationDelay: `${index * 100}ms` }}>
                    <SidebarMenuButton 
                      asChild 
                      className="p-0 hover:bg-transparent"
                    >
                      <button 
                        onClick={() => handleMenuClick(item.url)}
                        className={`
                          relative w-full p-4 text-left rounded-2xl transition-all duration-500 ease-out
                          shimmer-effect group overflow-hidden
                          ${activeView === item.url 
                            ? `bg-gradient-to-r ${item.bgGradient} border-2 border-white/60 shadow-xl ${item.shadow}/30 scale-[1.02] translate-x-1` 
                            : 'hover:bg-gradient-to-r hover:from-slate-50/80 hover:to-blue-50/60 hover:shadow-lg hover:scale-[1.01] hover:translate-x-0.5 border-2 border-transparent hover:border-white/40'
                          }
                          dark:hover:from-gray-800/80 dark:hover:to-gray-700/60
                          backdrop-blur-sm
                        `}
                      >
                        {/* Indicador activo mejorado */}
                        {activeView === item.url && (
                          <div className={`absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1.5 bg-gradient-to-b ${item.gradient} rounded-r-full shadow-lg`} />
                        )}
                        
                        <div className="flex items-center gap-4 relative z-10">
                          {/* Contenedor del icono con efectos */}
                          <div className={`
                            relative p-3 rounded-xl transition-all duration-500
                            ${activeView === item.url 
                              ? `bg-white/80 shadow-lg ${item.shadow}/20 backdrop-blur-sm` 
                              : 'bg-white/60 group-hover:bg-white/80 group-hover:shadow-md backdrop-blur-sm'
                            }
                          `}>
                            {/* Efecto de brillo en el icono */}
                            <div className={`
                              absolute inset-0 rounded-xl transition-all duration-500
                              ${activeView === item.url 
                                ? `bg-gradient-to-br ${item.gradient} opacity-10` 
                                : 'bg-gradient-to-br from-slate-400/10 to-blue-400/10 opacity-0 group-hover:opacity-20'
                              }
                            `} />
                            
                            <item.icon 
                              size={22} 
                              className={`
                                relative z-10 transition-all duration-500
                                ${activeView === item.url 
                                  ? `${item.iconColor} drop-shadow-sm` 
                                  : 'text-slate-600 dark:text-slate-300 group-hover:text-blue-600 group-hover:scale-110 group-hover:rotate-3'
                                }
                              `}
                            />
                          </div>
                          
                          {/* Texto mejorado */}
                          <div className="flex-1">
                            <span className={`
                              font-semibold text-base transition-all duration-500 tracking-wide
                              ${activeView === item.url 
                                ? 'text-slate-800 dark:text-white drop-shadow-sm' 
                                : 'text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white'
                              }
                            `}>
                              {item.title}
                            </span>
                          </div>

                          {/* Indicador de estado activo */}
                          {activeView === item.url && (
                            <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${item.gradient} shadow-md animate-pulse`} />
                          )}
                        </div>

                        {/* Efecto de ondas en hover */}
                        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/10 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                        </div>
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        
        {/* Footer mejorado */}
        <SidebarFooter className="p-6 bg-gradient-to-br from-slate-50/80 via-blue-50/50 to-indigo-50/80 dark:from-gray-800/80 dark:via-gray-700/50 dark:to-gray-600/80 border-t border-gray-200/40 dark:border-gray-700/40 backdrop-blur-sm">
          <div className="space-y-4">
            {/* Tarjeta de usuario mejorada */}
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-white/50 dark:border-gray-700/50 group hover:shadow-xl transition-all duration-500">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg ring-4 ring-white/30 group-hover:ring-blue-200/50 transition-all duration-500">
                    {profile?.full_name?.split(' ').map(name => name[0]).join('').slice(0, 2)}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white shadow-sm animate-pulse" />
                </div>
                <div className="flex-1 min-width-0">
                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-700 transition-colors duration-300">
                    {profile?.full_name}
                  </p>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100/50 dark:bg-slate-700/50 px-2 py-1 rounded-full mt-1 inline-block">
                    {profile?.role}
                  </p>
                </div>
              </div>
            </div>

            {/* Botón de salir mejorado */}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSignOut}
              disabled={isLoggingOut}
              className="
                w-full bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm
                border-2 border-slate-200/60 dark:border-gray-600/60 
                hover:bg-gradient-to-r hover:from-red-50 hover:to-rose-50 
                hover:border-red-300/60 hover:text-red-700 hover:shadow-lg hover:shadow-red-200/30
                dark:hover:from-red-900/20 dark:hover:to-rose-900/20 
                dark:hover:border-red-600/60 dark:hover:text-red-400
                transition-all duration-500 ease-out font-semibold
                hover:scale-105 hover:shadow-xl rounded-xl p-3
                disabled:opacity-50 disabled:cursor-not-allowed
                group relative overflow-hidden
              "
            >
              <div className="flex items-center justify-center relative z-10">
                <LogOut className={`
                  h-4 w-4 mr-2 transition-all duration-500
                  ${isLoggingOut ? 'animate-spin' : 'group-hover:rotate-12 group-hover:scale-110'}
                `} />
                <span className="tracking-wide">
                  {isLoggingOut ? 'Cerrando sesión...' : 'Cerrar Sesión'}
                </span>
              </div>
              
              {/* Efecto de ondas en el botón */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>
    </>
  )
}