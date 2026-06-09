// ──────────────────────────────────────────────────────────────────────────
// APPLE TOUCH ICON (180×180 PNG) — para "Agregar a inicio" en iOS
// ──────────────────────────────────────────────────────────────────────────

import { ImageResponse } from "next/og";
import { sparkleDataUri } from "@/lib/brand/appIcon";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img width={180} height={180} src={sparkleDataUri({ size: 180 })} alt="NEXIA" />
      </div>
    ),
    { ...size }
  );
}
