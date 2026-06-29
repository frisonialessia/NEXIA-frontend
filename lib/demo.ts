// ──────────────────────────────────────────────────────────────────────────
// MODO DEMO — interruptor único de honestidad
// Mientras estemos en demo, las cifras de negocio (ahorro, precisión del
// modelo) salen de semillas/simulación y deben etiquetarse como "ejemplo".
// El día que haya clientes reales con datos reales, basta poner
// NEXT_PUBLIC_DEMO=false para apagar el banner y todas las etiquetas de ejemplo.
// ──────────────────────────────────────────────────────────────────────────

/** ¿La app está en modo demostración? Por defecto sí (se apaga con "false"). */
export function esDemo(): boolean {
  return process.env.NEXT_PUBLIC_DEMO !== "false";
}
