import type { Metadata } from "next";
import Link from "next/link";
import { Radar, Plus } from "lucide-react";

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
        <header className="border-b border-[var(--color-line)] bg-white">
          <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-3.5 sm:gap-6 sm:px-5">
            <Link href="/dashboard" className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[var(--color-brand)]">
                <Radar className="h-4 w-4 text-white" strokeWidth={2.25} />
              </span>
              <span className="text-[15px] font-semibold tracking-tight">FOLLOW</span>
            </Link>

            <nav className="flex items-center gap-0.5 text-sm sm:gap-1">
              <Link
                href="/dashboard"
                className="rounded-lg px-2 py-1.5 text-[var(--color-ink-soft)] transition-colors hover:bg-gray-100 hover:text-[var(--color-ink)] sm:px-3"
              >
                Painel
              </Link>
              <Link
                href="/leads"
                className="rounded-lg px-2 py-1.5 text-[var(--color-ink-soft)] transition-colors hover:bg-gray-100 hover:text-[var(--color-ink)] sm:px-3"
              >
                Oportunidades
              </Link>
            </nav>

            <Link
              href="/leads/new"
              className="btn-primary ml-auto shrink-0 px-2.5 sm:px-3.5"
              aria-label="Nova oportunidade"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Nova oportunidade</span>
            </Link>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-5">{children}</main>

        <footer className="mx-auto max-w-6xl px-4 pb-10 sm:px-5 text-xs text-[var(--color-ink-faint)]">
          MVP de demonstração — a base carregada por <code>npm run db:seed</code> contém
          apenas dados fictícios.
        </footer>
      </body>
    </html>
  );
}
