// ──────────────────────────────────────────────────────────────────────────
// RUTA "/calculadora" · pública (sin login) — calculadora de ahorro / ROI
// AuthGate la deja pasar sin sesión (ver RUTAS_PUBLICAS).
// ──────────────────────────────────────────────────────────────────────────

import { Calculadora } from "@/components/Calculadora";

export default function Page() {
  return <Calculadora />;
}
