// ──────────────────────────────────────────────────────────────────────────
// ASISTENTE — MOTOR DE RESPUESTA (la "seam" del LLM)
// Hoy: lógica de reglas que analiza el estado real (simulado) de la planta y
// propone ACCIONES concretas (ver detalle, ir a alertas, reconocer una alerta),
// que el humano confirma. Mañana: se sustituye el cuerpo por una llamada a un
// modelo (Claude) con herramientas y permisos por rol; la firma se mantiene.
// ──────────────────────────────────────────────────────────────────────────

import { CAUSAS, ESTADOS, HORAS_PARADA_TIPICA, AHORRO_POR_PARADA } from "../constants";
import { diasAFallo } from "../engine/fsm";
import type { Alerta, Maquina } from "../types";

export interface ContextoPlanta {
  maquinas: Maquina[];
  alertas: Alerta[];
  paradasEvitadas: number;
  ahorroMes: number;
}

/** Acción que el asistente puede proponer; el humano la confirma/ejecuta. */
export type AccionIA =
  | { id: string; tipo: "ver"; label: string; maquina: string }
  | { id: string; tipo: "alertas"; label: string }
  | { id: string; tipo: "reconocer"; label: string; alertaId: string; maquina: string };

export interface RespuestaIA {
  texto: string;
  acciones: AccionIA[];
}

function causaPrincipal(m: Maquina): string {
  return (CAUSAS[m.tipo] || CAUSAS.bomba)[0].toLowerCase();
}

/** Construye las acciones sugeridas a partir de la máquina en foco. */
function accionesPara(foco: Maquina | undefined, ctx: ContextoPlanta): AccionIA[] {
  if (!foco || foco.estado === "STABLE") return [];
  const acciones: AccionIA[] = [{ id: "ver-" + foco.id, tipo: "ver", label: `Ver ${foco.id}`, maquina: foco.id }];
  const alerta = ctx.alertas.find((a) => a.maquina === foco.id);
  if (alerta) {
    acciones.push({ id: "rec-" + alerta.id, tipo: "reconocer", label: "Reconocer alerta", alertaId: alerta.id, maquina: foco.id });
  }
  return acciones;
}

