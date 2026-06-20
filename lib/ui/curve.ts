// ──────────────────────────────────────────────────────────────────────────
// CURVA SUAVE (Catmull-Rom → Bézier)
// Convierte una lista de puntos en una curva suave para SVG. Fuente única:
// la usaban por separado el gráfico de vibración y el mini-sparkline.
// ──────────────────────────────────────────────────────────────────────────

export function suave(pts: [number, number][]): string {
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
