"use client";

// ──────────────────────────────────────────────────────────────────────────
// BARRA DE NAVEGACIÓN (responsiva, adaptada por rol)
// Cada ítem aparece solo si el rol tiene acceso. Incluye notificaciones, tema
// y menú de cuenta (con selector de rol demo). Textos vía i18n.
// ──────────────────────────────────────────────────────────────────────────

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ROLES, col } from "@/lib/constants";
import { iniciales } from "@/lib/account";
import type { Permiso } from "@/lib/permissions";
import { useT } from "@/lib/state/I18nProvider";
import { useOrg } from "@/lib/state/OrgProvider";
import { useSession } from "@/lib/state/SessionProvider";
import { useTheme } from "@/lib/state/ThemeProvider";
import type { Rol } from "@/lib/types";
import { BrandMark } from "./account/BrandMark";
import { NotificationBell } from "./NotificationBell";
import { EVENTO_ABRIR_TOUR } from "./onboarding/WelcomeTour";
import { Icon, type IconName } from "./ui/Icon";

/** Reabre el tour de bienvenida (lo escucha WelcomeTour). */
function abrirTour() {
  window.dispatchEvent(new Event(EVENTO_ABRIR_TOUR));
}

interface NavItem {
  href: string;
  labelKey: string;
  icon: IconName;
  /** Permiso requerido para ver el ítem, o null si es libre. */
  permiso: Permiso | null;
}

const ITEMS: NavItem[] = [
  { href: "/", labelKey: "nav.command", icon: "gauge", permiso: null },
  { href: "/produccion", labelKey: "nav.production", icon: "chart", permiso: "produccion" },
  { href: "/reportes", labelKey: "nav.reports", icon: "report", permiso: "tendencia" },
  { href: "/alertas", labelKey: "nav.alerts", icon: "clipboard", permiso: null },
  { href: "/mantenimiento", labelKey: "nav.maintenance", icon: "tool", permiso: "mantenimiento" },
  { href: "/asistente", labelKey: "nav.assistant", icon: "spark", permiso: null },
  { href: "/configuracion", labelKey: "nav.settings", icon: "settings", permiso: null },
];

