"use client";

// ──────────────────────────────────────────────────────────────────────────
// VISTA 3 · PRODUCCIÓN Y EFICIENCIA (OEE)
// OEE global (gauge) + Disponibilidad/Rendimiento/Calidad, contadores de
// piezas y ritmo, dona de tiempos de inactividad por causa y consumo
// energético. Vista protegida por rol. Portado de renderOEE() de la demo.
// ──────────────────────────────────────────────────────────────────────────

import { col } from "@/lib/constants";
import { DOWNTIME, ENERGIA, useOee } from "@/lib/data/oee";
import { useSession } from "@/lib/state/SessionProvider";
import { useTheme } from "@/lib/state/ThemeProvider";
import { AccessDenied } from "./AccessDenied";
import { GaugeCircular } from "./ui/GaugeCircular";

export function Production() {
  const { puede } = useSession();
  const { dark } = useTheme();
  const oee = useOee();

  if (!puede("produccion")) {
    return <AccessDenied mensaje="La vista de Producción requiere un rol con acceso (Administrador, Jefe de planta o Técnico)." />;
  }

  const oeeGlobal = oee.dispo * oee.rend * oee.cal;
  const nivel = oeeGlobal >= 0.85 ? "World-class" : oeeGlobal >= 0.6 ? "Aceptable" : "Requiere mejora";

  const metricas = [
    { label: "Disponibilidad", val: oee.dispo, color: col("brand", dark) },
    { label: "Rendimiento", val: oee.rend, color: col("warn", dark) },
    { label: "Calidad", val: oee.cal, color: col("ok", dark) },
  ];

  const downtime = DOWNTIME.map((d) => ({ ...d, color: col(d.colorKey, dark) }));
  const totalDt = downtime.reduce((s, d) => s + d.m, 0);
  const energia = ENERGIA.map((e) => ({ ...e, color: col(e.colorKey, dark) }));

  return (
    <main className="fade-in px-6 py-8 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6">
          <span className="text-xs uppercase tracking-[0.18em] text-neutral-400">Turno actual · Línea 1</span>
          <h1 className="mt-2 font-serif text-3xl tracking-tight">Producción y eficiencia</h1>
        </header>

        {/* OEE global + las 3 métricas */}
        <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-4">
          <div className="rounded-2xl border border-neutral-200 bg-white px-6 py-6 text-center dark:border-neutral-800 dark:bg-neutral-900">
            <span className="text-xs uppercase tracking-[0.18em] text-neutral-400">OEE Global</span>
            <div className="mt-2 flex justify-center">
              <GaugeCircular pct={oeeGlobal * 100} label="OEE %" />
            </div>
            <p className="mt-1 text-xs text-neutral-500">{nivel}</p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:col-span-3">
            {metricas.map((m) => (
              <div key={m.label} className="rounded-2xl border border-neutral-200 bg-white px-6 py-5 dark:border-neutral-800 dark:bg-neutral-900">
                <span className="text-xs uppercase tracking-wider text-neutral-400">{m.label}</span>
                <div className="mt-2 font-serif text-3xl" style={{ color: m.color }}>
                  {(m.val * 100).toFixed(1)}%
                </div>
                <div className="mt-3 h-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800">
                  <div className="h-1.5 rounded-full" style={{ width: `${m.val * 100}%`, background: m.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contadores */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
          <Contador label="Piezas buenas" valor={oee.buenas.toLocaleString("es-ES")} color={col("ok", dark)} />
          <Contador label="Rechazos" valor={String(oee.malas)} color={col("crit", dark)} />
          <Contador label="Objetivo turno" valor="4,200" color="#a3a3a3" />
          <Contador label="Ritmo (pzs/min)" valor={oee.ritmo.toFixed(1)} pie="meta 9.0" />
        </div>

        {/* Dona de paros + energía */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-neutral-200 bg-white px-7 py-6 dark:border-neutral-800 dark:bg-neutral-900">
            <h3 className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
              Tiempos de inactividad · por causa
            </h3>
            <div className="mt-4 flex items-center gap-6">
              <DonutParos data={downtime} total={totalDt} dark={dark} />
              <div className="flex-1 space-y-1.5">
                {downtime.map((d) => (
                  <div key={d.c} className="flex items-center gap-2 text-xs">
                    <span className="h-2.5 w-2.5 rounded-sm" style={{ background: d.color }} />
                    <span className="flex-1 text-neutral-600 dark:text-neutral-300">{d.c}</span>
                    <span className="font-mono text-neutral-400">
                      {d.m}m · {Math.round((d.m / totalDt) * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white px-7 py-6 dark:border-neutral-800 dark:bg-neutral-900">
            <h3 className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">Consumo energético · turno</h3>
            <div className="mt-4 space-y-4">
              {energia.map((e) => (
                <div key={e.n}>
                  <div className="flex justify-between text-xs">
                    <span className="text-neutral-600 dark:text-neutral-300">{e.n}</span>
                    <span className="font-mono text-neutral-400">
                      {e.v} {e.u}
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 rounded-full bg-neutral-100 dark:bg-neutral-800">
                    <div className="h-2 rounded-full" style={{ width: `${(e.v / e.max) * 100}%`, background: e.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function Contador({ label, valor, color, pie }: { label: string; valor: string; color?: string; pie?: string }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white px-6 py-5 dark:border-neutral-800 dark:bg-neutral-900">
      <span className="text-xs uppercase tracking-wider text-neutral-400">{label}</span>
      <div className="mt-1 font-serif text-3xl" style={color ? { color } : undefined}>
        {valor}
      </div>
      {pie && <span className="text-[11px] text-neutral-400">{pie}</span>}
    </div>
  );
}

function DonutParos({ data, total, dark }: { data: { c: string; m: number; color: string }[]; total: number; dark: boolean }) {
  const r = 46;
  const cc = 2 * Math.PI * r;
  let acc = 0;
  return (
    <svg viewBox="0 0 120 120" width={120} height={120} aria-hidden="true">
      {data.map((d) => {
        const frac = d.m / total;
        const seg = (
          <circle
            key={d.c}
            cx={60}
            cy={60}
            r={r}
            fill="none"
            stroke={d.color}
            strokeWidth={14}
            strokeDasharray={`${cc * frac} ${cc}`}
            strokeDashoffset={-cc * acc}
            transform="rotate(-90 60 60)"
          />
        );
        acc += frac;
        return seg;
      })}
      <text x={60} y={56} textAnchor="middle" fontSize={20} fontWeight={600} fill="currentColor" className="font-serif">
        {total}
      </text>
      <text x={60} y={72} textAnchor="middle" fontSize={9} fill="#9ca3af">
        min
      </text>
    </svg>
  );
}
