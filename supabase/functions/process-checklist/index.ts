import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { Deno } from "https://deno.land/std@0.168.0/io/mod.ts" // Declare Deno variable

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "")

    const { checklistId, empleadoId, sucursalId, datos, archivos } = await req.json()

    // Obtener template del checklist
    const { data: template, error: templateError } = await supabase
      .from("checklist_templates")
      .select("*")
      .eq("id", checklistId)
      .single()

    if (templateError || !template) {
      throw new Error("Checklist template not found")
    }

    // Calcular puntuación automática
    const evaluacion = await calculateChecklistScore(template, datos)

    // Crear reporte
    const { data: reporte, error: reporteError } = await supabase
      .from("reportes")
      .insert({
        empleado_pulso_id: empleadoId,
        sucursal_id: sucursalId,
        checklist_id: checklistId,
        fecha: new Date().toISOString(),
        tipo: template.categoria,
        datos: datos,
        archivos_adjuntos: archivos || [],
        evaluacion_automatica: evaluacion,
        tiempo_completado_minutos: datos.tiempo_completado || template.tiempo_estimado_minutos,
        coordenadas_gps: datos.coordenadas_gps || null,
        firma_digital: `${empleadoId}_${Date.now()}`,
        qr_verificacion: `https://pulso-app.vercel.app/verify/${checklistId}_${Date.now()}`,
      })
      .select()
      .single()

    if (reporteError) {
      throw new Error("Error creating report: " + reporteError.message)
    }

    // Procesar acciones automáticas
    await processAutomaticActions(supabase, template, datos, evaluacion, reporte)

    // Actualizar métricas del dashboard
    await updateDashboardMetrics(supabase, sucursalId, evaluacion)

    // Log del sistema
    await supabase.from("system_logs").insert({
      evento: "checklist_completado",
      usuario_id: empleadoId,
      sucursal_id: sucursalId,
      nivel: "info",
      detalle: `Checklist ${template.nombre} completado exitosamente`,
      metadata: {
        puntuacion_obtenida: evaluacion.puntuacion_total,
        tiempo_completado_minutos: datos.tiempo_completado,
        evidencias_fotograficas: archivos?.length || 0,
        incidencias: evaluacion.areas_mejora?.length || 0,
      },
    })

    return new Response(
      JSON.stringify({
        success: true,
        reporte_id: reporte.id,
        evaluacion: evaluacion,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    )
  } catch (error) {
    console.error("Error processing checklist:", error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    })
  }
})

async function calculateChecklistScore(template: any, datos: any): Promise<any> {
  let totalPoints = 0
  let maxPoints = 0
  const areas_mejora: string[] = []

  // Procesar cada sección del checklist
  for (const seccion of template.campos) {
    for (const campo of seccion.campos) {
      maxPoints += getMaxPointsForField(campo)
      const points = calculateFieldPoints(campo, datos[campo.nombre])
      totalPoints += points

      if (points < getMaxPointsForField(campo) * 0.8) {
        areas_mejora.push(campo.pregunta)
      }
    }
  }

  const puntuacion_total = Math.round((totalPoints / maxPoints) * 100)

  let estado_general = "insatisfactorio"
  if (puntuacion_total >= template.puntuacion_minima) {
    estado_general = puntuacion_total >= 95 ? "excelente" : puntuacion_total >= 85 ? "satisfactorio" : "bueno"
  }

  return {
    puntuacion_total,
    estado_general,
    areas_mejora,
    cumplimiento_normativo: puntuacion_total >= template.puntuacion_minima ? "completo" : "parcial",
  }
}

function getMaxPointsForField(campo: any): number {
  switch (campo.tipo) {
    case "booleano":
      return 10
    case "escala_1_5":
      return 10
    case "seleccion":
      return 10
    case "numero":
      return 10
    default:
      return 5
  }
}

function calculateFieldPoints(campo: any, valor: any): number {
  const maxPoints = getMaxPointsForField(campo)

  switch (campo.tipo) {
    case "booleano":
      return valor === true ? maxPoints : 0
    case "escala_1_5":
      return Math.round((valor / 5) * maxPoints)
    case "seleccion":
      // Asignar puntos basados en la opción seleccionada
      const opciones = campo.opciones || []
      const index = opciones.indexOf(valor)
      return index >= 0 ? Math.round(((opciones.length - index) / opciones.length) * maxPoints) : 0
    case "numero":
      // Evaluar si está dentro del rango esperado
      if (campo.rango) {
        const { min, max } = campo.rango
        if (valor >= min && valor <= max) {
          return maxPoints
        }
      }
      return maxPoints * 0.5
    default:
      return maxPoints * 0.8
  }
}

