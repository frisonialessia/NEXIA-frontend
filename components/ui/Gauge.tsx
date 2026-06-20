"use client";

// ──────────────────────────────────────────────────────────────────────────
// GAUGE SEMICIRCULAR (velocímetro)
// Para temperatura, presión y RPM en el detalle del activo. Dibuja un arco de
// fondo, la zona de peligro en rojo, el arco de valor con color semántico y un
// punto-aguja. Portado 1:1 de la función gauge() de la demo.
// ──────────────────────────────────────────────────────────────────────────

import { ARC, col } from "@/lib/constants";
import { useTheme } from "@/lib/state/ThemeProvider";

interface GaugeProps {
  valor: number;
  min: number;
  max: number;
  unidad: string;
  /** Fracción 0..1 a partir de la cual empieza la zona de peligro. */
  zonaPeligro: number;
}

const CX = 70;
const CY = 70;
const R = 54;

export function Gauge({ valor, min, max, unidad, zonaPeligro }: GaugeProps) {
  const { dark } = useTheme();
  const pct = Math.max(0, Math.min(1, (valor - min) / (max - min)));
  const ang = Math.PI * (1 - pct);
  const x = CX + R * Math.cos(ang);
  const y = CY - R * Math.sin(ang);
  const peligroAng = Math.PI * (1 - zonaPeligro);

  const colorVal =
    pct >= zonaPeligro ? col("crit", dark) : pct >= zonaPeligro - 0.15 ? col("warn", dark) : col("ok", dark);
  const fondoArco = ARC;

  // Construye un arco SVG entre dos ángulos.
  const arco = (a1: number, a2: number, color: string, w: number, key: string) => {
    const x1 = CX + R * Math.cos(a1);
    const y1 = CY - R * Math.sin(a1);
    const x2 = CX + R * Math.cos(a2);
    const y2 = CY - R * Math.sin(a2);
    const large = a1 - a2 > Math.PI ? 1 : 0;
    return (
      <path
        key={key}
        d={`M ${x1} ${y1} A ${R} ${R} 0 ${large} 1 ${x2} ${y2}`}
        fill="none"
        stroke={color}
        strokeWidth={w}
        strokeLinecap="round"
      />
    );
  };

  return (
    <svg viewBox="0 0 140 90" width={140} height={90} role="img" aria-label={`${valor.toFixed(valor < 10 ? 1 : 0)} ${unidad}`}>
      {arco(Math.PI, 0, fondoArco, 8, "fondo")}
      {arco(peligroAng, 0, col("crit", dark), 8, "peligro")}
      {arco(Math.PI, ang, colorVal, 8, "valor")}
      <circle cx={x} cy={y} r={5} fill={colorVal} />
      <text x={70} y={68} textAnchor="middle" fontSize={20} fontWeight={600} fill="currentColor" className="font-mono">
        {valor.toFixed(valor < 10 ? 1 : 0)}
      </text>
      <text x={70} y={83} textAnchor="middle" fontSize={9} fill="#9ca3af">
        {unidad}
      </text>
    </svg>
  );
}
