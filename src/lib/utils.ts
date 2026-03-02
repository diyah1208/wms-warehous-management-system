/* =========================
   GENERAL UTILS (NO FIREBASE)
========================= */

/**
 * Gabung className (pengganti cn dari shadcn)
 */
export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}

/**
 * Format tanggal ke format Indonesia
 * input: string | Date
 * output: 12 Jan 2025
 */
export function formatTanggal(
  date?: string | Date | null
): string {
  if (!date) return "-";

  const d = typeof date === "string" ? new Date(date) : date;

  if (isNaN(d.getTime())) return "-";

  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/**
 * Format datetime (opsional, kalau dipakai)
 */
export function formatDateTime(
  date?: string | Date | null
): string {
  if (!date) return "-";

  const d =
    typeof date === "string"
      ? new Date(date.replace(" ", "T")) // 🔥 penting
      : date;

  if (isNaN(d.getTime())) return "-";

  return d.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta", // 🔥 paksa WIB
  });
}

export function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 2,
  }).format(value);
}

// export function formatRupiahInput(value: number | string) {
//   const number = typeof value === "string"
//     ? Number(value.replace(/\D/g, ""))
//     : value;

//   if (!number) return "";

//   return new Intl.NumberFormat("id-ID", {
//     style: "currency",
//     currency: "IDR",
//     minimumFractionDigits: 2,
//   }).format(number);
// }

export function parseRupiah(value: string) {
  return Number(value.replace(/\D/g, ""));
}

// src/lib/tooltip-variants.ts
// tooltipVariants.ts
export const tooltipVariants = {
  primary: "!bg-blue-600 !text-white !border-blue-600",
  success: "!bg-emerald-600 !text-white !border-emerald-600",
  edit: "!bg-orange-500 !text-white !border-orange-500",
  danger: "!bg-red-600 !text-white !border-red-600",
};

export function encodeSafe(value: string): string {
  return btoa(value)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}