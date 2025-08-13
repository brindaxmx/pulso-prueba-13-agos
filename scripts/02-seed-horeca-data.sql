-- Insertar datos de empresas HORECA
INSERT INTO empresas_horeca (id, nombre, rfc, razon_social, tipo_negocio, direccion, contacto_principal, plan, estatus) VALUES
('empresa-001', 'Restaurantes del Centro S.A.', 'RDC123456789', 'Restaurantes del Centro Sociedad Anónima', 'restaurante', 
 '{"calle": "Av. Principal 123", "colonia": "Centro", "ciudad": "Ciudad de México", "cp": "06000"}',
 '{"nombre": "Fernando García", "telefono": "+525512345000", "email": "fernando@restaurantescentro.com"}',
 'professional', 'activo'),
('empresa-002', 'Cafeterías Premium S.A.', 'CPR987654321', 'Cafeterías Premium Sociedad Anónima', 'cafeteria',
 '{"calle": "Blvd. Norte 456", "colonia": "Zona Norte", "ciudad": "Ciudad de México", "cp": "07000"}',
 '{"nombre": "Patricia Moreno", "telefono": "+525512345001", "email": "patricia@cafeteriaspremium.com"}',
 'enterprise', 'activo');

-- Insertar sucursales HORECA
INSERT INTO sucursales_horeca (id, empresa_id, nombre, codigo, tipo, direccion, capacidad_comensales, numero_mesas, telefono, email, estatus) VALUES
('suc-001', 'empresa-001', 'Sucursal Centro', 'RC-CENTRO-001', 'restaurante',
 '{"calle": "Av. Principal 123", "colonia": "Centro", "ciudad": "Ciudad de México", "cp": "06000"}',
 80, 20, '+525512345001', 'centro@restaurantescentro.com', 'activo'),
('suc-002', 'empresa-001', 'Sucursal Norte', 'RC-NORTE-002', 'restaurante',
 '{"calle": "Blvd. Norte 456", "colonia": "Zona Norte", "ciudad": "Ciudad de México", "cp": "07000"}',
 60, 15, '+525512345002', 'norte@restaurantescentro.com', 'activo'),
('suc-003', 'empresa-002', 'Cafetería Premium Centro', 'CP-CENTRO-001', 'restaurante',
 '{"calle": "Calle Sur 789", "colonia": "Zona Sur", "ciudad": "Ciudad de México", "cp": "08000"}',
 40, 12, '+525512345003', 'centro@cafeteriaspremium.com', 'activo');

-- Insertar usuarios HORECA
INSERT INTO usuarios_horeca (id, empresa_id, sucursal_id, empleado_id, email, password_hash, nombre, apellidos, telefono, whatsapp, rol_principal, departamento, turno_asignado, estado) VALUES
('empleado-001', 'empresa-001', 'suc-001', 'EMP001', 'juan.perez@empresa.com', '$2b$10$hash1', 'Juan', 'Pérez García', '+521234567890', '+521234567890', 'chef', 'cocina', 'matutino', 'activo'),
('empleado-002', 'empresa-001', 'suc-001', 'EMP002', 'maria.lopez@empresa.com', '$2b$10$hash2', 'María', 'López Hernández', '+521234567891', '+521234567891', 'mesero', 'servicio', 'vespertino', 'activo'),
('empleado-003', 'empresa-001', 'suc-001', 'EMP003', 'carlos.mendoza@empresa.com', '$2b$10$hash3', 'Carlos', 'Mendoza Silva', '+521234567892', '+521234567892', 'limpieza', 'limpieza', 'vespertino', 'activo'),
('empleado-004', 'empresa-001', 'suc-001', 'EMP004', 'ana.gomez@empresa.com', '$2b$10$hash4', 'Ana', 'Gómez Martínez', '+521234567893', '+521234567893', 'almacenista', 'almacen', 'matutino', 'activo'),
('empleado-005', 'empresa-001', 'suc-001', 'EMP005', 'javier.torres@empresa.com', '$2b$10$hash5', 'Javier', 'Torres Ramírez', '+521234567894', '+521234567894', 'gerente', 'administracion', 'completo', 'activo'),
('empleado-006', 'empresa-001', 'suc-001', 'EMP006', 'laura.rodriguez@empresa.com', '$2b$10$hash6', 'Laura', 'Rodríguez Castro', '+521234567895', '+521234567895', 'cocinero', 'cocina', 'matutino', 'activo'),
('empleado-007', 'empresa-001', 'suc-002', 'EMP007', 'roberto.sanchez@empresa.com', '$2b$10$hash7', 'Roberto', 'Sánchez Morales', '+521234567896', '+521234567896', 'chef', 'cocina', 'matutino', 'activo'),
('empleado-008', 'empresa-002', 'suc-003', 'EMP008', 'carmen.vega@empresa.com', '$2b$10$hash8', 'Carmen', 'Vega Jiménez', '+521234567897', '+521234567897', 'barista', 'bebidas', 'vespertino', 'activo');

