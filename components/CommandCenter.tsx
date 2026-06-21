"use client";

// ──────────────────────────────────────────────────────────────────────────
// VISTA 1 · CENTRO DE MANDO — "NEXIA Pro"
// Tira de KPIs hero, flota en tarjetas enriquecidas, feed de eventos en vivo y
// mapa de salud de la flota. Lee todo a través de los hooks de la capa de datos.
// ──────────────────────────────────────────────────────────────────────────

import { col } from "@/lib/constants";
import { useT } from "@/lib/state/I18nProvider";
import { useOrg } from "@/lib/state/OrgProvider";
import { useEventos, useMaquinas, useSavings } from "@/lib/state/useFleet";
import { EventsFeed } from "./pro/EventsFeed";
import { FleetHealthMap } from "./pro/FleetHealthMap";
import { KpiStrip } from "./pro/KpiStrip";
import { SortableFleet } from "./pro/SortableFleet";
import { SURFACE } from "./pro/surface";

export function CommandCenter() {
  const maquinas = useMaquinas();
  const savings = useSavings();
  const eventos = useEventos();
  const { plantaActiva } = useOrg();
  const t = useT();

  const total = maquinas.length;
  const atencion = maquinas.filter((m) => m.estado !== "STABLE").length;

  return (
    <main className="fade-in px-6 py-8 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6">
          <span className="text-xs uppercase tracking-[0.18em] text-neutral-400">{t("cc.live", { plant: plantaActiva.nombre })}</span>
          <div className="mt-2 flex items-end justify-between">
            <h1 className="font-display text-3xl tracking-tight">{t("cc.title")}</h1>
            <p className="text-sm text-neutral-500">
              {total === 0 ? (
                t("cc.connecting")
              ) : atencion === 0 ? (
                <>
                  <span className="font-mono">{total}</span> {t("cc.assetsAllOrder")}
                </>
              ) : (
                <>
                  <span className="font-mono font-medium" style={{ color: col("crit") }}>
                    {atencion}
                  </span>{" "}
                  {atencion === 1 ? t("cc.needsAttentionOne") : t("cc.needsAttentionMany")}{" "}
                  <span className="text-neutral-300">{t("cc.ofTotal", { total })}</span>
                </>
              )}
            </p>
          </div>
        </header>

        {total === 0 ? (
          <div className={`${SURFACE} px-8 py-20 text-center text-sm text-neutral-400`}>
            {t("cc.collecting")}
          </div>
        ) : (
          <div className="space-y-5">
            <KpiStrip maquinas={maquinas} savings={savings} />

            <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-3">
              <section className="lg:col-span-2">
                <h2 className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                  {t("cc.fleetDrag")}
                </h2>
                <SortableFleet maquinas={maquinas} />
              </section>

              <section className="lg:sticky lg:top-24 lg:col-span-1">
                <h2 className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">{t("cc.activity")}</h2>
                <EventsFeed eventos={eventos} />
              </section>
            </div>

            <FleetHealthMap maquinas={maquinas} />
          </div>
        )}
      </div>
    </main>
  );
}
