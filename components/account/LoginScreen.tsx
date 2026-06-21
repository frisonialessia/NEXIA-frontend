"use client";

// ──────────────────────────────────────────────────────────────────────────
// PANTALLA DE ACCESO (la "puerta" del producto)
// Modo demo: el acceso no valida contraseña; resuelve la cuenta por correo
// contra la semilla del equipo. Cuentas de demostración para entrar en un clic.
// ──────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { toast } from "sonner";
import { col } from "@/lib/constants";
import { USUARIOS } from "@/lib/data/team";
import { iniciales } from "@/lib/account";
import { useT } from "@/lib/state/I18nProvider";
import { useSession } from "@/lib/state/SessionProvider";
import { useTheme } from "@/lib/state/ThemeProvider";
import { Icon } from "../ui/Icon";
import { Button } from "../ui/Primitives";
import { BrandMark } from "./BrandMark";

export function LoginScreen() {
  const { iniciarSesion } = useSession();
  const { dark, toggle } = useTheme();
  const t = useT();
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");

  function entrar(e?: React.FormEvent) {
    e?.preventDefault();
    if (!email.trim()) {
      toast.error(t("login.emailRequired"));
      return;
    }
    iniciarSesion(email);
  }

  const input =
    "w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-900 dark:focus:border-neutral-500";

  return (
    <div className="relative flex min-h-screen items-center justify-center px-5 py-10">
      <button
        onClick={toggle}
        aria-label="Cambiar tema"
        className="absolute right-5 top-5 rounded-lg border border-neutral-200 p-1.5 text-neutral-500 transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
      >
        <Icon name={dark ? "sun" : "moon"} className="h-4 w-4" />
      </button>

      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <BrandMark size={52} />
          <h1 className="mt-4 font-display text-3xl tracking-tight">NEXIA</h1>
          <p className="mt-1 text-sm text-neutral-500">{t("login.tagline")}</p>
        </div>

        <form
          onSubmit={entrar}
          className="rounded-2xl bg-white p-7 ring-1 ring-neutral-200/70 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_12px_28px_-14px_rgba(16,24,40,0.14)] dark:bg-neutral-900 dark:ring-neutral-800 dark:shadow-none"
        >
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-[0.14em] text-neutral-400">{t("login.email")}</span>
            <input
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("login.emailPlaceholder")}
              className={input}
            />
          </label>

          <label className="mt-4 block">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-[0.14em] text-neutral-400">{t("login.password")}</span>
            <input
              type="password"
              autoComplete="current-password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              placeholder="••••••••"
              className={input}
            />
          </label>

          <Button type="submit" className="mt-6 w-full py-3">
            {t("login.enter")}
          </Button>

          <p className="mt-3 text-center text-xs text-neutral-400">
            {t("login.noPassword")}
          </p>
        </form>

        <div className="mt-7">
          <div className="mb-3 flex items-center gap-3">
            <div className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
            <span className="text-[11px] uppercase tracking-[0.14em] text-neutral-400">{t("login.demoAccounts")}</span>
            <div className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
          </div>
          <div className="space-y-1.5">
            {USUARIOS.map((u) => (
              <button
                key={u.id}
                onClick={() => iniciarSesion(u.e)}
                className="flex w-full items-center gap-3 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-left transition-colors hover:border-neutral-300 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:bg-neutral-800"
              >
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
                  style={{ background: u.color }}
                >
                  {iniciales(u.n)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{u.n}</span>
                  <span className="block truncate text-xs text-neutral-400">{t(`roles.${u.rolKey}`)}</span>
                </span>
                <Icon name="logout" className="h-4 w-4 rotate-180 text-neutral-300 dark:text-neutral-600" style={{ color: col("brand", dark) }} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
