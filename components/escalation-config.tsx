"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Bell,
  MessageSquare,
  Mail,
  Phone,
  Smartphone,
  Clock,
  AlertTriangle,
  Save,
  TestTube,
  Plus,
  Minus,
  ChevronRight,
} from "lucide-react"

interface EscalationLevel {
  level: number
  afterMinutes: number
  notifyRoles: string[]
  channels: string[]
  message: string
  enabled: boolean
}

interface EscalationConfigProps {
  sopId?: string
  onSave?: (config: EscalationLevel[]) => void
  initialConfig?: EscalationLevel[]
}

export function EscalationConfig({ sopId, onSave, initialConfig }: EscalationConfigProps) {
  const [levels, setLevels] = useState<EscalationLevel[]>(
    initialConfig || [
      {
        level: 1,
        afterMinutes: 5,
        notifyRoles: ["empleado_asignado"],
        channels: ["whatsapp"],
        message: "⏰ ¡Recuerda completar tu SOP! {nombre_sop}",
        enabled: true,
      },
      {
        level: 2,
        afterMinutes: 15,
        notifyRoles: ["supervisor", "gerente_sucursal"],
        channels: ["whatsapp", "email"],
        message: "⚠️ El SOP '{nombre_sop}' aún no se ha completado. Asignado a ti.",
        enabled: true,
      },
      {
        level: 3,
        afterMinutes: 30,
        notifyRoles: ["gerente_general", "gerente_regional"],
        channels: ["whatsapp", "email", "phone"],
        message:
          "🚨 URGENTE: SOP '{nombre_sop}' pendiente en {sucursal_name}. No se ha completado tras {minutos} minutos.",
        enabled: true,
      },
    ],
  )

  const availableRoles = [
    { key: "empleado_asignado", label: "Empleado Asignado" },
    { key: "supervisor", label: "Supervisor" },
    { key: "gerente_sucursal", label: "Gerente de Sucursal" },
    { key: "gerente_regional", label: "Gerente Regional" },
    { key: "gerente_general", label: "Gerente General" },
    { key: "mantenimiento", label: "Mantenimiento" },
    { key: "compras_team", label: "Equipo de Compras" },
  ]

  const availableChannels = [
    { key: "whatsapp", label: "WhatsApp", icon: MessageSquare },
    { key: "email", label: "Email", icon: Mail },
    { key: "sms", label: "SMS", icon: Smartphone },
    { key: "phone", label: "Llamada", icon: Phone },
  ]

  const updateLevel = (levelIndex: number, field: keyof EscalationLevel, value: any) => {
    const newLevels = [...levels]
    newLevels[levelIndex] = { ...newLevels[levelIndex], [field]: value }
    setLevels(newLevels)
  }

  const toggleRole = (levelIndex: number, role: string) => {
    const level = levels[levelIndex]
    const newRoles = level.notifyRoles.includes(role)
      ? level.notifyRoles.filter((r) => r !== role)
      : [...level.notifyRoles, role]
    updateLevel(levelIndex, "notifyRoles", newRoles)
  }

  const toggleChannel = (levelIndex: number, channel: string) => {
    const level = levels[levelIndex]
    const newChannels = level.channels.includes(channel)
      ? level.channels.filter((c) => c !== channel)
      : [...level.channels, channel]
    updateLevel(levelIndex, "channels", newChannels)
  }

  const addLevel = () => {
    const newLevel: EscalationLevel = {
      level: levels.length + 1,
      afterMinutes: 60,
      notifyRoles: [],
      channels: ["whatsapp"],
      message: "",
      enabled: true,
    }
    setLevels([...levels, newLevel])
  }

  const removeLevel = (levelIndex: number) => {
    if (levels.length > 1) {
      setLevels(levels.filter((_, i) => i !== levelIndex))
    }
  }

  const handleSave = () => {
    onSave?.(levels)
  }

  const getLevelColor = (level: number) => {
    switch (level) {
      case 1:
        return "yellow"
      case 2:
        return "orange"
      case 3:
        return "red"
      default:
        return "gray"
    }
  }

  const getLevelBgClass = (level: number) => {
    switch (level) {
      case 1:
        return "bg-yellow-50 border-yellow-200"
      case 2:
        return "bg-orange-50 border-orange-200"
      case 3:
        return "bg-red-50 border-red-200"
      default:
        return "bg-gray-50 border-gray-200"
    }
  }

  const getLevelTextClass = (level: number) => {
    switch (level) {
      case 1:
        return "text-yellow-800"
      case 2:
        return "text-orange-800"
      case 3:
        return "text-red-800"
      default:
        return "text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white/80 backdrop-blur border-white/20 shadow-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Bell className="mr-2 h-5 w-5 text-orange-500" />
                Configuración de Escalación
              </CardTitle>
              <CardDescription>Define los niveles de escalación para alertas no resueltas</CardDescription>
            </div>
            <Button onClick={addLevel} variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Agregar Nivel
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {levels.map((level, index) => (
            <div key={level.level} className={`space-y-4 p-6 rounded-lg border ${getLevelBgClass(level.level)}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                      level.level === 1
                        ? "bg-yellow-500"
                        : level.level === 2
                          ? "bg-orange-500"
                          : level.level === 3
                            ? "bg-red-500"
                            : "bg-gray-500"
                    }`}
                  >
                    {level.level}
                  </div>
                  <div>
                    <h4 className={`font-semibold ${getLevelTextClass(level.level)}`}>
                      Nivel {level.level} -{" "}
                      {level.level === 1
                        ? "Recordatorio"
                        : level.level === 2
                          ? "Escalación"
                          : level.level === 3
                            ? "Crítico"
                            : "Personalizado"}
                    </h4>
                    <p className="text-sm text-gray-600">Se ejecuta después de {level.afterMinutes} minutos</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={level.enabled}
                    onCheckedChange={(checked) => updateLevel(index, "enabled", checked)}
                  />
                  {levels.length > 1 && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => removeLevel(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label>Tiempo de espera (minutos)</Label>
                    <Input
                      type="number"
                      value={level.afterMinutes}
                      onChange={(e) => updateLevel(index, "afterMinutes", Number.parseInt(e.target.value))}
                      className="bg-white"
                      min="1"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Notificar a</Label>
                    <div className="space-y-2">
                      {availableRoles.map((role) => (
                        <div key={role.key} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`role-${level.level}-${role.key}`}
                            checked={level.notifyRoles.includes(role.key)}
                            onChange={() => toggleRole(index, role.key)}
                            className="rounded"
                          />
                          <Label htmlFor={`role-${level.level}-${role.key}`} className="text-sm">
                            {role.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label>Canales de Notificación</Label>
                    <div className="space-y-2">
                      {availableChannels.map((channel) => {
                        const IconComponent = channel.icon
                        return (
                          <div key={channel.key} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`channel-${level.level}-${channel.key}`}
                              checked={level.channels.includes(channel.key)}
                              onChange={() => toggleChannel(index, channel.key)}
                              className="rounded"
                            />
                            <Label
                              htmlFor={`channel-${level.level}-${channel.key}`}
                              className="flex items-center text-sm"
                            >
                              <IconComponent className="mr-2 h-3 w-3" />
                              {channel.label}
                            </Label>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Variables disponibles</Label>
                    <div className="text-xs text-gray-500 space-y-1">
                      <div>
                        <code>{"{nombre_sop}"}</code> - Nombre del SOP
                      </div>
                      <div>
                        <code>{"{sucursal_name}"}</code> - Nombre de la sucursal
                      </div>
                      <div>
                        <code>{"{minutos}"}</code> - Minutos transcurridos
                      </div>
                      <div>
                        <code>{"{empleado_nombre}"}</code> - Nombre del empleado
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Mensaje de Notificación</Label>
                <Textarea
                  value={level.message}
                  onChange={(e) => updateLevel(index, "message", e.target.value)}
                  placeholder="Escribe el mensaje que se enviará..."
                  rows={3}
                  className="bg-white"
                />
              </div>
            </div>
          ))}

          <div className="flex space-x-2 pt-4">
            <Button onClick={handleSave} className="flex-1">
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
            <Clock className="mr-2 h-5 w-5 text-blue-500" />
            Vista Previa del Flujo
          </CardTitle>
          <CardDescription>Visualiza cómo se ejecutará la escalación paso a paso</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {levels
              .filter((level) => level.enabled)
              .map((level, index) => (
                <div key={level.level}>
                  <div className="flex items-center space-x-4 p-4 rounded-lg border bg-white/50">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                        level.level === 1
                          ? "bg-yellow-500"
                          : level.level === 2
                            ? "bg-orange-500"
                            : level.level === 3
                              ? "bg-red-500"
                              : "bg-gray-500"
                      }`}
                    >
                      {level.level}
                    </div>

                    <div className="flex-1">
                      <div className={`font-medium ${getLevelTextClass(level.level)}`}>
                        {level.afterMinutes} minutos después
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        {level.channels
                          .map((channel) => {
                            const channelInfo = availableChannels.find((c) => c.key === channel)
                            return channelInfo?.label
                          })
                          .join(" + ")}{" "}
                        →{" "}
                        {level.notifyRoles
                          .map((role) => {
                            const roleInfo = availableRoles.find((r) => r.key === role)
                            return roleInfo?.label
                          })
                          .join(", ")}
                      </div>
                      <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded border">"{level.message}"</div>
                    </div>

                    <div className="flex space-x-1">
                      {level.channels.map((channel) => {
                        const channelInfo = availableChannels.find((c) => c.key === channel)
                        if (!channelInfo) return null
                        const IconComponent = channelInfo.icon
                        return (
                          <IconComponent
                            key={channel}
                            className={`h-4 w-4 ${
                              level.level === 1
                                ? "text-yellow-500"
                                : level.level === 2
                                  ? "text-orange-500"
                                  : level.level === 3
                                    ? "text-red-500"
                                    : "text-gray-500"
                            }`}
                          />
                        )
                      })}
                    </div>
                  </div>

                  {index < levels.filter((l) => l.enabled).length - 1 && (
                    <div className="flex items-center justify-center py-2">
                      <ChevronRight className="h-5 w-5 text-gray-400 rotate-90" />
                    </div>
                  )}
                </div>
              ))}
          </div>

          {levels.filter((l) => l.enabled).length === 0 && (
            <Alert className="bg-yellow-50 border-yellow-200">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <AlertDescription className="text-yellow-700">
                No hay niveles de escalación habilitados. Habilita al menos un nivel para que funcione la escalación.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
