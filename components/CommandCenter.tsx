"use client";

// ──────────────────────────────────────────────────────────────────────────
// VISTA 1 · CENTRO DE MANDO — "NEXIA Pro"
// Tira de KPIs hero, flota en tarjetas enriquecidas, feed de eventos en vivo y
// mapa de salud de la flota. Lee todo a través de los hooks de la capa de datos.
// ──────────────────────────────────────────────────────────────────────────

import { RANK_ESTADO, col } from "@/lib/constants";
import { useHistorial, useMaquinas, useSavings } from "@/lib/state/useFleet";
import { EventsFeed } from "./pro/EventsFeed";
import { FleetHealthMap } from "./pro/FleetHealthMap";
import { KpiStrip } from "./pro/KpiStrip";
import { MachineCardPro } from "./pro/MachineCardPro";
import { SURFACE } from "./pro/surface";

export function CommandCenter() {
  const maquinas = useMaquinas();
  const savings = useSavings();
  const historial = useHistorial();

  const total = maquinas.length;
  const atencion = maquinas.filter((m) => m.estado !== "STABLE").length;
  const orden = [...maquinas].sort(
    (a, b) => RANK_ESTADO[a.estado] - RANK_ESTADO[b.estado] || b.prob - a.prob
  );

  return (
    <main className="fade-in px-6 py-8 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6">
          <span className="text-xs uppercase tracking-[0.18em] text-neutral-400">En vivo · actualizando cada 2s</span>
          <div className="mt-2 flex items-end justify-between">
            <h1 className="font-serif text-3xl tracking-tight">Centro de mando</h1>
            <p className="text-sm text-neutral-500">
              {total === 0 ? (
                "Conectando con el motor…"
              ) : atencion === 0 ? (
                <>
                  <span className="font-mono">{total}</span> activos · todo en orden
                </>
              ) : (
                <>
                  <span className="font-mono font-medium" style={{ color: col("crit") }}>
                    {atencion}
                  </span>{" "}
                  {atencion === 1 ? "requiere" : "requieren"} atención{" "}
                  <span className="text-neutral-300">· de {total}</span>
                </>
              )}
            </p>
          </div>
        </header>

        {total === 0 ? (
          <div className={`${SURFACE} px-8 py-20 text-center text-sm text-neutral-400`}>
            Recopilando las primeras lecturas de la flota…
          </div>
        ) : (
          <div className="space-y-5">
            <KpiStrip maquinas={maquinas} savings={savings} />

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <section className="lg:col-span-2">
                <h2 className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">Flota · por criticidad</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {orden.map((m) => (
                    <MachineCardPro key={m.id} m={m} />
                  ))}
                </div>
              </section>

              <section className="lg:col-span-1">
                <h2 className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">Actividad</h2>
                <EventsFeed historial={historial} />
              </section>
            </div>

            <FleetHealthMap maquinas={maquinas} />
          </div>
        )}
      </div>
    </main>
  );
}