export function Nav() {
  const pathname = usePathname();
  const { rol, setRol, puede, cuenta, cerrarSesion } = useSession();
  const { dark, toggle } = useTheme();
  const t = useT();
  const [menuAbierto, setMenuAbierto] = useState(false);

  useEffect(() => {
    setMenuAbierto(false);
  }, [pathname]);

  const visibles = ITEMS.filter((i) => i.permiso === null || puede(i.permiso));
  const esActivo = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  function renderItem(item: NavItem, compacto: boolean) {
    const activo = esActivo(item.href);
    const estilo = activo ? { background: col("brand", dark), color: "#fff" } : undefined;
    const clases = compacto
      ? "flex shrink-0 items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors text-neutral-500 dark:text-neutral-400"
      : "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors text-neutral-600 dark:text-neutral-300";
    return (
      <Link key={item.href} href={item.href} className={clases} style={estilo}>
        <Icon name={item.icon} className="h-4 w-4 shrink-0" />
        <span className={compacto ? "hidden lg:inline" : ""}>{t(item.labelKey)}</span>
      </Link>
    );
  }

  const selectRol = <RoleSelect rol={rol} onRol={setRol} />;

  const botonTema = (
    <button
      onClick={toggle}
      aria-label={t("nav.toggleTheme")}
      className="rounded-lg border border-neutral-200 p-1.5 transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
    >
      <Icon name={dark ? "sun" : "moon"} className="h-4 w-4" />
    </button>
  );

  const menuCuenta = cuenta && <AccountMenu nombre={cuenta.nombre} email={cuenta.email} color={cuenta.color} rol={rol} onRol={setRol} onSalir={cerrarSesion} />;

  return (
    <nav className="sticky top-0 z-40 border-b border-neutral-200 bg-neutral-50/90 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/90">
      {/* Marca y controles no se encogen (shrink-0); la navegación ocupa el
          centro y se desplaza si hace falta, así nunca se solapa con la marca. */}
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-6 py-3 sm:px-8">
        {/* Izquierda: marca + planta activa (la planta solo en pantallas anchas) */}
        <div className="flex shrink-0 items-center gap-1">
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <BrandMark size={26} bg="#ffffff" className="ring-1 ring-neutral-200 dark:ring-neutral-700" />
            <span className="font-display text-lg tracking-tight">NEXIA</span>
          </Link>
          <span className="ml-1 hidden text-neutral-300 xl:inline dark:text-neutral-700">/</span>
          <div className="hidden xl:block">
            <OrgSwitcher />
          </div>
        </div>

        {/* Centro: navegación (ocupa el espacio; se desplaza si no cabe) */}
        <div className="no-scrollbar hidden min-w-0 flex-1 items-center justify-center gap-1 overflow-x-auto md:flex">
          {visibles.map((item) => renderItem(item, true))}
        </div>

        {/* Derecha: controles */}
        <div className="ml-auto flex shrink-0 items-center justify-end gap-2">
          <div className="hidden items-center gap-2 md:flex">
            <NotificationBell />
            {botonTema}
            {menuCuenta}
          </div>
          {/* Móvil */}
          <div className="flex items-center gap-2 md:hidden">
            <NotificationBell />
            {botonTema}
            <button
              onClick={() => setMenuAbierto((v) => !v)}
              aria-label={t("nav.openMenu")}
              aria-expanded={menuAbierto}
              className="rounded-lg border border-neutral-200 p-1.5 transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
            >
              <Icon name={menuAbierto ? "x" : "menu"} className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {menuAbierto && (
        <div className="border-t border-neutral-200 px-6 py-3 md:hidden dark:border-neutral-800">
          <div className="flex flex-col gap-1">{visibles.map((item) => renderItem(item, false))}</div>
          <div className="mt-3 border-t border-neutral-100 pt-3 dark:border-neutral-800">
            <label className="mb-1.5 block text-[11px] uppercase tracking-wider text-neutral-400">{t("nav.activePlant")}</label>
            <PlantaSelectMovil />
          </div>
          <div className="mt-3 border-t border-neutral-100 pt-3 dark:border-neutral-800">
            <label className="mb-1.5 block text-[11px] uppercase tracking-wider text-neutral-400">{t("nav.activeRole")}</label>
            {selectRol}
          </div>
          <button
            onClick={abrirTour}
            className="mt-3 flex w-full items-center gap-3 border-t border-neutral-100 pt-3 text-sm text-neutral-600 dark:border-neutral-800 dark:text-neutral-300"
          >
            <Icon name="spark" className="h-4 w-4" />
            {t("nav.tour")}
          </button>
          {cuenta && (
            <div className="mt-3 flex items-center gap-3 border-t border-neutral-100 pt-3 dark:border-neutral-800">
              <Link href="/cuenta" className="flex min-w-0 flex-1 items-center gap-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white" style={{ background: cuenta.color }}>
                  {iniciales(cuenta.nombre)}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">{cuenta.nombre}</span>
                  <span className="block truncate text-xs text-neutral-400">{t("nav.myProfile")}</span>
                </span>
              </Link>
              <button onClick={cerrarSesion} aria-label={t("nav.signOut")} className="rounded-lg border border-neutral-200 p-1.5 text-neutral-500 dark:border-neutral-700">
                <Icon name="logout" className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}

/** Selector de rol (demo), con nombres de rol traducidos. */
function RoleSelect({ rol, onRol }: { rol: Rol; onRol: (r: Rol) => void }) {
  const t = useT();
  return (
    <select
      value={rol}
      onChange={(e) => onRol(e.target.value as Rol)}
      className="w-full rounded-lg border border-neutral-200 bg-white px-2 py-1.5 text-sm text-neutral-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300"
    >
      {ROLES.map((r) => (
        <option key={r} value={r}>
          {t(`roles.${r}`)}
        </option>
      ))}
    </select>
  );
}

/** Selector de planta activa (escritorio): breadcrumb desplegable. */
function OrgSwitcher() {
  const { plantas, plantaActiva, setPlantaActiva } = useOrg();
  const t = useT();
  const [abierto, setAbierto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => setAbierto(false), [pathname]);
  useEffect(() => {
    if (!abierto) return;
    function fuera(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setAbierto(false);
    }
    document.addEventListener("mousedown", fuera);
    return () => document.removeEventListener("mousedown", fuera);
  }, [abierto]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setAbierto((v) => !v)}
        aria-label={t("nav.switchPlant")}
        aria-expanded={abierto}
        className="flex max-w-[12rem] items-center gap-1.5 rounded-lg px-2 py-1 text-sm text-neutral-600 transition-colors hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
      >
        <span className="truncate font-medium">{plantaActiva.nombre}</span>
        <Icon name="chart" className="h-3 w-3 rotate-90 text-neutral-400" />
      </button>

      {abierto && (
        <div className="absolute left-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-lg dark:border-neutral-800 dark:bg-neutral-900">
          <div className="px-3 pb-1 pt-2.5 text-[10px] uppercase tracking-[0.14em] text-neutral-400">{t("nav.plants")}</div>
          {plantas.map((p) => {
            const activa = p.id === plantaActiva.id;
            return (
              <button
                key={p.id}
                onClick={() => {
                  setPlantaActiva(p.id);
                  setAbierto(false);
                }}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800"
              >
                <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: activa ? col("ok") : "transparent", outline: activa ? "none" : "1px solid #cbd5e1" }} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate">{p.nombre}</span>
                  <span className="block truncate text-xs text-neutral-400">{p.ubicacion}</span>
                </span>
                {activa && <Icon name="check" className="h-3.5 w-3.5" style={{ color: col("ok") }} />}
              </button>
            );
          })}
          <Link href="/configuracion" className="block border-t border-neutral-100 px-3 py-2.5 text-xs text-neutral-500 transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-800">
            {t("nav.managePlants")}
          </Link>
        </div>
      )}
    </div>
  );
}

/** Selector de planta nativo para el menú móvil. */
function PlantaSelectMovil() {
  const { plantas, plantaActivaId, setPlantaActiva } = useOrg();
  return (
    <select
      value={plantaActivaId}
      onChange={(e) => setPlantaActiva(e.target.value)}
      className="w-full rounded-lg border border-neutral-200 bg-white px-2 py-1.5 text-sm text-neutral-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300"
    >
      {plantas.map((p) => (
        <option key={p.id} value={p.id}>
          {p.nombre}
        </option>
      ))}
    </select>
  );
}

/** Avatar con menú desplegable: perfil, rol (demo) y cierre de sesión (escritorio). */
function AccountMenu({ nombre, email, color, rol, onRol, onSalir }: { nombre: string; email: string; color: string; rol: Rol; onRol: (r: Rol) => void; onSalir: () => void }) {
  const t = useT();
  const [abierto, setAbierto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => setAbierto(false), [pathname]);

  useEffect(() => {
    if (!abierto) return;
    function fuera(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setAbierto(false);
    }
    document.addEventListener("mousedown", fuera);
    return () => document.removeEventListener("mousedown", fuera);
  }, [abierto]);

  return (
    <div ref={ref} className="relative ml-0.5">
      <button
        onClick={() => setAbierto((v) => !v)}
        aria-label={t("nav.account")}
        aria-expanded={abierto}
        className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold text-white"
        style={{ background: color }}
      >
        {iniciales(nombre)}
      </button>

      {abierto && (
        <div className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-lg dark:border-neutral-800 dark:bg-neutral-900">
          <div className="border-b border-neutral-100 px-4 py-3 dark:border-neutral-800">
            <div className="truncate text-sm font-medium">{nombre}</div>
            <div className="truncate text-xs text-neutral-400">{email}</div>
          </div>
          <div className="border-b border-neutral-100 px-4 py-3 dark:border-neutral-800">
            <label className="mb-1.5 block text-[10px] uppercase tracking-[0.14em] text-neutral-400">{t("nav.viewAsRole")}</label>
            <RoleSelect rol={rol} onRol={onRol} />
          </div>
          <button
            onClick={() => {
              setAbierto(false);
              abrirTour();
            }}
            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-neutral-600 transition-colors hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-800"
          >
            <Icon name="spark" className="h-4 w-4" />
            {t("nav.tour")}
          </button>
          <Link href="/cuenta" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-neutral-600 transition-colors hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-800">
            <Icon name="user" className="h-4 w-4" />
            {t("nav.myProfile")}
          </Link>
          <button
            onClick={() => {
              setAbierto(false);
              onSalir();
            }}
            className="flex w-full items-center gap-2.5 border-t border-neutral-100 px-4 py-2.5 text-sm text-neutral-600 transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-800"
          >
            <Icon name="logout" className="h-4 w-4" />
            {t("nav.signOut")}
          </button>
        </div>
      )}
    </div>
  );
}
