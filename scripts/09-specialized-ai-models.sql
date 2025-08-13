-- Tablas para modelos AI especializados por tipo de verificación HORECA

-- Tabla de datasets de entrenamiento especializados
CREATE TABLE ai_training_datasets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    verification_type VARCHAR(50) NOT NULL, -- 'kitchen_cleanliness', 'food_safety', 'temperature_control', etc.
    industry_vertical VARCHAR(50) NOT NULL, -- 'restaurant', 'hotel', 'catering', 'fast_food'
    dataset_version VARCHAR(20) NOT NULL,
    total_samples INTEGER NOT NULL DEFAULT 0,
    labeled_samples INTEGER NOT NULL DEFAULT 0,
    validation_samples INTEGER NOT NULL DEFAULT 0,
    test_samples INTEGER NOT NULL DEFAULT 0,
    data_sources JSONB NOT NULL, -- URLs, file paths, etc.
    labeling_guidelines TEXT,
    quality_metrics JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES usuarios(id)
);

-- Tabla de modelos especializados
CREATE TABLE specialized_ai_models (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    model_name VARCHAR(255) NOT NULL,
    model_type VARCHAR(50) NOT NULL, -- 'vision_classifier', 'audio_analyzer', 'text_processor'
    verification_category VARCHAR(100) NOT NULL, -- 'kitchen_hygiene', 'food_temperature', 'equipment_safety'
    industry_focus VARCHAR(50) NOT NULL, -- 'restaurant', 'hotel', 'catering'
    base_model VARCHAR(100) NOT NULL, -- 'gpt-4o', 'claude-3', 'custom-cnn'
    model_version VARCHAR(20) NOT NULL,
    training_dataset_id UUID REFERENCES ai_training_datasets(id),
    model_config JSONB NOT NULL,
    training_metrics JSONB,
    validation_metrics JSONB,
    deployment_status VARCHAR(20) DEFAULT 'training', -- 'training', 'testing', 'deployed', 'deprecated'
    confidence_threshold DECIMAL(3,2) DEFAULT 0.85,
    performance_benchmark JSONB,
    model_artifacts JSONB, -- URLs to model files, weights, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deployed_at TIMESTAMP WITH TIME ZONE,
    deprecated_at TIMESTAMP WITH TIME ZONE
);

-- Tabla de categorías de verificación especializadas
CREATE TABLE verification_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL UNIQUE,
    category_type VARCHAR(50) NOT NULL, -- 'visual', 'audio', 'sensor', 'text'
    industry_vertical VARCHAR(50) NOT NULL,
    description TEXT,
    evaluation_criteria JSONB NOT NULL,
    regulatory_standards JSONB, -- Normas aplicables (NOM, HACCP, etc.)
    critical_points JSONB, -- Puntos críticos de control
    scoring_rubric JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de resultados de entrenamiento
CREATE TABLE model_training_runs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    model_id UUID REFERENCES specialized_ai_models(id),
    run_name VARCHAR(255) NOT NULL,
    training_config JSONB NOT NULL,
    dataset_split JSONB NOT NULL, -- train/val/test splits
    training_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    training_end TIMESTAMP WITH TIME ZONE,
    training_duration_minutes INTEGER,
    final_metrics JSONB,
    epoch_metrics JSONB, -- Métricas por época
    loss_curves JSONB,
    hyperparameters JSONB,
    hardware_config JSONB,
    status VARCHAR(20) DEFAULT 'running', -- 'running', 'completed', 'failed', 'stopped'
    error_log TEXT,
    artifacts_path TEXT,
    created_by UUID REFERENCES usuarios(id)
);

