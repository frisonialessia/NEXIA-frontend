"use client";

// ──────────────────────────────────────────────────────────────────────────
// VISTA 6 · CONECTAR (integración industrial)
// Protocolos industriales agrupados (esenciales, por fabricante de PLC y buses
// especializados) con su estado: conectado / disponible / configurar. Vista
// protegida por rol. Portado de renderConnect() de la demo.
// ──────────────────────────────────────────────────────────────────────────

import { PROTO_ESENCIAL, PROTO_SPECIAL, PROTO_VENDOR, col } from "@/lib/constants";
import { useSession } from "@/lib/state/SessionProvider";
import { useTheme } from "@/lib/state/ThemeProvider";
import type { EstadoProtocolo, Protocolo } from "@/lib/types";
import { AccessDenied } from "./AccessDenied";
import { Icon } from "./ui/Icon";

export function Connect() {
  const { puedeVer } = useSession();
  const { dark } = useTheme();

  if (!puedeVer("conectar")) {
    return <AccessDenied mensaje="Las conexiones industriales requieren rol Administrador o Técnico de mantenimiento." />;
  }

  return (
    <main className="fade-in px-6 py-8 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-6">
          <span className="text-xs uppercase tracking-[0.18em] text-neutral-400">Integración industrial</span>
          <h1 className="mt-2 font-serif text-3xl tracking-tight">Conectar a</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-neutral-500">
            NEXIA se conecta a tus máquinas a través de protocolos industriales estándar. Selecciona el que usa tu PLC o
            controlador. Un gateway traduce la señal de tu equipo al sistema.
          </p>
        </header>

        <Grupo titulo="Protocolos esenciales" protocolos={PROTO_ESENCIAL} dark={dark} />
        <Grupo titulo="Por fabricante de PLC" protocolos={PROTO_VENDOR} dark={dark} />
        <Grupo titulo="Buses industriales especializados" protocolos={PROTO_SPECIAL} dark={dark} ultimo />
      </div>
    </main>
  );
}

function Grupo({ titulo, protocolos, dark, ultimo }: { titulo: string; protocolos: Protocolo[]; dark: boolean; ultimo?: boolean }) {
  return (
    <div className={ultimo ? "" : "mb-6"}>
      <h3 className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">{titulo}</h3>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {protocolos.map((p) => (
          <ProtocoloCard key={p.n} p={p} dark={dark} />
        ))}
      </div>
    </div>
  );
}

function ProtocoloCard({ p, dark }: { p: Protocolo; dark: boolean }) {
  const brand = col("brand", dark);
  return (
    <div className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white px-5 py-4 transition-colors hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: `${brand}14`, color: brand }}>
          <Icon name="plug" className="h-4 w-4" />
        </div>
        <div>
          <div className="text-sm font-medium">{p.n}</div>
          <div className="text-xs text-neutral-400">{p.d}</div>
        </div>
      </div>
      <EstadoPill estado={p.estado} dark={dark} />
    </div>
  );
}

function EstadoPill({ estado, dark }: { estado: EstadoProtocolo; dark: boolean }) {
  const map: Record<EstadoProtocolo, [string, string]> = {
    conectado: [col("ok", dark), "Conectado"],
    disponible: [col("brand", dark), "Disponible"],
    configurar: [col("gray", dark), "Configurar"],
  };
  const [c, t] = map[estado];
  return (
    <span
      className="rounded-full px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide"
      style={{ background: `${c}1a`, color: c }}
    >
      {t}
    </span>
  );
}
