-- Insertar empresa de ejemplo
INSERT INTO empresas (id, nombre, industria, rfc, giro, contacto_responsable, telefono, direccion_matriz, paquete_contratado, fecha_inicio_servicio, estatus, empleados_pulso_activos, configuracion) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 'Pizzas del Valle SA de CV', 'Alimentos y Bebidas', 'PDV940815AB2', 'Restaurante - Pizzería', 'sofia.martinez@pizzasdelvalle.com', '+52811234567', 
'{"calle": "Av. Constitución 456", "colonia": "Centro", "ciudad": "Monterrey", "estado": "Nuevo León", "cp": "64000", "coordenadas": {"lat": 25.6694, "lng": -100.3099}}', 
'pro', '2024-03-01', 'activo', 8, 
'{"timezone": "America/Mexico_City", "moneda": "MXN", "idioma": "es", "notificaciones_gerencia": true}');

-- Insertar sucursales
INSERT INTO sucursales (id, empresa_id, nombre, direccion, tipo_formato, metros_cuadrados, capacidad_personas, horarios, coordenadas, nivel_riesgo_sanitario, certificaciones) VALUES 
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'Pizza del Valle Centro', 'Av. Constitución 456, Centro, Monterrey, NL', 'casual_dining', 180, 60, 
'{"apertura": "11:00", "cierre": "23:00", "dias": ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"]}', 
POINT(25.6694, -100.3099), 'medio', ARRAY['NOM-251', 'Distintivo H']),

('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'Pizza del Valle San Nicolás', 'Plaza Sendero, San Nicolás, NL', 'food_court', 85, 28,
'{"apertura": "10:00", "cierre": "22:00", "dias": ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"]}',
POINT(25.7405, -100.2803), 'alto', ARRAY['NOM-251']),

('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', 'Pizza del Valle Garza García', 'Valle Oriente, Garza García, NL', 'casual_dining', 220, 80,
'{"apertura": "12:00", "cierre": "24:00", "dias": ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"]}',
POINT(25.6515, -100.3755), 'bajo', ARRAY['NOM-251', 'Distintivo H', 'ISO 22000']);

-- Insertar usuarios
INSERT INTO usuarios (id, nombre, apellidos, email, whatsapp, rol, empresa_id, sucursal_acceso, departamento, puesto, permisos, notificaciones, fecha_registro, ultimo_acceso, estatus) VALUES 
('550e8400-e29b-41d4-a716-446655440010', 'Sofía', 'Martínez Hernández López', 'sofia.martinez@pizzasdelvalle.com', '+521234567890', 'gerente_general', '550e8400-e29b-41d4-a716-446655440000', 
ARRAY['550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003'], 
'Administración', 'Gerente General', 
ARRAY['ver_dashboard_ejecutivo', 'gestionar_empleados_pulso', 'ver_reportes_todas_sucursales', 'generar_reportes_consolidados', 'aprobar_solicitudes_personal', 'configurar_checklists'],
'{"whatsapp": true, "email": true, "push": true, "alertas_criticas": true}',
'2024-03-01', '2025-07-18 09:15:00', 'activo'),

('550e8400-e29b-41d4-a716-446655440011', 'Carlos', 'Ruiz González Silva', 'carlos.ruiz@pizzasdelvalle.com', '+521234567891', 'gerente_sucursal', '550e8400-e29b-41d4-a716-446655440000',
ARRAY['550e8400-e29b-41d4-a716-446655440001'],
'Operaciones', 'Gerente de Sucursal Centro',
ARRAY['ver_dashboard_sucursal', 'supervisar_empleados_pulso', 'ver_reportes_sucursal', 'validar_checklists', 'solicitar_personal_temporal'],
'{"whatsapp": true, "email": true, "push": true, "alertas_criticas": true}',
'2024-03-01', '2025-07-18 08:30:00', 'activo');

-- Insertar empleados PULSO
INSERT INTO empleados_pulso (id, nombre, apellidos, email, whatsapp, rfc, curp, rol_dual, especialidad_primaria, especialidad_secundaria, empresa_asignada, sucursal_asignada, contrato_repse, certificaciones, tarifa_hora, horas_asignadas_semana, evaluacion_desempeno, fecha_onboarding, estatus, horarios_trabajo, supervisor_directo) VALUES 
('550e8400-e29b-41d4-a716-446655440020', 'Ana', 'García López Mendoza', 'ana.garcia.emp@pulso.mx', '+521234567892', 'GALA950315AB1', 'GALA950315MNLRPN05', 'hostess_dual', 'atencion_cliente', 'auditoria_experiencia', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001',
'{"numero_contrato": "REPSE-2024-001", "fecha_inicio": "2024-03-15", "fecha_fin": "2025-03-14", "registro_repse": "REP-PULSO-2024-001", "estatus": "activo"}',
ARRAY['Manejo de Alimentos Básico', 'Atención al Cliente', 'Auditoria de Servicios Nivel 1'],
85, 40, 4.8, '2024-03-10', 'activo',
'{"lunes": "14:00-22:00", "martes": "14:00-22:00", "miércoles": "14:00-22:00", "jueves": "14:00-22:00", "viernes": "12:00-20:00", "sábado": "12:00-20:00", "domingo": "libre"}',
'550e8400-e29b-41d4-a716-446655440011');

-- Insertar template de checklist
INSERT INTO checklist_templates (id, nombre, categoria, tipo, descripcion, frecuencia, tiempo_estimado_minutos, areas_involucradas, campos, puntuacion_minima, acciones_automaticas, version, activo, creado_por) VALUES 
('550e8400-e29b-41d4-a716-446655440030', 'Hostess Dual - Apertura de Sucursal', 'hostess_dual', 'apertura', 'Checklist de apertura para hostess con auditoría de experiencia', 'diaria', 25, 
ARRAY['recepcion', 'salon_comedor', 'baños_clientes'],
'[
  {
    "seccion": "Preparación de Recepción",
    "campos": [
      {
        "id": "campo_001",
        "nombre": "limpieza_podium",
        "tipo": "booleano",
        "pregunta": "¿El podium de recepción está limpio y ordenado?",
        "requerido": true,
        "evidencia_fotografica": true
      },
      {
        "id": "campo_002",
        "nombre": "material_promocional",
        "tipo": "booleano",
        "pregunta": "¿El material promocional está actualizado y bien colocado?",
        "requerido": true,
        "evidencia_fotografica": false
      },
      {
        "id": "campo_003",
        "nombre": "sistema_reservas",
        "tipo": "seleccion",
        "pregunta": "Estado del sistema de reservas",
        "opciones": ["Funcionando", "Lento", "No funciona"],
        "requerido": true,
        "evidencia_fotografica": false
      }
    ]
  },
  {
    "seccion": "Auditoría de Ambiente",
    "campos": [
      {
        "id": "campo_004",
        "nombre": "iluminacion_adecuada",
        "tipo": "escala_1_5",
        "pregunta": "Califica la iluminación del área (1=Muy dim, 5=Perfecta)",
        "requerido": true,
        "evidencia_fotografica": false
      },
      {
        "id": "campo_005",
        "nombre": "musica_volumen",
        "tipo": "escala_1_5",
        "pregunta": "Califica el volumen de la música (1=Muy bajo, 5=Muy alto)",
        "requerido": true,
        "evidencia_fotografica": false
      }
    ]
  }
]',
85,
'[
  {
    "condicion": "campo_003 != \"Funcionando\"",
    "accion": "generar_alerta",
    "destinatario": "gerente_sucursal",
    "prioridad": "alta"
  }
]',
'1.2', true, '550e8400-e29b-41d4-a716-446655440010');
