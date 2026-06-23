"use client";

// ──────────────────────────────────────────────────────────────────────────
// VISTA 2 · DETALLE DE ACTIVO
// Velocímetros (temperatura, presión, RPM con zona de peligro), estado de
// sensores/actuadores, gráfico de vibración real vs. esperado, predicción
// "falla en X días", MTBF/MTTR, horas de operación y replay de la detección.
// Portado de renderDetail() + renderChart() + reproducir() de la demo.
// ──────────────────────────────────────────────────────────────────────────

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { AHORRO_POR_PARADA, ROL_NOMBRE, col, colorSalud, surf } from "@/lib/constants";
import { MTBF, MTTR, PROX_MANTENIMIENTO, lecturasGauges, saludEnlace, sensoresDe } from "@/lib/data/asset";
import { serieReplay } from "@/lib/data/simulated";
import { estaCalibrando, progresoCalibracion } from "@/lib/domain/flota";
import { diasAFallo, rangoDiasRedondeado } from "@/lib/engine/fsm";
import { dinero } from "@/lib/format";
import { useT } from "@/lib/state/I18nProvider";
import { useAdmin } from "@/lib/state/AdminProvider";
import { useMantenimiento } from "@/lib/state/MaintenanceProvider";
import { useMaquinas } from "@/lib/state/useFleet";
import { useSession } from "@/lib/state/SessionProvider";
import { useTheme } from "@/lib/state/ThemeProvider";
import type { Lectura } from "@/lib/types";
import { Card, SURFACE } from "./ui/Card";
import { Gauge } from "./ui/Gauge";
import { Icon } from "./ui/Icon";
import { Button } from "./ui/Primitives";
import { Label, Stat } from "./ui/Typo";
import { VibrationChart } from "./ui/VibrationChart";

/** Métrica del enlace: valor grande y, opcionalmente, una barra de nivel. */
function LinkMetric({ label, value, pct, color }: { label: string; value: string; pct?: number; color?: string }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-neutral-400">{label}</div>
      <div className="mt-0.5 font-mono text-lg" style={pct !== undefined ? { color } : undefined}>{value}</div>
      {pct !== undefined && (
        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
          <span className="block h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
        </div>
      )}
    </div>
  );
}

