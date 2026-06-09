// ──────────────────────────────────────────────────────────────────────────
// RUTA "/admin" · ADMIN (gestión de permisos)
// Vista protegida por rol (la propia vista verifica el acceso).
// ──────────────────────────────────────────────────────────────────────────

import { Admin } from "@/components/Admin";

export default function Page() {
  return <Admin />;
}
