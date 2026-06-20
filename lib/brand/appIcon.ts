// ──────────────────────────────────────────────────────────────────────────
// ÍCONO DE MARCA NEXIA — "matriz de puntos" (N) · degradado cian → lima
// Fuente única del logo: favicon, apple-touch-icon e íconos de la PWA.
// La "N" se forma con una cuadrícula de puntos coloreados por fila (cian arriba
// → lima abajo) sobre fondo oscuro. Solo colores de la paleta NEXIA.
// ──────────────────────────────────────────────────────────────────────────

const CYAN = "#06b6d4";
const LIME = "#84cc16";
const DARK = "#0f172a";

function hx(h: string): [number, number, number] {
  const c = h.replace("#", "");
  return [parseInt(c.slice(0, 2), 16), parseInt(c.slice(2, 4), 16), parseInt(c.slice(4, 6), 16)];
}

/** Mezcla dos colores hex (t: 0 → a, 1 → b). */
function blend(a: string, b: string, t: number): string {
  const A = hx(a);
  const B = hx(b);
  return (
    "#" +
    [0, 1, 2]
      .map((i) => Math.round(A[i] + (B[i] - A[i]) * t).toString(16).padStart(2, "0"))
      .join("")
  );
}

/** Genera el SVG del ícono. `maskable` deja margen de zona segura. */
export function brandIconSvg({ size = 512, maskable = false }: { size?: number; maskable?: boolean } = {}): string {
  const S = size;
  const inset = (maskable ? 0.16 : 0.07) * S;
  const span = S - inset * 2;
  const map = (v: number) => inset + (v / 100) * span; // v en 0..100
  const r = (maskable ? 0.05 : 0.058) * S;
  const bgR = maskable ? 0 : S * 0.22;

  const xs = [30, 50, 70];
  const ys = [24, 37, 50, 63, 76];
  const dots: string[] = [];
  const add = (ci: number, ri: number) => {
    const color = blend(CYAN, LIME, ri / 4);
    dots.push(`<circle cx="${map(xs[ci]).toFixed(1)}" cy="${map(ys[ri]).toFixed(1)}" r="${r.toFixed(1)}" fill="${color}"/>`);
  };
  for (let ri = 0; ri < 5; ri++) {
    add(0, ri);
    add(2, ri);
  }
  add(1, 1);
  add(1, 2);
  add(1, 3);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}">
  <rect width="${S}" height="${S}" rx="${bgR}" fill="${DARK}"/>
  ${dots.join("\n  ")}
</svg>`;
}

/** El mismo SVG como data URI (para incrustarlo en ImageResponse). */
export function brandIconDataUri(opts?: { size?: number; maskable?: boolean }): string {
  return "data:image/svg+xml;base64," + Buffer.from(brandIconSvg(opts)).toString("base64");
}
