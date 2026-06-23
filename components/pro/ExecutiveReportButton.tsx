"use client";

// ──────────────────────────────────────────────────────────────────────────
// REPORTE EJECUTIVO (one-pager imprimible / PDF)
// El documento que el operador comparte con su jefe para justificar el valor:
// ahorro del mes, máquinas que requieren atención y fiabilidad del modelo.
// Sale de datos EN VIVO (no histórico estático) y usa el impresor del navegador
// (Guardar como PDF), sin dependencias.
// ──────────────────────────────────────────────────────────────────────────

import { toast } from "sonner";
import { resumirRegistro } from "@/lib/domain/alertas";
import { ordenarFlota } from "@/lib/domain/flota";
import { rangoDiasRedondeado } from "@/lib/engine/fsm";
import { dinero } from "@/lib/format";
import { imprimirReporte } from "@/lib/reports/exporter";
import { useT } from "@/lib/state/I18nProvider";
import { useOrg } from "@/lib/state/OrgProvider";
import { useMaquinas, useRegistro, useSavings } from "@/lib/state/useFleet";
import { Button } from "../ui/Primitives";
import { Icon } from "../ui/Icon";

export function ExecutiveReportButton() {
  const t = useT();
  const maquinas = useMaquinas();
  const savings = useSavings();
  const registro = useRegistro();
  const { plantaActiva } = useOrg();

  function generar() {
    const r = resumirRegistro(registro);
    const enAtencion = ordenarFlota(maquinas).filter((m) => m.estado !== "STABLE");

    const pred = (m: (typeof enAtencion)[number]) => {
      const rg = rangoDiasRedondeado(m);
      if (m.estado === "STABLE") return "—";
      return rg.esRango ? t("exec.failsRange", { a: rg.a, b: rg.b }) : t("exec.failsOne", { n: rg.a });
    };

    const riesgo = enAtencion.length === 0 ? t("exec.riskNone") : t("exec.riskSome", { n: enAtencion.length });
    const precisionTxt = r.precision === null ? "—" : `${Math.round(r.precision * 100)}%`;

    const filasAtencion = enAtencion.length
      ? enAtencion
          .map(
            (m) =>
              `<tr><td>${m.id}</td><td>${t(`estados.${m.estado}`)}</td><td class="num">${Math.round(m.prob * 100)}%</td><td>${pred(m)}</td></tr>`
          )
          .join("")
      : `<tr><td colspan="4">${t("exec.allNormal")}</td></tr>`;

    const html = `
      <h1>${t("exec.title")}</h1>
      <div class="sub">${plantaActiva.nombre} · ${t("exec.subtitle")}</div>
      <p style="font-size:14px;color:#334155;margin:0 0 18px">
        ${t("exec.summaryLine", { n: savings.paradasEvitadas, money: dinero(savings.ahorroMes), risk: riesgo })}
      </p>
      <div class="kpis">
        <div class="kpi"><div class="l">${t("exec.savingsMonth")}</div><div class="v">${dinero(savings.ahorroMes)}</div></div>
        <div class="kpi"><div class="l">${t("exec.stopsAvoided")}</div><div class="v">${savings.paradasEvitadas}</div></div>
        <div class="kpi"><div class="l">${t("exec.precision")}</div><div class="v">${precisionTxt}</div></div>
        <div class="kpi"><div class="l">${t("exec.assets")}</div><div class="v">${maquinas.length}</div></div>
      </div>
      <h2>${t("exec.needAttention")}</h2>
      <table><thead><tr>
        <th>${t("exec.colMachine")}</th><th>${t("exec.colState")}</th>
        <th class="num">${t("exec.colProb")}</th><th>${t("exec.colForecast")}</th>
      </tr></thead><tbody>${filasAtencion}</tbody></table>
      <h2>${t("exec.reliability")}</h2>
      <p style="font-size:13px;color:#334155;margin:0">
        ${t("exec.reliabilityLine", { n: r.auditadas, hits: r.aciertos, false: r.falsas, nc: r.nc })}
      </p>`;

    imprimirReporte(t("exec.title"), html);
    toast(t("exec.toast"));
  }

  return (
    <Button variant="secondary" className="px-3 py-2 text-sm" onClick={generar}>
      <Icon name="report" className="h-4 w-4" />
      {t("exec.button")}
    </Button>
  );
}
