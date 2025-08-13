-- Sistema de permisos granular para PULSO HORECA
-- Crear tabla de permisos
CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL, -- dashboard, automation, inventory, etc.
    resource VARCHAR(50) NOT NULL, -- checklist, report, user, etc.
    action VARCHAR(50) NOT NULL, -- create, read, update, delete, execute
    criticality_level INTEGER DEFAULT 1, -- 1-5 (1=low, 5=critical)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de roles con jerarquía
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    hierarchy_level INTEGER NOT NULL, -- 1-10 (10=owner, 1=basic employee)
    is_system_role BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de asignación de permisos a roles
CREATE TABLE role_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
    granted BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(role_id, permission_id)
);

-- Tabla de asignación de roles a usuarios
CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
    sucursal_id UUID REFERENCES sucursales(id) ON DELETE SET NULL,
    assigned_by UUID REFERENCES usuarios(id),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    active BOOLEAN DEFAULT true,
    UNIQUE(user_id, role_id, empresa_id)
);

-- Insertar permisos básicos
INSERT INTO permissions (name, description, category, resource, action, criticality_level) VALUES
-- Dashboard permissions
('dashboard.view', 'Ver dashboard principal', 'dashboard', 'dashboard', 'read', 1),
('dashboard.horeca.view', 'Ver dashboard HORECA', 'dashboard', 'horeca_dashboard', 'read', 2),
('dashboard.analytics.view', 'Ver analytics avanzados', 'dashboard', 'analytics', 'read', 3),

-- Checklist permissions
('checklist.view', 'Ver checklists', 'checklist', 'checklist', 'read', 1),
('checklist.create', 'Crear checklists', 'checklist', 'checklist', 'create', 3),
('checklist.edit', 'Editar checklists', 'checklist', 'checklist', 'update', 3),
('checklist.delete', 'Eliminar checklists', 'checklist', 'checklist', 'delete', 4),
('checklist.execute', 'Ejecutar checklists', 'checklist', 'checklist', 'execute', 2),

-- Automation permissions
('automation.view', 'Ver automatización', 'automation', 'automation', 'read', 2),
('automation.create', 'Crear reglas de automatización', 'automation', 'automation', 'create', 4),
('automation.edit', 'Editar reglas de automatización', 'automation', 'automation', 'update', 4),
('automation.delete', 'Eliminar reglas de automatización', 'automation', 'automation', 'delete', 5),

-- Inventory permissions
('inventory.view', 'Ver inventario', 'inventory', 'inventory', 'read', 1),
('inventory.edit', 'Editar inventario', 'inventory', 'inventory', 'update', 3),
('inventory.alerts.manage', 'Gestionar alertas de inventario', 'inventory', 'inventory_alerts', 'update', 3),

-- User management permissions
('users.view', 'Ver usuarios', 'users', 'user', 'read', 2),
('users.create', 'Crear usuarios', 'users', 'user', 'create', 4),
('users.edit', 'Editar usuarios', 'users', 'user', 'update', 4),
('users.delete', 'Eliminar usuarios', 'users', 'user', 'delete', 5),
('users.roles.manage', 'Gestionar roles de usuarios', 'users', 'user_roles', 'update', 5),

-- Reports permissions
('reports.view', 'Ver reportes', 'reports', 'report', 'read', 1),
('reports.create', 'Crear reportes', 'reports', 'report', 'create', 2),
('reports.export', 'Exportar reportes', 'reports', 'report', 'export', 2),

-- Audit permissions
('audit.view', 'Ver auditoría', 'audit', 'audit', 'read', 3),
('audit.rollback', 'Realizar rollbacks', 'audit', 'audit', 'rollback', 5),

-- Company settings permissions
('company.view', 'Ver configuración de empresa', 'company', 'company', 'read', 3),
('company.edit', 'Editar configuración de empresa', 'company', 'company', 'update', 5),

-- Tickets permissions
('tickets.view', 'Ver tickets', 'tickets', 'ticket', 'read', 1),
('tickets.create', 'Crear tickets', 'tickets', 'ticket', 'create', 1),
('tickets.assign', 'Asignar tickets', 'tickets', 'ticket', 'assign', 3),
('tickets.resolve', 'Resolver tickets', 'tickets', 'ticket', 'resolve', 2);

