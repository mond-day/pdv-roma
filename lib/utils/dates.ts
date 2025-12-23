import { format, parseISO, isValid } from "date-fns";

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = typeof date === "string" ? parseISO(date) : date;
  if (!isValid(d)) return "";
  return format(d, "dd/MM/yyyy");
}

export function formatDateTime(
  date: Date | string | null | undefined
): string {
  if (!date) return "";
  const d = typeof date === "string" ? parseISO(date) : date;
  if (!isValid(d)) return "";
  return format(d, "dd/MM/yyyy HH:mm:ss");
}

export function formatDateISO(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = typeof date === "string" ? parseISO(date) : date;
  if (!isValid(d)) return "";
  return format(d, "yyyy-MM-dd");
}

export function todayISO(): string {
  return formatDateISO(new Date()) || "";
}