-- Tabla de evaluaciones de modelo en producción
CREATE TABLE model_production_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    model_id UUID REFERENCES specialized_ai_models(id),
    evaluation_date DATE NOT NULL,
    total_predictions INTEGER NOT NULL DEFAULT 0,
    correct_predictions INTEGER NOT NULL DEFAULT 0,
    false_positives INTEGER NOT NULL DEFAULT 0,
    false_negatives INTEGER NOT NULL DEFAULT 0,
    average_confidence DECIMAL(4,3),
    processing_time_ms INTEGER,
    accuracy DECIMAL(5,4),
    precision_score DECIMAL(5,4),
    recall SCORE DECIMAL(5,4),
    f1_score DECIMAL(5,4),
    auc_score DECIMAL(5,4),
    confusion_matrix JSONB,
    feature_importance JSONB,
    drift_detection JSONB,
    performance_degradation BOOLEAN DEFAULT false,
    retraining_recommended BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de feedback especializado por categoría
CREATE TABLE specialized_feedback (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    verification_id UUID REFERENCES ai_verifications(id),
    model_id UUID REFERENCES specialized_ai_models(id),
    category_id UUID REFERENCES verification_categories(id),
    expert_reviewer_id UUID REFERENCES usuarios(id),
    expert_score INTEGER CHECK (expert_score >= 0 AND expert_score <= 100),
    ai_score INTEGER CHECK (ai_score >= 0 AND ai_score <= 100),
    score_difference INTEGER GENERATED ALWAYS AS (ABS(expert_score - ai_score)) STORED,
    detailed_feedback JSONB NOT NULL,
    correction_annotations JSONB, -- Anotaciones específicas para reentrenamiento
    feedback_quality VARCHAR(20) DEFAULT 'pending', -- 'pending', 'validated', 'disputed'
    improvement_suggestions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    validated_at TIMESTAMP WITH TIME ZONE,
    validated_by UUID REFERENCES usuarios(id)
);

-- Insertar categorías de verificación especializadas
INSERT INTO verification_categories (category_name, category_type, industry_vertical, description, evaluation_criteria, regulatory_standards, critical_points, scoring_rubric) VALUES

-- Categorías para Restaurantes
('kitchen_hygiene_restaurant', 'visual', 'restaurant', 'Evaluación de higiene en cocinas de restaurante', 
 '{"cleanliness": {"weight": 0.3, "min_score": 85}, "organization": {"weight": 0.25, "min_score": 80}, "equipment_condition": {"weight": 0.25, "min_score": 90}, "personal_hygiene": {"weight": 0.2, "min_score": 95}}'::jsonb,
 '{"NOM_251": "Prácticas de higiene", "HACCP": "Puntos críticos de control", "SSA": "Secretaría de Salud"}'::jsonb,
 '{"hand_washing_stations": "Funcionales y abastecidas", "food_contact_surfaces": "Limpias y desinfectadas", "waste_disposal": "Adecuada separación", "pest_control": "Sin evidencia de plagas"}'::jsonb,
 '{"excellent": {"min": 95, "description": "Cumplimiento excepcional"}, "good": {"min": 85, "description": "Cumplimiento satisfactorio"}, "needs_improvement": {"min": 70, "description": "Requiere atención"}, "critical": {"max": 69, "description": "Incumplimiento grave"}}'::jsonb),

('food_temperature_control', 'sensor', 'restaurant', 'Control de temperaturas en alimentos y equipos',
 '{"cold_storage": {"min_temp": -2, "max_temp": 4}, "hot_holding": {"min_temp": 60, "max_temp": 85}, "cooking_temp": {"min_temp": 74}, "danger_zone": {"min_temp": 4, "max_temp": 60, "max_time_minutes": 120}}'::jsonb,
 '{"NOM_251": "Temperaturas seguras", "COFEPRIS": "Control sanitario"}'::jsonb,
 '{"refrigeration": "Temperatura constante 0-4°C", "freezing": "Temperatura -18°C o menor", "hot_food": "Mantener >60°C", "cooking": "Temperatura interna >74°C"}'::jsonb,
 '{"compliant": {"description": "Dentro de rango seguro"}, "warning": {"description": "Cerca del límite"}, "critical": {"description": "Fuera de rango seguro"}}'::jsonb),

