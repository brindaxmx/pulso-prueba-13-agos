# Pulso System Overview - Análisis 6W

## Who (¿Para quién es?)

Pulso está diseñado para las empresas del sector HoReCa (Hoteles, Restaurantes y Cafeterías), específicamente para:

### Empresas Objetivo
- **Empresas con múltiples sucursales y operaciones físicas**: Que necesitan estandarizar y monitorear procesos en todos sus locales
- **Franquicias**: Para asegurar el cumplimiento de estándares operativos y de calidad en todos los puntos de venta
- **Negocios que buscan cumplimiento regulatorio automatizado**: Empresas que desean cumplir con normativas como REPSE, CFDI 4.0, NOM-035, NOM-194, NOM-251, etc., sin intervención manual constante

### Usuarios del Sistema
- **Equipos operativos y gerenciales**: Desde el personal de cocina y meseros hasta gerentes de sucursal y directores generales
- Cada usuario tiene un dashboard y flujos de trabajo específicos para su rol

## What (¿Qué es?)

Pulso es una **plataforma de software como servicio (SaaS)** y un **sistema operativo empresarial** que digitaliza y automatiza las operaciones del sector HoReCa.

### Componentes Principales

#### 1. Gestión de SOPs (Procedimientos Operativos Estándar)
- Digitalización, asignación, seguimiento y cumplimiento de tareas críticas
- Control de temperaturas, limpieza, auditorías

#### 2. Compliance Automatizado
- Cumplimiento de normativas laborales (REPSE)
- Cumplimiento fiscal (CFDI)
- Cumplimiento sanitario (NOMs)
- Sin esfuerzo manual

#### 3. Modelo de Federación
- Ecosistema de empresas subsidiarias (Sanipulso, LimpiaPulso, etc.)
- Servicios especializados que generan facturación

#### 4. Integración con WhatsApp
- Canal principal de comunicación
- Notificaciones y flujos interactivos
- Ejecución de tareas

#### 5. Sistema de Diseño y UX
- Frontend moderno basado en shadcn/ui y Tailwind CSS
- Dashboards personalizados por rol

#### 6. Plataforma Auto-Evolutiva
- Utiliza IA (BMAD METHOD) para analizar su propio rendimiento
- Planifica mejoras y desarrolla nuevas funcionalidades

## Where (¿Dónde se implementa?)

### En la Nube (Cloud)
- **Backend**: Servidores centrales de Pulso, alojados en infraestructura como AWS
- **Base de Datos**: Clúster de PostgreSQL para datos estructurados y Redis para caché
- **Integraciones**: Con servicios externos como Twilio (WhatsApp), Supabase, Belvo (finanzas) y el SAT/IMSS

### En el Punto de Operación (On-Premise / Edge)
- **En las Sucursales**: Uso diario en restaurantes, hoteles y cafeterías
- **A través de Dispositivos**: Interacción principalmente a través de teléfonos móviles usando WhatsApp
- **Hardware Black Box**: Dispositivo físico que conecta sensores IoT y actúa como gateway local

## When (¿Cuándo se usa?)

### Operación Continua
- **24/7**: Sistema activo las 24 horas del día, los 7 días de la semana

### Patrones de Uso
- **En Tiempo Real**: Monitoreo continuo de alertas (temperaturas fuera de rango, tareas pendientes)
- **Por Evento**: Cuando se completa un SOP, se detecta stock bajo, o un sensor registra lectura anormal
- **Programado**: Ejecución de SOPs basados en horarios (turnos matutino, vespertino, nocturno) o calendarios
- **Al Final del Periodo**: Generación automática de reportes de cumplimiento (REPSE mensual), reportes de desempeño y cierres contables
- **Durante el Ciclo de Desarrollo**: El sistema de IA (BMAD) analiza datos y propone mejoras en ciclos ágiles de forma continua

## How (¿Cómo funciona?)

### Arquitectura Técnica
- **Frontend**: React, Next.js, shadcn/ui, Tailwind CSS
- **Backend**: Node.js, Prisma (para PostgreSQL)
- **Comunicaciones**: WhatsApp Business API (vía Twilio)
- **IA y Automatización**: Utiliza el protocolo MCP (Model Context Protocol) para conectar modelos de IA (como Claude) con herramientas específicas del sistema

### Flujo de Trabajo de IA (BMAD METHOD)

#### 1. Analizar
- Agentes de IA (Analyst) monitorean datos operativos y de cumplimiento

#### 2. Decidir
- Si se detecta un problema (ej. stock bajo), el agente decide la acción

#### 3. Ejecutar
- El sistema llama a una herramienta (tool call) para ejecutar la acción (ej. activar un SOP de compra)

#### 4. Comunicar
- Notifica a los empleados o gerentes a través de WhatsApp

#### 5. Auto-Evolucionar
- El sistema planea y desarrolla mejoras para sí mismo en un ciclo continuo

## Why (¿Por qué existe? / ¿Cuál es su propósito?)

### Propósito Fundamental
Pulso existe para resolver los desafíos críticos del sector HoReCa de una manera profunda y transformadora.

### Objetivos Principales

#### 1. Eliminar el Incumplimiento
- Automatizar el cumplimiento de normativas para evitar multas y cierres

#### 2. Garantizar la Calidad y Seguridad
- Asegurar que los procesos críticos (como el control de temperaturas) se realicen correctamente
- Proteger la salud de los clientes

#### 3. Reducir la Complejidad Operativa
- Unificar múltiples procesos manuales y sistemas en una sola plataforma digital

#### 4. Escalar el Negocio de Forma Inteligente
- El modelo de federación permite a un negocio principal escalar servicios especializados como empresas subsidiarias independientes

#### 5. Crear un Sistema que se Mejora a Sí Mismo
- Ir más allá de la automatización para crear una plataforma auto-evolutiva
- Aprender de sus datos y desarrollarse continuamente
- Convertirse en un verdadero "sistema operativo" para el negocio

---

## Resumen Ejecutivo

Pulso representa una **evolución paradigmática** en la gestión empresarial del sector HoReCa, transformando operaciones tradicionales en un **ecosistema digital inteligente** que no solo automatiza procesos, sino que **aprende, evoluciona y se optimiza continuamente**.

La plataforma combina **tecnología de vanguardia** con **inteligencia artificial avanzada** para crear un sistema que trasciende las limitaciones de los software tradicionales, convirtiéndose en un verdadero **compañero digital** que impulsa el crecimiento sostenible y el cumplimiento regulatorio automatizado.
