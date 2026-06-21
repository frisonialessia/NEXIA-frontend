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
};

export const MESSAGES: Partial<Record<Idioma, Dict>> = { en, es };