-- Insertar roles del sistema
INSERT INTO roles (name, display_name, description, hierarchy_level, is_system_role) VALUES
('owner', 'Propietario', 'Propietario de la empresa con acceso completo', 10, true),
('admin', 'Administrador', 'Administrador del sistema', 9, true),
('general_manager', 'Gerente General', 'Gerente general con acceso a múltiples sucursales', 8, true),
('branch_manager', 'Gerente de Sucursal', 'Gerente de una sucursal específica', 7, true),
('supervisor', 'Supervisor', 'Supervisor de área o turno', 6, true),
('chef', 'Chef/Cocinero', 'Personal de cocina', 5, true),
('waiter', 'Mesero', 'Personal de servicio', 4, true),
('cashier', 'Cajero', 'Personal de caja', 4, true),
('cleaner', 'Personal de Limpieza', 'Personal de limpieza', 3, true),
('warehouse', 'Almacenista', 'Personal de almacén', 4, true),
('security', 'Seguridad', 'Personal de seguridad', 3, true),
('maintenance', 'Mantenimiento', 'Personal de mantenimiento', 3, true);

-- Función para asignar permisos automáticamente por jerarquía
CREATE OR REPLACE FUNCTION assign_permissions_by_hierarchy()
RETURNS VOID AS $$
DECLARE
    role_record RECORD;
    permission_record RECORD;
BEGIN
    -- Para cada rol
    FOR role_record IN SELECT * FROM roles LOOP
        -- Para cada permiso
        FOR permission_record IN SELECT * FROM permissions LOOP
            -- Asignar permiso si el nivel de jerarquía es suficiente
            IF role_record.hierarchy_level >= permission_record.criticality_level THEN
                INSERT INTO role_permissions (role_id, permission_id, granted)
                VALUES (role_record.id, permission_record.id, true)
                ON CONFLICT (role_id, permission_id) DO NOTHING;
            END IF;
        END LOOP;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Ejecutar asignación automática
SELECT assign_permissions_by_hierarchy();

-- Función para verificar permisos de usuario
CREATE OR REPLACE FUNCTION user_has_permission(
    p_user_id UUID,
    p_permission_name VARCHAR,
    p_empresa_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    has_permission BOOLEAN := false;
BEGIN
    SELECT EXISTS(
        SELECT 1
        FROM user_roles ur
        JOIN role_permissions rp ON ur.role_id = rp.role_id
        JOIN permissions p ON rp.permission_id = p.id
        WHERE ur.user_id = p_user_id
        AND p.name = p_permission_name
        AND ur.active = true
        AND rp.granted = true
        AND (p_empresa_id IS NULL OR ur.empresa_id = p_empresa_id)
        AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
    ) INTO has_permission;
    
    RETURN has_permission;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener permisos de usuario
CREATE OR REPLACE FUNCTION get_user_permissions(
    p_user_id UUID,
    p_empresa_id UUID DEFAULT NULL
)
RETURNS TABLE(permission_name VARCHAR, category VARCHAR, resource VARCHAR, action VARCHAR) AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT p.name, p.category, p.resource, p.action
    FROM user_roles ur
    JOIN role_permissions rp ON ur.role_id = rp.role_id
    JOIN permissions p ON rp.permission_id = p.id
    WHERE ur.user_id = p_user_id
    AND ur.active = true
    AND rp.granted = true
    AND (p_empresa_id IS NULL OR ur.empresa_id = p_empresa_id)
    AND (ur.expires_at IS NULL OR ur.expires_at > NOW());
END;
$$ LANGUAGE plpgsql;

-- Tabla para invitaciones de usuarios
CREATE TABLE user_invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL,
    empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
    role_id UUID REFERENCES roles(id),
    sucursal_id UUID REFERENCES sucursales(id) ON DELETE SET NULL,
    invited_by UUID REFERENCES usuarios(id),
    invitation_token VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- pending, accepted, expired, cancelled
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
    accepted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para optimización
CREATE INDEX idx_user_roles_user_empresa ON user_roles(user_id, empresa_id);
CREATE INDEX idx_user_roles_active ON user_roles(active);
CREATE INDEX idx_role_permissions_role ON role_permissions(role_id);
CREATE INDEX idx_permissions_category ON permissions(category);
CREATE INDEX idx_user_invitations_token ON user_invitations(invitation_token);
CREATE INDEX idx_user_invitations_status ON user_invitations(status);

-- Triggers
CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
