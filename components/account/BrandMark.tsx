"use client";

// ──────────────────────────────────────────────────────────────────────────
// MARCA NEXIA (logo de puntos) como elemento de UI reutilizable.
// Usa el mismo SVG que el favicon/PWA; lo serializa a data-URI en el cliente.
// `bg` permite fondo claro (por defecto el oscuro de la marca).
// ──────────────────────────────────────────────────────────────────────────

import { brandIconSvg } from "@/lib/brand/appIcon";

export function BrandMark({ size = 40, bg, className = "" }: { size?: number; bg?: string; className?: string }) {
  const uri = "data:image/svg+xml;utf8," + encodeURIComponent(brandIconSvg({ size: 64, bg }));
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={uri}
      width={size}
      height={size}
      alt="NEXIA"
      className={className}
      style={{ borderRadius: size * 0.22 }}
    />
  );
}
