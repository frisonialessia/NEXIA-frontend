// ──────────────────────────────────────────────────────────────────────────
// RUTA "/mantenimiento" · MANTENIMIENTO (órdenes de trabajo)
// Vista protegida por rol (la propia vista verifica el acceso).
// ──────────────────────────────────────────────────────────────────────────

import { Maintenance } from "@/components/Maintenance";

export default function Page() {
  return <Maintenance />;
}
