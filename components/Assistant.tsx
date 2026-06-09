"use client";

// ──────────────────────────────────────────────────────────────────────────
// VISTA 9 · ASISTENTE IA
// Chat en lenguaje natural sobre el estado de las máquinas. La interfaz es
// agnóstica al origen de la respuesta: llama a responderIA() (la "seam" del
// LLM). Hoy son reglas; mañana, una llamada a un modelo, sin tocar este chat.
// Portado de pintarChat() + enviarChat() de la demo.
// ──────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from "react";
import { col } from "@/lib/constants";
import { SUGERENCIAS, responderIA } from "@/lib/assistant/respond";
import { useFleet } from "@/lib/state/FleetProvider";
import { useTheme } from "@/lib/state/ThemeProvider";
import type { MensajeChat } from "@/lib/types";
import { Icon } from "./ui/Icon";

export function Assistant() {
  const { maquinas, paradasEvitadas, ahorroMes } = useFleet();
  const { dark } = useTheme();
  const brand = col("brand", dark);

  const [chat, setChat] = useState<MensajeChat[]>([]);
  const [texto, setTexto] = useState("");
  const logRef = useRef<HTMLDivElement>(null);

  // Mantiene el scroll abajo al llegar mensajes nuevos.
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [chat]);

  function enviar(pregunta?: string) {
    const q = (pregunta ?? texto).trim();
    if (!q) return;
    setTexto("");
    setChat((prev) => [...prev, { rol: "user", txt: q }]);
    // Pequeña espera para simular "pensando". En producción, await al LLM.
    setTimeout(() => {
      const respuesta = responderIA(q, { maquinas, paradasEvitadas, ahorroMes });
      setChat((prev) => [...prev, { rol: "ia", txt: respuesta }]);
    }, 500);
  }

  return (
    <main className="fade-in px-6 py-8 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <header className="mb-6">
          <div className="flex items-center gap-2">
            <Icon name="spark" className="h-4 w-4" style={{ color: brand }} />
            <span className="text-xs uppercase tracking-[0.18em] text-neutral-400">Inteligencia aumentada</span>
          </div>
          <h1 className="mt-2 font-serif text-3xl tracking-tight">Asistente NEXIA</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-neutral-500">
            Pregunta en lenguaje natural sobre el estado de tus máquinas. El asistente responde analizando los datos en
            tiempo real.
          </p>
        </header>

        <div className="rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
          <div ref={logRef} className="max-h-[420px] space-y-4 overflow-y-auto px-6 py-6">
            {chat.length === 0 ? (
              <Burbuja brand={brand}>
                Hola. Pregúntame sobre el estado de tus máquinas, qué priorizar, o por qué algo está en riesgo.
              </Burbuja>
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
                  </Burbuja>
                )
              )
            )}
          </div>

          <div className="border-t border-neutral-100 px-4 py-3 dark:border-neutral-800">
            <div className="mb-3 flex flex-wrap gap-2">
              {SUGERENCIAS.map((s) => (
                <button
                  key={s}
                  onClick={() => enviar(s)}
                  className="rounded-full border border-neutral-200 px-3 py-1 text-xs text-neutral-500 transition-colors hover:border-neutral-300 dark:border-neutral-700"
                >
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
                placeholder="Pregunta sobre tus máquinas…"
                className="flex-1 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm outline-none focus:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800"
              />
              <button
                onClick={() => enviar()}
                aria-label="Enviar"
                className="flex h-10 w-10 items-center justify-center rounded-xl text-white"
                style={{ background: brand }}
              >
                <Icon name="send" className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <p className="mt-3 text-center text-[11px] text-neutral-400">
          El asistente analiza los datos simulados de la demo. En producción se conecta a un modelo de lenguaje con acceso
          a tu planta.
        </p>
      </div>
    </main>
  );
}

function Burbuja({ children, brand }: { children: React.ReactNode; brand: string }) {
  return (
    <div className="flex gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full" style={{ background: `${brand}1a`, color: brand }}>
        <Icon name="spark" className="h-4 w-4" />
      </div>
      <div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-neutral-100 px-4 py-2.5 text-sm dark:bg-neutral-800">{children}</div>
    </div>
  );
}
