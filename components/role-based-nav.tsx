"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { usePermissions } from "@/lib/permissions"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  CheckSquare,
  Zap,
  Package,
  Ticket,
  Users,
  BarChart3,
  Settings,
  Building2,
  GitBranch,
  History,
} from "lucide-react"

interface NavItem {
  title: string
  href: string
  icon: any
  permission?: string
  minHierarchyLevel?: number
  badge?: string
}

const allNavItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    minHierarchyLevel: 1,
  },
  {
    title: "Dashboard HORECA",
    href: "/dashboard/horeca",
    icon: Building2,
    permission: "dashboard.horeca.view",
    minHierarchyLevel: 6,
  },
  {
    title: "Checklists",
    href: "/dashboard/checklists",
    icon: CheckSquare,
    permission: "checklist.view",
  },
  {
    title: "Automatización",
    href: "/dashboard/automation",
    icon: Zap,
    permission: "automation.view",
    minHierarchyLevel: 6,
  },
  {
    title: "Inventario",
    href: "/dashboard/inventory",
    icon: Package,
    permission: "inventory.view",
  },
  {
    title: "Tickets",
    href: "/dashboard/tickets",
    icon: Ticket,
    permission: "tickets.view",
  },
  {
    title: "Flujos",
    href: "/dashboard/flows",
    icon: GitBranch,
    minHierarchyLevel: 6,
  },
  {
    title: "Reportes",
    href: "/dashboard/reportes",
    icon: BarChart3,
    permission: "reports.view",
  },
  {
    title: "Usuarios",
    href: "/dashboard/usuarios",
    icon: Users,
    permission: "users.view",
    minHierarchyLevel: 7,
  },
  {
    title: "Auditoría",
    href: "/dashboard/automation/auditoria",
    icon: History,
    permission: "audit.view",
    minHierarchyLevel: 8,
  },
  {
    title: "Configuración",
    href: "/dashboard/configuracion",
    icon: Settings,
    permission: "company.view",
    minHierarchyLevel: 9,
  },
]

interface RoleBasedNavProps {
  className?: string
  onItemClick?: () => void
}

export function RoleBasedNav({ className, onItemClick }: RoleBasedNavProps) {
  const [user, setUser] = useState<any>(null)
  const [empresaId, setEmpresaId] = useState<string>("")
  const supabase = createClient()

  const { permissions, roles, loading, hasPermission, getMaxHierarchyLevel } = usePermissions(user?.id, empresaId)

  useEffect(() => {
    loadUser()
  }, [])

  const loadUser = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        setUser(user)

        // Obtener empresa del usuario
        const { data: empresa } = await supabase
          .from("empresas")
          .select("id")
          .eq("propietario_email", user.email)
          .single()

        if (empresa) {
          setEmpresaId(empresa.id)
        } else {
          // Buscar en user_roles si no es propietario
          const { data: userRole } = await supabase
            .from("user_roles")
            .select("empresa_id")
            .eq("user_id", user.id)
            .eq("active", true)
            .single()

          if (userRole) {
            setEmpresaId(userRole.empresa_id)
          }
        }
      }
    } catch (error) {
      console.error("Error loading user:", error)
    }
  }

  const getVisibleNavItems = (): NavItem[] => {
    if (loading || !user) return []

    const maxHierarchyLevel = getMaxHierarchyLevel()

    return allNavItems.filter((item) => {
      // Verificar nivel mínimo de jerarquía
      if (item.minHierarchyLevel && maxHierarchyLevel < item.minHierarchyLevel) {
        return false
      }

      // Verificar permiso específico
      if (item.permission && !hasPermission(item.permission)) {
        return false
      }

      return true
    })
  }

  const visibleItems = getVisibleNavItems()

  if (loading) {
    return (
      <div className={cn("space-y-2", className)}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-10 bg-gray-200 rounded animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <nav className={cn("space-y-1", className)}>
      {visibleItems.map((item) => (
        <a
          key={item.href}
          href={item.href}
          onClick={onItemClick}
          className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors"
        >
          <item.icon className="mr-3 h-5 w-5" />
          {item.title}
          {item.badge && (
            <span className="ml-auto bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">{item.badge}</span>
          )}
        </a>
      ))}
    </nav>
  )
}
