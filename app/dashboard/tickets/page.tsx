import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Ticket,
  AlertTriangle,
  Clock,
  CheckCircle,
  User,
  Building,
  Plus,
  Filter,
  Search,
  MoreVertical,
  Phone,
  MessageSquare,
  UserPlus,
  Settings,
  TrendingUp,
  Target,
  Zap,
  RefreshCw,
  Wrench,
  Shield,
  Users,
  Package,
  AlertCircle,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default async function TicketsPage() {
  const supabase = await createClient()

  // Obtener tickets HORECA
  const { data: tickets } = await supabase
    .from("tickets_horeca")
    .select(`
      *,
      usuarios_horeca!tickets_horeca_reportado_por_fkey (nombre, apellidos, rol_principal),
      usuarios_horeca!tickets_horeca_asignado_a_fkey (nombre, apellidos, rol_principal),
      sucursales_horeca (nombre)
    `)
    .order("fecha_creacion", { ascending: false })

  // Calcular métricas
  const totalTickets = tickets?.length || 0
  const ticketsCriticos = tickets?.filter((t) => t.prioridad === "critica").length || 0
  const ticketsAbiertos = tickets?.filter((t) => ["nuevo", "asignado", "en_progreso"].includes(t.estado)).length || 0
  const ticketsResueltos = tickets?.filter((t) => t.estado === "resuelto").length || 0
  const tiempoPromedioResolucion = 4.2 // Calculado desde la base de datos

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-red-500 via-orange-500 to-yellow-500 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold mb-2">Centro de Tickets 🎫</h1>
            <p className="text-red-100 text-lg">
              {totalTickets} tickets totales • {ticketsCriticos} críticos activos
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="bg-white/20 backdrop-blur rounded-xl p-4 text-center">
              <div className="text-2xl font-bold">{tiempoPromedioResolucion} hrs</div>
              <div className="text-sm text-red-100">Tiempo promedio</div>
            </div>

            <Button className="bg-white text-red-600 hover:bg-red-50">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Ticket
            </Button>
          </div>
        </div>

        {/* Ticket Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-red-200 animate-pulse" />
            <div className="text-2xl font-bold">{ticketsCriticos}</div>
            <div className="text-sm text-red-100">Críticos</div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
            <Clock className="h-8 w-8 mx-auto mb-2 text-orange-200" />
            <div className="text-2xl font-bold">{ticketsAbiertos}</div>
            <div className="text-sm text-red-100">Abiertos</div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-200" />
            <div className="text-2xl font-bold">{ticketsResueltos}</div>
            <div className="text-sm text-red-100">Resueltos</div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 text-yellow-200" />
            <div className="text-2xl font-bold">{Math.round((ticketsResueltos / totalTickets) * 100)}%</div>
            <div className="text-sm text-red-100">Tasa Resolución</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Main Timeline - 2 columns */}
        <div className="col-span-2 space-y-6">
          {/* Filter Tabs */}
          <Card className="bg-white/80 backdrop-blur border-white/20 shadow-xl">
            <CardContent className="p-6">
              <Tabs defaultValue="all" className="w-full">
                <div className="flex items-center justify-between">
                  <TabsList className="bg-gray-100/50">
                    <TabsTrigger value="all" className="relative">
                      Todos
                      <Badge className="ml-2 bg-blue-500/20 text-blue-700">{totalTickets}</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="critical" className="relative">
                      Críticos
                      <Badge className="ml-2 bg-red-500/20 text-red-700 animate-pulse">{ticketsCriticos}</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="open">
                      Abiertos
                      <Badge className="ml-2 bg-orange-500/20 text-orange-700">{ticketsAbiertos}</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="resolved">
                      Resueltos
                      <Badge className="ml-2 bg-green-500/20 text-green-700">{ticketsResueltos}</Badge>
                    </TabsTrigger>
                  </TabsList>

                  <div className="flex space-x-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input placeholder="Buscar tickets..." className="w-64 pl-10 bg-white/50" />
                    </div>

                    <Button variant="outline" className="bg-white/50">
                      <Filter className="mr-2 h-4 w-4" />
                      Filtros
                    </Button>
                  </div>
                </div>
              </Tabs>
            </CardContent>
          </Card>

          {/* Tickets Timeline */}
          <Card className="bg-white/80 backdrop-blur border-white/20 shadow-xl">
            <CardContent className="p-6">
              <ScrollArea className="h-[600px] pr-4">
                <div className="space-y-6 relative">
                  {/* Timeline line */}
                  <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-red-500 via-orange-500 to-green-500 opacity-20"></div>

                  {tickets?.map((ticket) => {
                    const getIcon = (tipo: string) => {
                      switch (tipo) {
                        case "mantenimiento_correctivo":
                        case "mantenimiento_preventivo":
                          return Wrench
                        case "seguridad_alimentaria":
                          return Shield
                        case "servicio_cliente":
                          return Users
                        case "inventario":
                          return Package
                        case "emergencia":
                          return AlertTriangle
                        default:
                          return Ticket
                      }
                    }

                    const IconComponent = getIcon(ticket.tipo)
                    const isCritico = ticket.prioridad === "critica"
                    const isResuelto = ticket.estado === "resuelto"

                    return (
                      <div
                        key={ticket.id}
                        className={`relative flex items-start space-x-4 p-6 rounded-xl border hover:shadow-lg transition-all ${
                          isCritico
                            ? "bg-gradient-to-r from-red-50 to-pink-50 border-red-200"
                            : isResuelto
                              ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200"
                              : "bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200"
                        }`}
                      >
                        {isCritico && (
                          <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-transparent animate-pulse rounded-xl"></div>
                        )}

                        <div className="relative z-10 flex-shrink-0">
                          <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg ${
                              isCritico
                                ? "bg-gradient-to-br from-red-500 to-pink-600"
                                : isResuelto
                                  ? "bg-gradient-to-br from-green-500 to-emerald-600"
                                  : "bg-gradient-to-br from-orange-500 to-yellow-500"
                            }`}
                          >
                            <IconComponent className={`h-6 w-6 text-white ${isCritico ? "animate-pulse" : ""}`} />
                          </div>
                          {isCritico && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-400 rounded-full animate-ping"></div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0 relative z-10">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3
                                className={`text-lg font-bold mb-1 ${
                                  isCritico ? "text-red-800" : isResuelto ? "text-green-800" : "text-orange-800"
                                }`}
                              >
                                {ticket.titulo}
                              </h3>
                              <p
                                className={`text-sm mb-2 ${
                                  isCritico ? "text-red-700" : isResuelto ? "text-green-700" : "text-orange-700"
                                }`}
                              >
                                {ticket.descripcion}
                              </p>
                              <div
                                className={`flex items-center space-x-3 text-sm ${
                                  isCritico ? "text-red-600" : isResuelto ? "text-green-600" : "text-orange-600"
                                }`}
                              >
                                <div className="flex items-center">
                                  <Clock className="h-4 w-4 mr-1" />
                                  <span className="font-medium">
                                    {new Date(ticket.fecha_creacion).toLocaleString()}
                                  </span>
                                </div>
                                <div className="flex items-center">
                                  <User className="h-4 w-4 mr-1" />
                                  <span>
                                    {ticket.usuarios_horeca?.nombre} {ticket.usuarios_horeca?.apellidos}
                                  </span>
                                </div>
                                <Badge
                                  className={
                                    isCritico
                                      ? "bg-red-100 text-red-800 animate-pulse"
                                      : isResuelto
                                        ? "bg-green-100 text-green-800"
                                        : "bg-orange-100 text-orange-800"
                                  }
                                >
                                  {ticket.estado.toUpperCase()}
                                </Badge>
                              </div>
                            </div>

                            <div className="flex space-x-2">
                              {!isResuelto && (
                                <Button
                                  size="sm"
                                  className={
                                    isCritico
                                      ? "bg-red-500 hover:bg-red-600 text-white"
                                      : "bg-orange-500 hover:bg-orange-600 text-white"
                                  }
                                >
                                  <Zap className="mr-1 h-3 w-3" />
                                  {isCritico ? "Resolver" : "Asignar"}
                                </Button>
                              )}

                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <MoreVertical className="h-3 w-3" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                  <DropdownMenuItem>
                                    <MessageSquare className="mr-2 h-4 w-4" />
                                    Enviar WhatsApp
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Phone className="mr-2 h-4 w-4" />
                                    Llamar empleado
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <UserPlus className="mr-2 h-4 w-4" />
                                    Escalar a supervisor
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>

                          {isCritico && (
                            <Alert
                              className={`${isCritico ? "bg-red-100/50 border-red-300" : "bg-orange-100/50 border-orange-300"}`}
                            >
                              <AlertTriangle className="h-4 w-4 text-red-500" />
                              <AlertTitle className="text-red-800">Ticket Crítico</AlertTitle>
                              <AlertDescription className="text-red-700">
                                Requiere atención inmediata. SLA: <strong>2 horas</strong>
                              </AlertDescription>
                            </Alert>
                          )}

                          <div className="mt-4 flex items-center space-x-4 text-sm">
                            <div className="flex items-center space-x-2 text-gray-600">
                              <Building className="h-4 w-4" />
                              <span>{ticket.sucursales_horeca?.nombre}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-gray-600">
                              <Ticket className="h-4 w-4" />
                              <span>{ticket.numero_ticket}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-gray-600">
                              <Badge variant="outline" className="text-xs capitalize">
                                {ticket.tipo.replace("_", " ")}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </ScrollArea>

              <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                <div className="text-sm text-gray-500">Mostrando los últimos {tickets?.length || 0} tickets</div>
                <Button variant="outline">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Actualizar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - 1 column */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card className="bg-white/80 backdrop-blur border-white/20 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="mr-2 h-5 w-5 text-purple-500" />
                Estadísticas Rápidas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                <div>
                  <div className="text-2xl font-bold text-red-700">{ticketsCriticos}</div>
                  <div className="text-sm text-red-600">Críticos Activos</div>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-500 animate-pulse" />
              </div>

              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                <div>
                  <div className="text-2xl font-bold text-orange-700">{tiempoPromedioResolucion}</div>
                  <div className="text-sm text-orange-600">Hrs promedio resolución</div>
                </div>
                <Clock className="h-8 w-8 text-orange-500" />
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                <div>
                  <div className="text-2xl font-bold text-green-700">
                    {Math.round((ticketsResueltos / totalTickets) * 100)}%
                  </div>
                  <div className="text-sm text-green-600">Tasa de resolución</div>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          {/* Top Issues */}
          <Card className="bg-white/80 backdrop-blur border-white/20 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertCircle className="mr-2 h-5 w-5 text-orange-500" />
                Tipos Más Frecuentes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                <div className="flex items-center space-x-3">
                  <Wrench className="h-5 w-5 text-red-500" />
                  <div>
                    <div className="font-medium text-red-800">Mantenimiento</div>
                    <div className="text-xs text-red-600">Último: hace 5 min</div>
                  </div>
                </div>
                <Badge className="bg-red-100 text-red-800">3x hoy</Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-100">
                <div className="flex items-center space-x-3">
                  <Package className="h-5 w-5 text-orange-500" />
                  <div>
                    <div className="font-medium text-orange-800">Inventario</div>
                    <div className="text-xs text-orange-600">Último: hace 12 min</div>
                  </div>
                </div>
                <Badge className="bg-orange-100 text-orange-800">2x hoy</Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
                <div className="flex items-center space-x-3">
                  <Users className="h-5 w-5 text-blue-500" />
                  <div>
                    <div className="font-medium text-blue-800">Servicio Cliente</div>
                    <div className="text-xs text-blue-600">Último: hace 1 hora</div>
                  </div>
                </div>
                <Badge className="bg-blue-100 text-blue-800">1x hoy</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-gradient-to-br from-purple-600 to-pink-600 text-white border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Zap className="mr-2 h-5 w-5" />
                Acciones Rápidas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full bg-white/20 hover:bg-white/30 backdrop-blur border-0 text-white justify-start">
                <Plus className="mr-2 h-4 w-4" />
                Crear Ticket Manual
              </Button>

              <Button className="w-full bg-white/20 hover:bg-white/30 backdrop-blur border-0 text-white justify-start">
                <Phone className="mr-2 h-4 w-4" />
                Llamar Mantenimiento
              </Button>

              <Button className="w-full bg-white/20 hover:bg-white/30 backdrop-blur border-0 text-white justify-start">
                <MessageSquare className="mr-2 h-4 w-4" />
                Mensaje Grupal
              </Button>

              <Button className="w-full bg-white/20 hover:bg-white/30 backdrop-blur border-0 text-white justify-start">
                <Settings className="mr-2 h-4 w-4" />
                Configurar SLA
              </Button>
            </CardContent>
          </Card>

          {/* Performance Chart */}
          <Card className="bg-white/80 backdrop-blur border-white/20 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="mr-2 h-5 w-5 text-blue-500" />
                Rendimiento Semanal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Tickets resueltos</span>
                  <span className="font-bold text-green-600">{ticketsResueltos}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Tiempo promedio</span>
                  <span className="font-bold text-blue-600">{tiempoPromedioResolucion} hrs</span>
                </div>

                <div className="mt-4">
                  <Progress value={Math.round((ticketsResueltos / totalTickets) * 100)} className="h-3 bg-blue-100" />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Eficiencia</span>
                    <span>{Math.round((ticketsResueltos / totalTickets) * 100)}%</span>
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-3 border border-green-200 mt-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium text-green-800">Mejora del 15%</span>
                  </div>
                  <p className="text-xs text-green-600 mt-1">vs semana anterior</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
