import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number, currency: string = "EUR"): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency,
  }).format(value);
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateFormat("de-DE").format(d);
}

export function formatPercentage(value: number): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

export function getChangeColor(value: number): string {
  if (value > 0) return "text-green-600";
  if (value < 0) return "text-red-600";
  return "text-gray-600";
}
