// ──────────────────────────────────────────────────────────────────────────
// CAPA DE DATOS · TENDENCIA (ROI semanal)
// Serie estable de 8 semanas, reutilizada por los KPIs y la tarjeta de
// tendencia. El día del backend, esto viene de la base de datos histórica.
// ──────────────────────────────────────────────────────────────────────────

export const AHORRO_SEMANAL = [6, 9, 11, 14, 16, 19, 22, 24].map((k) => k * 1000);
export const SALUD_SEMANAL = [71, 74, 73, 78, 80, 79, 82, 83];
