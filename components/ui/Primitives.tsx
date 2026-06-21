// ──────────────────────────────────────────────────────────────────────────
// PRIMITIVOS DE UI (sistema de diseño NEXIA)
// ProgressBar · Pill · Button. Construidos sobre los tokens de color, para que
// todas las vistas se vean iguales por construcción.
// ──────────────────────────────────────────────────────────────────────────

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { col, soft, type ColorKey } from "@/lib/constants";

/** Barra de progreso (0..1). Color por token. */
export function ProgressBar({ value, colorKey = "brand" }: { value: number; colorKey?: ColorKey }) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return (
    <div className="h-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800">
      <div className="h-1.5 rounded-full transition-all" style={{ width: `${pct}%`, background: col(colorKey) }} />
    </div>
  );
}

/** Píldora de estado (fondo suave + texto de color). */
export function Pill({ colorKey, children }: { colorKey: ColorKey; children: ReactNode }) {
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide"
      style={{ background: soft(colorKey), color: col(colorKey) }}
    >
      {children}
    </span>
  );
}

/** Interruptor on/off accesible. */
export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className="relative inline-flex h-5 w-9 shrink-0 items-center rounded-full bg-neutral-200 transition-colors dark:bg-neutral-700"
      style={checked ? { background: col("brand") } : undefined}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${checked ? "translate-x-4" : "translate-x-0.5"}`} />
    </button>
  );
}

type Variant = "primary" | "secondary" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

/** Botón con variantes coherentes. */
export function Button({ variant = "primary", className = "", children, ...props }: ButtonProps) {
  const base = "inline-flex items-center justify-center gap-1.5 rounded-xl px-5 py-2.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50";
  if (variant === "primary") {
    return (
      <button className={`${base} text-white ${className}`} style={{ background: col("brand") }} {...props}>
        {children}
      </button>
    );
  }
  if (variant === "secondary") {
    return (
      <button className={`${base} border border-neutral-200 text-neutral-700 hover:border-neutral-300 dark:border-neutral-700 dark:text-neutral-300 ${className}`} {...props}>
        {children}
      </button>
    );
  }
  return (
    <button className={`${base} text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 ${className}`} {...props}>
      {children}
    </button>
  );
}
