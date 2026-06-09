// ──────────────────────────────────────────────────────────────────────────
// ÍCONO PNG dinámico para la PWA (192 / 512 / maskable)
// Genera el ícono "chispa" como PNG en el tamaño pedido vía next/og.
// Lo consume el manifiesto. Ej.: /app-icon?size=512&maskable=1
// ──────────────────────────────────────────────────────────────────────────

import { ImageResponse } from "next/og";
import { sparkleDataUri } from "@/lib/brand/appIcon";

export const runtime = "nodejs";

export function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const size = Math.min(1024, Math.max(48, Number(searchParams.get("size") || 512)));
  const maskable = searchParams.get("maskable") === "1";

  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img width={size} height={size} src={sparkleDataUri({ size, maskable })} alt="NEXIA" />
      </div>
    ),
    { width: size, height: size }
  );
}
