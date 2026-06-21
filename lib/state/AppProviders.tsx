"use client";

// ──────────────────────────────────────────────────────────────────────────
// PROVEEDORES DE LA APP
// Tema y sesión (rol + unidades). La flota ya no necesita provider: vive en un
// store singleton al que los componentes se suscriben por slice (lib/state/
// fleetStore + useFleet).
// ──────────────────────────────────────────────────────────────────────────

import { AdminProvider } from "./AdminProvider";
import { I18nProvider } from "./I18nProvider";
import { IntegrationsProvider } from "./IntegrationsProvider";
import { MaintenanceProvider } from "./MaintenanceProvider";
import { OrgProvider } from "./OrgProvider";
import { SessionProvider } from "./SessionProvider";
import { ThemeProvider } from "./ThemeProvider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <I18nProvider>
        <SessionProvider>
          <OrgProvider>
            <AdminProvider>
              <MaintenanceProvider>
                <IntegrationsProvider>{children}</IntegrationsProvider>
              </MaintenanceProvider>
            </AdminProvider>
          </OrgProvider>
        </SessionProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}
