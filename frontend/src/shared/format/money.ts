export function formatVnd(value: number | string, language: string): string {
  return new Intl.NumberFormat(language === "en" ? "en-US" : "vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0
  }).format(Number(value));
}
