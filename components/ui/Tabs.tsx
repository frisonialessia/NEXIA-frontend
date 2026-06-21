"use client";

// ──────────────────────────────────────────────────────────────────────────
// PESTAÑAS — control segmentado reutilizable
// Usado por Alertas (Pendientes/Historial) y Configuración (Ajustes/Conexiones/
// Equipo). Se desplaza horizontalmente si no caben todas, sin desbordar la caja.
// ──────────────────────────────────────────────────────────────────────────

import { col, soft } from "@/lib/constants";
import { useTheme } from "@/lib/state/ThemeProvider";

export interface TabDef {
  id: string;
  label: string;
  /** Indicador opcional (p. ej. número de pendientes). */
  badge?: number;
}

export function Tabs({ tabs, activo, onChange }: { tabs: TabDef[]; activo: string; onChange: (id: string) => void }) {
  const { dark } = useTheme();
  const brand = col("brand", dark);
  return (
    <div className="no-scrollbar max-w-full overflow-x-auto">
      <div className="inline-flex w-max gap-1 rounded-xl border border-neutral-200 p-0.5 dark:border-neutral-700">
        {tabs.map((t) => {
          const on = t.id === activo;
          return (
            <button
              key={t.id}
              onClick={() => onChange(t.id)}
              className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg px-4 py-1.5 text-sm font-medium transition-colors"
              style={on ? { background: brand, color: "#fff" } : { color: "#737373" }}
            >
              {t.label}
              {typeof t.badge === "number" && t.badge > 0 && (
                <span
                  className="flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px] font-semibold"
                  style={on ? { background: "rgba(255,255,255,0.25)", color: "#fff" } : { background: soft("crit"), color: col("crit", dark) }}
                >
                  {t.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
