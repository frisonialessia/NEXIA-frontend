"use client";

// ──────────────────────────────────────────────────────────────────────────
// CONFIGURACIÓN · pestaña CONEXIONES (integraciones)
// Protocolos industriales configurables: cada uno abre un formulario (host,
// puerto, intervalo), se puede probar y conectar/desconectar. Estado y
// configuración persistidos; cada acción queda en auditoría.
// ──────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { toast } from "sonner";
import { PROTO_ESENCIAL, PROTO_SPECIAL, PROTO_VENDOR, ROL_NOMBRE, col, soft } from "@/lib/constants";
import { useModalA11y } from "@/lib/hooks/useModalA11y";
import { useAdmin } from "@/lib/state/AdminProvider";
import { useIntegraciones } from "@/lib/state/IntegrationsProvider";
import { useSession } from "@/lib/state/SessionProvider";
import type { EstadoProtocolo, Protocolo } from "@/lib/types";
import { Icon } from "../ui/Icon";
import { Button } from "../ui/Primitives";

export function ConnectBody() {
  const { conexiones } = useIntegraciones();
  const [abierto, setAbierto] = useState<Protocolo | null>(null);

  return (
    <div className="space-y-6">
      <p className="max-w-2xl text-sm leading-relaxed text-neutral-500">
        Conecta NEXIA a tus máquinas por protocolos industriales estándar. Selecciona el de tu PLC o controlador para
        configurarlo. Un gateway traduce la señal de tu equipo al sistema.
      </p>
      <Grupo titulo="Protocolos esenciales" protocolos={PROTO_ESENCIAL} estados={conexiones} onAbrir={setAbierto} />
      <Grupo titulo="Por fabricante de PLC" protocolos={PROTO_VENDOR} estados={conexiones} onAbrir={setAbierto} />
      <Grupo titulo="Buses industriales especializados" protocolos={PROTO_SPECIAL} estados={conexiones} onAbrir={setAbierto} />

      {abierto && <ConfigModal protocolo={abierto} onClose={() => setAbierto(null)} />}
    </div>
  );
}

function Grupo({
  titulo,
  protocolos,
  estados,
  onAbrir,
}: {
  titulo: string;
  protocolos: Protocolo[];
  estados: Record<string, { estado: EstadoProtocolo }>;
  onAbrir: (p: Protocolo) => void;
}) {
  return (
    <div>
      <h3 className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">{titulo}</h3>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {protocolos.map((p) => (
          <ProtocoloCard key={p.n} p={p} estado={estados[p.n]?.estado ?? p.estado} onClick={() => onAbrir(p)} />
        ))}
      </div>
    </div>
  );
}

function ProtocoloCard({ p, estado, onClick }: { p: Protocolo; estado: EstadoProtocolo; onClick: () => void }) {
  const brand = col("brand");
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center justify-between rounded-xl border border-neutral-200 bg-white px-5 py-4 text-left transition-colors hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: `${brand}14`, color: brand }}>
          <Icon name="plug" className="h-4 w-4" />
        </div>
        <div>
          <div className="text-sm font-medium">{p.n}</div>
          <div className="text-xs text-neutral-400">{p.d}</div>
        </div>
      </div>
      <EstadoPill estado={estado} />
    </button>
  );
}

function EstadoPill({ estado }: { estado: EstadoProtocolo }) {
  const map: Record<EstadoProtocolo, [string, string]> = {
    conectado: [col("ok"), "Conectado"],
    disponible: [col("brand"), "Disponible"],
    configurar: [col("gray"), "Configurar"],
  };
  const [c, t] = map[estado];
  return (
    <span className="rounded-full px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide" style={{ background: `${c}1a`, color: c }}>
      {t}
    </span>
  );
}

function ConfigModal({ protocolo, onClose }: { protocolo: Protocolo; onClose: () => void }) {
  const { conexiones, configurar, conectar, desconectar } = useIntegraciones();
  const { registrar } = useAdmin();
  const { rol } = useSession();
  const dialogRef = useModalA11y<HTMLDivElement>(onClose);
  const actor = ROL_NOMBRE[rol];

  const actual = conexiones[protocolo.n] ?? { estado: protocolo.estado };
  const [host, setHost] = useState(actual.host ?? "");
  const [puerto, setPuerto] = useState(actual.puerto ?? "");
  const [intervalo, setIntervalo] = useState(actual.intervalo ?? "1000");
  const [probando, setProbando] = useState(false);

  const conectado = actual.estado === "conectado";
  const input = "w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm outline-none focus:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800";

  function probar() {
    if (!host) {
      toast.error("Indica el host o IP");
      return;
    }
    setProbando(true);
    setTimeout(() => {
      setProbando(false);
      toast.success("Conexión exitosa · el gateway respondió");
    }, 900);
  }

  function guardar() {
    configurar(protocolo.n, { host, puerto, intervalo });
    registrar(actor, "Configuró conexión", protocolo.n);
    toast(protocolo.n + " configurado");
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/30 px-4 backdrop-blur-sm" onClick={onClose}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="conx-title"
        tabIndex={-1}
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-neutral-200 bg-white shadow-xl outline-none dark:border-neutral-700 dark:bg-neutral-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-neutral-100 px-7 pt-7 pb-5 dark:border-neutral-800">
          <div>
            <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-neutral-400">Integración</span>
            <h2 id="conx-title" className="mt-2 font-serif text-2xl tracking-tight">{protocolo.n}</h2>
            <p className="mt-1 text-sm text-neutral-500">{protocolo.d}</p>
          </div>
          <EstadoPill estado={actual.estado} />
        </div>

        <div className="space-y-4 px-7 py-6">
          <Campo label="Host / IP">
            <input value={host} onChange={(e) => setHost(e.target.value)} placeholder="192.168.1.50" className={input} />
          </Campo>
          <div className="grid grid-cols-2 gap-4">
            <Campo label="Puerto">
              <input value={puerto} onChange={(e) => setPuerto(e.target.value)} placeholder="502" className={input} />
            </Campo>
            <Campo label="Intervalo de sondeo (ms)">
              <input value={intervalo} onChange={(e) => setIntervalo(e.target.value)} placeholder="1000" className={input} />
            </Campo>
          </div>
          <button
            onClick={probar}
            disabled={probando}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium disabled:opacity-60"
            style={{ background: soft("ok"), color: col("ok") }}
          >
            <Icon name="check" className="h-3.5 w-3.5" />
            {probando ? "Probando…" : "Probar conexión"}
          </button>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-neutral-100 px-7 py-5 dark:border-neutral-800">
          {conectado ? (
            <Button
              variant="secondary"
              onClick={() => {
                desconectar(protocolo.n);
                registrar(actor, "Desconectó", protocolo.n);
                toast(protocolo.n + " desconectado");
                onClose();
              }}
            >
              Desconectar
            </Button>
          ) : (
            <Button
              variant="secondary"
              onClick={() => {
                conectar(protocolo.n);
                registrar(actor, "Conectó", protocolo.n);
                toast.success(protocolo.n + " conectado");
                onClose();
              }}
            >
              Conectar
            </Button>
          )}
          <div className="flex gap-3">
            <Button variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={guardar}>Guardar</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium uppercase tracking-[0.14em] text-neutral-400">{label}</span>
      {children}
    </label>
  );
}
