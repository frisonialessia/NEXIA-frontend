"use client";

// ──────────────────────────────────────────────────────────────────────────
// VISTA · REPORTES Y ANALÍTICA
// Histórico (tendencias, alertas por semana, ROI por máquina, causas) y
// exportación real a CSV y PDF. Vista gerencial (permiso "tendencia").
// ──────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { toast } from "sonner";
import { VERDES, col } from "@/lib/constants";
import { dinero } from "@/lib/format";
import {
  AHORRO_SEMANAL,
  ALERTAS_SEMANAL,
  ANALYTICS_KPIS,
  CAUSAS_FRECUENTES,
  ROI_POR_MAQUINA,
  SALUD_SEMANAL,
  SEMANAS,
} from "@/lib/data/analytics";
import { descargarCSV, imprimirReporte } from "@/lib/reports/exporter";
import { useSession } from "@/lib/state/SessionProvider";
import { AccessDenied } from "./AccessDenied";
import { Card } from "./ui/Card";
import { ColumnChart } from "./ui/ColumnChart";
import { Icon } from "./ui/Icon";
import { MiniLineChart } from "./ui/MiniLineChart";
import { Button } from "./ui/Primitives";
import { Label, PageTitle, Stat } from "./ui/Typo";

const RANGOS = ["Últimas 8 semanas", "Últimos 30 días", "Este trimestre"];

