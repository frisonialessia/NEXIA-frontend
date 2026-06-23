# NEXIA · Frontend

Dashboard de **inteligencia operativa** para mantenimiento predictivo industrial.
Monitorea maquinaria rotativa, detecta anomalías antes del fallo y traduce el
riesgo a dinero.

Next.js 14 (App Router) · TypeScript · Tailwind · TanStack Query · desplegado en Vercel.

## Estado

- **Todas las vistas portadas** desde la demo de referencia a componentes de producción.
- Funciona con **datos simulados tipados**; listo para conectar un backend real sin tocar las vistas.
- Verificado: `npm run lint`, `npm test` y `npm run build` pasan limpio.

## Arranque local

```bash
npm install
npm run dev
```

Por defecto la app corre **100 % simulada** (no necesita backend ni variables de entorno).

## Modo backend (opcional)

La capa de datos puede conectarse a un backend real definiendo una variable de entorno:

```bash
# .env.local
NEXT_PUBLIC_API_URL=https://api.nexia.app   # base REST (sin barra final)
# NEXT_PUBLIC_WS_URL=wss://api.nexia.app/v1/fleet/live   # opcional; se deriva sola
```

Con la variable, el frontend trae un snapshot por REST y escucha el WebSocket en
vivo, con **respaldo automático a la simulación** si la conexión falla. El
contrato exacto que debe implementar el backend está en **`lib/api/contract.ts`**
(URLs, DTOs, mensajes del WebSocket y comandos). Ver también `.env.example`.

## Arquitectura

**Seam de datos (inviolable):** las vistas leen todo a través de hooks
(`lib/state/useFleet.ts`). Hoy esos hooks sirven la simulación; mañana, el
backend. Las vistas no saben de dónde vienen los datos.

```
app/                 rutas (App Router); las legacy redirigen a las consolidadas
components/          vistas y UI (CommandCenter, AssetDetail, Production, Alertas, …)
lib/
  types.ts           fuente única de tipos del dominio
  constants.ts       paleta, flota inicial, umbrales, unidades
  data/simulated.ts  motor simulado (la capa intercambiable)
  engine/fsm.ts      FSM con histéresis + detección + predicción (puro, testeado)
  domain/            lógica de dominio (orden de flota, explicabilidad, precisión)
  state/fleetStore.ts store con slices + selector del backend/simulación
  api/               contrato + adaptador (REST + WebSocket) + mapeadores
  i18n/              mensajes ES/EN
  format.ts          conversión de unidades (métrico/imperial)
```

## Vistas

Centro de mando · Detalle de activo · Producción/OEE · Alertas (auditoría +
historial) · Mantenimiento · Reportes/analítica · Asistente IA · Configuración
(perfil, unidades, plantas, equipo, conexiones, facturación, admin).

Acceso por **rol** (administrador, jefe de planta, técnico, operador, solo lectura).

## UX de confianza

Diseñada para que un comprador industrial audite el sistema de punta a punta:

- **Aprendiendo baseline:** una máquina nueva calibra antes de juzgar (no inventa alertas el primer día).
- **Salud de la conexión:** se ve que el dato es real y fresco (gateway en línea, última lectura, señal, batería) en la flota y en el detalle.
- **Explicabilidad de alertas:** el porqué en lenguaje humano (desviación, sigmas, umbral, confirmación anti-falsa-alarma).
- **Predicción honesta:** días a fallo como rango ("falla en 4–7 días"), no un número falsamente preciso.
- **Registro de aciertos:** precisión auditable del modelo a partir de los veredictos human-in-the-loop.

## Scripts

```bash
npm run dev     # desarrollo
npm run build   # build de producción
npm run lint    # ESLint
npm run typecheck  # TypeScript sin emitir
npm test        # tests (Vitest)
```

## Contexto para Claude Code

Lee **`CLAUDE.md`** — contexto maestro, arquitectura, identidad visual y disciplina de trabajo.
El diseño aprobado está en **`reference/nexia-demo.html`** (fuente de la verdad visual).
