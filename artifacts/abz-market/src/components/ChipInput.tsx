import { useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

// ── ChipInput ─────────────────────────────────────────────────
export function ChipInput({ label, icon: Icon, items, onAdd, onRemove, placeholder, presets }: {
  label: string; icon: React.ElementType; items: string[];
  onAdd: (v: string) => void; onRemove: (i: number) => void;
  placeholder: string; presets?: string[];
}) {
  const [val, setVal] = useState("");
  const add = () => { const t = val.trim(); if (t && !items.includes(t)) onAdd(t); setVal(""); };
  return (
    <div>
      <label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground mb-2">
        <Icon className="w-3.5 h-3.5" /> {label}
      </label>
      {presets && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {presets.map((p) => {
            const active = items.includes(p);
            return (
              <button key={p} type="button"
                onClick={() => active ? onRemove(items.indexOf(p)) : onAdd(p)}
                className={cn("px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all",
                  active ? "bg-primary text-white border-primary" : "bg-muted/60 text-muted-foreground border-border/60"
                )}>{p}</button>
            );
          })}
        </div>
      )}
      {items.filter((i) => !presets?.includes(i)).length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {items.filter((i) => !presets?.includes(i)).map((chip, _idx) => (
            <span key={chip} className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-1 bg-primary/10 text-primary rounded-lg text-xs font-semibold">
              {chip}
              <button type="button" onClick={() => onRemove(items.indexOf(chip))} className="hover:text-red-500">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <input value={val} onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
          placeholder={placeholder}
          className="flex-1 h-9 px-3 bg-muted/50 border border-border/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        <button type="button" onClick={add} disabled={!val.trim()}
          className="h-9 px-3 bg-primary/10 text-primary rounded-xl text-sm font-bold disabled:opacity-40 hover:bg-primary/20 transition-colors"
        >+ Qo'sh</button>
      </div>
    </div>
  );
}
