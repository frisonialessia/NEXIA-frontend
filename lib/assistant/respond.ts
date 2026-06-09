// ──────────────────────────────────────────────────────────────────────────
// ASISTENTE — MOTOR DE RESPUESTA (la "seam" del LLM)
// Hoy: lógica de reglas que analiza el estado real (simulado) de la planta.
// Mañana: se sustituye el cuerpo de responderIA() por una llamada a un modelo
// de lenguaje (Claude/Gemini) vía el backend. La firma se mantiene, así que el
// componente de chat NO cambia.
//
// Se mantiene como función pura: recibe la pregunta y un contexto con el estado
// de la planta; no lee estado global. Eso la hace fácil de testear y de migrar.
// ──────────────────────────────────────────────────────────────────────────

import { CAUSAS, ESTADOS, HORAS_PARADA_TIPICA, AHORRO_POR_PARADA } from "../constants";
import { diasAFallo } from "../engine/fsm";
import type { Maquina } from "../types";

export interface ContextoPlanta {
  maquinas: Maquina[];
  paradasEvitadas: number;
  ahorroMes: number;
}

function causaPrincipal(m: Maquina): string {
  return (CAUSAS[m.tipo] || CAUSAS.bomba)[0].toLowerCase();
}

export function responderIA(pregunta: string, ctx: ContextoPlanta): string {
  const { maquinas, paradasEvitadas, ahorroMes } = ctx;
  const q = pregunta.toLowerCase();

  const criticas = maquinas.filter((m) => m.estado === "CRITICAL_ALERT").sort((a, b) => b.prob - a.prob);
  const obs = maquinas.filter((m) => m.estado === "WARNING_PROBATION");
  const nombrada = maquinas.find((m) => q.includes(m.id.toLowerCase()) || q.includes(m.tipo));

  // Saludo
  if (/^(hola|buenas|hey|qué tal|que tal)/.test(q)) {
    return "Hola. Soy el asistente de NEXIA. Puedo decirte el estado de la planta, explicar por qué una máquina está en riesgo, o ayudarte a priorizar el mantenimiento. ¿Qué necesitas?";
  }

  // Máquina concreta nombrada
  if (nombrada) {
    const dias = diasAFallo(nombrada);
    if (nombrada.estado === "STABLE") {
      return `La ${nombrada.id} opera con normalidad. Vibración dentro del rango esperado y ${Math.round(
        nombrada.prob * 100
      )}% de probabilidad de fallo, que es bajo. Sin acción requerida.`;
    }
    let r = `La ${nombrada.id} está en estado "${ESTADOS[nombrada.estado].toLowerCase()}" con ${Math.round(
      nombrada.prob * 100
    )}% de probabilidad de fallo. `;
    if (dias !== Infinity && dias < 30) {
      r += `La proyección estima una posible falla en ~${Math.max(1, Math.ceil(dias))} días si no se interviene. `;
    }
    r += `El patrón es consistente con ${causaPrincipal(nombrada)}. Recomiendo inspección.`;
    return r;
  }

  // Estado general
  if (
    q.includes("estado") ||
    q.includes("resumen") ||
    q.includes("cómo está") ||
    q.includes("como esta") ||
    q.includes("general") ||
    q.includes("planta")
  ) {
    if (criticas.length === 0 && obs.length === 0) {
      return "Toda la planta opera con normalidad. Las 6 máquinas están dentro de parámetros y ninguna requiere atención.";
    }
    let r = "";
    if (criticas.length) r += `${criticas.length} máquina(s) en estado crítico: ${criticas.map((m) => m.id).join(", ")}. `;
    if (obs.length) r += `${obs.length} en observación: ${obs.map((m) => m.id).join(", ")}. `;
    r += "El resto opera con normalidad.";
    return r;
  }

  // Por qué / problema / falla
  if (q.includes("por qué") || q.includes("por que") || q.includes("problema") || q.includes("falla") || q.includes("pasa")) {
    const m = criticas[0] || obs[0];
    if (!m) return "En este momento ninguna máquina presenta fallos. Todo opera dentro de lo esperado.";
    const dias = diasAFallo(m);
    let r = `La ${m.id} muestra vibración por encima del rango esperado (${Math.round(
      m.prob * 100
    )}% de probabilidad de fallo). El patrón es consistente con desgaste progresivo, típicamente ${causaPrincipal(m)}. `;
    if (dias !== Infinity && dias < 30) r += `Proyección: posible falla en ~${Math.max(1, Math.ceil(dias))} días.`;
    return r;
  }

  // Mantenimiento / prioridad
  if (
    q.includes("mantenimiento") ||
    q.includes("prioridad") ||
    q.includes("primero") ||
    q.includes("urgente") ||
    q.includes("priori")
  ) {
    const m = criticas[0] || obs[0];
    if (!m) return "No hay mantenimiento urgente pendiente. Puedes seguir el plan preventivo normal.";
    return `Prioriza la ${m.id}: es la de mayor riesgo (${Math.round(
      m.prob * 100
    )}% de probabilidad de fallo). Intervenir ahora, de forma planificada, evita una parada no planificada que costaría alrededor de $${AHORRO_POR_PARADA.toLocaleString(
      "es-ES"
    )}.`;
  }

  // Dinero / ahorro
  if (q.includes("ahorro") || q.includes("dinero") || q.includes("cuánto") || q.includes("cuanto") || q.includes("costo") || q.includes("$")) {
    return `Este mes NEXIA ha evitado ${paradasEvitadas} paradas no planificadas, un ahorro estimado de $${ahorroMes.toLocaleString(
      "es-ES"
    )}. Cada parada evitada equivale a unas ${HORAS_PARADA_TIPICA} horas de producción recuperadas.`;
  }

  // Cuántas máquinas
  if (q.includes("cuántas") || q.includes("cuantas") || q.includes("máquinas") || q.includes("activos")) {
    return `Hay ${maquinas.length} activos monitoreados: bombas, un compresor, un motor y un ventilador, distribuidos en embotelladora, alimentos, tratamiento de agua y taller.`;
  }

  return "Puedo ayudarte con: el estado general de la planta, por qué una máquina está en riesgo, qué priorizar en mantenimiento, o el ahorro acumulado. Prueba a preguntarme por una máquina concreta.";
}

/** Preguntas sugeridas que se muestran bajo el chat. */
export const SUGERENCIAS = [
  "¿Cuál es el estado de la planta?",
  "¿Qué necesita mantenimiento urgente?",
  "¿Cuánto hemos ahorrado?",
];
