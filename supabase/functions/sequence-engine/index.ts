import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { Deno } from "https://deno.land/std@0.168.0/node/global.ts" // Declare Deno variable

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

    // Obtener reglas activas
    const { data: rules, error: rulesError } = await supabase
      .from("sequence_engine_rules")
      .select("*")
      .eq("active", true)

    if (rulesError) throw rulesError

    const currentTime = new Date()
    const currentHour = currentTime.getHours().toString().padStart(2, "0")
    const currentMinute = currentTime.getMinutes().toString().padStart(2, "0")
    const currentTimeString = `${currentHour}:${currentMinute}`

    const dayNames = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"]
    const currentDay = dayNames[currentTime.getDay()]

    // Procesar reglas basadas en tiempo
    for (const rule of rules) {
      if (rule.type === "time_based" && rule.trigger_time) {
        const shouldTrigger = rule.trigger_time.includes(currentTimeString) && rule.days.includes(currentDay)

        if (shouldTrigger) {
          await triggerSOP(supabase, rule)
        }
      }
    }

    // Verificar reglas basadas en eventos (inventario)
    await checkInventoryRules(supabase, rules)

    // Verificar reglas basadas en turnos
    await checkShiftRules(supabase, rules, currentTime)

    // Procesar escalaciones de alertas
    await processAlertEscalations(supabase)

    return new Response(JSON.stringify({ success: true, processed_at: currentTime.toISOString() }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    })
  } catch (error) {
    console.error("Error in sequence engine:", error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    })
  }
})

async function triggerSOP(supabase: any, rule: any) {
  // Obtener empleados que pueden ejecutar este SOP
  const { data: empleados } = await supabase
    .from("empleados_pulso")
    .select(`
      *,
      sucursales (*)
    `)
    .in("rol_dual", rule.assign_to)
    .eq("estatus", "activo")

  for (const empleado of empleados || []) {
    // Crear ejecución de SOP
    const { data: execution, error } = await supabase
      .from("sops_execution")
      .insert({
        sop_id: rule.sop_id,
        empleado_id: empleado.id,
        sucursal_id: empleado.sucursal_asignada,
        status: "pending",
        assigned_by_rule: rule.id,
      })
      .select()
      .single()

    if (!error) {
      // Enviar notificación por WhatsApp
      await sendWhatsAppNotification(supabase, empleado, rule, execution)
    }
  }
}

async function checkInventoryRules(supabase: any, rules: any[]) {
  const inventoryRules = rules.filter((rule) => rule.type === "event_based")

  for (const rule of inventoryRules) {
    if (rule.condition?.type === "threshold_met") {
      const { item, operator, value } = rule.condition.parameters

      const { data: inventoryItem } = await supabase
        .from("inventory_tracking")
        .select("*")
        .eq("item_name", item)
        .single()

      if (inventoryItem) {
        let shouldTrigger = false

        switch (operator) {
          case "<":
            shouldTrigger = inventoryItem.current_stock < value
            break
          case ">":
            shouldTrigger = inventoryItem.current_stock > value
            break
          case "<=":
            shouldTrigger = inventoryItem.current_stock <= value
            break
          case ">=":
            shouldTrigger = inventoryItem.current_stock >= value
            break
        }

        if (shouldTrigger) {
          await triggerSOP(supabase, rule)
        }
      }
    }
  }
}

async function checkShiftRules(supabase: any, rules: any[], currentTime: Date) {
  // Implementar lógica para reglas basadas en turnos
  const shiftRules = rules.filter((rule) => rule.type === "shift_based")

  // Esta función se ejecutaría al inicio/fin de turnos
  // Por simplicidad, aquí solo mostramos la estructura
}

async function processAlertEscalations(supabase: any) {
  // Obtener SOPs pendientes que necesitan escalación
  const { data: pendingSOPs } = await supabase
    .from("sops_execution")
    .select(`
      *,
      checklist_templates (nombre),
      empleados_pulso (nombre, apellidos, whatsapp),
      sucursales (nombre)
    `)
    .eq("status", "pending")
    .lt("created_at", new Date(Date.now() - 5 * 60 * 1000).toISOString()) // 5 minutos

  for (const sop of pendingSOPs || []) {
    const minutesPending = Math.floor((Date.now() - new Date(sop.created_at).getTime()) / (1000 * 60))

    let escalationLevel = 1
    let notifyRoles = []
    let message = ""

    if (minutesPending >= 30) {
      escalationLevel = 3
      notifyRoles = ["gerente_general"]
      message = `🚨 URGENTE: SOP '${sop.checklist_templates.nombre}' pendiente en ${sop.sucursales.nombre}. No se ha completado tras ${minutesPending} minutos.`
    } else if (minutesPending >= 15) {
      escalationLevel = 2
      notifyRoles = ["supervisor", "gerente_sucursal"]
      message = `⚠️ El SOP '${sop.checklist_templates.nombre}' aún no se ha completado. Asignado a ti.`
    } else if (minutesPending >= 5) {
      escalationLevel = 1
      message = `⏰ ¡Recuerda completar tu SOP! ${sop.checklist_templates.nombre}`
    }

    if (escalationLevel > (sop.escalation_level ?? 0)) {
      // Declare escalation_level variable
      // Actualizar nivel de escalación
      await supabase.from("sops_execution").update({ escalation_level: escalationLevel }).eq("id", sop.id)

      // Crear alerta
      await supabase.from("alerts_log").insert({
        type: "sop_escalation",
        level: escalationLevel,
        message,
        recipient_id: sop.empleado_id,
        recipient_type: "empleado_pulso",
        sop_execution_id: sop.id,
        metadata: { notify_roles: notifyRoles },
      })

      // Enviar notificaciones
      if (escalationLevel === 1) {
        await sendWhatsAppMessage(sop.empleados_pulso.whatsapp, message)
      } else {
        // Notificar a supervisores
        await notifySupervisors(supabase, notifyRoles, message, sop.sucursales.id)
      }
    }
  }
}

async function sendWhatsAppNotification(supabase: any, empleado: any, rule: any, execution: any) {
  const message = `📋 Nuevo SOP asignado: ${rule.description}\n\n⏰ Tiempo estimado: ${rule.tiempo_estimado || 15} min\n🔗 Completar: https://pulso-app.vercel.app/sop/${execution.id}`

  await sendWhatsAppMessage(empleado.whatsapp, message)
}

async function sendWhatsAppMessage(phoneNumber: string, message: string) {
  const whatsappToken = Deno.env.get("WHATSAPP_ACCESS_TOKEN")
  const phoneNumberId = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID")

  if (!whatsappToken || !phoneNumberId) {
    console.error("WhatsApp credentials not configured")
    return
  }

  try {
    const response = await fetch(`https://graph.facebook.com/v17.0/${phoneNumberId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${whatsappToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: phoneNumber.replace("+", ""),
        type: "text",
        text: {
          body: message,
        },
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error("Error sending WhatsApp message:", error)
    }
  } catch (error) {
    console.error("Error sending WhatsApp message:", error)
  }
}

async function notifySupervisors(supabase: any, roles: string[], message: string, sucursalId: string) {
  const { data: supervisors } = await supabase
    .from("usuarios")
    .select("*")
    .in("rol", roles)
    .contains("sucursal_acceso", [sucursalId])

  for (const supervisor of supervisors || []) {
    if (supervisor.whatsapp) {
      await sendWhatsAppMessage(supervisor.whatsapp, message)
    }
  }
}
