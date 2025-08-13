import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ClipboardCheck, Clock, Users, MapPin, Plus, Eye } from "lucide-react"
import Link from "next/link"

export default async function ChecklistsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Obtener datos del usuario
  const { data: userData } = await supabase.from("usuarios").select("*").eq("email", user?.email).single()

  // Obtener templates de checklists
  const { data: templates } = await supabase.from("checklist_templates").select("*").eq("activo", true).order("nombre")

  // Obtener reportes recientes por template
  const { data: reportesRecientes } = await supabase
    .from("reportes")
    .select(`
      *,
      empleados_pulso (nombre, apellidos),
      sucursales (nombre)
    `)
    .order("fecha", { ascending: false })
    .limit(20)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Checklists</h1>
          <p className="text-muted-foreground">Gestiona y monitorea los checklists de tu empresa</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/checklists/nuevo">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Checklist
          </Link>
        </Button>
      </div>

      {/* Templates de checklists */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {templates?.map((template) => {
          const reportesTemplate = reportesRecientes?.filter((r) => r.checklist_id === template.id) || []
          const ultimoReporte = reportesTemplate[0]
          const promedioScore =
            reportesTemplate.length > 0
              ? Math.round(
                  reportesTemplate.reduce((acc, r) => acc + (r.evaluacion_automatica?.puntuacion_total || 0), 0) /
                    reportesTemplate.length,
                )
              : 0

          return (
            <Card key={template.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{template.nombre}</CardTitle>
                    <CardDescription className="mt-1">{template.descripcion}</CardDescription>
                  </div>
                  <Badge variant="outline">{template.categoria}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{template.tiempo_estimado_minutos} min</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
                    <span>{template.frecuencia}</span>
                  </div>
                </div>

                {ultimoReporte && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Último reporte:</span>
                      <Badge
                        variant={
                          ultimoReporte.evaluacion_automatica?.puntuacion_total >= 95
                            ? "default"
                            : ultimoReporte.evaluacion_automatica?.puntuacion_total >= 85
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {ultimoReporte.evaluacion_automatica?.puntuacion_total || 0}%
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {ultimoReporte.empleados_pulso?.nombre} • {ultimoReporte.sucursales?.nombre}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(ultimoReporte.fecha).toLocaleDateString()}
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center pt-2">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Promedio: </span>
                    <span className="font-medium">{promedioScore}%</span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/checklists/${template.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button size="sm" asChild>
                      <Link href={`/dashboard/checklists/${template.id}/completar`}>Completar</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Reportes recientes */}
      <Card>
        <CardHeader>
          <CardTitle>Reportes Recientes</CardTitle>
          <CardDescription>Últimos checklists completados en todas las sucursales</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reportesRecientes?.slice(0, 10).map((reporte) => (
              <div key={reporte.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{reporte.tipo}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {reporte.empleados_pulso?.nombre} {reporte.empleados_pulso?.apellidos}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {reporte.sucursales?.nombre}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {reporte.tiempo_completado_minutos} min
                    </div>
                  </div>
                </div>
                <div className="text-right space-y-1">
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
                  <div className="text-xs text-muted-foreground">{new Date(reporte.fecha).toLocaleDateString()}</div>
                </div>
              </div>
            )) || <p className="text-center text-muted-foreground py-8">No hay reportes disponibles</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
