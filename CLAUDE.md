# CLAUDE.md — Contexto maestro de NEXIA

> Este archivo le da a Claude Code todo el contexto del proyecto. Léelo completo antes de escribir cualquier código.

## Qué es NEXIA

NEXIA ("Inteligencia Operativa") es un SaaS de **mantenimiento predictivo industrial**. Monitorea maquinaria rotativa (bombas, motores, compresores, ventiladores) mediante sensores de vibración, detecta anomalías antes de que la máquina falle, y traduce el riesgo a dinero ("esta bomba fallará en 5 días; evitarlo ahorra $12,000").

**Cliente objetivo:** PYMES industriales — embotelladoras, procesadoras de alimentos, plantas de tratamiento de agua, talleres con maquinaria rotativa.

**Propuesta de valor:** "Sabes que la máquina va a fallar días antes de que pase, y evitas la parada de producción."

## Estado actual del proyecto

- **Frontend:** este repo (`nexia-frontend`), Next.js 14 + TypeScript + Tailwind, ya desplegado en Vercel. Actualmente solo tiene una "cáscara" (Providers con TanStack Query, Error Boundary, Toaster) y una página de prueba de vida. **Las vistas reales del dashboard NO están construidas todavía en Next.js.**
- **Diseño de referencia:** en `reference/nexia-demo.html` está la demo COMPLETA y APROBADA (HTML + Tailwind CDN + JS vanilla). Tiene todo el diseño, las vistas, la paleta y la lógica de simulación que hay que portar a Next.js. **Es la fuente de la verdad visual.** No inventes diseño nuevo: replica el de la demo.
- **Backend:** NO existe todavía. El frontend debe funcionar con datos SIMULADOS, estructurados de forma que el día que exista el backend, solo se cambie la fuente de datos.

## TU TAREA (Claude Code)

Portar la demo de `reference/nexia-demo.html` a componentes React/Next.js de producción, vista por vista, dentro de este proyecto. Mantener el diseño idéntico, pero con código limpio, tipado y estructurado para conectar a un backend real en el futuro.

**Disciplina de trabajo:**
1. Antes de escribir código, analiza la demo de referencia y este archivo. Propón un plan y espera aprobación.
2. Construye UNA vista a la vez. Tras cada vista, detente para revisión.
3. No conectes Supabase ni backend todavía: usa datos simulados tipados.
4. Verifica que `npm run build` pasa limpio antes de dar por terminada cada vista.
5. Señala decisiones conscientes y advierte si algo se está sobre-construyendo.

## Arquitectura requerida

```
app/
  layout.tsx            # ya existe (fuentes + Providers)
  providers.tsx         # ya existe (QueryClient, ErrorBoundary, Toaster)
  page.tsx              # reemplazar prueba de vida por el dashboard real
  dashboard/            # o estructura de rutas que decidas
lib/
  types.ts              # FUENTE ÚNICA de tipos del dominio (Maquina, Alerta, Estado, etc.)
  data/
    simulated.ts        # generador de datos simulados (el "motor" de la demo, tipado)
  engine/
    fsm.ts              # la máquina de estados con histéresis (ya validada en la demo)
  format.ts             # formateo de unidades (sistema métrico/imperial)
components/
  CommandCenter.tsx
  AssetDetail.tsx       # con velocímetros (gauges SVG)
  Production.tsx        # OEE, downtime, energía
  Audit.tsx             # human-in-the-loop con causa + acción tomada
  History.tsx
  Connect.tsx           # protocolos industriales
  Settings.tsx          # sistema de unidades métrico/imperial
  Admin.tsx             # gestión de permisos, matriz de roles
  Assistant.tsx         # asistente IA (chat)
  ui/                   # gauges, charts, etc.
```

**Patrón clave — "seam" de datos:** todas las vistas leen datos a través de una capa (ej. `lib/data/`). Hoy esa capa devuelve datos simulados; mañana, llamadas al backend vía TanStack Query. Las vistas NO deben saber de dónde vienen los datos. Esto es inviolable.

## Identidad visual (de la demo, NO cambiar)

- **Tipografía:** Fraunces (serif, para títulos), Inter (sans, cuerpo), JetBrains Mono (datos/números).
- **Paleta estricta — Opción "Tech moderna" (9 colores):**
  - Azul `#3b82f6` (marca, datos principales) · modo oscuro `#60a5fa`
  - Verde `#10b981` (sano/estable) · oscuro `#34d399`
  - Ámbar `#eab308` (advertencia) · oscuro `#facc15`
  - Rojo `#ef4444` (crítico) · oscuro `#f87171`
  - Gris `#94a3b8` (neutro) · oscuro `#cbd5e1`
  - Colores SOLO para datos/gráficos (nunca estados de máquina): Cian `#06b6d4`, Lima `#84cc16`, Naranja `#f97316`, Violeta `#8b5cf6`
