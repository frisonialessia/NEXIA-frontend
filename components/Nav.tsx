"use client";

// ──────────────────────────────────────────────────────────────────────────
// BARRA DE NAVEGACIÓN
// Enlaces a las vistas (rutas reales de Next.js), selector de rol y toggle de
// tema. El control de acceso se refleja aquí: la vista Admin se oculta para
// quien no es administrador; Producción y Conectar se atenúan y, si se pulsan
// sin permiso, avisan en vez de navegar (fiel a la demo).
// ──────────────────────────────────────────────────────────────────────────

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { ROLES, ROL_NOMBRE, col } from "@/lib/constants";
import { useSession } from "@/lib/state/SessionProvider";
import { useTheme } from "@/lib/state/ThemeProvider";
import type { Rol } from "@/lib/types";
import { ACCESO_VISTA } from "@/lib/constants";
import { Icon, type IconName } from "./ui/Icon";

interface NavItem {
  href: string;
  label: string;
  icon: IconName;
  /** Vista protegida (clave en ACCESO_VISTA) o null si es libre. */
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

  const esActivo = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <nav className="sticky top-0 z-40 border-b border-neutral-200 bg-neutral-50/90 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/90">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3 sm:px-8">
        {/* Marca con punto que late */}
        <Link href="/" className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="ping-soft absolute inline-flex h-full w-full rounded-full" style={{ background: "#10b981" }} />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full" style={{ background: "#10b981" }} />
          </span>
          <span className="font-serif text-lg tracking-tight">NEXIA</span>
        </Link>

        <div className="flex items-center gap-0.5 text-sm">
          {ITEMS.map((item) => {
            const bloqueada = item.acceso !== null && !puedeVer(item.acceso);
            // Admin se oculta por completo si no hay acceso (como en la demo).
            if (item.acceso === "admin" && bloqueada) return null;

            const activo = esActivo(item.href);
            const estilo = activo ? { background: col("brand", dark), color: "#fff" } : undefined;
            const clases =
              "nav-btn flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 transition-colors text-neutral-500 dark:text-neutral-400";

            const contenido = (
              <>
                <Icon name={item.icon} className="h-4 w-4" />
                <span className="hidden sm:inline">{item.label}</span>
              </>
            );

            // Vista atenuada (Producción/Conectar sin permiso): avisa en vez de navegar.
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
          })}

          <div className="mx-1.5 h-5 w-px bg-neutral-200 dark:bg-neutral-700" />

          {/* Selector de rol */}
          <select
            value={rol}
            onChange={(e) => {
              const nuevo = e.target.value as Rol;
              setRol(nuevo);
              // Si el rol nuevo no puede ver la vista actual, vuelve al mando.
              const item = ITEMS.find((i) => esActivo(i.href));
              if (item?.acceso && !ACCESO_VISTA[item.acceso].includes(nuevo)) {
                router.push("/");
              }
            }}
            className="rounded-lg border border-neutral-200 bg-white px-2 py-1.5 text-xs text-neutral-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300"
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {ROL_NOMBRE[r]}
              </option>
            ))}
          </select>

          {/* Toggle de tema */}
          <button
            onClick={toggle}
            aria-label="Cambiar tema"
            className="rounded-lg border border-neutral-200 p-1.5 transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
          >
            <Icon name={dark ? "sun" : "moon"} className="h-4 w-4" />
          </button>
        </div>
      </div>
    </nav>
  );
}