export function Analytics() {
  const { puede } = useSession();
  const [rango, setRango] = useState(RANGOS[0]);

  if (!puede("tendencia")) {
    return <AccessDenied mensaje="Reportes y analítica requiere un rol gerencial (Administrador o Jefe de planta)." />;
  }

  const maxRoi = Math.max(...ROI_POR_MAQUINA.map((r) => r.ahorro));

  function exportarCSV() {
    const filas: (string | number)[][] = [
      ["NEXIA · Reporte", rango],
      [],
      ["Semana", "Ahorro acumulado", "Salud %", "Alertas"],
      ...SEMANAS.map((s, i) => [s, AHORRO_SEMANAL[i], SALUD_SEMANAL[i], ALERTAS_SEMANAL[i]]),
      [],
      ["Máquina", "Ahorro ($)"],
      ...ROI_POR_MAQUINA.map((r) => [r.maquina, r.ahorro]),
      [],
      ["Causa raíz", "Frecuencia"],
      ...CAUSAS_FRECUENTES.map((c) => [c.causa, c.n]),
    ];
    descargarCSV(`nexia-reporte-${Date.now()}.csv`, filas);
    toast("Reporte CSV descargado");
  }

  function exportarPDF() {
    const html = `
      <h1>Reporte de mantenimiento predictivo</h1>
      <div class="sub">${rango} · Planta Norte · Línea 1</div>
      <div class="kpis">
        <div class="kpi"><div class="l">Ahorro acumulado</div><div class="v">${dinero(ANALYTICS_KPIS.ahorroAcumulado)}</div></div>
        <div class="kpi"><div class="l">Paradas evitadas</div><div class="v">${ANALYTICS_KPIS.paradasEvitadas}</div></div>
        <div class="kpi"><div class="l">MTBF</div><div class="v">${ANALYTICS_KPIS.mtbf}</div></div>
        <div class="kpi"><div class="l">Disponibilidad</div><div class="v">${ANALYTICS_KPIS.disponibilidad}%</div></div>
      </div>
      <h2>Evolución semanal</h2>
      <table><thead><tr><th>Semana</th><th class="num">Ahorro acumulado</th><th class="num">Salud %</th><th class="num">Alertas</th></tr></thead><tbody>
        ${SEMANAS.map((s, i) => `<tr><td>${s}</td><td class="num">${dinero(AHORRO_SEMANAL[i])}</td><td class="num">${SALUD_SEMANAL[i]}%</td><td class="num">${ALERTAS_SEMANAL[i]}</td></tr>`).join("")}
      </tbody></table>
      <h2>ROI por máquina</h2>
      <table><thead><tr><th>Máquina</th><th class="num">Ahorro</th></tr></thead><tbody>
        ${ROI_POR_MAQUINA.map((r) => `<tr><td>${r.maquina}</td><td class="num">${dinero(r.ahorro)}</td></tr>`).join("")}
      </tbody></table>
      <h2>Causas raíz más frecuentes</h2>
      <table><thead><tr><th>Causa</th><th class="num">Frecuencia</th></tr></thead><tbody>
        ${CAUSAS_FRECUENTES.map((c) => `<tr><td>${c.causa}</td><td class="num">${c.n}</td></tr>`).join("")}
      </tbody></table>`;
    imprimirReporte("NEXIA · Reporte", html);
  }

  return (
    <main className="fade-in px-6 py-8 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6">
          <Label>Inteligencia de negocio</Label>
          <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
            <PageTitle>Reportes y analítica</PageTitle>
            <div className="flex items-center gap-2">
              <select
                value={rango}
                onChange={(e) => setRango(e.target.value)}
                className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300"
              >
                {RANGOS.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
              <Button variant="secondary" className="px-3 py-2 text-sm" onClick={exportarCSV}>
                <Icon name="download" className="h-4 w-4" />
                CSV
              </Button>
              <Button className="px-3 py-2 text-sm" onClick={exportarPDF}>
                <Icon name="download" className="h-4 w-4" />
                PDF
              </Button>
            </div>
          </div>
        </header>

        {/* KPIs */}
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <KpiCard label="Ahorro acumulado" value={dinero(ANALYTICS_KPIS.ahorroAcumulado)} colorKey="ok" />
          <KpiCard label="Paradas evitadas" value={String(ANALYTICS_KPIS.paradasEvitadas)} />
          <KpiCard label="MTBF" value={ANALYTICS_KPIS.mtbf} />
          <KpiCard label="Disponibilidad" value={`${ANALYTICS_KPIS.disponibilidad}%`} colorKey="ok" />
        </div>

        {/* Tendencias */}
        <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="px-6 py-5">
            <Label>Ahorro acumulado</Label>
            <Stat className="mt-1" value={dinero(AHORRO_SEMANAL[AHORRO_SEMANAL.length - 1])} size="md" colorKey="ok" />
            <div className="mt-2 h-16 overflow-hidden">
              <MiniLineChart data={AHORRO_SEMANAL} color={col("ok")} />
            </div>
          </Card>
          <Card className="px-6 py-5">
            <Label>Salud de planta</Label>
            <Stat className="mt-1" value={`${SALUD_SEMANAL[SALUD_SEMANAL.length - 1]}%`} size="md" colorKey="ok" />
            <div className="mt-2 h-16 overflow-hidden">
              <MiniLineChart data={SALUD_SEMANAL} color={VERDES.oscuro} />
            </div>
          </Card>
          <Card className="px-6 py-5">
            <Label>Alertas por semana</Label>
            <Stat className="mt-1" value={String(ALERTAS_SEMANAL.reduce((s, v) => s + v, 0))} size="md" />
            <div className="mt-2">
              <ColumnChart data={ALERTAS_SEMANAL} labels={SEMANAS} color={col("crit")} />
            </div>
          </Card>
        </div>

        {/* ROI + causas */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card className="px-7 py-6">
            <Label>ROI por máquina · ahorro atribuible</Label>
            <div className="mt-4 space-y-3">
              {ROI_POR_MAQUINA.map((r) => (
                <div key={r.maquina}>
                  <div className="flex justify-between text-xs">
                    <span className="truncate text-neutral-600 dark:text-neutral-300">{r.maquina}</span>
                    <span className="font-mono text-neutral-500">{dinero(r.ahorro)}</span>
                  </div>
                  <div className="mt-1.5 h-2 rounded-full bg-neutral-100 dark:bg-neutral-800">
                    <div className="h-2 rounded-full" style={{ width: `${(r.ahorro / maxRoi) * 100}%`, background: col("ok") }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="px-7 py-6">
            <Label>Causas raíz más frecuentes</Label>
            <div className="mt-4 space-y-2.5">
              {CAUSAS_FRECUENTES.map((c) => (
                <div key={c.causa} className="flex items-center gap-3 text-sm">
                  <span className="flex-1 text-neutral-600 dark:text-neutral-300">{c.causa}</span>
                  <span className="font-mono text-xs text-neutral-400">{c.n}×</span>
                  <div className="h-2 w-28 rounded-full bg-neutral-100 dark:bg-neutral-800">
                    <div className="h-2 rounded-full" style={{ width: `${(c.n / CAUSAS_FRECUENTES[0].n) * 100}%`, background: VERDES.oscuro }} />
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

function KpiCard({ label, value, colorKey }: { label: string; value: string; colorKey?: "ok" | "crit" }) {
  return (
    <Card className="px-5 py-4">
      <Label>{label}</Label>
      <Stat className="mt-1" value={value} colorKey={colorKey} />
    </Card>
  );
}
