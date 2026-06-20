// ──────────────────────────────────────────────────────────────────────────
// PRIMITIVO · CARD — superficie premium única (sistema de diseño NEXIA)
// Sombra suave en capas + anillo sutil. Una sola tarjeta para TODA la app:
// la consistencia queda garantizada por construcción.
// ──────────────────────────────────────────────────────────────────────────

import type { ReactNode } from "react";

export const SURFACE =
  "rounded-2xl bg-white ring-1 ring-neutral-200/70 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_12px_28px_-14px_rgba(16,24,40,0.14)] dark:bg-neutral-900 dark:ring-neutral-800 dark:shadow-none";

export function Card({ className = "", children }: { className?: string; children: ReactNode }) {
  return <div className={`${SURFACE} ${className}`}>{children}</div>;
}
