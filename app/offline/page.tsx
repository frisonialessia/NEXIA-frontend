// ──────────────────────────────────────────────────────────────────────────
// PÁGINA "SIN CONEXIÓN" — respaldo del service worker
// ──────────────────────────────────────────────────────────────────────────

export default function Offline() {
  return (
    <main className="px-6 py-8 sm:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-2xl border border-neutral-200 bg-white px-8 py-16 text-center dark:border-neutral-800 dark:bg-neutral-900">
          <span className="font-mono text-sm uppercase tracking-[0.18em] text-neutral-400">Sin conexión</span>
          <h1 className="mt-3 font-display text-3xl tracking-tight">No hay internet ahora mismo</h1>
          <p className="mx-auto mt-2 max-w-md text-sm text-neutral-500">
            NEXIA seguirá funcionando en cuanto recuperes la señal. Esta pantalla aparece cuando el dispositivo está sin
            conexión.
          </p>
        </div>
      </div>
    </main>
  );
}
