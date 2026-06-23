"use client";

// ──────────────────────────────────────────────────────────────────────────
// CONFIGURACIÓN · pestaña EQUIPO (Administración)
// CRUD de usuarios (invitar / cambiar rol / quitar) y MATRIZ DE PERMISOS
// editable que gobierna de verdad el acceso. Cada acción queda en auditoría.
// Solo accesible para el rol con permiso "usuarios".
// ──────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { toast } from "sonner";
import { ROLES, ROL_NOMBRE, col, mix } from "@/lib/constants";
import { PERMISOS_ORDEN } from "@/lib/permissions";
import { useT } from "@/lib/state/I18nProvider";
import { useAdmin } from "@/lib/state/AdminProvider";
import { useSession } from "@/lib/state/SessionProvider";
import type { Rol } from "@/lib/types";
import { SURFACE } from "../ui/Card";
import { Icon } from "../ui/Icon";
import { Button } from "../ui/Primitives";
import { Label } from "../ui/Typo";

const COLS: Rol[] = ["admin", "jefe", "tecnico", "operador", "lectura"];

export function EquipoBody() {
  const { usuarios, invitar, cambiarRol, quitar, registrar } = useAdmin();
  const { rol, matriz, togglePermiso, resetPermisos } = useSession();
  const t = useT();
  const actor = ROL_NOMBRE[rol];

  const [email, setEmail] = useState("");
  const [nuevoRol, setNuevoRol] = useState<Rol>("operador");

  function enviarInvitacion() {
    const e = email.trim();
    if (!e || !e.includes("@")) {
      toast.error(t("team.invalidEmail"));
      return;
    }
    invitar("", e, nuevoRol);
    registrar(actor, "Invitó a un usuario", `${e} como ${ROL_NOMBRE[nuevoRol]}`);
    toast(t("team.invitedToast", { email: e }));
    setEmail("");
  }

  return (
    <div className="space-y-6">
      {/* Invitar */}
      <div className={`${SURFACE} px-6 py-5`}>
        <Label>{t("team.invite")}</Label>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && enviarInvitacion()}
            placeholder={t("team.emailPlaceholder")}
            className="flex-1 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm outline-none focus:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800"
          />
          <select
            value={nuevoRol}
            onChange={(e) => setNuevoRol(e.target.value as Rol)}
            className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {t(`roles.${r}`)}
              </option>
            ))}
          </select>
          <Button onClick={enviarInvitacion} className="px-4 py-2">
            <Icon name="plus" className="h-4 w-4" />
            {t("team.inviteBtn")}
          </Button>
        </div>
      </div>

      {/* Usuarios */}
      <div className={`${SURFACE} overflow-hidden`}>
        <div className="border-b border-neutral-100 px-6 py-4 dark:border-neutral-800">
          <Label>{t("team.users")} · {usuarios.length}</Label>
        </div>
        {usuarios.map((u, i) => (
          <div key={u.id} className={`flex items-center gap-4 px-6 py-4 ${i === usuarios.length - 1 ? "" : "border-b border-neutral-100 dark:border-neutral-800"}`}>
            <div className="flex h-9 w-9 items-center justify-center rounded-full" style={{ background: mix(u.color), color: u.color }}>
              <Icon name="user" className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate text-sm font-medium">{u.n}</span>
                {u.estado === "invitado" && (
                  <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] uppercase tracking-wide text-neutral-500 dark:bg-neutral-800">
                    {t("team.invited")}
                  </span>
                )}
              </div>
              <div className="truncate text-xs text-neutral-400">{u.e}</div>
            </div>
            <select
              value={u.rolKey}
              onChange={(e) => {
                cambiarRol(u.id, e.target.value as Rol);
                registrar(actor, "Cambió un rol", `${u.e} → ${ROL_NOMBRE[e.target.value as Rol]}`);
              }}
              className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-xs dark:border-neutral-700 dark:bg-neutral-800"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {t(`roles.${r}`)}
                </option>
              ))}
            </select>
            <button
              onClick={() => {
                quitar(u.id);
                registrar(actor, "Quitó a un usuario", u.e);
                toast(t("team.userRemoved"));
              }}
              aria-label={t("team.removeUser")}
              className="rounded-lg p-1.5 text-neutral-400 transition-colors hover:text-neutral-700 dark:hover:text-neutral-200"
            >
              <Icon name="x" className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Matriz de permisos editable */}
      <div className={`${SURFACE} overflow-hidden`}>
        <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4 dark:border-neutral-800">
          <Label>{t("team.matrix")}</Label>
          <button
            onClick={() => {
              resetPermisos();
              registrar(actor, "Restauró permisos", "valores por defecto");
              toast(t("team.permsReset"));
            }}
            className="text-xs text-neutral-500 transition-colors hover:text-neutral-800 dark:hover:text-neutral-200"
          >
            {t("team.reset")}
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-100 text-xs uppercase tracking-wider text-neutral-400 dark:border-neutral-800">
                <th className="px-6 py-3 text-left font-medium">{t("team.permission")}</th>
                {COLS.map((c) => (
                  <th key={c} className="px-3 py-3 text-center font-medium">
                    {t(`rolesShort.${c}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERMISOS_ORDEN.map((permiso, i) => (
                <tr key={permiso} className={i === PERMISOS_ORDEN.length - 1 ? "" : "border-b border-neutral-100 dark:border-neutral-800"}>
                  <td className="px-6 py-3 text-neutral-600 dark:text-neutral-300">{t(`perm.${permiso}`)}</td>
                  {COLS.map((c) => {
                    const activo = matriz[permiso].includes(c);
                    return (
                      <td key={c} className="px-3 py-3 text-center">
                        <button
                          onClick={() => {
                            togglePermiso(permiso, c);
                            registrar(actor, activo ? "Quitó un permiso" : "Otorgó un permiso", `${t(`perm.${permiso}`)} · ${ROL_NOMBRE[c]}`);
                          }}
                          aria-label={`${activo ? t("team.revoke") : t("team.grant")} ${t(`perm.${permiso}`)} · ${t(`roles.${c}`)}`}
                          aria-pressed={activo}
                          className="mx-auto flex h-6 w-6 items-center justify-center rounded-md transition-colors"
                          style={activo ? { background: mix(col("ok"), 16), color: col("ok") } : undefined}
                        >
                          {activo ? <Icon name="check" className="h-4 w-4" /> : <span className="text-neutral-300 dark:text-neutral-600">—</span>}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
