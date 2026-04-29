import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: 0,
  }).format(price).replace(/,/g, " ") + " so'm";
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "new":              return "bg-success/10 text-success border-success/20";
    case "accepted":         return "bg-primary/10 text-primary border-primary/20";
    case "shipped":          return "bg-warning/10 text-warning border-warning/20";
    case "delivered":        return "bg-muted text-muted-foreground border-border";
    case "cancelled":        return "bg-destructive/10 text-destructive border-destructive/20";
    case "return_requested": return "bg-orange-100 text-orange-700 border-orange-300";
    case "returned":         return "bg-teal-100 text-teal-700 border-teal-300";
    default:                 return "bg-secondary text-secondary-foreground border-border";
  }
}

export function getStatusLabel(status: string): string {
  switch (status) {
    case "new":              return "Yangi";
    case "accepted":         return "Qabul qilingan";
    case "shipped":          return "Yuborilgan";
    case "delivered":        return "Yetkazilgan";
    case "cancelled":        return "Bekor qilingan";
    case "return_requested": return "Qaytarish so'rovi";
    case "returned":         return "Qaytarildi";
    default:                 return status;
  }
}
