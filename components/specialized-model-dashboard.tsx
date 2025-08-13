"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Brain,
  Eye,
  Volume2,
  Thermometer,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Settings,
  Play,
  RotateCcw,
  BarChart3,
  Target,
  Clock,
  Database,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface ModelInfo {
  id: string
  model_name: string
  verification_category: string
  industry_focus: string
  model_version: string
  deployment_status: string
  confidence_threshold: number
  recent_predictions: number
  recent_avg_confidence: number
  created_at: string
  deployed_at: string
}

interface PerformanceMetrics {
  accuracy: number
  precision: number
  recall: number
  f1_score: number
  score_correlation: number
  average_confidence: number
  sample_size: number
}

interface DriftAnalysis {
  drift_detected: boolean
  drift_magnitude: number
  significant_changes: Array<{
    metric: string
    early_value: number
    recent_value: number
    change: number
    change_percentage: number
  }>
}

export function SpecializedModelDashboard() {
  const [models, setModels] = useState<ModelInfo[]>([])
  const [selectedModel, setSelectedModel] = useState<string | null>(null)
  const [performanceData, setPerformanceData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEvaluating, setIsEvaluating] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    loadModels()
  }, [])

  const loadModels = async () => {
    try {
      const { data, error } = await supabase
        .from("specialized_models_dashboard")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error

      setModels(data || [])
      if (data && data.length > 0 && !selectedModel) {
        setSelectedModel(data[0].id)
      }
    } catch (error) {
      console.error("Error loading models:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const evaluateModel = async (modelId: string) => {
    setIsEvaluating(true)
    try {
      const { data, error } = await supabase.rpc("evaluate_specialized_model_performance", {
        p_model_id: modelId,
      })

      if (error) throw error

      setPerformanceData(data)
    } catch (error) {
      console.error("Error evaluating model:", error)
    } finally {
      setIsEvaluating(false)
    }
  }

  const getModelIcon = (category: string) => {
    switch (category) {
      case "kitchen_hygiene_restaurant":
        return Eye
      case "food_temperature_control":
        return Thermometer
      case "speed_service_fastfood":
        return Volume2
      case "room_cleanliness_hotel":
        return Eye
      default:
        return Brain
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "deployed":
        return "bg-green-100 text-green-800"
      case "testing":
        return "bg-blue-100 text-blue-800"
      case "training":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPerformanceColor = (value: number, threshold = 0.8) => {
    if (value >= threshold) return "text-green-600"
    if (value >= threshold - 0.1) return "text-orange-600"
    return "text-red-600"
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                <div className="h-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold mb-2">Modelos Especializados 🧠</h1>
            <p className="text-purple-100 text-lg">{models.length} modelos activos en producción</p>
          </div>

          <div className="flex space-x-3">
            <Button className="bg-white/20 hover:bg-white/30 backdrop-blur text-white border-0">
              <Settings className="mr-2 h-4 w-4" />
              Configurar
            </Button>

            <Button className="bg-white text-purple-600 hover:bg-purple-50">
              <Play className="mr-2 h-4 w-4" />
              Entrenar Nuevo
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
            <Brain className="h-8 w-8 mx-auto mb-2 text-purple-200" />
            <div className="text-2xl font-bold">{models.length}</div>
            <div className="text-sm text-purple-100">Modelos Activos</div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-300" />
            <div className="text-2xl font-bold">{models.filter((m) => m.deployment_status === "deployed").length}</div>
            <div className="text-sm text-purple-100">En Producción</div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
            <Target className="h-8 w-8 mx-auto mb-2 text-yellow-300" />
            <div className="text-2xl font-bold">
              {Math.round((models.reduce((acc, m) => acc + (m.recent_avg_confidence || 0), 0) / models.length) * 100)}%
            </div>
            <div className="text-sm text-purple-100">Confianza Promedio</div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
            <BarChart3 className="h-8 w-8 mx-auto mb-2 text-blue-300" />
            <div className="text-2xl font-bold">{models.reduce((acc, m) => acc + (m.recent_predictions || 0), 0)}</div>
            <div className="text-sm text-purple-100">Predicciones Hoy</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Models List - 1 column */}
        <div className="space-y-4">
          <Card className="bg-white/80 backdrop-blur border-white/20 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="mr-2 h-5 w-5 text-blue-500" />
                Modelos Disponibles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {models.map((model) => {
                const IconComponent = getModelIcon(model.verification_category)
                const isSelected = selectedModel === model.id

                return (
                  <div
                    key={model.id}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? "border-blue-500 bg-blue-50 shadow-md"
                        : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                    }`}
                    onClick={() => setSelectedModel(model.id)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <IconComponent className="h-5 w-5 text-white" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-sm truncate">{model.model_name}</h3>
                          <Badge className={getStatusColor(model.deployment_status)}>{model.deployment_status}</Badge>
                        </div>

                        <p className="text-xs text-gray-500 mb-2 capitalize">
                          {model.verification_category.replace(/_/g, " ")} • {model.industry_focus}
                        </p>

                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">v{model.model_version}</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-500">{model.recent_predictions || 0} pred.</span>
                            <span className="font-medium text-blue-600">
                              {Math.round((model.recent_avg_confidence || 0) * 100)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </div>

        {/* Model Details - 2 columns */}
        <div className="col-span-2 space-y-6">
          {selectedModel ? (
            <>
              {/* Model Info Card */}
              <Card className="bg-white/80 backdrop-blur border-white/20 shadow-xl">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>
                        {models.find((m) => m.id === selectedModel)?.model_name || "Modelo Seleccionado"}
                      </CardTitle>
                      <CardDescription>Análisis de rendimiento y métricas especializadas</CardDescription>
                    </div>

                    <Button
                      onClick={() => evaluateModel(selectedModel)}
                      disabled={isEvaluating}
                      className="bg-purple-500 hover:bg-purple-600"
                    >
                      {isEvaluating ? (
                        <RotateCcw className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <BarChart3 className="mr-2 h-4 w-4" />
                      )}
                      Evaluar Rendimiento
                    </Button>
                  </div>
                </CardHeader>

                {performanceData && (
                  <CardContent>
                    <Tabs defaultValue="metrics" className="w-full">
                      <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="metrics">Métricas</TabsTrigger>
                        <TabsTrigger value="drift">Drift Analysis</TabsTrigger>
                        <TabsTrigger value="errors">Errores</TabsTrigger>
                        <TabsTrigger value="recommendations">Recomendaciones</TabsTrigger>
                      </TabsList>

                      <TabsContent value="metrics" className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-4">
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium">Precisión</span>
                                <span
                                  className={`font-bold ${getPerformanceColor(
                                    performanceData.model_performance?.metrics?.accuracy || 0,
                                  )}`}
                                >
                                  {Math.round((performanceData.model_performance?.metrics?.accuracy || 0) * 100)}%
                                </span>
                              </div>
                              <Progress
                                value={(performanceData.model_performance?.metrics?.accuracy || 0) * 100}
                                className="h-2"
                              />
                            </div>

                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium">Recall</span>
                                <span className="font-bold text-blue-600">
                                  {Math.round((performanceData.model_performance?.metrics?.recall || 0) * 100)}%
                                </span>
                              </div>
                              <Progress
                                value={(performanceData.model_performance?.metrics?.recall || 0) * 100}
                                className="h-2 bg-blue-100"
                              />
                            </div>

                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium">F1 Score</span>
                                <span className="font-bold text-purple-600">
                                  {Math.round((performanceData.model_performance?.metrics?.f1_score || 0) * 100)}%
                                </span>
                              </div>
                              <Progress
                                value={(performanceData.model_performance?.metrics?.f1_score || 0) * 100}
                                className="h-2 bg-purple-100"
                              />
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                              <div className="text-2xl font-bold text-green-700">
                                {Math.round(
                                  (performanceData.model_performance?.metrics?.average_confidence || 0) * 100,
                                )}
                                %
                              </div>
                              <div className="text-sm text-green-600">Confianza Promedio</div>
                            </div>

                            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                              <div className="text-2xl font-bold text-blue-700">
                                {performanceData.model_performance?.metrics?.sample_size || 0}
                              </div>
                              <div className="text-sm text-blue-600">Muestras Evaluadas</div>
                            </div>

                            <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                              <div className="text-2xl font-bold text-purple-700">
                                {Math.round((performanceData.model_performance?.metrics?.score_correlation || 0) * 100)}
                                %
                              </div>
                              <div className="text-sm text-purple-600">Correlación Expertos</div>
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="drift" className="space-y-4">
                        {performanceData.drift_analysis?.drift_detected ? (
                          <Alert className="border-orange-200 bg-orange-50">
                            <AlertTriangle className="h-4 w-4 text-orange-500" />
                            <AlertTitle className="text-orange-800">Drift Detectado</AlertTitle>
                            <AlertDescription className="text-orange-700">
                              Se detectó degradación en el rendimiento del modelo con magnitud{" "}
                              {performanceData.drift_analysis.drift_magnitude?.toFixed(3)}
                            </AlertDescription>
                          </Alert>
                        ) : (
                          <Alert className="border-green-200 bg-green-50">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <AlertTitle className="text-green-800">Rendimiento Estable</AlertTitle>
                            <AlertDescription className="text-green-700">
                              No se detectó drift significativo en el rendimiento del modelo
                            </AlertDescription>
                          </Alert>
                        )}

                        {performanceData.drift_analysis?.significant_changes?.length > 0 && (
                          <div className="space-y-3">
                            <h4 className="font-medium">Cambios Significativos:</h4>
                            {performanceData.drift_analysis.significant_changes.map((change: any, index: number) => (
                              <div key={index} className="p-3 bg-gray-50 rounded-lg border">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-medium capitalize">{change.metric.replace("_", " ")}</span>
                                  <div className="flex items-center space-x-2">
                                    {change.change > 0 ? (
                                      <TrendingUp className="h-4 w-4 text-green-500" />
                                    ) : (
                                      <TrendingDown className="h-4 w-4 text-red-500" />
                                    )}
                                    <span
                                      className={`font-bold ${change.change > 0 ? "text-green-600" : "text-red-600"}`}
                                    >
                                      {change.change > 0 ? "+" : ""}
                                      {change.change_percentage?.toFixed(1)}%
                                    </span>
                                  </div>
                                </div>
                                <div className="text-sm text-gray-600">
                                  Anterior: {change.early_value?.toFixed(3)} → Actual: {change.recent_value?.toFixed(3)}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </TabsContent>

                      <TabsContent value="errors" className="space-y-4">
                        {performanceData.error_analysis && (
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-3">
                              <h4 className="font-medium">Estadísticas de Error</h4>
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-sm text-gray-600">Error Promedio:</span>
                                  <span className="font-medium">
                                    {performanceData.error_analysis.mean_absolute_error?.toFixed(2)}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm text-gray-600">Error Máximo:</span>
                                  <span className="font-medium text-red-600">
                                    {performanceData.error_analysis.max_error?.toFixed(2)}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm text-gray-600">Outliers:</span>
                                  <span className="font-medium">
                                    {performanceData.error_analysis.outliers?.count || 0}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-3">
                              <h4 className="font-medium">Distribución de Errores</h4>
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-sm text-gray-600">Q25:</span>
                                  <span className="font-medium">
                                    {performanceData.error_analysis.error_distribution?.q25?.toFixed(2)}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm text-gray-600">Q50 (Mediana):</span>
                                  <span className="font-medium">
                                    {performanceData.error_analysis.error_distribution?.q50?.toFixed(2)}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm text-gray-600">Q75:</span>
                                  <span className="font-medium">
                                    {performanceData.error_analysis.error_distribution?.q75?.toFixed(2)}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm text-gray-600">Q90:</span>
                                  <span className="font-medium text-orange-600">
                                    {performanceData.error_analysis.error_distribution?.q90?.toFixed(2)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {performanceData.error_analysis?.large_errors?.common_patterns?.length > 0 && (
                          <div className="space-y-3">
                            <h4 className="font-medium">Patrones de Error Identificados</h4>
                            {performanceData.error_analysis.large_errors.common_patterns.map(
                              (pattern: any, index: number) => (
                                <div key={index} className="p-3 bg-red-50 rounded-lg border border-red-200">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <AlertTriangle className="h-4 w-4 text-red-500" />
                                    <span className="font-medium text-red-800 capitalize">
                                      {pattern.pattern.replace(/_/g, " ")}
                                    </span>
                                  </div>
                                  <p className="text-sm text-red-700 mb-2">{pattern.description}</p>
                                  <div className="text-xs text-red-600">
                                    Casos: {pattern.count} | Error promedio: {pattern.avg_error?.toFixed(2)}
                                  </div>
                                </div>
                              ),
                            )}
                          </div>
                        )}
                      </TabsContent>

                      <TabsContent value="recommendations" className="space-y-4">
                        {performanceData.recommendations?.length > 0 ? (
                          <div className="space-y-4">
                            {performanceData.recommendations.map((rec: any, index: number) => {
                              const getPriorityColor = (priority: string) => {
                                switch (priority) {
                                  case "high":
                                    return "border-red-200 bg-red-50"
                                  case "medium":
                                    return "border-orange-200 bg-orange-50"
                                  default:
                                    return "border-blue-200 bg-blue-50"
                                }
                              }

                              const getPriorityIcon = (priority: string) => {
                                switch (priority) {
                                  case "high":
                                    return <AlertTriangle className="h-4 w-4 text-red-500" />
                                  case "medium":
                                    return <Clock className="h-4 w-4 text-orange-500" />
                                  default:
                                    return <CheckCircle className="h-4 w-4 text-blue-500" />
                                }
                              }

                              return (
                                <div key={index} className={`p-4 rounded-lg border ${getPriorityColor(rec.priority)}`}>
                                  <div className="flex items-start space-x-3">
                                    <div className="flex-shrink-0 mt-0.5">{getPriorityIcon(rec.priority)}</div>
                                    <div className="flex-1">
                                      <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-semibold">{rec.title}</h4>
                                        <Badge
                                          variant={rec.priority === "high" ? "destructive" : "secondary"}
                                          className="capitalize"
                                        >
                                          {rec.priority}
                                        </Badge>
                                      </div>
                                      <p className="text-sm text-gray-700 mb-3">{rec.description}</p>
                                      {rec.actions && rec.actions.length > 0 && (
                                        <div>
                                          <h5 className="text-sm font-medium mb-2">Acciones Recomendadas:</h5>
                                          <ul className="text-sm space-y-1">
                                            {rec.actions.map((action: string, actionIndex: number) => (
                                              <li key={actionIndex} className="flex items-start">
                                                <span className="mr-2 text-gray-400">•</span>
                                                <span>{action}</span>
                                              </li>
                                            ))}
                                          </ul>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                            <h3 className="text-lg font-medium mb-2">¡Excelente Rendimiento!</h3>
                            <p>El modelo está funcionando dentro de parámetros óptimos.</p>
                          </div>
                        )}
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                )}
              </Card>
            </>
          ) : (
            <Card className="bg-white/80 backdrop-blur border-white/20 shadow-xl">
              <CardContent className="p-12 text-center">
                <Brain className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold mb-2">Selecciona un Modelo</h3>
                <p className="text-gray-600">Elige un modelo de la lista para ver su análisis detallado</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
