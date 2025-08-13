"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { permissionManager } from "@/lib/permissions"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, ShieldX } from "lucide-react"

interface PermissionGuardProps {
  children: React.ReactNode
  permission?: string
  resource?: string
  action?: string
  minHierarchyLevel?: number
  fallback?: React.ReactNode
  empresaId?: string
}

export function PermissionGuard({
  children,
  permission,
  resource,
  action,
  minHierarchyLevel,
  fallback,
  empresaId,
}: PermissionGuardProps) {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    checkPermissions()
  }, [permission, resource, action, minHierarchyLevel, empresaId])

  const checkPermissions = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setHasAccess(false)
        setLoading(false)
        return
      }

      let hasPermission = true

      // Verificar permiso específico
      if (permission) {
        hasPermission = await permissionManager.hasPermission(user.id, permission, empresaId)
      }

      // Verificar recurso y acción
      if (hasPermission && resource && action) {
        hasPermission = await permissionManager.canAccessResource(user.id, resource, action, empresaId)
      }

      // Verificar nivel mínimo de jerarquía
      if (hasPermission && minHierarchyLevel) {
        const maxLevel = await permissionManager.getMaxHierarchyLevel(user.id, empresaId)
        hasPermission = maxLevel >= minHierarchyLevel
      }

      setHasAccess(hasPermission)
    } catch (error) {
      console.error("Error checking permissions:", error)
      setHasAccess(false)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
        <span className="text-sm text-muted-foreground">Verificando permisos...</span>
      </div>
    )
  }

  if (!hasAccess) {
    return (
      fallback || (
        <Alert variant="destructive">
          <ShieldX className="h-4 w-4" />
          <AlertDescription>No tienes permisos para acceder a este contenido.</AlertDescription>
        </Alert>
      )
    )
  }

  return <>{children}</>
}
