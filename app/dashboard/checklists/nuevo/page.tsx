"use client"

import { ChecklistForm } from "@/components/checklist-form"

export default function NuevoChecklistPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Nuevo Checklist</h1>
      <p className="text-muted-foreground">Crea un nuevo template de checklist</p>
      <div className="mt-4">
        <ChecklistForm />
      </div>
    </div>
  )
}
