import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Clock,
  Zap,
  Calendar,
  Users,
  AlertTriangle,
  Plus,
  Edit,
  Trash2,
  Play,
  Settings,
  Save,
  TestTube,
  Copy,
  Eye,
  ChevronRight,
  Timer,
  Target,
  Bell,
  MessageSquare,
  Phone,
  Mail,
  Smartphone,
} from "lucide-react"

export default async function ConfigurarAutomationPage() {
  const supabase = await createClient()

  // Obtener reglas existentes
  const { data: rules } = await supabase
    .from("sequence_engine_rules")
    .select(`
      *,
      checklist_templates (nombre, descripcion)
    `)
    .order("created_at", { ascending: false })

  // Obtener SOPs disponibles
  const { data: sops } = await supabase
    .from("checklist_templates")
    .select("id, nombre, categoria, prioridad")
    .eq("activo", true)

  // Obtener sucursales
  const { data: sucursales } = await supabase.from("sucursales").select("id, nombre").eq("activo", true)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold mb-2">Configurar Automatización ⚙️</h1>
            <p className="text-purple-100 text-lg">Gestiona reglas y secuencias automáticas</p>
          </div>

          <div className="flex space-x-3">
            <Button className="bg-white/20 hover:bg-white/30 backdrop-blur text-white border-0">
              <TestTube className="mr-2 h-4 w-4" />
              Probar Reglas
            </Button>

            <Button className="bg-white text-purple-600 hover:bg-purple-50">
              <Plus className="mr-2 h-4 w-4" />
              Nueva Regla
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
            <Zap className="h-8 w-8 mx-auto mb-2 text-purple-200" />
            <div className="text-2xl font-bold">{rules?.length || 0}</div>
            <div className="text-sm text-purple-100">Reglas Totales</div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
            <Play className="h-8 w-8 mx-auto mb-2 text-green-300" />
            <div className="text-2xl font-bold">{rules?.filter((r) => r.active).length || 0}</div>
            <div className="text-sm text-purple-100">Activas</div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
            <Clock className="h-8 w-8 mx-auto mb-2 text-blue-300" />
            <div className="text-2xl font-bold">{rules?.filter((r) => r.type === "time_based").length || 0}</div>
            <div className="text-sm text-purple-100">Por Tiempo</div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
            <Target className="h-8 w-8 mx-auto mb-2 text-orange-300" />
            <div className="text-2xl font-bold">{rules?.filter((r) => r.type === "event_based").length || 0}</div>
            <div className="text-sm text-purple-100">Por Evento</div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="rules" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur border-white/20">
          <TabsTrigger value="rules" className="flex items-center">
            <Zap className="mr-2 h-4 w-4" />
            Reglas de Secuencia
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center">
            <Bell className="mr-2 h-4 w-4" />
            Escalación de Alertas
          </TabsTrigger>
          <TabsTrigger value="conditions" className="flex items-center">
            <Target className="mr-2 h-4 w-4" />
            Condiciones
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center">
            <Settings className="mr-2 h-4 w-4" />
            Sistema
          </TabsTrigger>
        </TabsList>

        {/* Reglas de Secuencia */}
        <TabsContent value="rules" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Lista de Reglas Existentes */}
            <div className="lg:col-span-2 space-y-4">
              <Card className="bg-white/80 backdrop-blur border-white/20 shadow-xl">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Reglas Existentes</CardTitle>
                      <CardDescription>Gestiona las reglas de automatización activas</CardDescription>
                    </div>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Nueva Regla
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[600px] pr-4">
                    <div className="space-y-4">
                      {rules?.map((rule) => (
                        <Card
                          key={rule.id}
                          className={`border-l-4 ${
                            rule.active
                              ? rule.priority === "critical"
                                ? "border-l-red-500 bg-red-50/50"
                                : rule.priority === "high"
                                  ? "border-l-orange-500 bg-orange-50/50"
                                  : "border-l-blue-500 bg-blue-50/50"
                              : "border-l-gray-300 bg-gray-50/50"
                          } hover:shadow-lg transition-all`}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <Badge
                                    variant={
                                      rule.type === "time_based"
                                        ? "default"
                                        : rule.type === "event_based"
                                          ? "secondary"
                                          : "outline"
                                    }
                                  >
                                    {rule.type === "time_based" ? (
                                      <>
                                        <Clock className="mr-1 h-3 w-3" />
                                        Tiempo
                                      </>
                                    ) : rule.type === "event_based" ? (
                                      <>
                                        <Target className="mr-1 h-3 w-3" />
                                        Evento
                                      </>
                                    ) : (
                                      <>
                                        <Users className="mr-1 h-3 w-3" />
                                        Turno
                                      </>
                                    )}
                                  </Badge>

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

                                  <Switch checked={rule.active} className="ml-auto" />
                                </div>

                                <h4 className="font-semibold text-gray-900 mb-1">{rule.description}</h4>

                                <p className="text-sm text-gray-600 mb-2">SOP: {rule.checklist_templates?.nombre}</p>

                                <div className="flex items-center space-x-4 text-xs text-gray-500">
                                  {rule.trigger_time && (
                                    <div className="flex items-center">
                                      <Timer className="mr-1 h-3 w-3" />
                                      {rule.trigger_time.join(", ")}
                                    </div>
                                  )}
                                  {rule.assign_to && (
                                    <div className="flex items-center">
                                      <Users className="mr-1 h-3 w-3" />
                                      {rule.assign_to.join(", ")}
                                    </div>
                                  )}
                                  {rule.days && (
                                    <div className="flex items-center">
                                      <Calendar className="mr-1 h-3 w-3" />
                                      {rule.days.length === 7 ? "Todos los días" : `${rule.days.length} días`}
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center space-x-2 ml-4">
                                <Button variant="outline" size="sm">
                                  <Eye className="h-3 w-3" />
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Copy className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700 bg-transparent"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>

                            {rule.type === "event_based" && rule.condition && (
                              <Alert className="mt-3 bg-blue-50 border-blue-200">
                                <Target className="h-4 w-4 text-blue-500" />
                                <AlertDescription className="text-blue-700">
                                  <strong>Condición:</strong> {JSON.stringify(rule.condition)}
                                </AlertDescription>
                              </Alert>
                            )}
                          </CardContent>
                        </Card>
                      )) || (
                        <div className="text-center py-12 text-gray-500">
                          <Zap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>No hay reglas configuradas</p>
                          <Button className="mt-4">
                            <Plus className="mr-2 h-4 w-4" />
                            Crear Primera Regla
                          </Button>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            {/* Formulario de Nueva Regla */}
            <div className="space-y-6">
              <Card className="bg-white/80 backdrop-blur border-white/20 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Plus className="mr-2 h-5 w-5 text-green-500" />
                    Nueva Regla
                  </CardTitle>
                  <CardDescription>Configura una nueva regla de automatización</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="rule-type">Tipo de Regla</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona el tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="time_based">
                          <div className="flex items-center">
                            <Clock className="mr-2 h-4 w-4" />
                            Basada en Tiempo
                          </div>
                        </SelectItem>
                        <SelectItem value="event_based">
                          <div className="flex items-center">
                            <Target className="mr-2 h-4 w-4" />
                            Basada en Evento
                          </div>
                        </SelectItem>
                        <SelectItem value="shift_based">
                          <div className="flex items-center">
                            <Users className="mr-2 h-4 w-4" />
                            Basada en Turno
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descripción</Label>
                    <Textarea id="description" placeholder="Describe qué hace esta regla..." rows={3} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sop">SOP a Ejecutar</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un SOP" />
                      </SelectTrigger>
                      <SelectContent>
                        {sops?.map((sop) => (
                          <SelectItem key={sop.id} value={sop.id}>
                            <div className="flex items-center justify-between w-full">
                              <span>{sop.nombre}</span>
                              <Badge variant="outline" className="ml-2">
                                {sop.categoria}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priority">Prioridad</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona prioridad" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="critical">
                          <Badge variant="destructive">Crítica</Badge>
                        </SelectItem>
                        <SelectItem value="high">
                          <Badge variant="default">Alta</Badge>
                        </SelectItem>
                        <SelectItem value="medium">
                          <Badge variant="secondary">Media</Badge>
                        </SelectItem>
                        <SelectItem value="low">
                          <Badge variant="outline">Baja</Badge>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  {/* Configuración específica por tipo */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Configuración de Disparador</h4>

                    {/* Time-based configuration */}
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label>Horarios de Ejecución</Label>
                        <div className="grid grid-cols-2 gap-2">
                          <Input type="time" placeholder="09:00" />
                          <Input type="time" placeholder="17:00" />
                        </div>
                        <Button variant="outline" size="sm" className="w-full bg-transparent">
                          <Plus className="mr-2 h-3 w-3" />
                          Agregar Horario
                        </Button>
                      </div>

                      <div className="space-y-2">
                        <Label>Días de la Semana</Label>
                        <div className="grid grid-cols-4 gap-2">
                          {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((day, index) => (
                            <div key={day} className="flex items-center space-x-2">
                              <input type="checkbox" id={`day-${index}`} className="rounded" />
                              <Label htmlFor={`day-${index}`} className="text-sm">
                                {day}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label>Asignar a Roles</Label>
                    <div className="space-y-2">
                      {["cocinero", "mesero", "personal_limpieza", "cajero", "gerente_sucursal"].map((role) => (
                        <div key={role} className="flex items-center space-x-2">
                          <input type="checkbox" id={`role-${role}`} className="rounded" />
                          <Label htmlFor={`role-${role}`} className="text-sm capitalize">
                            {role.replace("_", " ")}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch id="active" />
                    <Label htmlFor="active">Activar regla inmediatamente</Label>
                  </div>

                  <div className="flex space-x-2 pt-4">
                    <Button className="flex-1">
                      <Save className="mr-2 h-4 w-4" />
                      Guardar Regla
                    </Button>
                    <Button variant="outline">
                      <TestTube className="mr-2 h-4 w-4" />
                      Probar
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Plantillas Rápidas */}
              <Card className="bg-gradient-to-br from-green-500 to-teal-600 text-white border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center text-white">
                    <Zap className="mr-2 h-5 w-5" />
                    Plantillas Rápidas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full bg-white/20 hover:bg-white/30 backdrop-blur border-0 text-white justify-start">
                    <Clock className="mr-2 h-4 w-4" />
                    Control de Temperaturas (11:00, 19:00)
                  </Button>

                  <Button className="w-full bg-white/20 hover:bg-white/30 backdrop-blur border-0 text-white justify-start">
                    <Target className="mr-2 h-4 w-4" />
                    Stock Bajo (Inventario &lt; 5kg)
                  </Button>

                  <Button className="w-full bg-white/20 hover:bg-white/30 backdrop-blur border-0 text-white justify-start">
                    <Users className="mr-2 h-4 w-4" />
                    Limpieza de Cierre (Fin de Turno)
                  </Button>

                  <Button className="w-full bg-white/20 hover:bg-white/30 backdrop-blur border-0 text-white justify-start">
                    <Timer className="mr-2 h-4 w-4" />
                    Corte de Caja (Cada 4 horas)
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Escalación de Alertas */}
        <TabsContent value="alerts" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white/80 backdrop-blur border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="mr-2 h-5 w-5 text-orange-500" />
                  Configuración de Escalación
                </CardTitle>
                <CardDescription>Define los niveles de escalación para alertas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Nivel 1 */}
                <div className="space-y-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-yellow-800">Nivel 1 - Recordatorio</h4>
                    <Badge className="bg-yellow-100 text-yellow-800">5 minutos</Badge>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label>Tiempo de espera (minutos)</Label>
                      <Input type="number" defaultValue="5" className="bg-white" />
                    </div>

                    <div className="space-y-2">
                      <Label>Notificar a</Label>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">Empleado Asignado</Badge>
                        <Button variant="outline" size="sm">
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Canales de Notificación</Label>
                      <div className="flex space-x-4">
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="whatsapp-1" defaultChecked />
                          <Label htmlFor="whatsapp-1" className="flex items-center text-sm">
                            <MessageSquare className="mr-1 h-3 w-3" />
                            WhatsApp
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="sms-1" />
                          <Label htmlFor="sms-1" className="flex items-center text-sm">
                            <Smartphone className="mr-1 h-3 w-3" />
                            SMS
                          </Label>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Mensaje</Label>
                      <Textarea
                        defaultValue="⏰ ¡Recuerda completar tu SOP! {nombre_sop}"
                        rows={2}
                        className="bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Nivel 2 */}
                <div className="space-y-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-orange-800">Nivel 2 - Escalación</h4>
                    <Badge className="bg-orange-100 text-orange-800">15 minutos</Badge>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label>Tiempo de espera (minutos)</Label>
                      <Input type="number" defaultValue="15" className="bg-white" />
                    </div>

                    <div className="space-y-2">
                      <Label>Notificar a</Label>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">Supervisor</Badge>
                        <Badge variant="outline">Gerente Sucursal</Badge>
                        <Button variant="outline" size="sm">
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Canales de Notificación</Label>
                      <div className="flex space-x-4">
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="whatsapp-2" defaultChecked />
                          <Label htmlFor="whatsapp-2" className="flex items-center text-sm">
                            <MessageSquare className="mr-1 h-3 w-3" />
                            WhatsApp
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="email-2" defaultChecked />
                          <Label htmlFor="email-2" className="flex items-center text-sm">
                            <Mail className="mr-1 h-3 w-3" />
                            Email
                          </Label>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Mensaje</Label>
                      <Textarea
                        defaultValue="⚠️ El SOP '{nombre_sop}' aún no se ha completado. Asignado a ti."
                        rows={2}
                        className="bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Nivel 3 */}
                <div className="space-y-4 p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-red-800">Nivel 3 - Crítico</h4>
                    <Badge className="bg-red-100 text-red-800">30 minutos</Badge>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label>Tiempo de espera (minutos)</Label>
                      <Input type="number" defaultValue="30" className="bg-white" />
                    </div>

                    <div className="space-y-2">
                      <Label>Notificar a</Label>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">Gerente General</Badge>
                        <Badge variant="outline">Gerente Regional</Badge>
                        <Button variant="outline" size="sm">
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Canales de Notificación</Label>
                      <div className="flex space-x-4">
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="whatsapp-3" defaultChecked />
                          <Label htmlFor="whatsapp-3" className="flex items-center text-sm">
                            <MessageSquare className="mr-1 h-3 w-3" />
                            WhatsApp
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="email-3" defaultChecked />
                          <Label htmlFor="email-3" className="flex items-center text-sm">
                            <Mail className="mr-1 h-3 w-3" />
                            Email
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="phone-3" />
                          <Label htmlFor="phone-3" className="flex items-center text-sm">
                            <Phone className="mr-1 h-3 w-3" />
                            Llamada
                          </Label>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Mensaje</Label>
                      <Textarea
                        defaultValue="🚨 URGENTE: SOP '{nombre_sop}' pendiente en {sucursal_name}. No se ha completado tras {minutos} minutos."
                        rows={3}
                        className="bg-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2 pt-4">
                  <Button className="flex-1">
                    <Save className="mr-2 h-4 w-4" />
                    Guardar Configuración
                  </Button>
                  <Button variant="outline">
                    <TestTube className="mr-2 h-4 w-4" />
                    Probar Escalación
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Vista Previa de Escalación */}
            <Card className="bg-white/80 backdrop-blur border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Eye className="mr-2 h-5 w-5 text-blue-500" />
                  Vista Previa de Escalación
                </CardTitle>
                <CardDescription>Simula cómo se ejecutará la escalación</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold">
                      1
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-yellow-800">5 minutos después</div>
                      <div className="text-sm text-yellow-600">WhatsApp → Empleado asignado</div>
                      <div className="text-xs text-yellow-500 mt-1">
                        "⏰ ¡Recuerda completar tu SOP! Control de Temperaturas"
                      </div>
                    </div>
                    <MessageSquare className="h-5 w-5 text-yellow-500" />
                  </div>

                  <div className="flex items-center justify-center">
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>

                  <div className="flex items-center space-x-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                      2
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-orange-800">15 minutos después</div>
                      <div className="text-sm text-orange-600">WhatsApp + Email → Supervisor</div>
                      <div className="text-xs text-orange-500 mt-1">
                        "⚠️ El SOP 'Control de Temperaturas' aún no se ha completado"
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <MessageSquare className="h-4 w-4 text-orange-500" />
                      <Mail className="h-4 w-4 text-orange-500" />
                    </div>
                  </div>

                  <div className="flex items-center justify-center">
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>

                  <div className="flex items-center space-x-4 p-3 bg-red-50 rounded-lg border border-red-200">
                    <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white font-bold">
                      3
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-red-800">30 minutos después</div>
                      <div className="text-sm text-red-600">Todos los canales → Gerencia</div>
                      <div className="text-xs text-red-500 mt-1">"🚨 URGENTE: SOP pendiente en Sucursal Centro"</div>
                    </div>
                    <div className="flex space-x-1">
                      <MessageSquare className="h-4 w-4 text-red-500" />
                      <Mail className="h-4 w-4 text-red-500" />
                      <Phone className="h-4 w-4 text-red-500" />
                    </div>
                  </div>
                </div>

                <Alert className="mt-6 bg-blue-50 border-blue-200">
                  <AlertTriangle className="h-4 w-4 text-blue-500" />
                  <AlertTitle className="text-blue-800">Configuración Recomendada</AlertTitle>
                  <AlertDescription className="text-blue-700">
                    Los tiempos de escalación están optimizados para operaciones HORECA. Ajusta según las necesidades
                    específicas de tu negocio.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Condiciones */}
        <TabsContent value="conditions" className="space-y-6">
          <Card className="bg-white/80 backdrop-blur border-white/20 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="mr-2 h-5 w-5 text-purple-500" />
                Condiciones Personalizadas
              </CardTitle>
              <CardDescription>Define condiciones complejas para disparar automatizaciones</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="mb-4">Configuración de condiciones avanzadas</p>
                <p className="text-sm text-gray-400 mb-6">
                  Próximamente: Editor visual de condiciones con lógica AND/OR
                </p>
                <Button variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Crear Condición
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sistema */}
        <TabsContent value="system" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white/80 backdrop-blur border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="mr-2 h-5 w-5 text-gray-500" />
                  Configuración General
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Zona Horaria</Label>
                  <Select defaultValue="America/Mexico_City">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/Mexico_City">Ciudad de México (GMT-6)</SelectItem>
                      <SelectItem value="America/Cancun">Cancún (GMT-5)</SelectItem>
                      <SelectItem value="America/Tijuana">Tijuana (GMT-8)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Idioma del Sistema</Label>
                  <Select defaultValue="es_MX">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="es_MX">Español (México)</SelectItem>
                      <SelectItem value="en_US">English (US)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Formato de Fecha</Label>
                  <Select defaultValue="DD/MM/YYYY">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium">Configuración de Notificaciones</h4>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Notificaciones Push</Label>
                      <p className="text-sm text-gray-500">Enviar notificaciones del navegador</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Sonidos de Alerta</Label>
                      <p className="text-sm text-gray-500">Reproducir sonidos para alertas críticas</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Modo Silencioso Nocturno</Label>
                      <p className="text-sm text-gray-500">Reducir notificaciones de 22:00 a 06:00</p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="mr-2 h-5 w-5 text-yellow-500" />
                  Rendimiento del Sistema
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Reglas Procesadas Hoy</span>
                    <Badge className="bg-green-100 text-green-800">247</Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Tiempo Promedio de Ejecución</span>
                    <Badge className="bg-blue-100 text-blue-800">1.2s</Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Tasa de Éxito</span>
                    <Badge className="bg-green-100 text-green-800">99.2%</Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Alertas Enviadas</span>
                    <Badge className="bg-orange-100 text-orange-800">18</Badge>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <h4 className="font-medium">Estado de Servicios</h4>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Motor de Secuencias</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Activo</Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">WhatsApp API</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Conectado</Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Base de Datos</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Operativo</Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                      <span className="text-sm">Servicio de Email</span>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-800">Lento</Badge>
                  </div>
                </div>

                <Button className="w-full mt-4">
                  <Settings className="mr-2 h-4 w-4" />
                  Configuración Avanzada
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
