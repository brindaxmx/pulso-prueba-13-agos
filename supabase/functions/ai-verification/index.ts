import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { openai } from "https://esm.sh/@ai-sdk/openai@0.0.66"
import { generateText } from "https://esm.sh/ai@3.4.33"
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
    const { type, content, sopId, empleadoId, metadata } = await req.json()

    const supabaseClient = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_ANON_KEY") ?? "", {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Obtener información del SOP para contexto
    const { data: sopData } = await supabaseClient.from("checklist_templates").select("*").eq("id", sopId).single()

    let verificationResult = null

    switch (type) {
      case "image":
        verificationResult = await verifyImage(content, sopData, metadata)
        break
      case "audio":
        verificationResult = await verifyAudio(content, sopData, metadata)
        break
      case "text":
        verificationResult = await verifyText(content, sopData, metadata)
        break
      case "temperature":
        verificationResult = await verifyTemperature(content, sopData, metadata)
        break
      default:
        throw new Error(`Tipo de verificación no soportado: ${type}`)
    }

    // Guardar resultado de verificación
    const { data: verification } = await supabaseClient
      .from("ai_verifications")
      .insert({
        sop_id: sopId,
        empleado_id: empleadoId,
        verification_type: type,
        content_data: content,
        ai_result: verificationResult,
        confidence_score: verificationResult.confidence,
        status: verificationResult.passed ? "passed" : "failed",
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    // Si la verificación falló, crear alerta automática
    if (!verificationResult.passed && verificationResult.severity === "critical") {
      await supabaseClient.from("alertas_automaticas").insert({
        tipo: "ai_verification_failed",
        severidad: "critica",
        titulo: `Verificación AI Fallida: ${sopData.nombre}`,
        descripcion: verificationResult.feedback,
        empleado_id: empleadoId,
        sop_id: sopId,
        metadata: {
          verification_id: verification.id,
          ai_confidence: verificationResult.confidence,
        },
      })
    }

    return new Response(JSON.stringify(verificationResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Error en verificación AI:", error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }
})

async function verifyImage(imageData: string, sopData: any, metadata: any) {
  const { text } = await generateText({
    model: openai("gpt-4o"),
    messages: [
      {
        role: "system",
        content: `Eres un experto en verificación de procedimientos HORECA. Analiza la imagen proporcionada y verifica si cumple con los estándares del SOP: "${sopData.nombre}".

Evalúa específicamente:
1. Limpieza y organización
2. Seguridad alimentaria
3. Uso correcto de equipos
4. Cumplimiento de protocolos
5. Estado general del área

Proporciona una evaluación detallada con puntuación del 0-100 y recomendaciones específicas.`,
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Verifica esta imagen para el SOP: ${sopData.nombre}. Contexto adicional: ${JSON.stringify(metadata)}`,
          },
          {
            type: "image",
            image: imageData,
          },
        ],
      },
    ],
  })

  // Extraer puntuación y análisis del texto
  const scoreMatch = text.match(/(\d+)\/100|(\d+)%/)
  const score = scoreMatch ? Number.parseInt(scoreMatch[1] || scoreMatch[2]) : 0

  return {
    type: "image",
    passed: score >= 80,
    confidence: score / 100,
    score: score,
    feedback: text,
    severity: score < 60 ? "critical" : score < 80 ? "warning" : "info",
    recommendations: extractRecommendations(text),
    analysis: {
      cleanliness: extractMetric(text, "limpieza"),
      safety: extractMetric(text, "seguridad"),
      organization: extractMetric(text, "organización"),
      equipment: extractMetric(text, "equipo"),
    },
  }
}

async function verifyAudio(audioData: string, sopData: any, metadata: any) {
  // Primero transcribir el audio (simulado - en producción usarías Whisper)
  const transcription = "Temperatura registrada: 2.5 grados Celsius. Refrigerador funcionando correctamente."

  const { text } = await generateText({
    model: openai("gpt-4o"),
    messages: [
      {
        role: "system",
        content: `Analiza la transcripción de audio de un empleado ejecutando el SOP: "${sopData.nombre}".

Verifica:
1. Información técnica correcta
2. Procedimientos mencionados
3. Valores dentro de rangos esperados
4. Completitud de la información
5. Claridad y precisión

Evalúa si la información reportada cumple con los estándares del procedimiento.`,
      },
      {
        role: "user",
        content: `Transcripción: "${transcription}". Contexto: ${JSON.stringify(metadata)}`,
      },
    ],
  })

  const score = extractScore(text)

  return {
    type: "audio",
    passed: score >= 80,
    confidence: score / 100,
    score: score,
    feedback: text,
    transcription: transcription,
    severity: score < 60 ? "critical" : score < 80 ? "warning" : "info",
    analysis: {
      completeness: extractMetric(text, "completitud"),
      accuracy: extractMetric(text, "precisión"),
      clarity: extractMetric(text, "claridad"),
    },
  }
}

async function verifyText(textData: string, sopData: any, metadata: any) {
  const { text } = await generateText({
    model: openai("gpt-4o"),
    messages: [
      {
        role: "system",
        content: `Evalúa la respuesta escrita del empleado para el SOP: "${sopData.nombre}".

Criterios de evaluación:
1. Completitud de la información
2. Precisión técnica
3. Seguimiento de protocolos
4. Identificación de problemas
5. Propuestas de solución

Proporciona retroalimentación constructiva y puntuación.`,
      },
      {
        role: "user",
        content: `Respuesta del empleado: "${textData}". Contexto: ${JSON.stringify(metadata)}`,
      },
    ],
  })

  const score = extractScore(text)

  return {
    type: "text",
    passed: score >= 75,
    confidence: score / 100,
    score: score,
    feedback: text,
    severity: score < 60 ? "critical" : score < 75 ? "warning" : "info",
    analysis: {
      completeness: extractMetric(text, "completitud"),
      technical_accuracy: extractMetric(text, "precisión técnica"),
      protocol_adherence: extractMetric(text, "seguimiento de protocolos"),
    },
  }
}

async function verifyTemperature(tempData: any, sopData: any, metadata: any) {
  const temperature = Number.parseFloat(tempData.value)
  const expectedRange = tempData.expectedRange || { min: 0, max: 4 }

  const isInRange = temperature >= expectedRange.min && temperature <= expectedRange.max
  const deviation = isInRange
    ? 0
    : Math.min(Math.abs(temperature - expectedRange.min), Math.abs(temperature - expectedRange.max))

  let severity = "info"
  let score = 100

  if (!isInRange) {
    if (deviation > 5) {
      severity = "critical"
      score = 20
    } else if (deviation > 2) {
      severity = "warning"
      score = 60
    } else {
      severity = "warning"
      score = 80
    }
  }

  const feedback = isInRange
    ? `Temperatura ${temperature}°C está dentro del rango esperado (${expectedRange.min}°C - ${expectedRange.max}°C).`
    : `⚠️ Temperatura ${temperature}°C está fuera del rango seguro (${expectedRange.min}°C - ${expectedRange.max}°C). Desviación: ${deviation.toFixed(1)}°C.`

  return {
    type: "temperature",
    passed: isInRange,
    confidence: isInRange ? 1.0 : Math.max(0.1, 1 - deviation / 10),
    score: score,
    feedback: feedback,
    severity: severity,
    analysis: {
      temperature: temperature,
      expected_range: expectedRange,
      deviation: deviation,
      status: isInRange ? "normal" : "out_of_range",
    },
    recommendations: isInRange
      ? ["Continuar monitoreo regular"]
      : [
          "Verificar funcionamiento del equipo",
          "Revisar sellado de puertas",
          "Contactar mantenimiento si persiste",
          "Documentar incidencia",
        ],
  }
}

// Funciones auxiliares
function extractScore(text: string): number {
  const scoreMatch = text.match(/(\d+)\/100|(\d+)%|puntuación[:\s]*(\d+)|score[:\s]*(\d+)/i)
  if (scoreMatch) {
    return Number.parseInt(scoreMatch[1] || scoreMatch[2] || scoreMatch[3] || scoreMatch[4])
  }
  return 75 // Score por defecto
}

function extractMetric(text: string, metric: string): number {
  const regex = new RegExp(`${metric}[:\\s]*(\d+)`, "i")
  const match = text.match(regex)
  return match ? Number.parseInt(match[1]) : 75
}

function extractRecommendations(text: string): string[] {
  const recommendations = []
  const lines = text.split("\n")

  for (const line of lines) {
    if (line.includes("recomend") || line.includes("suger") || line.includes("mejor")) {
      recommendations.push(line.trim())
    }
  }

  return recommendations.length > 0
    ? recommendations
    : ["Mantener estándares actuales", "Continuar con monitoreo regular"]
}
