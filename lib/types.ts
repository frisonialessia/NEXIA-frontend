// ──────────────────────────────────────────────────────────────────────────
// FUENTE ÚNICA DE TIPOS DEL DOMINIO NEXIA
// Todo el resto del código importa los tipos desde aquí. Si el día de mañana
// llega un backend real, estos tipos describen el "contrato" de los datos.
// ──────────────────────────────────────────────────────────────────────────

/** Estados de la máquina de estados con histéresis (anti-flapping). */
export type Estado =
  | "STABLE"
  | "WARNING_PROBATION"
  | "CRITICAL_ALERT"
  | "RECOVERY_PROBATION";

/** Tipo de equipo rotativo. Determina las causas raíz posibles. */
export type TipoMaquina = "bomba" | "compresor" | "motor" | "ventilador";

/** Escenario de simulación: cómo evoluciona la vibración de la máquina. */
export type Escenario = "sano" | "degradando" | "critico";

/** Una lectura puntual de la serie de vibración (real vs. esperada). */
export interface Lectura {
  /** timestamp (ms) o índice secuencial en el caso del replay */
  t: number;
  /** valor real de vibración */
  v: number;
  /** valor esperado por la baseline */
  exp: number;
}

/** Definición fija de una máquina de la flota (lo que no cambia con el tiempo). */
export interface MaquinaSeed {
  id: string;
  sensor: string;
  sector: string;
  /** baseline de vibración */
  base: number;
  esc: Escenario;
}

/** Estado completo y vivo de una máquina (semilla + estado dinámico del motor). */
export interface Maquina extends MaquinaSeed {
  tipo: TipoMaquina;
  estado: Estado;
  /** lecturas altas consecutivas (histéresis hacia arriba) */
  cSube: number;
  /** lecturas bajas consecutivas (histéresis hacia abajo) */
  cBaja: number;
  /** historial reciente de lecturas (ventana móvil) */
  hist: Lectura[];
  /** vibración esperada actual (baseline + componente cíclica) */
  expected: number;
  /** probabilidad de fallo (0..1) */
  prob: number;
  /** contador de ticks transcurridos */
  tick: number;
  /** ritmo de degradación por día (para proyectar días a fallo) */
  ritmoDia: number;
  /** horas de operación acumuladas */
  horasOp: number;
}

/** Una alerta generada cuando una máquina entra en estado crítico. */
export interface Alerta {
  id: string;
  maquina: string;
  sensor: string;
  tipo: TipoMaquina;
  causa: string;
  prob: number;
  hora: string;
}

/** Entrada del historial de fallos (una alerta + metadatos de seguimiento). */
export interface EventoHistorial extends Alerta {
  fecha: string;
  estado: "Pendiente" | "Resuelto";
}

/** Veredicto humano sobre una alerta (human-in-the-loop). */
export type Veredicto = "real" | "falsa" | "nc";

// ──────────────────────────────────────────────────────────────────────────
// Eventos (feed de actividad)
// Modelo propio, separado del "registro de fallos" (historial). Preparado para
// crecer: detección, resolución y, en el futuro, mantenimiento / reconocimiento.
// ──────────────────────────────────────────────────────────────────────────

export type TipoEvento = "deteccion" | "resolucion";

export interface Evento {
  id: string;
  ts: number;
  hora: string;
  tipo: TipoEvento;
  maquina: string;
  detalle: string;
  prob?: number;
}

// ──────────────────────────────────────────────────────────────────────────
// Roles y permisos
// ──────────────────────────────────────────────────────────────────────────

export type Rol = "admin" | "jefe" | "tecnico" | "operador" | "lectura";

// ──────────────────────────────────────────────────────────────────────────
// Sistema de unidades
// ──────────────────────────────────────────────────────────────────────────

export type SistemaUnidades = "metrico" | "imperial";

/** Magnitudes que cambian de unidad según el sistema (métrico/imperial). */
export type Magnitud = "temp" | "pres" | "caudal" | "pot" | "par" | "vib";

/** Una unidad concreta: símbolo + función de conversión desde el valor base (SI). */
export interface Unidad {
  u: string;
  f: (v: number) => number;
}

// ──────────────────────────────────────────────────────────────────────────
// Protocolos industriales (vista Conectar)
// ──────────────────────────────────────────────────────────────────────────

export type EstadoProtocolo = "conectado" | "disponible" | "configurar";

export interface Protocolo {
  n: string;
  d: string;
  estado: EstadoProtocolo;
}

// ──────────────────────────────────────────────────────────────────────────
// Chat del asistente
// ──────────────────────────────────────────────────────────────────────────

export interface MensajeChat {
  rol: "user" | "ia";
  txt: string;
}
