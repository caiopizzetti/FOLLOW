import type { Metadata } from "next";

import { Sidebar } from "@/components/sidebar";

import "./globals.css";

export const metadata: Metadata = {
  title: "FOLLOW — Recuperação de oportunidades",
  description:
    "Encontre e recupere as oportunidades que sua empresa está deixando escapar por falta de follow-up.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen">
        <Sidebar />

        <div className="lg:pl-60">
          <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>

          <footer className="mx-auto max-w-6xl px-4 pb-10 text-xs text-[var(--color-ink-faint)] sm:px-6 lg:px-8">
            MVP de demonstração — a base carregada por <code>npm run db:seed</code> contém
            apenas dados fictícios.
          </footer>
        </div>
      </body>
    </html>
  );
}
