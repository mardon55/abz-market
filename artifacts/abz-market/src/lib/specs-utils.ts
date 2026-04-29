// Specs yordamchi funksiyalar va konstantlar — my-store.tsx dan ajratildi
import type { CategorySpec } from "./category-specs";

// ── Price % ────────────────────────────────────────────────────
export function calcPctDiff(newP: string, oldP: string): number | null {
  const n = parseFloat(newP.replace(/[\s,]/g, ""));
  const o = parseFloat(oldP.replace(/[\s,]/g, ""));
  if (!n || !o || o === 0) return null;
  return Math.round(((n - o) / o) * 100);
}

// ── Serialize specs to dimensions string ───────────────────────
export function serializeSpecs(specs: Record<string, string>, specDef: CategorySpec): string {
  const parts: string[] = [];
  for (const field of specDef.fields) {
    const val = specs[field.key];
    if (!val || val === "Yo'q") continue;
    const valStr = field.unit ? `${val} ${field.unit}` : val;
    parts.push(`${field.label}: ${valStr}`);
  }
  return parts.join(" | ");
}

// ── Preset chip options ────────────────────────────────────────
export const PRESET_COLORS = ["Oq","Qora","Kulrang","Ko'k","Yashil","Qizil","Sariq","Jigarrang","Bej","Binafsha","To'q sariq","Pushti"];
export const PRESET_SIZES  = ["S","M","L","XL","XXL","XXXL"];
export const PRESET_SIZES_BED = ["90×200","160×220","180×220","170×210"];
// Note: Also used for Matraslar (mattress) category
export const MAX_IMAGES = 6;
