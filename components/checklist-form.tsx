"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export const ChecklistForm = () => {
  const [nombre, setNombre] = useState("")
  const [categoria, setCategoria] = useState("")
  const [descripcion, setDescripcion] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission logic here
    console.log("Form submitted:", { nombre, categoria, descripcion })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Crear Nuevo Checklist</CardTitle>
        <CardDescription>Completa el formulario para crear un nuevo template de checklist.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre del Checklist</Label>
            <Input
              id="nombre"
              type="text"
              placeholder="Ej. Limpieza de Cocina - Cierre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoria">Categoría</Label>
            <Select onValueChange={setCategoria}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="limpieza">Limpieza</SelectItem>
                <SelectItem value="seguridad">Seguridad</SelectItem>
                <SelectItem value="atencion_cliente">Atención al Cliente</SelectItem>
                <SelectItem value="operaciones">Operaciones</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea
              id="descripcion"
              placeholder="Describe el propósito del checklist"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={3}
            />
          </div>

          <Button type="submit">Crear Checklist</Button>
        </form>
      </CardContent>
    </Card>
  )
}
