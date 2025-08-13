import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Users,
  Building2,
  Globe,
  Clock,
  Cog,
  Target,
  Brain,
  MessageSquare,
  Shield,
  TrendingUp,
  Zap,
  CheckCircle,
} from "lucide-react"

export default function SystemOverviewPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-cyan-600 rounded-2xl p-8 text-white">
        <div className="max-w-4xl">
          <h1 className="text-4xl font-bold mb-4">Sistema PULSO HORECA</h1>
          <p className="text-xl text-blue-100 mb-6">
            Plataforma SaaS y Sistema Operativo Empresarial para el sector HoReCa
          </p>
          <div className="flex flex-wrap gap-3">
            <Badge className="bg-white/20 text-white border-0 px-4 py-2">
              <Brain className="w-4 h-4 mr-2" />
              IA Auto-Evolutiva
            </Badge>
            <Badge className="bg-white/20 text-white border-0 px-4 py-2">
              <Shield className="w-4 h-4 mr-2" />
              Compliance Automatizado
            </Badge>
            <Badge className="bg-white/20 text-white border-0 px-4 py-2">
              <MessageSquare className="w-4 h-4 mr-2" />
              WhatsApp Nativo
            </Badge>
            <Badge className="bg-white/20 text-white border-0 px-4 py-2">
              <TrendingUp className="w-4 h-4 mr-2" />
              Modelo de Federación
            </Badge>
          </div>
        </div>
      </div>

      {/* 6W Analysis */}
      <div className="grid gap-8">
        {/* WHO */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Users className="w-6 h-6 text-blue-500" />
              WHO - ¿Para quién es?
            </CardTitle>
            <CardDescription>Empresas del sector HoReCa que buscan digitalización y automatización</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3 text-blue-700">Empresas Objetivo</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Empresas con múltiples sucursales y operaciones físicas</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Franquicias que necesitan estandarización</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Negocios que buscan cumplimiento regulatorio automatizado</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3 text-blue-700">Usuarios del Sistema</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">Personal de Cocina</Badge>
                  <Badge variant="outline">Meseros</Badge>
                  <Badge variant="outline">Gerentes de Sucursal</Badge>
                  <Badge variant="outline">Directores Generales</Badge>
                  <Badge variant="outline">Supervisores</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* WHAT */}
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Cog className="w-6 h-6 text-purple-500" />
              WHAT - ¿Qué es?
            </CardTitle>
            <CardDescription>
              Sistema operativo empresarial que digitaliza y automatiza operaciones HoReCa
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                  </div>
                  <h4 className="font-semibold">Gestión de SOPs</h4>
                </div>
                <p className="text-sm text-gray-600">
                  Digitalización y seguimiento de procedimientos operativos estándar
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <Shield className="w-4 h-4 text-green-600" />
                  </div>
                  <h4 className="font-semibold">Compliance Automatizado</h4>
                </div>
                <p className="text-sm text-gray-600">REPSE, CFDI 4.0, NOMs sin intervención manual</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Building2 className="w-4 h-4 text-purple-600" />
                  </div>
                  <h4 className="font-semibold">Modelo de Federación</h4>
                </div>
                <p className="text-sm text-gray-600">Ecosistema de empresas subsidiarias especializadas</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-green-600" />
                  </div>
                  <h4 className="font-semibold">Integración WhatsApp</h4>
                </div>
                <p className="text-sm text-gray-600">Canal principal de comunicación y ejecución</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Zap className="w-4 h-4 text-blue-600" />
                  </div>
                  <h4 className="font-semibold">Sistema de Diseño UX</h4>
                </div>
                <p className="text-sm text-gray-600">Frontend moderno con dashboards personalizados</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Brain className="w-4 h-4 text-orange-600" />
                  </div>
                  <h4 className="font-semibold">Plataforma Auto-Evolutiva</h4>
                </div>
                <p className="text-sm text-gray-600">IA que analiza, mejora y desarrolla nuevas funcionalidades</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* WHERE */}
        <Card className="border-l-4 border-l-green-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Globe className="w-6 h-6 text-green-500" />
              WHERE - ¿Dónde se implementa?
            </CardTitle>
            <CardDescription>Arquitectura híbrida cloud y edge computing</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h4 className="font-semibold text-green-700 flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  En la Nube (Cloud)
                </h4>
                <div className="space-y-3 pl-6">
                  <div>
                    <p className="font-medium">Backend</p>
                    <p className="text-sm text-gray-600">Servidores centrales en AWS</p>
                  </div>
                  <div>
                    <p className="font-medium">Base de Datos</p>
                    <p className="text-sm text-gray-600">PostgreSQL + Redis</p>
                  </div>
                  <div>
                    <p className="font-medium">Integraciones</p>
                    <p className="text-sm text-gray-600">Twilio, Supabase, Belvo, SAT/IMSS</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-green-700 flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  En el Punto de Operación
                </h4>
                <div className="space-y-3 pl-6">
                  <div>
                    <p className="font-medium">En las Sucursales</p>
                    <p className="text-sm text-gray-600">Restaurantes, hoteles y cafeterías</p>
                  </div>
                  <div>
                    <p className="font-medium">Dispositivos Móviles</p>
                    <p className="text-sm text-gray-600">Interacción vía WhatsApp</p>
                  </div>
                  <div>
                    <p className="font-medium">Hardware Black Box</p>
                    <p className="text-sm text-gray-600">Gateway IoT para sensores</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* WHEN */}
        <Card className="border-l-4 border-l-orange-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Clock className="w-6 h-6 text-orange-500" />
              WHEN - ¿Cuándo se usa?
            </CardTitle>
            <CardDescription>Operación continua 24/7 con patrones específicos de uso</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Zap className="w-6 h-6 text-red-600" />
                </div>
                <h4 className="font-semibold text-red-700 mb-2">En Tiempo Real</h4>
                <p className="text-sm text-red-600">Monitoreo continuo de alertas y temperaturas</p>
              </div>

              <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
                <h4 className="font-semibold text-blue-700 mb-2">Por Evento</h4>
                <p className="text-sm text-blue-600">Cuando se completa SOP o detecta anomalía</p>
              </div>

              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-6 h-6 text-green-600" />
                </div>
                <h4 className="font-semibold text-green-700 mb-2">Programado</h4>
                <p className="text-sm text-green-600">Ejecución basada en horarios y turnos</p>
              </div>

              <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Brain className="w-6 h-6 text-purple-600" />
                </div>
                <h4 className="font-semibold text-purple-700 mb-2">Auto-Evolutivo</h4>
                <p className="text-sm text-purple-600">Análisis y mejoras continuas con IA</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* HOW */}
        <Card className="border-l-4 border-l-cyan-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Cog className="w-6 h-6 text-cyan-500" />
              HOW - ¿Cómo funciona?
            </CardTitle>
            <CardDescription>Arquitectura técnica integrada con flujo de trabajo basado en IA</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold mb-4 text-cyan-700">Arquitectura Técnica</h4>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="bg-blue-50">
                      Frontend
                    </Badge>
                    <span className="text-sm">React, Next.js, shadcn/ui, Tailwind CSS</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="bg-green-50">
                      Backend
                    </Badge>
                    <span className="text-sm">Node.js, Prisma (PostgreSQL)</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="bg-purple-50">
                      Comunicaciones
                    </Badge>
                    <span className="text-sm">WhatsApp Business API (Twilio)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="bg-orange-50">
                      IA
                    </Badge>
                    <span className="text-sm">MCP Protocol + Claude</span>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="font-semibold mb-4 text-cyan-700">Flujo BMAD METHOD</h4>
              <div className="grid md:grid-cols-5 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-sm font-bold text-blue-600">1</span>
                  </div>
                  <h5 className="font-medium text-blue-700 mb-1">Analizar</h5>
                  <p className="text-xs text-blue-600">Agentes IA monitorean datos</p>
                </div>

                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-sm font-bold text-green-600">2</span>
                  </div>
                  <h5 className="font-medium text-green-700 mb-1">Decidir</h5>
                  <p className="text-xs text-green-600">Determina acción necesaria</p>
                </div>

                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-sm font-bold text-purple-600">3</span>
                  </div>
                  <h5 className="font-medium text-purple-700 mb-1">Ejecutar</h5>
                  <p className="text-xs text-purple-600">Tool calls automáticos</p>
                </div>

                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-sm font-bold text-orange-600">4</span>
                  </div>
                  <h5 className="font-medium text-orange-700 mb-1">Comunicar</h5>
                  <p className="text-xs text-orange-600">Notifica vía WhatsApp</p>
                </div>

                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-sm font-bold text-red-600">5</span>
                  </div>
                  <h5 className="font-medium text-red-700 mb-1">Evolucionar</h5>
                  <p className="text-xs text-red-600">Mejora continua</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* WHY */}
        <Card className="border-l-4 border-l-red-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Target className="w-6 h-6 text-red-500" />
              WHY - ¿Por qué existe?
            </CardTitle>
            <CardDescription>Resolver desafíos críticos del sector HoReCa de manera transformadora</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-5 h-5 text-red-600" />
                  <h4 className="font-semibold text-red-700">Eliminar Incumplimiento</h4>
                </div>
                <p className="text-sm text-red-600">Automatizar cumplimiento normativo para evitar multas y cierres</p>
              </div>

              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <h4 className="font-semibold text-green-700">Garantizar Calidad</h4>
                </div>
                <p className="text-sm text-green-600">Asegurar procesos críticos y proteger la salud de clientes</p>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-3">
                  <Cog className="w-5 h-5 text-blue-600" />
                  <h4 className="font-semibold text-blue-700">Reducir Complejidad</h4>
                </div>
                <p className="text-sm text-blue-600">Unificar procesos manuales en una plataforma digital</p>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  <h4 className="font-semibold text-purple-700">Escalar Inteligentemente</h4>
                </div>
                <p className="text-sm text-purple-600">Modelo de federación para servicios especializados</p>
              </div>

              <div className="p-4 bg-orange-50 rounded-lg border border-orange-200 md:col-span-2 lg:col-span-1">
                <div className="flex items-center gap-2 mb-3">
                  <Brain className="w-5 h-5 text-orange-600" />
                  <h4 className="font-semibold text-orange-700">Sistema Auto-Evolutivo</h4>
                </div>
                <p className="text-sm text-orange-600">
                  Plataforma que aprende, evoluciona y se optimiza continuamente
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Executive Summary */}
        <Card className="bg-gradient-to-br from-gray-50 to-blue-50 border-2 border-blue-200">
          <CardHeader>
            <CardTitle className="text-2xl text-center text-blue-800">Resumen Ejecutivo</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-lg text-gray-700 leading-relaxed">
              Pulso representa una <strong className="text-blue-700">evolución paradigmática</strong> en la gestión
              empresarial del sector HoReCa, transformando operaciones tradicionales en un{" "}
              <strong className="text-purple-700">ecosistema digital inteligente</strong> que no solo automatiza
              procesos, sino que{" "}
              <strong className="text-green-700">aprende, evoluciona y se optimiza continuamente</strong>.
            </p>
            <p className="text-gray-600">
              La plataforma combina <strong>tecnología de vanguardia</strong> con{" "}
              <strong>inteligencia artificial avanzada</strong> para crear un sistema que trasciende las limitaciones de
              los software tradicionales, convirtiéndose en un verdadero
              <strong className="text-orange-600"> compañero digital</strong> que impulsa el crecimiento sostenible y el
              cumplimiento regulatorio automatizado.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
