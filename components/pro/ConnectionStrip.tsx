"use client";

// ──────────────────────────────────────────────────────────────────────────
// FRANJA DE CONEXIÓN DE LA FLOTA
// Señal de confianza a nivel planta: el dato llega EN VIVO y los sensores están
// en línea. Resume la salud del enlace (saludEnlace) de toda la flota: cuántos
// sensores responden y hace cuánto se sincronizó la última lectura.
// ──────────────────────────────────────────────────────────────────────────

import { col } from "@/lib/constants";
import { saludEnlace } from "@/lib/data/asset";
import { useT } from "@/lib/state/I18nProvider";
import { useTheme } from "@/lib/state/ThemeProvider";
import type { Maquina } from "@/lib/types";
import { SURFACE } from "./surface";

export function ConnectionStrip({ maquinas }: { maquinas: Maquina[] }) {
  const t = useT();
  const { dark } = useTheme();

  const enlaces = maquinas.map(saludEnlace);
  const online = enlaces.filter((e) => e.online).length;
  const total = enlaces.length;
  const todos = online === total;
  // Frescura de la flota: hace cuánto llegó la última lectura de cualquiera.
  const sincSeg = enlaces.length ? Math.min(...enlaces.map((e) => e.ultimaLecturaSeg)) : 0;
  const color = todos ? col("ok", dark) : col("warn", dark);

  return (
    <div className={`${SURFACE} flex flex-wrap items-center gap-x-5 gap-y-2 px-5 py-3 text-xs`}>
      <span className="flex items-center gap-2 font-medium">
        <span className="relative flex h-2 w-2">
          <span className="ping-soft absolute inline-flex h-full w-full rounded-full" style={{ background: color, opacity: 0.6 }} />
          <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: color }} />
        </span>
        <span style={{ color }}>{t("cc.liveData")}</span>
      </span>
      <span className="text-neutral-300">·</span>
      <span className="text-neutral-500 dark:text-neutral-400">{t("cc.sensorsOnline", { n: online, total })}</span>
      <span className="text-neutral-300">·</span>
      <span className="font-mono text-neutral-400">
        {sincSeg < 1 ? t("cc.syncedNow") : t("cc.syncedAgo", { n: sincSeg })}
      </span>
    </div>
  );
}
