"use client";

// ──────────────────────────────────────────────────────────────────────────
// GRÁFICO DE VIBRACIÓN · real vs. esperado
// Curva suave (Catmull-Rom → Bézier), banda de "rango normal" (±2σ), línea
// esperada punteada y resalte del último punto cuando se sale de la banda.
// Portado 1:1 de renderChart() de la demo.
// ──────────────────────────────────────────────────────────────────────────

import { col } from "@/lib/constants";
import { DESV_ESTANDAR } from "@/lib/engine/fsm";
import { useTheme } from "@/lib/state/ThemeProvider";
import type { Lectura } from "@/lib/types";

const W = 860;
const H = 240;
const PAD = 38;

/** Convierte una lista de puntos [x,y] en una curva suave (path SVG). */
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

export function VibrationChart({ data }: { data: Lectura[] }) {
  const { dark } = useTheme();

  if (data.length < 2) {
    return <p className="py-12 text-center text-sm text-neutral-400">Recopilando lecturas…</p>;
  }

  const vals = data.map((h) => h.v);
  const exps = data.map((h) => h.exp);
  const maxV = Math.max(...vals, ...exps.map((e) => e + 1.5)) * 1.1;
  const minV = 0;
  const n = data.length;
  const std = DESV_ESTANDAR;

  const x = (i: number) => PAD + (i / (n - 1)) * (W - PAD - 12);
  const y = (v: number) => H - PAD + 6 - ((v - minV) / (maxV - minV)) * (H - PAD - 14);

  const bandU = exps.map((e, i) => `${x(i)},${y(e + 2 * std)}`).join(" ");
  const bandL = exps
    .map((e, i) => `${x(i)},${y(e - 2 * std)}`)
    .reverse()
    .join(" ");

  const realPts: [number, number][] = vals.map((v, i) => [x(i), y(v)]);
  const expPts: [number, number][] = exps.map((e, i) => [x(i), y(e)]);
  const ticks = [0, Math.round(maxV / 2), Math.round(maxV)];
  const fueraDeBanda = vals[n - 1] > exps[n - 1] + 2 * std;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 240 }}>
      {ticks.map((t) => (
        <g key={t}>
          <line x1={PAD} y1={y(t)} x2={W - 12} y2={y(t)} stroke="currentColor" strokeOpacity={0.08} />
          <text x={PAD - 6} y={y(t) + 4} textAnchor="end" fontSize={11} fill="#9ca3af" className="font-mono">
            {t}
          </text>
        </g>
      ))}
      <polygon points={`${bandU} ${bandL}`} fill="#9ca3af" fillOpacity={0.15} />
      <path d={suave(expPts)} fill="none" stroke="#9ca3af" strokeWidth={1.2} strokeDasharray="4 3" />
      <path d={suave(realPts)} fill="none" stroke={col("brand", dark)} strokeWidth={2.4} />
      {fueraDeBanda && (
        <>
          <circle cx={x(n - 1)} cy={y(vals[n - 1])} r={5} fill={col("crit", dark)} />
          <circle cx={x(n - 1)} cy={y(vals[n - 1])} r={9} fill={col("crit", dark)} fillOpacity={0.2} />
        </>
      )}
    </svg>
  );
}
