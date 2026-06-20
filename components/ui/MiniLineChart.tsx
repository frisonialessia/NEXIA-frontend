"use client";

// ──────────────────────────────────────────────────────────────────────────
// MINI GRÁFICO DE LÍNEA — para tendencias compactas (ahorro, salud)
// Curva suave + relleno tenue + punto final. Sin ejes: comunica la dirección
// de un vistazo, no la lectura exacta.
// ──────────────────────────────────────────────────────────────────────────

import { useId } from "react";
import { suave } from "@/lib/ui/curve";

const W = 260;
const H = 64;
const PAD = 6;

export function MiniLineChart({ data, color }: { data: number[]; color: string }) {
  const uid = useId();
  const n = data.length;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const rango = max - min || 1;
  const x = (i: number) => PAD + (i / (n - 1)) * (W - PAD * 2);
  const y = (v: number) => H - PAD - ((v - min) / rango) * (H - PAD * 2);
  const pts: [number, number][] = data.map((v, i) => [x(i), y(v)]);
  const linea = suave(pts);
  const area = `${linea} L ${x(n - 1)} ${H} L ${x(0)} ${H} Z`;
  // id único y saneado: el color ahora es un token CSS (var(--c-…)) y no sirve
  // para construir el id del degradado (rompería la referencia url(#…)).
  const id = "grad-" + uid.replace(/[^a-zA-Z0-9]/g, "");

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="block h-full w-full" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.18} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${id})`} />
      {/* vector-effect mantiene el trazo en 2px aunque el SVG se estire */}
      <path d={linea} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
