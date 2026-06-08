// ──────────────────────────────────────────────────────────────────────────
// BANNER "MODO DEMOSTRACIÓN"
// Honestidad: siempre visible mientras los datos sean simulados.
// ──────────────────────────────────────────────────────────────────────────

export function DemoBanner() {
  return (
    <div className="stripe px-4 py-1.5 text-center text-[11px] font-medium uppercase tracking-wider text-amber-900">
      Modo demostración · datos simulados · listo para conectar a sensores reales
    </div>
  );
}
