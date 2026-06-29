"use client";

// ──────────────────────────────────────────────────────────────────────────
// CALCULADORA DE AHORRO (pública, sin login) — pieza de venta
// El cliente mete SUS números → ve SU ahorro estimado. Money-first. Enlaza a la
// demo en vivo. Es una estimación honesta (se etiqueta como tal).
// ──────────────────────────────────────────────────────────────────────────

import Link from "next/link";
import { useState } from "react";
import { col } from "@/lib/constants";
import { PRESETS_ROI, ROI_DEFAULT, calcularROI, type EntradaROI } from "@/lib/data/roi";
import { dinero } from "@/lib/format";
import { useT } from "@/lib/state/I18nProvider";
import { useTheme } from "@/lib/state/ThemeProvider";
import { BrandMark } from "./account/BrandMark";
import { Icon } from "./ui/Icon";

export function Calculadora() {
  const t = useT();
  const { dark, toggle } = useTheme();
  const [e, setE] = useState<EntradaROI>(ROI_DEFAULT);
  const r = calcularROI(e);

  const set = (k: keyof EntradaROI) => (ev: React.ChangeEvent<HTMLInputElement>) =>
    setE((prev) => ({ ...prev, [k]: Number(ev.target.value) }));

  const input =
    "w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-900 dark:focus:border-neutral-500";

  return (
    <main className="min-h-screen px-5 py-10">
      <button
        onClick={toggle}
        aria-label="Tema"
        className="absolute right-5 top-5 rounded-lg border border-neutral-200 p-1.5 text-neutral-500 transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
      >
        <Icon name={dark ? "sun" : "moon"} className="h-4 w-4" />
      </button>

      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex flex-col items-center text-center">
          <BrandMark size={48} />
          <h1 className="mt-4 font-display text-3xl tracking-tight sm:text-4xl">{t("calc.title")}</h1>
          <p className="mt-2 max-w-xl text-sm text-neutral-500">{t("calc.subtitle")}</p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* Entradas */}
          <div className="rounded-2xl bg-white p-7 ring-1 ring-neutral-200/70 dark:bg-neutral-900 dark:ring-neutral-800">
            <div className="mb-5 flex flex-wrap gap-2">
              {PRESETS_ROI.map((p) => (
                <button
                  key={p.nombreKey}
                  onClick={() => setE(p.datos)}
                  className="rounded-full border border-neutral-200 px-3 py-1 text-xs text-neutral-600 transition-colors hover:border-neutral-400 dark:border-neutral-700 dark:text-neutral-300"
                >
                  {t(p.nombreKey)}
                </button>
              ))}
            </div>
            <Campo label={t("calc.costoHora")}>
              <input type="number" min={0} step={100} value={e.costoHora} onChange={set("costoHora")} className={input} />
            </Campo>
            <Campo label={t("calc.paradasMes")}>
              <input type="number" min={0} step={1} value={e.paradasMes} onChange={set("paradasMes")} className={input} />
            </Campo>
            <Campo label={t("calc.horasPorParada")}>
              <input type="number" min={0} step={1} value={e.horasPorParada} onChange={set("horasPorParada")} className={input} />
            </Campo>
            <div className="mt-4">
              <div className="mb-1.5 flex items-baseline justify-between">
                <span className="text-xs font-medium uppercase tracking-[0.14em] text-neutral-400">{t("calc.deteccion")}</span>
                <span className="font-mono text-sm" style={{ color: col("brand", dark) }}>{e.deteccionPct}%</span>
              </div>
              <input type="range" min={0} max={100} step={5} value={e.deteccionPct} onChange={set("deteccionPct")} className="w-full accent-current" style={{ color: col("brand", dark) }} />
            </div>
          </div>

          {/* Resultado */}
          <div className="flex flex-col justify-between rounded-2xl p-7 text-white" style={{ background: col("brand", dark) }}>
            <div>
              <span className="text-xs uppercase tracking-[0.18em] text-white/70">{t("calc.resultTitle")}</span>
              <div className="mt-2 font-display text-5xl font-semibold tracking-tight">{dinero(Math.round(r.ahorroAnio))}</div>
              <div className="mt-1 text-sm text-white/80">{t("calc.perYear")}</div>

              <div className="mt-6 grid grid-cols-2 gap-4 border-t border-white/20 pt-5 text-sm">
                <Metrica label={t("calc.perMonth")} valor={dinero(Math.round(r.ahorroMes))} />
                <Metrica label={t("calc.stopsAvoided")} valor={`${Math.round(r.paradasEvitadas)} / mes`} />
                <Metrica label={t("calc.hoursRecovered")} valor={`${Math.round(r.horasRecuperadas)} h / mes`} />
              </div>
            </div>

            <Link
              href="/"
              className="mt-7 flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-medium transition-opacity hover:opacity-90"
              style={{ color: col("brand", dark) }}
            >
              {t("calc.cta")}
              <Icon name="logout" className="h-4 w-4 rotate-180" />
            </Link>
          </div>
        </div>

        <p className="mt-5 text-center text-xs text-neutral-400">{t("calc.estimateNote")}</p>
      </div>
    </main>
  );
}

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="mb-4 block last:mb-0">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-[0.14em] text-neutral-400">{label}</span>
      {children}
    </label>
  );
}

function Metrica({ label, valor }: { label: string; valor: string }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-white/60">{label}</div>
      <div className="mt-0.5 font-mono text-lg">{valor}</div>
    </div>
  );
}
