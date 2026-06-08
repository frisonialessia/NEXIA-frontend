// ──────────────────────────────────────────────────────────────────────────
// CASCARÓN DE LA APLICACIÓN
// Estructura común a todas las vistas: banner de demostración, barra de
// navegación, el contenido de la página y la notificación móvil flotante.
// ──────────────────────────────────────────────────────────────────────────

import { DemoBanner } from "./DemoBanner";
import { Nav } from "./Nav";
import { PhoneAlert } from "./PhoneAlert";

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 antialiased dark:bg-neutral-950 dark:text-neutral-100">
      <DemoBanner />
      <Nav />
      {children}
      <PhoneAlert />
    </div>
  );
}
