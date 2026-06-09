"use client";

// ──────────────────────────────────────────────────────────────────────────
// VISTA 8 · ADMIN (solo Administrador)
// Gestión de usuarios y matriz de permisos por rol. Vista protegida. Portado
// de renderAdmin() de la demo.
// ──────────────────────────────────────────────────────────────────────────

import { MATRIZ_PERMISOS, ROL_NOMBRE, col } from "@/lib/constants";
import { useSession } from "@/lib/state/SessionProvider";
import { useTheme } from "@/lib/state/ThemeProvider";
import { AccessDenied } from "./AccessDenied";
import { Icon } from "./ui/Icon";

const COLUMNAS = ["Admin", "Jefe", "Técnico", "Operador", "Lectura"];

export function Admin() {
  const { puedeVer } = useSession();
  const { dark } = useTheme();

  if (!puedeVer("admin")) {
    return <AccessDenied mensaje="Esta sección es exclusiva del rol Administrador." />;
  }

  const usuarios = [
    { n: "Alessia Frisoni", e: "alessia@planta.com", rol: ROL_NOMBRE.admin, c: col("brand", dark) },
    { n: "Carlos Méndez", e: "carlos@planta.com", rol: ROL_NOMBRE.jefe, c: col("warn", dark) },
    { n: "Roberto Salas", e: "roberto@planta.com", rol: ROL_NOMBRE.tecnico, c: col("crit", dark) },
    { n: "Luis Ortega", e: "luis@planta.com", rol: ROL_NOMBRE.operador, c: col("ok", dark) },
    { n: "Auditoría Externa", e: "audit@planta.com", rol: ROL_NOMBRE.lectura, c: col("gray", dark) },
  ];
  const roles = Object.values(ROL_NOMBRE);

  return (
    <main className="fade-in px-6 py-8 sm:px-8">
      <div className="mx-auto max-w-4xl">
        <header className="mb-6">
          <div className="flex items-center gap-2">
            <Icon name="shield" className="h-4 w-4" style={{ color: col("brand", dark) }} />
            <span className="text-xs uppercase tracking-[0.18em] text-neutral-400">Solo administradores</span>
          </div>
          <h1 className="mt-2 font-serif text-3xl tracking-tight">Gestión de permisos</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-neutral-500">
            Controla qué puede ver y hacer cada rol. Los cambios aplican a todos los usuarios con ese rol.
          </p>
        </header>

        {/* Usuarios */}
        <div className="mb-6 rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
          <div className="border-b border-neutral-100 px-6 py-4 dark:border-neutral-800">
            <h3 className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">Usuarios</h3>
          </div>
          {usuarios.map((u, i) => (
            <div
              key={u.e}
              className={`flex items-center gap-4 px-6 py-4 ${
                i === usuarios.length - 1 ? "" : "border-b border-neutral-100 dark:border-neutral-800"
              }`}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full" style={{ background: `${u.c}1a`, color: u.c }}>
                <Icon name="user" className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium">{u.n}</div>
                <div className="text-xs text-neutral-400">{u.e}</div>
              </div>
              <select
                defaultValue={u.rol}
                className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-xs dark:border-neutral-700 dark:bg-neutral-800"
              >
                {roles.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </div>
          ))}
        </div>

        {/* Matriz de permisos */}
        <div className="rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
          <div className="border-b border-neutral-100 px-6 py-4 dark:border-neutral-800">
            <h3 className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">Matriz de permisos por rol</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-100 text-xs uppercase tracking-wider text-neutral-400 dark:border-neutral-800">
                  <th className="px-6 py-3 text-left font-medium">Permiso</th>
                  {COLUMNAS.map((t) => (
                    <th key={t} className="px-3 py-3 text-center font-medium">
                      {t}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MATRIZ_PERMISOS.map((p, i) => (
                  <tr key={p.f} className={i === MATRIZ_PERMISOS.length - 1 ? "" : "border-b border-neutral-100 dark:border-neutral-800"}>
                    <td className="px-6 py-3 text-neutral-600 dark:text-neutral-300">{p.f}</td>
                    {p.v.map((x, j) => (
                      <td key={j} className="px-3 py-3 text-center">
                        {x ? (
                          <Icon name="check" className="mx-auto h-4 w-4" style={{ color: col("ok", dark) }} />
                        ) : (
                          <span className="text-neutral-300 dark:text-neutral-600">—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
