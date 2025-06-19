
import { Calendar, Users, Building, UserCheck, BarChart3, Settings, Bell } from "lucide-react"
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

const menuItems = [
  {
    title: "Dashboard",
    url: "#",
    icon: BarChart3,
  },
  {
    title: "Gestión de Usuarios",
    url: "#users",
    icon: Users,
  },
  {
    title: "Campus y Programas",
    url: "#programs",
    icon: Building,
  },
  {
    title: "Gestores de Internacionalización",
    url: "#managers",
    icon: UserCheck,
  },
  {
    title: "Planes de Trabajo",
    url: "#workplans",
    icon: Calendar,
  },
  {
    title: "Notificaciones",
    url: "#notifications",
    icon: Bell,
  },
  {
    title: "Configuración",
    url: "#settings",
    icon: Settings,
  },
]

export function AppSidebar() {
  return (
    <Sidebar className="border-r border-sidebar-border">
      <SidebarHeader className="p-6">
        <div className="text-sidebar-foreground">
          <h2 className="text-lg font-bold">DRNI - Gestión</h2>
          <p className="text-sm text-sidebar-foreground/70">Oficina de Relaciones Internacionales</p>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/70">Menú Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="text-sidebar-foreground hover:bg-sidebar-accent">
                    <a href={item.url} className="flex items-center gap-3">
                      <item.icon size={18} />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-6">
        <div className="text-sm text-sidebar-foreground/70">
          <p>Usuario: Admin DRNI</p>
          <p>Rol: Administrador</p>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
