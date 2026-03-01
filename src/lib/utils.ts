import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO, differenceInDays, differenceInMinutes } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string, fmt = "MMM d, yyyy") {
  try {
    return format(parseISO(dateStr), fmt);
  } catch {
    return dateStr;
  }
}

export function formatDateTime(dateStr: string) {
  try {
    return format(parseISO(dateStr), "MMM d, yyyy HH:mm");
  } catch {
    return dateStr;
  }
}

export function calculateDuration(start: string, end: string) {
  try {
    return differenceInMinutes(parseISO(end), parseISO(start));
  } catch {
    return 0;
  }
}

export function tripDuration(startDate: string, endDate: string) {
  try {
    const days = differenceInDays(parseISO(endDate), parseISO(startDate));
    return days === 1 ? "1 day" : `${days} days`;
  } catch {
    return "";
  }
}

export function formatCurrency(amount: number, currency: "USD" | "ZAR" | "EUR") {
  if (currency === "ZAR") {
    return new Intl.NumberFormat("en-ZA", { style: "currency", currency }).format(amount);
  }

  if (currency === "EUR")
    return new Intl.NumberFormat("en-EU", { style: "currency", currency }).format(amount);

  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
}

export function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function minutesToTime(minutes: number) {
  const h = Math.floor(minutes / 60).toString().padStart(2, "0");
  const m = (minutes % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

export function timeToMinutes(time: string) {
  if (!time || !time.includes(":")) return 0;
  const [h, m] = time.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

export function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function fileToBase64(file: File): Promise<{ type: string; base64: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve({ type: file.type, base64: reader.result as string });
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function base64ToFile(base64: string, filename: string): File {
  const byteCharacters = atob(base64.split(",")[1]);
  const byteNumbers = new Array(byteCharacters.length);

  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }

  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: "application/octet-stream" });
  return new File([blob], filename, { type: "application/octet-stream" });
}
