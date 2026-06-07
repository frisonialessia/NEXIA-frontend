# NEXIA · Frontend

Dashboard de **inteligencia operativa** para mantenimiento predictivo industrial.

Frontend en Next.js 14 + TypeScript + Tailwind, desplegado en Vercel.

## Estado

- Cáscara montada (Providers con TanStack Query, Error Boundary, Toaster).
- Vistas del dashboard: en construcción (portándose desde la demo de referencia).

## Para desarrollar con Claude Code

Lee **`CLAUDE.md`** — contiene todo el contexto del proyecto, la arquitectura requerida, la identidad visual y la tarea.

El diseño aprobado está en **`reference/nexia-demo.html`** (demo completa en HTML, fuente de la verdad visual).

## Arranque local

```bash
npm install
npm run dev
```

Crea un archivo `.env.local` con:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```
