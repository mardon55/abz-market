import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FieldDef } from "@/lib/category-specs";

// ── Spec field renderer ───────────────────────────────────────────────────────
export function SpecField({ field, value, onChange }: { field: FieldDef; value: string; onChange: (v: string) => void }) {
  if (field.type === "toggle") {
    return (
      <div className="flex items-center justify-between py-2.5 px-3 bg-muted/40 rounded-xl">
        <span className="text-sm font-medium">{field.label}</span>
        <button
          type="button"
          onClick={() => onChange(value === "Ha" ? "Yo'q" : "Ha")}
          className={cn("w-11 h-6 rounded-full transition-all relative", value === "Ha" ? "bg-primary" : "bg-border")}
        >
          <span className={cn("absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all", value === "Ha" ? "left-6" : "left-1")} />
        </button>
      </div>
    );
  }
  if (field.type === "select") {
    return (
      <div>
        <label className="text-xs font-semibold text-muted-foreground block mb-1">{field.label}</label>
        <div className="relative">
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full h-10 pl-3 pr-8 bg-muted/40 border border-border/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none"
          >
            <option value="">Tanlang...</option>
            {field.options?.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
        </div>
      </div>
    );
  }
  return (
    <div>
      <label className="text-xs font-semibold text-muted-foreground block mb-1">{field.label}</label>
      <input
        type={field.type === "number" ? "number" : "text"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.label}
        className="w-full h-10 px-3 bg-muted/40 border border-border/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
      />
    </div>
  );
}
