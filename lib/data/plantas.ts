// ──────────────────────────────────────────────────────────────────────────
// CAPA DE DATOS · ORGANIZACIÓN (plantas) y FACTURACIÓN — semillas
// Una cuenta puede tener varias plantas; cada una agrupa su maquinaria. En modo
// demo, el motor en vivo representa la planta activa. El día del backend, las
// máquinas se filtran por planta y el plan viene de la pasarela de pago.
// ──────────────────────────────────────────────────────────────────────────

export interface Planta {
  id: string;
  nombre: string;
  ubicacion: string;
  zona: string;
  lineas: number;
  maquinas: number;
}

export const PLANTAS: Planta[] = [
  { id: "p1", nombre: "Planta Norte", ubicacion: "Monterrey, MX", zona: "GMT-6", lineas: 3, maquinas: 6 },
  { id: "p2", nombre: "Planta Sur", ubicacion: "Querétaro, MX", zona: "GMT-6", lineas: 2, maquinas: 4 },
  { id: "p3", nombre: "Centro de distribución", ubicacion: "Guadalajara, MX", zona: "GMT-6", lineas: 1, maquinas: 2 },
];

// ── Facturación ────────────────────────────────────────────────────────────

export type PlanId = "starter" | "pro" | "enterprise";
export type Ciclo = "mensual" | "anual";

export interface Plan {
  id: PlanId;
  nombre: string;
  /** Precio mensual por planta (USD). El anual aplica descuento. */
  precio: number;
  maxMaquinas: number;
  maxUsuarios: number;
  maxPlantas: number;
  destacado?: boolean;
  features: string[];
}

export const PLANES: Plan[] = [
  {
    id: "starter",
    nombre: "Starter",
    precio: 0,
    maxMaquinas: 5,
    maxUsuarios: 3,
    maxPlantas: 1,
    features: ["Hasta 5 máquinas", "Monitoreo y alertas", "1 planta", "Soporte por correo"],
  },
  {
    id: "pro",
    nombre: "Pro",
    precio: 99,
    maxMaquinas: 25,
    maxUsuarios: 15,
    maxPlantas: 3,
    destacado: true,
    features: ["Hasta 25 máquinas", "Producción / OEE y reportes", "Hasta 3 plantas", "Integraciones industriales", "Soporte prioritario"],
  },
  {
    id: "enterprise",
    nombre: "Enterprise",
    precio: 349,
    maxMaquinas: 999,
    maxUsuarios: 999,
    maxPlantas: 999,
    features: ["Máquinas ilimitadas", "Plantas ilimitadas", "Permisos y auditoría avanzados", "Conectores a medida", "Gerente de cuenta dedicado"],
  },
];

/** Descuento aplicado al pagar por año (≈ 2 meses gratis). */
export const DESCUENTO_ANUAL = 0.17;

export interface MetodoPago {
  marca: string;
  ultimos4: string;
  expira: string;
}

export const METODO_PAGO: MetodoPago = { marca: "Visa", ultimos4: "4242", expira: "08/27" };

export type EstadoFactura = "pagada" | "pendiente";

export interface Factura {
  id: string;
  fecha: string;
  concepto: string;
  monto: number;
  estado: EstadoFactura;
}

export const FACTURAS: Factura[] = [
  { id: "INV-2026-006", fecha: "1 jun 2026", concepto: "Plan Pro · junio", monto: 297, estado: "pagada" },
  { id: "INV-2026-005", fecha: "1 may 2026", concepto: "Plan Pro · mayo", monto: 297, estado: "pagada" },
  { id: "INV-2026-004", fecha: "1 abr 2026", concepto: "Plan Pro · abril", monto: 198, estado: "pagada" },
  { id: "INV-2026-003", fecha: "1 mar 2026", concepto: "Plan Pro · marzo", monto: 198, estado: "pagada" },
];

export function planPorId(id: PlanId): Plan {
  return PLANES.find((p) => p.id === id) ?? PLANES[0];
}
