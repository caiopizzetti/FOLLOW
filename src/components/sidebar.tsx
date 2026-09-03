"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Plus, Radar, Target } from "lucide-react";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/leads", label: "Oportunidades", icon: Target },
  { href: "/leads/new", label: "Nova oportunidade", icon: Plus },
] as const;

/**
 * Navegação do produto — três destinos, nada além disso.
 *
 * Desktop: barra lateral fixa.
 * Mobile: a mesma lista vira uma faixa horizontal no topo, sem menu sanfona
 * (com três itens, esconder atrás de um botão só adiciona um clique).
 */
export function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/leads" ? pathname === "/leads" : pathname.startsWith(href);

  return (
    <aside
      className="border-b border-[var(--color-line)] bg-white lg:fixed lg:inset-y-0 lg:left-0 lg:w-60 lg:border-b-0 lg:border-r"
      aria-label="Navegação principal"
    >
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 lg:h-full lg:max-w-none lg:flex-col lg:items-stretch lg:gap-6 lg:px-4 lg:py-6">
        <Link href="/dashboard" className="flex shrink-0 items-center gap-2 lg:px-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[var(--color-brand)]">
            <Radar className="h-4 w-4 text-white" strokeWidth={2.25} />
          </span>
          <span className="text-[15px] font-semibold tracking-tight">FOLLOW</span>
        </Link>

        <nav className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto lg:flex-none lg:flex-col lg:items-stretch lg:gap-1 lg:overflow-visible">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-[var(--color-brand-soft)] text-[var(--color-brand)]"
                    : "text-[var(--color-ink-soft)] hover:bg-gray-100 hover:text-[var(--color-ink)]"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="whitespace-nowrap">{label}</span>
              </Link>
            );
          })}
        </nav>

        <p className="hidden text-xs leading-relaxed text-[var(--color-ink-faint)] lg:mt-auto lg:block lg:px-2">
          Central de recuperação de oportunidades.
          <br />
          Base de demonstração com dados fictícios.
        </p>
      </div>
    </aside>
  );
}
