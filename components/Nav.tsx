"use client";

// ──────────────────────────────────────────────────────────────────────────
// BARRA DE NAVEGACIÓN (responsiva, adaptada por rol)
// Menú consolidado a 5: Mando · Producción · Alertas · Asistente · Configuración.
// Cada ítem aparece solo si el rol tiene acceso. Incluye notificaciones,
// selector de rol y toggle de tema. Escritorio en fila; móvil con hamburguesa.
// ──────────────────────────────────────────────────────────────────────────

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ROLES, ROL_NOMBRE, col } from "@/lib/constants";
import { iniciales } from "@/lib/account";
import type { Permiso } from "@/lib/permissions";
import { useSession } from "@/lib/state/SessionProvider";
import { useTheme } from "@/lib/state/ThemeProvider";
import type { Rol } from "@/lib/types";
import { NotificationBell } from "./NotificationBell";
import { Icon, type IconName } from "./ui/Icon";

interface NavItem {
  href: string;
  label: string;
  icon: IconName;
  /** Permiso requerido para ver el ítem, o null si es libre. */
  permiso: Permiso | null;
}

const ITEMS: NavItem[] = [
  { href: "/", label: "Mando", icon: "gauge", permiso: null },
  { href: "/produccion", label: "Producción", icon: "chart", permiso: "produccion" },
  { href: "/reportes", label: "Reportes", icon: "report", permiso: "tendencia" },
  { href: "/alertas", label: "Alertas", icon: "clipboard", permiso: null },
  { href: "/mantenimiento", label: "Mantenimiento", icon: "tool", permiso: "mantenimiento" },
  { href: "/asistente", label: "Asistente", icon: "spark", permiso: null },
  { href: "/configuracion", label: "Configuración", icon: "settings", permiso: null },
];

export function Nav() {
  const pathname = usePathname();
  const { rol, setRol, puede, cuenta, cerrarSesion } = useSession();
  const { dark, toggle } = useTheme();
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
      ? "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 transition-colors text-neutral-500 dark:text-neutral-400"
      : "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors text-neutral-600 dark:text-neutral-300";
    return (
      <Link key={item.href} href={item.href} className={clases} style={estilo}>
        <Icon name={item.icon} className="h-4 w-4" />
        <span className={compacto ? "hidden lg:inline" : ""}>{item.label}</span>
      </Link>
    );
  }

  const selectRol = (
    <select
      value={rol}
      onChange={(e) => setRol(e.target.value as Rol)}
      className="rounded-lg border border-neutral-200 bg-white px-2 py-1.5 text-xs text-neutral-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300"
    >
      {ROLES.map((r) => (
        <option key={r} value={r}>
          {ROL_NOMBRE[r]}
        </option>
      ))}
    </select>
  );

  const botonTema = (
    <button
      onClick={toggle}
      aria-label="Cambiar tema"
      className="rounded-lg border border-neutral-200 p-1.5 transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
    >
      <Icon name={dark ? "sun" : "moon"} className="h-4 w-4" />
    </button>
  );

  const menuCuenta = cuenta && <AccountMenu nombre={cuenta.nombre} email={cuenta.email} color={cuenta.color} onSalir={cerrarSesion} />;

  return (
    <nav className="sticky top-0 z-40 border-b border-neutral-200 bg-neutral-50/90 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/90">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3 sm:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="ping-soft absolute inline-flex h-full w-full rounded-full" style={{ background: col("ok") }} />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full" style={{ background: col("ok") }} />
          </span>
          <span className="font-serif text-lg tracking-tight">NEXIA</span>
        </Link>

        {/* Escritorio */}
        <div className="hidden items-center gap-0.5 text-sm md:flex">
          {visibles.map((item) => renderItem(item, true))}
          <div className="mx-1.5 h-5 w-px bg-neutral-200 dark:bg-neutral-700" />
          <NotificationBell />
          {selectRol}
          {botonTema}
          {menuCuenta}
        </div>

        {/* Móvil */}
        <div className="flex items-center gap-2 md:hidden">
          <NotificationBell />
          {botonTema}
          <button
            onClick={() => setMenuAbierto((v) => !v)}
            aria-label="Abrir menú"
            aria-expanded={menuAbierto}
            className="rounded-lg border border-neutral-200 p-1.5 transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
          >
            <Icon name={menuAbierto ? "x" : "menu"} className="h-4 w-4" />
          </button>
        </div>
      </div>

      {menuAbierto && (
        <div className="border-t border-neutral-200 px-6 py-3 md:hidden dark:border-neutral-800">
          <div className="flex flex-col gap-1">{visibles.map((item) => renderItem(item, false))}</div>
          <div className="mt-3 border-t border-neutral-100 pt-3 dark:border-neutral-800">
            <label className="mb-1.5 block text-[11px] uppercase tracking-wider text-neutral-400">Rol activo</label>
            {selectRol}
          </div>
          {cuenta && (
            <div className="mt-3 flex items-center gap-3 border-t border-neutral-100 pt-3 dark:border-neutral-800">
              <Link href="/cuenta" className="flex min-w-0 flex-1 items-center gap-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white" style={{ background: cuenta.color }}>
                  {iniciales(cuenta.nombre)}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">{cuenta.nombre}</span>
                  <span className="block truncate text-xs text-neutral-400">Mi perfil</span>
                </span>
              </Link>
              <button onClick={cerrarSesion} aria-label="Cerrar sesión" className="rounded-lg border border-neutral-200 p-1.5 text-neutral-500 dark:border-neutral-700">
                <Icon name="logout" className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}

/** Avatar con menú desplegable: perfil y cierre de sesión (escritorio). */
function AccountMenu({ nombre, email, color, onSalir }: { nombre: string; email: string; color: string; onSalir: () => void }) {
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
        aria-label="Cuenta"
        aria-expanded={abierto}
        className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold text-white"
        style={{ background: color }}
      >
        {iniciales(nombre)}
      </button>

      {abierto && (
        <div className="absolute right-0 top-full z-50 mt-2 w-60 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-lg dark:border-neutral-800 dark:bg-neutral-900">
          <div className="border-b border-neutral-100 px-4 py-3 dark:border-neutral-800">
            <div className="truncate text-sm font-medium">{nombre}</div>
            <div className="truncate text-xs text-neutral-400">{email}</div>
          </div>
          <Link href="/cuenta" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-neutral-600 transition-colors hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-800">
            <Icon name="user" className="h-4 w-4" />
            Mi perfil
          </Link>
          <button
            onClick={() => {
              setAbierto(false);
              onSalir();
            }}
            className="flex w-full items-center gap-2.5 border-t border-neutral-100 px-4 py-2.5 text-sm text-neutral-600 transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-800"
          >
            <Icon name="logout" className="h-4 w-4" />
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}
