"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { OnboardingWizard } from "@/components/onboarding-wizard"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export default function OnboardingPage() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkUserStatus()
  }, [])

  const checkUserStatus = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/login")
        return
      }

      setUser(user)

      // Verificar si el usuario ya completó el onboarding
      const { data: empresa } = await supabase.from("empresas").select("*").eq("propietario_email", user.email).single()

      if (empresa) {
        // Usuario ya tiene empresa, redirigir al dashboard
        router.push("/dashboard")
        return
      }

      // Verificar si es una invitación
      const { data: invitation } = await supabase
        .from("user_invitations")
        .select("*")
        .eq("email", user.email)
        .eq("status", "pending")
        .single()

      if (invitation) {
        // Es una invitación, redirigir a aceptar invitación
        router.push(`/accept-invitation/${invitation.invitation_token}`)
        return
      }
    } catch (error) {
      console.error("Error checking user status:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-96">
          <CardContent className="flex items-center justify-center p-8">
            <div className="text-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
              <p className="text-muted-foreground">Verificando estado del usuario...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">¡Bienvenido a PULSO HORECA!</h1>
          <p className="text-xl text-gray-600">Configuremos tu empresa en unos simples pasos</p>
        </div>

        <OnboardingWizard user={user} />
      </div>
    </div>
  )
}
