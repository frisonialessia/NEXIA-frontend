"use client";

import { useState } from "react";
import {
  QueryClient,
  QueryClientProvider,
  QueryCache,
  MutationCache,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster, toast } from "sonner";
import { ErrorBoundary } from "react-error-boundary";

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 3000,
            gcTime: 5 * 60 * 1000,
            retry: 3,
            retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
            refetchOnWindowFocus: true,
            refetchOnReconnect: true,
          },
          mutations: { retry: 1 },
        },
        queryCache: new QueryCache({
          onError: (error, query) => {
            if (query.state.data !== undefined) {
              toast.warning("Conexión inestable", {
                description: "Reintentando obtener datos del motor…",
                id: "connection",
              });
            }
          },
        }),
        mutationCache: new MutationCache({
          onError: (error: any) => {
            toast.error("No se pudo completar la acción", {
              description: error?.message ?? "Inténtalo de nuevo.",
            });
          },
          onSuccess: () => {
            toast.dismiss("connection");
          },
        }),
      })
  );

  return (
    <ErrorBoundary
      FallbackComponent={GlobalErrorFallback}
      onReset={() => window.location.reload()}
    >
      <QueryClientProvider client={client}>
        {children}
        <Toaster
          position="bottom-center"
          closeButton
          duration={4000}
          toastOptions={{
            classNames: {
              toast:
                "rounded-xl border border-neutral-200 bg-white text-neutral-900",
              description: "text-neutral-500",
            },
          }}
        />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

function GlobalErrorFallback({
  error,
  resetErrorBoundary,
}: {
  error: Error;
  resetErrorBoundary: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-6">
      <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white px-8 py-10 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100">
          <span className="text-xl text-neutral-400">!</span>
        </div>
        <h1 className="mt-6 font-serif text-2xl tracking-tight text-neutral-900">
          Algo se interrumpió
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-neutral-500">
          La interfaz encontró un problema inesperado. Tus datos están a salvo
          en el sistema; esto es solo la pantalla.
        </p>
        <details className="mt-4 text-left">
          <summary className="cursor-pointer text-xs uppercase tracking-wider text-neutral-400">
            Detalle técnico
          </summary>
          <pre className="mt-2 overflow-auto rounded-lg bg-neutral-50 p-3 text-[11px] text-neutral-500">
            {error.message}
          </pre>
        </details>
        <div className="mt-8 flex gap-3">
          <button
            onClick={resetErrorBoundary}
            className="flex-1 rounded-xl bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-neutral-700"
          >
            Reintentar
          </button>
          <a
            href="/"
            className="flex-1 rounded-xl border border-neutral-200 px-5 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:border-neutral-300"
          >
            Volver al inicio
          </a>
        </div>
      </div>
    </div>
  );
}
