// ──────────────────────────────────────────────────────────────────────────
// I18N · diccionarios de mensajes (en = fuente, es = español)
// Claves por espacio de nombres (nav.*, login.*, roles.*, …). Para añadir un
// idioma, se duplica el bloque y se traduce. Interpolación con {variable}.
// ──────────────────────────────────────────────────────────────────────────

import type { Idioma } from "./config";

export type Dict = Record<string, string>;

const en: Dict = {
  // Banner
  "banner.demo": "Demo mode · simulated data · ready to connect real sensors",

  // Navegación
  "nav.command": "Command",
  "nav.production": "Production",
  "nav.reports": "Reports",
  "nav.alerts": "Alerts",
  "nav.maintenance": "Maintenance",
  "nav.assistant": "Assistant",
  "nav.settings": "Settings",
  "nav.activePlant": "Active plant",
  "nav.activeRole": "Active role",
  "nav.viewAsRole": "View as role · demo",
  "nav.managePlants": "Manage plants",
  "nav.plants": "Plants",
  "nav.myProfile": "My profile",
  "nav.signOut": "Sign out",
  "nav.openMenu": "Open menu",
  "nav.toggleTheme": "Toggle theme",
  "nav.account": "Account",
  "nav.switchPlant": "Switch plant",

  // Roles
  "roles.admin": "Administrator",
  "roles.jefe": "Plant manager",
  "roles.tecnico": "Maintenance technician",
  "roles.operador": "Operator",
  "roles.lectura": "Read only",

  // Login
  "login.tagline": "Operational Intelligence",
  "login.email": "Email",
  "login.emailPlaceholder": "you@plant.com",
  "login.password": "Password",
  "login.enter": "Sign in",
  "login.noPassword": "Demo mode · sign-in doesn't validate a password",
  "login.demoAccounts": "Demo accounts",
  "login.emailRequired": "Enter your email to sign in",

  // Preferencias de idioma (Ajustes / Perfil)
  "lang.title": "Language",
  "lang.desc": "Interface language",

  // Estados de máquina
  "estados.STABLE": "Stable",
  "estados.WARNING_PROBATION": "Watching",
  "estados.CRITICAL_ALERT": "Critical alert",
  "estados.RECOVERY_PROBATION": "Recovering",

  // Centro de mando
  "cc.live": "Live · {plant} · updating every 2s",
  "cc.title": "Command center",
  "cc.connecting": "Connecting to the engine…",
  "cc.collecting": "Collecting the first fleet readings…",
  "cc.assetsAllOrder": "assets · all in order",
  "cc.needsAttentionOne": "requires attention",
  "cc.needsAttentionMany": "require attention",
  "cc.ofTotal": "· of {total}",
  "cc.fleetDrag": "Fleet · drag to reorder",
  "cc.activity": "Activity",

  // KPIs
  "kpi.savingMonth": "Savings · month",
  "kpi.inStops": "in downtime avoided",
  "kpi.stopsAvoided": "Downtime avoided",
  "kpi.thisMonth": "this month",
  "kpi.plantHealth": "Plant health",
  "kpi.stableAssets": "stable assets",
  "kpi.needAttention": "Need attention",
  "kpi.allOk": "all in order",
  "kpi.oneAtRisk": "machine at risk",
  "kpi.manyAtRisk": "machines at risk",

  // Tarjeta de máquina
  "card.aiActive": "AI active",
  "card.prob": "prob.",
  "card.ofFailure": "of failure",
  "card.failsIn": "fails in ~{n} days",
  "card.collecting": "Collecting…",

  // Feed de eventos
  "events.liveActivity": "Live activity",
  "events.none": "No recent events.",
  "events.willAppear": "Detections will appear here.",
  "events.resolved": "Resolved",
  "events.anomaly": "Anomaly",
  "events.probSuffix": "{n}% prob.",

  // Mapa de salud
  "map.title": "Fleet health map",
  "map.desc": "Each cell is a vibration reading; the color shows how far it deviates from expected.",
  "map.veryHealthy": "Very healthy",
  "map.normal": "Normal",
  "map.watch": "Watch",
  "map.critical": "Critical",
  "map.collecting": "Collecting readings…",

  // Flota arrastrable
  "sort.unpin": "Unpin machine",
  "sort.pin": "Pin machine to top",
  "sort.drag": "Drag to reorder",

  // Acceso restringido
  "access.title": "Access restricted",
  "access.back": "Back to command center",
  "access.production": "The Production view requires a role with access (Administrator, Plant manager or Technician).",
  "access.maintenance": "The maintenance module requires a role with access (Administrator, Manager or Technician).",

  // Producción / OEE
  "prod.shift": "Current shift · Line 1",
  "prod.title": "Production & efficiency",
  "prod.oeeWorldClass": "World-class",
  "prod.oeeAcceptable": "Acceptable",
  "prod.oeeNeedsImprovement": "Needs improvement",
  "prod.oeeGlobal": "Overall OEE",
  "prod.availability": "Availability",
  "prod.performance": "Performance",
  "prod.quality": "Quality",
  "prod.goodParts": "Good parts",
  "prod.rejects": "Rejects",
  "prod.shiftTarget": "Shift target",
  "prod.rate": "Rate (pcs/min)",
  "prod.rateTarget": "target 9.0",
  "prod.downtime": "Downtime · by cause",
  "prod.energy": "Energy use · shift",
  "prod.min": "min",

  // Alertas
  "alerts.hitl": "Human-in-the-loop",
  "alerts.title": "Alerts",
  "alerts.export": "Export report",
  "alerts.noExport": "No events to export yet",
  "alerts.exported": "Alert history exported",
  "alerts.pending": "Pending",
  "alerts.history": "History",

  // Cola de auditoría
  "audit.empty1": "No pending alerts.",
  "audit.empty2": "All caught up.",
  "audit.pendingPill": "Pending",
  "audit.confirmTitle": "Confirm event",
  "audit.probableCause": "Probable cause (AI)",
  "audit.wasCorrect": "Was the alert correct?",
  "audit.real": "Real failure",
  "audit.false": "False alarm",
  "audit.nc": "Inconclusive",
  "audit.rootCause": "Root cause",
  "audit.actionTaken": "Action taken",
  "audit.cancel": "Cancel",
  "audit.confirm": "Confirm",
  "audit.labeled": "Event labeled · dataset updated",

  // Historial
  "hist.empty": "No events recorded yet. They'll appear as the system detects failures.",
  "hist.resolved": "Resolved",
  "hist.pending": "Pending",
};

