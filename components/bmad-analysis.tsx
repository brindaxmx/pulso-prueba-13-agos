"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Target,
  Users,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  BarChart3,
  Lightbulb,
  Zap,
  Shield,
  Clock,
  Star,
} from "lucide-react"

interface BMADAnalysisProps {
  empresaData?: any
}

export function BMADAnalysis({ empresaData }: BMADAnalysisProps) {
  const [activeAnalysis, setActiveAnalysis] = useState("business-model")

  // Análisis BMAD para PULSO HORECA
  const bmadAnalysis = {
    businessModel: {
      score: 85,
      strengths: [
        "Modelo SaaS escalable con ingresos recurrentes",
        "Enfoque específico en sector HORECA con alta demanda",
        "Automatización que reduce costos operativos",
        "Múltiples flujos de ingresos (suscripciones, consultoría, integraciones)",
      ],
      weaknesses: [
        "Dependencia de adopción tecnológica del sector",
        "Competencia con soluciones genéricas más baratas",
        "Necesidad de personalización por tipo de negocio",
      ],
      opportunities: [
        "Expansión a otros países de Latinoamérica",
        "Integración con sistemas de punto de venta",
        "Servicios de consultoría especializada",
        "Marketplace de proveedores HORECA",
      ],
      threats: [
        "Entrada de grandes tecnológicas al mercado",
        "Cambios regulatorios en el sector",
        "Crisis económicas que afecten al sector HORECA",
      ],
    },
    marketAnalysis: {
      score: 78,
      marketSize: "2.1B USD",
      growth: "12.5%",
      segments: [
        { name: "Restaurantes", size: 45, growth: 15 },
        { name: "Hoteles", size: 30, growth: 10 },
        { name: "Cafeterías", size: 15, growth: 18 },
        { name: "Catering", size: 10, growth: 22 },
      ],
      competitors: [
        { name: "Toast", marketShare: 25, strength: "POS Integration" },
        { name: "Resy", marketShare: 15, strength: "Reservations" },
        { name: "OpenTable", marketShare: 20, strength: "Brand Recognition" },
        { name: "Local Solutions", marketShare: 40, strength: "Price" },
      ],
    },
    valueProposition: {
      score: 92,
      coreValue: "Automatización inteligente de operaciones HORECA",
      benefits: [
        {
          category: "Eficiencia Operativa",
          impact: "Alto",
          metrics: ["Reducción 40% tiempo en checklists", "Automatización 80% tareas rutinarias"],
        },
        {
          category: "Cumplimiento Normativo",
          impact: "Crítico",
          metrics: ["100% trazabilidad", "Reducción 90% multas sanitarias"],
        },
        {
          category: "Visibilidad y Control",
          impact: "Alto",
          metrics: ["Dashboard tiempo real", "Alertas automáticas", "Reportes inteligentes"],
        },
        {
          category: "Escalabilidad",
          impact: "Medio",
          metrics: ["Soporte multi-sucursal", "Roles granulares", "Integraciones API"],
        },
      ],
    },
    revenueModel: {
      score: 88,
      streams: [
        {
          name: "Suscripciones SaaS",
          percentage: 70,
          growth: "15%",
          predictability: "Alta",
          scalability: "Alta",
        },
        {
          name: "Servicios de Implementación",
          percentage: 15,
          growth: "25%",
          predictability: "Media",
          scalability: "Media",
        },
        {
          name: "Consultoría Especializada",
          percentage: 10,
          growth: "30%",
          predictability: "Baja",
          scalability: "Baja",
        },
        {
          name: "Integraciones Premium",
          percentage: 5,
          growth: "40%",
          predictability: "Media",
          scalability: "Alta",
        },
      ],
      pricing: {
        strategy: "Value-based pricing",
        tiers: ["Básico $299/mes", "Profesional $599/mes", "Empresarial $1,299/mes"],
        churnRate: "5%",
        ltv: "$15,600",
        cac: "$450",
      },
    },
    designThinking: {
      score: 82,
      userPersonas: [
        {
          name: "Gerente de Restaurante",
          painPoints: ["Falta de visibilidad", "Cumplimiento manual", "Múltiples sistemas"],
          needs: ["Dashboard unificado", "Automatización", "Reportes"],
          satisfaction: 85,
        },
        {
          name: "Personal Operativo",
          painPoints: ["Procesos complejos", "Falta de capacitación", "Herramientas obsoletas"],
          needs: ["Interfaz simple", "Guías paso a paso", "Feedback inmediato"],
          satisfaction: 78,
        },
        {
          name: "Propietario de Cadena",
          painPoints: ["Falta de control", "Costos ocultos", "Inconsistencia entre sucursales"],
          needs: ["Visibilidad total", "Estandarización", "ROI claro"],
          satisfaction: 90,
        },
      ],
      journeyMap: {
        awareness: { score: 75, touchpoints: ["Marketing digital", "Referencias", "Eventos"] },
        consideration: { score: 80, touchpoints: ["Demo", "Prueba gratuita", "Casos de éxito"] },
        purchase: { score: 85, touchpoints: ["Onboarding", "Implementación", "Capacitación"] },
        retention: { score: 88, touchpoints: ["Soporte", "Updates", "Consultoría"] },
        advocacy: { score: 82, touchpoints: ["Referencias", "Testimonios", "Casos de estudio"] },
      },
    },
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600"
    if (score >= 80) return "text-blue-600"
    if (score >= 70) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreBadge = (score: number) => {
    if (score >= 90) return "Excelente"
    if (score >= 80) return "Bueno"
    if (score >= 70) return "Regular"
    return "Necesita Mejora"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Análisis BMAD - PULSO HORECA</h1>
        <p className="text-muted-foreground">Business Model Analysis and Design</p>
      </div>

      {/* Score Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {Object.entries(bmadAnalysis).map(([key, analysis]) => (
          <Card key={key}>
            <CardContent className="p-4 text-center">
              <div className={`text-2xl font-bold ${getScoreColor(analysis.score)}`}>{analysis.score}</div>
              <div className="text-sm text-muted-foreground capitalize">{key.replace(/([A-Z])/g, " $1")}</div>
              <Badge variant="outline" className="mt-1">
                {getScoreBadge(analysis.score)}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Analysis */}
      <Tabs value={activeAnalysis} onValueChange={setActiveAnalysis}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="business-model">Modelo de Negocio</TabsTrigger>
          <TabsTrigger value="market">Mercado</TabsTrigger>
          <TabsTrigger value="value">Propuesta de Valor</TabsTrigger>
          <TabsTrigger value="revenue">Ingresos</TabsTrigger>
          <TabsTrigger value="design">Design Thinking</TabsTrigger>
        </TabsList>

        <TabsContent value="business-model" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="mr-2 h-5 w-5" />
                Análisis del Modelo de Negocio
                <Badge className={`ml-2 ${getScoreColor(bmadAnalysis.businessModel.score)}`}>
                  {bmadAnalysis.businessModel.score}/100
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-green-700 mb-2 flex items-center">
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Fortalezas
                    </h4>
                    <ul className="space-y-2">
                      {bmadAnalysis.businessModel.strengths.map((strength, index) => (
                        <li key={index} className="text-sm flex items-start">
                          <Star className="mr-2 h-3 w-3 text-green-500 mt-1 flex-shrink-0" />
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-blue-700 mb-2 flex items-center">
                      <Lightbulb className="mr-2 h-4 w-4" />
                      Oportunidades
                    </h4>
                    <ul className="space-y-2">
                      {bmadAnalysis.businessModel.opportunities.map((opportunity, index) => (
                        <li key={index} className="text-sm flex items-start">
                          <Zap className="mr-2 h-3 w-3 text-blue-500 mt-1 flex-shrink-0" />
                          {opportunity}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-yellow-700 mb-2 flex items-center">
                      <AlertTriangle className="mr-2 h-4 w-4" />
                      Debilidades
                    </h4>
                    <ul className="space-y-2">
                      {bmadAnalysis.businessModel.weaknesses.map((weakness, index) => (
                        <li key={index} className="text-sm flex items-start">
                          <AlertTriangle className="mr-2 h-3 w-3 text-yellow-500 mt-1 flex-shrink-0" />
                          {weakness}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-red-700 mb-2 flex items-center">
                      <Shield className="mr-2 h-4 w-4" />
                      Amenazas
                    </h4>
                    <ul className="space-y-2">
                      {bmadAnalysis.businessModel.threats.map((threat, index) => (
                        <li key={index} className="text-sm flex items-start">
                          <Shield className="mr-2 h-3 w-3 text-red-500 mt-1 flex-shrink-0" />
                          {threat}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="market" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Análisis de Mercado</CardTitle>
                <CardDescription>Tamaño y crecimiento del mercado objetivo</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{bmadAnalysis.marketAnalysis.marketSize}</div>
                  <div className="text-sm text-muted-foreground">Tamaño del mercado</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{bmadAnalysis.marketAnalysis.growth}</div>
                  <div className="text-sm text-muted-foreground">Crecimiento anual</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Segmentos de Mercado</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {bmadAnalysis.marketAnalysis.segments.map((segment, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{segment.name}</span>
                      <span>
                        {segment.size}% • +{segment.growth}%
                      </span>
                    </div>
                    <Progress value={segment.size} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Análisis Competitivo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {bmadAnalysis.marketAnalysis.competitors.map((competitor, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-semibold">{competitor.name}</h4>
                      <Badge variant="outline">{competitor.marketShare}%</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Fortaleza: {competitor.strength}</p>
                    <Progress value={competitor.marketShare} className="h-2 mt-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="value" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Star className="mr-2 h-5 w-5" />
                Propuesta de Valor
                <Badge className={`ml-2 ${getScoreColor(bmadAnalysis.valueProposition.score)}`}>
                  {bmadAnalysis.valueProposition.score}/100
                </Badge>
              </CardTitle>
              <CardDescription>{bmadAnalysis.valueProposition.coreValue}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {bmadAnalysis.valueProposition.benefits.map((benefit, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-semibold">{benefit.category}</h4>
                      <Badge
                        variant={
                          benefit.impact === "Crítico"
                            ? "destructive"
                            : benefit.impact === "Alto"
                              ? "default"
                              : "secondary"
                        }
                      >
                        {benefit.impact}
                      </Badge>
                    </div>
                    <ul className="space-y-1">
                      {benefit.metrics.map((metric, metricIndex) => (
                        <li key={metricIndex} className="text-sm text-muted-foreground flex items-center">
                          <CheckCircle2 className="mr-2 h-3 w-3 text-green-500" />
                          {metric}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="mr-2 h-5 w-5" />
                  Flujos de Ingresos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {bmadAnalysis.revenueModel.streams.map((stream, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{stream.name}</span>
                      <div className="text-right">
                        <div className="font-bold">{stream.percentage}%</div>
                        <div className="text-sm text-green-600">+{stream.growth}</div>
                      </div>
                    </div>
                    <Progress value={stream.percentage} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Predictibilidad: {stream.predictability}</span>
                      <span>Escalabilidad: {stream.scalability}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Métricas Clave</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{bmadAnalysis.revenueModel.pricing.ltv}</div>
                    <div className="text-sm text-muted-foreground">LTV</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{bmadAnalysis.revenueModel.pricing.cac}</div>
                    <div className="text-sm text-muted-foreground">CAC</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">34.7x</div>
                    <div className="text-sm text-muted-foreground">LTV/CAC</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {bmadAnalysis.revenueModel.pricing.churnRate}
                    </div>
                    <div className="text-sm text-muted-foreground">Churn Rate</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold">Planes de Precios</h4>
                  {bmadAnalysis.revenueModel.pricing.tiers.map((tier, index) => (
                    <div key={index} className="p-2 bg-gray-50 rounded text-sm">
                      {tier}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="design" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5" />
                Personas de Usuario
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {bmadAnalysis.designThinking.userPersonas.map((persona, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-semibold">{persona.name}</h4>
                      <div className="flex items-center">
                        <span className="text-sm mr-2">Satisfacción:</span>
                        <Badge variant={persona.satisfaction >= 85 ? "default" : "secondary"}>
                          {persona.satisfaction}%
                        </Badge>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <h5 className="font-medium text-red-700 mb-1">Pain Points</h5>
                        <ul className="space-y-1">
                          {persona.painPoints.map((pain, painIndex) => (
                            <li key={painIndex} className="flex items-start">
                              <AlertTriangle className="mr-1 h-3 w-3 text-red-500 mt-0.5 flex-shrink-0" />
                              {pain}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h5 className="font-medium text-blue-700 mb-1">Necesidades</h5>
                        <ul className="space-y-1">
                          {persona.needs.map((need, needIndex) => (
                            <li key={needIndex} className="flex items-start">
                              <Target className="mr-1 h-3 w-3 text-blue-500 mt-0.5 flex-shrink-0" />
                              {need}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex items-center justify-center">
                        <div className="text-center">
                          <Progress value={persona.satisfaction} className="h-2 w-20 mb-1" />
                          <div className="text-xs text-muted-foreground">Satisfacción</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Customer Journey Map</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(bmadAnalysis.designThinking.journeyMap).map(([stage, data]) => (
                <div key={stage} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium capitalize">{stage.replace(/([A-Z])/g, " $1")}</span>
                    <Badge variant={data.score >= 85 ? "default" : data.score >= 75 ? "secondary" : "outline"}>
                      {data.score}/100
                    </Badge>
                  </div>
                  <Progress value={data.score} className="h-2" />
                  <div className="flex flex-wrap gap-1">
                    {data.touchpoints.map((touchpoint, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {touchpoint}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Lightbulb className="mr-2 h-5 w-5" />
            Recomendaciones Estratégicas BMAD
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <TrendingUp className="h-4 w-4" />
            <AlertTitle>Prioridad Alta</AlertTitle>
            <AlertDescription>
              Implementar programa de partners tecnológicos para acelerar integraciones y reducir tiempo de
              implementación.
            </AlertDescription>
          </Alert>

          <Alert>
            <Users className="h-4 w-4" />
            <AlertTitle>Experiencia de Usuario</AlertTitle>
            <AlertDescription>
              Desarrollar onboarding interactivo con IA para personalizar la configuración inicial según el tipo de
              negocio.
            </AlertDescription>
          </Alert>

          <Alert>
            <DollarSign className="h-4 w-4" />
            <AlertTitle>Modelo de Ingresos</AlertTitle>
            <AlertDescription>
              Introducir tier "Startup" de $99/mes para capturar mercado de pequeños negocios y reducir barrera de
              entrada.
            </AlertDescription>
          </Alert>

          <Alert>
            <BarChart3 className="h-4 w-4" />
            <AlertTitle>Expansión de Mercado</AlertTitle>
            <AlertDescription>
              Desarrollar verticales específicas (hoteles boutique, food trucks, catering) con funcionalidades
              especializadas.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Action Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="mr-2 h-5 w-5" />
            Plan de Acción BMAD - Próximos 90 días
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Mes 1</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center text-sm">
                    <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                    Implementar verificación AI
                  </div>
                  <div className="flex items-center text-sm">
                    <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                    Lanzar tier Startup
                  </div>
                  <div className="flex items-center text-sm">
                    <Clock className="mr-2 h-4 w-4 text-yellow-500" />
                    Programa de partners
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Mes 2</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center text-sm">
                    <Clock className="mr-2 h-4 w-4 text-yellow-500" />
                    Onboarding con IA
                  </div>
                  <div className="flex items-center text-sm">
                    <Clock className="mr-2 h-4 w-4 text-yellow-500" />
                    Verticales especializadas
                  </div>
                  <div className="flex items-center text-sm">
                    <Clock className="mr-2 h-4 w-4 text-yellow-500" />
                    Marketplace proveedores
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Mes 3</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center text-sm">
                    <Clock className="mr-2 h-4 w-4 text-yellow-500" />
                    Expansión internacional
                  </div>
                  <div className="flex items-center text-sm">
                    <Clock className="mr-2 h-4 w-4 text-yellow-500" />
                    Programa de certificación
                  </div>
                  <div className="flex items-center text-sm">
                    <Clock className="mr-2 h-4 w-4 text-yellow-500" />
                    Analytics predictivos
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
