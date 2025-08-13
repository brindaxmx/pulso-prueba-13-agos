"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { RotateCcw, AlertTriangle, CheckCircle, XCircle, Clock, User, Eye, Shield, History } from "lucide-react"

interface RollbackManagerProps {
  rollbacks?: any[]
}

export function RollbackManager({ rollbacks = [] }: RollbackManagerProps) {
  const [selectedRule, setSelectedRule] = useState("")
  const [targetVersion, setTargetVersion] = useState("")
  const [rollbackReason, setRollbackReason] = useState("")
  const [showRollbackDialog, setShowRollbackDialog] = useState(false)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "approved":
        return <Shield className="h-4 w-4 text-blue-500" />
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-50 border-green-200 text-green-800"
      case "pending":
        return "bg-yellow-50 border-yellow-200 text-yellow-800"
      case "approved":
        return "bg-blue-50 border-blue-200 text-blue-800"
      case "rejected":
        return "bg-red-50 border-red-200 text-red-800"
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

  const handleRollback = () => {
    // Aquí iría la lógica para ejecutar el rollback
    console.log("Ejecutando rollback:", {
      rule: selectedRule,
      version: targetVersion,
      reason: rollbackReason,
    })
    setShowRollbackDialog(false)
    // Reset form
    setSelectedRule("")
    setTargetVersion("")
    setRollbackReason("")
  }

  return (
    <div className="space-y-6">
      {/* Nuevo Rollback */}
      <Card className="bg-white/80 backdrop-blur border-white/20 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center">
            <RotateCcw className="mr-2 h-5 w-5 text-orange-500" />
            Solicitar Rollback
          </CardTitle>
          <CardDescription>Revierte una regla a una versión anterior</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="bg-orange-50 border-orange-200">
            <AlertTriangle className="h-4 w-4 text-orange-500" />
            <AlertTitle className="text-orange-800">Precaución</AlertTitle>
            <AlertDescription className="text-orange-700">
              Los rollbacks pueden afectar el funcionamiento de las automatizaciones. Asegúrate de tener una razón
              válida y considera el impacto antes de proceder.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Regla a Revertir</Label>
              <Select value={selectedRule} onValueChange={setSelectedRule}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una regla" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rule-1">Control de Temperaturas</SelectItem>
                  <SelectItem value="rule-2">Limpieza de Cocina</SelectItem>
                  <SelectItem value="rule-3">Inventario Diario</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Versión Objetivo</Label>
              <Select value={targetVersion} onValueChange={setTargetVersion} disabled={!selectedRule}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona versión" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">v2 - Hace 15 días</SelectItem>
                  <SelectItem value="1">v1 - Hace 30 días</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Razón del Rollback</Label>
            <Textarea
              value={rollbackReason}
              onChange={(e) => setRollbackReason(e.target.value)}
              placeholder="Explica por qué necesitas revertir esta regla..."
              rows={3}
            />
          </div>

          <Dialog open={showRollbackDialog} onOpenChange={setShowRollbackDialog}>
            <DialogTrigger asChild>
              <Button
                className="w-full"
                disabled={!selectedRule || !targetVersion || !rollbackReason.trim()}
                variant="destructive"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Solicitar Rollback
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center">
                  <AlertTriangle className="mr-2 h-5 w-5 text-orange-500" />
                  Confirmar Rollback
                </DialogTitle>
                <DialogDescription>
                  Esta acción revertirá la regla a una versión anterior. ¿Estás seguro de que deseas continuar?
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Alert className="bg-red-50 border-red-200">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <AlertDescription className="text-red-700">
                    <strong>Advertencia:</strong> Esta acción no se puede deshacer automáticamente. Tendrás que crear
                    una nueva versión para restaurar los cambios.
                  </AlertDescription>
                </Alert>

                <div className="space-y-2 text-sm">
                  <div>
                    <strong>Regla:</strong> {selectedRule}
                  </div>
                  <div>
                    <strong>Versión objetivo:</strong> v{targetVersion}
                  </div>
                  <div>
                    <strong>Razón:</strong> {rollbackReason}
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button onClick={handleRollback} variant="destructive" className="flex-1">
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Confirmar Rollback
                  </Button>
                  <Button onClick={() => setShowRollbackDialog(false)} variant="outline" className="flex-1">
                    Cancelar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Historial de Rollbacks */}
      <Card className="bg-white/80 backdrop-blur border-white/20 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center">
            <History className="mr-2 h-5 w-5 text-blue-500" />
            Historial de Rollbacks
          </CardTitle>
          <CardDescription>Registro de todas las reversiones realizadas</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-4">
              {rollbacks && rollbacks.length > 0 ? (
                rollbacks.map((rollback) => (
                  <Card
                    key={rollback.id}
                    className={`border-l-4 ${getStatusColor(rollback.status)} hover:shadow-lg transition-all`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            {getStatusIcon(rollback.status)}
                            <Badge variant="outline" className="capitalize">
                              {rollback.status}
                            </Badge>
                            <span className="text-sm text-gray-500">{formatDate(rollback.rolled_back_at)}</span>
                          </div>

                          <h4 className="font-semibold text-gray-900 mb-1">
                            {rollback.sequence_engine_rules?.description || "Regla eliminada"}
                          </h4>

                          <p className="text-sm text-gray-600 mb-2">
                            <strong>Rollback:</strong> v{rollback.from_version} → v{rollback.to_version}
                          </p>

                          <p className="text-sm text-gray-600 mb-3">{rollback.reason}</p>

                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <div className="flex items-center">
                              <User className="mr-1 h-3 w-3" />
                              {rollback.empleados?.nombre || "Usuario desconocido"}
                            </div>
                            <div className="flex items-center">
                              <RotateCcw className="mr-1 h-3 w-3" />
                              Rollback #{rollback.id.slice(-8)}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 ml-4">
                          <Button variant="outline" size="sm">
                            <Eye className="h-3 w-3" />
                          </Button>
                          {rollback.status === "pending" && (
                            <>
                              <Button variant="outline" size="sm" className="text-green-600 bg-transparent">
                                <CheckCircle className="h-3 w-3" />
                              </Button>
                              <Button variant="outline" size="sm" className="text-red-600 bg-transparent">
                                <XCircle className="h-3 w-3" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>

                      {rollback.status === "pending" && (
                        <Alert className="mt-3 bg-yellow-50 border-yellow-200">
                          <Clock className="h-4 w-4 text-yellow-500" />
                          <AlertDescription className="text-yellow-700">
                            Este rollback está pendiente de aprobación. Se requiere autorización de un supervisor.
                          </AlertDescription>
                        </Alert>
                      )}

                      {rollback.status === "rejected" && (
                        <Alert className="mt-3 bg-red-50 border-red-200">
                          <XCircle className="h-4 w-4 text-red-500" />
                          <AlertDescription className="text-red-700">
                            Rollback rechazado. Contacta con tu supervisor para más información.
                          </AlertDescription>
                        </Alert>
                      )}

                      {rollback.status === "completed" && (
                        <Alert className="mt-3 bg-green-50 border-green-200">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <AlertDescription className="text-green-700">
                            Rollback completado exitosamente. La regla ha sido revertida a la versión v
                            {rollback.to_version}.
                          </AlertDescription>
                        </Alert>
                      )}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <RotateCcw className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No hay rollbacks registrados</p>
                  <p className="text-sm text-gray-400 mt-2">Los rollbacks que solicites aparecerán aquí</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Estadísticas de Rollbacks */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-500 to-teal-600 text-white border-0 shadow-xl">
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-8 w-8 mx-auto mb-2" />
            <div className="text-2xl font-bold">{rollbacks?.filter((r) => r.status === "completed").length || 0}</div>
            <div className="text-sm opacity-90">Completados</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500 to-orange-600 text-white border-0 shadow-xl">
          <CardContent className="p-4 text-center">
            <Clock className="h-8 w-8 mx-auto mb-2" />
            <div className="text-2xl font-bold">{rollbacks?.filter((r) => r.status === "pending").length || 0}</div>
            <div className="text-sm opacity-90">Pendientes</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-0 shadow-xl">
          <CardContent className="p-4 text-center">
            <Shield className="h-8 w-8 mx-auto mb-2" />
            <div className="text-2xl font-bold">{rollbacks?.filter((r) => r.status === "approved").length || 0}</div>
            <div className="text-sm opacity-90">Aprobados</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500 to-pink-600 text-white border-0 shadow-xl">
          <CardContent className="p-4 text-center">
            <XCircle className="h-8 w-8 mx-auto mb-2" />
            <div className="text-2xl font-bold">{rollbacks?.filter((r) => r.status === "rejected").length || 0}</div>
            <div className="text-sm opacity-90">Rechazados</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
