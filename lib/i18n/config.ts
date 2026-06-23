// ──────────────────────────────────────────────────────────────────────────
// I18N · configuración de idiomas
// Inglés es el idioma "fuente"; español disponible. Italiano llega después
// (basta con añadir su diccionario y activarlo en IDIOMAS_ACTIVOS).
// ──────────────────────────────────────────────────────────────────────────

export const IDIOMAS = ["en", "es", "it"] as const;
export type Idioma = (typeof IDIOMAS)[number];

export const IDIOMA_NOMBRE: Record<Idioma, string> = {
  en: "English",
  es: "Español",
  it: "Italiano",
};

/** Idiomas disponibles ahora mismo (italiano se activará más adelante). */
export const IDIOMAS_ACTIVOS: Idioma[] = ["en", "es"];

/** Idioma por defecto. La interfaz está traducida; inglés es el principal. */
export const IDIOMA_POR_DEFECTO: Idioma = "en";
