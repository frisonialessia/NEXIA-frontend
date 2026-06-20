"use client";

// ──────────────────────────────────────────────────────────────────────────
// PROVEEDORES DE LA APP
// Une los tres contextos compartidos por todas las vistas: tema, sesión
// (rol + unidades) y flota (la capa de datos). Se monta una sola vez en el
// layout, de modo que navegar entre rutas NO reinicia la simulación.
// ──────────────────────────────────────────────────────────────────────────

import { FleetProvider } from "./FleetProvider";
import { SessionProvider } from "./SessionProvider";
import { ThemeProvider } from "./ThemeProvider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <SessionProvider>
        <FleetProvider>{children}</FleetProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}
