"use client"

import React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import {
  Building2,
  User,
  MapPin,
  Users,
  Check,
  ArrowRight,
  ArrowLeft,
  Mail,
  Crown,
  Zap,
  Rocket,
  Loader2,
} from "lucide-react"

interface OnboardingWizardProps {
  user: any
}

export function OnboardingWizard({ user }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  // Datos del formulario
  const [empresaData, setEmpresaData] = useState({
    nombre: "",
    rfc: "",
    razon_social: "",
    tipo_negocio: "",
    direccion: "",
    ciudad: "",
    estado: "",
    codigo_postal: "",
    telefono: "",
    email: "",
    sitio_web: "",
  })

  const [propietarioData, setPropietarioData] = useState({
    nombre: user?.user_metadata?.full_name || "",
    apellidos: "",
    telefono: "",
    plan_seleccionado: "",
  })

  const [sucursalData, setSucursalData] = useState({
    nombre: "",
    direccion: "",
    ciudad: "",
    estado: "",
    codigo_postal: "",
    telefono: "",
    capacidad_personas: "",
    numero_mesas: "",
    horario_apertura: "",
    horario_cierre: "",
  })

  const [invitaciones, setInvitaciones] = useState([{ email: "", rol: "branch_manager", nombre: "" }])

  const steps = [
    {
      number: 1,
      title: "Información de la Empresa",
      description: "Datos básicos de tu negocio",
      icon: Building2,
    },
    {
      number: 2,
      title: "Propietario y Plan",
      description: "Tu información y plan de suscripción",
      icon: User,
    },
    {
      number: 3,
      title: "Sucursal Principal",
      description: "Configuración de tu primera sucursal",
      icon: MapPin,
    },
    {
      number: 4,
      title: "Invitar Gerentes",
      description: "Invita a tu equipo de gestión",
      icon: Users,
    },
  ]

  const planes = [
    {
      id: "basico",
      nombre: "Básico",
      precio: "$299",
      periodo: "/mes",
      descripcion: "Perfecto para restaurantes pequeños",
      caracteristicas: ["Hasta 2 sucursales", "SOPs básicos", "Reportes estándar", "Soporte por email"],
      icon: Crown,
      color: "border-gray-200",
    },
    {
      id: "profesional",
      nombre: "Profesional",
      precio: "$599",
      periodo: "/mes",
      descripcion: "Ideal para cadenas medianas",
      caracteristicas: ["Hasta 10 sucursales", "Automatización avanzada", "Analytics completos", "Soporte prioritario"],
      icon: Zap,
      color: "border-blue-500 ring-2 ring-blue-200",
      popular: true,
    },
    {
      id: "empresarial",
      nombre: "Empresarial",
      precio: "$1,299",
      periodo: "/mes",
      descripción: "Para grandes cadenas HORECA",
      caracteristicas: ["Sucursales ilimitadas", "IA avanzada", "Integración completa", "Gerente de cuenta"],
      icon: Rocket,
      color: "border-purple-500",
    },
  ]

  const tiposNegocio = [
    "Restaurante",
    "Hotel",
    "Café/Cafetería",
    "Bar/Cantina",
    "Panadería",
    "Pizzería",
    "Comida Rápida",
    "Catering",
    "Food Truck",
    "Otro",
  ]

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const addInvitation = () => {
    setInvitaciones([...invitaciones, { email: "", rol: "branch_manager", nombre: "" }])
  }

  const removeInvitation = (index: number) => {
    setInvitaciones(invitaciones.filter((_, i) => i !== index))
  }

  const updateInvitation = (index: number, field: string, value: string) => {
    const updated = [...invitaciones]
    updated[index] = { ...updated[index], [field]: value }
    setInvitaciones(updated)
  }

  const completeOnboarding = async () => {
    setLoading(true)
    try {
      // 1. Crear empresa
      const { data: empresa, error: empresaError } = await supabase
        .from("empresas")
        .insert({
          nombre: empresaData.nombre,
          rfc: empresaData.rfc,
          razon_social: empresaData.razon_social,
          tipo_negocio: empresaData.tipo_negocio,
          direccion: empresaData.direccion,
          ciudad: empresaData.ciudad,
          estado: empresaData.estado,
          codigo_postal: empresaData.codigo_postal,
          telefono: empresaData.telefono,
          email: empresaData.email,
          sitio_web: empresaData.sitio_web,
          propietario_email: user.email,
          plan_activo: propietarioData.plan_seleccionado,
          configuracion_inicial_completada: true,
        })
        .select()
        .single()

      if (empresaError) throw empresaError

      // 2. Crear usuario propietario
      const { error: usuarioError } = await supabase.from("usuarios").insert({
        email: user.email,
        nombre: propietarioData.nombre,
        apellidos: propietarioData.apellidos,
        telefono: propietarioData.telefono,
        empresa_id: empresa.id,
        rol: "propietario",
        activo: true,
      })

      if (usuarioError) throw usuarioError

      // 3. Asignar rol de owner
      const { data: ownerRole } = await supabase.from("roles").select("id").eq("name", "owner").single()

      if (ownerRole) {
        await supabase.from("user_roles").insert({
          user_id: user.id,
          role_id: ownerRole.id,
          empresa_id: empresa.id,
          assigned_by: user.id,
        })
      }

      // 4. Crear sucursal principal
      const { data: sucursal, error: sucursalError } = await supabase
        .from("sucursales")
        .insert({
          nombre: sucursalData.nombre,
          direccion: sucursalData.direccion,
          ciudad: sucursalData.ciudad,
          estado: sucursalData.estado,
          codigo_postal: sucursalData.codigo_postal,
          telefono: sucursalData.telefono,
          empresa_id: empresa.id,
          capacidad_personas: Number.parseInt(sucursalData.capacidad_personas) || 0,
          numero_mesas: Number.parseInt(sucursalData.numero_mesas) || 0,
          horario_apertura: sucursalData.horario_apertura,
          horario_cierre: sucursalData.horario_cierre,
          es_principal: true,
          activa: true,
        })
        .select()
        .single()

      if (sucursalError) throw sucursalError

      // 5. Enviar invitaciones
      const { data: managerRole } = await supabase.from("roles").select("id").eq("name", "branch_manager").single()

      for (const invitacion of invitaciones) {
        if (invitacion.email && invitacion.email !== user.email) {
          const token = crypto.randomUUID()

          await supabase.from("user_invitations").insert({
            email: invitacion.email,
            empresa_id: empresa.id,
            role_id: managerRole?.id,
            sucursal_id: sucursal.id,
            invited_by: user.id,
            invitation_token: token,
          })

          // Aquí se enviaría el email de invitación
          console.log(`Invitación enviada a ${invitacion.email} con token: ${token}`)
        }
      }

      toast({
        title: "¡Onboarding completado!",
        description: "Tu empresa ha sido configurada exitosamente",
      })

      router.push("/dashboard")
    } catch (error) {
      console.error("Error completing onboarding:", error)
      toast({
        title: "Error",
        description: "Hubo un problema al configurar tu empresa",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre Comercial *</Label>
                <Input
                  id="nombre"
                  value={empresaData.nombre}
                  onChange={(e) => setEmpresaData({ ...empresaData, nombre: e.target.value })}
                  placeholder="Restaurante El Buen Sabor"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rfc">RFC *</Label>
                <Input
                  id="rfc"
                  value={empresaData.rfc}
                  onChange={(e) => setEmpresaData({ ...empresaData, rfc: e.target.value.toUpperCase() })}
                  placeholder="ABC123456789"
                  maxLength={13}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="razon_social">Razón Social *</Label>
              <Input
                id="razon_social"
                value={empresaData.razon_social}
                onChange={(e) => setEmpresaData({ ...empresaData, razon_social: e.target.value })}
                placeholder="Restaurante El Buen Sabor S.A. de C.V."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo_negocio">Tipo de Negocio *</Label>
              <Select
                value={empresaData.tipo_negocio}
                onValueChange={(value) => setEmpresaData({ ...empresaData, tipo_negocio: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el tipo de negocio" />
                </SelectTrigger>
                <SelectContent>
                  {tiposNegocio.map((tipo) => (
                    <SelectItem key={tipo} value={tipo}>
                      {tipo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="direccion">Dirección *</Label>
              <Textarea
                id="direccion"
                value={empresaData.direccion}
                onChange={(e) => setEmpresaData({ ...empresaData, direccion: e.target.value })}
                placeholder="Calle Principal #123, Colonia Centro"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ciudad">Ciudad *</Label>
                <Input
                  id="ciudad"
                  value={empresaData.ciudad}
                  onChange={(e) => setEmpresaData({ ...empresaData, ciudad: e.target.value })}
                  placeholder="Ciudad de México"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="estado">Estado *</Label>
                <Input
                  id="estado"
                  value={empresaData.estado}
                  onChange={(e) => setEmpresaData({ ...empresaData, estado: e.target.value })}
                  placeholder="CDMX"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="codigo_postal">Código Postal *</Label>
                <Input
                  id="codigo_postal"
                  value={empresaData.codigo_postal}
                  onChange={(e) => setEmpresaData({ ...empresaData, codigo_postal: e.target.value })}
                  placeholder="01000"
                  maxLength={5}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono *</Label>
                <Input
                  id="telefono"
                  value={empresaData.telefono}
                  onChange={(e) => setEmpresaData({ ...empresaData, telefono: e.target.value })}
                  placeholder="55-1234-5678"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Corporativo *</Label>
                <Input
                  id="email"
                  type="email"
                  value={empresaData.email}
                  onChange={(e) => setEmpresaData({ ...empresaData, email: e.target.value })}
                  placeholder="contacto@restaurante.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sitio_web">Sitio Web (Opcional)</Label>
              <Input
                id="sitio_web"
                value={empresaData.sitio_web}
                onChange={(e) => setEmpresaData({ ...empresaData, sitio_web: e.target.value })}
                placeholder="https://www.restaurante.com"
              />
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="propietario_nombre">Nombre *</Label>
                <Input
                  id="propietario_nombre"
                  value={propietarioData.nombre}
                  onChange={(e) => setPropietarioData({ ...propietarioData, nombre: e.target.value })}
                  placeholder="Juan"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="propietario_apellidos">Apellidos *</Label>
                <Input
                  id="propietario_apellidos"
                  value={propietarioData.apellidos}
                  onChange={(e) => setPropietarioData({ ...propietarioData, apellidos: e.target.value })}
                  placeholder="Pérez García"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="propietario_telefono">Teléfono Personal *</Label>
              <Input
                id="propietario_telefono"
                value={propietarioData.telefono}
                onChange={(e) => setPropietarioData({ ...propietarioData, telefono: e.target.value })}
                placeholder="55-9876-5432"
              />
            </div>

            <div className="space-y-4">
              <Label>Selecciona tu Plan *</Label>
              <div className="grid gap-4">
                {planes.map((plan) => (
                  <Card
                    key={plan.id}
                    className={`cursor-pointer transition-all ${plan.color} ${
                      propietarioData.plan_seleccionado === plan.id ? "ring-2 ring-blue-500" : ""
                    }`}
                    onClick={() => setPropietarioData({ ...propietarioData, plan_seleccionado: plan.id })}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="p-2 bg-gray-100 rounded-lg">
                            <plan.icon className="h-6 w-6" />
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h3 className="font-semibold">{plan.nombre}</h3>
                              {plan.popular && <Badge className="bg-blue-500">Más Popular</Badge>}
                            </div>
                            <p className="text-sm text-muted-foreground">{plan.descripcion}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold">{plan.precio}</div>
                          <div className="text-sm text-muted-foreground">{plan.periodo}</div>
                        </div>
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-2">
                        {plan.caracteristicas.map((caracteristica, index) => (
                          <div key={index} className="flex items-center space-x-2 text-sm">
                            <Check className="h-4 w-4 text-green-500" />
                            <span>{caracteristica}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <Alert>
              <MapPin className="h-4 w-4" />
              <AlertDescription>
                Esta será tu sucursal principal. Podrás agregar más sucursales después desde el dashboard.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="sucursal_nombre">Nombre de la Sucursal *</Label>
              <Input
                id="sucursal_nombre"
                value={sucursalData.nombre}
                onChange={(e) => setSucursalData({ ...sucursalData, nombre: e.target.value })}
                placeholder="Sucursal Centro"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sucursal_direccion">Dirección *</Label>
              <Textarea
                id="sucursal_direccion"
                value={sucursalData.direccion}
                onChange={(e) => setSucursalData({ ...sucursalData, direccion: e.target.value })}
                placeholder="Av. Reforma #456, Col. Juárez"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sucursal_ciudad">Ciudad *</Label>
                <Input
                  id="sucursal_ciudad"
                  value={sucursalData.ciudad}
                  onChange={(e) => setSucursalData({ ...sucursalData, ciudad: e.target.value })}
                  placeholder="Ciudad de México"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sucursal_estado">Estado *</Label>
                <Input
                  id="sucursal_estado"
                  value={sucursalData.estado}
                  onChange={(e) => setSucursalData({ ...sucursalData, estado: e.target.value })}
                  placeholder="CDMX"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sucursal_cp">Código Postal *</Label>
                <Input
                  id="sucursal_cp"
                  value={sucursalData.codigo_postal}
                  onChange={(e) => setSucursalData({ ...sucursalData, codigo_postal: e.target.value })}
                  placeholder="06600"
                  maxLength={5}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sucursal_telefono">Teléfono de la Sucursal *</Label>
              <Input
                id="sucursal_telefono"
                value={sucursalData.telefono}
                onChange={(e) => setSucursalData({ ...sucursalData, telefono: e.target.value })}
                placeholder="55-2468-1357"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="capacidad">Capacidad (Personas)</Label>
                <Input
                  id="capacidad"
                  type="number"
                  value={sucursalData.capacidad_personas}
                  onChange={(e) => setSucursalData({ ...sucursalData, capacidad_personas: e.target.value })}
                  placeholder="50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mesas">Número de Mesas</Label>
                <Input
                  id="mesas"
                  type="number"
                  value={sucursalData.numero_mesas}
                  onChange={(e) => setSucursalData({ ...sucursalData, numero_mesas: e.target.value })}
                  placeholder="12"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="apertura">Horario de Apertura</Label>
                <Input
                  id="apertura"
                  type="time"
                  value={sucursalData.horario_apertura}
                  onChange={(e) => setSucursalData({ ...sucursalData, horario_apertura: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cierre">Horario de Cierre</Label>
                <Input
                  id="cierre"
                  type="time"
                  value={sucursalData.horario_cierre}
                  onChange={(e) => setSucursalData({ ...sucursalData, horario_cierre: e.target.value })}
                />
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <Alert>
              <Users className="h-4 w-4" />
              <AlertDescription>
                Invita a gerentes para que configuren y gestionen las sucursales. Puedes omitir este paso y agregar
                usuarios después.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              {invitaciones.map((invitacion, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Email *</Label>
                        <Input
                          type="email"
                          value={invitacion.email}
                          onChange={(e) => updateInvitation(index, "email", e.target.value)}
                          placeholder="gerente@email.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Nombre</Label>
                        <Input
                          value={invitacion.nombre}
                          onChange={(e) => updateInvitation(index, "nombre", e.target.value)}
                          placeholder="Nombre del gerente"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Rol</Label>
                        <div className="flex items-center space-x-2">
                          <Select
                            value={invitacion.rol}
                            onValueChange={(value) => updateInvitation(index, "rol", value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="branch_manager">Gerente de Sucursal</SelectItem>
                              <SelectItem value="general_manager">Gerente General</SelectItem>
                              <SelectItem value="supervisor">Supervisor</SelectItem>
                            </SelectContent>
                          </Select>
                          {invitaciones.length > 1 && (
                            <Button variant="outline" size="sm" onClick={() => removeInvitation(index)}>
                              Eliminar
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Button variant="outline" onClick={addInvitation} className="w-full bg-transparent">
                <Mail className="mr-2 h-4 w-4" />
                Agregar Otra Invitación
              </Button>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return (
          empresaData.nombre &&
          empresaData.rfc &&
          empresaData.razon_social &&
          empresaData.tipo_negocio &&
          empresaData.direccion &&
          empresaData.ciudad &&
          empresaData.estado &&
          empresaData.codigo_postal &&
          empresaData.telefono &&
          empresaData.email
        )
      case 2:
        return (
          propietarioData.nombre &&
          propietarioData.apellidos &&
          propietarioData.telefono &&
          propietarioData.plan_seleccionado
        )
      case 3:
        return (
          sucursalData.nombre &&
          sucursalData.direccion &&
          sucursalData.ciudad &&
          sucursalData.estado &&
          sucursalData.codigo_postal &&
          sucursalData.telefono
        )
      case 4:
        return true // Las invitaciones son opcionales
      default:
        return false
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {steps.map((step) => (
            <div key={step.number} className="flex items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  currentStep >= step.number
                    ? "bg-blue-600 border-blue-600 text-white"
                    : "border-gray-300 text-gray-500"
                }`}
              >
                {currentStep > step.number ? <Check className="h-5 w-5" /> : <step.icon className="h-5 w-5" />}
              </div>
              {step.number < 4 && (
                <div className={`w-24 h-1 mx-2 ${currentStep > step.number ? "bg-blue-600" : "bg-gray-300"}`} />
              )}
            </div>
          ))}
        </div>
        <Progress value={(currentStep / 4) * 100} className="h-2" />
      </div>

      {/* Current step content */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            {React.createElement(steps[currentStep - 1].icon, { className: "mr-2 h-6 w-6" })}
            {steps[currentStep - 1].title}
          </CardTitle>
          <CardDescription>{steps[currentStep - 1].description}</CardDescription>
        </CardHeader>
        <CardContent>{renderStep()}</CardContent>
      </Card>

      {/* Navigation buttons */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={prevStep} disabled={currentStep === 1}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Anterior
        </Button>

        {currentStep < 4 ? (
          <Button onClick={nextStep} disabled={!isStepValid()}>
            Siguiente
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={completeOnboarding} disabled={loading || !isStepValid()}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Configurando...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Completar Configuración
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
