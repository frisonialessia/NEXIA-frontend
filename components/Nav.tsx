"use client";

// ──────────────────────────────────────────────────────────────────────────
// BARRA DE NAVEGACIÓN (responsiva)
// Escritorio: enlaces en fila + selector de rol + toggle de tema.
// Móvil: marca + tema + botón hamburguesa que abre un panel con las vistas.
// El control de acceso se refleja igual en ambos: Admin se oculta si no eres
// administrador; Producción y Conectar se atenúan y avisan si no hay permiso.
// ──────────────────────────────────────────────────────────────────────────

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ROLES, ROL_NOMBRE, col, ACCESO_VISTA } from "@/lib/constants";
import { useSession } from "@/lib/state/SessionProvider";
import { useTheme } from "@/lib/state/ThemeProvider";
import type { Rol } from "@/lib/types";
import { Icon, type IconName } from "./ui/Icon";

interface NavItem {
  href: string;
  label: string;
  icon: IconName;
  acceso: keyof typeof ACCESO_VISTA | null;
}

const ITEMS: NavItem[] = [
  { href: "/", label: "Mando", icon: "gauge", acceso: null },
  { href: "/produccion", label: "Producción", icon: "chart", acceso: "produccion" },
  { href: "/auditoria", label: "Auditoría", icon: "clipboard", acceso: null },
  { href: "/historial", label: "Historial", icon: "history", acceso: null },
  { href: "/asistente", label: "Asistente", icon: "spark", acceso: null },
  { href: "/conectar", label: "Conectar", icon: "plug", acceso: "conectar" },
  { href: "/ajustes", label: "Ajustes", icon: "settings", acceso: null },
  { href: "/admin", label: "Admin", icon: "shield", acceso: "admin" },
];

const MENSAJE_BLOQUEO: Record<keyof typeof ACCESO_VISTA, string> = {
  produccion: "La vista de Producción requiere otro rol",
  conectar: "Conexiones: requiere rol Admin o Técnico",
  admin: "Solo los administradores acceden aquí",
};

export function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const { rol, setRol, puedeVer } = useSession();
  const { dark, toggle } = useTheme();
  const [menuAbierto, setMenuAbierto] = useState(false);

  // Cierra el menú móvil al navegar.
  useEffect(() => {
    setMenuAbierto(false);
  }, [pathname]);

  const esActivo = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  function cambiarRol(nuevo: Rol) {
    setRol(nuevo);
    const item = ITEMS.find((i) => esActivo(i.href));
    if (item?.acceso && !ACCESO_VISTA[item.acceso].includes(nuevo)) {
      router.push("/");
    }
  }

  // Renderiza un enlace de vista. `compacto` = barra de escritorio (label oculto
  // hasta lg); si no, panel móvil con icono + etiqueta siempre visibles.
  function renderItem(item: NavItem, compacto: boolean) {
    const bloqueada = item.acceso !== null && !puedeVer(item.acceso);
    if (item.acceso === "admin" && bloqueada) return null;

    const activo = esActivo(item.href);
    const estilo = activo ? { background: col("brand", dark), color: "#fff" } : undefined;
    const clases = compacto
      ? "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 transition-colors text-neutral-500 dark:text-neutral-400"
      : "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors text-neutral-600 dark:text-neutral-300";

    const contenido = (
      <>
        <Icon name={item.icon} className="h-4 w-4" />
        <span className={compacto ? "hidden lg:inline" : ""}>{item.label}</span>
      </>
    );

    if (bloqueada) {
      return (
        <button
          key={item.href}
          onClick={() => toast(MENSAJE_BLOQUEO[item.acceso as keyof typeof ACCESO_VISTA])}
          title="Requiere otro rol"
          className={clases}
          style={{ opacity: 0.4 }}
        >
          {contenido}
        </button>
      );
    }

    return (
      <Link key={item.href} href={item.href} className={clases} style={estilo}>
        {contenido}
      </Link>
    );
  }

  const selectRol = (
    <select
      value={rol}
      onChange={(e) => cambiarRol(e.target.value as Rol)}
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

  return (
    <nav className="sticky top-0 z-40 border-b border-neutral-200 bg-neutral-50/90 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/90">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3 sm:px-8">
        {/* Marca */}
        <Link href="/" className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="ping-soft absolute inline-flex h-full w-full rounded-full" style={{ background: "#10b981" }} />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full" style={{ background: "#10b981" }} />
          </span>
          <span className="font-serif text-lg tracking-tight">NEXIA</span>
        </Link>

        {/* Escritorio */}
        <div className="hidden items-center gap-0.5 text-sm md:flex">
          {ITEMS.map((item) => renderItem(item, true))}
          <div className="mx-1.5 h-5 w-px bg-neutral-200 dark:bg-neutral-700" />
          {selectRol}
          {botonTema}
        </div>

        {/* Móvil: tema + hamburguesa */}
        <div className="flex items-center gap-2 md:hidden">
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

      {/* Panel móvil desplegable */}
      {menuAbierto && (
        <div className="border-t border-neutral-200 px-6 py-3 md:hidden dark:border-neutral-800">
          <div className="flex flex-col gap-1">{ITEMS.map((item) => renderItem(item, false))}</div>
          <div className="mt-3 border-t border-neutral-100 pt-3 dark:border-neutral-800">
            <label className="mb-1.5 block text-[11px] uppercase tracking-wider text-neutral-400">Rol activo</label>
            {selectRol}
          </div>
        </div>
      )}
    </nav>
  );
}
