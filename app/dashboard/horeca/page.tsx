import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Building2, Users, ClipboardCheck, Package, TrendingUp, Shield } from "lucide-react"

export default async function HorecaDashboardPage() {
  const supabase = await createClient()

  // Obtener datos de empresas HORECA
  const { data: empresas } = await supabase.from("empresas_horeca").select("*").eq("estatus", "activo")

  // Obtener sucursales activas
  const { data: sucursales } = await supabase.from("sucursales_horeca").select("*").eq("estatus", "activo")

  // Obtener usuarios activos
  const { data: usuarios } = await supabase.from("usuarios_horeca").select("*").eq("estado", "activo")

  // Obtener flows activos
  const { data: flows } = await supabase.from("flows_horeca").select("*").eq("activo", true)

  // Obtener ejecuciones recientes
  const { data: ejecuciones } = await supabase
    .from("flow_ejecuciones")
    .select(`
      *,
      flows_horeca (nombre, tipo),
      usuarios_horeca (nombre, apellidos),
      sucursales_horeca (nombre)
    `)
    .order("fecha_inicio", { ascending: false })
    .limit(10)

  // Obtener productos de inventario con stock bajo
  const { data: stockBajo } = await supabase
    .from("productos_inventario")
    .select("*")
    .lt("stock_actual", "stock_minimo")
    .eq("activo", true)

  // Obtener tickets abiertos
  const { data: ticketsAbiertos } = await supabase
    .from("tickets_horeca")
    .select("*")
    .in("estado", ["nuevo", "asignado", "en_progreso"])

  // Calcular métricas
  const totalEmpresas = empresas?.length || 0
  const totalSucursales = sucursales?.length || 0
  const totalUsuarios = usuarios?.length || 0
  const totalFlows = flows?.length || 0
  const productosStockBajo = stockBajo?.length || 0
  const ticketsPendientes = ticketsAbiertos?.length || 0

  const ejecucionesCompletadas =
    ejecuciones?.filter(
      (e) => e.estado === "completado" && new Date(e.fecha_completado).toDateString() === new Date().toDateString(),
    ).length || 0

  const cumplimientoPromedio =
    ejecuciones?.length > 0 ? Math.round((ejecucionesCompletadas / Math.min(ejecuciones.length, 10)) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard HORECA</h1>
        <p className="text-muted-foreground">Panel de control para el sector Hoteles, Restaurantes y Cafeterías</p>
      </div>

      {/* Métricas principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Empresas Activas</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEmpresas}</div>
            <p className="text-xs text-muted-foreground">En operación</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sucursales</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSucursales}</div>
            <p className="text-xs text-muted-foreground">Ubicaciones</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Personal Activo</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsuarios}</div>
            <p className="text-xs text-muted-foreground">Empleados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SOPs Activos</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalFlows}</div>
            <p className="text-xs text-muted-foreground">Procedimientos</p>
          </CardContent>
        </Card>
      </div>

      {/* Métricas operativas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Cumplimiento Operativo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>SOPs Completados Hoy</span>
                <span>{cumplimientoPromedio}%</span>
              </div>
              <Progress value={cumplimientoPromedio} />
            </div>

            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">{ejecucionesCompletadas}</div>
                <div className="text-xs text-muted-foreground">Completados</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">{totalFlows}</div>
                <div className="text-xs text-muted-foreground">Programados</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Control de Inventario
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">{productosStockBajo}</div>
              <div className="text-sm text-muted-foreground">Productos con stock bajo</div>
            </div>

            {productosStockBajo > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-medium">Requieren atención:</div>
                {stockBajo?.slice(0, 3).map((producto) => (
                  <div key={producto.id} className="flex justify-between text-xs">
                    <span>{producto.nombre}</span>
                    <Badge variant="destructive" className="text-xs">
                      {producto.stock_actual} {producto.unidad_medida}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Cumplimiento Regulatorio
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">REPSE</span>
                <Badge variant="default">Activo</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">CFDI 4.0</span>
                <Badge variant="default">Activo</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">STPS</span>
                <Badge variant="default">Activo</Badge>
              </div>
            </div>

            <div className="text-center pt-2">
              <div className="text-2xl font-bold text-green-600">100%</div>
              <div className="text-xs text-muted-foreground">Cumplimiento</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ejecuciones recientes y tickets */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Ejecuciones Recientes</CardTitle>
            <CardDescription>Últimos SOPs ejecutados en el sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {ejecuciones?.slice(0, 5).map((ejecucion) => (
                <div key={ejecucion.id} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{ejecucion.flows_horeca?.nombre}</p>
                    <p className="text-xs text-muted-foreground">
                      {ejecucion.usuarios_horeca?.nombre} • {ejecucion.sucursales_horeca?.nombre}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={
                        ejecucion.estado === "completado"
                          ? "default"
                          : ejecucion.estado === "en_progreso"
                            ? "secondary"
                            : ejecucion.estado === "iniciado"
                              ? "outline"
                              : "destructive"
                      }
                    >
                      {ejecucion.estado}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(ejecucion.fecha_inicio).toLocaleString()}
                    </p>
                  </div>
                </div>
              )) || <p className="text-sm text-muted-foreground text-center py-4">No hay ejecuciones recientes</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tickets Pendientes</CardTitle>
            <CardDescription>Incidencias y solicitudes por resolver</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {ticketsAbiertos?.slice(0, 5).map((ticket) => (
                <div key={ticket.id} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{ticket.titulo}</p>
                    <p className="text-xs text-muted-foreground">
                      {ticket.tipo} • {ticket.numero_ticket}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={
                        ticket.prioridad === "critica"
                          ? "destructive"
                          : ticket.prioridad === "muy_alta" || ticket.prioridad === "alta"
                            ? "default"
                            : ticket.prioridad === "media"
                              ? "secondary"
                              : "outline"
                      }
                    >
                      {ticket.prioridad}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(ticket.fecha_creacion).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )) || <p className="text-sm text-muted-foreground text-center py-4">No hay tickets pendientes</p>}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resumen por tipo de negocio */}
      <Card>
        <CardHeader>
          <CardTitle>Distribución por Tipo de Negocio</CardTitle>
          <CardDescription>Empresas registradas por categoría HORECA</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {["restaurante", "hotel", "cafeteria", "bar", "catering"].map((tipo) => {
              const count = empresas?.filter((e) => e.tipo_negocio === tipo).length || 0
              return (
                <div key={tipo} className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{count}</div>
                  <div className="text-sm text-muted-foreground capitalize">{tipo}</div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
