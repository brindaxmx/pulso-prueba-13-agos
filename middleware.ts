import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: any) {
          request.cookies.set({
            name,
            value: "",
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: "",
            ...options,
          })
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Rutas públicas que no requieren autenticación
  const publicRoutes = ["/", "/login", "/register", "/accept-invitation"]
  const isPublicRoute = publicRoutes.some((route) => request.nextUrl.pathname.startsWith(route))

  // Si no hay usuario y no es ruta pública, redirigir a login
  if (!user && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Si hay usuario autenticado
  if (user) {
    // Verificar si es una invitación pendiente
    if (request.nextUrl.pathname.startsWith("/accept-invitation")) {
      return response
    }

    // Verificar si el usuario completó el onboarding
    const { data: empresa } = await supabase
      .from("empresas")
      .select("configuracion_inicial_completada")
      .eq("propietario_email", user.email)
      .single()

    // Verificar si es un usuario invitado
    const { data: invitation } = await supabase
      .from("user_invitations")
      .select("*")
      .eq("email", user.email)
      .eq("status", "pending")
      .single()

    // Si es una invitación pendiente, redirigir a aceptar invitación
    if (invitation && !request.nextUrl.pathname.startsWith("/accept-invitation")) {
      return NextResponse.redirect(new URL(`/accept-invitation/${invitation.invitation_token}`, request.url))
    }

    // Si no completó onboarding y no es invitado, redirigir a onboarding
    if (
      !empresa?.configuracion_inicial_completada &&
      !invitation &&
      !request.nextUrl.pathname.startsWith("/onboarding")
    ) {
      return NextResponse.redirect(new URL("/onboarding", request.url))
    }

    // Si completó onboarding pero está en onboarding, redirigir a dashboard
    if (empresa?.configuracion_inicial_completada && request.nextUrl.pathname.startsWith("/onboarding")) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }

    // Verificar permisos para rutas protegidas del dashboard
    if (request.nextUrl.pathname.startsWith("/dashboard")) {
      const path = request.nextUrl.pathname

      // Obtener permisos del usuario
      const { data: userRoles } = await supabase
        .from("user_roles")
        .select(`
          roles (hierarchy_level),
          role_permissions (
            permissions (name, category, resource, action)
          )
        `)
        .eq("user_id", user.id)
        .eq("active", true)

      if (!userRoles || userRoles.length === 0) {
        return NextResponse.redirect(new URL("/unauthorized", request.url))
      }

      // Verificar permisos específicos por ruta
      const hasPermission = checkRoutePermission(path, userRoles)

      if (!hasPermission) {
        return NextResponse.redirect(new URL("/unauthorized", request.url))
      }
    }
  }

  return response
}

function checkRoutePermission(path: string, userRoles: any[]): boolean {
  // Extraer el nivel de jerarquía más alto del usuario
  const maxHierarchyLevel = Math.max(...userRoles.map((ur) => ur.roles?.hierarchy_level || 0))

  // Definir permisos requeridos por ruta
  const routePermissions: { [key: string]: { minLevel?: number; permissions?: string[] } } = {
    "/dashboard": { minLevel: 1 },
    "/dashboard/checklists": { permissions: ["checklist.view"] },
    "/dashboard/checklists/nuevo": { permissions: ["checklist.create"] },
    "/dashboard/automation": { permissions: ["automation.view"] },
    "/dashboard/automation/configurar": { permissions: ["automation.create"] },
    "/dashboard/automation/auditoria": { permissions: ["audit.view"] },
    "/dashboard/inventory": { permissions: ["inventory.view"] },
    "/dashboard/tickets": { permissions: ["tickets.view"] },
    "/dashboard/horeca": { permissions: ["dashboard.horeca.view"] },
    "/dashboard/flows": { minLevel: 6 },
  }

  // Buscar la regla más específica para la ruta
  let matchedRule = null
  let maxMatchLength = 0

  for (const [route, rule] of Object.entries(routePermissions)) {
    if (path.startsWith(route) && route.length > maxMatchLength) {
      matchedRule = rule
      maxMatchLength = route.length
    }
  }

  if (!matchedRule) {
    return true // Si no hay regla específica, permitir acceso
  }

  // Verificar nivel mínimo de jerarquía
  if (matchedRule.minLevel && maxHierarchyLevel < matchedRule.minLevel) {
    return false
  }

  // Verificar permisos específicos
  if (matchedRule.permissions) {
    const userPermissions = userRoles.flatMap(
      (ur) => ur.role_permissions?.map((rp: any) => rp.permissions?.name).filter(Boolean) || [],
    )

    return matchedRule.permissions.some((permission) => userPermissions.includes(permission))
  }

  return true
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