-- Insertar flows HORECA (SOPs)
INSERT INTO flows_horeca (id, empresa_id, sucursal_id, nombre, descripcion, tipo, categoria_repse, cfdi_clave_servicio, tiempo_estimado_minutos, roles_autorizados, prioridad, pasos, creado_por) VALUES
('sop-temp-001', 'empresa-001', 'suc-001', 'Control de Temperaturas', 'Monitoreo de refrigeración principal', 'seguridad_alimentaria', 'control_sanitario', '85121600', 10, 
 ARRAY['chef', 'cocinero'], 'critical',
 '[
   {"paso": 1, "tipo": "photo", "titulo": "Foto del termómetro del refrigerador principal", "required": true},
   {"paso": 2, "tipo": "number", "titulo": "Temperatura registrada (°C)", "required": true, "validation": {"min": -2, "max": 4}},
   {"paso": 3, "tipo": "checkbox", "titulo": "Estado del equipo", "opciones": ["Funcionamiento normal", "Ruidos extraños", "Fuga de líquido"], "required": true},
   {"paso": 4, "tipo": "text", "titulo": "Observaciones adicionales", "required": false}
 ]'::jsonb, 'empleado-005'),

('sop-limpieza-001', 'empresa-001', 'suc-001', 'Limpieza Rápida Visual', 'Limpieza de áreas principales', 'limpieza', 'limpieza_especializada', '76111505', 20,
 ARRAY['limpieza'], 'medium',
 '[
   {"paso": 1, "tipo": "checkbox", "titulo": "Áreas de cocina", "opciones": ["Estufas limpias", "Campana extractora", "Mesas de trabajo"], "required": true},
   {"paso": 2, "tipo": "checkbox", "titulo": "Área de servicio", "opciones": ["Mesas limpias", "Sillas acomodadas", "Piso barrido"], "required": true},
   {"paso": 3, "tipo": "photo", "titulo": "Foto del área principal limpia", "required": true}
 ]'::jsonb, 'empleado-005'),

('sop-apertura-001', 'empresa-001', 'suc-001', 'Checklist de Apertura', 'Procedimiento de apertura diaria', 'apertura', 'operacion_general', '92111800', 25,
 ARRAY['gerente', 'supervisor'], 'critical',
 '[
   {"paso": 1, "tipo": "checkbox", "titulo": "Sistemas y equipos", "opciones": ["Caja registradora funcionando", "Terminal de tarjetas activa", "Conexión a internet estable"], "required": true},
   {"paso": 2, "tipo": "number", "titulo": "Efectivo en caja (pesos)", "required": true, "validation": {"min": 500, "max": 5000}},
   {"paso": 3, "tipo": "text", "titulo": "Personal presente", "required": true},
   {"paso": 4, "tipo": "photo", "titulo": "Foto del área lista para atender", "required": true}
 ]'::jsonb, 'empleado-005'),

('sop-inventario-001', 'empresa-001', 'suc-001', 'Control de Inventario', 'Verificación de stock crítico', 'inventario', 'logistica_interna', '78111504', 15,
 ARRAY['almacenista'], 'high',
 '[
   {"paso": 1, "tipo": "text", "titulo": "Producto a verificar", "required": true},
   {"paso": 2, "tipo": "number", "titulo": "Cantidad actual", "required": true},
   {"paso": 3, "tipo": "text", "titulo": "Estado del producto", "required": true},
   {"paso": 4, "tipo": "photo", "titulo": "Foto del inventario", "required": false}
 ]'::jsonb, 'empleado-005');

-- Insertar productos de inventario
INSERT INTO productos_inventario (id, empresa_id, sucursal_id, codigo_producto, nombre, categoria, unidad_medida, stock_actual, stock_minimo, stock_maximo, precio_unitario, proveedor_principal, activo) VALUES
('prod-001', 'empresa-001', 'suc-001', 'CM001', 'Carne Molida', 'proteinas', 'kg', 2.0, 5.0, 50.0, 180.00, '{"nombre": "Carnes del Norte S.A.", "telefono": "+525512340001"}', true),
('prod-002', 'empresa-001', 'suc-001', 'CF001', 'Café en Grano', 'bebidas_no_alcoholicas', 'kg', 3.0, 2.0, 15.0, 450.00, '{"nombre": "Café Premium México", "telefono": "+525512340002"}', true),
('prod-003', 'empresa-001', 'suc-001', 'QO001', 'Queso Oaxaca', 'lacteos', 'kg', 12.0, 3.0, 20.0, 220.00, '{"nombre": "Lácteos de Oaxaca", "telefono": "+525512340003"}', true),
('prod-004', 'empresa-001', 'suc-001', 'TOR001', 'Tortillas', 'granos_cereales', 'paquetes', 45, 20, 100, 15.00, '{"nombre": "Tortillería La Especial", "telefono": "+525512340004"}', true),
('prod-005', 'empresa-001', 'suc-001', 'HT001', 'Harina de Trigo', 'granos_cereales', 'kg', 25, 10, 50, 25.00, '{"nombre": "Molinos Modernos S.A.", "telefono": "+525512340005"}', true);