('equipment_safety_restaurant', 'visual', 'restaurant', 'Seguridad y funcionamiento de equipos de cocina',
 '{"electrical_safety": {"weight": 0.3, "min_score": 90}, "mechanical_condition": {"weight": 0.25, "min_score": 85}, "cleanliness": {"weight": 0.25, "min_score": 80}, "proper_usage": {"weight": 0.2, "min_score": 85}}'::jsonb,
 '{"NOM_001_SEDE": "Instalaciones eléctricas", "STPS": "Seguridad en el trabajo"}'::jsonb,
 '{"electrical_connections": "Seguras y protegidas", "moving_parts": "Guardas de seguridad", "emergency_stops": "Funcionales", "maintenance_schedule": "Al día"}'::jsonb,
 '{"safe": {"min": 90, "description": "Equipo seguro para operar"}, "maintenance_needed": {"min": 70, "description": "Requiere mantenimiento"}, "unsafe": {"max": 69, "description": "No seguro para operar"}}'::jsonb),

-- Categorías para Hoteles
('room_cleanliness_hotel', 'visual', 'hotel', 'Evaluación de limpieza en habitaciones de hotel',
 '{"bathroom_cleanliness": {"weight": 0.3, "min_score": 95}, "bedroom_tidiness": {"weight": 0.25, "min_score": 90}, "amenities_condition": {"weight": 0.25, "min_score": 85}, "overall_presentation": {"weight": 0.2, "min_score": 90}}'::jsonb,
 '{"NOM_010_TUR": "Establecimientos de hospedaje", "SECTUR": "Clasificación hotelera"}'::jsonb,
 '{"bed_making": "Estándares de presentación", "bathroom_sanitation": "Desinfección completa", "amenities_stock": "Completo y funcional", "maintenance_issues": "Reportar inmediatamente"}'::jsonb,
 '{"luxury": {"min": 95, "description": "Estándar de lujo"}, "premium": {"min": 85, "description": "Estándar premium"}, "standard": {"min": 75, "description": "Estándar básico"}, "below_standard": {"max": 74, "description": "Por debajo del estándar"}}'::jsonb),

('food_service_hotel', 'visual', 'hotel', 'Servicio de alimentos en hoteles',
 '{"presentation": {"weight": 0.3, "min_score": 90}, "temperature": {"weight": 0.25, "min_score": 95}, "hygiene": {"weight": 0.25, "min_score": 95}, "service_standards": {"weight": 0.2, "min_score": 85}}'::jsonb,
 '{"NOM_251": "Prácticas de higiene", "NOM_010_TUR": "Servicios de hospedaje"}'::jsonb,
 '{"buffet_temperature": "Mantener temperaturas seguras", "food_rotation": "FIFO - Primero en entrar, primero en salir", "cross_contamination": "Prevenir contaminación cruzada", "allergen_control": "Identificación clara"}'::jsonb,
 '{"excellent": {"min": 90, "description": "Servicio excepcional"}, "good": {"min": 80, "description": "Servicio satisfactorio"}, "needs_improvement": {"min": 70, "description": "Requiere mejoras"}, "unacceptable": {"max": 69, "description": "Inaceptable"}}'::jsonb),

-- Categorías para Catering
('food_transport_catering', 'visual', 'catering', 'Transporte y entrega de alimentos',
 '{"temperature_maintenance": {"weight": 0.35, "min_score": 95}, "packaging_integrity": {"weight": 0.25, "min_score": 90}, "vehicle_cleanliness": {"weight": 0.25, "min_score": 85}, "delivery_timing": {"weight": 0.15, "min_score": 80}}'::jsonb,
 '{"NOM_251": "Manejo higiénico", "SCT": "Transporte de alimentos"}'::jsonb,
 '{"cold_chain": "Mantener cadena de frío", "hot_transport": "Temperatura >60°C", "packaging": "Sellado e íntegro", "vehicle_sanitation": "Limpio y desinfectado"}'::jsonb,
 '{"excellent": {"min": 90, "description": "Transporte óptimo"}, "acceptable": {"min": 80, "description": "Transporte aceptable"}, "risky": {"min": 70, "description": "Riesgo moderado"}, "unsafe": {"max": 69, "description": "Transporte inseguro"}}'::jsonb),

