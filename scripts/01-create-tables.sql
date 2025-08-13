-- Crear extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Tabla de empresas
CREATE TABLE empresas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(255) NOT NULL,
    industria VARCHAR(100),
    rfc VARCHAR(13) UNIQUE,
    giro VARCHAR(100),
    contacto_responsable VARCHAR(255),
    telefono VARCHAR(20),
    direccion_matriz JSONB,
    paquete_contratado VARCHAR(50) DEFAULT 'basic',
    fecha_inicio_servicio DATE,
    estatus VARCHAR(20) DEFAULT 'activo',
    empleados_pulso_activos INTEGER DEFAULT 0,
    configuracion JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de sucursales
CREATE TABLE sucursales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
    nombre VARCHAR(255) NOT NULL,
    direccion TEXT,
    tipo_formato VARCHAR(50),
    metros_cuadrados INTEGER,
    capacidad_personas INTEGER,
    horarios JSONB,
    coordenadas POINT,
    nivel_riesgo_sanitario VARCHAR(20) DEFAULT 'medio',
    certificaciones TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de usuarios
CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100),
    email VARCHAR(255) UNIQUE NOT NULL,
    whatsapp VARCHAR(20),
    rol VARCHAR(50) NOT NULL,
    empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
    sucursal_acceso UUID[],
    departamento VARCHAR(100),
    puesto VARCHAR(100),
    permisos TEXT[],
    notificaciones JSONB DEFAULT '{}',
    fecha_registro DATE DEFAULT CURRENT_DATE,
    ultimo_acceso TIMESTAMP WITH TIME ZONE,
    estatus VARCHAR(20) DEFAULT 'activo',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de empleados PULSO
