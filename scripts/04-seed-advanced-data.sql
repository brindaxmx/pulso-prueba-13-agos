-- Insertar datos avanzados para el sistema PULSO

-- Insertar reglas del motor de secuencias
INSERT INTO sequence_engine_rules (id, type, description, trigger_time, days, shifts, sop_id, assign_to, active, priority) VALUES 
('rule-temp-001', 'time_based', 'Dispara SOP de control de temperaturas a las 11:00 AM y 7:00 PM', 
 ARRAY['11:00', '19:00'], 
 ARRAY['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'],
 ARRAY['matutino', 'vespertino'],
 '550e8400-e29b-41d4-a716-446655440030',
 ARRAY['cocinero', 'mesero'],
 true, 'high'),

('rule-inv-001', 'event_based', 'Si el stock de carne molida baja de 5 kg, dispara SOP de compra',
 NULL, NULL, NULL,
 '550e8400-e29b-41d4-a716-446655440030',
 ARRAY['compras_team'],
 true, 'critical'),

('rule-lim-001', 'shift_based', 'Al final del turno vespertino, dispara SOP de limpieza rápida visual',
 NULL,
 ARRAY['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'],
 ARRAY['vespertino'],
 '550e8400-e29b-41d4-a716-446655440030',
 ARRAY['personal_limpieza'],
 true, 'medium');

-- Insertar items de inventario
INSERT INTO inventory_tracking (id, item_name, current_stock, unit, min_threshold, max_threshold, sucursal_id, supplier, precio_promedio, tiempo_entrega_dias) VALUES 
('item-001', 'carne_molida', 8.5, 'kg', 5.0, 50.0, '550e8400-e29b-41d4-a716-446655440001', 'Carnes del Norte S.A.', 180.00, 1),
('item-002', 'tortillas', 45, 'paquetes', 20, 100, '550e8400-e29b-41d4-a716-446655440001', 'Tortillería La Especial', 15.00, 1),
('item-003', 'queso_oaxaca', 12.3, 'kg', 3.0, 20.0, '550e8400-e29b-41d4-a716-446655440001', 'Lácteos de Oaxaca', 220.00, 2),
('item-004', 'cafe_grano', 6.8, 'kg', 2.0, 15.0, '550e8400-e29b-41d4-a716-446655440001', 'Café Premium México', 450.00, 3),
('item-005', 'harina_trigo', 25.0, 'kg', 10.0, 50.0, '550e8400-e29b-41d4-a716-446655440001', 'Molinos Modernos S.A.', 25.00, 2);

-- Insertar secuencias condicionales
INSERT INTO conditional_sequences (sequence_id, if_condition, then_actions, active) VALUES 
('seq-001', 
 '{"type": "time_reached", "parameters": {"time": "10:30", "days": ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"], "shift": "matutino"}}',
 '[{"action_type": "activate_sop", "parameters": {"sop_id": "550e8400-e29b-41d4-a716-446655440030", "assign_to": "mesero"}, "delay_minutes": 0}]',
 true),

('seq-002',
 '{"type": "threshold_met", "parameters": {"item": "carne_molida", "operator": "<", "value": 5, "unit": "kg"}}',
 '[{"action_type": "send_alert", "parameters": {"to": "gerente_sucursal", "message": "📦 Stock bajo de carne molida (<5 kg). Disparar SOP: Solicitud de Compra."}}, {"action_type": "create_task", "parameters": {"title": "Reabastecer Carne Molida", "assigned_to": "compras_team", "due_in_hours": 24}}]',
 true);

-- Insertar configuración del sistema
INSERT INTO system_config (key, value, description) VALUES 
('whatsapp_integration', 
 '{"provider": "twilio", "config": {"account_sid": "{{TWILIO_SID}}", "auth_token": "{{TWILIO_TOKEN}}", "webhook_url": "https://api.pulso.com/webhooks/hr-suc-001", "phone_number": "+52555PULSO01", "business_account_id": "{{WHATSAPP_BUSINESS_ID}}"}}',
 'Configuración de integración con WhatsApp vía Twilio'),

('notification_channels',
 '{"whatsapp": {"enabled": true, "priority": 1}, "email": {"enabled": true, "priority": 2, "smtp_config": {"host": "smtp.pulso.com", "port": 587, "secure": true}}, "sms": {"enabled": false, "priority": 3}}',
 'Configuración de canales de notificación'),

('business_hours',
 '{"monday": {"open": "07:00", "close": "22:00"}, "tuesday": {"open": "07:00", "close": "22:00"}, "wednesday": {"open": "07:00", "close": "22:00"}, "thursday": {"open": "07:00", "close": "22:00"}, "friday": {"open": "07:00", "close": "23:00"}, "saturday": {"open": "08:00", "close": "23:00"}, "sunday": {"open": "08:00", "close": "21:00"}}',
 'Horarios de operación del negocio'),