const es: Dict = {
  "banner.demo": "Modo demostración · datos simulados · listo para conectar a sensores reales",

  "nav.command": "Mando",
  "nav.production": "Producción",
  "nav.reports": "Reportes",
  "nav.alerts": "Alertas",
  "nav.maintenance": "Mantenimiento",
  "nav.assistant": "Asistente",
  "nav.settings": "Configuración",
  "nav.activePlant": "Planta activa",
  "nav.activeRole": "Rol activo",
  "nav.viewAsRole": "Ver como rol · demo",
  "nav.managePlants": "Gestionar plantas",
  "nav.plants": "Plantas",
  "nav.myProfile": "Mi perfil",
  "nav.signOut": "Cerrar sesión",
  "nav.openMenu": "Abrir menú",
  "nav.toggleTheme": "Cambiar tema",
  "nav.account": "Cuenta",
  "nav.switchPlant": "Cambiar de planta",

  "roles.admin": "Administrador",
  "roles.jefe": "Jefe de planta",
  "roles.tecnico": "Técnico de mantenimiento",
  "roles.operador": "Operador",
  "roles.lectura": "Solo lectura",

  "login.tagline": "Inteligencia Operativa",
  "login.email": "Correo",
  "login.emailPlaceholder": "tucorreo@planta.com",
  "login.password": "Contraseña",
  "login.enter": "Entrar",
  "login.noPassword": "Modo demostración · el acceso no valida contraseña",
  "login.demoAccounts": "Cuentas de demostración",
  "login.emailRequired": "Escribe tu correo para entrar",

  "lang.title": "Idioma",
  "lang.desc": "Idioma de la interfaz",

  "estados.STABLE": "Estable",
  "estados.WARNING_PROBATION": "En observación",
  "estados.CRITICAL_ALERT": "Alerta crítica",
  "estados.RECOVERY_PROBATION": "Recuperación",

  "cc.live": "En vivo · {plant} · actualizando cada 2s",
  "cc.title": "Centro de mando",
  "cc.connecting": "Conectando con el motor…",
  "cc.collecting": "Recopilando las primeras lecturas de la flota…",
  "cc.assetsAllOrder": "activos · todo en orden",
  "cc.needsAttentionOne": "requiere atención",
  "cc.needsAttentionMany": "requieren atención",
  "cc.ofTotal": "· de {total}",
  "cc.fleetDrag": "Flota · arrastra para ordenar",
  "cc.activity": "Actividad",

  "kpi.savingMonth": "Ahorro · mes",
  "kpi.inStops": "en paradas evitadas",
  "kpi.stopsAvoided": "Paradas evitadas",
  "kpi.thisMonth": "este mes",
  "kpi.plantHealth": "Salud de planta",
  "kpi.stableAssets": "activos estables",
  "kpi.needAttention": "Requieren atención",
  "kpi.allOk": "todo en orden",
  "kpi.oneAtRisk": "máquina en riesgo",
  "kpi.manyAtRisk": "máquinas en riesgo",

  "card.aiActive": "IA activa",
  "card.prob": "prob.",
  "card.ofFailure": "de fallo",
  "card.failsIn": "falla en ~{n} días",
  "card.collecting": "Recopilando…",

  "events.liveActivity": "Actividad en vivo",
  "events.none": "Sin eventos recientes.",
  "events.willAppear": "Las detecciones aparecerán aquí.",
  "events.resolved": "Resuelto",
  "events.anomaly": "Anomalía",
  "events.probSuffix": "{n}% prob.",

  "map.title": "Mapa de salud de la flota",
  "map.desc": "Cada celda es una lectura de vibración; el color indica cuánto se desvía de lo esperado.",
  "map.veryHealthy": "Muy sano",
  "map.normal": "Normal",
  "map.watch": "Vigilar",
  "map.critical": "Crítico",
  "map.collecting": "Recopilando lecturas…",

  "sort.unpin": "Desfijar máquina",
  "sort.pin": "Fijar máquina arriba",
  "sort.drag": "Arrastrar para reordenar",

  "access.title": "Acceso restringido",
  "access.back": "Volver al centro de mando",
  "access.production": "La vista de Producción requiere un rol con acceso (Administrador, Jefe de planta o Técnico).",
  "access.maintenance": "El módulo de mantenimiento requiere un rol con acceso (Administrador, Jefe o Técnico).",

  "prod.shift": "Turno actual · Línea 1",
  "prod.title": "Producción y eficiencia",
  "prod.oeeWorldClass": "World-class",
  "prod.oeeAcceptable": "Aceptable",
  "prod.oeeNeedsImprovement": "Requiere mejora",
  "prod.oeeGlobal": "OEE Global",
  "prod.availability": "Disponibilidad",
  "prod.performance": "Rendimiento",
  "prod.quality": "Calidad",
  "prod.goodParts": "Piezas buenas",
  "prod.rejects": "Rechazos",
  "prod.shiftTarget": "Objetivo turno",
  "prod.rate": "Ritmo (pzs/min)",
  "prod.rateTarget": "meta 9.0",
  "prod.downtime": "Tiempos de inactividad · por causa",
  "prod.energy": "Consumo energético · turno",
  "prod.min": "min",

  "alerts.hitl": "Human-in-the-loop",
  "alerts.title": "Alertas",
  "alerts.export": "Exportar reporte",
  "alerts.noExport": "Aún no hay eventos para exportar",
  "alerts.exported": "Historial de alertas exportado",
  "alerts.pending": "Pendientes",
  "alerts.history": "Historial",

  "audit.empty1": "No hay alertas pendientes.",
  "audit.empty2": "Todo el trabajo está al día.",
  "audit.pendingPill": "Pendiente",
  "audit.confirmTitle": "Confirmar evento",
  "audit.probableCause": "Causa probable (IA)",
  "audit.wasCorrect": "¿La alerta fue correcta?",
  "audit.real": "Fallo real",
  "audit.false": "Falsa alarma",
  "audit.nc": "No concluyente",
  "audit.rootCause": "Causa raíz",
  "audit.actionTaken": "Acción tomada",
  "audit.cancel": "Cancelar",
  "audit.confirm": "Confirmar",
  "audit.labeled": "Evento etiquetado · dataset actualizado",

  "hist.empty": "Aún no hay eventos registrados. Aparecerán conforme el sistema detecte fallos.",
  "hist.resolved": "Resuelto",
  "hist.pending": "Pendiente",
};

export const MESSAGES: Partial<Record<Idioma, Dict>> = { en, es };