-- Insertar ejecuciones de flows (ejemplos)
INSERT INTO flow_ejecuciones (id, flow_id, sucursal_id, usuario_id, estado, fecha_inicio, pasos_totales, pasos_completados, duracion_minutos) VALUES
('exec-001', 'sop-temp-001', 'suc-001', 'empleado-001', 'en_progreso', NOW() - INTERVAL '15 minutes', 4, 3, NULL),
('exec-002', 'sop-limpieza-001', 'suc-001', 'empleado-003', 'completado', NOW() - INTERVAL '2 hours', 3, 3, 18),
('exec-003', 'sop-apertura-001', 'suc-001', 'empleado-005', 'completado', NOW() - INTERVAL '4 hours', 4, 4, 22),
('exec-004', 'sop-inventario-001', 'suc-001', 'empleado-004', 'pendiente', NOW() - INTERVAL '20 minutes', 4, 0, NULL);

-- Insertar tickets HORECA
INSERT INTO tickets_horeca (id, empresa_id, sucursal_id, numero_ticket, titulo, descripcion, tipo, prioridad, estado, reportado_por, fecha_creacion) VALUES
('ticket-001', 'empresa-001', 'suc-001', 'TK-001-2025', 'Temperatura crítica en refrigerador', 'El refrigerador principal registra 8.5°C, fuera del rango seguro', 'mantenimiento_correctivo', 'critica', 'nuevo', 'empleado-001', NOW() - INTERVAL '5 minutes'),
('ticket-002', 'empresa-001', 'suc-001', 'TK-002-2025', 'Stock crítico de carne molida', 'Solo quedan 2kg de carne molida, por debajo del mínimo', 'inventario', 'alta', 'asignado', 'empleado-004', NOW() - INTERVAL '12 minutes'),
('ticket-003', 'empresa-001', 'suc-001', 'TK-003-2025', 'Limpieza completada exitosamente', 'Área de cocina limpia con calificación A+', 'limpieza', 'baja', 'resuelto', 'empleado-003', NOW() - INTERVAL '1 hour');

-- Insertar alertas log
INSERT INTO alerts_log (id, type, level, message, recipient_id, created_at) VALUES
('alert-001', 'temperature_critical', 3, '🚨 ALERTA: Temperatura crítica detectada en refrigerador principal: 8.5°C', 'empleado-001', NOW() - INTERVAL '5 minutes'),
('alert-002', 'inventory_low', 2, '📦 Stock bajo: Carne Molida - Solo 2kg restantes (Mínimo: 5kg)', 'empleado-004', NOW() - INTERVAL '12 minutes'),
('alert-003', 'sop_completed', 1, '✅ SOP completado: Limpieza Rápida Visual por María López', 'empleado-005', NOW() - INTERVAL '1 hour'),
('alert-004', 'sop_overdue', 2, '⏰ SOP vencido: Control de Inventario - 20 minutos de retraso', 'empleado-004', NOW() - INTERVAL '20 minutes');

-- Insertar certificaciones
INSERT INTO certificaciones (id, empleado_id, certification_name, certification_body, issue_date, expiry_date, certificate_number, active) VALUES
('cert-001', 'empleado-001', 'Manipulación de Alimentos', 'SENASICA', '2024-01-15', '2025-01-15', 'MA-2024-001', true),
('cert-002', 'empleado-001', 'HACCP Básico', 'SENASICA', '2024-02-01', '2025-02-01', 'HACCP-2024-001', true),
('cert-003', 'empleado-002', 'Servicio al Cliente', 'CONOCER', '2024-01-20', '2025-01-20', 'SC-2024-002', true),
('cert-004', 'empleado-007', 'Chef Profesional', 'Instituto Culinario', '2023-06-15', '2026-06-15', 'CP-2023-007', true);

-- Insertar marco de cumplimiento
INSERT INTO compliance_framework (id, empresa_id, regulation_name, enabled, configuration) VALUES
('comp-001', 'empresa-001', 'REPSE', true, '{"categories": ["control_sanitario", "limpieza_especializada", "logistica_interna"]}'),
('comp-002', 'empresa-001', 'CFDI 4.0', true, '{"version": "4.0", "auto_generation": true}'),
('comp-003', 'empresa-001', 'STPS', true, '{"safety_protocols": ["nom_035", "nom_030"]}'),
('comp-004', 'empresa-001', 'HACCP', true, '{"certification_body": "SENASICA", "expiry_date": "2025-12-31"}');

