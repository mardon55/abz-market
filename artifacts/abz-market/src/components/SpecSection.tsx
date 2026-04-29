import { ChevronDown, ToggleLeft, ToggleRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CategorySpec } from "@/lib/category-specs";

// ── Dynamic spec section ───────────────────────────────────────
export function SpecSection({ specDef, specs, onChange }: {
  specDef: CategorySpec;
  specs: Record<string, string>;
  onChange: (key: string, val: string) => void;
}) {
  return (
    <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-base">{specDef.emoji}</span>
        <span className="text-xs font-bold text-primary">
          {specDef.names[0]} xususiyatlari
        </span>
        <span className="text-[10px] bg-primary text-white px-1.5 py-0.5 rounded-md ml-auto">
          Majburiy
        </span>
      </div>
      {specDef.fields.map((f) => (
        <div key={f.key}>
          <label className="block text-xs font-semibold text-muted-foreground mb-1">
            {f.label}{f.unit ? ` (${f.unit})` : ""}
          </label>
          {f.type === "select" ? (
            <div className="relative">
              <select
                value={specs[f.key] ?? ""}
                onChange={(e) => onChange(f.key, e.target.value)}
                className="w-full h-10 px-3 pr-8 bg-background border border-border/60 rounded-xl text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="">— Tanlang —</option>
                {f.options!.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            </div>
          ) : f.type === "toggle" ? (
            <button
              type="button"
              onClick={() => onChange(f.key, specs[f.key] === "Bor" ? "Yo'q" : "Bor")}
              className={cn(
                "flex items-center gap-2 h-10 px-3 rounded-xl border text-sm font-semibold transition-all w-full",
                specs[f.key] === "Bor"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                  : "bg-muted/40 text-muted-foreground border-border/60"
              )}
            >
              {specs[f.key] === "Bor"
                ? <ToggleRight className="w-4 h-4 text-emerald-600" />
                : <ToggleLeft className="w-4 h-4" />}
              {specs[f.key] === "Bor" ? "✓ Bor" : "Yo'q"}
            </button>
          ) : (
            <div className="relative">
              <input
                type={f.type === "number" ? "number" : "text"}
                value={specs[f.key] ?? ""}
                onChange={(e) => onChange(f.key, e.target.value)}
                placeholder={f.placeholder ?? ""}
                className="w-full h-10 px-3 bg-background border border-border/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              {f.unit && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium">
                  {f.unit}
                </span>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
