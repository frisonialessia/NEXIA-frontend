"use client";

// ──────────────────────────────────────────────────────────────────────────
// VISTA · PRODUCCIÓN Y EFICIENCIA (OEE) — sistema de diseño NEXIA
// Reconstruida con primitivos (Card, Label, Stat, ProgressBar) para consistencia.
// Color de métricas POR VALOR (verde/ámbar/rojo). Series de datos (dona/energía)
// son el ÚNICO lugar donde aparece la paleta de datos (cian/lima/naranja/violeta).
// ──────────────────────────────────────────────────────────────────────────

import { colorPorValor } from "@/lib/constants";
import { DOWNTIME, ENERGIA, useOee } from "@/lib/data/oee";
import { useT } from "@/lib/state/I18nProvider";
import { useSession } from "@/lib/state/SessionProvider";
import { AccessDenied } from "./AccessDenied";
import { Card } from "./ui/Card";
import { GaugeCircular } from "./ui/GaugeCircular";
import { ProgressBar } from "./ui/Primitives";
import { Label, PageTitle, Stat } from "./ui/Typo";

export function Production() {
  const { puede } = useSession();
  const oee = useOee();
  const t = useT();

  if (!puede("produccion")) {
    return <AccessDenied mensaje={t("access.production")} />;
  }

  const oeeGlobal = oee.dispo * oee.rend * oee.cal;
  const nivel = oeeGlobal >= 0.85 ? t("prod.oeeWorldClass") : oeeGlobal >= 0.6 ? t("prod.oeeAcceptable") : t("prod.oeeNeedsImprovement");

  const metricas = [
    { label: t("prod.availability"), val: oee.dispo },
    { label: t("prod.performance"), val: oee.rend },
    { label: t("prod.quality"), val: oee.cal },
  ];

  const downtime = DOWNTIME;
  const totalDt = downtime.reduce((s, d) => s + d.m, 0);
  const energia = ENERGIA;

  return (
    <main className="fade-in px-6 py-8 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6">
          <Label>{t("prod.shift")}</Label>
          <PageTitle className="mt-2">{t("prod.title")}</PageTitle>
        </header>

        {/* OEE global + las 3 métricas */}
        <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-4">
          <Card className="px-6 py-6 text-center">
            <Label>{t("prod.oeeGlobal")}</Label>
            <div className="mt-2 flex justify-center">
              <GaugeCircular pct={oeeGlobal * 100} label="OEE %" />
            </div>
            <p className="mt-1 text-xs text-neutral-500">{nivel}</p>
          </Card>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:col-span-3">
            {metricas.map((m) => {
              const pct = m.val * 100;
              const ck = colorPorValor(pct);
              return (
                <Card key={m.label} className="px-6 py-5">
                  <Label>{m.label}</Label>
                  <Stat className="mt-2" value={`${pct.toFixed(1)}%`} colorKey={ck} />
                  <div className="mt-3">
                    <ProgressBar value={m.val} colorKey={ck} />
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Contadores */}
        <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-4">
          <Contador label={t("prod.goodParts")} value={oee.buenas.toLocaleString()} colorKey="ok" />
          <Contador label={t("prod.rejects")} value={String(oee.malas)} colorKey="crit" />
          <Contador label={t("prod.shiftTarget")} value="4,200" muted />
          <Contador label={t("prod.rate")} value={oee.ritmo.toFixed(1)} sub={t("prod.rateTarget")} />
        </div>

        {/* Dona de paros + energía */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card className="px-7 py-6">
            <Label>{t("prod.downtime")}</Label>
            <div className="mt-4 flex items-center gap-6">
              <DonutParos data={downtime} total={totalDt} />
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
          </Card>

          <Card className="px-7 py-6">
            <Label>{t("prod.energy")}</Label>
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
          </Card>
        </div>
      </div>
    </main>
  );
}

function Contador({ label, value, colorKey, sub, muted }: { label: string; value: string; colorKey?: "ok" | "crit"; sub?: string; muted?: boolean }) {
  return (
    <Card className="px-6 py-5">
      <Label>{label}</Label>
      <Stat className={`mt-1 ${muted ? "text-neutral-400" : ""}`} value={value} colorKey={colorKey} />
      {sub && <span className="text-[11px] text-neutral-400">{sub}</span>}
    </Card>
  );
}

function DonutParos({ data, total }: { data: { c: string; m: number; color: string }[]; total: number }) {
  const t = useT();
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
      <text x={60} y={56} textAnchor="middle" fontSize={20} fontWeight={600} fill="currentColor" className="font-sans tabular-nums">
        {total}
      </text>
      <text x={60} y={72} textAnchor="middle" fontSize={9} fill="#9ca3af">
        {t("prod.min")}
      </text>
    </svg>
  );
}
