import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Users, Building2, ClipboardCheck, AlertTriangle, TrendingUp, Star } from "lucide-react"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Obtener datos del usuario
  const { data: userData } = await supabase.from("usuarios").select("*").eq("email", user?.email).single()

  // Obtener métricas del dashboard
  const { data: metricas } = await supabase
    .from("dashboard_metricas")
    .select("*")
    .eq("empresa_id", userData?.empresa_id)
    .order("fecha", { ascending: false })
    .limit(1)
    .single()

  // Obtener reportes recientes
  const { data: reportesRecientes } = await supabase
    .from("reportes")
    .select(`
      *,
      empleados_pulso (nombre, apellidos, rol_dual),
      sucursales (nombre)
    `)
    .order("fecha", { ascending: false })
    .limit(5)

  // Obtener tickets activos
  const { data: ticketsActivos } = await supabase
    .from("tickets")
    .select("*")
    .neq("estado", "completado")
    .order("fecha_creacion", { ascending: false })
    .limit(5)

  const metricas_operativas = metricas?.metricas_operativas || {}
  const metricas_calidad = metricas?.metricas_calidad || {}

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Resumen de operaciones y métricas de calidad</p>
      </div>

      {/* Métricas principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Empleados Activos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metricas_operativas.empleados_activos || 0}</div>
            <p className="text-xs text-muted-foreground">En todas las sucursales</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sucursales Operando</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metricas_operativas.sucursales_operando || 0}</div>
            <p className="text-xs text-muted-foreground">Activas hoy</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reportes Completados</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metricas_operativas.reportes_completados || 0}</div>
            <p className="text-xs text-muted-foreground">Hoy</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Incidencias</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metricas_operativas.incidencias_detectadas || 0}</div>
            <p className="text-xs text-muted-foreground">Detectadas hoy</p>
          </CardContent>
        </Card>
      </div>

      {/* Métricas de calidad */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Cumplimiento de Checklists
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Cumplimiento General</span>
                <span>{metricas_operativas.cumplimiento_checklists || 0}%</span>
              </div>
              <Progress value={metricas_operativas.cumplimiento_checklists || 0} />
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {metricas_calidad.puntuacion_promedio_hostess || 0}
                </div>
                <div className="text-xs text-muted-foreground">Hostess</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {metricas_calidad.puntuacion_promedio_meseros || 0}
                </div>
                <div className="text-xs text-muted-foreground">Meseros</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {metricas_calidad.puntuacion_promedio_limpieza || 0}
                </div>
                <div className="text-xs text-muted-foreground">Limpieza</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Satisfacción del Cliente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">
                {metricas_calidad.satisfaccion_cliente_promedio || 0}
              </div>
              <div className="text-sm text-muted-foreground">Promedio general</div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-xl font-bold text-green-600">{metricas_calidad.comentarios_positivos || 0}</div>
                <div className="text-xs text-muted-foreground">Comentarios positivos</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-red-600">{metricas_calidad.quejas_totales || 0}</div>
                <div className="text-xs text-muted-foreground">Quejas</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reportes recientes y tickets */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Reportes Recientes</CardTitle>
            <CardDescription>Últimos checklists completados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reportesRecientes?.map((reporte) => (
                <div key={reporte.id} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">
                      {reporte.empleados_pulso?.nombre} {reporte.empleados_pulso?.apellidos}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {reporte.sucursales?.nombre} • {reporte.tipo}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={
                        reporte.evaluacion_automatica?.puntuacion_total >= 95
                          ? "default"
                          : reporte.evaluacion_automatica?.puntuacion_total >= 85
                            ? "secondary"
                            : "destructive"
                      }
                    >
                      {reporte.evaluacion_automatica?.puntuacion_total || 0}%
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">{new Date(reporte.fecha).toLocaleDateString()}</p>
                  </div>
                </div>
              )) || <p className="text-sm text-muted-foreground text-center py-4">No hay reportes recientes</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tickets Activos</CardTitle>
            <CardDescription>Incidencias y solicitudes pendientes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {ticketsActivos?.map((ticket) => (
                <div key={ticket.id} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{ticket.titulo}</p>
                    <p className="text-xs text-muted-foreground">
                      {ticket.tipo} • {ticket.estado}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={
                        ticket.prioridad === "critica"
                          ? "destructive"
                          : ticket.prioridad === "alta"
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
              )) || <p className="text-sm text-muted-foreground text-center py-4">No hay tickets activos</p>}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas activas */}
      {metricas?.alertas_activas && metricas.alertas_activas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Alertas Activas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metricas.alertas_activas.map((alerta: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div>
                    <p className="font-medium">{alerta.descripcion}</p>
                    <p className="text-sm text-muted-foreground">{alerta.sucursal}</p>
                  </div>
                  <Badge variant="outline" className="border-orange-200">
                    {alerta.prioridad}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
