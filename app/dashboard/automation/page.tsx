import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Clock,
  Zap,
  AlertTriangle,
  CheckCircle2,
  Play,
  Pause,
  Settings,
  TrendingUp,
  Users,
  Calendar,
} from "lucide-react"

export default async function AutomationPage() {
  const supabase = await createClient()

  // Obtener reglas activas
  const { data: rules } = await supabase
    .from("sequence_engine_rules")
    .select(`
      *,
      checklist_templates (nombre, descripcion)
    `)
    .eq("active", true)
    .order("priority", { ascending: false })

  // Obtener ejecuciones recientes
  const { data: executions } = await supabase
    .from("sops_execution")
    .select(`
      *,
      checklist_templates (nombre),
      empleados_pulso (nombre, apellidos),
      sucursales (nombre)
    `)
    .order("created_at", { ascending: false })
    .limit(10)

  // Obtener alertas recientes
  const { data: alerts } = await supabase.from("alerts_log").select("*").order("sent_at", { ascending: false }).limit(5)

  // Calcular métricas
  const totalRules = rules?.length || 0
  const pendingExecutions = executions?.filter((e) => e.status === "pending").length || 0
  const completedToday =
    executions?.filter(
      (e) => e.status === "completed" && new Date(e.completed_at).toDateString() === new Date().toDateString(),
    ).length || 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Automatización</h1>
          <p className="text-muted-foreground">Motor de secuencias y reglas automáticas</p>
        </div>
        <Button>
          <Settings className="mr-2 h-4 w-4" />
          Configurar Reglas
        </Button>
      </div>

      {/* Métricas principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reglas Activas</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRules}</div>
            <p className="text-xs text-muted-foreground">Ejecutándose automáticamente</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SOPs Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingExecutions}</div>
            <p className="text-xs text-muted-foreground">Esperando ejecución</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completados Hoy</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedToday}</div>
            <p className="text-xs text-muted-foreground">SOPs ejecutados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertas Activas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alerts?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Requieren atención</p>
          </CardContent>
        </Card>
      </div>

      {/* Reglas activas */}
      <Card>
        <CardHeader>
          <CardTitle>Reglas de Automatización</CardTitle>
          <CardDescription>Reglas configuradas para disparar SOPs automáticamente</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {rules?.map((rule) => (
              <div key={rule.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        rule.type === "time_based" ? "default" : rule.type === "event_based" ? "secondary" : "outline"
                      }
                    >
                      {rule.type === "time_based" ? "Tiempo" : rule.type === "event_based" ? "Evento" : "Turno"}
                    </Badge>
                    <span className="font-medium">{rule.description}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">SOP: {rule.checklist_templates?.nombre}</div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    {rule.trigger_time && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {rule.trigger_time.join(", ")}
                      </div>
                    )}
                    {rule.assign_to && (
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {rule.assign_to.join(", ")}
                      </div>
                    )}
                    {rule.days && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {rule.days.length === 7 ? "Todos los días" : `${rule.days.length} días`}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      rule.priority === "critical"
                        ? "destructive"
                        : rule.priority === "high"
                          ? "default"
                          : rule.priority === "medium"
                            ? "secondary"
                            : "outline"
                    }
                  >
                    {rule.priority}
                  </Badge>
                  <Button variant="outline" size="sm">
                    {rule.active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            )) || <p className="text-center text-muted-foreground py-8">No hay reglas configuradas</p>}
          </div>
        </CardContent>
      </Card>

      {/* Ejecuciones recientes */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Ejecuciones Recientes</CardTitle>
            <CardDescription>Últimos SOPs disparados automáticamente</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {executions?.slice(0, 5).map((execution) => (
                <div key={execution.id} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{execution.checklist_templates?.nombre}</p>
                    <p className="text-xs text-muted-foreground">
                      {execution.empleados_pulso?.nombre} • {execution.sucursales?.nombre}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={
                        execution.status === "completed"
                          ? "default"
                          : execution.status === "in_progress"
                            ? "secondary"
                            : execution.status === "pending"
                              ? "outline"
                              : "destructive"
                      }
                    >
                      {execution.status}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(execution.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              )) || <p className="text-sm text-muted-foreground text-center py-4">No hay ejecuciones recientes</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alertas del Sistema</CardTitle>
            <CardDescription>Notificaciones y escalaciones automáticas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {alerts?.map((alert) => (
                <div key={alert.id} className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5" />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">{alert.message}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        Nivel {alert.level}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{new Date(alert.sent_at).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )) || <p className="text-sm text-muted-foreground text-center py-4">No hay alertas activas</p>}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Estadísticas de rendimiento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Rendimiento del Sistema
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">94%</div>
              <div className="text-sm text-muted-foreground">Cumplimiento SOPs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">12 min</div>
              <div className="text-sm text-muted-foreground">Tiempo promedio</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">2.3</div>
              <div className="text-sm text-muted-foreground">Escalaciones/día</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Automatización efectiva</span>
              <span>94%</span>
            </div>
            <Progress value={94} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
