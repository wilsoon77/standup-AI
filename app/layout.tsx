import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Geist_Mono } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Standup AI — Genera tu daily standup con IA",
  description:
    "Herramienta que lee tu actividad de GitHub y genera un daily standup listo para copiar a Slack o Teams. Gratis, con IA.",
  keywords: ["standup", "daily", "github", "ia", "developer", "productividad"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col gradient-bg">
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
