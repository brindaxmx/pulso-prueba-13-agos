"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  LayoutDashboard,
  ClipboardCheck,
  Users,
  Building2,
  Ticket,
  Settings,
  MessageSquare,
  FileText,
  ChevronUp,
  LogOut,
  Zap,
  Package,
  AlertTriangle,
  UtensilsCrossed,
  Shield,
  Award,
  Brain,
  BookOpen,
} from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

const menuItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "HORECA Dashboard",
    url: "/dashboard/horeca",
    icon: UtensilsCrossed,
  },
  {
    title: "Modelos IA",
    url: "/dashboard/models",
    icon: Brain,
  },
  {
    title: "Automatización",
    url: "/dashboard/automation",
    icon: Zap,
  },
  {
    title: "SOPs/Flows",
    url: "/dashboard/flows",
    icon: ClipboardCheck,
  },
  {
    title: "Inventario",
    url: "/dashboard/inventory",
    icon: Package,
  },
  {
    title: "Activos",
    url: "/dashboard/assets",
    icon: Building2,
  },
  {
    title: "Personal",
    url: "/dashboard/personal",
    icon: Users,
  },
  {
    title: "Tickets",
    url: "/dashboard/tickets",
    icon: Ticket,
  },
  {
    title: "Alertas",
    url: "/dashboard/alerts",
    icon: AlertTriangle,
  },
  {
    title: "Certificaciones",
    url: "/dashboard/certifications",
    icon: Award,
  },
  {
    title: "Cumplimiento",
    url: "/dashboard/compliance",
    icon: Shield,
  },
  {
    title: "Reportes",
    url: "/dashboard/reportes",
    icon: FileText,
  },
  {
    title: "WhatsApp",
    url: "/dashboard/whatsapp",
    icon: MessageSquare,
  },
]

const adminItems = [
  {
    title: "System Overview",
    url: "/dashboard/system-overview",
    icon: BookOpen,
  },
  {
    title: "Configuración",
    url: "/dashboard/configuracion",
    icon: Settings,
  },
]

interface AppSidebarProps {
  user: any
}

export function AppSidebar({ user }: AppSidebarProps) {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  const userInitials = user ? `${user.nombre?.[0] || ""}${user.apellidos?.[0] || ""}` : "U"
  const isAdmin = user?.rol === "gerente_general" || user?.rol_principal === "admin"

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold">P</div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">PULSO HORECA</span>
            <span className="truncate text-xs text-muted-foreground">
              {user?.empresas?.nombre || user?.empresa_id || "Sistema de Gestión"}
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menú Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Administración</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarFallback className="rounded-lg bg-blue-600 text-white">{userInitials}</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {user?.nombre} {user?.apellidos}
                    </span>
                    <span className="truncate text-xs">
                      <Badge variant="outline" className="text-xs">
                        {user?.rol || user?.rol_principal}
                      </Badge>
                    </span>
                  </div>
                  <ChevronUp className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Configuración
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
