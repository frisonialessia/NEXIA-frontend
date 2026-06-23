// ──────────────────────────────────────────────────────────────────────────
// CONTRATO DE API NEXIA  ·  frontend ⇄ backend
// Esta es la "fuente de la verdad" del contrato: define las URLs, el formato de
// los datos en el cable (DTOs) y los mensajes del WebSocket en vivo. El backend
// (FastAPI) debe implementar EXACTAMENTE estos endpoints y formatos.
//
// El frontend funciona con datos SIMULADOS por defecto. Si se define la variable
// NEXT_PUBLIC_API_URL, la capa de datos se conecta a este contrato en su lugar
// (ver lib/api/remoteSource.ts), con respaldo automático a la simulación si la
// conexión falla. Las vistas no cambian (patrón "seam").
//
// Versionado: prefijo /v1. Cambios incompatibles → /v2.
// ──────────────────────────────────────────────────────────────────────────

import type { Escenario, Estado, TipoMaquina, Veredicto } from "../types";

// ── Configuración (variables de entorno) ───────────────────────────────────

/** Base REST del backend, p. ej. "https://api.nexia.app". Vacío = simulación. */
export function apiBase(): string {
  return (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");
}

/** ¿Hay backend configurado? Si no, la app corre 100 % simulada. */
export function apiConfigurada(): boolean {
  return apiBase().length > 0;
}

/** URL del WebSocket en vivo. Se deriva de la base REST (http→ws) salvo override. */
export function wsUrl(): string {
  const override = process.env.NEXT_PUBLIC_WS_URL;
  if (override) return override;
  return apiBase().replace(/^http/, "ws") + RUTAS.live;
}

/** Token de sesión para autenticar las llamadas (el día que exista auth real). */
export function authToken(): string | null {
  if (typeof localStorage === "undefined") return null;
  return localStorage.getItem("nexia-token");
}

// ── Rutas (relativas a apiBase) ─────────────────────────────────────────────

export const RUTAS = {
  /** GET → SnapshotDTO. Estado completo actual de la planta activa. */
  snapshot: "/v1/fleet/snapshot",
  /** WS → MensajeVivo. Flujo en vivo (snapshot inicial + actualizaciones). */
  live: "/v1/fleet/live",
  /** POST {veredicto} → etiqueta una alerta (human-in-the-loop). */
  etiquetar: (alertaId: string) => `/v1/alerts/${encodeURIComponent(alertaId)}/label`,
  /** POST → marca una máquina como reparada (cierra el ciclo de mantenimiento). */
  reparar: (maquinaId: string) => `/v1/machines/${encodeURIComponent(maquinaId)}/repair`,
  /** POST {seed} → alta de máquina. */
  crearMaquina: "/v1/machines",
  /** PATCH {parcial} → edición de máquina. */
  editarMaquina: (maquinaId: string) => `/v1/machines/${encodeURIComponent(maquinaId)}`,
  /** DELETE → baja de máquina. */
  quitarMaquina: (maquinaId: string) => `/v1/machines/${encodeURIComponent(maquinaId)}`,
} as const;

// ── DTOs (formato en el cable) ──────────────────────────────────────────────
// El backend envía el ESTADO YA CALCULADO (estado FSM, probabilidad, lecturas).
// No expone su lógica interna. Los timestamps van en epoch ms (UTC); la hora
// legible la formatea el cliente (locale-aware).

export interface LecturaDTO {
  /** epoch ms o índice secuencial */
  t: number;
  /** vibración real */
  v: number;
  /** vibración esperada (baseline) */
  exp: number;
}

export interface MaquinaDTO {
  id: string;
  sensor: string;
  sector: string;
  tipo: TipoMaquina;
  base: number;
  umbral: number;
  estado: Estado;
  /** probabilidad de fallo 0..1 */
  prob: number;
  /** vibración esperada actual */
  expected: number;
  /** ritmo de degradación por día (para proyectar días a fallo) */
  ritmoDia: number;
  /** horas de operación acumuladas */
  horasOp: number;
  /** ventana móvil de lecturas recientes */
  hist: LecturaDTO[];
  /** escenario (opcional; informativo) */
  esc?: Escenario;
  /** ticks/periodo de calibración restante (0 = monitoreando) */
  calib?: number;
}

export interface AlertaDTO {
  id: string;
  maquina: string;
  sensor: string;
  tipo: TipoMaquina;
  causa: string;
  prob: number;
  /** epoch ms */
  ts: number;
  /** vibración real que disparó la alerta */
  vib: number;
  /** vibración esperada en ese momento */
  exp: number;
  /** umbral crítico de la máquina */
  umbral: number;
  /** "Pendiente" | "Resuelto" (solo en historial) */
  estado?: "Pendiente" | "Resuelto";
}

export interface EventoDTO {
  id: string;
  ts: number;
  tipo: "deteccion" | "resolucion";
  maquina: string;
  detalle: string;
  prob?: number;
}

export interface SavingsDTO {
  ahorroMes: number;
  paradasEvitadas: number;
}

/** Track record del modelo (veredictos humanos acumulados). */
export interface RegistroDTO {
  real: number;
  falsa: number;
  nc: number;
}

/** GET /v1/fleet/snapshot */
export interface SnapshotDTO {
  maquinas: MaquinaDTO[];
  alertas: AlertaDTO[];
  historial: AlertaDTO[];
  eventos: EventoDTO[];
  savings: SavingsDTO;
  registro: RegistroDTO;
}

// ── Mensajes del WebSocket en vivo ──────────────────────────────────────────
// El servidor abre con un "snapshot" y luego emite "update" cada tick (~2 s) o
// cuando ocurre algo. El cliente solo aplica parches.

export type MensajeVivo =
  | { type: "snapshot"; data: SnapshotDTO }
  | {
      type: "update";
      /** estado actualizado de toda la flota (reemplaza) */
      maquinas?: MaquinaDTO[];
      /** alertas nuevas (se anteponen) */
      nuevasAlertas?: AlertaDTO[];
      /** eventos nuevos (se anteponen) */
      nuevosEventos?: EventoDTO[];
      /** ahorro actualizado */
      savings?: SavingsDTO;
      /** track record actualizado */
      registro?: RegistroDTO;
    };

// ── Comandos (acciones del usuario hacia el backend) ────────────────────────
// En modo remoto, las acciones se envían como comandos; el backend procesa y
// re-emite la verdad por el WebSocket. El cliente no muta el estado localmente.

export interface ComandoEtiquetar {
  veredicto: Veredicto;
}
