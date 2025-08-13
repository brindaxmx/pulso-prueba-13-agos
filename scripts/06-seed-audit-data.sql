-- Insertar datos de ejemplo para auditoría y versionado

-- Insertar historial de cambios de ejemplo
INSERT INTO rule_change_history (id, rule_id, action_type, version_number, old_data, new_data, change_summary, changed_by, changed_by_name, changed_at, ip_address) VALUES
('hist-001', 'rule-temp-001', 'created', 1, NULL, 
 '{"id": "rule-temp-001", "description": "Control de Temperaturas", "type": "temperature", "priority": "critical", "active": true}'::jsonb,
 'Regla de control de temperaturas creada inicialmente', 'empleado-005', 'Javier Torres', NOW() - INTERVAL '30 days', '192.168.1.100'),

('hist-002', 'rule-temp-001', 'updated', 2,
 '{"id": "rule-temp-001", "description": "Control de Temperaturas", "type": "temperature", "priority": "critical", "active": true}'::jsonb,
 '{"id": "rule-temp-001", "description": "Control de Temperaturas Mejorado", "type": "temperature", "priority": "critical", "active": true, "trigger_time": "08:00"}'::jsonb,
 'Agregado horario específico de ejecución y mejorada descripción', 'empleado-005', 'Javier Torres', NOW() - INTERVAL '15 days', '192.168.1.100'),

('hist-003', 'rule-limpieza-001', 'created', 1, NULL,
 '{"id": "rule-limpieza-001", "description": "Limpieza de Cocina", "type": "cleaning", "priority": "medium", "active": true}'::jsonb,
 'Regla de limpieza de cocina creada', 'empleado-005', 'Javier Torres', NOW() - INTERVAL '25 days', '192.168.1.100'),

('hist-004', 'rule-temp-001', 'deactivated', 3,
 '{"id": "rule-temp-001", "description": "Control de Temperaturas Mejorado", "type": "temperature", "priority": "critical", "active": true}'::jsonb,
 '{"id": "rule-temp-001", "description": "Control de Temperaturas Mejorado", "type": "temperature", "priority": "critical", "active": false}'::jsonb,
 'Regla desactivada temporalmente para mantenimiento', 'empleado-001', 'Juan Pérez', NOW() - INTERVAL '10 days', '192.168.1.105'),

('hist-005', 'rule-temp-001', 'activated', 4,
 '{"id": "rule-temp-001", "description": "Control de Temperaturas Mejorado", "type": "temperature", "priority": "critical", "active": false}'::jsonb,
 '{"id": "rule-temp-001", "description": "Control de Temperaturas Mejorado", "type": "temperature", "priority": "critical", "active": true}'::jsonb,
 'Regla reactivada después de mantenimiento', 'empleado-005', 'Javier Torres', NOW() - INTERVAL '8 days', '192.168.1.100'),

('hist-006', 'rule-inventario-001', 'created', 1, NULL,
 '{"id": "rule-inventario-001", "description": "Control de Inventario Diario", "type": "inventory", "priority": "high", "active": true}'::jsonb,
 'Nueva regla para control diario de inventario', 'empleado-004', 'Ana Gómez', NOW() - INTERVAL '5 days', '192.168.1.110'),

('hist-007', 'rule-limpieza-001', 'updated', 2,
 '{"id": "rule-limpieza-001", "description": "Limpieza de Cocina", "type": "cleaning", "priority": "medium", "active": true}'::jsonb,
 '{"id": "rule-limpieza-001", "description": "Limpieza Profunda de Cocina", "type": "cleaning", "priority": "high", "active": true, "frequency": "daily"}'::jsonb,
 'Actualizada prioridad y agregada frecuencia diaria', 'empleado-003', 'Carlos Mendoza', NOW() - INTERVAL '3 days', '192.168.1.108'),

('hist-008', 'rule-inventario-001', 'updated', 2,
 '{"id": "rule-inventario-001", "description": "Control de Inventario Diario", "type": "inventory", "priority": "high", "active": true}'::jsonb,
 '{"id": "rule-inventario-001", "description": "Control de Inventario Diario", "type": "inventory", "priority": "high", "active": true, "threshold": 10}'::jsonb,
 'Agregado umbral mínimo de stock', 'empleado-004', 'Ana Gómez', NOW() - INTERVAL '1 day', '192.168.1.110');

-- Insertar versiones de reglas
INSERT INTO rule_versions (id, rule_id, version_number, rule_data, change_notes, tags, is_current, created_by, created_by_name, created_at) VALUES
('ver-001', 'rule-temp-001', 1, 
 '{"id": "rule-temp-001", "description": "Control de Temperaturas", "type": "temperature", "priority": "critical", "active": true}'::jsonb,
 'Versión inicial de la regla de temperaturas', ARRAY['inicial', 'temperatura'], false, 'empleado-005', 'Javier Torres', NOW() - INTERVAL '30 days'),

