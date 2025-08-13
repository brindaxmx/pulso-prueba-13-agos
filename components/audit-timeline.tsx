"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  History,
  User,
  Clock,
  Edit,
  Plus,
  Minus,
  Play,
  Pause,
  Trash2,
  CheckCircle,
  Eye,
  GitCompare,
  Activity,
  FileText,
} from "lucide-react"

interface AuditTimelineProps {
  auditHistory?: any[]
}

export function AuditTimeline({ auditHistory = [] }: AuditTimelineProps) {
  const getActionIcon = (action: string) => {
    switch (action) {
      case "created":
        return <Plus className="h-4 w-4 text-green-500" />
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
        return "bg-green-50 border-green-200"
      case "updated":
        return "bg-blue-50 border-blue-200"
      case "deleted":
        return "bg-red-50 border-red-200"
      case "activated":
        return "bg-green-50 border-green-200"
      case "deactivated":
        return "bg-orange-50 border-orange-200"
      default:
        return "bg-gray-50 border-gray-200"
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

  const getRelativeTime = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return "Hace un momento"
    if (diffInMinutes < 60) return `Hace ${diffInMinutes} minutos`
    if (diffInMinutes < 1440) return `Hace ${Math.floor(diffInMinutes / 60)} horas`
    return `Hace ${Math.floor(diffInMinutes / 1440)} días`
  }

  return (
    <ScrollArea className="h-[700px] pr-4">
      <div className="space-y-4">
        {auditHistory.length > 0 ? (
          auditHistory.map((entry, index) => (
            <div key={entry.id} className="relative">
              {/* Timeline line */}
              {index < auditHistory.length - 1 && (
                <div className="absolute left-6 top-16 w-0.5 h-20 bg-gradient-to-b from-gray-300 to-transparent"></div>
              )}

              <div className="flex items-start space-x-4">
                {/* Timeline dot */}
                <div className="flex-shrink-0 w-12 h-12 bg-white rounded-full border-2 border-gray-200 flex items-center justify-center shadow-sm hover:shadow-md transition-shadow">
                  {getActionIcon(entry.action_type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <Card
                    className={`border-l-4 ${getActionColor(entry.action_type)} hover:shadow-lg transition-all duration-200`}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge variant="outline" className="capitalize font-medium">
                              {entry.action_type}
                            </Badge>
                            <Badge variant="secondary" className="bg-indigo-100 text-indigo-800">
                              v{entry.version_number}
                            </Badge>
                            <span className="text-sm text-gray-500 font-medium">
                              {getRelativeTime(entry.changed_at)}
                            </span>
                          </div>

                          <h4 className="font-semibold text-gray-900 mb-2 text-lg">
                            {entry.rule_description || "Regla sin nombre"}
                          </h4>

                          <p className="text-sm text-gray-600 mb-3 leading-relaxed">{entry.change_summary}</p>

                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <div className="flex items-center bg-gray-100 px-2 py-1 rounded-full">
                              <User className="mr-1 h-3 w-3" />
                              <span className="font-medium">{entry.changed_by_name || "Usuario desconocido"}</span>
                            </div>
                            <div className="flex items-center">
                              <Clock className="mr-1 h-3 w-3" />
                              {formatDate(entry.changed_at)}
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
                          <Button variant="outline" size="sm" className="hover:bg-blue-50 bg-transparent">
                            <Eye className="h-3 w-3" />
                          </Button>
                          {entry.action_type === "updated" && (
                            <Button variant="outline" size="sm" className="hover:bg-purple-50 bg-transparent">
                              <GitCompare className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Mostrar cambios específicos si están disponibles */}
                      {entry.old_data && entry.new_data && (
                        <Alert className="mt-4 bg-blue-50 border-blue-200">
                          <FileText className="h-4 w-4 text-blue-500" />
                          <AlertDescription className="text-blue-700">
                            <details className="cursor-pointer">
                              <summary className="font-medium hover:text-blue-800 transition-colors">
                                Ver detalles del cambio
                              </summary>
                              <div className="mt-3 space-y-3 text-xs">
                                <div className="bg-white rounded-lg p-3 border">
                                  <div className="font-semibold text-red-700 mb-2 flex items-center">
                                    <Minus className="h-3 w-3 mr-1" />
                                    Antes:
                                  </div>
                                  <pre className="bg-red-50 p-2 rounded border overflow-x-auto text-red-800">
                                    {JSON.stringify(entry.old_data, null, 2)}
                                  </pre>
                                </div>
                                <div className="bg-white rounded-lg p-3 border">
                                  <div className="font-semibold text-green-700 mb-2 flex items-center">
                                    <Plus className="h-3 w-3 mr-1" />
                                    Después:
                                  </div>
                                  <pre className="bg-green-50 p-2 rounded border overflow-x-auto text-green-800">
                                    {JSON.stringify(entry.new_data, null, 2)}
                                  </pre>
                                </div>
                              </div>
                            </details>
                          </AlertDescription>
                        </Alert>
                      )}

                      {/* Información adicional para ciertos tipos de cambios */}
                      {entry.action_type === "created" && (
                        <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                          <div className="flex items-center text-green-700">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            <span className="text-sm font-medium">Nueva regla creada y activada</span>
                          </div>
                        </div>
                      )}

                      {entry.action_type === "deactivated" && (
                        <div className="mt-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                          <div className="flex items-center text-orange-700">
                            <Pause className="h-4 w-4 mr-2" />
                            <span className="text-sm font-medium">
                              Regla desactivada - No se ejecutarán automatizaciones
                            </span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-16 text-gray-500">
            <History className="h-16 w-16 mx-auto mb-4 opacity-30" />
            <h3 className="text-lg font-medium mb-2">No hay historial disponible</h3>
            <p className="text-sm text-gray-400">Los cambios en las reglas aparecerán aquí</p>
          </div>
        )}
      </div>
    </ScrollArea>
  )
}