-- Categorías para Fast Food
('speed_service_fastfood', 'audio', 'fast_food', 'Evaluación de velocidad y calidad de servicio',
 '{"order_accuracy": {"weight": 0.3, "min_score": 95}, "service_time": {"weight": 0.25, "max_seconds": 180}, "customer_interaction": {"weight": 0.25, "min_score": 85}, "food_quality": {"weight": 0.2, "min_score": 90}}'::jsonb,
 '{"PROFECO": "Derechos del consumidor", "NOM_251": "Higiene en alimentos"}'::jsonb,
 '{"order_taking": "Preciso y eficiente", "preparation_time": "Dentro de estándares", "quality_check": "Verificación antes de entrega", "customer_satisfaction": "Experiencia positiva"}'::jsonb,
 '{"exceptional": {"min": 95, "description": "Servicio excepcional"}, "target": {"min": 85, "description": "Cumple objetivos"}, "below_target": {"min": 70, "description": "Por debajo del objetivo"}, "needs_training": {"max": 69, "description": "Requiere capacitación"}}'::jsonb);

-- Insertar datasets de entrenamiento especializados
INSERT INTO ai_training_datasets (name, verification_type, industry_vertical, dataset_version, total_samples, labeled_samples, validation_samples, test_samples, data_sources, labeling_guidelines, quality_metrics) VALUES

('Kitchen Hygiene Restaurant Dataset', 'kitchen_hygiene_restaurant', 'restaurant', 'v1.0', 5000, 4500, 750, 750, 
 '{"image_sources": ["restaurant_inspections", "training_photos", "compliance_audits"], "annotation_tools": ["labelbox", "cvat"], "quality_control": "double_annotation"}'::jsonb,
 'Evaluar limpieza de superficies, organización de utensilios, estado de equipos, higiene personal visible. Escala 0-100 con criterios específicos por área.',
 '{"inter_annotator_agreement": 0.92, "data_quality_score": 0.89, "class_balance": {"excellent": 0.25, "good": 0.35, "needs_improvement": 0.25, "critical": 0.15}}'::jsonb),

('Temperature Control Universal', 'food_temperature_control', 'restaurant', 'v1.2', 8000, 7500, 1000, 1000,
 '{"sensor_data": ["digital_thermometers", "infrared_readings", "continuous_monitoring"], "validation": "calibrated_instruments"}'::jsonb,
 'Registrar temperaturas con contexto (tipo de alimento, equipo, ambiente). Incluir timestamp, ubicación y condiciones ambientales.',
 '{"accuracy": 0.98, "precision": 0.02, "coverage": {"refrigeration": 0.4, "cooking": 0.3, "holding": 0.2, "ambient": 0.1}}'::jsonb),

('Hotel Room Standards', 'room_cleanliness_hotel', 'hotel', 'v1.1', 3500, 3200, 500, 500,
 '{"image_sources": ["housekeeping_inspections", "guest_feedback", "quality_audits"], "standards": ["5_star", "4_star", "3_star"]}'::jsonb,
 'Evaluar según estándares hoteleros: presentación de cama, limpieza de baño, estado de amenidades, mantenimiento general.',
 '{"consistency": 0.94, "standard_compliance": 0.91, "category_distribution": {"luxury": 0.2, "premium": 0.4, "standard": 0.3, "below_standard": 0.1}}'::jsonb),

('Fast Food Service Audio', 'speed_service_fastfood', 'fast_food', 'v1.0', 2000, 1800, 300, 300,
 '{"audio_sources": ["drive_thru_recordings", "counter_service", "kitchen_communication"], "transcription": "whisper_v3"}'::jsonb,
 'Analizar interacciones de servicio: claridad de comunicación, tiempo de respuesta, precisión de pedidos, cortesía.',
 '{"transcription_accuracy": 0.96, "sentiment_analysis": 0.88, "timing_precision": 0.95}'::jsonb);

