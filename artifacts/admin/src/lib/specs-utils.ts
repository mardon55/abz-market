// Specs yordamchi funksiyalar — products.tsx dan ajratildi
import { CATEGORIES } from "./category-specs";

export const PRESET_COLORS = ["Oq","Qora","Kulrang","Jigarrang","Yashil","Ko'k","Sariq","Qizil","Pushti","Binafsha","Bej","Kumush"];
export const PRESET_SIZES  = ["XS","S","M","L","XL","XXL","XXXL","36","37","38","39","40","41","42","43","44","45"];
export const PRESET_SIZES_BED = ["90×200","160×220","180×220","170×210"];

// ── Helpers: specs ↔ dimensions string ───────────────────────────────────────
export function serializeSpecs(specs: Record<string, string>, catDef: (typeof CATEGORIES)[0]): string {
  const parts: string[] = [];
  for (const field of catDef.fields) {
    const val = specs[field.key];
    if (!val || val === "Yo'q") continue;
    const valStr = field.unit ? `${val} ${field.unit}` : val;
    parts.push(`${field.label}: ${valStr}`);
  }
  return parts.join(" | ");
}

export function parseSpecsFromDimensions(dimensionsStr: string): Record<string, string> {
  if (!dimensionsStr) return {};
  const specs: Record<string, string> = {};
  dimensionsStr.split("|").forEach((part) => {
    const trimmed = part.trim();
    const colonIdx = trimmed.indexOf(":");
    if (colonIdx === -1) return;
    const rawLabel = trimmed.substring(0, colonIdx).trim();
    const rawVal   = trimmed.substring(colonIdx + 1).trim();
    for (const cat of CATEGORIES) {
      const f = cat.fields.find((fd) => fd.label.toLowerCase() === rawLabel.toLowerCase());
      if (f) { specs[f.key] = rawVal.replace(/ (sm|W|kg|litr|ayl\/min)$/, ""); break; }
    }
  });
  return specs;
}
