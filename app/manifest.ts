// ──────────────────────────────────────────────────────────────────────────
// MANIFIESTO PWA — hace NEXIA instalable y a pantalla completa
// ──────────────────────────────────────────────────────────────────────────

import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "NEXIA · Inteligencia Operativa",
    short_name: "NEXIA",
    description: "Mantenimiento predictivo industrial: detecta fallos antes de que ocurran.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0f172a",
    theme_color: "#0f172a",
    icons: [
      { src: "/app-icon?size=192", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/app-icon?size=512", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/app-icon?size=512&maskable=1", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
