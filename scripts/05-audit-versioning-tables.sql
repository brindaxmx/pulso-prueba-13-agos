-- Crear tablas para auditoría y versionado de reglas

-- Tabla de historial de cambios de reglas
CREATE TABLE rule_change_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rule_id UUID NOT NULL,
    action_type VARCHAR(20) NOT NULL CHECK (action_type IN ('created', 'updated', 'deleted', 'activated', 'deactivated')),
    version_number INTEGER NOT NULL,
    old_data JSONB,
    new_data JSONB,
    change_summary TEXT,
    changed_by UUID NOT NULL,
    changed_by_name VARCHAR(255),
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    metadata JSONB DEFAULT '{}'
);

-- Tabla de versiones de reglas
CREATE TABLE rule_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rule_id UUID NOT NULL,
    version_number INTEGER NOT NULL,
    rule_data JSONB NOT NULL,
    change_notes TEXT,
    tags VARCHAR[],
    is_current BOOLEAN DEFAULT false,
    created_by UUID NOT NULL,
    created_by_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(rule_id, version_number)
);

-- Tabla de comparaciones guardadas
CREATE TABLE rule_comparisons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rule_id UUID NOT NULL,
    version_from INTEGER NOT NULL,
    version_to INTEGER NOT NULL,
    comparison_data JSONB NOT NULL,
    comparison_summary JSONB,
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    name VARCHAR(255),
    description TEXT
);

-- Tabla de rollbacks
CREATE TABLE rule_rollbacks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rule_id UUID NOT NULL,
    from_version INTEGER NOT NULL,
    to_version INTEGER NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
    requested_by UUID NOT NULL,
    approved_by UUID,
    rolled_back_by UUID,
    rolled_back_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

-- Vista para obtener versiones con detalles
CREATE VIEW rule_versions_detailed AS
SELECT 
    rv.*,
    u.nombre as created_by_name,
    u.email as created_by_email,
    ser.description as rule_description
FROM rule_versions rv
LEFT JOIN usuarios_horeca u ON rv.created_by = u.id
LEFT JOIN sequence_engine_rules ser ON rv.rule_id = ser.id;

