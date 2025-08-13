"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Camera,
  Mic,
  Upload,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Thermometer,
  MessageSquare,
  Sparkles,
  Brain,
  Eye,
  Volume2,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface AIVerificationWidgetProps {
  sopId: string
  empleadoId: string
  stepName: string
  verificationType?: "image" | "audio" | "text" | "temperature" | "all"
  onVerificationComplete?: (result: any) => void
}

export function AIVerificationWidget({
  sopId,
  empleadoId,
  stepName,
  verificationType = "all",
  onVerificationComplete,
}: AIVerificationWidgetProps) {
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationResult, setVerificationResult] = useState<any>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [textInput, setTextInput] = useState("")
  const [temperatureValue, setTemperatureValue] = useState("")
  const [isRecording, setIsRecording] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const supabase = createClient()

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (error) {
      console.error("Error accessing camera:", error)
    }
  }

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas")
      const context = canvas.getContext("2d")
      canvas.width = videoRef.current.videoWidth
      canvas.height = videoRef.current.videoHeight

      if (context) {
        context.drawImage(videoRef.current, 0, 0)
        const imageData = canvas.toDataURL("image/jpeg", 0.8)
        setCapturedImage(imageData)

        // Stop camera stream
        const stream = videoRef.current.srcObject as MediaStream
        stream?.getTracks().forEach((track) => track.stop())
      }
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder

      const chunks: BlobPart[] = []
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data)
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/wav" })
        setAudioBlob(blob)
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error("Error starting recording:", error)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setCapturedImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const performAIVerification = async (type: string, content: any) => {
    setIsVerifying(true)

    try {
      const response = await supabase.functions.invoke("ai-verification", {
        body: {
          type,
          content,
          sopId,
          empleadoId,
          metadata: {
            stepName,
            timestamp: new Date().toISOString(),
          },
        },
      })

      if (response.error) {
        throw new Error(response.error.message)
      }

      const result = response.data
      setVerificationResult(result)
      onVerificationComplete?.(result)
    } catch (error) {
      console.error("Error en verificación AI:", error)
      setVerificationResult({
        type,
        passed: false,
        confidence: 0,
        feedback: "Error al procesar la verificación. Intenta nuevamente.",
        severity: "error",
      })
    } finally {
      setIsVerifying(false)
    }
  }

  const getResultIcon = (result: any) => {
    if (result.passed) return <CheckCircle className="h-5 w-5 text-green-500" />
    if (result.severity === "critical") return <AlertTriangle className="h-5 w-5 text-red-500 animate-pulse" />
    return <AlertTriangle className="h-5 w-5 text-orange-500" />
  }

  const getResultColor = (result: any) => {
    if (result.passed) return "border-green-200 bg-green-50"
    if (result.severity === "critical") return "border-red-200 bg-red-50"
    return "border-orange-200 bg-orange-50"
  }

  return (
    <Card className="bg-white/80 backdrop-blur border-white/20 shadow-xl">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Brain className="h-5 w-5 text-purple-500" />
          <CardTitle className="text-lg">Verificación AI</CardTitle>
          <Badge className="bg-purple-100 text-purple-800">
            <Sparkles className="mr-1 h-3 w-3" />
            Inteligente
          </Badge>
        </div>
        <CardDescription>Verificación automática para: {stepName}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {!verificationResult ? (
          <Tabs defaultValue="image" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="image" className="flex items-center">
                <Eye className="mr-1 h-4 w-4" />
                Foto
              </TabsTrigger>
              <TabsTrigger value="audio" className="flex items-center">
                <Volume2 className="mr-1 h-4 w-4" />
                Audio
              </TabsTrigger>
              <TabsTrigger value="text" className="flex items-center">
                <MessageSquare className="mr-1 h-4 w-4" />
                Texto
              </TabsTrigger>
              <TabsTrigger value="temperature" className="flex items-center">
                <Thermometer className="mr-1 h-4 w-4" />
                Temp
              </TabsTrigger>
            </TabsList>

            <TabsContent value="image" className="space-y-4">
              <div className="text-center space-y-4">
                {!capturedImage ? (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full max-w-md mx-auto rounded-lg border"
                      style={{ display: videoRef.current?.srcObject ? "block" : "none" }}
                    />

                    <div className="flex space-x-2 justify-center">
                      <Button onClick={startCamera} variant="outline">
                        <Camera className="mr-2 h-4 w-4" />
                        Abrir Cámara
                      </Button>

                      <Button onClick={() => fileInputRef.current?.click()} variant="outline">
                        <Upload className="mr-2 h-4 w-4" />
                        Subir Foto
                      </Button>
                    </div>

                    {videoRef.current?.srcObject && (
                      <Button onClick={capturePhoto} className="bg-blue-500 hover:bg-blue-600">
                        <Camera className="mr-2 h-4 w-4" />
                        Capturar Foto
                      </Button>
                    )}

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </>
                ) : (
                  <div className="space-y-4">
                    <img
                      src={capturedImage || "/placeholder.svg"}
                      alt="Captured"
                      className="w-full max-w-md mx-auto rounded-lg border"
                    />

                    <div className="flex space-x-2 justify-center">
                      <Button
                        onClick={() => performAIVerification("image", capturedImage)}
                        disabled={isVerifying}
                        className="bg-purple-500 hover:bg-purple-600"
                      >
                        {isVerifying ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Brain className="mr-2 h-4 w-4" />
                        )}
                        Verificar con AI
                      </Button>

                      <Button onClick={() => setCapturedImage(null)} variant="outline">
                        Tomar Otra
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="audio" className="space-y-4">
              <div className="text-center space-y-4">
                {!audioBlob ? (
                  <div className="space-y-4">
                    <div className="p-8 border-2 border-dashed border-gray-300 rounded-lg">
                      <Mic className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-600">Graba tu reporte de voz</p>
                    </div>

                    <Button
                      onClick={isRecording ? stopRecording : startRecording}
                      className={isRecording ? "bg-red-500 hover:bg-red-600" : "bg-blue-500 hover:bg-blue-600"}
                    >
                      <Mic className={`mr-2 h-4 w-4 ${isRecording ? "animate-pulse" : ""}`} />
                      {isRecording ? "Detener Grabación" : "Iniciar Grabación"}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <CheckCircle className="h-6 w-6 text-green-500 mx-auto mb-2" />
                      <p className="text-green-800">Audio grabado exitosamente</p>
                    </div>

                    <div className="flex space-x-2 justify-center">
                      <Button
                        onClick={() => performAIVerification("audio", audioBlob)}
                        disabled={isVerifying}
                        className="bg-purple-500 hover:bg-purple-600"
                      >
                        {isVerifying ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Brain className="mr-2 h-4 w-4" />
                        )}
                        Verificar con AI
                      </Button>

                      <Button onClick={() => setAudioBlob(null)} variant="outline">
                        Grabar Nuevo
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="text" className="space-y-4">
              <div className="space-y-4">
                <Textarea
                  placeholder="Describe lo que observaste, mediste o verificaste..."
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  className="min-h-[120px]"
                />

                <Button
                  onClick={() => performAIVerification("text", textInput)}
                  disabled={isVerifying || !textInput.trim()}
                  className="w-full bg-purple-500 hover:bg-purple-600"
                >
                  {isVerifying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Brain className="mr-2 h-4 w-4" />}
                  Verificar Respuesta con AI
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="temperature" className="space-y-4">
              <div className="space-y-4">
                <div className="text-center">
                  <Thermometer className="h-12 w-12 mx-auto text-blue-500 mb-4" />
                  <p className="text-gray-600 mb-4">Ingresa la temperatura registrada</p>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Ej: 2.5"
                    value={temperatureValue}
                    onChange={(e) => setTemperatureValue(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-gray-500">°C</span>
                </div>

                <Button
                  onClick={() =>
                    performAIVerification("temperature", {
                      value: temperatureValue,
                      expectedRange: { min: 0, max: 4 },
                    })
                  }
                  disabled={isVerifying || !temperatureValue}
                  className="w-full bg-purple-500 hover:bg-purple-600"
                >
                  {isVerifying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Brain className="mr-2 h-4 w-4" />}
                  Verificar Temperatura con AI
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className={`p-6 rounded-xl border-2 ${getResultColor(verificationResult)}`}>
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">{getResultIcon(verificationResult)}</div>

              <div className="flex-1 space-y-4">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold">
                      {verificationResult.passed ? "✅ Verificación Exitosa" : "⚠️ Verificación Fallida"}
                    </h3>
                    <Badge
                      variant={verificationResult.passed ? "default" : "destructive"}
                      className={verificationResult.passed ? "bg-green-100 text-green-800" : ""}
                    >
                      {Math.round(verificationResult.confidence * 100)}% confianza
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Puntuación AI:</span>
                      <span className="font-bold">{verificationResult.score}/100</span>
                    </div>
                    <Progress value={verificationResult.score} className="h-2" />
                  </div>
                </div>

                <div className="bg-white/50 rounded-lg p-4">
                  <h4 className="font-medium mb-2">Análisis Detallado:</h4>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{verificationResult.feedback}</p>
                </div>

                {verificationResult.recommendations && verificationResult.recommendations.length > 0 && (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-medium mb-2 text-blue-800">Recomendaciones:</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      {verificationResult.recommendations.map((rec: string, index: number) => (
                        <li key={index} className="flex items-start">
                          <span className="mr-2">•</span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {verificationResult.analysis && (
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(verificationResult.analysis).map(([key, value]) => (
                      <div key={key} className="text-center">
                        <div className="text-lg font-bold text-gray-800">{value as string}</div>
                        <div className="text-xs text-gray-500 capitalize">{key.replace("_", " ")}</div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex space-x-2">
                  <Button onClick={() => setVerificationResult(null)} variant="outline" className="flex-1">
                    Nueva Verificación
                  </Button>

                  {verificationResult.passed && (
                    <Button className="flex-1 bg-green-500 hover:bg-green-600">
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Continuar
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
