// ──────────────────────────────────────────────────────────────────────────
// ORIGEN REMOTO  ·  REST (snapshot) + WebSocket (vivo)
// Conecta el store de la flota a un backend real. Trae un snapshot por REST y
// luego escucha actualizaciones por WebSocket. Reintenta con backoff; si la
// conexión es irrecuperable, avisa (onCaida) para que el store caiga a la
// simulación local. En modo remoto, las acciones se envían como comandos.
// ──────────────────────────────────────────────────────────────────────────

import type { Alerta, Evento, Maquina, MaquinaSeed, Veredicto } from "../types";
import {
  RUTAS,
  apiBase,
  authToken,
  wsUrl,
  type MensajeVivo,
  type SnapshotDTO,
} from "./contract";
import { aAlerta, aEvento, aMaquina, aSnapshot, type SnapshotDominio } from "./mappers";

export interface ParcheRemoto {
  maquinas?: Maquina[];
  nuevasAlertas?: Alerta[];
  nuevosEventos?: Evento[];
  savings?: { ahorroMes: number; paradasEvitadas: number };
}

export interface CallbacksRemoto {
  onSnapshot: (s: SnapshotDominio) => void;
  onUpdate: (p: ParcheRemoto) => void;
  onConectado?: () => void;
  /** Fallo irrecuperable de conexión → el store debe usar la simulación. */
  onCaida: () => void;
}

export interface OrigenRemoto {
  cerrar(): void;
}

const MAX_REINTENTOS = 4;

function headers(): HeadersInit {
  const h: Record<string, string> = { "Content-Type": "application/json" };
  const tok = authToken();
  if (tok) h.Authorization = `Bearer ${tok}`;
  return h;
}

/** Conecta al backend. Devuelve un manejador para cerrar la conexión. */
export function conectarRemoto(cb: CallbacksRemoto): OrigenRemoto {
  let ws: WebSocket | null = null;
  let intentos = 0;
  let cerrado = false;
  let reconexion: ReturnType<typeof setTimeout> | null = null;

  // 1) Snapshot inicial por REST (datos rápidos antes de que abra el WS).
  fetch(apiBase() + RUTAS.snapshot, { headers: headers() })
    .then((r) => {
      if (!r.ok) throw new Error(`snapshot ${r.status}`);
      return r.json() as Promise<SnapshotDTO>;
    })
    .then((dto) => {
      if (!cerrado) cb.onSnapshot(aSnapshot(dto));
    })
    .catch(() => {
      /* Sin snapshot REST: el WS aún puede traer uno. Si todo falla → onCaida. */
    });

  // 2) WebSocket en vivo, con reconexión por backoff.
  function abrir() {
    if (cerrado) return;
    try {
      ws = new WebSocket(wsUrl());
    } catch {
      programarReconexion();
      return;
    }

    ws.onopen = () => {
      intentos = 0;
      cb.onConectado?.();
    };

    ws.onmessage = (e) => {
      let msg: MensajeVivo;
      try {
        msg = JSON.parse(e.data);
      } catch {
        return; // mensaje malformado: se ignora
      }
      if (msg.type === "snapshot") {
        cb.onSnapshot(aSnapshot(msg.data));
      } else if (msg.type === "update") {
        cb.onUpdate({
          maquinas: msg.maquinas?.map(aMaquina),
          nuevasAlertas: msg.nuevasAlertas?.map(aAlerta),
          nuevosEventos: msg.nuevosEventos?.map(aEvento),
          savings: msg.savings,
        });
      }
    };

    ws.onclose = () => {
      if (!cerrado) programarReconexion();
    };

    ws.onerror = () => {
      ws?.close();
    };
  }

  function programarReconexion() {
    if (cerrado) return;
    intentos += 1;
    if (intentos > MAX_REINTENTOS) {
      cb.onCaida(); // se agotaron los reintentos → respaldo a simulación
      return;
    }
    const espera = Math.min(16000, 1000 * 2 ** (intentos - 1)); // 1s,2s,4s,8s,16s
    reconexion = setTimeout(abrir, espera);
  }

  abrir();

  return {
    cerrar() {
      cerrado = true;
      if (reconexion) clearTimeout(reconexion);
      ws?.close();
      ws = null;
    },
  };
}

// ── Comandos (acciones del usuario → backend) ───────────────────────────────
// Best-effort: el backend procesa y re-emite la verdad por el WebSocket.

function comando(ruta: string, metodo: string, body?: unknown): void {
  fetch(apiBase() + ruta, {
    method: metodo,
    headers: headers(),
    body: body !== undefined ? JSON.stringify(body) : undefined,
  }).catch(() => {
    /* Sin red: el WS reconciliará cuando vuelva la conexión. */
  });
}

export const comandos = {
  etiquetar: (alertaId: string, veredicto: Veredicto) => comando(RUTAS.etiquetar(alertaId), "POST", { veredicto }),
  reparar: (maquinaId: string) => comando(RUTAS.reparar(maquinaId), "POST"),
  crearMaquina: (seed: MaquinaSeed) => comando(RUTAS.crearMaquina, "POST", seed),
  editarMaquina: (id: string, parcial: Partial<MaquinaSeed>) => comando(RUTAS.editarMaquina(id), "PATCH", parcial),
  quitarMaquina: (id: string) => comando(RUTAS.quitarMaquina(id), "DELETE"),
};
