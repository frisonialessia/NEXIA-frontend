// ──────────────────────────────────────────────────────────────────────────
// PÁGINA 404 · en español y con la estética de NEXIA
// Se renderiza dentro del cascarón (banner + nav), así que mantiene la marca.
// ──────────────────────────────────────────────────────────────────────────

import Link from "next/link";

export default function NotFound() {
  return (
    <main className="px-6 py-8 sm:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-2xl border border-neutral-200 bg-white px-8 py-16 text-center dark:border-neutral-800 dark:bg-neutral-900">
          <span className="font-mono text-sm uppercase tracking-[0.18em] text-neutral-400">Error 404</span>
          <h1 className="mt-3 font-serif text-3xl tracking-tight">Esta página no existe</h1>
          <p className="mx-auto mt-2 max-w-md text-sm text-neutral-500">
            Puede que el enlace esté desactualizado o que la vista aún no esté disponible.
          </p>
          <Link
            href="/"
            className="mt-6 inline-block rounded-xl px-5 py-2.5 text-sm font-medium text-white"
            style={{ background: "#3b82f6" }}
          >
            Volver al centro de mando
          </Link>
        </div>
      </div>
    </main>
  );
}
