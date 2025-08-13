-- Tabla para almacenar verificaciones de AI
CREATE TABLE ai_verifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sop_id UUID REFERENCES checklist_templates(id),
    empleado_id UUID REFERENCES empleados_pulso(id),
    verification_type VARCHAR(50) NOT NULL, -- 'image', 'audio', 'text', 'temperature'
    content_data JSONB NOT NULL, -- Datos del contenido verificado
    ai_result JSONB NOT NULL, -- Resultado completo de la AI
    confidence_score DECIMAL(3,2) NOT NULL, -- 0.00 - 1.00
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'passed', 'failed', 'review_required'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para configuración de reglas de verificación AI
CREATE TABLE ai_verification_rules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sop_template_id UUID REFERENCES checklist_templates(id),
    verification_type VARCHAR(50) NOT NULL,
    is_required BOOLEAN DEFAULT false,
    min_confidence_score DECIMAL(3,2) DEFAULT 0.80,
    auto_approve_threshold DECIMAL(3,2) DEFAULT 0.95,
    escalation_threshold DECIMAL(3,2) DEFAULT 0.60,
    rules_config JSONB NOT NULL, -- Configuración específica por tipo
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para almacenar modelos de AI entrenados
CREATE TABLE ai_models (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'image_classification', 'text_analysis', 'audio_transcription'
    version VARCHAR(50) NOT NULL,
    model_config JSONB NOT NULL,
    performance_metrics JSONB,
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para feedback y mejora continua de AI
CREATE TABLE ai_feedback (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    verification_id UUID REFERENCES ai_verifications(id),
    human_reviewer_id UUID REFERENCES usuarios(id),
    human_score INTEGER, -- 0-100
    human_feedback TEXT,
    ai_was_correct BOOLEAN,
    feedback_type VARCHAR(50), -- 'correction', 'confirmation', 'improvement'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para alertas automáticas generadas por AI
CREATE TABLE alertas_automaticas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tipo VARCHAR(100) NOT NULL,
    severidad VARCHAR(20) NOT NULL, -- 'baja', 'media', 'alta', 'critica'
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    empleado_id UUID REFERENCES empleados_pulso(id),
    sop_id UUID REFERENCES checklist_templates(id),
    verification_id UUID REFERENCES ai_verifications(id),
    estado VARCHAR(20) DEFAULT 'activa', -- 'activa', 'en_proceso', 'resuelta', 'descartada'
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID REFERENCES usuarios(id)
);

-- Índices para optimización
CREATE INDEX idx_ai_verifications_sop_empleado ON ai_verifications(sop_id, empleado_id);
CREATE INDEX idx_ai_verifications_status ON ai_verifications(status);
CREATE INDEX idx_ai_verifications_created_at ON ai_verifications(created_at);
CREATE INDEX idx_ai_verification_rules_sop ON ai_verification_rules(sop_template_id);
CREATE INDEX idx_alertas_automaticas_estado ON alertas_automaticas(estado);
CREATE INDEX idx_alertas_automaticas_severidad ON alertas_automaticas(severidad);

-- Función para calcular métricas de AI
CREATE OR REPLACE FUNCTION calculate_ai_metrics(
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() - INTERVAL '30 days',
    end_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'total_verifications', COUNT(*),
        'passed_verifications', COUNT(*) FILTER (WHERE status = 'passed'),
        'failed_verifications', COUNT(*) FILTER (WHERE status = 'failed'),
        'average_confidence', ROUND(AVG(confidence_score), 3),
        'accuracy_rate', ROUND(
            COUNT(*) FILTER (WHERE status = 'passed')::DECIMAL / 
            NULLIF(COUNT(*), 0) * 100, 2
        ),
        'by_type', jsonb_object_agg(
            verification_type,
            jsonb_build_object(
                'count', type_count,
                'avg_confidence', type_avg_confidence,
                'success_rate', type_success_rate
            )
        )
    ) INTO result
    FROM (
        SELECT 
            verification_type,
            COUNT(*) as type_count,
            ROUND(AVG(confidence_score), 3) as type_avg_confidence,
            ROUND(COUNT(*) FILTER (WHERE status = 'passed')::DECIMAL / COUNT(*) * 100, 2) as type_success_rate
        FROM ai_verifications
        WHERE created_at BETWEEN start_date AND end_date
        GROUP BY verification_type
    ) type_stats
    RIGHT JOIN (
        SELECT DISTINCT verification_type FROM ai_verifications
        WHERE created_at BETWEEN start_date AND end_date
    ) all_types USING (verification_type);
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_ai_verifications_updated_at
    BEFORE UPDATE ON ai_verifications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_verification_rules_updated_at
    BEFORE UPDATE ON ai_verification_rules
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_models_updated_at
    BEFORE UPDATE ON ai_models
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insertar reglas de verificación por defecto
INSERT INTO ai_verification_rules (sop_template_id, verification_type, is_required, min_confidence_score, rules_config)
SELECT 
    id,
    'image',
    true,
    0.85,
    jsonb_build_object(
        'required_elements', ARRAY['cleanliness', 'organization', 'safety'],
        'min_score_per_element', 80,
        'critical_violations', ARRAY['contamination', 'unsafe_conditions']
    )
FROM checklist_templates 
WHERE categoria IN ('limpieza', 'seguridad_alimentaria', 'mantenimiento');

INSERT INTO ai_verification_rules (sop_template_id, verification_type, is_required, min_confidence_score, rules_config)
SELECT 
    id,
    'temperature',
    true,
    0.95,
    jsonb_build_object(
        'expected_range', jsonb_build_object('min', 0, 'max', 4),
        'critical_deviation', 5,
        'warning_deviation', 2
    )
FROM checklist_templates 
WHERE nombre ILIKE '%temperatura%' OR nombre ILIKE '%refriger%';

-- Insertar modelos de AI por defecto
INSERT INTO ai_models (name, type, version, model_config, is_active) VALUES
('GPT-4o Vision', 'image_classification', '2024.1', 
 jsonb_build_object(
     'provider', 'openai',
     'model_id', 'gpt-4o',
     'max_tokens', 1000,
     'temperature', 0.1
 ), true),
('Whisper Audio', 'audio_transcription', '2024.1',
 jsonb_build_object(
     'provider', 'openai',
     'model_id', 'whisper-1',
     'language', 'es'
 ), true),
('GPT-4o Text', 'text_analysis', '2024.1',
 jsonb_build_object(
     'provider', 'openai',
     'model_id', 'gpt-4o',
     'max_tokens', 500,
     'temperature', 0.2
 ), true);

-- Vista para dashboard de AI
CREATE VIEW ai_dashboard_metrics AS
SELECT 
    DATE_TRUNC('day', created_at) as date,
    verification_type,
    COUNT(*) as total_verifications,
    COUNT(*) FILTER (WHERE status = 'passed') as passed,
    COUNT(*) FILTER (WHERE status = 'failed') as failed,
    ROUND(AVG(confidence_score), 3) as avg_confidence,
    ROUND(COUNT(*) FILTER (WHERE status = 'passed')::DECIMAL / COUNT(*) * 100, 2) as success_rate
FROM ai_verifications
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', created_at), verification_type
ORDER BY date DESC, verification_type;

COMMENT ON TABLE ai_verifications IS 'Almacena todas las verificaciones realizadas por AI en los SOPs';
COMMENT ON TABLE ai_verification_rules IS 'Configuración de reglas para verificación automática por AI';
COMMENT ON TABLE ai_models IS 'Modelos de AI disponibles y su configuración';
COMMENT ON TABLE ai_feedback IS 'Feedback humano para mejorar los modelos de AI';
COMMENT ON TABLE alertas_automaticas IS 'Alertas generadas automáticamente por el sistema de AI';
