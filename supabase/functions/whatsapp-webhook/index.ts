import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { Deno } from "https://deno.land/std@0.168.0/node/global.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

interface WhatsAppMessage {
  object: string
  entry: Array<{
    id: string
    changes: Array<{
      value: {
        messaging_product: string
        metadata: {
          display_phone_number: string
          phone_number_id: string
        }
        messages?: Array<{
          from: string
          id: string
          timestamp: string
          text: {
            body: string
          }
          type: string
        }>
        statuses?: Array<{
          id: string
          status: string
          timestamp: string
          recipient_id: string
        }>
      }
      field: string
    }>
  }>
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "")

    if (req.method === "GET") {
      // Verificación del webhook de WhatsApp
      const url = new URL(req.url)
      const mode = url.searchParams.get("hub.mode")
      const token = url.searchParams.get("hub.verify_token")
      const challenge = url.searchParams.get("hub.challenge")

      if (mode === "subscribe" && token === Deno.env.get("WHATSAPP_VERIFY_TOKEN")) {
        return new Response(challenge, {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "text/plain" },
        })
      }

      return new Response("Forbidden", { status: 403, headers: corsHeaders })
    }

    if (req.method === "POST") {
      const body: WhatsAppMessage = await req.json()

      // Procesar mensajes entrantes
      for (const entry of body.entry) {
        for (const change of entry.changes) {
          if (change.value.messages) {
            for (const message of change.value.messages) {
              // Guardar mensaje en la base de datos
              const { error: insertError } = await supabase.from("whatsapp_webhooks").insert({
                phone_number: message.from,
                message_id: message.id,
                message_type: message.type,
                message_content: message.text?.body || "",
                timestamp: new Date(Number.parseInt(message.timestamp) * 1000).toISOString(),
                status: "received",
                processed: false,
              })

              if (insertError) {
                console.error("Error inserting webhook:", insertError)
                continue
              }

              // Procesar el mensaje
              await processWhatsAppMessage(supabase, message)
            }
          }

          // Procesar actualizaciones de estado
          if (change.value.statuses) {
            for (const status of change.value.statuses) {
              await supabase.from("whatsapp_webhooks").update({ status: status.status }).eq("message_id", status.id)
            }
          }
        }
      }

      return new Response("OK", {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "text/plain" },
      })
    }

    return new Response("Method not allowed", { status: 405, headers: corsHeaders })
  } catch (error) {
    console.error("Error processing webhook:", error)
    return new Response("Internal Server Error", {
      status: 500,
      headers: corsHeaders,
    })
  }
})

async function processWhatsAppMessage(supabase: any, message: any) {
  const phoneNumber = message.from
  const messageText = message.text?.body?.toLowerCase() || ""

  // Buscar usuario o empleado por número de WhatsApp
  const { data: usuario } = await supabase.from("usuarios").select("*").eq("whatsapp", `+${phoneNumber}`).single()

  const { data: empleado } = await supabase
    .from("empleados_pulso")
    .select("*")
    .eq("whatsapp", `+${phoneNumber}`)
    .single()

  let response = ""

  if (messageText.includes("reporte") || messageText.includes("checklist")) {
    if (empleado) {
      // Obtener checklists pendientes para el empleado
      const { data: checklists } = await supabase
        .from("checklist_templates")
        .select("*")
        .eq("categoria", empleado.rol_dual)
        .eq("activo", true)

      if (checklists && checklists.length > 0) {
        response = `Hola ${empleado.nombre}! 📋\n\nTienes ${checklists.length} checklist(s) disponibles:\n\n`
        checklists.forEach((checklist: any, index: number) => {
          response += `${index + 1}. ${checklist.nombre}\n   ⏱️ ${checklist.tiempo_estimado_minutos} min\n\n`
        })
        response += "Responde con el número del checklist que quieres completar."
      } else {
        response = `Hola ${empleado.nombre}! No tienes checklists pendientes en este momento. ✅`
      }
    } else {
      response = "No se encontró tu perfil de empleado. Contacta a tu supervisor."
    }
  } else if (messageText.includes("estado") || messageText.includes("dashboard")) {
    if (usuario) {
      // Obtener métricas del dashboard
      const { data: metricas } = await supabase
        .from("dashboard_metricas")
        .select("*")
        .eq("empresa_id", usuario.empresa_id)
        .order("fecha", { ascending: false })
        .limit(1)
        .single()

      if (metricas) {
        response = `📊 Dashboard - ${new Date().toLocaleDateString()}\n\n`
        response += `👥 Empleados activos: ${metricas.metricas_operativas?.empleados_activos || 0}\n`
        response += `🏪 Sucursales operando: ${metricas.metricas_operativas?.sucursales_operando || 0}\n`
        response += `📋 Reportes completados: ${metricas.metricas_operativas?.reportes_completados || 0}\n`
        response += `⚠️ Incidencias: ${metricas.metricas_operativas?.incidencias_detectadas || 0}\n`
        response += `✅ Cumplimiento: ${metricas.metricas_operativas?.cumplimiento_checklists || 0}%`
      } else {
        response = "No hay datos de dashboard disponibles."
      }
    } else {
      response = "No tienes permisos para ver el dashboard."
    }
  } else if (messageText.includes("ayuda") || messageText.includes("help")) {
    response = `🤖 Comandos disponibles:\n\n`
    response += `📋 "reporte" o "checklist" - Ver checklists pendientes\n`
    response += `📊 "estado" o "dashboard" - Ver métricas\n`
    response += `🎫 "tickets" - Ver tickets asignados\n`
    response += `❓ "ayuda" - Mostrar este menú\n\n`
    response += `Para completar un checklist, responde con el número correspondiente.`
  } else if (/^\d+$/.test(messageText)) {
    // Usuario seleccionó un checklist por número
    if (empleado) {
      const checklistNumber = Number.parseInt(messageText) - 1
      const { data: checklists } = await supabase
        .from("checklist_templates")
        .select("*")
        .eq("categoria", empleado.rol_dual)
        .eq("activo", true)

      if (checklists && checklists[checklistNumber]) {
        const checklist = checklists[checklistNumber]
        response = `📋 ${checklist.nombre}\n\n`
        response += `📝 ${checklist.descripcion}\n`
        response += `⏱️ Tiempo estimado: ${checklist.tiempo_estimado_minutos} min\n\n`
        response += `Para completar este checklist, ve a la aplicación web:\n`
        response += `🔗 https://pulso-app.vercel.app/checklist/${checklist.id}`
      } else {
        response = 'Número de checklist inválido. Escribe "reporte" para ver las opciones disponibles.'
      }
    }
  } else {
    response = `Hola! 👋 No entendí tu mensaje.\n\nEscribe "ayuda" para ver los comandos disponibles.`
  }

  // Enviar respuesta por WhatsApp
  await sendWhatsAppMessage(phoneNumber, response)

  // Marcar mensaje como procesado
  await supabase.from("whatsapp_webhooks").update({ processed: true, response_sent: true }).eq("message_id", message.id)
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
        to: phoneNumber,
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