- **Los 5 base son semánticos** (verde=sano, rojo=crítico). Los 4 extra solo para series de datos.
- **CERO emojis.** Iconos vectoriales de línea fina (estilo Tabler), como en la demo (símbolos SVG inline).
- **Modo claro por defecto, con toggle a modo oscuro** (clase `dark` de Tailwind). Los colores se aclaran en oscuro.
- Estética editorial, minimalista, profesional. Bordes redondeados (rounded-2xl), mucho espacio en blanco, sin saturar.

## Las vistas (todas están en la demo de referencia)

1. **Command Center** — flota de máquinas en tarjetas, ordenadas por criticidad; banner de ahorro en dinero; gauge de salud general de planta.
2. **Asset Detail** — velocímetros (temperatura, presión, RPM con zona de peligro), estado de sensores/actuadores (verde/rojo), gráfico vibración real vs esperado (curva suave + banda ±2σ), predicción "falla en X días", MTBF/MTTR, horas de operación, botón "ver cómo se detectó" (replay).
3. **Producción/OEE** — OEE global (gauge) + Disponibilidad/Rendimiento/Calidad, contadores de piezas, ritmo, downtime en dona por causas, consumo energético.
4. **Auditoría** — cola de alertas; modal human-in-the-loop: ¿fallo real/falsa alarma/no concluyente? + causa raíz + acción tomada. Etiquetar suma al ahorro.
5. **Historial** — registro de fallos con estado pendiente/resuelto, botón exportar.
6. **Conectar** — protocolos industriales (Modbus TCP/RTU, OPC UA, MQTT, Siemens S7, Allen-Bradley EtherNet/IP, Omron FINS, Mitsubishi MELSEC, Schneider, PROFINET, PROFIBUS, EtherCAT, BACnet) con estado conectado/disponible/configurar.
7. **Ajustes** — perfil; SISTEMA DE UNIDADES métrico (SI) / imperial (EE.UU.) que cambia 6 magnitudes (temperatura, presión, caudal, potencia, par, vibración); idioma; umbrales.
8. **Admin** (solo rol Administrador) — gestión de usuarios y matriz de permisos por rol.
9. **Asistente IA** — chat donde se pregunta en lenguaje natural sobre las máquinas; responde analizando el estado real (en la demo es lógica de reglas; en producción será una llamada a un LLM — Claude/Gemini — vía el backend). Dejar la función de respuesta aislada para sustituirla fácil.

## Roles (5)

Administrador (todo), Jefe de planta (visión global + producción), Técnico de mantenimiento (detalle + conexiones + marca mantenimientos), Operador (monitoreo + auditar), Solo lectura (ve, no toca). El acceso a vistas depende del rol (ver matriz en la demo).

## Lógica del dominio (ya validada en la demo)

- **Detección:** z-score de la vibración contra una baseline esperada (con componente cíclica diaria). Probabilidad de fallo vía sigmoide.
- **FSM con histéresis (anti-flapping):** estados STABLE → WARNING_PROBATION → CRITICAL_ALERT → RECOVERY_PROBATION. Sube a crítico tras N=3 lecturas altas consecutivas; baja a estable tras M=5 bajas. (Código exacto en la demo.)
- **Predicción "días a fallo":** (umbral_crítico − valor_actual) / ritmo_de_degradación_por_día.
- **Dinero:** parada evitada = COSTO_HORA_PARADA × HORAS_PARADA_TIPICA (configurables; defaults 1500 y 8).

## Reglas de negocio / honestidad

- Todos los datos son SIMULADOS. Mantener el badge "Modo demostración · datos simulados" visible.
- Lenguaje humano siempre, nunca jerga ("probabilidad de fallo", no "z-score" en la UI).
- El sistema AVISA, el humano DECIDE. NEXIA lee, no controla máquinas.

## Stack confirmado

Next.js 14 (App Router) · TypeScript · Tailwind (con darkMode: 'class') · TanStack Query v5 · sonner (toasts) · react-error-boundary · recharts (o SVG propio, como en la demo). Desplegado en Vercel. Backend futuro: Python/FastAPI + Supabase (Postgres) + Redis, conectado vía la capa de datos.

## Primera sesión sugerida

1. Lee este archivo y `reference/nexia-demo.html` completo.
2. Propón la estructura de archivos definitiva y el enfoque para la capa de datos simulados tipada. Espera aprobación.
3. Construye los cimientos: `lib/types.ts`, `lib/data/simulated.ts`, `lib/engine/fsm.ts`, y el sistema de navegación + tema.
4. Construye el Command Center como primera vista. Detente para revisión.
