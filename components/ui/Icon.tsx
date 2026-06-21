// ──────────────────────────────────────────────────────────────────────────
// ICONOS — set de línea fina (estilo Tabler) portado 1:1 desde la demo.
// CERO emojis: todos los símbolos de la interfaz salen de aquí.
// ──────────────────────────────────────────────────────────────────────────

import type { SVGProps } from "react";

export type IconName =
  | "gauge"
  | "chart"
  | "clipboard"
  | "history"
  | "settings"
  | "shield"
  | "plug"
  | "bell"
  | "user"
  | "moon"
  | "sun"
  | "check"
  | "play"
  | "download"
  | "plus"
  | "alert"
  | "spark"
  | "send"
  | "menu"
  | "x"
  | "grip"
  | "pin"
  | "tool"
  | "report";

/** Contenido vectorial de cada icono (paths/círculos dentro del viewBox 24×24). */
const PATHS: Record<IconName, React.ReactNode> = {
  gauge: <path d="M12 14l3-3M3.6 9a9 9 0 1 0 16.8 0M12 21a9 9 0 0 1-9-9M21 12a9 9 0 0 0-9-9" />,
  chart: <path d="M4 19V5M4 19h16M8 16v-5M12 16V8M16 16v-3" />,
  clipboard: (
    <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" />
  ),
  history: <path d="M12 8v4l3 2M3.05 11a9 9 0 1 1 .5 4M3 4v4h4" />,
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-2.82 1.17V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15H4.5a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 6 9.4a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 11 4.6V4.5a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 2.82 1.17l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9v.09" />
    </>
  ),
  shield: <path d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7z" />,
  plug: <path d="M9 2v6M15 2v6M6 8h12v3a6 6 0 0 1-12 0zM12 17v5" />,
  bell: <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0" />,
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21v-1a6 6 0 0 1 12 0v1" />
    </>
  ),
  moon: <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />,
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </>
  ),
  check: <path d="M20 6L9 17l-5-5" />,
  play: <path d="M6 4l14 8-14 8z" />,
  download: <path d="M12 3v12M7 10l5 5 5-5M5 21h14" />,
  plus: <path d="M12 5v14M5 12h14" />,
  alert: <path d="M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />,
  spark: <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9zM19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z" />,
  send: <path d="M22 2L11 13M22 2l-7 20-4-9-9-4z" />,
  menu: <path d="M4 6h16M4 12h16M4 18h16" />,
  x: <path d="M18 6L6 18M6 6l12 12" />,
  tool: <path d="M7 10h3V7l-3.5-3.5a6 6 0 0 1 8 8l6 6a2 2 0 0 1-3 3l-6-6a6 6 0 0 1-8-8z" />,
  report: <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2M9 14v3M13 11v6" />,
  grip: <path d="M9 6h.01M9 12h.01M9 18h.01M15 6h.01M15 12h.01M15 18h.01" />,
  pin: <path d="M15 4.5l-3.25 3.25a4 4 0 0 1-1.564 .976l-2.187 .73a1 1 0 0 0-.41 1.66l5.077 5.077a1 1 0 0 0 1.66-.41l.73-2.188a4 4 0 0 1 .976-1.563l3.25-3.25M9 15l-4.5 4.5M14.5 4l5.5 5.5" />,
};

/** El icono "check" usa un trazo algo más grueso, como en la demo. */
const STROKE_2: IconName[] = ["check"];

interface IconProps extends SVGProps<SVGSVGElement> {
  name: IconName;
}

export function Icon({ name, className, ...rest }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={STROKE_2.includes(name) ? 2 : 1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...rest}
    >
      {PATHS[name]}
    </svg>
  );
}
