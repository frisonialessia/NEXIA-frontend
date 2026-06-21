"use client";

// ──────────────────────────────────────────────────────────────────────────
// VISTA · CUENTA / PERFIL
// Identidad de quien inició sesión: avatar, nombre y correo (editables),
// rol asignado (de solo lectura: lo cambia el admin), preferencias, seguridad
// (cambio de contraseña simulado) y cierre de sesión.
// ──────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { toast } from "sonner";
import { iniciales } from "@/lib/account";
import { useT } from "@/lib/state/I18nProvider";
import { useAdmin } from "@/lib/state/AdminProvider";
import { useSession } from "@/lib/state/SessionProvider";
import { useTheme } from "@/lib/state/ThemeProvider";
import { Card } from "../ui/Card";
import { Icon } from "../ui/Icon";
import { Button } from "../ui/Primitives";
import { Label } from "../ui/Typo";
import { LanguageRow } from "../config/LanguageRow";

export function ProfileBody() {
  const { cuenta, actualizarPerfil, cerrarSesion, rol } = useSession();
  const { registrar } = useAdmin();
  const { dark, toggle } = useTheme();
  const t = useT();

  const [nombre, setNombre] = useState(cuenta?.nombre ?? "");
  const [email, setEmail] = useState(cuenta?.email ?? "");

  if (!cuenta) return null;

  const input =
    "w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm outline-none focus:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800";
  const cambiado = nombre.trim() !== cuenta.nombre || email.trim() !== cuenta.email;

  function guardar() {
    if (!nombre.trim()) {
      toast.error(t("prof.nameRequired"));
      return;
    }
    actualizarPerfil({ nombre: nombre.trim(), email: email.trim() });
    registrar(nombre.trim(), "Actualizó su perfil", email.trim());
    toast(t("prof.savedToast"));
  }

  function salir() {
    registrar(cuenta!.nombre, "Cerró sesión", "");
    cerrarSesion();
    toast(t("prof.sessionClosed"));
  }

  return (
    <main className="fade-in px-6 py-8 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6">
          <span className="text-xs uppercase tracking-[0.18em] text-neutral-400">{t("prof.account")}</span>
          <h1 className="mt-2 font-display text-3xl tracking-tight">{t("prof.title")}</h1>
        </header>

        <div className="space-y-4">
          {/* Cabecera de identidad */}
          <Card className="flex items-center gap-4 px-7 py-6">
            <span
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-xl font-semibold text-white"
              style={{ background: cuenta.color }}
            >
              {iniciales(cuenta.nombre)}
            </span>
            <div className="min-w-0">
              <div className="truncate text-lg font-medium">{cuenta.nombre}</div>
              <div className="truncate text-sm text-neutral-400">{cuenta.email}</div>
              <span className="mt-1.5 inline-flex items-center rounded-full bg-neutral-100 px-2.5 py-0.5 text-[11px] font-medium text-neutral-500 dark:bg-neutral-800 dark:text-neutral-300">
                {t(`roles.${rol}`)}
              </span>
            </div>
          </Card>

          {/* Datos editables */}
          <Card className="px-7 py-6">
            <Label>{t("prof.personalData")}</Label>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-xs font-medium uppercase tracking-[0.14em] text-neutral-400">{t("prof.name")}</span>
                <input value={nombre} onChange={(e) => setNombre(e.target.value)} className={input} />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium uppercase tracking-[0.14em] text-neutral-400">{t("prof.email")}</span>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={input} />
              </label>
            </div>
            <div className="mt-4 flex justify-end">
              <Button onClick={guardar} disabled={!cambiado}>
                {t("set.save")}
              </Button>
            </div>
          </Card>

          {/* Preferencias */}
          <Card className="px-7 py-6">
            <Label>{t("set.preferences")}</Label>
            <div className="mt-4 space-y-4">
              <LanguageRow />
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm">{t("set.darkTheme")}</div>
                  <div className="text-xs text-neutral-400">{t("set.darkDesc")}</div>
                </div>
                <button onClick={toggle} className="rounded-lg border border-neutral-200 px-3 py-1.5 text-sm dark:border-neutral-700">
                  {dark ? t("prof.toLight") : t("prof.toDark")}
                </button>
              </div>
            </div>
          </Card>

          {/* Seguridad (simulada) */}
          <Seguridad />

          {/* Cerrar sesión */}
          <Card className="flex items-center justify-between px-7 py-5">
            <div>
              <div className="text-sm font-medium">{t("nav.signOut")}</div>
              <div className="text-xs text-neutral-400">{t("prof.signOutDesc")}</div>
            </div>
            <Button variant="secondary" onClick={salir}>
              <Icon name="logout" className="h-4 w-4" />
              {t("nav.signOut")}
            </Button>
          </Card>
        </div>
      </div>
    </main>
  );
}

function Seguridad() {
  const t = useT();
  const [actual, setActual] = useState("");
  const [nueva, setNueva] = useState("");
  const [repetir, setRepetir] = useState("");
  const input =
    "w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm outline-none focus:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800";

  function cambiar() {
    if (!actual || !nueva) {
      toast.error(t("prof.passIncomplete"));
      return;
    }
    if (nueva !== repetir) {
      toast.error(t("prof.passMismatch"));
      return;
    }
    setActual("");
    setNueva("");
    setRepetir("");
    toast(t("prof.passToast"));
  }

  return (
    <Card className="px-7 py-6">
      <Label>{t("prof.security")}</Label>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <label className="block">
          <span className="mb-1 block text-xs font-medium uppercase tracking-[0.14em] text-neutral-400">{t("prof.current")}</span>
          <input type="password" value={actual} onChange={(e) => setActual(e.target.value)} className={input} />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium uppercase tracking-[0.14em] text-neutral-400">{t("prof.new")}</span>
          <input type="password" value={nueva} onChange={(e) => setNueva(e.target.value)} className={input} />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium uppercase tracking-[0.14em] text-neutral-400">{t("prof.repeat")}</span>
          <input type="password" value={repetir} onChange={(e) => setRepetir(e.target.value)} className={input} />
        </label>
      </div>
      <div className="mt-4 flex justify-end">
        <Button variant="secondary" onClick={cambiar}>
          {t("prof.updatePassword")}
        </Button>
      </div>
    </Card>
  );
}
