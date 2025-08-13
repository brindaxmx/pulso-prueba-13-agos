"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert as AlertComponent, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  MessageSquare,
  Eye,
  MoreVertical,
  Thermometer,
  Package,
  Sparkles,
  Trophy,
  RefreshCw,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface SOPExecution {
  id: string
  sop_name: string
  employee_name: string
  employee_avatar?: string
  status: "pending" | "in_progress" | "completed" | "overdue"
  progress: number
  total_steps: number
  completed_steps: number
  estimated_time: number
  elapsed_time: number
  priority: "low" | "medium" | "high" | "critical"
  branch: string
  type: string
}

interface DashboardAlert {
  id: string
  type: "temperature" | "inventory" | "sop_overdue" | "maintenance"
  level: 1 | 2 | 3
  title: string
  message: string
  timestamp: string
  employee?: string
  resolved: boolean
}

export function RealTimeDashboard() {
  const [sops, setSOPs] = useState<SOPExecution[]>([])
  const [alerts, setAlerts] = useState<DashboardAlert[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  // Simular datos en tiempo real
  useEffect(() => {
    // Datos iniciales
    setSOPs([
      {
        id: "1",
        sop_name: "Control de Temperaturas",
        employee_name: "Juan Pérez",
        status: "in_progress",
        progress: 75,
        total_steps: 4,
        completed_steps: 3,
        estimated_time: 10,
        elapsed_time: 8,
        priority: "critical",
        branch: "Sucursal Centro",
        type: "temperature",
      },
      {
        id: "2",
        sop_name: "Inventario Crítico",
        employee_name: "Ana Gómez",
        status: "overdue",
        progress: 0,
        total_steps: 4,
        completed_steps: 0,
        estimated_time: 15,
        elapsed_time: 20,
        priority: "critical",
        branch: "Sucursal Centro",
        type: "inventory",
      },
      {
        id: "3",
        sop_name: "Limpieza Rápida",
        employee_name: "María López",
        status: "completed",
        progress: 100,
        total_steps: 3,
        completed_steps: 3,
        estimated_time: 20,
        elapsed_time: 18,
        priority: "medium",
        branch: "Sucursal Centro",
        type: "cleaning",
      },
    ])

    setAlerts([
      {
        id: "1",
        type: "temperature",
        level: 3,
        title: "Temperatura Crítica",
        message: "Refrigerador principal: 8.5°C detectado",
        timestamp: "5 min",
        employee: "Juan Pérez",
        resolved: false,
      },
      {
        id: "2",
        type: "inventory",
        level: 2,
        title: "Stock Crítico",
        message: "Carne Molida: Solo 2kg restantes",
        timestamp: "12 min",
        employee: "Ana Gómez",
        resolved: false,
      },
      {
        id: "3",
        type: "sop_overdue",
        level: 1,
        title: "SOP Completado",
        message: "Limpieza finalizada con calificación A+",
        timestamp: "1 hora",
        employee: "María López",
        resolved: true,
      },
    ])

    setIsConnected(true)

    // Simular actualizaciones en tiempo real
    const interval = setInterval(() => {
      setLastUpdate(new Date())

      // Actualizar progreso de SOPs
      setSOPs((prev) =>
        prev.map((sop) => {
          if (sop.status === "in_progress" && Math.random() > 0.7) {
            const newProgress = Math.min(sop.progress + 5, 100)
            const newCompletedSteps = Math.floor((newProgress / 100) * sop.total_steps)

            return {
              ...sop,
              progress: newProgress,
              completed_steps: newCompletedSteps,
              elapsed_time: sop.elapsed_time + 1,
              status: newProgress === 100 ? "completed" : "in_progress",
            }
          }
          return sop
        }),
      )
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const getSOPIcon = (type: string) => {
    switch (type) {
      case "temperature":
        return Thermometer
      case "inventory":
        return Package
      case "cleaning":
        return Sparkles
      default:
        return CheckCircle
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600"
      case "in_progress":
        return "text-blue-600"
      case "overdue":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "temperature":
        return Thermometer
      case "inventory":
        return Package
      case "maintenance":
        return AlertTriangle
      default:
        return AlertTriangle
    }
  }

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
          <span className="text-sm text-gray-600">{isConnected ? "Conectado en tiempo real" : "Desconectado"}</span>
          <span className="text-xs text-gray-400">Última actualización: {lastUpdate.toLocaleTimeString()}</span>
        </div>

        <Button variant="outline" size="sm" onClick={() => setLastUpdate(new Date())}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Actualizar
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* SOPs en Tiempo Real - 2 columnas */}
        <Card className="col-span-2 bg-white/80 backdrop-blur border-white/20 shadow-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold">SOPs en Tiempo Real</CardTitle>
                <CardDescription>Monitoreo activo de procedimientos</CardDescription>
              </div>

              <div className="flex items-center space-x-2">
                <Badge className="bg-blue-500/20 text-blue-700">
                  {sops.filter((s) => s.status === "in_progress").length} activos
                </Badge>
                <Badge className="bg-red-500/20 text-red-700 animate-pulse">
                  {sops.filter((s) => s.status === "overdue").length} vencidos
                </Badge>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-4">
                {sops.map((sop) => {
                  const IconComponent = getSOPIcon(sop.type)
                  const isOverdue = sop.status === "overdue"
                  const isCompleted = sop.status === "completed"
                  const isInProgress = sop.status === "in_progress"

                  return (
                    <div
                      key={sop.id}
                      className={`p-4 rounded-xl border transition-all ${
                        isOverdue
                          ? "bg-gradient-to-r from-red-500/5 to-red-500/5 border-red-200 animate-pulse"
                          : isCompleted
                            ? "bg-gradient-to-r from-green-500/5 to-green-500/5 border-green-200"
                            : "bg-gradient-to-r from-blue-500/5 to-blue-500/5 border-blue-200"
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <Avatar
                            className={`h-12 w-12 ring-2 ${
                              isOverdue ? "ring-red-500/50" : isCompleted ? "ring-green-500/30" : "ring-blue-500/30"
                            }`}
                          >
                            <AvatarFallback
                              className={`${
                                isOverdue
                                  ? "bg-gradient-to-br from-red-500 to-pink-600"
                                  : isCompleted
                                    ? "bg-gradient-to-br from-green-500 to-emerald-600"
                                    : "bg-gradient-to-br from-blue-500 to-purple-500"
                              } text-white`}
                            >
                              {sop.employee_name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>

                          <div
                            className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center ${
                              isOverdue ? "bg-red-500" : isCompleted ? "bg-green-500" : "bg-blue-500"
                            }`}
                          >
                            {isOverdue && <AlertTriangle className="h-2 w-2 text-white" />}
                            {isCompleted && <CheckCircle className="h-2 w-2 text-white" />}
                            {isInProgress && <div className="w-2 h-2 bg-white rounded-full animate-pulse" />}
                          </div>
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <IconComponent
                              className={`h-5 w-5 ${
                                isOverdue ? "text-red-500" : isCompleted ? "text-green-500" : "text-blue-500"
                              }`}
                            />
                            <span className="font-semibold">{sop.sop_name}</span>
                            <Badge
                              className={
                                isOverdue
                                  ? "bg-red-100 text-red-800 animate-pulse"
                                  : isCompleted
                                    ? "bg-green-100 text-green-800"
                                    : "bg-blue-100 text-blue-800"
                              }
                            >
                              {isOverdue ? "¡VENCIDO!" : isCompleted ? "✨ COMPLETADO" : "En Progreso"}
                            </Badge>
                          </div>

                          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                            <span>{sop.employee_name}</span>
                            <span>•</span>
                            <span>{sop.branch}</span>
                            <span>•</span>
                            <span className={isOverdue ? "text-red-600 font-medium" : ""}>
                              {isOverdue
                                ? `${sop.elapsed_time - sop.estimated_time} min vencido`
                                : `${sop.elapsed_time} min transcurridos`}
                            </span>
                          </div>

                          {!isCompleted && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="font-medium">Progreso</span>
                                <span className="text-gray-500">
                                  {sop.completed_steps}/{sop.total_steps} pasos
                                </span>
                              </div>
                              <Progress
                                value={sop.progress}
                                className={`h-2 ${isOverdue ? "bg-red-100" : "bg-blue-100"}`}
                              />
                            </div>
                          )}

                          {isCompleted && (
                            <div className="flex items-center space-x-4 text-sm text-green-600 mt-2">
                              <div className="flex items-center space-x-1">
                                <Trophy className="h-4 w-4" />
                                <span>95% calidad</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Clock className="h-4 w-4" />
                                <span>Completado en {sop.elapsed_time} min</span>
                              </div>
                            </div>
                          )}
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              Ver detalles
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <MessageSquare className="mr-2 h-4 w-4" />
                              Enviar mensaje
                            </DropdownMenuItem>
                            {isOverdue && (
                              <DropdownMenuItem className="text-red-600">
                                <AlertTriangle className="mr-2 h-4 w-4" />
                                Escalar
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Alertas en Tiempo Real - 1 columna */}
        <Card className="bg-white/80 backdrop-blur border-white/20 shadow-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">Alertas en Vivo</CardTitle>
              <Badge className="bg-red-100 text-red-800 animate-pulse">
                {alerts.filter((a) => !a.resolved).length} activas
              </Badge>
            </div>
          </CardHeader>

          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-4">
                {alerts.map((alert) => {
                  const IconComponent = getAlertIcon(alert.type)
                  const isResolved = alert.resolved
                  const isCritical = alert.level === 3

                  return (
                    <AlertComponent
                      key={alert.id}
                      className={`${
                        isResolved
                          ? "border-green-200 bg-green-50/80"
                          : isCritical
                            ? "border-red-200 bg-red-50/80 animate-pulse"
                            : "border-orange-200 bg-orange-50/80"
                      } relative`}
                    >
                      {isCritical && !isResolved && (
                        <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-transparent animate-pulse rounded-lg"></div>
                      )}

                      <IconComponent
                        className={`h-4 w-4 ${
                          isResolved ? "text-green-500" : isCritical ? "text-red-500" : "text-orange-500"
                        }`}
                      />

                      <div className="relative">
                        <AlertTitle
                          className={isResolved ? "text-green-800" : isCritical ? "text-red-800" : "text-orange-800"}
                        >
                          {alert.title}
                        </AlertTitle>
                        <AlertDescription
                          className={`${
                            isResolved ? "text-green-700" : isCritical ? "text-red-700" : "text-orange-700"
                          } mb-3`}
                        >
                          {alert.message}
                          <div className="text-xs mt-1">
                            Hace {alert.timestamp} • {alert.employee}
                          </div>
                        </AlertDescription>

                        {!isResolved && (
                          <Button
                            size="sm"
                            className={
                              isCritical
                                ? "bg-red-500 hover:bg-red-600 text-white"
                                : "bg-orange-500 hover:bg-orange-600 text-white"
                            }
                          >
                            Resolver Ahora
                          </Button>
                        )}
                      </div>
                    </AlertComponent>
                  )
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
