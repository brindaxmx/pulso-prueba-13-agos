import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Brain,
  TrendingUp,
  Eye,
  Volume2,
  MessageSquare,
  Thermometer,
  BarChart3,
  Target,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  Zap,
} from "lucide-react"

export default async function AIInsightsPage() {
  const supabase = await createClient()

  // Obtener métricas de AI
  const { data: aiMetrics } = await supabase.rpc("calculate_ai_metrics")

  // Obtener verificaciones recientes
  const { data: recentVerifications } = await supabase
    .from("ai_verifications")
    .select(`
      *,
      empleados_pulso (nombre, apellidos),
      checklist_templates (nombre)
    `)
    .order("created_at", { ascending: false })
    .limit(20)

  // Obtener alertas automáticas
  const { data: autoAlerts } = await supabase
    .from("alertas_automaticas")
    .select("*")
    .eq("estado", "activa")
    .order("created_at", { ascending: false })
    .limit(10)

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold mb-2">AI Insights 🧠</h1>
            <p className="text-purple-100 text-lg">
              Análisis inteligente de {aiMetrics?.total_verifications || 0} verificaciones
            </p>
          </div>

          <div className="text-right">
            <div className="text-3xl font-bold">{Math.round(aiMetrics?.accuracy_rate || 0)}%</div>
            <div className="text-purple-100">Precisión AI</div>
            <TrendingUp className="inline h-5 w-5 ml-2 text-green-300" />
          </div>
        </div>

        {/* AI Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
            <Brain className="h-8 w-8 mx-auto mb-2 text-purple-200" />
            <div className="text-2xl font-bold">{aiMetrics?.total_verifications || 0}</div>
            <div className="text-sm text-purple-100">Verificaciones</div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-300" />
            <div className="text-2xl font-bold">{aiMetrics?.passed_verifications || 0}</div>
            <div className="text-sm text-purple-100">Exitosas</div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-orange-300" />
            <div className="text-2xl font-bold">{aiMetrics?.failed_verifications || 0}</div>
            <div className="text-sm text-purple-100">Fallidas</div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
            <Target className="h-8 w-8 mx-auto mb-2 text-yellow-300" />
            <div className="text-2xl font-bold">{Math.round((aiMetrics?.average_confidence || 0) * 100)}%</div>
            <div className="text-sm text-purple-100">Confianza Promedio</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Main Content - 2 columns */}
        <div className="col-span-2 space-y-6">
          {/* Verification Types Performance */}
          <Card className="bg-white/80 backdrop-blur border-white/20 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="mr-2 h-5 w-5 text-blue-500" />
                Rendimiento por Tipo de Verificación
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {aiMetrics?.by_type &&
                  Object.entries(aiMetrics.by_type).map(([type, stats]: [string, any]) => {
                    const getIcon = (type: string) => {
                      switch (type) {
                        case "image":
                          return Eye
                        case "audio":
                          return Volume2
                        case "text":
                          return MessageSquare
                        case "temperature":
                          return Thermometer
                        default:
                          return Brain
                      }
                    }

                    const IconComponent = getIcon(type)

                    return (
                      <div key={type} className="p-4 border rounded-xl hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                              <IconComponent className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <h3 className="font-semibold capitalize">{type.replace("_", " ")}</h3>
                              <p className="text-sm text-gray-500">{stats.count} verificaciones</p>
                            </div>
                          </div>

                          <div className="text-right">
                            <Badge
                              variant={
                                stats.success_rate >= 90
                                  ? "default"
                                  : stats.success_rate >= 75
                                    ? "secondary"
                                    : "destructive"
                              }
                            >
                              {Math.round(stats.success_rate)}% éxito
                            </Badge>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Tasa de Éxito</span>
                              <span className="font-medium">{Math.round(stats.success_rate)}%</span>
                            </div>
                            <Progress value={stats.success_rate} className="h-2" />
                          </div>

                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Confianza Promedio</span>
                              <span className="font-medium">{Math.round(stats.avg_confidence * 100)}%</span>
                            </div>
                            <Progress value={stats.avg_confidence * 100} className="h-2 bg-purple-100" />
                          </div>
                        </div>
                      </div>
                    )
                  })}
              </div>
            </CardContent>
          </Card>

          {/* Recent Verifications */}
          <Card className="bg-white/80 backdrop-blur border-white/20 shadow-xl">
            <CardHeader>
              <CardTitle>Verificaciones Recientes</CardTitle>
              <CardDescription>Últimas verificaciones procesadas por AI</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentVerifications?.map((verification) => {
                  const getIcon = (type: string) => {
                    switch (type) {
                      case "image":
                        return Eye
                      case "audio":
                        return Volume2
                      case "text":
                        return MessageSquare
                      case "temperature":
                        return Thermometer
                      default:
                        return Brain
                    }
                  }

                  const IconComponent = getIcon(verification.verification_type)
                  const isPassed = verification.status === "passed"

                  return (
                    <div
                      key={verification.id}
                      className={`p-4 rounded-xl border transition-all ${
                        isPassed ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                      }`}
                    >
                      <div className="flex items-start space-x-4">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            isPassed
                              ? "bg-gradient-to-br from-green-500 to-emerald-600"
                              : "bg-gradient-to-br from-red-500 to-pink-600"
                          }`}
                        >
                          <IconComponent className="h-5 w-5 text-white" />
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{verification.checklist_templates?.nombre}</h4>
                            <Badge
                              variant={isPassed ? "default" : "destructive"}
                              className={isPassed ? "bg-green-100 text-green-800" : ""}
                            >
                              {Math.round(verification.confidence_score * 100)}%
                            </Badge>
                          </div>

                          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                            <span>
                              {verification.empleados_pulso?.nombre} {verification.empleados_pulso?.apellidos}
                            </span>
                            <span>•</span>
                            <span className="capitalize">{verification.verification_type}</span>
                            <span>•</span>
                            <span>{new Date(verification.created_at).toLocaleString()}</span>
                          </div>

                          {verification.ai_result?.feedback && (
                            <p className="text-sm text-gray-700 line-clamp-2">{verification.ai_result.feedback}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - 1 column */}
        <div className="space-y-6">
          {/* AI Performance Summary */}
          <Card className="bg-white/80 backdrop-blur border-white/20 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="mr-2 h-5 w-5 text-green-500" />
                Resumen de Rendimiento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="text-3xl font-bold text-green-700">{Math.round(aiMetrics?.accuracy_rate || 0)}%</div>
                <div className="text-sm text-green-600">Precisión General</div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Verificaciones Exitosas</span>
                  <span className="font-bold text-green-600">{aiMetrics?.passed_verifications || 0}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Confianza Promedio</span>
                  <span className="font-bold text-blue-600">
                    {Math.round((aiMetrics?.average_confidence || 0) * 100)}%
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Alertas Generadas</span>
                  <span className="font-bold text-orange-600">{autoAlerts?.length || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Auto Alerts */}
          <Card className="bg-white/80 backdrop-blur border-white/20 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="mr-2 h-5 w-5 text-orange-500" />
                Alertas Automáticas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {autoAlerts?.slice(0, 5).map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-3 rounded-lg border ${
                      alert.severidad === "critica"
                        ? "bg-red-50 border-red-200"
                        : alert.severidad === "alta"
                          ? "bg-orange-50 border-orange-200"
                          : "bg-yellow-50 border-yellow-200"
                    }`}
                  >
                    <div className="flex items-start space-x-2">
                      <AlertTriangle
                        className={`h-4 w-4 mt-0.5 ${
                          alert.severidad === "critica"
                            ? "text-red-500"
                            : alert.severidad === "alta"
                              ? "text-orange-500"
                              : "text-yellow-500"
                        }`}
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{alert.titulo}</h4>
                        <p className="text-xs text-gray-600 mt-1">{alert.descripcion}</p>
                        <div className="text-xs text-gray-500 mt-1">{new Date(alert.created_at).toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                ))}

                {(!autoAlerts || autoAlerts.length === 0) && (
                  <div className="text-center py-4 text-gray-500">
                    <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                    <p className="text-sm">No hay alertas activas</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* AI Recommendations */}
          <Card className="bg-gradient-to-br from-purple-600 to-pink-600 text-white border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Lightbulb className="mr-2 h-5 w-5" />
                Recomendaciones AI
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-white/20 backdrop-blur rounded-lg p-4">
                <h4 className="font-semibold mb-2">Optimización Sugerida</h4>
                <p className="text-sm text-purple-100 mb-3">Basado en el análisis de patrones de verificación</p>
                <ul className="text-sm space-y-1">
                  <li>• Aumentar frecuencia de verificación de temperatura</li>
                  <li>• Mejorar calidad de fotos en verificaciones</li>
                  <li>• Capacitar en reportes de audio más detallados</li>
                </ul>
              </div>

              <div className="bg-white/20 backdrop-blur rounded-lg p-4">
                <h4 className="font-semibold mb-2">Próximas Mejoras</h4>
                <ul className="text-sm space-y-1">
                  <li>• Modelo especializado en cocinas</li>
                  <li>• Reconocimiento de voz mejorado</li>
                  <li>• Análisis predictivo de fallos</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
