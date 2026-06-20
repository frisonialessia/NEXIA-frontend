"use client";

// ──────────────────────────────────────────────────────────────────────────
// ACCESO RESTRINGIDO
// Tarjeta que se muestra cuando el rol activo no puede ver una vista protegida
// (p. ej. si se llega por URL directa). El menú ya atenúa/oculta estos enlaces,
// pero esto cubre el acceso directo.
// ──────────────────────────────────────────────────────────────────────────

import Link from "next/link";
import { col } from "@/lib/constants";
import { useTheme } from "@/lib/state/ThemeProvider";
import { SURFACE } from "./ui/Card";
import { Icon } from "./ui/Icon";

export function AccessDenied({ mensaje }: { mensaje: string }) {
  const { dark } = useTheme();
  return (
    <main className="fade-in px-6 py-8 sm:px-8">
      <div className="mx-auto max-w-4xl">
        <div className={`${SURFACE} px-8 py-16 text-center`}>
          <Icon name="shield" className="mx-auto h-8 w-8" style={{ color: col("gray", dark) }} />
          <h1 className="mt-4 font-serif text-2xl tracking-tight">Acceso restringido</h1>
          <p className="mx-auto mt-2 max-w-md text-sm text-neutral-500">{mensaje}</p>
          <Link
            href="/"
            className="mt-6 inline-block rounded-xl px-5 py-2.5 text-sm font-medium text-white"
            style={{ background: col("brand", dark) }}
          >
            Volver al centro de mando
          </Link>
        </div>
      </div>
    </main>
  );
}