export function AssetDetail({ id }: { id: string }) {
  const maquinas = useMaquinas();
  const { sistema, puede, rol } = useSession();
  const { dark } = useTheme();
  const { crear } = useMantenimiento();
  const { registrar, usuarios } = useAdmin();
  const router = useRouter();
  const t = useT();

  const m = maquinas.find((x) => x.id === id);

  // Replay: serie animada que reconstruye cómo se detectó el fallo.
  const [replay, setReplay] = useState<Lectura[] | null>(null);
  const replayTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (replayTimer.current) clearInterval(replayTimer.current);
    };
  }, []);

  // Lecturas de los velocímetros (de la capa de datos): se recalculan a cada
  // tick de la máquina, no en cada render, para que no parpadeen en el replay.
  const gauges = useMemo(
    () => lecturasGauges(m?.estado ?? "STABLE", sistema),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [m?.tick, m?.estado, sistema]
  );

  if (!m) {
    return (
      <main className="px-6 py-8 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <Link href="/" className="text-sm text-neutral-400 transition-colors hover:text-neutral-700">
            {t("detail.back")}
          </Link>
          <div className={`mt-8 ${SURFACE} px-8 py-16 text-center`}>
            <p className="text-sm text-neutral-500">{t("detail.notFound")}</p>
            <p className="mt-1 text-xs text-neutral-400">{t("detail.maybeLoading")}</p>
          </div>
        </div>
      </main>
    );
  }

  const calibrando = estaCalibrando(m);
  const calibPct = Math.round(progresoCalibracion(m) * 100);
  const ec = calibrando ? col("brand") : colorSalud(m.estado, m.prob);
  const dias = diasAFallo(m);
  const rango = rangoDiasRedondeado(m);
  const last = m.hist[m.hist.length - 1];

  const sensores = sensoresDe(m.estado);
  const enlace = saludEnlace(m);

  // Fondo y borde del recuadro de pronóstico según el estado.
  const predEstilo =
    m.estado === "STABLE" ? surf("ok") : m.estado === "CRITICAL_ALERT" ? surf("crit") : surf("ok");

  function reproducir() {
    if (!m) return;
    const serie = serieReplay(m);
    let idx = 2;
    if (replayTimer.current) clearInterval(replayTimer.current);
    setReplay(serie.slice(0, idx));
    replayTimer.current = setInterval(() => {
      idx += 1;
      if (idx > serie.length) {
        if (replayTimer.current) clearInterval(replayTimer.current);
        replayTimer.current = null;
        setReplay(null);
        return;
      }
      setReplay(serie.slice(0, idx));
    }, 110);
  }

  function programar() {
    if (!m) return;
    const tipo = m.estado === "STABLE" ? "preventivo" : "correctivo";
    const prioridad = m.estado === "CRITICAL_ALERT" ? "alta" : m.estado === "STABLE" ? "baja" : "media";
    crear({ maquinaId: m.id, maquina: m.id, tipo, prioridad, programadaPara: "", responsable: usuarios[0]?.n ?? "", notas: "" });
    registrar(ROL_NOMBRE[rol], "Creó orden de mantenimiento", `${m.id} · ${tipo}`);
    toast(t("detail.orderToast"));
    router.push("/mantenimiento");
  }

  return (
    <main className="fade-in px-6 py-8 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <Link href="/" className="mb-5 inline-block text-sm text-neutral-400 transition-colors hover:text-neutral-700">
          {t("detail.back")}
        </Link>

        <header className="mb-5">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: ec }} />
            <span className="text-xs uppercase tracking-[0.18em] text-neutral-400">{calibrando ? t("card.calibrating") : t(`estados.${m.estado}`)}</span>
          </div>
          <h1 className="mt-2 font-display text-3xl tracking-tight">{m.id}</h1>
          <p className="mt-1 font-mono text-sm text-neutral-400">
            {m.sensor} · {m.sector} · {t("card.aiActive")}
          </p>
        </header>

        {calibrando && (
          <div className="mb-5 rounded-2xl border px-7 py-5" style={surf("brand")}>
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-[0.18em] text-neutral-500">{t("card.calibrating")}</span>
              <span className="font-mono text-sm" style={{ color: ec }}>{calibPct}%</span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
              <span className="block h-full rounded-full transition-all duration-500" style={{ width: `${calibPct}%`, background: ec }} />
            </div>
            <p className="mt-2 text-sm text-neutral-500">{t("card.calibratingHint")}</p>
          </div>
        )}

        {puede("mantenimiento") && (
          <div className="mb-5 flex justify-end">
            <Button variant="secondary" className="px-4 py-2 text-sm" onClick={programar}>
              <Icon name="tool" className="h-4 w-4" />
              {t("detail.schedule")}
            </Button>
          </div>
        )}

        {/* Pronóstico */}
        <div className="mb-5 rounded-2xl border px-7 py-5" style={predEstilo}>
          {m.estado === "STABLE" ? (
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs uppercase tracking-[0.18em] text-neutral-500">{t("detail.forecast")}</span>
                <p className="mt-1 font-display text-2xl" style={{ color: ec }}>
                  {t("detail.normalOp")}
                </p>
                <p className="mt-1 text-sm text-neutral-500">{t("detail.noFailures")}</p>
              </div>
              <Icon name="check" className="h-8 w-8" style={{ color: ec }} />
            </div>
          ) : dias !== Infinity && dias < 30 ? (
            <div>
              <span className="text-xs uppercase tracking-[0.18em] text-neutral-500">{t("detail.predictiveForecast")}</span>
              <p className="mt-1 font-display text-3xl" style={{ color: ec }}>
                {rango.esRango
                  ? t("detail.failInRange", { a: rango.a, b: rango.b })
                  : t("detail.failIn", { n: rango.a })}
              </p>
              <p className="mt-1 text-xs text-neutral-400">{t("detail.estimateHint")}</p>
              <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">
                {t("detail.avoidPrefix")}
                <span className="font-semibold">{dinero(AHORRO_POR_PARADA)}</span>
                {t("detail.avoidSuffix")}
              </p>
            </div>
          ) : (
            <div>
              <span className="text-xs uppercase tracking-[0.18em] text-neutral-500">{t("detail.forecast")}</span>
              <p className="mt-1 font-display text-2xl" style={{ color: ec }}>
                {t(`estados.${m.estado}`)}
              </p>
              <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">{t("detail.underMonitoring")}</p>
            </div>
          )}
        </div>

        {/* Velocímetros */}
        <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <GaugeCard titulo={t("detail.temp")}>
            <Gauge valor={gauges.temp.v} min={gauges.temp.min} max={gauges.temp.max} unidad={gauges.temp.u} zonaPeligro={0.75} />
          </GaugeCard>
          <GaugeCard titulo={t("detail.pres")}>
            <Gauge valor={gauges.pres.v} min={gauges.pres.min} max={gauges.pres.max} unidad={gauges.pres.u} zonaPeligro={0.8} />
          </GaugeCard>
          <GaugeCard titulo={t("detail.rpm")}>
            <Gauge valor={gauges.rpm.v} min={gauges.rpm.min} max={gauges.rpm.max} unidad={gauges.rpm.u} zonaPeligro={0.9} />
          </GaugeCard>
        </div>

        {/* Salud de la conexión (pipeline de datos) */}
        <div className={`mb-5 ${SURFACE} px-7 py-5`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
              {t("detail.linkTitle")}
            </h3>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                {enlace.online && (
                  <span className="ping-soft absolute inline-flex h-full w-full rounded-full" style={{ background: col("ok", dark), opacity: 0.6 }} />
                )}
                <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: enlace.online ? col("ok", dark) : col("crit", dark) }} />
              </span>
              <span className="text-xs text-neutral-500 dark:text-neutral-300">
                {enlace.online ? t("detail.linkOnline") : t("detail.linkOffline")}
                {" · "}
                {enlace.ultimaLecturaSeg < 1 ? t("detail.lastReadingNow") : t("detail.lastReading", { n: enlace.ultimaLecturaSeg })}
              </span>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
            <LinkMetric label={t("detail.signal")} value={`${enlace.senalPct}%`} pct={enlace.senalPct} color={col("ok", dark)} />
            <LinkMetric label={t("detail.battery")} value={`${enlace.bateriaPct}%`} pct={enlace.bateriaPct} color={enlace.bateriaPct < 25 ? col("warn", dark) : col("ok", dark)} />
            <LinkMetric label={t("detail.sampling")} value={`${enlace.muestreoHz} Hz`} />
            <LinkMetric label={t("detail.latency")} value={`${enlace.latenciaMs} ms`} />
          </div>
        </div>

        {/* Sensores y actuadores */}
        <div className={`mb-5 ${SURFACE} px-7 py-5`}>
          <h3 className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
            {t("detail.sensorsTitle")}
          </h3>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {sensores.map((s) => (
              <div
                key={s.n}
                className="flex items-center gap-2 rounded-lg border border-neutral-100 px-3 py-2 dark:border-neutral-800"
              >
                <span className="h-2 w-2 rounded-full" style={{ background: s.ok ? col("ok", dark) : col("crit", dark) }} />
                <span className="text-xs text-neutral-600 dark:text-neutral-300">{s.n}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Gráfico de vibración */}
        <div className={`${SURFACE} px-7 py-6`}>
          <div className="mb-5 flex items-baseline justify-between">
            <h3 className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
              {t("detail.vibTitle")}
            </h3>
            <div className="text-right">
              <div className="font-mono text-2xl">{last ? last.v.toFixed(2) : "—"}</div>
              <div className="font-mono text-xs text-neutral-400">{last ? t("detail.expected", { n: last.exp.toFixed(2) }) : ""}</div>
            </div>
          </div>

          <VibrationChart data={replay ?? m.hist} />

          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-neutral-400">
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-0 w-4" style={{ borderTop: `2px solid ${col("brand", dark)}` }} />
              {t("detail.legendActual")}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-0 w-4" style={{ borderTop: "2px dashed #9ca3af" }} />
              {t("detail.legendExpected")}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2 w-4 rounded" style={{ background: "#9ca3af", opacity: 0.2 }} />
              {t("detail.legendRange")}
            </span>
            <button
              onClick={reproducir}
              className="ml-auto flex items-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-1 text-xs text-neutral-600 transition-colors hover:border-neutral-300 dark:border-neutral-700"
            >
              <Icon name="play" className="h-3 w-3" />
              {t("detail.seeDetected")}
            </button>
          </div>
        </div>

        {/* Indicadores de fiabilidad */}
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <InfoCard titulo={t("detail.operatingHours")} valor={Math.round(m.horasOp).toLocaleString() + " h"} pie={PROX_MANTENIMIENTO} />
          <InfoCard titulo="MTBF" valor={MTBF} pie={t("detail.mtbfDesc")} />
          <InfoCard titulo="MTTR" valor={MTTR} pie={t("detail.mttrDesc")} />
        </div>
      </div>
    </main>
  );
}

function GaugeCard({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <Card className="px-5 py-5 text-center">
      <Label>{titulo}</Label>
      <div className="mt-1 flex justify-center">{children}</div>
    </Card>
  );
}

function InfoCard({ titulo, valor, pie }: { titulo: string; valor: string; pie: string }) {
  return (
    <Card className="px-6 py-5">
      <Label>{titulo}</Label>
      <Stat className="mt-1" value={valor} size="md" />
      <span className="text-[11px] text-neutral-400">{pie}</span>
    </Card>
  );
}
