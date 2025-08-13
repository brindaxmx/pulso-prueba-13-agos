import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  History,
  GitBranch,
  Eye,
  RotateCcw,
  Download,
  Filter,
  Search,
  Calendar,
  User,
  Activity,
  FileText,
  Clock,
  CheckCircle,
  Edit,
  Trash2,
  Play,
  Pause,
  GitCompare,
} from "lucide-react"
import { VersionComparison } from "@/components/version-comparison"
import { RollbackManager } from "@/components/rollback-manager"

export default async function AuditoriaPage() {
  const supabase = await createClient()

  // Obtener historial de auditoría
  const { data: auditHistory } = await supabase
    .from("rule_change_history")
    .select("*")
    .order("changed_at", { ascending: false })
    .limit(50)

  // Obtener versiones de reglas
  const { data: ruleVersions } = await supabase
    .from("rule_versions_detailed")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(30)

  // Obtener rollbacks
  const { data: rollbacks } = await supabase
    .from("rule_rollbacks")
    .select(`
      *,
      empleados!rule_rollbacks_rolled_back_by_fkey (nombre, email),
      sequence_engine_rules (description)
    `)
    .order("rolled_back_at", { ascending: false })

  // Estadísticas de auditoría
  const { data: auditStats } = await supabase.rpc("get_audit_statistics")

  const getActionIcon = (action: string) => {
    switch (action) {
      case "created":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "updated":
        return <Edit className="h-4 w-4 text-blue-500" />
      case "deleted":
        return <Trash2 className="h-4 w-4 text-red-500" />
      case "activated":
        return <Play className="h-4 w-4 text-green-500" />
      case "deactivated":
        return <Pause className="h-4 w-4 text-orange-500" />
      default:
        return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case "created":
        return "bg-green-50 border-green-200 text-green-800"
      case "updated":
        return "bg-blue-50 border-blue-200 text-blue-800"
      case "deleted":
        return "bg-red-50 border-red-200 text-red-800"
      case "activated":
        return "bg-green-50 border-green-200 text-green-800"
      case "deactivated":
        return "bg-orange-50 border-orange-200 text-orange-800"
      default:
        return "bg-gray-50 border-gray-200 text-gray-800"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("es-MX", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold mb-2">Auditoría y Versionado 📋</h1>
            <p className="text-indigo-100 text-lg">Historial completo de cambios y versiones</p>
          </div>

          <div className="flex space-x-3">
            <Button className="bg-white/20 hover:bg-white/30 backdrop-blur text-white border-0">
              <Download className="mr-2 h-4 w-4" />
              Exportar Reporte
            </Button>

            <Button className="bg-white text-indigo-600 hover:bg-indigo-50">
              <Filter className="mr-2 h-4 w-4" />
              Filtros Avanzados
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-5 gap-4">
          <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
            <History className="h-8 w-8 mx-auto mb-2 text-indigo-200" />
            <div className="text-2xl font-bold">{auditHistory?.length || 0}</div>
            <div className="text-sm text-indigo-100">Cambios Totales</div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
            <GitBranch className="h-8 w-8 mx-auto mb-2 text-purple-200" />
            <div className="text-2xl font-bold">{ruleVersions?.length || 0}</div>
            <div className="text-sm text-indigo-100">Versiones</div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
            <RotateCcw className="h-8 w-8 mx-auto mb-2 text-blue-200" />
            <div className="text-2xl font-bold">{rollbacks?.length || 0}</div>
            <div className="text-sm text-indigo-100">Rollbacks</div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
            <User className="h-8 w-8 mx-auto mb-2 text-green-200" />
            <div className="text-2xl font-bold">{new Set(auditHistory?.map((h) => h.changed_by)).size || 0}</div>
            <div className="text-sm text-indigo-100">Usuarios Activos</div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
            <Calendar className="h-8 w-8 mx-auto mb-2 text-orange-200" />
            <div className="text-2xl font-bold">
              {auditHistory?.filter((h) => new Date(h.changed_at) > new Date(Date.now() - 24 * 60 * 60 * 1000))
                .length || 0}
            </div>
            <div className="text-sm text-indigo-100">Últimas 24h</div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="history" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur border-white/20">
          <TabsTrigger value="history" className="flex items-center">
            <History className="mr-2 h-4 w-4" />
            Historial de Cambios
          </TabsTrigger>
          <TabsTrigger value="versions" className="flex items-center">
            <GitBranch className="mr-2 h-4 w-4" />
            Versiones
          </TabsTrigger>
          <TabsTrigger value="comparisons" className="flex items-center">
            <GitCompare className="mr-2 h-4 w-4" />
            Comparaciones
          </TabsTrigger>
          <TabsTrigger value="rollbacks" className="flex items-center">
            <RotateCcw className="mr-2 h-4 w-4" />
            Rollbacks
          </TabsTrigger>
        </TabsList>

        {/* Historial de Cambios */}
        <TabsContent value="history" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Filtros */}
            <Card className="bg-white/80 backdrop-blur border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Filter className="mr-2 h-5 w-5 text-blue-500" />
                  Filtros
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Buscar</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input placeholder="Buscar cambios..." className="pl-10" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Tipo de Acción</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Todas las acciones" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las acciones</SelectItem>
                      <SelectItem value="created">Creadas</SelectItem>
                      <SelectItem value="updated">Actualizadas</SelectItem>
                      <SelectItem value="deleted">Eliminadas</SelectItem>
                      <SelectItem value="activated">Activadas</SelectItem>
                      <SelectItem value="deactivated">Desactivadas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Usuario</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos los usuarios" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los usuarios</SelectItem>
                      {Array.from(new Set(auditHistory?.map((h) => h.changed_by_name))).map((name) => (
                        <SelectItem key={name} value={name || ""}>
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Período</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Último mes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="today">Hoy</SelectItem>
                      <SelectItem value="week">Última semana</SelectItem>
                      <SelectItem value="month">Último mes</SelectItem>
                      <SelectItem value="quarter">Último trimestre</SelectItem>
                      <SelectItem value="year">Último año</SelectItem>
                      <SelectItem value="all">Todo el historial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button className="w-full">
                  <Search className="mr-2 h-4 w-4" />
                  Aplicar Filtros
                </Button>
              </CardContent>
            </Card>

            {/* Timeline de Cambios */}
            <div className="lg:col-span-3">
              <Card className="bg-white/80 backdrop-blur border-white/20 shadow-xl">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Timeline de Cambios</CardTitle>
                      <CardDescription>Historial cronológico de todas las modificaciones</CardDescription>
                    </div>
                    <Button variant="outline">
                      <Download className="mr-2 h-4 w-4" />
                      Exportar
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[700px] pr-4">
                    <div className="space-y-4">
                      {auditHistory?.map((entry, index) => (
                        <div key={entry.id} className="relative">
                          {/* Timeline line */}
                          {index < auditHistory.length - 1 && (
                            <div className="absolute left-6 top-12 w-0.5 h-16 bg-gray-200"></div>
                          )}

                          <div className="flex items-start space-x-4">
                            {/* Timeline dot */}
                            <div className="flex-shrink-0 w-12 h-12 bg-white rounded-full border-2 border-gray-200 flex items-center justify-center shadow-sm">
                              {getActionIcon(entry.action_type)}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <Card
                                className={`border-l-4 ${getActionColor(entry.action_type)} hover:shadow-lg transition-all`}
                              >
                                <CardContent className="p-4">
                                  <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                      <div className="flex items-center space-x-2 mb-2">
                                        <Badge variant="outline" className="capitalize">
                                          {entry.action_type}
                                        </Badge>
                                        <Badge variant="secondary">v{entry.version_number}</Badge>
                                        <span className="text-sm text-gray-500">{formatDate(entry.changed_at)}</span>
                                      </div>

                                      <h4 className="font-semibold text-gray-900 mb-1">{entry.rule_description}</h4>

                                      <p className="text-sm text-gray-600 mb-2">{entry.change_summary}</p>

                                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                                        <div className="flex items-center">
                                          <User className="mr-1 h-3 w-3" />
                                          {entry.changed_by_name}
                                        </div>
                                        {entry.ip_address && (
                                          <div className="flex items-center">
                                            <Activity className="mr-1 h-3 w-3" />
                                            {entry.ip_address}
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    <div className="flex items-center space-x-2 ml-4">
                                      <Button variant="outline" size="sm">
                                        <Eye className="h-3 w-3" />
                                      </Button>
                                      {entry.action_type === "updated" && (
                                        <Button variant="outline" size="sm">
                                          <GitCompare className="h-3 w-3" />
                                        </Button>
                                      )}
                                    </div>
                                  </div>

                                  {/* Mostrar cambios específicos si están disponibles */}
                                  {entry.old_data && entry.new_data && (
                                    <Alert className="mt-3 bg-blue-50 border-blue-200">
                                      <FileText className="h-4 w-4 text-blue-500" />
                                      <AlertDescription className="text-blue-700">
                                        <details className="cursor-pointer">
                                          <summary className="font-medium">Ver detalles del cambio</summary>
                                          <div className="mt-2 space-y-2 text-xs">
                                            <div>
                                              <strong>Antes:</strong>
                                              <pre className="bg-white p-2 rounded border mt-1 overflow-x-auto">
                                                {JSON.stringify(entry.old_data, null, 2)}
                                              </pre>
                                            </div>
                                            <div>
                                              <strong>Después:</strong>
                                              <pre className="bg-white p-2 rounded border mt-1 overflow-x-auto">
                                                {JSON.stringify(entry.new_data, null, 2)}
                                              </pre>
                                            </div>
                                          </div>
                                        </details>
                                      </AlertDescription>
                                    </Alert>
                                  )}
                                </CardContent>
                              </Card>
                            </div>
                          </div>
                        </div>
                      )) || (
                        <div className="text-center py-12 text-gray-500">
                          <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>No hay historial de cambios disponible</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Versiones */}
        <TabsContent value="versions" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {ruleVersions?.reduce(
              (acc, version) => {
                const ruleId = version.rule_id
                if (!acc[ruleId]) {
                  acc[ruleId] = []
                }
                acc[ruleId].push(version)
                return acc
              },
              {} as Record<string, any[]>,
            ) &&
              Object.entries(
                ruleVersions.reduce(
                  (acc, version) => {
                    const ruleId = version.rule_id
                    if (!acc[ruleId]) {
                      acc[ruleId] = []
                    }
                    acc[ruleId].push(version)
                    return acc
                  },
                  {} as Record<string, any[]>,
                ),
              ).map(([ruleId, versions]) => (
                <Card key={ruleId} className="bg-white/80 backdrop-blur border-white/20 shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <GitBranch className="mr-2 h-5 w-5 text-purple-500" />
                      {versions[0]?.rule_description}
                    </CardTitle>
                    <CardDescription>{versions.length} versiones disponibles</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[400px] pr-4">
                      <div className="space-y-3">
                        {versions.map((version) => (
                          <div
                            key={version.id}
                            className={`p-3 rounded-lg border ${
                              version.is_current
                                ? "bg-green-50 border-green-200"
                                : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                            } transition-colors`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <Badge
                                  variant={version.is_current ? "default" : "outline"}
                                  className={version.is_current ? "bg-green-500" : ""}
                                >
                                  v{version.version_number}
                                </Badge>
                                {version.is_current && (
                                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                                    Actual
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center space-x-1">
                                <Button variant="outline" size="sm">
                                  <Eye className="h-3 w-3" />
                                </Button>
                                {!version.is_current && (
                                  <Button variant="outline" size="sm">
                                    <RotateCcw className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                            </div>

                            <p className="text-sm text-gray-600 mb-2">{version.change_notes}</p>

                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <div className="flex items-center">
                                <User className="mr-1 h-3 w-3" />
                                {version.created_by_name}
                              </div>
                              <div className="flex items-center">
                                <Clock className="mr-1 h-3 w-3" />
                                {formatDate(version.created_at)}
                              </div>
                            </div>

                            {version.tags && version.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {version.tags.map((tag) => (
                                  <Badge key={tag} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        {/* Comparaciones */}
        <TabsContent value="comparisons" className="space-y-6">
          <VersionComparison ruleVersions={ruleVersions} />
        </TabsContent>

        {/* Rollbacks */}
        <TabsContent value="rollbacks" className="space-y-6">
          <RollbackManager rollbacks={rollbacks} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
