"use client";

// ──────────────────────────────────────────────────────────────────────────
// CONFIGURACIÓN · pestaña AJUSTES (cuerpo)
// Perfil y unidades disponibles para todos; los umbrales de planta y el guardar
// global se habilitan solo si el rol puede cambiar ajustes de planta.
// ──────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { toast } from "sonner";
import { UNIDADES, UNIDADES_UNIVERSALES, col } from "@/lib/constants";
import { uni } from "@/lib/format";
import { useSession } from "@/lib/state/SessionProvider";
import { useTheme } from "@/lib/state/ThemeProvider";
import type { Magnitud, SistemaUnidades } from "@/lib/types";

export function SettingsBody() {
  const { sistema, setSistema, puede } = useSession();
  const { toggle, dark } = useTheme();
  const [umbral, setUmbral] = useState(60);
  const brand = col("brand", dark);
  const puedeAjustesPlanta = puede("ajustesPlanta");

  return (
    <div className="space-y-4">
      <Seccion titulo="Perfil de usuario">
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo label="Nombre" defaultValue="Alessia Frisoni" />
          <Campo label="Planta" defaultValue="Planta Norte · Línea 1" />
        </div>
      </Seccion>

      <Seccion titulo="Sistema de unidades">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm">Sistema de medida</div>
            <div className="text-xs text-neutral-400">Cambia todas las unidades de doble sistema a la vez</div>
          </div>
          <div className="flex gap-1 rounded-lg border border-neutral-200 p-0.5 dark:border-neutral-700">
            <BotonSistema valor="metrico" actual={sistema} onClick={setSistema} brand={brand} label="Métrico (SI)" />
            <BotonSistema valor="imperial" actual={sistema} onClick={setSistema} brand={brand} label="Imperial (EE.UU.)" />
          </div>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-2.5 sm:grid-cols-3">
          {(Object.keys(UNIDADES) as Magnitud[]).map((k) => (
            <FilaUnidad key={k} nombre={UNIDADES[k].nombre} unidad={uni(k, sistema).u} color={brand} />
          ))}
          {UNIDADES_UNIVERSALES.map(([nombre, unidad]) => (
            <FilaUnidad key={nombre} nombre={nombre} unidad={unidad} />
          ))}
        </div>
      </Seccion>

      <Seccion titulo="Preferencias">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm">Idioma</div>
              <div className="text-xs text-neutral-400">Idioma de la interfaz · próximamente</div>
            </div>
            <select disabled className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-sm text-neutral-400 dark:border-neutral-700 dark:bg-neutral-800">
              <option>Español</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm">Tema oscuro</div>
              <div className="text-xs text-neutral-400">Cambia el aspecto general</div>
            </div>
            <button onClick={toggle} className="rounded-lg border border-neutral-200 px-3 py-1.5 text-sm dark:border-neutral-700">
              Alternar
            </button>
          </div>
        </div>
      </Seccion>

      {puedeAjustesPlanta && (
        <Seccion titulo="Umbrales de alerta">
          <div className="space-y-4">
            <label className="block">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600 dark:text-neutral-300">Sensibilidad de detección</span>
                <span className="font-mono text-neutral-400">{umbral}%</span>
              </div>
              <input type="range" min={40} max={90} value={umbral} onChange={(e) => setUmbral(Number(e.target.value))} className="mt-2 w-full" style={{ accentColor: brand }} />
            </label>
            <p className="text-xs text-neutral-400">Más bajo = más sensible (más alertas). Más alto = solo casos claros.</p>
          </div>
        </Seccion>
      )}

      <div className="flex justify-end">
        <button onClick={() => toast("Ajustes guardados")} className="rounded-xl px-6 py-2.5 text-sm font-medium text-white" style={{ background: brand }}>
          Guardar cambios
        </button>
      </div>
    </div>
  );
}

function Seccion({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white px-7 py-6 dark:border-neutral-800 dark:bg-neutral-900">
      <h3 className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">{titulo}</h3>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function Campo({ label, defaultValue }: { label: string; defaultValue: string }) {
  return (
    <label className="block">
      <span className="text-sm text-neutral-600 dark:text-neutral-300">{label}</span>
      <input defaultValue={defaultValue} className="mt-1 w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800" />
    </label>
  );
}

function BotonSistema({ valor, actual, onClick, brand, label }: { valor: SistemaUnidades; actual: SistemaUnidades; onClick: (s: SistemaUnidades) => void; brand: string; label: string }) {
  const activo = actual === valor;
  return (
    <button onClick={() => onClick(valor)} className="rounded-md px-3 py-1 text-sm font-medium" style={activo ? { background: brand, color: "#fff" } : { color: "#737373" }}>
      {label}
    </button>
  );
}

function FilaUnidad({ nombre, unidad, color }: { nombre: string; unidad: string; color?: string }) {
  return (
    <div className="flex items-baseline justify-between border-b border-neutral-100 pb-1.5 dark:border-neutral-800">
      <span className="text-xs text-neutral-500">{nombre}</span>
      <span className="font-mono text-sm" style={color ? { color } : { color: "#a3a3a3" }}>
        {unidad}
      </span>
    </div>
  );
}
