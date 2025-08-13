"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { GitCompare, ArrowRight, Plus, Minus, Edit, Eye, Download, Save, CheckCircle } from "lucide-react"

interface VersionComparisonProps {
  ruleVersions?: any[]
}

export function VersionComparison({ ruleVersions = [] }: VersionComparisonProps) {
  const [selectedRule, setSelectedRule] = useState("")
  const [versionFrom, setVersionFrom] = useState("")
  const [versionTo, setVersionTo] = useState("")
  const [comparisonResult, setComparisonResult] = useState<any>(null)

  // Agrupar versiones por regla
  const ruleGroups = ruleVersions.reduce(
    (acc, version) => {
      const ruleId = version.rule_id
      if (!acc[ruleId]) {
        acc[ruleId] = {
          rule_description: version.rule_description,
          versions: [],
        }
      }
      acc[ruleId].versions.push(version)
      return acc
    },
    {} as Record<string, any>,
  )

  const selectedRuleVersions = selectedRule ? ruleGroups[selectedRule]?.versions || [] : []

  const compareVersions = () => {
    if (!versionFrom || !versionTo) return

    const fromVersion = selectedRuleVersions.find((v) => v.version_number.toString() === versionFrom)
    const toVersion = selectedRuleVersions.find((v) => v.version_number.toString() === versionTo)

    if (!fromVersion || !toVersion) return

    const fromData = fromVersion.rule_data
    const toData = toVersion.rule_data

    const changes = []

    // Comparar campos específicos
    const fieldsToCompare = [
      "type",
      "description",
      "priority",
      "active",
      "trigger_time",
      "days",
      "assign_to",
      "condition",
    ]

    for (const field of fieldsToCompare) {
      const fromValue = fromData[field]
      const toValue = toData[field]

      if (JSON.stringify(fromValue) !== JSON.stringify(toValue)) {
        changes.push({
          field,
          from: fromValue,
          to: toValue,
          type: getChangeType(fromValue, toValue),
        })
      }
    }

    setComparisonResult({
      fromVersion,
      toVersion,
      changes,
      summary: generateChangeSummary(changes),
    })
  }

  const getChangeType = (fromValue: any, toValue: any) => {
    if (fromValue === null || fromValue === undefined) return "added"
    if (toValue === null || toValue === undefined) return "removed"
    if (Array.isArray(fromValue) && Array.isArray(toValue)) {
      if (fromValue.length < toValue.length) return "array_addition"
      if (fromValue.length > toValue.length) return "array_removal"
      return "array_modification"
    }
    return "value_change"
  }

  const generateChangeSummary = (changes: any[]) => {
    const summary = {
      total: changes.length,
      added: changes.filter((c) => c.type === "added").length,
      removed: changes.filter((c) => c.type === "removed").length,
      modified: changes.filter((c) => c.type === "value_change" || c.type.includes("array")).length,
    }
    return summary
  }

  const getChangeIcon = (type: string) => {
    switch (type) {
      case "added":
        return <Plus className="h-4 w-4 text-green-500" />
      case "removed":
        return <Minus className="h-4 w-4 text-red-500" />
      case "array_addition":
        return <Plus className="h-4 w-4 text-blue-500" />
      case "array_removal":
        return <Minus className="h-4 w-4 text-orange-500" />
      default:
        return <Edit className="h-4 w-4 text-blue-500" />
    }
  }

  const getChangeColor = (type: string) => {
    switch (type) {
      case "added":
        return "bg-green-50 border-green-200"
      case "removed":
        return "bg-red-50 border-red-200"
      case "array_addition":
        return "bg-blue-50 border-blue-200"
      case "array_removal":
        return "bg-orange-50 border-orange-200"
      default:
        return "bg-blue-50 border-blue-200"
    }
  }

  const formatValue = (value: any) => {
    if (value === null || value === undefined) return "null"
    if (Array.isArray(value)) return `[${value.join(", ")}]`
    if (typeof value === "object") return JSON.stringify(value, null, 2)
    if (typeof value === "boolean") return value ? "true" : "false"
    return value.toString()
  }

  return (
    <div className="space-y-6">
      {/* Selector de Comparación */}
      <Card className="bg-white/80 backdrop-blur border-white/20 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center">
            <GitCompare className="mr-2 h-5 w-5 text-purple-500" />
            Comparador de Versiones
          </CardTitle>
          <CardDescription>Compara diferentes versiones de una regla para ver los cambios</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Regla</Label>
              <Select value={selectedRule} onValueChange={setSelectedRule}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una regla" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ruleGroups).map(([ruleId, group]) => (
                    <SelectItem key={ruleId} value={ruleId}>
                      {group.rule_description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Versión Base</Label>
              <Select value={versionFrom} onValueChange={setVersionFrom} disabled={!selectedRule}>
                <SelectTrigger>
                  <SelectValue placeholder="Versión inicial" />
                </SelectTrigger>
                <SelectContent>
                  {selectedRuleVersions.map((version) => (
                    <SelectItem key={version.id} value={version.version_number.toString()}>
                      v{version.version_number} - {new Date(version.created_at).toLocaleDateString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Versión Comparar</Label>
              <Select value={versionTo} onValueChange={setVersionTo} disabled={!selectedRule}>
                <SelectTrigger>
                  <SelectValue placeholder="Versión final" />
                </SelectTrigger>
                <SelectContent>
                  {selectedRuleVersions.map((version) => (
                    <SelectItem key={version.id} value={version.version_number.toString()}>
                      v{version.version_number} - {new Date(version.created_at).toLocaleDateString()}
                      {version.is_current && <Badge className="ml-2">Actual</Badge>}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex space-x-2">
            <Button onClick={compareVersions} disabled={!versionFrom || !versionTo} className="flex-1">
              <GitCompare className="mr-2 h-4 w-4" />
              Comparar Versiones
            </Button>
            {comparisonResult && (
              <>
                <Button variant="outline">
                  <Save className="mr-2 h-4 w-4" />
                  Guardar Comparación
                </Button>
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Exportar
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Resultado de la Comparación */}
      {comparisonResult && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Resumen de Cambios */}
          <Card className="bg-white/80 backdrop-blur border-white/20 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="mr-2 h-5 w-5 text-blue-500" />
                Resumen de Cambios
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-2">{comparisonResult.summary.total}</div>
                <div className="text-sm text-gray-500">Cambios Totales</div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Plus className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Agregados</span>
                  </div>
                  <Badge className="bg-green-100 text-green-800">{comparisonResult.summary.added}</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Minus className="h-4 w-4 text-red-500" />
                    <span className="text-sm">Eliminados</span>
                  </div>
                  <Badge className="bg-red-100 text-red-800">{comparisonResult.summary.removed}</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Edit className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">Modificados</span>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">{comparisonResult.summary.modified}</Badge>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="text-sm font-medium">Información de Versiones</div>
                <div className="space-y-1 text-xs text-gray-600">
                  <div>
                    <strong>Base:</strong> v{comparisonResult.fromVersion.version_number} (
                    {new Date(comparisonResult.fromVersion.created_at).toLocaleDateString()})
                  </div>
                  <div>
                    <strong>Comparar:</strong> v{comparisonResult.toVersion.version_number} (
                    {new Date(comparisonResult.toVersion.created_at).toLocaleDateString()})
                  </div>
                </div>
              </div>

              {comparisonResult.summary.total === 0 && (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <AlertDescription className="text-green-700">
                    Las versiones son idénticas. No hay diferencias entre ellas.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Lista de Cambios Detallados */}
          <div className="lg:col-span-2">
            <Card className="bg-white/80 backdrop-blur border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle>Cambios Detallados</CardTitle>
                <CardDescription>
                  Comparación campo por campo entre v{comparisonResult.fromVersion.version_number} y v
                  {comparisonResult.toVersion.version_number}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px] pr-4">
                  <div className="space-y-4">
                    {comparisonResult.changes.length > 0 ? (
                      comparisonResult.changes.map((change, index) => (
                        <Card key={index} className={`border-l-4 ${getChangeColor(change.type)}`}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center space-x-2">
                                {getChangeIcon(change.type)}
                                <h4 className="font-semibold capitalize">{change.field.replace("_", " ")}</h4>
                                <Badge variant="outline" className="capitalize">
                                  {change.type.replace("_", " ")}
                                </Badge>
                              </div>
                            </div>

                            <div className="space-y-3">
                              {change.type !== "added" && (
                                <div>
                                  <Label className="text-xs text-gray-500 uppercase tracking-wide">Antes</Label>
                                  <div className="mt-1 p-3 bg-red-50 border border-red-200 rounded-md">
                                    <pre className="text-sm text-red-800 whitespace-pre-wrap">
                                      {formatValue(change.from)}
                                    </pre>
                                  </div>
                                </div>
                              )}

                              {change.type !== "removed" && (
                                <div>
                                  <Label className="text-xs text-gray-500 uppercase tracking-wide">Después</Label>
                                  <div className="mt-1 p-3 bg-green-50 border border-green-200 rounded-md">
                                    <pre className="text-sm text-green-800 whitespace-pre-wrap">
                                      {formatValue(change.to)}
                                    </pre>
                                  </div>
                                </div>
                              )}

                              {change.type !== "added" && change.type !== "removed" && (
                                <div className="flex items-center justify-center py-2">
                                  <ArrowRight className="h-4 w-4 text-gray-400" />
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="text-center py-12 text-gray-500">
                        <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500 opacity-50" />
                        <p>No hay diferencias entre las versiones seleccionadas</p>
                        <p className="text-sm text-gray-400 mt-2">Las versiones son idénticas</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Comparaciones Guardadas */}
      <Card className="bg-white/80 backdrop-blur border-white/20 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center">
            <GitCompare className="mr-2 h-5 w-5 text-indigo-500" />
            Comparaciones Guardadas
          </CardTitle>
          <CardDescription>Historial de comparaciones realizadas anteriormente</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <GitCompare className="h-8 w-8 mx-auto mb-3 opacity-50" />
            <p>No hay comparaciones guardadas</p>
            <p className="text-sm text-gray-400 mt-1">Las comparaciones que guardes aparecerán aquí</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
