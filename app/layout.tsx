import type { Metadata, Viewport } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/header";
import { AuthProvider } from "@/lib/auth-context";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PSX.ai - Herramientas IA y Calculadoras Financieras",
  description: "Plataforma de herramientas de inteligencia artificial, calculadoras financieras, recursos educativos y mas. Todo gratis y facil de usar.",
  keywords: ["herramientas IA", "calculadoras", "finanzas", "inteligencia artificial", "generador de texto", "traductor"],
  authors: [{ name: "PSX.ai" }],
  generator: "v0.app",
  openGraph: {
    title: "PSX.ai - Herramientas IA y Calculadoras Financieras",
    description: "Plataforma de herramientas de inteligencia artificial, calculadoras financieras y recursos educativos",
    type: "website",
    locale: "es_ES",
  },
  icons: {
    icon: '/psx-favicon.svg',
    shortcut: '/psx-favicon.svg',
    apple: '/psx-favicon.svg'
  }
};

export const viewport: Viewport = {
  themeColor: "#38BDF8",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="bg-background">
      <body
        className={`${geistMono.variable} antialiased min-h-screen bg-background text-foreground`}
        suppressHydrationWarning
      >
        <AuthProvider>
          <Header />
          <main className="pt-16 md:pt-20">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
