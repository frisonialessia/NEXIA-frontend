"use client";

// ──────────────────────────────────────────────────────────────────────────
// VISTA · ASISTENTE IA
// Chat en lenguaje natural sobre el estado de las máquinas. Además de
// responder, el asistente propone ACCIONES que el humano confirma (ver detalle,
// ir a alertas, reconocer una alerta). La interfaz es agnóstica al origen de la
// respuesta: llama a responderIA() (la "seam" del LLM); hoy reglas, mañana Claude.
// ──────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ARC, col, mix, soft } from "@/lib/constants";
import { SUGERENCIAS, responderIA, type AccionIA } from "@/lib/assistant/respond";
import { useT } from "@/lib/state/I18nProvider";
import { etiquetarAlerta, useAlertas, useMaquinas, useSavings } from "@/lib/state/useFleet";
import { useTheme } from "@/lib/state/ThemeProvider";
import { SURFACE } from "./ui/Card";
import { Icon } from "./ui/Icon";

interface Mensaje {
  rol: "user" | "ia";
  txt: string;
  acciones?: AccionIA[];
}

export function Assistant() {
  const maquinas = useMaquinas();
  const alertas = useAlertas();
  const { ahorroMes, paradasEvitadas } = useSavings();
  const { dark } = useTheme();
  const router = useRouter();
  const t = useT();
  const brand = col("brand", dark);

  const [chat, setChat] = useState<Mensaje[]>([]);
  const [texto, setTexto] = useState("");
  const [confirmando, setConfirmando] = useState<string | null>(null);
  const [hechas, setHechas] = useState<Set<string>>(new Set());
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [chat]);

  function enviar(pregunta?: string) {
    const q = (pregunta ?? texto).trim();
    if (!q) return;
    setTexto("");
    setChat((prev) => [...prev, { rol: "user", txt: q }]);
    setTimeout(() => {
      const res = responderIA(q, { maquinas, alertas, paradasEvitadas, ahorroMes });
      setChat((prev) => [...prev, { rol: "ia", txt: res.texto, acciones: res.acciones }]);
    }, 500);
  }

  function ejecutar(a: AccionIA) {
    if (a.tipo === "ver") {
      router.push(`/activo/${encodeURIComponent(a.maquina)}`);
    } else if (a.tipo === "alertas") {
      router.push("/alertas");
    } else if (a.tipo === "reconocer") {
      etiquetarAlerta(a.alertaId, "real");
      setHechas((prev) => new Set(prev).add(a.id));
      setConfirmando(null);
      toast(t("asst.ackToast"));
      setChat((prev) => [...prev, { rol: "ia", txt: t("asst.ackMsg", { machine: a.maquina }), acciones: [] }]);
    }
  }

  return (
    <main className="fade-in px-6 py-8 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6">
          <div className="flex items-center gap-2">
            <Icon name="spark" className="h-4 w-4" style={{ color: brand }} />
            <span className="text-xs uppercase tracking-[0.18em] text-neutral-400">{t("asst.eyebrow")}</span>
          </div>
          <h1 className="mt-2 font-display text-3xl tracking-tight">{t("asst.title")}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-neutral-500">{t("asst.desc")}</p>
        </header>

        <div className={SURFACE}>
          <div ref={logRef} className="max-h-[440px] space-y-4 overflow-y-auto px-6 py-6">
            {chat.length === 0 ? (
              <Burbuja brand={brand}>{t("asst.greeting")}</Burbuja>
            ) : (
              chat.map((m, i) =>
                m.rol === "user" ? (
                  <div key={i} className="flex justify-end">
                    <div className="max-w-[80%] rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm text-white" style={{ background: brand }}>
                      {m.txt}
                    </div>
                  </div>
                ) : (
                  <Burbuja key={i} brand={brand}>
                    {m.txt}
                    {m.acciones && m.acciones.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {m.acciones.map((a) =>
                          hechas.has(a.id) ? (
                            <span key={a.id} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium" style={{ background: soft("ok"), color: col("ok", dark) }}>
                              <Icon name="check" className="h-3.5 w-3.5" />
                              {t("asst.done")}
                            </span>
                          ) : confirmando === a.id ? (
                            <span key={a.id} className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-1.5 text-xs dark:border-neutral-700">
                              <span className="text-neutral-500">{t("asst.confirmQ")}</span>
                              <button onClick={() => ejecutar(a)} className="font-medium" style={{ color: col("ok", dark) }}>
                                {t("asst.yes")}
                              </button>
                              <button onClick={() => setConfirmando(null)} className="font-medium text-neutral-400">
                                {t("asst.no")}
                              </button>
                            </span>
                          ) : (
                            <button
                              key={a.id}
                              onClick={() => (a.tipo === "reconocer" ? setConfirmando(a.id) : ejecutar(a))}
                              className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors hover:border-neutral-300 dark:border-neutral-700"
                              style={{ borderColor: ARC, color: brand }}
                            >
                              <Icon name={a.tipo === "reconocer" ? "check" : a.tipo === "alertas" ? "clipboard" : "gauge"} className="h-3.5 w-3.5" />
                              {a.label}
                            </button>
                          )
                        )}
                      </div>
                    )}
                  </Burbuja>
                )
              )
            )}
          </div>

          <div className="border-t border-neutral-100 px-4 py-3 dark:border-neutral-800">
            <div className="mb-3 flex flex-wrap gap-2">
              {SUGERENCIAS.map((s) => (
                <button key={s} onClick={() => enviar(s)} className="rounded-full border border-neutral-200 px-3 py-1 text-xs text-neutral-500 transition-colors hover:border-neutral-300 dark:border-neutral-700">
                  {s}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") enviar();
                }}
                placeholder={t("asst.placeholder")}
                className="flex-1 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm outline-none focus:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800"
              />
              <button onClick={() => enviar()} aria-label={t("asst.send")} className="flex h-10 w-10 items-center justify-center rounded-xl text-white" style={{ background: brand }}>
                <Icon name="send" className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <p className="mt-3 text-center text-[11px] text-neutral-400">{t("asst.footer")}</p>
      </div>
    </main>
  );
}

function Burbuja({ children, brand }: { children: React.ReactNode; brand: string }) {
  return (
    <div className="flex gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full" style={{ background: mix(brand), color: brand }}>
        <Icon name="spark" className="h-4 w-4" />
      </div>
      <div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-neutral-100 px-4 py-2.5 text-sm dark:bg-neutral-800">{children}</div>
    </div>
  );
}
