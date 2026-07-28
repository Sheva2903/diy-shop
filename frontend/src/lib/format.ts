export function formatVnd(value: number | string, language: string): string {
  return new Intl.NumberFormat(language === "en" ? "en-US" : "vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0
  }).format(Number(value));
}

/** dd/mm/yyyy hh:mm — the format the dashboard order table uses (plan §2.5.B). */
export function formatDateTime(value: string, language = "vi"): string {
  return new Intl.DateTimeFormat(language === "en" ? "en-GB" : "vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

export function formatDate(value: string, language = "vi"): string {
  return new Intl.DateTimeFormat(language === "en" ? "en-GB" : "vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(new Date(value));
}

/** Partially masks a phone number for customer-facing and list views. */
export function maskPhone(phone: string): string {
  const trimmed = phone.trim();
  if (trimmed.length <= 4) return trimmed;
  return `${trimmed.slice(0, 3)}${"•".repeat(Math.max(trimmed.length - 5, 2))}${trimmed.slice(-2)}`;
}
