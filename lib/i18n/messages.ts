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
};

export const MESSAGES: Partial<Record<Idioma, Dict>> = { en, es };
