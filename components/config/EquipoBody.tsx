"use client";

// ──────────────────────────────────────────────────────────────────────────
// CONFIGURACIÓN · pestaña EQUIPO (cuerpo)
// Gestión de usuarios y matriz de permisos por rol. El acceso lo controla la
// página de Configuración (solo Administrador).
// ──────────────────────────────────────────────────────────────────────────

import { MATRIZ_PERMISOS, ROL_NOMBRE, col, mix } from "@/lib/constants";
import { USUARIOS } from "@/lib/data/team";
import { useTheme } from "@/lib/state/ThemeProvider";
import { SURFACE } from "../ui/Card";
import { Icon } from "../ui/Icon";
import { Label } from "../ui/Typo";

const COLUMNAS = ["Admin", "Jefe", "Técnico", "Operador", "Lectura"];

export function EquipoBody() {
  const { dark } = useTheme();

  const usuarios = USUARIOS;
  const roles = Object.values(ROL_NOMBRE);

  return (
    <div className="space-y-6">
      <div className={`${SURFACE} overflow-hidden`}>
        <div className="border-b border-neutral-100 px-6 py-4 dark:border-neutral-800">
          <Label>Usuarios</Label>
        </div>
        {usuarios.map((u, i) => (
          <div key={u.e} className={`flex items-center gap-4 px-6 py-4 ${i === usuarios.length - 1 ? "" : "border-b border-neutral-100 dark:border-neutral-800"}`}>
            <div className="flex h-9 w-9 items-center justify-center rounded-full" style={{ background: mix(u.color), color: u.color }}>
              <Icon name="user" className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium">{u.n}</div>
              <div className="text-xs text-neutral-400">{u.e}</div>
            </div>
            <select defaultValue={u.rol} className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-xs dark:border-neutral-700 dark:bg-neutral-800">
              {roles.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </div>
        ))}
      </div>

      <div className={`${SURFACE} overflow-hidden`}>
        <div className="border-b border-neutral-100 px-6 py-4 dark:border-neutral-800">
          <Label>Matriz de permisos por rol</Label>
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
                      {x ? <Icon name="check" className="mx-auto h-4 w-4" style={{ color: col("ok", dark) }} /> : <span className="text-neutral-300 dark:text-neutral-600">—</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
