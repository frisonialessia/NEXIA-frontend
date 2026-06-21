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
import { ESTADOS, AHORRO_POR_PARADA, ROL_NOMBRE, col, estadoColor, surf } from "@/lib/constants";
import { MTBF, MTTR, PROX_MANTENIMIENTO, lecturasGauges, sensoresDe } from "@/lib/data/asset";
import { serieReplay } from "@/lib/data/simulated";
import { diasAFallo } from "@/lib/engine/fsm";
import { dinero } from "@/lib/format";
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

export function AssetDetail({ id }: { id: string }) {
  const maquinas = useMaquinas();
  const { sistema, puede, rol } = useSession();
  const { dark } = useTheme();
  const { crear } = useMantenimiento();
  const { registrar, usuarios } = useAdmin();
  const router = useRouter();

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
        <div className="mx-auto max-w-5xl">
          <Link href="/" className="text-sm text-neutral-400 transition-colors hover:text-neutral-700">
            ← Volver a la flota
          </Link>
          <div className={`mt-8 ${SURFACE} px-8 py-16 text-center`}>
            <p className="text-sm text-neutral-500">No se encontró este activo.</p>
            <p className="mt-1 text-xs text-neutral-400">Puede que aún se esté cargando la flota.</p>
          </div>
        </div>
      </main>
    );
  }

  const ec = estadoColor(m.estado);
  const dias = diasAFallo(m);
  const last = m.hist[m.hist.length - 1];

  const sensores = sensoresDe(m.estado);

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
    toast("Orden creada · te llevo a Mantenimiento");
    router.push("/mantenimiento");
  }

  return (
    <main className="fade-in px-6 py-8 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <Link href="/" className="mb-5 inline-block text-sm text-neutral-400 transition-colors hover:text-neutral-700">
          ← Volver a la flota
        </Link>

        <header className="mb-5">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: ec }} />
            <span className="text-xs uppercase tracking-[0.18em] text-neutral-400">{ESTADOS[m.estado]}</span>
          </div>
          <h1 className="mt-2 font-serif text-3xl tracking-tight">{m.id}</h1>
          <p className="mt-1 font-mono text-sm text-neutral-400">
            {m.sensor} · {m.sector} · IA activa
          </p>
        </header>

        {puede("mantenimiento") && (
          <div className="mb-5 flex justify-end">
            <Button variant="secondary" className="px-4 py-2 text-sm" onClick={programar}>
              <Icon name="tool" className="h-4 w-4" />
              Programar mantenimiento
            </Button>
          </div>
        )}

        {/* Pronóstico */}
        <div className="mb-5 rounded-2xl border px-7 py-5" style={predEstilo}>
          {m.estado === "STABLE" ? (
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs uppercase tracking-[0.18em] text-neutral-500">Pronóstico</span>
                <p className="mt-1 font-serif text-2xl" style={{ color: ec }}>
                  Operación normal
                </p>
                <p className="mt-1 text-sm text-neutral-500">Sin fallos previstos.</p>
              </div>
              <Icon name="check" className="h-8 w-8" style={{ color: ec }} />
            </div>
          ) : dias !== Infinity && dias < 30 ? (
            <div>
              <span className="text-xs uppercase tracking-[0.18em] text-neutral-500">Pronóstico predictivo</span>
              <p className="mt-1 font-serif text-3xl" style={{ color: ec }}>
                Falla estimada en {Math.max(1, Math.ceil(dias))} días
              </p>
              <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">
                Si no se interviene. Detectarlo ahora evita una parada de{" "}
                <span className="font-semibold">{dinero(AHORRO_POR_PARADA)}</span>.
              </p>
            </div>
          ) : (
            <div>
              <span className="text-xs uppercase tracking-[0.18em] text-neutral-500">Pronóstico</span>
              <p className="mt-1 font-serif text-2xl" style={{ color: ec }}>
                {ESTADOS[m.estado]}
              </p>
              <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">Bajo vigilancia activa.</p>
            </div>
          )}
        </div>

        {/* Velocímetros */}
        <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <GaugeCard titulo="Temperatura">
            <Gauge valor={gauges.temp.v} min={gauges.temp.min} max={gauges.temp.max} unidad={gauges.temp.u} zonaPeligro={0.75} />
          </GaugeCard>
          <GaugeCard titulo="Presión">
            <Gauge valor={gauges.pres.v} min={gauges.pres.min} max={gauges.pres.max} unidad={gauges.pres.u} zonaPeligro={0.8} />
          </GaugeCard>
          <GaugeCard titulo="RPM">
            <Gauge valor={gauges.rpm.v} min={gauges.rpm.min} max={gauges.rpm.max} unidad={gauges.rpm.u} zonaPeligro={0.9} />
          </GaugeCard>
        </div>

        {/* Sensores y actuadores */}
        <div className={`mb-5 ${SURFACE} px-7 py-5`}>
          <h3 className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
            Estado de sensores y actuadores
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
              Vibración real vs. esperado
            </h3>
            <div className="text-right">
              <div className="font-mono text-2xl">{last ? last.v.toFixed(2) : "—"}</div>
              <div className="font-mono text-xs text-neutral-400">{last ? `esperado ${last.exp.toFixed(2)}` : ""}</div>
            </div>
          </div>

          <VibrationChart data={replay ?? m.hist} />

          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-neutral-400">
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-0 w-4" style={{ borderTop: `2px solid ${col("brand", dark)}` }} />
              Real
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-0 w-4" style={{ borderTop: "2px dashed #9ca3af" }} />
              Esperado
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2 w-4 rounded" style={{ background: "#9ca3af", opacity: 0.2 }} />
              Rango normal
            </span>
            <button
              onClick={reproducir}
              className="ml-auto flex items-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-1 text-xs text-neutral-600 transition-colors hover:border-neutral-300 dark:border-neutral-700"
            >
              <Icon name="play" className="h-3 w-3" />
              Ver cómo se detectó
            </button>
          </div>
        </div>

        {/* Indicadores de fiabilidad */}
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <InfoCard titulo="Horas de operación" valor={Math.round(m.horasOp).toLocaleString("es-ES") + " h"} pie={PROX_MANTENIMIENTO} />
          <InfoCard titulo="MTBF" valor={MTBF} pie="tiempo medio entre fallos" />
          <InfoCard titulo="MTTR" valor={MTTR} pie="tiempo medio de reparación" />
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
