import { BMADAnalysis } from "@/components/bmad-analysis"
import { createClient } from "@/lib/supabase/server"

export default async function BMADPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Obtener datos de la empresa para el análisis
  const { data: empresaData } = await supabase
    .from("empresas")
    .select("*")
    .eq("id", user?.user_metadata?.empresa_id)
    .single()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <BMADAnalysis empresaData={empresaData} />
    </div>
  )
}