('ver-002', 'rule-temp-001', 2,
 '{"id": "rule-temp-001", "description": "Control de Temperaturas Mejorado", "type": "temperature", "priority": "critical", "active": true, "trigger_time": "08:00"}'::jsonb,
 'Agregado horario específico y mejorada descripción', ARRAY['mejorada', 'horario'], false, 'empleado-005', 'Javier Torres', NOW() - INTERVAL '15 days'),

('ver-003', 'rule-temp-001', 3,
 '{"id": "rule-temp-001", "description": "Control de Temperaturas Mejorado", "type": "temperature", "priority": "critical", "active": false}'::jsonb,
 'Versión desactivada para mantenimiento', ARRAY['desactivada', 'mantenimiento'], false, 'empleado-001', 'Juan Pérez', NOW() - INTERVAL '10 days'),

('ver-004', 'rule-temp-001', 4,
 '{"id": "rule-temp-001", "description": "Control de Temperaturas Mejorado", "type": "temperature", "priority": "critical", "active": true}'::jsonb,
 'Versión reactivada después de mantenimiento', ARRAY['reactivada', 'estable'], true, 'empleado-005', 'Javier Torres', NOW() - INTERVAL '8 days'),

('ver-005', 'rule-limpieza-001', 1,
 '{"id": "rule-limpieza-001", "description": "Limpieza de Cocina", "type": "cleaning", "priority": "medium", "active": true}'::jsonb,
 'Versión inicial de limpieza', ARRAY['inicial', 'limpieza'], false, 'empleado-005', 'Javier Torres', NOW() - INTERVAL '25 days'),

('ver-006', 'rule-limpieza-001', 2,
 '{"id": "rule-limpieza-001", "description": "Limpieza Profunda de Cocina", "type": "cleaning", "priority": "high", "active": true, "frequency": "daily"}'::jsonb,
 'Actualizada prioridad y frecuencia', ARRAY['mejorada', 'diaria'], true, 'empleado-003', 'Carlos Mendoza', NOW() - INTERVAL '3 days'),

('ver-007', 'rule-inventario-001', 1,
 '{"id": "rule-inventario-001", "description": "Control de Inventario Diario", "type": "inventory", "priority": "high", "active": true}'::jsonb,
 'Versión inicial de inventario', ARRAY['inicial', 'inventario'], false, 'empleado-004', 'Ana Gómez', NOW() - INTERVAL '5 days'),

('ver-008', 'rule-inventario-001', 2,
 '{"id": "rule-inventario-001", "description": "Control de Inventario Diario", "type": "inventory", "priority": "high", "active": true, "threshold": 10}'::jsonb,
 'Agregado umbral mínimo', ARRAY['umbral', 'optimizada'], true, 'empleado-004', 'Ana Gómez', NOW() - INTERVAL '1 day');

-- Insertar comparaciones guardadas
INSERT INTO rule_comparisons (id, rule_id, version_from, version_to, comparison_data, comparison_summary, created_by, created_at, name, description) VALUES
('comp-001', 'rule-temp-001', 1, 2,
 '{"changes": [{"field": "description", "from": "Control de Temperaturas", "to": "Control de Temperaturas Mejorado"}, {"field": "trigger_time", "from": null, "to": "08:00"}]}'::jsonb,
 '{"total": 2, "added": 1, "modified": 1, "removed": 0}'::jsonb,
 'empleado-005', NOW() - INTERVAL '10 days', 'Comparación v1 vs v2', 'Comparación de mejoras iniciales'),

('comp-002', 'rule-temp-001', 2, 4,
 '{"changes": [{"field": "active", "from": true, "to": false}, {"field": "active", "from": false, "to": true}]}'::jsonb,
 '{"total": 1, "added": 0, "modified": 1, "removed": 0}'::jsonb,
 'empleado-005', NOW() - INTERVAL '5 days', 'Comparación activación', 'Verificar cambios de estado');

-- Insertar rollbacks
INSERT INTO rule_rollbacks (id, rule_id, from_version, to_version, reason, status, requested_by, approved_by, rolled_back_by, rolled_back_at, created_at) VALUES
('roll-001', 'rule-temp-001', 3, 2, 'La versión 3 causó problemas de rendimiento, necesitamos volver a la versión estable anterior', 'completed', 'empleado-001', 'empleado-005', 'empleado-005', NOW() - INTERVAL '9 days', NOW() - INTERVAL '10 days'),

('roll-002', 'rule-limpieza-001', 2, 1, 'La nueva frecuencia diaria está sobrecargando al personal, necesitamos volver a la configuración anterior', 'pending', 'empleado-003', NULL, NULL, NULL, NOW() - INTERVAL '1 day'),

('roll-003', 'rule-inventario-001', 2, 1, 'El umbral de 10 es muy bajo y genera demasiadas alertas falsas', 'approved', 'empleado-004', 'empleado-005', NULL, NULL, NOW() - INTERVAL '2 hours');
