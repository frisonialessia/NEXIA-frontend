// ──────────────────────────────────────────────────────────────────────────
// PRIMITIVOS DE TIPOGRAFÍA (sistema de diseño NEXIA)
// Reglas:
//  · PageTitle  → Fraunces (serif): solo títulos de página. Identidad editorial.
//  · Label      → Inter, mayúsculas con tracking: etiquetas y encabezados de sección.
//  · Stat       → Inter semibold (sans): números héroe. (Mono opcional para datos.)
// ──────────────────────────────────────────────────────────────────────────

import type { ReactNode } from "react";
import { col, type ColorKey } from "@/lib/constants";

export function PageTitle({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <h1 className={`font-serif text-3xl tracking-tight ${className}`}>{children}</h1>;
}

export function Label({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <span className={`text-[11px] font-medium uppercase tracking-[0.14em] text-neutral-400 ${className}`}>{children}</span>;
}

const SIZES = {
  lg: "text-3xl",
  md: "text-2xl",
  sm: "text-xl",
} as const;

/** Número héroe: Inter semibold (o mono para datos tabulares). Color opcional. */
export function Stat({
  value,
  size = "lg",
  colorKey,
  mono = false,
  className = "",
}: {
  value: ReactNode;
  size?: keyof typeof SIZES;
  colorKey?: ColorKey;
  mono?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`${mono ? "font-mono" : "font-sans"} font-semibold tracking-tight tabular-nums ${SIZES[size]} ${className}`}
      style={colorKey ? { color: col(colorKey) } : undefined}
    >
      {value}
    </div>
  );
}
