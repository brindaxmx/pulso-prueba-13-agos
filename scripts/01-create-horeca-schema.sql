-- Crear extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Tabla de empresas HORECA
CREATE TABLE empresas_horeca (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR NOT NULL,
    rfc VARCHAR UNIQUE,
    razon_social TEXT,
    tipo_negocio VARCHAR NOT NULL CHECK (tipo_negocio IN ('restaurante', 'hotel', 'cafeteria', 'bar', 'catering')),
    direccion JSONB,
    contacto_principal JSONB,
    configuracion_regional JSONB DEFAULT '{"idioma": "es-MX", "moneda": "MXN", "zona_horaria": "America/Mexico_City"}',
    limites_plan JSONB DEFAULT '{"max_usuarios": 50, "max_checklists": 100, "max_sucursales": 5}',
    plan VARCHAR DEFAULT 'basic' CHECK (plan IN ('basic', 'professional', 'enterprise')),
    estatus VARCHAR DEFAULT 'activo' CHECK (estatus IN ('activo', 'inactivo', 'suspendido')),
    fecha_alta TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

-- Tabla de sucursales HORECA
CREATE TABLE sucursales_horeca (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID NOT NULL REFERENCES empresas_horeca(id),
    nombre VARCHAR NOT NULL,
    codigo VARCHAR NOT NULL UNIQUE,
    tipo VARCHAR NOT NULL CHECK (tipo IN ('restaurante', 'sucursal', 'cocina_central', 'almacen')),
    direccion JSONB NOT NULL,
    coordenadas JSONB,
    capacidad_comensales INTEGER,
    numero_mesas INTEGER,
    horarios_operacion JSONB,
    configuracion_turnos JSONB,
    responsable_id UUID,
    telefono VARCHAR,
    email VARCHAR,
    licencias_sanitarias JSONB,
    fecha_apertura DATE,
    estatus VARCHAR DEFAULT 'activo' CHECK (estatus IN ('activo', 'inactivo', 'mantenimiento')),
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de usuarios HORECA
CREATE TABLE usuarios_horeca (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID NOT NULL REFERENCES empresas_horeca(id),
    sucursal_id UUID REFERENCES sucursales_horeca(id),
    empleado_id VARCHAR,
    email VARCHAR NOT NULL UNIQUE,
    password_hash VARCHAR NOT NULL,
    nombre VARCHAR NOT NULL,
    apellidos VARCHAR,
    telefono VARCHAR,
    whatsapp VARCHAR,
    foto_perfil TEXT,
    datos_laborales JSONB DEFAULT '{}',
    rol_principal VARCHAR NOT NULL CHECK (rol_principal IN ('super_admin', 'admin', 'gerente', 'supervisor', 'chef', 'cocinero', 'mesero', 'hostess', 'barista', 'limpieza', 'almacenista')),
    roles_adicionales VARCHAR[],
    permisos JSONB DEFAULT '{}',
    configuraciones JSONB DEFAULT '{"notificaciones": {"email": true, "whatsapp": true}}',
    certificaciones JSONB DEFAULT '[]',
    horarios_trabajo JSONB,
    estado VARCHAR DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo', 'suspendido', 'vacaciones')),
    ultimo_acceso TIMESTAMP WITH TIME ZONE,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    departamento VARCHAR(100),
    turno_asignado VARCHAR(20),
    supervisor_id UUID REFERENCES usuarios_horeca(id),
    fecha_ingreso DATE,
    estatus VARCHAR(20) DEFAULT 'activo'
);

-- Tabla de flows HORECA (SOPs)
CREATE TABLE flows_horeca (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID NOT NULL REFERENCES empresas_horeca(id),
    sucursal_id UUID REFERENCES sucursales_horeca(id),
    nombre VARCHAR NOT NULL,
    descripcion TEXT,
    tipo VARCHAR NOT NULL CHECK (tipo IN ('apertura', 'cierre', 'recepcion_proveedores', 'preparacion_alimentos', 'servicio_mesa', 'limpieza', 'inventario', 'mantenimiento', 'seguridad_alimentaria')),
    categoria VARCHAR,
    version VARCHAR DEFAULT '1.0',
    configuracion JSONB NOT NULL DEFAULT '{}',
    pasos JSONB NOT NULL DEFAULT '[]',
    triggers JSONB DEFAULT '[]',
    tiempo_estimado_minutos INTEGER,
    frecuencia VARCHAR,
    areas_aplicables VARCHAR[],
    roles_autorizados VARCHAR[],
    equipos_involucrados VARCHAR[],
    documentos_generados VARCHAR[],
    activo BOOLEAN DEFAULT true,
    creado_por UUID NOT NULL REFERENCES usuarios_horeca(id),
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    duracion_estimada INTEGER,
    prioridad VARCHAR(20) DEFAULT 'medium',
    roles_permitidos VARCHAR[] DEFAULT '{}',
    categoria_repse VARCHAR(100),
    cfdi_clave_servicio VARCHAR(50),
    escalation_rules JSONB DEFAULT '{}',
    quality_checks JSONB DEFAULT '{}'
);

-- Tabla de ejecuciones de flows
CREATE TABLE flow_ejecuciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    flow_id UUID NOT NULL REFERENCES flows_horeca(id),
    sucursal_id UUID NOT NULL REFERENCES sucursales_horeca(id),
    usuario_id UUID NOT NULL REFERENCES usuarios_horeca(id),
    estado VARCHAR DEFAULT 'iniciado' CHECK (estado IN ('iniciado', 'en_progreso', 'completado', 'fallido', 'cancelado')),
    fecha_inicio TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_completado TIMESTAMP WITH TIME ZONE,
    duracion_minutos INTEGER,
    pasos_completados INTEGER DEFAULT 0,
    pasos_totales INTEGER NOT NULL,
    puntuacion_final NUMERIC,
    observaciones TEXT,
    ubicacion_gps JSONB,
    metadata JSONB DEFAULT '{}',
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de pasos completados
CREATE TABLE flow_pasos_completados (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ejecucion_id UUID NOT NULL REFERENCES flow_ejecuciones(id),
    paso_numero INTEGER NOT NULL,
    nombre_paso VARCHAR NOT NULL,
    tipo_paso VARCHAR NOT NULL,
    datos_recolectados JSONB DEFAULT '{}',
    archivos_adjuntos JSONB DEFAULT '[]',
    firmas_digitales JSONB DEFAULT '[]',
    validaciones JSONB DEFAULT '{}',
    tiempo_completado_minutos INTEGER,
    usuario_id UUID NOT NULL REFERENCES usuarios_horeca(id),
    fecha_completado TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    observaciones TEXT
);

-- Tabla de activos HORECA
CREATE TABLE activos_horeca (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID NOT NULL REFERENCES empresas_horeca(id),
    sucursal_id UUID NOT NULL REFERENCES sucursales_horeca(id),
    codigo_interno VARCHAR NOT NULL UNIQUE,
    codigo_qr VARCHAR UNIQUE,
    nombre VARCHAR NOT NULL,
    descripcion TEXT,
    tipo VARCHAR NOT NULL CHECK (tipo IN ('equipos_cocina', 'refrigeracion', 'equipos_servicio', 'mobiliario_salon', 'sistemas_pos', 'equipos_limpieza')),
    subtipo VARCHAR,
    categoria VARCHAR,
    marca VARCHAR,
    modelo VARCHAR,
    numero_serie VARCHAR,
    año_fabricacion INTEGER,
    especificaciones_tecnicas JSONB DEFAULT '{}',
    ubicacion JSONB NOT NULL,
    estado_operativo VARCHAR DEFAULT 'operativo' CHECK (estado_operativo IN ('operativo', 'mantenimiento', 'fuera_servicio', 'en_reparacion')),
    criticidad VARCHAR DEFAULT 'media' CHECK (criticidad IN ('muy_alta', 'alta', 'media', 'baja')),
    responsable_id UUID REFERENCES usuarios_horeca(id),
    proveedor_info JSONB DEFAULT '{}',
    informacion_financiera JSONB DEFAULT '{}',
    fecha_adquisicion DATE,
    garantia_vencimiento DATE,
    proximo_mantenimiento DATE,
    documentos JSONB DEFAULT '[]',
    sensores_iot JSONB DEFAULT '[]',
    historial JSONB DEFAULT '[]',
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de tickets HORECA
CREATE TABLE tickets_horeca (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID NOT NULL REFERENCES empresas_horeca(id),
    sucursal_id UUID NOT NULL REFERENCES sucursales_horeca(id),
    numero_ticket VARCHAR NOT NULL UNIQUE,
    titulo VARCHAR NOT NULL,
    descripcion TEXT NOT NULL,
    tipo VARCHAR NOT NULL CHECK (tipo IN ('mantenimiento_correctivo', 'mantenimiento_preventivo', 'seguridad_alimentaria', 'servicio_cliente', 'inventario', 'personal', 'sistemas', 'emergencia')),
    categoria VARCHAR,
    prioridad VARCHAR DEFAULT 'media' CHECK (prioridad IN ('muy_baja', 'baja', 'media', 'alta', 'muy_alta', 'critica')),
    urgencia VARCHAR DEFAULT 'media' CHECK (urgencia IN ('muy_baja', 'baja', 'media', 'alta', 'muy_alta')),
    impacto VARCHAR DEFAULT 'medio' CHECK (impacto IN ('muy_bajo', 'bajo', 'medio', 'alto', 'muy_alto')),
    estado VARCHAR DEFAULT 'nuevo' CHECK (estado IN ('nuevo', 'asignado', 'en_progreso', 'esperando_partes', 'esperando_aprobacion', 'resuelto', 'cerrado', 'cancelado')),
    activo_relacionado_id UUID REFERENCES activos_horeca(id),
    reportado_por UUID NOT NULL REFERENCES usuarios_horeca(id),
    asignado_a UUID REFERENCES usuarios_horeca(id),
    supervisor_id UUID REFERENCES usuarios_horeca(id),
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_asignacion TIMESTAMP WITH TIME ZONE,
    fecha_inicio_trabajo TIMESTAMP WITH TIME ZONE,
    fecha_resolucion TIMESTAMP WITH TIME ZONE,
    fecha_cierre TIMESTAMP WITH TIME ZONE,
    tiempo_respuesta_minutos INTEGER,
    tiempo_resolucion_minutos INTEGER,
    sla_objetivo_horas INTEGER,
    trabajo_realizado TEXT,
    causa_raiz TEXT,
    solucion_aplicada TEXT,
    recursos_utilizados JSONB DEFAULT '{}',
    costo_total NUMERIC,
    satisfaccion_cliente INTEGER CHECK (satisfaccion_cliente >= 1 AND satisfaccion_cliente <= 5),
    comentarios JSONB DEFAULT '[]',
    archivos_adjuntos JSONB DEFAULT '[]',
    metadata JSONB DEFAULT '{}'
);

-- Tabla de productos de inventario
CREATE TABLE productos_inventario (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID NOT NULL REFERENCES empresas_horeca(id),
    sucursal_id UUID NOT NULL REFERENCES sucursales_horeca(id),
    codigo_producto VARCHAR NOT NULL UNIQUE,
    codigo_barras VARCHAR,
    nombre VARCHAR NOT NULL,
    descripcion TEXT,
    categoria VARCHAR NOT NULL CHECK (categoria IN ('proteinas', 'lacteos', 'vegetales', 'frutas', 'granos_cereales', 'especias_condimentos', 'aceites_grasas', 'bebidas_alcoholicas', 'bebidas_no_alcoholicas', 'productos_limpieza', 'desechables')),
    subcategoria VARCHAR,
    unidad_medida VARCHAR NOT NULL,
    precio_unitario NUMERIC,
    stock_actual NUMERIC DEFAULT 0,
    stock_minimo NUMERIC NOT NULL,
    stock_maximo NUMERIC,
    punto_reorden NUMERIC,
    vida_util_dias INTEGER,
    temperatura_almacenamiento VARCHAR,
    condiciones_almacenamiento TEXT,
    proveedor_principal JSONB,
    proveedores_alternativos JSONB DEFAULT '[]',
    informacion_nutricional JSONB DEFAULT '{}',
    alergenos VARCHAR[],
    certificaciones VARCHAR[],
    trazabilidad_requerida BOOLEAN DEFAULT false,
    activo BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    min_threshold NUMERIC,
    max_threshold NUMERIC,
    supplier VARCHAR(255),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de movimientos de inventario
CREATE TABLE movimientos_inventario (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    producto_id UUID NOT NULL REFERENCES productos_inventario(id),
    sucursal_id UUID NOT NULL REFERENCES sucursales_horeca(id),
    tipo_movimiento VARCHAR NOT NULL CHECK (tipo_movimiento IN ('entrada', 'salida', 'ajuste', 'merma', 'transferencia')),
    cantidad NUMERIC NOT NULL,
    precio_unitario NUMERIC,
    costo_total NUMERIC,
    motivo VARCHAR,
    lote VARCHAR,
    fecha_vencimiento DATE,
    proveedor VARCHAR,
    documento_referencia VARCHAR,
    usuario_id UUID NOT NULL REFERENCES usuarios_horeca(id),
    observaciones TEXT,
    metadata JSONB DEFAULT '{}',
    fecha_movimiento TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de certificaciones
CREATE TABLE certificaciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empleado_id UUID NOT NULL REFERENCES usuarios_horeca(id),
    certification_name VARCHAR(100) NOT NULL,
    certification_body VARCHAR(255),
    issue_date DATE,
    expiry_date DATE,
    certificate_number VARCHAR(100),
    document_url TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de marco de cumplimiento
CREATE TABLE compliance_framework (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID NOT NULL REFERENCES empresas_horeca(id),
    regulation_name VARCHAR(100) NOT NULL,
    enabled BOOLEAN DEFAULT true,
    configuration JSONB DEFAULT '{}',
    last_audit TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de configuración del sistema
CREATE TABLE system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID NOT NULL REFERENCES empresas_horeca(id),
    timezone VARCHAR(50) DEFAULT 'America/Mexico_City',
    language VARCHAR(10) DEFAULT 'es_MX',
    currency VARCHAR(10) DEFAULT 'MXN',
    date_format VARCHAR(20) DEFAULT 'DD/MM/YYYY',
    business_hours JSONB DEFAULT '{}',
    shift_definitions JSONB DEFAULT '{}',
    photo_settings JSONB DEFAULT '{}',
    backup_settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de canales de notificación
CREATE TABLE notification_channels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID NOT NULL REFERENCES empresas_horeca(id),
    channel_type VARCHAR(20) NOT NULL,
    enabled BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 1,
    configuration JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de plantillas de notificación
CREATE TABLE notification_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID NOT NULL REFERENCES empresas_horeca(id),
    template_name VARCHAR(100) NOT NULL,
    channel_type VARCHAR(20) NOT NULL,
    subject VARCHAR(255),
    message_text TEXT NOT NULL,
    variables JSONB DEFAULT '[]',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de log de alertas
CREATE TABLE alerts_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(50) NOT NULL,
    level INTEGER NOT NULL,
    message TEXT NOT NULL,
    recipient_id UUID REFERENCES usuarios_horeca(id),
    sent_at TIMESTAMP WITH TIME ZONE,
    read_at TIMESTAMP WITH TIME ZONE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tablas heredadas del esquema original (compatibilidad)
CREATE TABLE sucursales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(255) NOT NULL,
    direccion TEXT,
    telefono VARCHAR(20),
    gerente VARCHAR(255),
    activa BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE empleados_pulso (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(255) NOT NULL,
    apellido VARCHAR(255) NOT NULL,
    telefono VARCHAR(20) UNIQUE NOT NULL,
    whatsapp_id VARCHAR(255),
    sucursal_id UUID REFERENCES sucursales(id),
    puesto VARCHAR(100),
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE checklist_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    categoria VARCHAR(100),
    campos JSONB NOT NULL DEFAULT '[]',
    reglas_condicionales JSONB DEFAULT '[]',
    activo BOOLEAN DEFAULT true,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE checklists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID REFERENCES checklist_templates(id),
    sucursal_id UUID REFERENCES sucursales(id),
    empleado_id UUID REFERENCES empleados_pulso(id),
    fecha DATE NOT NULL,
    turno VARCHAR(20) DEFAULT 'matutino',
    estado VARCHAR(20) DEFAULT 'pendiente',
    respuestas JSONB DEFAULT '{}',
    puntuacion DECIMAL(5,2),
    alertas_generadas JSONB DEFAULT '[]',
    completado_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE reglas_condicionales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID REFERENCES checklist_templates(id),
    nombre VARCHAR(255) NOT NULL,
    condicion JSONB NOT NULL,
    accion JSONB NOT NULL,
    prioridad VARCHAR(20) DEFAULT 'medium',
    activa BOOLEAN DEFAULT true,
    activaciones INTEGER DEFAULT 0,
    efectividad DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE alertas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    checklist_id UUID REFERENCES checklists(id),
    regla_id UUID REFERENCES reglas_condicionales(id),
    tipo VARCHAR(50) NOT NULL,
    prioridad VARCHAR(20) DEFAULT 'medium',
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    estado VARCHAR(20) DEFAULT 'activa',
    asignado_a UUID REFERENCES empleados_pulso(id),
    resuelto_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    alerta_id UUID REFERENCES alertas(id),
    sucursal_id UUID REFERENCES sucursales(id),
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    prioridad VARCHAR(20) DEFAULT 'medium',
    estado VARCHAR(20) DEFAULT 'abierto',
    asignado_a UUID REFERENCES empleados_pulso(id),
    created_by UUID REFERENCES empleados_pulso(id),
    resuelto_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE notificaciones_whatsapp (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empleado_id UUID REFERENCES empleados_pulso(id),
    tipo VARCHAR(50) NOT NULL,
    mensaje TEXT NOT NULL,
    estado VARCHAR(20) DEFAULT 'pendiente',
    enviado_at TIMESTAMP WITH TIME ZONE,
    error_mensaje TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE logs_reglas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    regla_id UUID REFERENCES reglas_condicionales(id),
    checklist_id UUID REFERENCES checklists(id),
    condicion_evaluada JSONB,
    resultado BOOLEAN,
    accion_ejecutada JSONB,
    tiempo_ejecucion INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para optimización
CREATE INDEX idx_checklists_fecha ON checklists(fecha);
CREATE INDEX idx_checklists_sucursal ON checklists(sucursal_id);
CREATE INDEX idx_checklists_estado ON checklists(estado);
CREATE INDEX idx_alertas_estado ON alertas(estado);
CREATE INDEX idx_alertas_prioridad ON alertas(prioridad);
CREATE INDEX idx_tickets_estado ON tickets(estado);
CREATE INDEX idx_empleados_telefono ON empleados_pulso(telefono);
CREATE INDEX idx_logs_reglas_fecha ON logs_reglas(created_at);
CREATE INDEX idx_flows_horeca_prioridad ON flows_horeca(prioridad);
CREATE INDEX idx_flows_horeca_categoria_repse ON flows_horeca(categoria_repse);
CREATE INDEX idx_flows_horeca_frecuencia ON flows_horeca(frecuencia);
CREATE INDEX idx_usuarios_horeca_turno ON usuarios_horeca(turno_asignado);
CREATE INDEX idx_usuarios_horeca_estatus ON usuarios_horeca(estatus);
CREATE INDEX idx_usuarios_horeca_supervisor ON usuarios_horeca(supervisor_id);
CREATE INDEX idx_productos_inventario_thresholds ON productos_inventario(min_threshold, max_threshold);
CREATE INDEX idx_alerts_log_recipient ON alerts_log(recipient_id);
CREATE INDEX idx_alerts_log_type ON alerts_log(type);
CREATE INDEX idx_certificaciones_empleado ON certificaciones(empleado_id);
CREATE INDEX idx_certificaciones_active ON certificaciones(active);
CREATE INDEX idx_notification_channels_type ON notification_channels(channel_type);
CREATE INDEX idx_notification_templates_channel ON notification_templates(channel_type);

-- Triggers para updated_at
CREATE TRIGGER update_sucursales_updated_at BEFORE UPDATE ON sucursales FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_empleados_updated_at BEFORE UPDATE ON empleados_pulso FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON checklist_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_checklists_updated_at BEFORE UPDATE ON checklists FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reglas_updated_at BEFORE UPDATE ON reglas_condicionales FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_alertas_updated_at BEFORE UPDATE ON alertas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON tickets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON system_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_compliance_framework_updated_at BEFORE UPDATE ON compliance_framework FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_certificaciones_updated_at BEFORE UPDATE ON certificaciones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notification_channels_updated_at BEFORE UPDATE ON notification_channels FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notification_templates_updated_at BEFORE UPDATE ON notification_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_productos_inventario_last_updated_trigger BEFORE UPDATE ON productos_inventario FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
