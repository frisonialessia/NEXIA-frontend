"use client";

// ──────────────────────────────────────────────────────────────────────────
// INICIO — elige la pantalla de arranque según el rol
// Operador → modo simple ("qué atender ahora"). Resto → centro de mando.
// ──────────────────────────────────────────────────────────────────────────

import { useSession } from "@/lib/state/SessionProvider";
import { CommandCenter } from "./CommandCenter";
import { OperatorHome } from "./OperatorHome";

export function Home() {
  const { modoOperador } = useSession();
  return modoOperador ? <OperatorHome /> : <CommandCenter />;
}
