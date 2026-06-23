"use client";

// ──────────────────────────────────────────────────────────────────────────
// TOUR DE BIENVENIDA
// Recorrido informativo que se muestra la PRIMERA vez (persistido en
// localStorage) y resalta las 5 piezas de confianza de NEXIA. Reabrible desde
// el menú de cuenta vía el evento window "nexia:abrir-tour". Sin dependencias.
// ──────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import { col, soft } from "@/lib/constants";
import { useModalA11y } from "@/lib/hooks/useModalA11y";
import { useT } from "@/lib/state/I18nProvider";
import { Icon, type IconName } from "../ui/Icon";

const K_VISTO = "nexia-tour-visto";
export const EVENTO_ABRIR_TOUR = "nexia:abrir-tour";

interface Paso {
  icon: IconName;
  colorKey: "brand" | "ok" | "warn" | "crit" | "violeta";
  titleKey: string;
  bodyKey: string;
}

const PASOS: Paso[] = [
  { icon: "spark", colorKey: "brand", titleKey: "tour.s0Title", bodyKey: "tour.s0Body" },
  { icon: "chart", colorKey: "brand", titleKey: "tour.s1Title", bodyKey: "tour.s1Body" },
  { icon: "plug", colorKey: "ok", titleKey: "tour.s2Title", bodyKey: "tour.s2Body" },
  { icon: "alert", colorKey: "warn", titleKey: "tour.s3Title", bodyKey: "tour.s3Body" },
  { icon: "gauge", colorKey: "violeta", titleKey: "tour.s4Title", bodyKey: "tour.s4Body" },
  { icon: "shield", colorKey: "ok", titleKey: "tour.s5Title", bodyKey: "tour.s5Body" },
];

export function WelcomeTour() {
  const t = useT();
  const [visible, setVisible] = useState(false);
  const [i, setI] = useState(0);

  // Primera visita: mostrar. Y escuchar la reapertura desde el menú de cuenta.
  useEffect(() => {
    if (!localStorage.getItem(K_VISTO)) setVisible(true);
    function abrir() {
      setI(0);
      setVisible(true);
    }
    window.addEventListener(EVENTO_ABRIR_TOUR, abrir);
    return () => window.removeEventListener(EVENTO_ABRIR_TOUR, abrir);
  }, []);

  function cerrar() {
    localStorage.setItem(K_VISTO, "1");
    setVisible(false);
  }

  const dialogRef = useModalA11y<HTMLDivElement>(cerrar);

  if (!visible) return null;

  const paso = PASOS[i];
  const ultimo = i === PASOS.length - 1;
  const color = col(paso.colorKey);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-neutral-900/40 px-4 backdrop-blur-sm" onClick={cerrar}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tour-title"
        tabIndex={-1}
        className="fade-in w-full max-w-md overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl outline-none dark:border-neutral-700 dark:bg-neutral-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-8 pt-8 pb-6">
          <div className="flex items-center justify-between">
            <span
              className="flex h-12 w-12 items-center justify-center rounded-2xl"
              style={{ background: soft(paso.colorKey, 14), color }}
            >
              <Icon name={paso.icon} className="h-6 w-6" />
            </span>
            <button
              onClick={cerrar}
              className="text-xs uppercase tracking-wider text-neutral-400 transition-colors hover:text-neutral-700 dark:hover:text-neutral-200"
            >
              {t("tour.skip")}
            </button>
          </div>

          <h2 id="tour-title" className="mt-5 font-display text-2xl tracking-tight">{t(paso.titleKey)}</h2>
          <p className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">{t(paso.bodyKey)}</p>
        </div>

        {/* Puntos de progreso */}
        <div className="flex items-center justify-center gap-1.5 pb-5">
          {PASOS.map((_, idx) => (
            <span
              key={idx}
              className="h-1.5 rounded-full transition-all"
              style={{ width: idx === i ? 18 : 6, background: idx === i ? color : "var(--c-arc)" }}
            />
          ))}
        </div>

        <div className="flex items-center justify-between border-t border-neutral-100 px-8 py-4 dark:border-neutral-800">
          <button
            onClick={() => setI((v) => Math.max(0, v - 1))}
            disabled={i === 0}
            className="text-sm text-neutral-500 transition-colors hover:text-neutral-800 disabled:invisible dark:hover:text-neutral-200"
          >
            {t("tour.back")}
          </button>
          <span className="font-mono text-xs text-neutral-400">{t("tour.stepOf", { n: i + 1, total: PASOS.length })}</span>
          <button
            onClick={() => (ultimo ? cerrar() : setI((v) => v + 1))}
            className="rounded-xl px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
            style={{ background: col("brand") }}
          >
            {ultimo ? t("tour.start") : t("tour.next")}
          </button>
        </div>
      </div>
    </div>
  );
}
