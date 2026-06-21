"use client";

// ──────────────────────────────────────────────────────────────────────────
// MARCA NEXIA (logo de puntos) como elemento de UI reutilizable.
// Usa el mismo SVG que el favicon/PWA; lo serializa a data-URI en el cliente.
// ──────────────────────────────────────────────────────────────────────────

import { brandIconSvg } from "@/lib/brand/appIcon";

export function BrandMark({ size = 40, className = "" }: { size?: number; className?: string }) {
  const uri = "data:image/svg+xml;utf8," + encodeURIComponent(brandIconSvg({ size: 64 }));
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