CREATE TABLE empleados_pulso (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100),
    email VARCHAR(255) UNIQUE NOT NULL,
    whatsapp VARCHAR(20),
    rfc VARCHAR(13),
    curp VARCHAR(18),
    rol_dual VARCHAR(50),
    especialidad_primaria VARCHAR(100),
    especialidad_secundaria VARCHAR(100),
    empresa_asignada UUID REFERENCES empresas(id),
    sucursal_asignada UUID REFERENCES sucursales(id),
    contrato_repse JSONB,
    certificaciones TEXT[],
    tarifa_hora DECIMAL(10,2),
    horas_asignadas_semana INTEGER,
    evaluacion_desempeno DECIMAL(3,2),
    fecha_onboarding DATE,
    estatus VARCHAR(20) DEFAULT 'activo',
    horarios_trabajo JSONB,
    supervisor_directo UUID REFERENCES usuarios(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de templates de checklists
CREATE TABLE checklist_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(255) NOT NULL,
    categoria VARCHAR(50),
    tipo VARCHAR(50),
    descripcion TEXT,
    frecuencia VARCHAR(50),
    tiempo_estimado_minutos INTEGER,
    areas_involucradas TEXT[],
    campos JSONB NOT NULL,
    puntuacion_minima INTEGER DEFAULT 80,
    acciones_automaticas JSONB DEFAULT '[]',
    version VARCHAR(10) DEFAULT '1.0',
    activo BOOLEAN DEFAULT true,
    creado_por UUID REFERENCES usuarios(id),
    fecha_creacion DATE DEFAULT CURRENT_DATE,
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de reportes
CREATE TABLE reportes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empleado_pulso_id UUID REFERENCES empleados_pulso(id),
    sucursal_id UUID REFERENCES sucursales(id),
    checklist_id UUID REFERENCES checklist_templates(id),
    fecha TIMESTAMP WITH TIME ZONE NOT NULL,
    tipo VARCHAR(100),
    datos JSONB NOT NULL,
    archivos_adjuntos JSONB DEFAULT '[]',
    evaluacion_automatica JSONB,
    tiempo_completado_minutos INTEGER,
    coordenadas_gps POINT,
    firma_digital VARCHAR(255),
    supervisado_por UUID REFERENCES usuarios(id),
    archivo_pdf_url TEXT,
    qr_verificacion TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de tickets
CREATE TABLE tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    tipo VARCHAR(50),
    prioridad VARCHAR(20) DEFAULT 'media',
    estado VARCHAR(50) DEFAULT 'abierto',
    sucursal_id UUID REFERENCES sucursales(id),
    reporte_relacionado UUID REFERENCES reportes(id),
    creado_por UUID REFERENCES usuarios(id),
    asignado_a UUID REFERENCES usuarios(id),
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_asignacion TIMESTAMP WITH TIME ZONE,
    fecha_completado TIMESTAMP WITH TIME ZONE,
    comentarios JSONB DEFAULT '[]',
    etiquetas TEXT[],
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de facturación
CREATE TABLE facturacion (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID REFERENCES empresas(id),
    periodo VARCHAR(7), -- YYYY-MM
    fecha_generacion TIMESTAMP WITH TIME ZONE,
    paquete VARCHAR(50),
    sucursales_activas INTEGER,
    empleados_pulso_periodo INTEGER,
    servicios_incluidos JSONB,
    totales JSONB,
    metodo_pago VARCHAR(50),
    estado_pago VARCHAR(50) DEFAULT 'pendiente',
    fecha_pago TIMESTAMP WITH TIME ZONE,
    referencia_pago VARCHAR(100),
    xml_url TEXT,
    pdf_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de métricas del dashboard
CREATE TABLE dashboard_metricas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID REFERENCES empresas(id),
    fecha DATE NOT NULL,
    tipo VARCHAR(50),
    metricas_operativas JSONB,
    metricas_calidad JSONB,
    metricas_eficiencia JSONB,
    alertas_activas JSONB DEFAULT '[]',
    recomendaciones TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de logs del sistema
CREATE TABLE system_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    evento VARCHAR(100) NOT NULL,
    usuario_id UUID,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sucursal_id UUID REFERENCES sucursales(id),
    empresa_id UUID REFERENCES empresas(id),
    nivel VARCHAR(20) DEFAULT 'info',
    detalle TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para webhooks de WhatsApp
CREATE TABLE whatsapp_webhooks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone_number VARCHAR(20) NOT NULL,
    message_id VARCHAR(100),
    message_type VARCHAR(50),
    message_content TEXT,
    timestamp TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50),
    usuario_id UUID REFERENCES usuarios(id),
    empleado_pulso_id UUID REFERENCES empleados_pulso(id),
    processed BOOLEAN DEFAULT false,
    response_sent BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para optimización
CREATE INDEX idx_empresas_rfc ON empresas(rfc);
CREATE INDEX idx_sucursales_empresa ON sucursales(empresa_id);
CREATE INDEX idx_usuarios_empresa ON usuarios(empresa_id);
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_empleados_pulso_empresa ON empleados_pulso(empresa_asignada);
CREATE INDEX idx_empleados_pulso_sucursal ON empleados_pulso(sucursal_asignada);
CREATE INDEX idx_reportes_fecha ON reportes(fecha);
CREATE INDEX idx_reportes_sucursal ON reportes(sucursal_id);
CREATE INDEX idx_tickets_estado ON tickets(estado);
CREATE INDEX idx_tickets_prioridad ON tickets(prioridad);
CREATE INDEX idx_dashboard_metricas_fecha ON dashboard_metricas(fecha);
CREATE INDEX idx_system_logs_timestamp ON system_logs(timestamp);
CREATE INDEX idx_whatsapp_webhooks_phone ON whatsapp_webhooks(phone_number);
CREATE INDEX idx_whatsapp_webhooks_processed ON whatsapp_webhooks(processed);

-- Triggers para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_empresas_updated_at BEFORE UPDATE ON empresas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sucursales_updated_at BEFORE UPDATE ON sucursales FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_empleados_pulso_updated_at BEFORE UPDATE ON empleados_pulso FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_checklist_templates_updated_at BEFORE UPDATE ON checklist_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reportes_updated_at BEFORE UPDATE ON reportes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON tickets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_facturacion_updated_at BEFORE UPDATE ON facturacion FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_dashboard_metricas_updated_at BEFORE UPDATE ON dashboard_metricas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