-- Función para crear versión automáticamente
CREATE OR REPLACE FUNCTION create_rule_version()
RETURNS TRIGGER AS $$
BEGIN
    -- Insertar nueva versión
    INSERT INTO rule_versions (
        rule_id,
        version_number,
        rule_data,
        change_notes,
        is_current,
        created_by,
        created_by_name
    ) VALUES (
        NEW.id,
        COALESCE((SELECT MAX(version_number) FROM rule_versions WHERE rule_id = NEW.id), 0) + 1,
        row_to_json(NEW),
        CASE 
            WHEN TG_OP = 'INSERT' THEN 'Versión inicial creada'
            ELSE 'Regla actualizada'
        END,
        true,
        NEW.created_by,
        (SELECT nombre FROM usuarios_horeca WHERE id = NEW.created_by)
    );
    
    -- Marcar versiones anteriores como no actuales
    UPDATE rule_versions 
    SET is_current = false 
    WHERE rule_id = NEW.id AND version_number < (
        SELECT MAX(version_number) FROM rule_versions WHERE rule_id = NEW.id
    );
    
    -- Crear entrada en historial
    INSERT INTO rule_change_history (
        rule_id,
        action_type,
        version_number,
        old_data,
        new_data,
        change_summary,
        changed_by,
        changed_by_name
    ) VALUES (
        NEW.id,
        CASE WHEN TG_OP = 'INSERT' THEN 'created' ELSE 'updated' END,
        (SELECT MAX(version_number) FROM rule_versions WHERE rule_id = NEW.id),
        CASE WHEN TG_OP = 'UPDATE' THEN row_to_json(OLD) ELSE NULL END,
        row_to_json(NEW),
        CASE 
            WHEN TG_OP = 'INSERT' THEN 'Nueva regla creada: ' || NEW.description
            ELSE 'Regla actualizada: ' || NEW.description
        END,
        NEW.created_by,
        (SELECT nombre FROM usuarios_horeca WHERE id = NEW.created_by)
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Función para rollback seguro
CREATE OR REPLACE FUNCTION execute_rule_rollback(rollback_id UUID, executed_by UUID)
RETURNS BOOLEAN AS $$
DECLARE
    rollback_record RECORD;
    target_version RECORD;
BEGIN
    -- Obtener información del rollback
    SELECT * INTO rollback_record FROM rule_rollbacks WHERE id = rollback_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Rollback no encontrado';
    END IF;
    
    IF rollback_record.status != 'approved' THEN
        RAISE EXCEPTION 'Rollback no aprobado';
    END IF;
    
    -- Obtener la versión objetivo
    SELECT * INTO target_version FROM rule_versions 
    WHERE rule_id = rollback_record.rule_id AND version_number = rollback_record.to_version;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Versión objetivo no encontrada';
    END IF;
    
    -- Actualizar la regla con los datos de la versión objetivo
    UPDATE sequence_engine_rules 
    SET 
        description = (target_version.rule_data->>'description'),
        type = (target_version.rule_data->>'type'),
        priority = (target_version.rule_data->>'priority'),
        active = (target_version.rule_data->>'active')::boolean,
        updated_at = NOW()
    WHERE id = rollback_record.rule_id;
    
    -- Marcar rollback como completado
    UPDATE rule_rollbacks 
    SET 
        status = 'completed',
        rolled_back_by = executed_by,
        rolled_back_at = NOW()
    WHERE id = rollback_id;
    
    -- Crear entrada en historial
    INSERT INTO rule_change_history (
        rule_id,
        action_type,
        version_number,
        change_summary,
        changed_by,
        changed_by_name
    ) VALUES (
        rollback_record.rule_id,
        'rollback',
        rollback_record.to_version,
        'Rollback ejecutado de v' || rollback_record.from_version || ' a v' || rollback_record.to_version,
        executed_by,
        (SELECT nombre FROM usuarios_horeca WHERE id = executed_by)
    );
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Función para estadísticas de auditoría
CREATE OR REPLACE FUNCTION get_audit_statistics()
RETURNS TABLE (
    total_changes INTEGER,
    changes_today INTEGER,
    changes_week INTEGER,
    active_users INTEGER,
    most_active_user TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*)::INTEGER FROM rule_change_history),
        (SELECT COUNT(*)::INTEGER FROM rule_change_history WHERE changed_at >= CURRENT_DATE),
        (SELECT COUNT(*)::INTEGER FROM rule_change_history WHERE changed_at >= CURRENT_DATE - INTERVAL '7 days'),
        (SELECT COUNT(DISTINCT changed_by)::INTEGER FROM rule_change_history),
        (SELECT changed_by_name FROM rule_change_history GROUP BY changed_by_name ORDER BY COUNT(*) DESC LIMIT 1);
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER rule_versioning_trigger
    AFTER INSERT OR UPDATE ON sequence_engine_rules
    FOR EACH ROW EXECUTE FUNCTION create_rule_version();

-- Índices para optimización
CREATE INDEX idx_rule_change_history_rule_id ON rule_change_history(rule_id);
CREATE INDEX idx_rule_change_history_changed_at ON rule_change_history(changed_at);
CREATE INDEX idx_rule_change_history_changed_by ON rule_change_history(changed_by);
CREATE INDEX idx_rule_change_history_action_type ON rule_change_history(action_type);

CREATE INDEX idx_rule_versions_rule_id ON rule_versions(rule_id);
CREATE INDEX idx_rule_versions_is_current ON rule_versions(is_current);
CREATE INDEX idx_rule_versions_created_at ON rule_versions(created_at);

CREATE INDEX idx_rule_rollbacks_rule_id ON rule_rollbacks(rule_id);
CREATE INDEX idx_rule_rollbacks_status ON rule_rollbacks(status);
CREATE INDEX idx_rule_rollbacks_created_at ON rule_rollbacks(created_at);