async function processAutomaticActions(supabase: any, template: any, datos: any, evaluacion: any, reporte: any) {
  for (const accion of template.acciones_automaticas || []) {
    const shouldExecute = evaluateCondition(accion.condicion, datos, evaluacion)

    if (shouldExecute) {
      switch (accion.accion) {
        case "generar_alerta":
          await createAlert(supabase, accion, reporte)
          break
        case "generar_ticket_emergencia":
          await createEmergencyTicket(supabase, accion, reporte)
          break
        case "generar_plan_correctivo":
          await createCorrectivePlan(supabase, accion, reporte, evaluacion)
          break
        case "requerir_supervision":
          await requireSupervision(supabase, accion, reporte)
          break
      }
    }
  }
}

function evaluateCondition(condicion: string, datos: any, evaluacion: any): boolean {
  try {
    // Reemplazar variables en la condición
    const evaluatedCondition = condicion
      .replace(/campo_(\w+)/g, (match, fieldName) => {
        const value = datos[fieldName]
        return typeof value === "string" ? `"${value}"` : value
      })
      .replace(/puntuacion_total/g, evaluacion.puntuacion_total.toString())

    // Evaluar la condición (en un entorno real, usar una librería más segura)
    return eval(evaluatedCondition)
  } catch (error) {
    console.error("Error evaluating condition:", error)
    return false
  }
}

async function createAlert(supabase: any, accion: any, reporte: any) {
  await supabase.from("tickets").insert({
    titulo: `Alerta Automática - ${accion.prioridad.toUpperCase()}`,
    descripcion: `Alerta generada automáticamente por el sistema`,
    tipo: "alerta_automatica",
    prioridad: accion.prioridad,
    estado: "abierto",
    sucursal_id: reporte.sucursal_id,
    reporte_relacionado: reporte.id,
    creado_por: null, // Sistema
    metadata: { accion_automatica: true },
  })
}

async function createEmergencyTicket(supabase: any, accion: any, reporte: any) {
  await supabase.from("tickets").insert({
    titulo: "EMERGENCIA - Acción Inmediata Requerida",
    descripcion: "Ticket de emergencia generado por incumplimiento crítico",
    tipo: "emergencia",
    prioridad: "critica",
    estado: "abierto",
    sucursal_id: reporte.sucursal_id,
    reporte_relacionado: reporte.id,
    creado_por: null,
    metadata: { accion_automatica: true, emergencia: true },
  })
}

async function createCorrectivePlan(supabase: any, accion: any, reporte: any, evaluacion: any) {
  await supabase.from("tickets").insert({
    titulo: "Plan Correctivo Requerido",
    descripcion: `Plan correctivo necesario. Puntuación obtenida: ${evaluacion.puntuacion_total}%`,
    tipo: "plan_correctivo",
    prioridad: "alta",
    estado: "abierto",
    sucursal_id: reporte.sucursal_id,
    reporte_relacionado: reporte.id,
    creado_por: null,
    metadata: {
      accion_automatica: true,
      areas_mejora: evaluacion.areas_mejora,
      puntuacion_obtenida: evaluacion.puntuacion_total,
    },
  })
}

async function requireSupervision(supabase: any, accion: any, reporte: any) {
  await supabase.from("tickets").insert({
    titulo: "Supervisión Requerida",
    descripción: "Se requiere supervisión adicional",
    tipo: "supervision",
    prioridad: "media",
    estado: "abierto",
    sucursal_id: reporte.sucursal_id,
    reporte_relacionado: reporte.id,
    creado_por: null,
    metadata: { accion_automatica: true },
  })
}

async function updateDashboardMetrics(supabase: any, sucursalId: string, evaluacion: any) {
  const today = new Date().toISOString().split("T")[0]

  // Obtener sucursal para obtener empresa_id
  const { data: sucursal } = await supabase.from("sucursales").select("empresa_id").eq("id", sucursalId).single()

  if (!sucursal) return

  // Actualizar o crear métricas del día
  const { data: existingMetrics } = await supabase
    .from("dashboard_metricas")
    .select("*")
    .eq("empresa_id", sucursal.empresa_id)
    .eq("fecha", today)
    .single()

  const newMetrics = {
    empresa_id: sucursal.empresa_id,
    fecha: today,
    tipo: "consolidado_diario",
    metricas_operativas: {
      reportes_completados: (existingMetrics?.metricas_operativas?.reportes_completados || 0) + 1,
      cumplimiento_checklists: evaluacion.puntuacion_total,
    },
  }

  if (existingMetrics) {
    await supabase.from("dashboard_metricas").update(newMetrics).eq("id", existingMetrics.id)
  } else {
    await supabase.from("dashboard_metricas").insert(newMetrics)
  }
}
