"use client"

import { useCallback } from "react"

import { useEffect } from "react"

import { useState } from "react"

import { createClient } from "@/lib/supabase/client"

export interface Permission {
  name: string
  category: string
  resource: string
  action: string
  criticality_level: number
}

export interface UserRole {
  role_id: string
  role_name: string
  hierarchy_level: number
  empresa_id: string
  sucursal_id?: string
  permissions: Permission[]
}

export class PermissionManager {
  private supabase = createClient()
  private userPermissions: Map<string, Permission[]> = new Map()
  private userRoles: Map<string, UserRole[]> = new Map()

  async getUserPermissions(userId: string, empresaId?: string): Promise<Permission[]> {
    const cacheKey = `${userId}_${empresaId || "all"}`

    if (this.userPermissions.has(cacheKey)) {
      return this.userPermissions.get(cacheKey)!
    }

    try {
      const { data } = await this.supabase.rpc("get_user_permissions", {
        p_user_id: userId,
        p_empresa_id: empresaId,
      })

      const permissions: Permission[] = data || []
      this.userPermissions.set(cacheKey, permissions)

      return permissions
    } catch (error) {
      console.error("Error fetching user permissions:", error)
      return []
    }
  }

  async getUserRoles(userId: string, empresaId?: string): Promise<UserRole[]> {
    const cacheKey = `${userId}_${empresaId || "all"}`

    if (this.userRoles.has(cacheKey)) {
      return this.userRoles.get(cacheKey)!
    }

    try {
      const query = this.supabase
        .from("user_roles")
        .select(`
          role_id,
          empresa_id,
          sucursal_id,
          roles (
            name,
            display_name,
            hierarchy_level
          ),
          role_permissions (
            permissions (
              name,
              category,
              resource,
              action,
              criticality_level
            )
          )
        `)
        .eq("user_id", userId)
        .eq("active", true)

      if (empresaId) {
        query.eq("empresa_id", empresaId)
      }

      const { data, error } = await query

      if (error) throw error

      const userRoles: UserRole[] =
        data?.map((ur: any) => ({
          role_id: ur.role_id,
          role_name: ur.roles?.name,
          hierarchy_level: ur.roles?.hierarchy_level || 0,
          empresa_id: ur.empresa_id,
          sucursal_id: ur.sucursal_id,
          permissions: ur.role_permissions?.map((rp: any) => rp.permissions).filter(Boolean) || [],
        })) || []

      this.userRoles.set(cacheKey, userRoles)
      return userRoles
    } catch (error) {
      console.error("Error fetching user roles:", error)
      return []
    }
  }

  async hasPermission(userId: string, permissionName: string, empresaId?: string): Promise<boolean> {
    try {
      const { data } = await this.supabase.rpc("user_has_permission", {
        p_user_id: userId,
        p_permission_name: permissionName,
        p_empresa_id: empresaId,
      })

      return data || false
    } catch (error) {
      console.error("Error checking permission:", error)
      return false
    }
  }

  async getMaxHierarchyLevel(userId: string, empresaId?: string): Promise<number> {
    const roles = await this.getUserRoles(userId, empresaId)
    return Math.max(...roles.map((role) => role.hierarchy_level), 0)
  }

  async canAccessResource(userId: string, resource: string, action: string, empresaId?: string): Promise<boolean> {
    const permissions = await this.getUserPermissions(userId, empresaId)
    return permissions.some((p) => p.resource === resource && p.action === action)
  }

  async canManageUser(managerId: string, targetUserId: string, empresaId: string): Promise<boolean> {
    const [managerRoles, targetRoles] = await Promise.all([
      this.getUserRoles(managerId, empresaId),
      this.getUserRoles(targetUserId, empresaId),
    ])

    const managerMaxLevel = Math.max(...managerRoles.map((r) => r.hierarchy_level), 0)
    const targetMaxLevel = Math.max(...targetRoles.map((r) => r.hierarchy_level), 0)

    // Un usuario puede gestionar a otros usuarios con nivel de jerarquía menor
    return managerMaxLevel > targetMaxLevel
  }

  clearCache(userId?: string) {
    if (userId) {
      // Limpiar cache específico del usuario
      const keysToDelete = Array.from(this.userPermissions.keys()).filter((key) => key.startsWith(userId))
      keysToDelete.forEach((key) => {
        this.userPermissions.delete(key)
        this.userRoles.delete(key)
      })
    } else {
      // Limpiar todo el cache
      this.userPermissions.clear()
      this.userRoles.clear()
    }
  }
}

// Instancia singleton
export const permissionManager = new PermissionManager()

// Hook para usar en componentes React
export function usePermissions(userId?: string, empresaId?: string) {
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [roles, setRoles] = useState<UserRole[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return

    const loadPermissions = async () => {
      setLoading(true)
      try {
        const [userPermissions, userRoles] = await Promise.all([
          permissionManager.getUserPermissions(userId, empresaId),
          permissionManager.getUserRoles(userId, empresaId),
        ])

        setPermissions(userPermissions)
        setRoles(userRoles)
      } catch (error) {
        console.error("Error loading permissions:", error)
      } finally {
        setLoading(false)
      }
    }

    loadPermissions()
  }, [userId, empresaId])

  const hasPermission = useCallback(
    (permissionName: string) => {
      return permissions.some((p) => p.name === permissionName)
    },
    [permissions],
  )

  const canAccessResource = useCallback(
    (resource: string, action: string) => {
      return permissions.some((p) => p.resource === resource && p.action === action)
    },
    [permissions],
  )

  const getMaxHierarchyLevel = useCallback(() => {
    return Math.max(...roles.map((role) => role.hierarchy_level), 0)
  }, [roles])

  return {
    permissions,
    roles,
    loading,
    hasPermission,
    canAccessResource,
    getMaxHierarchyLevel,
  }
}
