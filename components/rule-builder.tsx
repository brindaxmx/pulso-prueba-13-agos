"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Clock,
  Target,
  Users,
  Plus,
  Minus,
  AlertTriangle,
  Save,
  TestTube,
  Eye,
  Calendar,
  Package,
  Thermometer,
  DollarSign,
} from "lucide-react"

interface RuleBuilderProps {
  onSave?: (rule: any) => void
  initialRule?: any
}

export function RuleBuilder({ onSave, initialRule }: RuleBuilderProps) {
  const [ruleType, setRuleType] = useState(initialRule?.type || "")
  const [description, setDescription] = useState(initialRule?.description || "")
  const [priority, setPriority] = useState(initialRule?.priority || "medium")
  const [active, setActive] = useState(initialRule?.active ?? true)
  const [triggerTimes, setTriggerTimes] = useState(initialRule?.trigger_time || [""])
  const [selectedDays, setSelectedDays] = useState(initialRule?.days || [])
  const [assignedRoles, setAssignedRoles] = useState(initialRule?.assign_to || [])
  const [condition, setCondition] = useState(initialRule?.condition || {})

  const days = [
    { key: "lunes", label: "Lun" },
    { key: "martes", label: "Mar" },
    { key: "miércoles", label: "Mié" },
    { key: "jueves", label: "Jue" },
    { key: "viernes", label: "Vie" },
    { key: "sábado", label: "Sáb" },
    { key: "domingo", label: "Dom" },
  ]

  const roles = [
    { key: "cocinero", label: "Cocinero" },
    { key: "mesero", label: "Mesero" },
    { key: "personal_limpieza", label: "Personal de Limpieza" },
    { key: "cajero", label: "Cajero" },
    { key: "almacenista", label: "Almacenista" },
    { key: "gerente_sucursal", label: "Gerente de Sucursal" },
  ]

  const addTriggerTime = () => {
    setTriggerTimes([...triggerTimes, ""])
  }

  const removeTriggerTime = (index: number) => {
    setTriggerTimes(triggerTimes.filter((_, i) => i !== index))
  }

  const updateTriggerTime = (index: number, value: string) => {
    const newTimes = [...triggerTimes]
    newTimes[index] = value
    setTriggerTimes(newTimes)
  }

  const toggleDay = (day: string) => {
    setSelectedDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]))
  }

  const toggleRole = (role: string) => {
    setAssignedRoles((prev) => (prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]))
  }

  const handleSave = () => {
    const rule = {
      type: ruleType,
      description,
      priority,
      active,
      trigger_time: ruleType === "time_based" ? triggerTimes.filter((t) => t) : null,
      days: ruleType === "time_based" ? selectedDays : null,
      assign_to: assignedRoles,
      condition: ruleType === "event_based" ? condition : null,
    }

    onSave?.(rule)
  }

  const renderTypeSpecificConfig = () => {
    switch (ruleType) {
      case "time_based":
        return (
          <div className="space-y-4">
            <div className="space-y-3">
              <Label className="flex items-center">
                <Clock className="mr-2 h-4 w-4" />
                Horarios de Ejecución
              </Label>
              {triggerTimes.map((time, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Input
                    type="time"
                    value={time}
                    onChange={(e) => updateTriggerTime(index, e.target.value)}
                    className="flex-1"
                  />
                  {triggerTimes.length > 1 && (
                    <Button variant="outline" size="icon" onClick={() => removeTriggerTime(index)}>
                      <Minus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button variant="outline" onClick={addTriggerTime} className="w-full bg-transparent">
                <Plus className="mr-2 h-4 w-4" />
                Agregar Horario
              </Button>
            </div>

            <div className="space-y-3">
              <Label className="flex items-center">
                <Calendar className="mr-2 h-4 w-4" />
                Días de la Semana
              </Label>
              <div className="grid grid-cols-4 gap-2">
                {days.map((day) => (
                  <div key={day.key} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`day-${day.key}`}
                      checked={selectedDays.includes(day.key)}
                      onChange={() => toggleDay(day.key)}
                      className="rounded"
                    />
                    <Label htmlFor={`day-${day.key}`} className="text-sm">
                      {day.label}
                    </Label>
                  </div>
                ))}
              </div>
              <Button variant="outline" size="sm" onClick={() => setSelectedDays(days.map((d) => d.key))}>
                Seleccionar Todos
              </Button>
            </div>
          </div>
        )

      case "event_based":
        return (
          <div className="space-y-4">
            <Label className="flex items-center">
              <Target className="mr-2 h-4 w-4" />
              Configuración de Evento
            </Label>

            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Tipo de Evento</Label>
                <Select value={condition.type} onValueChange={(value) => setCondition({ ...condition, type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el tipo de evento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="threshold_met">
                      <div className="flex items-center">
                        <Package className="mr-2 h-4 w-4" />
                        Umbral de Inventario
                      </div>
                    </SelectItem>
                    <SelectItem value="temperature_alert">
                      <div className="flex items-center">
                        <Thermometer className="mr-2 h-4 w-4" />
                        Alerta de Temperatura
                      </div>
                    </SelectItem>
                    <SelectItem value="sales_target">
                      <div className="flex items-center">
                        <DollarSign className="mr-2 h-4 w-4" />
                        Meta de Ventas
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {condition.type === "threshold_met" && (
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label>Producto</Label>
                    <Select
                      value={condition.parameters?.item}
                      onValueChange={(value) =>
                        setCondition({
                          ...condition,
                          parameters: { ...condition.parameters, item: value },
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Producto" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="carne_molida">Carne Molida</SelectItem>
                        <SelectItem value="queso_oaxaca">Queso Oaxaca</SelectItem>
                        <SelectItem value="cafe_grano">Café en Grano</SelectItem>
                        <SelectItem value="tortillas">Tortillas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Operador</Label>
                    <Select
                      value={condition.parameters?.operator}
                      onValueChange={(value) =>
                        setCondition({
                          ...condition,
                          parameters: { ...condition.parameters, operator: value },
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Operador" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="<">Menor que (&lt;)</SelectItem>
                        <SelectItem value="<=">Menor o igual (≤)</SelectItem>
                        <SelectItem value=">">Mayor que (&gt;)</SelectItem>
                        <SelectItem value=">=">Mayor o igual (≥)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Valor</Label>
                    <Input
                      type="number"
                      placeholder="5"
                      value={condition.parameters?.value || ""}
                      onChange={(e) =>
                        setCondition({
                          ...condition,
                          parameters: { ...condition.parameters, value: Number.parseFloat(e.target.value) },
                        })
                      }
                    />
                  </div>
                </div>
              )}

              {condition.type === "temperature_alert" && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Temperatura Mínima (°C)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="-2"
                      value={condition.parameters?.min_temp || ""}
                      onChange={(e) =>
                        setCondition({
                          ...condition,
                          parameters: { ...condition.parameters, min_temp: Number.parseFloat(e.target.value) },
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Temperatura Máxima (°C)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="4"
                      value={condition.parameters?.max_temp || ""}
                      onChange={(e) =>
                        setCondition({
                          ...condition,
                          parameters: { ...condition.parameters, max_temp: Number.parseFloat(e.target.value) },
                        })
                      }
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )

      case "shift_based":
        return (
          <div className="space-y-4">
            <Label className="flex items-center">
              <Users className="mr-2 h-4 w-4" />
              Configuración de Turno
            </Label>

            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Turnos</Label>
                <div className="space-y-2">
                  {["matutino", "vespertino", "nocturno"].map((shift) => (
                    <div key={shift} className="flex items-center space-x-2">
                      <input type="checkbox" id={`shift-${shift}`} className="rounded" />
                      <Label htmlFor={`shift-${shift}`} className="capitalize">
                        {shift}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Momento de Ejecución</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona cuándo ejecutar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="shift_start">Al inicio del turno</SelectItem>
                    <SelectItem value="shift_end">Al final del turno</SelectItem>
                    <SelectItem value="shift_middle">A la mitad del turno</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )

      default:
        return (
          <Alert className="bg-blue-50 border-blue-200">
            <AlertTriangle className="h-4 w-4 text-blue-500" />
            <AlertDescription className="text-blue-700">
              Selecciona un tipo de regla para configurar los parámetros específicos.
            </AlertDescription>
          </Alert>
        )
    }
  }

  return (
    <Card className="bg-white/80 backdrop-blur border-white/20 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Plus className="mr-2 h-5 w-5 text-green-500" />
          Constructor de Reglas
        </CardTitle>
        <CardDescription>Configura una nueva regla de automatización paso a paso</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Información Básica */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Información Básica</h4>

          <div className="space-y-2">
            <Label htmlFor="rule-type">Tipo de Regla</Label>
            <Select value={ruleType} onValueChange={setRuleType}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona el tipo de regla" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="time_based">
                  <div className="flex items-center">
                    <Clock className="mr-2 h-4 w-4" />
                    Basada en Tiempo
                  </div>
                </SelectItem>
                <SelectItem value="event_based">
                  <div className="flex items-center">
                    <Target className="mr-2 h-4 w-4" />
                    Basada en Evento
                  </div>
                </SelectItem>
                <SelectItem value="shift_based">
                  <div className="flex items-center">
                    <Users className="mr-2 h-4 w-4" />
                    Basada en Turno
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              placeholder="Describe qué hace esta regla y cuándo se ejecuta..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Prioridad</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="critical">
                    <Badge variant="destructive">Crítica</Badge>
                  </SelectItem>
                  <SelectItem value="high">
                    <Badge variant="default">Alta</Badge>
                  </SelectItem>
                  <SelectItem value="medium">
                    <Badge variant="secondary">Media</Badge>
                  </SelectItem>
                  <SelectItem value="low">
                    <Badge variant="outline">Baja</Badge>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sop">SOP a Ejecutar</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un SOP" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sop-temp-001">Control de Temperaturas</SelectItem>
                  <SelectItem value="sop-limpieza-001">Limpieza Rápida</SelectItem>
                  <SelectItem value="sop-inventario-001">Control de Inventario</SelectItem>
                  <SelectItem value="sop-caja-001">Corte de Caja</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Separator />

        {/* Configuración Específica del Tipo */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Configuración del Disparador</h4>
          {renderTypeSpecificConfig()}
        </div>

        <Separator />

        {/* Asignación de Roles */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Asignación</h4>

          <div className="space-y-2">
            <Label>Asignar a Roles</Label>
            <div className="grid grid-cols-2 gap-2">
              {roles.map((role) => (
                <div key={role.key} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`role-${role.key}`}
                    checked={assignedRoles.includes(role.key)}
                    onChange={() => toggleRole(role.key)}
                    className="rounded"
                  />
                  <Label htmlFor={`role-${role.key}`} className="text-sm">
                    {role.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <Separator />

        {/* Vista Previa */}
        {ruleType && description && (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Vista Previa</h4>
            <Alert className="bg-blue-50 border-blue-200">
              <Eye className="h-4 w-4 text-blue-500" />
              <AlertTitle className="text-blue-800">Regla: {description}</AlertTitle>
              <AlertDescription className="text-blue-700">
                <div className="mt-2 space-y-1 text-sm">
                  <div>
                    <strong>Tipo:</strong>{" "}
                    {ruleType === "time_based"
                      ? "Basada en Tiempo"
                      : ruleType === "event_based"
                        ? "Basada en Evento"
                        : "Basada en Turno"}
                  </div>
                  <div>
                    <strong>Prioridad:</strong> {priority}
                  </div>
                  {triggerTimes.filter((t) => t).length > 0 && (
                    <div>
                      <strong>Horarios:</strong> {triggerTimes.filter((t) => t).join(", ")}
                    </div>
                  )}
                  {selectedDays.length > 0 && (
                    <div>
                      <strong>Días:</strong> {selectedDays.join(", ")}
                    </div>
                  )}
                  {assignedRoles.length > 0 && (
                    <div>
                      <strong>Roles:</strong> {assignedRoles.join(", ")}
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Activación */}
        <div className="flex items-center space-x-2">
          <Switch id="active" checked={active} onCheckedChange={setActive} />
          <Label htmlFor="active">Activar regla inmediatamente</Label>
        </div>

        {/* Acciones */}
        <div className="flex space-x-2 pt-4">
          <Button onClick={handleSave} className="flex-1">
            <Save className="mr-2 h-4 w-4" />
            Guardar Regla
          </Button>
          <Button variant="outline">
            <TestTube className="mr-2 h-4 w-4" />
            Probar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
