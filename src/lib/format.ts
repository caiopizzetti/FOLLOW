import { followUpConfig } from "./config";

const { locale, currency, timeZone } = followUpConfig;

const currencyFormatter = new Intl.NumberFormat(locale, {
  style: "currency",
  currency,
  maximumFractionDigits: 0,
});

const currencyCentsFormatter = new Intl.NumberFormat(locale, {
  style: "currency",
  currency,
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const shortDateFormatter = new Intl.DateTimeFormat(locale, {
  day: "2-digit",
  month: "2-digit",
  timeZone,
});

const timelineDateFormatter = new Intl.DateTimeFormat(locale, {
  day: "2-digit",
  month: "short",
  timeZone,
});

const fullDateFormatter = new Intl.DateTimeFormat(locale, {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone,
});

/** R$ 4.500 — usado em cards e tabelas, onde centavos so poluem. */
export function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

/** R$ 4.500,00 — usado quando o numero exato importa. */
export function formatCurrencyExact(value: number): string {
  return currencyCentsFormatter.format(value);
}

/** 12/08 */
export function formatShortDate(iso: string): string {
  return shortDateFormatter.format(new Date(iso));
}

/**
 * "26 AGO" — usado na linha do tempo do histórico, onde o dia e o mês bastam
 * e o formato numérico competiria visualmente com os valores em reais.
 */
export function formatTimelineDate(iso: string): string {
  const parts = timelineDateFormatter.formatToParts(new Date(iso));
  const day = parts.find((p) => p.type === "day")?.value ?? "";
  const month = (parts.find((p) => p.type === "month")?.value ?? "")
    .replace(".", "")
    .toUpperCase();
  return `${day} ${month}`;
}

/** 12/08/2025 */
export function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return fullDateFormatter.format(new Date(iso));
}

/**
 * Converte um instante para o dia civil (YYYY-MM-DD) no fuso configurado.
 * Precisamos disso porque "dias parados" e uma contagem de dias no calendario
 * do vendedor, nao de janelas de 24h.
 */
export function toCivilDay(iso: string | Date, tz: string = timeZone): string {
  const date = typeof iso === "string" ? new Date(iso) : iso;
  // en-CA produz exatamente YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: tz,
  }).format(date);
}

/** Diferenca em dias inteiros de calendario entre dois instantes. */
export function daysBetween(from: string | Date, to: string | Date): number {
  const a = Date.parse(`${toCivilDay(from)}T00:00:00Z`);
  const b = Date.parse(`${toCivilDay(to)}T00:00:00Z`);
  return Math.round((b - a) / 86_400_000);
}

/** "8 dias parado" / "hoje" */
export function formatStalledDays(days: number): string {
  if (days <= 0) return "hoje";
  if (days === 1) return "1 dia parado";
  return `${days} dias parado`;
}

export function formatPhone(phone: string | null): string {
  return phone?.trim() ? phone : "—";
}
