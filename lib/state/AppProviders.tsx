"use client";

// ──────────────────────────────────────────────────────────────────────────
// PROVEEDORES DE LA APP
// Tema y sesión (rol + unidades). La flota ya no necesita provider: vive en un
// store singleton al que los componentes se suscriben por slice (lib/state/
// fleetStore + useFleet).
// ──────────────────────────────────────────────────────────────────────────

import { AdminProvider } from "./AdminProvider";
import { SessionProvider } from "./SessionProvider";
import { ThemeProvider } from "./ThemeProvider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <SessionProvider>
        <AdminProvider>{children}</AdminProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}
