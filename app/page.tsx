"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export default function ProbePage() {
  return (
    <main className="min-h-screen bg-neutral-50 px-6 py-16">
      <div className="mx-auto max-w-2xl space-y-8">
        <header>
          <h1 className="font-serif text-3xl tracking-tight text-neutral-900">
            NEXIA · prueba de vida
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            Verifica que la cáscara respira: query, cache, error boundary y toasts.
          </p>
        </header>

        <HealthProbe />
        <ErrorTrigger />
      </div>
    </main>
  );
}

function HealthProbe() {
  const { data, isLoading, isError, isFetching, dataUpdatedAt } = useQuery({
    queryKey: ["probe", "fleet"],
    queryFn: async () => {
      const res = await fetch(`${API}/assets/health?org_id=org_demo`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    },
    refetchInterval: 4000,
  });

  return (
    <section className="rounded-2xl border border-neutral-200 bg-white px-7 py-6">
      <div className="flex items-center gap-2">
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            isError ? "bg-red-500" : "bg-emerald-500"
          } ${isFetching ? "animate-pulse" : ""}`}
        />
        <span className="text-xs uppercase tracking-[0.18em] text-neutral-400">
          GET /assets/health
        </span>
      </div>

      <div className="mt-4">
        {isLoading ? (
          <p className="text-sm text-neutral-400">Cargando por primera vez…</p>
        ) : isError ? (
          <p className="text-sm text-red-600">
            Error de conexión. (Reintentando solo · debería salir un toast.)
          </p>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-neutral-700">
              <span className="font-mono text-neutral-900">
                {data.total_assets ?? 0}
              </span>{" "}
              activos ·{" "}
              <span className="font-mono text-neutral-900">
                {data.needing_attention ?? 0}
              </span>{" "}
              requieren atención
            </p>
            <pre className="overflow-auto rounded-lg bg-neutral-50 p-3 text-[11px] text-neutral-500">
              {JSON.stringify(data, null, 2)}
            </pre>
            {dataUpdatedAt && (
              <p className="font-mono text-[11px] text-neutral-400">
                actualizado {new Date(dataUpdatedAt).toLocaleTimeString("es-ES")}
              </p>
            )}
          </div>
        )}
      </div>
      <p className="mt-3 text-xs text-neutral-400">
        Si esto muestra datos, la query y el cache funcionan. Abre los DevTools
        (botón flotante) para ver la entrada en el cache.
      </p>
    </section>
  );
}

function ErrorTrigger() {
  const [boom, setBoom] = useState(false);
  if (boom) {
    throw new Error("Error de prueba forzado desde la página de vida");
  }
  return (
    <section className="rounded-2xl border border-neutral-200 bg-white px-7 py-6">
      <span className="text-xs uppercase tracking-[0.18em] text-neutral-400">
        Prueba del Error Boundary
      </span>
      <p className="mt-2 text-sm text-neutral-500">
        Al pulsar, se lanza un error de render. Debe aparecer la pantalla
        “Algo se interrumpió”, no una página en blanco.
      </p>
      <button
        onClick={() => setBoom(true)}
        className="mt-4 rounded-xl border border-neutral-300 px-5 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:border-red-300 hover:text-red-600"
      >
        Forzar error de render
      </button>
    </section>
  );
}
