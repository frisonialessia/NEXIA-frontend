// ──────────────────────────────────────────────────────────────────────────
// ÍCONO DE MARCA NEXIA — "chispa IA" (opción 6)
// Degradado azul → violeta, acento cian, sobre fondo oscuro. Fuente única del
// ícono: lo usan el favicon, el apple-touch-icon y los íconos de la PWA.
// ──────────────────────────────────────────────────────────────────────────

const BLUE = "#3b82f6";
const VIOLET = "#8b5cf6";
const CYAN = "#22d3ee";
const DARK = "#0f172a";
const GLOW = "#3a2f73"; // violeta tenue para el resplandor

/** Path de una estrella de 4 puntas centrada en (x,y). */
function star(x: number, y: number, outer: number, inner: number): string {
  const p = [
    [x, y - outer],
    [x + inner, y - inner],
    [x + outer, y],
    [x + inner, y + inner],
    [x, y + outer],
    [x - inner, y + inner],
    [x - outer, y],
    [x - inner, y - inner],
  ];
  return "M" + p.map((q) => q.map((n) => n.toFixed(1)).join(" ")).join(" L ") + " Z";
}

/** Genera el SVG del ícono. `maskable` usa fondo a sangre (zona segura). */
export function sparkleSvg({ size = 512, maskable = false }: { size?: number; maskable?: boolean } = {}): string {
  const S = size;
  const cx = S / 2;
  const cy = S / 2;
  const mainOuter = (maskable ? 0.24 : 0.3) * S;
  const mainInner = mainOuter * 0.32;
  const glowOuter = mainOuter * 1.18;
  const accOuter = 0.1 * S;
  const accCx = cx + S * 0.16;
  const accCy = cy + S * 0.16;
  const bgRadius = maskable ? 0 : S * 0.22;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="${BLUE}"/><stop offset="1" stop-color="${VIOLET}"/>
  </linearGradient></defs>
  <rect width="${S}" height="${S}" rx="${bgRadius}" fill="${DARK}"/>
  <path d="${star(cx, cy, glowOuter, glowOuter * 0.32)}" fill="${GLOW}"/>
  <path d="${star(cx, cy, mainOuter, mainInner)}" fill="url(#g)"/>
  <path d="${star(accCx, accCy, accOuter, accOuter * 0.3)}" fill="${CYAN}"/>
</svg>`;
}

/** El mismo SVG como data URI (para incrustarlo en ImageResponse). */
export function sparkleDataUri(opts?: { size?: number; maskable?: boolean }): string {
  return "data:image/svg+xml;base64," + Buffer.from(sparkleSvg(opts)).toString("base64");
}
