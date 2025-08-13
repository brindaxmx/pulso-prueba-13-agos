import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  ClipboardCheck,
  Clock,
  Users,
  MapPin,
  Plus,
  Eye,
  Play,
  Settings,
  AlertTriangle,
  CheckCircle2,
  UtensilsCrossed,
} from "lucide-react"
import Link from "next/link"

export default async function FlowsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Obtener flows HORECA
  const { data: flows } = await supabase
    .from("flows_horeca")
    .select(`
      *,
      usuarios_horeca!flows_horeca_creado_por_fkey (nombre, apellidos),
      sucursales_horeca (nombre)
    `)
    .eq("activo", true)
    .order("fecha_creacion", { ascending: false })

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
    .limit(20)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">SOPs y Flows</h1>
          <p className="text-muted-foreground">Procedimientos operativos estándar para el sector HORECA</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/flows/nuevo">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Flow
          </Link>
        </Button>
      </div>

      {/* Métricas de flows */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Flows Activos</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{flows?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Procedimientos disponibles</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ejecuciones Hoy</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {ejecuciones?.filter((e) => new Date(e.fecha_inicio).toDateString() === new Date().toDateString())
                .length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Ejecutados hoy</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completados</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {ejecuciones?.filter((e) => e.estado === "completado").length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Finalizados exitosamente</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Progreso</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {ejecuciones?.filter((e) => e.estado === "en_progreso").length || 0}
            </div>
            <p className="text-xs text-muted-foreground">En ejecución</p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de flows */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {flows?.map((flow) => {
          const ejecucionesFlow = ejecuciones?.filter((e) => e.flow_id === flow.id) || []
          const ultimaEjecucion = ejecucionesFlow[0]
          const promedioTiempo =
            ejecucionesFlow.length > 0
              ? Math.round(
                  ejecucionesFlow.reduce((acc, e) => acc + (e.duracion_minutos || 0), 0) / ejecucionesFlow.length,
                )
              : flow.tiempo_estimado_minutos || 0

          const tipoIcons = {
            apertura: UtensilsCrossed,
            cierre: UtensilsCrossed,
            limpieza: ClipboardCheck,
            seguridad_alimentaria: AlertTriangle,
            inventario: ClipboardCheck,
            mantenimiento: Settings,
            preparacion_alimentos: UtensilsCrossed,
            servicio_mesa: Users,
            recepcion_proveedores: ClipboardCheck,
          }

          const IconComponent = tipoIcons[flow.tipo as keyof typeof tipoIcons] || ClipboardCheck

          return (
            <Card key={flow.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <IconComponent className="h-5 w-5" />
                      {flow.nombre}
                    </CardTitle>
                    <CardDescription>{flow.descripcion}</CardDescription>
                  </div>
                  <Badge variant="outline" className="capitalize">
                    {flow.tipo.replace("_", " ")}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{flow.tiempo_estimado_minutos || promedioTiempo} min</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{flow.roles_autorizados?.length || 0} roles</span>
                  </div>
                </div>

                {flow.categoria_repse && (
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      REPSE: {flow.categoria_repse}
                    </Badge>
                  </div>
                )}

                {ultimaEjecucion && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Última ejecución:</span>
                      <Badge
                        variant={
                          ultimaEjecucion.estado === "completado"
                            ? "default"
                            : ultimaEjecucion.estado === "en_progreso"
                              ? "secondary"
                              : ultimaEjecucion.estado === "fallido"
                                ? "destructive"
                                : "outline"
                        }
                      >
                        {ultimaEjecucion.estado}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {ultimaEjecucion.usuarios_horeca?.nombre} • {ultimaEjecucion.sucursales_horeca?.nombre}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(ultimaEjecucion.fecha_inicio).toLocaleDateString()}
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center pt-2">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Ejecuciones: </span>
                    <span className="font-medium">{ejecucionesFlow.length}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/flows/${flow.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button size="sm" asChild>
                      <Link href={`/dashboard/flows/${flow.id}/ejecutar`}>
                        <Play className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Ejecuciones recientes */}
      <Card>
        <CardHeader>
          <CardTitle>Ejecuciones Recientes</CardTitle>
          <CardDescription>Historial de SOPs ejecutados en todas las sucursales</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {ejecuciones?.slice(0, 10).map((ejecucion) => (
              <div key={ejecucion.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{ejecucion.flows_horeca?.nombre}</span>
                    <Badge variant="outline" className="text-xs capitalize">
                      {ejecucion.flows_horeca?.tipo?.replace("_", " ")}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {ejecucion.usuarios_horeca?.nombre} {ejecucion.usuarios_horeca?.apellidos}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {ejecucion.sucursales_horeca?.nombre}
                    </div>
                    {ejecucion.duracion_minutos && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {ejecucion.duracion_minutos} min
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <Badge
                    variant={
                      ejecucion.estado === "completado"
                        ? "default"
                        : ejecucion.estado === "en_progreso"
                          ? "secondary"
                          : ejecucion.estado === "fallido"
                            ? "destructive"
                            : "outline"
                    }
                  >
                    {ejecucion.estado}
                  </Badge>
                  <div className="text-xs text-muted-foreground">
                    {new Date(ejecucion.fecha_inicio).toLocaleString()}
                  </div>
                </div>
              </div>
            )) || <p className="text-center text-muted-foreground py-8">No hay ejecuciones disponibles</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