('shift_definitions',
 '{"matutino": {"start": "07:00", "end": "15:00"}, "vespertino": {"start": "15:00", "end": "23:00"}, "nocturno": {"start": "23:00", "end": "07:00"}}',
 'Definición de turnos de trabajo'),

('compliance_framework',
 '{"mexico_regulations": {"repse": {"enabled": true, "categories": ["control_sanitario", "limpieza_especializada", "logistica_interna", "calidad_higiene"]}, "cfdi": {"enabled": true, "version": "4.0", "auto_generation": true}, "stps": {"enabled": true, "safety_protocols": ["nom_035", "nom_030"]}}, "certifications": {"iso_22000": {"enabled": false}, "haccp": {"enabled": true, "certification_body": "SENASICA", "expiry_date": "2025-12-31"}}}',
 'Marco de cumplimiento regulatorio mexicano');

-- Insertar templates de SOPs avanzados
INSERT INTO checklist_templates (id, nombre, categoria, tipo, descripcion, frecuencia, tiempo_estimado_minutos, areas_involucradas, campos, puntuacion_minima, acciones_automaticas, version, activo, creado_por) VALUES 
('sop-temp-001', 'Control de Temperaturas', 'control_sanitario', 'diario', 'SOP para control de temperaturas de equipos de refrigeración', 'diaria', 10, 
 ARRAY['cocina', 'almacen'],
 '[
   {
     "seccion": "Control de Temperaturas",
     "campos": [
       {
         "id": "temp_001",
         "nombre": "foto_termometro",
         "tipo": "photo",
         "pregunta": "Foto del termómetro del refrigerador principal",
         "requerido": true,
         "evidencia_fotografica": true,
         "validaciones": {"min_resolution": "720p", "max_file_size": "5MB"}
       },
       {
         "id": "temp_002", 
         "nombre": "temperatura_registrada",
         "tipo": "numero",
         "pregunta": "Temperatura registrada (°C)",
         "requerido": true,
         "rango": {"min": -2, "max": 4},
         "decimal_places": 1
       },
       {
         "id": "temp_003",
         "nombre": "estado_equipo",
         "tipo": "checkbox",
         "pregunta": "Estado del equipo",
         "opciones": ["Funcionamiento normal", "Ruidos extraños", "Fuga de líquido", "Display dañado"],
         "requerido": true
       },
       {
         "id": "temp_004",
         "nombre": "observaciones",
         "tipo": "texto_largo",
         "pregunta": "Observaciones adicionales",
         "requerido": false,
         "max_caracteres": 500
       }
     ]
   }
 ]',
 85,
 '[
   {
     "condicion": "temperatura_registrada < -2 OR temperatura_registrada > 4",
     "accion": "generar_alerta",
     "destinatario": "gerente_sucursal",
     "prioridad": "critica"
   }
 ]',
 '2.0', true, '550e8400-e29b-41d4-a716-446655440010'),

('sop-corte-caja-001', 'Corte de Caja', 'finanzas_control', 'cada_4_horas', 'SOP para realizar cortes de caja periódicos', 'cada_4_horas', 20,
 ARRAY['caja', 'administracion'],
 '[
   {
     "seccion": "Conteo de Efectivo",
     "campos": [
       {
         "id": "caja_001",
         "nombre": "efectivo_caja",
         "tipo": "numero",
         "pregunta": "Efectivo en caja (pesos)",
         "requerido": true,
         "rango": {"min": 0, "max": 50000}
       },
       {
         "id": "caja_002",
         "nombre": "ventas_efectivo",
         "tipo": "numero", 
         "pregunta": "Ventas en efectivo (pesos)",
         "requerido": true,
         "rango": {"min": 0, "max": 100000}
       },
       {
         "id": "caja_003",
         "nombre": "ventas_tarjeta",
         "tipo": "numero",
         "pregunta": "Ventas con tarjeta (pesos)",
         "requerido": true,
         "rango": {"min": 0, "max": 100000}
       },
       {
         "id": "caja_004",
         "nombre": "diferencia",
         "tipo": "numero",
         "pregunta": "Diferencia encontrada (pesos)",
         "requerido": true,
         "rango": {"min": -1000, "max": 1000}
       },
       {
         "id": "caja_005",
         "nombre": "foto_reporte",
         "tipo": "photo",
         "pregunta": "Foto del reporte de ventas",
         "requerido": true,
         "evidencia_fotografica": true
       }
     ]
   }
 ]',
 90,
 '[
   {
     "condicion": "abs(diferencia) > 100",
     "accion": "generar_alerta",
     "destinatario": "gerente_regional",
     "prioridad": "critica"
   }
 ]',
 '2.0', true, '550e8400-e29b-41d4-a716-446655440010');
