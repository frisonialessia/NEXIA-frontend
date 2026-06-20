"use client";

// ──────────────────────────────────────────────────────────────────────────
// MINI GRÁFICO DE LÍNEA — para tendencias compactas (ahorro, salud)
// Curva suave + relleno tenue + punto final. Sin ejes: comunica la dirección
// de un vistazo, no la lectura exacta.
// ──────────────────────────────────────────────────────────────────────────

import { useId } from "react";

const W = 260;
const H = 64;
const PAD = 6;

function suave(pts: [number, number][]): string {
  if (pts.length < 3) return "M " + pts.map((p) => p.join(" ")).join(" L ");
  let d = "M " + pts[0].join(" ");
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${c1x} ${c1y} ${c2x} ${c2y} ${p2[0]} ${p2[1]}`;
  }
  return d;
}

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
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }} preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.18} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${id})`} />
      <path d={linea} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <circle cx={x(n - 1)} cy={y(data[n - 1])} r={3} fill={color} />
    </svg>
  );
}