-- Insertar modelos especializados
INSERT INTO specialized_ai_models (model_name, model_type, verification_category, industry_focus, base_model, model_version, training_dataset_id, model_config, confidence_threshold, performance_benchmark) VALUES

('PULSO Kitchen Vision v2.1', 'vision_classifier', 'kitchen_hygiene_restaurant', 'restaurant', 'gpt-4o-vision', 'v2.1',
 (SELECT id FROM ai_training_datasets WHERE name = 'Kitchen Hygiene Restaurant Dataset'),
 '{"architecture": "transformer_vision", "input_resolution": [1024, 1024], "attention_heads": 16, "layers": 24, "fine_tuning": {"epochs": 50, "learning_rate": 0.0001, "batch_size": 32}, "augmentation": {"rotation": 15, "brightness": 0.2, "contrast": 0.2, "flip": true}}'::jsonb,
 0.88,
 '{"accuracy": 0.94, "precision": 0.92, "recall": 0.91, "f1_score": 0.915, "processing_time_ms": 850, "confidence_calibration": 0.89}'::jsonb),

('PULSO Temp Monitor AI', 'sensor_analyzer', 'food_temperature_control', 'restaurant', 'custom_regression', 'v1.5',
 (SELECT id FROM ai_training_datasets WHERE name = 'Temperature Control Universal'),
 '{"algorithm": "gradient_boosting", "features": ["temperature", "humidity", "equipment_type", "food_category", "ambient_temp"], "hyperparameters": {"n_estimators": 200, "max_depth": 8, "learning_rate": 0.1}, "anomaly_detection": {"method": "isolation_forest", "contamination": 0.05}}'::jsonb,
 0.95,
 '{"mae": 0.3, "rmse": 0.45, "r2_score": 0.97, "anomaly_detection_f1": 0.89, "processing_time_ms": 120}'::jsonb),

('PULSO Hotel Standards AI', 'vision_classifier', 'room_cleanliness_hotel', 'hotel', 'gpt-4o-vision', 'v1.3',
 (SELECT id FROM ai_training_datasets WHERE name = 'Hotel Room Standards'),
 '{"architecture": "hierarchical_attention", "room_areas": ["bedroom", "bathroom", "amenities", "maintenance"], "scoring_method": "weighted_average", "quality_thresholds": {"luxury": 0.95, "premium": 0.85, "standard": 0.75}}'::jsonb,
 0.85,
 '{"accuracy": 0.91, "precision": 0.89, "recall": 0.93, "f1_score": 0.91, "standard_compliance": 0.94}'::jsonb),

('PULSO Service Audio AI', 'audio_analyzer', 'speed_service_fastfood', 'fast_food', 'whisper-large-v3', 'v1.0',
 (SELECT id FROM ai_training_datasets WHERE name = 'Fast Food Service Audio'),
 '{"transcription_model": "whisper-large-v3", "sentiment_analysis": "roberta-large", "timing_analysis": "custom_vad", "quality_metrics": ["clarity", "politeness", "accuracy", "efficiency"], "language_support": ["es-MX", "en-US"]}'::jsonb,
 0.82,
 '{"transcription_wer": 0.08, "sentiment_accuracy": 0.87, "timing_precision": 0.94, "overall_service_score": 0.85}'::jsonb);

