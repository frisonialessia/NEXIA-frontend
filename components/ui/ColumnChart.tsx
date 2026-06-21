"use client";

// ──────────────────────────────────────────────────────────────────────────
// GRÁFICO DE COLUMNAS — barras verticales con etiquetas (SVG, sin deps)
// ──────────────────────────────────────────────────────────────────────────

const W = 320;
const H = 120;
const PAD_B = 18;

export function ColumnChart({ data, labels, color }: { data: number[]; labels: string[]; color: string }) {
  const max = Math.max(1, ...data);
  const n = data.length;
  const slot = W / n;
  const bw = slot * 0.5;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }} role="img" aria-label="Gráfico de columnas">
      {data.map((v, i) => {
        const h = (v / max) * (H - PAD_B - 14);
        const x = i * slot + (slot - bw) / 2;
        const y = H - PAD_B - h;
        return (
          <g key={i}>
            <rect x={x} y={y} width={bw} height={h} rx={3} fill={color} />
            <text x={x + bw / 2} y={y - 4} textAnchor="middle" fontSize={10} fontWeight={600} fill="currentColor" className="font-mono">
              {v}
            </text>
            <text x={x + bw / 2} y={H - 5} textAnchor="middle" fontSize={9} fill="#9ca3af">
              {labels[i]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
