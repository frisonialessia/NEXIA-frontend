import type { Metadata, Viewport } from "next";
import { Fraunces, Inter, JetBrains_Mono } from "next/font/google";
import { Providers } from "./providers";
import { AppProviders } from "@/lib/state/AppProviders";
import { Shell } from "@/components/Shell";
import "./globals.css";

const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-serif", display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  title: "NEXIA · Inteligencia Operativa",
  description: "Monitoreo predictivo de activos industriales",
  manifest: "/manifest.webmanifest",
  applicationName: "NEXIA",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "NEXIA",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${fraunces.variable} ${inter.variable} ${mono.variable}`}>
      <body className="font-sans antialiased">
        <Providers>
          <AppProviders>
            <Shell>{children}</Shell>
          </AppProviders>
        </Providers>
      </body>
    </html>
  );
}
