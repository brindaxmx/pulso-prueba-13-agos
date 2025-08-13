"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { Camera, MapPin, Clock, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react"

interface ChecklistTemplate {
  id: string
  nombre: string
  descripcion: string
  tiempo_estimado_minutos: number
  campos: any[]
  puntuacion_minima: number
}

interface FormData {
  [key: string]: any
}

export default function CompletarChecklistPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const [template, setTemplate] = useState<ChecklistTemplate | null>(null)
  const [formData, setFormData] = useState<FormData>({})
  const [currentSection, setCurrentSection] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [empleado, setEmpleado] = useState<any>(null)
  const [sucursal, setSucursal] = useState<any>(null)
  const [startTime] = useState(Date.now())
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)

  useEffect(() => {
    loadTemplate()
    getCurrentLocation()
    loadUserData()
  }, [])

  const loadTemplate = async () => {
    try {
      const { data, error } = await supabase.from("checklist_templates").select("*").eq("id", params.id).single()

      if (error) throw error
      setTemplate(data)
    } catch (error) {
      console.error("Error loading template:", error)
      toast({
        title: "Error",
        description: "No se pudo cargar el checklist",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadUserData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      // Buscar si es empleado PULSO
      const { data: empleadoData } = await supabase
        .from("empleados_pulso")
        .select(`
          *,
          sucursales (*)
        `)
        .eq("email", user?.email)
        .single()

      if (empleadoData) {
        setEmpleado(empleadoData)
        setSucursal(empleadoData.sucursales)
      }
    } catch (error) {
      console.error("Error loading user data:", error)
    }
  }

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
        },
        (error) => {
          console.error("Error getting location:", error)
        },
      )
    }
  }

  const handleInputChange = (fieldName: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }))
  }

  const handleFileUpload = async (fieldName: string, file: File) => {
    try {
      const fileExt = file.name.split(".").pop()
      const fileName = `${fieldName}_${Date.now()}.${fileExt}`
      const filePath = `reportes/${fileName}`

      const { error: uploadError } = await supabase.storage.from("attachments").upload(filePath, file)

      if (uploadError) throw uploadError

      const {
        data: { publicUrl },
      } = supabase.storage.from("attachments").getPublicUrl(filePath)

      // Agregar archivo a los datos del formulario
      const currentFiles = formData[`${fieldName}_files`] || []
      handleInputChange(`${fieldName}_files`, [
        ...currentFiles,
        {
          nombre: file.name,
          tipo: "imagen",
          url: publicUrl,
          tamaño_kb: Math.round(file.size / 1024),
          campo_relacionado: fieldName,
        },
      ])

      toast({
        title: "Archivo subido",
        description: "La evidencia fotográfica se ha guardado correctamente",
      })
    } catch (error) {
      console.error("Error uploading file:", error)
      toast({
        title: "Error",
        description: "No se pudo subir el archivo",
        variant: "destructive",
      })
    }
  }

  const renderField = (campo: any) => {
    const value = formData[campo.nombre] || ""

    switch (campo.tipo) {
      case "booleano":
        return (
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id={campo.nombre}
                checked={value === true}
                onCheckedChange={(checked) => handleInputChange(campo.nombre, checked)}
              />
              <Label
                htmlFor={campo.nombre}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Sí
              </Label>
            </div>
          </div>
        )

      case "seleccion":
        return (
          <RadioGroup value={value} onValueChange={(newValue) => handleInputChange(campo.nombre, newValue)}>
            {campo.opciones?.map((opcion: string) => (
              <div key={opcion} className="flex items-center space-x-2">
                <RadioGroupItem value={opcion} id={`${campo.nombre}_${opcion}`} />
                <Label htmlFor={`${campo.nombre}_${opcion}`}>{opcion}</Label>
              </div>
            ))}
          </RadioGroup>
        )

      case "escala_1_5":
        return (
          <RadioGroup
            value={value?.toString()}
            onValueChange={(newValue) => handleInputChange(campo.nombre, Number.parseInt(newValue))}
          >
            <div className="flex space-x-4">
              {[1, 2, 3, 4, 5].map((num) => (
                <div key={num} className="flex items-center space-x-2">
                  <RadioGroupItem value={num.toString()} id={`${campo.nombre}_${num}`} />
                  <Label htmlFor={`${campo.nombre}_${num}`}>{num}</Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        )

      case "numero":
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => handleInputChange(campo.nombre, Number.parseFloat(e.target.value) || 0)}
            min={campo.rango?.min}
            max={campo.rango?.max}
            placeholder={`${campo.rango?.min || 0} - ${campo.rango?.max || 100}`}
          />
        )

      case "texto_largo":
        return (
          <Textarea
            value={value}
            onChange={(e) => handleInputChange(campo.nombre, e.target.value)}
            maxLength={campo.max_caracteres}
            placeholder="Escribe tus observaciones..."
            rows={4}
          />
        )

      default:
        return (
          <Input
            value={value}
            onChange={(e) => handleInputChange(campo.nombre, e.target.value)}
            placeholder="Ingresa el valor"
          />
        )
    }
  }

  const handleSubmit = async () => {
    if (!template || !empleado || !sucursal) return

    setSubmitting(true)
    try {
      const tiempoCompletado = Math.round((Date.now() - startTime) / 60000) // minutos

      // Recopilar todos los archivos adjuntos
      const archivosAdjuntos: any[] = []
      Object.keys(formData).forEach((key) => {
        if (key.endsWith("_files") && formData[key]) {
          archivosAdjuntos.push(...formData[key])
        }
      })

      // Preparar datos para enviar
      const datosReporte = {
        ...formData,
        tiempo_completado: tiempoCompletado,
        coordenadas_gps: location,
      }

      // Llamar a la Edge Function para procesar el checklist
      const { data, error } = await supabase.functions.invoke("process-checklist", {
        body: {
          checklistId: template.id,
          empleadoId: empleado.id,
          sucursalId: sucursal.id,
          datos: datosReporte,
          archivos: archivosAdjuntos,
        },
      })

      if (error) throw error

      toast({
        title: "Checklist completado",
        description: `Puntuación obtenida: ${data.evaluacion.puntuacion_total}%`,
      })

      router.push(`/dashboard/reportes/${data.reporte_id}`)
    } catch (error) {
      console.error("Error submitting checklist:", error)
      toast({
        title: "Error",
        description: "No se pudo completar el checklist",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!template) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>No se pudo cargar el checklist solicitado.</AlertDescription>
      </Alert>
    )
  }

  const currentSectionData = template.campos[currentSection]
  const totalSections = template.campos.length
  const progress = ((currentSection + 1) / totalSections) * 100

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">{template.nombre}</h1>
        <p className="text-muted-foreground">{template.descripcion}</p>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {template.tiempo_estimado_minutos} min estimados
          </div>
          {location && (
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              Ubicación registrada
            </div>
          )}
          {sucursal && <Badge variant="outline">{sucursal.nombre}</Badge>}
        </div>
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progreso</span>
              <span>
                {currentSection + 1} de {totalSections} secciones
              </span>
            </div>
            <Progress value={progress} />
          </div>
        </CardContent>
      </Card>

      {/* Current Section */}
      <Card>
        <CardHeader>
          <CardTitle>{currentSectionData.seccion}</CardTitle>
          <CardDescription>Completa todos los campos requeridos en esta sección</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {currentSectionData.campos.map((campo: any) => (
            <div key={campo.id} className="space-y-3">
              <div className="space-y-2">
                <Label className="text-base font-medium">
                  {campo.pregunta}
                  {campo.requerido && <span className="text-red-500 ml-1">*</span>}
                </Label>
                {campo.normativa && (
                  <p className="text-xs text-blue-600 bg-blue-50 p-2 rounded">📋 {campo.normativa}</p>
                )}
              </div>

              {renderField(campo)}

              {campo.evidencia_fotografica && (
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Evidencia fotográfica</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          handleFileUpload(campo.nombre, file)
                        }
                      }}
                      className="hidden"
                      id={`file_${campo.nombre}`}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById(`file_${campo.nombre}`)?.click()}
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Tomar foto
                    </Button>
                  </div>
                  {formData[`${campo.nombre}_files`] && (
                    <div className="text-sm text-green-600">
                      ✓ {formData[`${campo.nombre}_files`].length} archivo(s) adjunto(s)
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentSection(Math.max(0, currentSection - 1))}
          disabled={currentSection === 0}
        >
          Anterior
        </Button>

        {currentSection < totalSections - 1 ? (
          <Button onClick={() => setCurrentSection(currentSection + 1)}>Siguiente</Button>
        ) : (
          <Button onClick={handleSubmit} disabled={submitting} className="bg-green-600 hover:bg-green-700">
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Completar Checklist
          </Button>
        )}
      </div>
    </div>
  )
}