export function responderIA(pregunta: string, ctx: ContextoPlanta): RespuestaIA {
  const { maquinas, paradasEvitadas, ahorroMes } = ctx;
  const q = pregunta.toLowerCase();

  const criticas = maquinas.filter((m) => m.estado === "CRITICAL_ALERT").sort((a, b) => b.prob - a.prob);
  const obs = maquinas.filter((m) => m.estado === "WARNING_PROBATION");
  const nombrada = maquinas.find((m) => q.includes(m.id.toLowerCase()) || q.includes(m.tipo));
  const foco = nombrada ?? criticas[0] ?? obs[0];

  const r = (texto: string, focoAcciones: Maquina | undefined = foco): RespuestaIA => ({
    texto,
    acciones: accionesPara(focoAcciones, ctx),
  });

  // Saludo
  if (/^(hola|buenas|hey|qué tal|que tal)/.test(q)) {
    return { texto: "Hola. Soy el asistente de NEXIA. Puedo decirte el estado de la planta, explicar por qué una máquina está en riesgo, o ayudarte a priorizar el mantenimiento. ¿Qué necesitas?", acciones: [] };
  }

  // Máquina concreta nombrada
  if (nombrada) {
    const dias = diasAFallo(nombrada);
    if (nombrada.estado === "STABLE") {
      return r(`La ${nombrada.id} opera con normalidad. Vibración dentro del rango esperado y ${Math.round(nombrada.prob * 100)}% de probabilidad de fallo, que es bajo. Sin acción requerida.`, nombrada);
    }
    let t = `La ${nombrada.id} está en estado "${ESTADOS[nombrada.estado].toLowerCase()}" con ${Math.round(nombrada.prob * 100)}% de probabilidad de fallo. `;
    if (dias !== Infinity && dias < 30) t += `La proyección estima una posible falla en ~${Math.max(1, Math.ceil(dias))} días si no se interviene. `;
    t += `El patrón es consistente con ${causaPrincipal(nombrada)}. Recomiendo inspección.`;
    return r(t, nombrada);
  }

  // Estado general
  if (q.includes("estado") || q.includes("resumen") || q.includes("cómo está") || q.includes("como esta") || q.includes("general") || q.includes("planta")) {
    if (criticas.length === 0 && obs.length === 0) {
      return { texto: "Toda la planta opera con normalidad. Las 6 máquinas están dentro de parámetros y ninguna requiere atención.", acciones: [] };
    }
    let t = "";
    if (criticas.length) t += `${criticas.length} máquina(s) en estado crítico: ${criticas.map((m) => m.id).join(", ")}. `;
    if (obs.length) t += `${obs.length} en observación: ${obs.map((m) => m.id).join(", ")}. `;
    t += "El resto opera con normalidad.";
    return r(t);
  }

  // Por qué / problema / falla
  if (q.includes("por qué") || q.includes("por que") || q.includes("problema") || q.includes("falla") || q.includes("pasa")) {
    const m = criticas[0] || obs[0];
    if (!m) return { texto: "En este momento ninguna máquina presenta fallos. Todo opera dentro de lo esperado.", acciones: [] };
    const dias = diasAFallo(m);
    let t = `La ${m.id} muestra vibración por encima del rango esperado (${Math.round(m.prob * 100)}% de probabilidad de fallo). El patrón es consistente con desgaste progresivo, típicamente ${causaPrincipal(m)}. `;
    if (dias !== Infinity && dias < 30) t += `Proyección: posible falla en ~${Math.max(1, Math.ceil(dias))} días.`;
    return r(t, m);
  }

  // Mantenimiento / prioridad
  if (q.includes("mantenimiento") || q.includes("prioridad") || q.includes("primero") || q.includes("urgente") || q.includes("priori")) {
    const m = criticas[0] || obs[0];
    if (!m) return { texto: "No hay mantenimiento urgente pendiente. Puedes seguir el plan preventivo normal.", acciones: [] };
    return r(`Prioriza la ${m.id}: es la de mayor riesgo (${Math.round(m.prob * 100)}% de probabilidad de fallo). Intervenir ahora, de forma planificada, evita una parada no planificada que costaría alrededor de $${AHORRO_POR_PARADA.toLocaleString("es-ES")}.`, m);
  }

  // Dinero / ahorro
  if (q.includes("ahorro") || q.includes("dinero") || q.includes("cuánto") || q.includes("cuanto") || q.includes("costo") || q.includes("$")) {
    return { texto: `Este mes NEXIA ha evitado ${paradasEvitadas} paradas no planificadas, un ahorro estimado de $${ahorroMes.toLocaleString("es-ES")}. Cada parada evitada equivale a unas ${HORAS_PARADA_TIPICA} horas de producción recuperadas.`, acciones: [] };
  }

  // Cuántas máquinas
  if (q.includes("cuántas") || q.includes("cuantas") || q.includes("máquinas") || q.includes("activos")) {
    return { texto: `Hay ${maquinas.length} activos monitoreados: bombas, un compresor, un motor y un ventilador, distribuidos en embotelladora, alimentos, tratamiento de agua y taller.`, acciones: [] };
  }

  return { texto: "Puedo ayudarte con: el estado general de la planta, por qué una máquina está en riesgo, qué priorizar en mantenimiento, o el ahorro acumulado. Prueba a preguntarme por una máquina concreta.", acciones: [] };
}

/** Preguntas sugeridas que se muestran bajo el chat. */
export const SUGERENCIAS = ["¿Cuál es el estado de la planta?", "¿Qué necesita mantenimiento urgente?", "¿Cuánto hemos ahorrado?"];