-- Función para evaluar rendimiento de modelos especializados
CREATE OR REPLACE FUNCTION evaluate_specialized_model_performance(
    p_model_id UUID,
    p_start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() - INTERVAL '30 days',
    p_end_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
RETURNS JSONB AS $$
DECLARE
    model_info RECORD;
    performance_data JSONB;
    drift_analysis JSONB;
    recommendation TEXT;
BEGIN
    -- Obtener información del modelo
    SELECT * INTO model_info FROM specialized_ai_models WHERE id = p_model_id;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('error', 'Model not found');
    END IF;
    
    -- Calcular métricas de rendimiento
    SELECT jsonb_build_object(
        'model_info', jsonb_build_object(
            'name', model_info.model_name,
            'category', model_info.verification_category,
            'industry', model_info.industry_focus,
            'version', model_info.model_version
        ),
        'performance_period', jsonb_build_object(
            'start_date', p_start_date,
            'end_date', p_end_date,
            'days', EXTRACT(DAY FROM p_end_date - p_start_date)
        ),
        'metrics', jsonb_build_object(
            'total_predictions', COUNT(av.*),
            'accuracy', ROUND(
                COUNT(*) FILTER (WHERE av.status = 'passed' AND sf.expert_score >= 80 OR av.status = 'failed' AND sf.expert_score < 80)::DECIMAL / 
                NULLIF(COUNT(*), 0), 4
            ),
            'precision', ROUND(
                COUNT(*) FILTER (WHERE av.status = 'passed' AND sf.expert_score >= 80)::DECIMAL /
                NULLIF(COUNT(*) FILTER (WHERE av.status = 'passed'), 0), 4
            ),
            'recall', ROUND(
                COUNT(*) FILTER (WHERE av.status = 'passed' AND sf.expert_score >= 80)::DECIMAL /
                NULLIF(COUNT(*) FILTER (WHERE sf.expert_score >= 80), 0), 4
            ),
            'average_confidence', ROUND(AVG(av.confidence_score), 3),
            'processing_time_avg', ROUND(AVG(EXTRACT(EPOCH FROM (av.updated_at - av.created_at)) * 1000)),
            'score_correlation', ROUND(CORR(
                (av.ai_result->>'score')::INTEGER, 
                sf.expert_score
            ), 3)
        ),
        'quality_analysis', jsonb_build_object(
            'high_confidence_accuracy', ROUND(
                COUNT(*) FILTER (WHERE av.confidence_score >= 0.9 AND 
                    (av.status = 'passed' AND sf.expert_score >= 80 OR av.status = 'failed' AND sf.expert_score < 80))::DECIMAL /
                NULLIF(COUNT(*) FILTER (WHERE av.confidence_score >= 0.9), 0), 4
            ),
            'low_confidence_rate', ROUND(
                COUNT(*) FILTER (WHERE av.confidence_score < 0.7)::DECIMAL / NULLIF(COUNT(*), 0), 4
            ),
            'false_positive_rate', ROUND(
                COUNT(*) FILTER (WHERE av.status = 'passed' AND sf.expert_score < 80)::DECIMAL /
                NULLIF(COUNT(*) FILTER (WHERE av.status = 'passed'), 0), 4
            ),
            'false_negative_rate', ROUND(
                COUNT(*) FILTER (WHERE av.status = 'failed' AND sf.expert_score >= 80)::DECIMAL /
                NULLIF(COUNT(*) FILTER (WHERE av.status = 'failed'), 0), 4
            )
        )
    ) INTO performance_data
    FROM ai_verifications av
    LEFT JOIN specialized_feedback sf ON av.id = sf.verification_id
    WHERE av.created_at BETWEEN p_start_date AND p_end_date
    AND EXISTS (
        SELECT 1 FROM specialized_ai_models sam 
        WHERE sam.id = p_model_id 
        AND av.verification_type = sam.verification_category
    );
    
    -- Análisis de drift
    SELECT jsonb_build_object(
        'performance_trend', CASE 
            WHEN recent_accuracy > historical_accuracy + 0.05 THEN 'improving'
            WHEN recent_accuracy < historical_accuracy - 0.05 THEN 'degrading'
            ELSE 'stable'
        END,
        'recent_accuracy', recent_accuracy,
        'historical_accuracy', historical_accuracy,
        'drift_magnitude', ABS(recent_accuracy - historical_accuracy)
    ) INTO drift_analysis
    FROM (
        SELECT 
            -- Últimos 7 días
            (SELECT COUNT(*) FILTER (WHERE av.status = 'passed' AND sf.expert_score >= 80 OR av.status = 'failed' AND sf.expert_score < 80)::DECIMAL / 
             NULLIF(COUNT(*), 0)
             FROM ai_verifications av
             LEFT JOIN specialized_feedback sf ON av.id = sf.verification_id
             WHERE av.created_at >= NOW() - INTERVAL '7 days'
             AND EXISTS (SELECT 1 FROM specialized_ai_models sam WHERE sam.id = p_model_id AND av.verification_type = sam.verification_category)
            ) as recent_accuracy,
            -- 30 días anteriores
            (SELECT COUNT(*) FILTER (WHERE av.status = 'passed' AND sf.expert_score >= 80 OR av.status = 'failed' AND sf.expert_score < 80)::DECIMAL / 
             NULLIF(COUNT(*), 0)
             FROM ai_verifications av
             LEFT JOIN specialized_feedback sf ON av.id = sf.verification_id
             WHERE av.created_at BETWEEN NOW() - INTERVAL '37 days' AND NOW() - INTERVAL '7 days'
             AND EXISTS (SELECT 1 FROM specialized_ai_models sam WHERE sam.id = p_model_id AND av.verification_type = sam.verification_category)
            ) as historical_accuracy
    ) drift_calc;
    
    -- Generar recomendación
    SELECT CASE 
        WHEN (performance_data->'metrics'->>'accuracy')::DECIMAL < 0.8 THEN 'immediate_retraining_required'
        WHEN (drift_analysis->>'performance_trend') = 'degrading' THEN 'schedule_retraining'
        WHEN (performance_data->'quality_analysis'->>'low_confidence_rate')::DECIMAL > 0.2 THEN 'increase_training_data'
        WHEN (performance_data->'metrics'->>'accuracy')::DECIMAL > 0.95 THEN 'model_performing_excellently'
        ELSE 'continue_monitoring'
    END INTO recommendation;
    
    RETURN jsonb_build_object(
        'evaluation_timestamp', NOW(),
        'model_performance', performance_data,
        'drift_analysis', drift_analysis,
        'recommendation', recommendation,
        'next_evaluation_date', NOW() + INTERVAL '7 days'
    );
END;
$$ LANGUAGE plpgsql;

-- Función para recomendaciones de mejora de modelo
CREATE OR REPLACE FUNCTION get_model_improvement_recommendations(p_model_id UUID)
RETURNS JSONB AS $$
DECLARE
    model_info RECORD;
    feedback_analysis JSONB;
    recommendations JSONB;
BEGIN
    SELECT * INTO model_info FROM specialized_ai_models WHERE id = p_model_id;
    
    -- Analizar feedback para identificar patrones de error
    SELECT jsonb_build_object(
        'common_failure_patterns', jsonb_agg(DISTINCT 
            CASE 
                WHEN sf.detailed_feedback->>'primary_issue' IS NOT NULL 
                THEN sf.detailed_feedback->>'primary_issue'
                ELSE 'unspecified'
            END
        ),
        'score_distribution', jsonb_build_object(
            'expert_avg', ROUND(AVG(sf.expert_score), 1),
            'ai_avg', ROUND(AVG(sf.ai_score), 1),
            'correlation', ROUND(CORR(sf.expert_score, sf.ai_score), 3)
        ),
        'improvement_areas', jsonb_agg(DISTINCT sf.improvement_suggestions) FILTER (WHERE sf.improvement_suggestions IS NOT NULL)
    ) INTO feedback_analysis
    FROM specialized_feedback sf
    WHERE sf.model_id = p_model_id
    AND sf.created_at >= NOW() - INTERVAL '30 days';
    
    -- Generar recomendaciones específicas
    SELECT jsonb_build_object(
        'data_recommendations', CASE 
            WHEN (feedback_analysis->'score_distribution'->>'correlation')::DECIMAL < 0.7 THEN
                jsonb_build_array(
                    'Increase training data diversity',
                    'Add more edge cases to training set',
                    'Improve annotation quality guidelines'
                )
            ELSE jsonb_build_array('Current training data appears adequate')
        END,
        'model_recommendations', CASE 
            WHEN model_info.model_type = 'vision_classifier' THEN
                jsonb_build_array(
                    'Consider data augmentation techniques',
                    'Experiment with different architectures',
                    'Implement attention mechanisms for key areas'
                )
            WHEN model_info.model_type = 'audio_analyzer' THEN
                jsonb_build_array(
                    'Improve noise reduction preprocessing',
                    'Add speaker adaptation',
                    'Enhance language model integration'
                )
            ELSE jsonb_build_array('Standard optimization techniques')
        END,
        'deployment_recommendations', jsonb_build_array(
            'Implement gradual rollout strategy',
            'Set up A/B testing framework',
            'Monitor performance metrics continuously',
            'Establish feedback collection system'
        )
    ) INTO recommendations;
    
    RETURN jsonb_build_object(
        'model_id', p_model_id,
        'analysis_date', NOW(),
        'feedback_analysis', feedback_analysis,
        'recommendations', recommendations,
        'priority_actions', CASE 
            WHEN (feedback_analysis->'score_distribution'->>'correlation')::DECIMAL < 0.6 THEN 'high'
            WHEN (feedback_analysis->'score_distribution'->>'correlation')::DECIMAL < 0.8 THEN 'medium'
            ELSE 'low'
        END
    );
END;
$$ LANGUAGE plpgsql;

-- Índices para optimización
CREATE INDEX idx_ai_training_datasets_type_vertical ON ai_training_datasets(verification_type, industry_vertical);
CREATE INDEX idx_specialized_ai_models_category ON specialized_ai_models(verification_category);
CREATE INDEX idx_specialized_ai_models_status ON specialized_ai_models(deployment_status);
CREATE INDEX idx_model_training_runs_model_status ON model_training_runs(model_id, status);
CREATE INDEX idx_model_production_metrics_date ON model_production_metrics(evaluation_date);
CREATE INDEX idx_specialized_feedback_model_date ON specialized_feedback(model_id, created_at);
CREATE INDEX idx_verification_categories_type_vertical ON verification_categories(category_type, industry_vertical);

-- Triggers para actualización automática
CREATE TRIGGER update_ai_training_datasets_updated_at
    BEFORE UPDATE ON ai_training_datasets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_specialized_ai_models_updated_at
    BEFORE UPDATE ON specialized_ai_models
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Vista para dashboard de modelos especializados
CREATE VIEW specialized_models_dashboard AS
SELECT 
    sam.id,
    sam.model_name,
    sam.verification_category,
    sam.industry_focus,
    sam.model_version,
    sam.deployment_status,
    sam.confidence_threshold,
    vc.category_name,
    vc.description as category_description,
    atd.name as dataset_name,
    atd.total_samples,
    atd.labeled_samples,
    -- Métricas de rendimiento recientes
    (SELECT COUNT(*) FROM ai_verifications av 
     WHERE av.verification_type = sam.verification_category 
     AND av.created_at >= NOW() - INTERVAL '7 days') as recent_predictions,
    (SELECT ROUND(AVG(confidence_score), 3) FROM ai_verifications av 
     WHERE av.verification_type = sam.verification_category 
     AND av.created_at >= NOW() - INTERVAL '7 days') as recent_avg_confidence,
    sam.created_at,
    sam.deployed_at
FROM specialized_ai_models sam
LEFT JOIN verification_categories vc ON sam.verification_category = vc.category_name
LEFT JOIN ai_training_datasets atd ON sam.training_dataset_id = atd.id
WHERE sam.deployment_status IN ('deployed', 'testing')
ORDER BY sam.created_at DESC;

COMMENT ON TABLE ai_training_datasets IS 'Datasets especializados para entrenamiento de modelos por vertical HORECA';
COMMENT ON TABLE specialized_ai_models IS 'Modelos de AI especializados por categoría de verificación';
COMMENT ON TABLE verification_categories IS 'Categorías de verificación con criterios específicos por industria';
COMMENT ON TABLE model_training_runs IS 'Registro de entrenamientos de modelos con métricas detalladas';
COMMENT ON TABLE model_production_metrics IS 'Métricas de rendimiento de modelos en producción';
COMMENT ON TABLE specialized_feedback IS 'Feedback especializado para mejora continua de modelos';
