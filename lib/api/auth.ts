// ──────────────────────────────────────────────────────────────────────────
// AUTENTICACIÓN · el "seam" del login (igual idea que la capa de datos)
// Hoy: login SIMULADO (resuelve la cuenta por correo, sin contraseña real).
// Mañana: si NEXT_PUBLIC_AUTH=remote, hace POST /v1/auth/login al backend.
//
// ⚠️  El login remoto va detrás de una variable SEPARADA (NEXT_PUBLIC_AUTH), no
//    de NEXT_PUBLIC_API_URL. Así, aunque los datos ya vengan del backend, el
//    login sigue simulado hasta que el backend tenga /auth/login (FASE 2). Esto
//    evita romper la app desplegada mientras tanto.
// ──────────────────────────────────────────────────────────────────────────

import { resolverCuenta, type Cuenta } from "../account";
import type { Rol } from "../types";
import { apiBase, apiConfigurada } from "./contract";

const TOKEN_KEY = "nexia-token";

/** ¿El login debe ir al backend real? (requiere API y el flag de auth). */
export function authRemota(): boolean {
  return apiConfigurada() && process.env.NEXT_PUBLIC_AUTH === "remote";
}

// ── Token de sesión ─────────────────────────────────────────────────────────
export function guardarToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    /* almacenamiento no disponible */
  }
}
export function limpiarToken(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

// ── Contrato de /auth/login (lo implementará el backend en la FASE 2) ────────
export const RUTA_LOGIN = "/v1/auth/login";

export interface LoginReq {
  email: string;
  password: string;
}

/** Respuesta del backend: token + usuario de la organización. */
export interface LoginResp {
  token: string;
  usuario: {
    nombre: string;
    email: string;
    rol: Rol;
    color?: string;
  };
}

// ── API pública del seam ─────────────────────────────────────────────────────

/**
 * Inicia sesión. En modo remoto valida contra el backend y guarda el token;
 * en modo simulado resuelve la cuenta por correo (demo). Lanza Error si falla.
 */
export async function login(email: string, password: string): Promise<Cuenta> {
  if (authRemota()) {
    const r = await fetch(apiBase() + RUTA_LOGIN, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password } satisfies LoginReq),
    });
    if (!r.ok) throw new Error(r.status === 401 ? "credenciales" : "red");
    const data = (await r.json()) as LoginResp;
    guardarToken(data.token);
    return {
      nombre: data.usuario.nombre,
      email: data.usuario.email,
      rol: data.usuario.rol,
      color: data.usuario.color ?? "#3b82f6",
    };
  }

  // Modo demo: sin backend de auth. Token simbólico para mantener la firma.
  guardarToken("demo");
  return resolverCuenta(email);
}

/** Cierra la sesión (limpia el token; en remoto podría avisar al backend). */
export function logout(): void {
  limpiarToken();
}
