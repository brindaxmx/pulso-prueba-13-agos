-- Crear tablas adicionales para el sistema avanzado de PULSO

-- Tabla de reglas del motor de secuencias
CREATE TABLE sequence_engine_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(50) NOT NULL, -- time_based, event_based, shift_based
    description TEXT NOT NULL,
    trigger_time TEXT[], -- ["11:00", "19:00"]
    days TEXT[], -- ["lunes", "martes", ...]
    shifts TEXT[], -- ["matutino", "vespertino"]
    condition JSONB, -- Para reglas basadas en eventos
    sop_id UUID REFERENCES checklist_templates(id),
    assign_to TEXT[], -- roles que pueden ejecutar
    active BOOLEAN DEFAULT true,
    priority VARCHAR(20) DEFAULT 'medium',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de ejecuciones de SOPs
CREATE TABLE sops_execution (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sop_id UUID REFERENCES checklist_templates(id),
    empleado_id UUID REFERENCES empleados_pulso(id),
    sucursal_id UUID REFERENCES sucursales(id),
    status VARCHAR(50) DEFAULT 'pending', -- pending, in_progress, completed, failed
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    data JSONB DEFAULT '{}',
    photos TEXT[],
    escalation_level INTEGER DEFAULT 0,
    assigned_by_rule UUID REFERENCES sequence_engine_rules(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de seguimiento de inventario
CREATE TABLE inventory_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_name VARCHAR(255) NOT NULL,
    current_stock NUMERIC(10,2) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    min_threshold NUMERIC(10,2) NOT NULL,
    max_threshold NUMERIC(10,2) NOT NULL,
    sucursal_id UUID REFERENCES sucursales(id),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    supplier VARCHAR(255),
    precio_promedio NUMERIC(10,2),
    tiempo_entrega_dias INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de log de alertas
CREATE TABLE alerts_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(50) NOT NULL, -- sop_reminder, escalation, inventory_low, etc.
    level INTEGER NOT NULL, -- 1, 2, 3 (escalation levels)
    message TEXT NOT NULL,
    recipient_id UUID, -- puede ser usuario o empleado
    recipient_type VARCHAR(20), -- usuario, empleado_pulso
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    sop_execution_id UUID REFERENCES sops_execution(id),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de secuencias condicionales
CREATE TABLE conditional_sequences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sequence_id VARCHAR(50) NOT NULL,
    if_condition JSONB NOT NULL,
    then_actions JSONB NOT NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de configuración del sistema
CREATE TABLE system_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    updated_by UUID REFERENCES usuarios(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para optimización
CREATE INDEX idx_sequence_rules_active ON sequence_engine_rules(active);
CREATE INDEX idx_sequence_rules_type ON sequence_engine_rules(type);
CREATE INDEX idx_sops_execution_status ON sops_execution(status);
CREATE INDEX idx_sops_execution_empleado ON sops_execution(empleado_id);
CREATE INDEX idx_sops_execution_sucursal ON sops_execution(sucursal_id);
CREATE INDEX idx_inventory_tracking_sucursal ON inventory_tracking(sucursal_id);
CREATE INDEX idx_inventory_tracking_stock ON inventory_tracking(current_stock);
CREATE INDEX idx_alerts_log_recipient ON alerts_log(recipient_id);
CREATE INDEX idx_alerts_log_sent_at ON alerts_log(sent_at);
CREATE INDEX idx_alerts_log_level ON alerts_log(level);

-- Triggers para updated_at
CREATE TRIGGER update_sequence_engine_rules_updated_at BEFORE UPDATE ON sequence_engine_rules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sops_execution_updated_at BEFORE UPDATE ON sops_execution FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inventory_tracking_updated_at BEFORE UPDATE ON inventory_tracking FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_conditional_sequences_updated_at BEFORE UPDATE ON conditional_sequences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_system_config_updated_at BEFORE UPDATE ON system_config FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
