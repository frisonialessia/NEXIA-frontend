"use client";

// ──────────────────────────────────────────────────────────────────────────
// PUERTA DE ACCESO
// Decide qué se muestra según la sesión: pantalla de login si no hay sesión,
// o la aplicación completa (banner + navegación + contenido) si la hay.
// Mientras se lee el estado persistido, muestra un splash para evitar parpadeos.
// ──────────────────────────────────────────────────────────────────────────

import { useSession } from "@/lib/state/SessionProvider";
import { LoginScreen } from "./account/LoginScreen";
import { DemoBanner } from "./DemoBanner";
import { LiveAnnouncer } from "./LiveAnnouncer";
import { Nav } from "./Nav";
import { PhoneAlert } from "./PhoneAlert";
import { PwaRegister } from "./PwaRegister";
import { BrandMark } from "./account/BrandMark";
import { WelcomeTour } from "./onboarding/WelcomeTour";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { sesionActiva, hidratado } = useSession();

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 antialiased dark:bg-neutral-950 dark:text-neutral-100">
      {!hidratado ? (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4">
          <BrandMark size={48} className="animate-pulse" />
          <span className="font-display text-lg tracking-tight text-neutral-400">NEXIA</span>
        </div>
      ) : !sesionActiva ? (
        <LoginScreen />
      ) : (
        <>
          <DemoBanner />
          <Nav />
          {children}
          <PhoneAlert />
          <LiveAnnouncer />
          <PwaRegister />
          <WelcomeTour />
        </>
      )}
    </div>
  );
}