-- Insertar configuración del sistema
INSERT INTO system_settings (id, empresa_id, timezone, language, currency, business_hours, shift_definitions) VALUES
('settings-001', 'empresa-001', 'America/Mexico_City', 'es_MX', 'MXN',
 '{"monday": {"open": "07:00", "close": "22:00"}, "tuesday": {"open": "07:00", "close": "22:00"}, "wednesday": {"open": "07:00", "close": "22:00"}, "thursday": {"open": "07:00", "close": "22:00"}, "friday": {"open": "07:00", "close": "23:00"}, "saturday": {"open": "08:00", "close": "23:00"}, "sunday": {"open": "08:00", "close": "21:00"}}'::jsonb,
 '{"matutino": {"start": "07:00", "end": "15:00"}, "vespertino": {"start": "15:00", "end": "23:00"}, "nocturno": {"start": "23:00", "end": "07:00"}}'::jsonb);

-- Insertar canales de notificación
INSERT INTO notification_channels (id, empresa_id, channel_type, enabled, priority, configuration) VALUES
('channel-001', 'empresa-001', 'whatsapp', true, 1, '{"provider": "twilio", "phone_number": "+52555PULSO01"}'),
('channel-002', 'empresa-001', 'email', true, 2, '{"smtp_host": "smtp.pulso.com", "smtp_port": 587}'),
('channel-003', 'empresa-001', 'sms', false, 3, '{}');

-- Insertar plantillas de notificación
INSERT INTO notification_templates (id, empresa_id, template_name, channel_type, subject, message_text, variables, active) VALUES
('template-001', 'empresa-001', 'sop_assignment', 'whatsapp', NULL, 
 '📋 Nuevo SOP asignado: {sop_name}\n\n⏰ Tiempo estimado: {estimated_time} min\n🔗 Completar: {completion_url}',
 '["sop_name", "estimated_time", "completion_url"]'::jsonb, true),
('template-002', 'empresa-001', 'temperature_alert', 'whatsapp', NULL,
 '🌡️ ALERTA: Temperatura anormal detectada\n📊 Lectura: {temperature}°C\n⚠️ Rango seguro: -2°C a 4°C\n🏢 Sucursal: {branch_name}',
 '["temperature", "branch_name"]'::jsonb, true),
('template-003', 'empresa-001', 'inventory_low', 'whatsapp', NULL,
 '📦 Stock bajo detectado\n🥩 Producto: {product_name}\n📊 Stock actual: {current_stock} {unit}\n⚠️ Mínimo requerido: {min_stock} {unit}',
 '["product_name", "current_stock", "unit", "min_stock"]'::jsonb, true);

-- Datos de compatibilidad con esquema original
INSERT INTO sucursales (id, nombre, direccion, telefono, gerente, activa) VALUES
('suc-legacy-001', 'Sucursal Centro Legacy', 'Av. Principal 123, Centro', '+525512345001', 'Javier Torres', true),
('suc-legacy-002', 'Sucursal Norte Legacy', 'Blvd. Norte 456, Zona Norte', '+525512345002', 'Roberto Sánchez', true);

INSERT INTO empleados_pulso (id, nombre, apellido, telefono, whatsapp_id, sucursal_id, puesto, activo) VALUES
('emp-legacy-001', 'Juan', 'Pérez García', '+521234567890', 'juan_perez_wa', 'suc-legacy-001', 'Cocinero Jefe', true),
('emp-legacy-002', 'María', 'López Hernández', '+521234567891', 'maria_lopez_wa', 'suc-legacy-001', 'Mesero', true),
('emp-legacy-003', 'Carlos', 'Mendoza Silva', '+521234567892', 'carlos_mendoza_wa', 'suc-legacy-001', 'Personal de Limpieza', true);

INSERT INTO checklist_templates (id, nombre, descripcion, categoria, campos, activo, created_by) VALUES
('template-legacy-001', 'Control de Temperaturas Legacy', 'Monitoreo de refrigeración', 'Seguridad Alimentaria',
 '[{"tipo": "photo", "titulo": "Foto del termómetro", "required": true}, {"tipo": "number", "titulo": "Temperatura (°C)", "required": true, "min": -2, "max": 4}]'::jsonb,
 true, 'emp-legacy-001'),
('template-legacy-002', 'Limpieza Rápida Legacy', 'Limpieza de áreas principales', 'Limpieza',
 '[{"tipo": "checkbox", "titulo": "Áreas limpias", "opciones": ["Cocina", "Servicio", "Baños"], "required": true}]'::jsonb,
 true, 'emp-legacy-001');
