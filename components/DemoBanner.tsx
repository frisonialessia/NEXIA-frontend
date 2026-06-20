// ──────────────────────────────────────────────────────────────────────────
// BANNER "MODO DEMOSTRACIÓN"
// Aviso fino y discreto (sin rayas): mantiene la honestidad de que los datos
// son simulados, con estética sobria y profesional.
// ──────────────────────────────────────────────────────────────────────────

export function DemoBanner() {
  return (
    <div className="border-b border-neutral-200 bg-neutral-100 px-4 py-1.5 text-center dark:border-neutral-800 dark:bg-neutral-900">
      <span className="text-[11px] font-medium uppercase tracking-[0.15em] text-neutral-500 dark:text-neutral-400">
        Modo demostración · datos simulados · listo para conectar a sensores reales
      </span>
    </div>
  );
}
