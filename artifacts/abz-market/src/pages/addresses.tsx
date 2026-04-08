import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { MobileLayout } from "@/components/layout/MobileLayout";
import {
  MapPin, Plus, Trash2, CheckCircle2, Home, Briefcase,
  Building2, Star, ChevronRight, X, Save,
} from "lucide-react";
import { hapticFeedback } from "@/hooks/use-telegram";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────
interface Address {
  id: string;
  telegramId: string;
  label: string;
  address: string;
  city: string | null;
  region: string | null;
  isDefault: boolean;
  createdAt: string;
}

// ── Label helpers ──────────────────────────────────────────────
const LABELS = [
  { key: "Uy",     icon: Home,      color: "bg-emerald-100 text-emerald-600" },
  { key: "Ish",    icon: Briefcase, color: "bg-blue-100 text-blue-600" },
  { key: "Ofis",   icon: Building2, color: "bg-violet-100 text-violet-600" },
  { key: "Boshqa", icon: MapPin,    color: "bg-amber-100 text-amber-600" },
];

function labelMeta(label: string) {
  return LABELS.find(l => l.key === label) ?? LABELS[3];
}

const REGIONS_UZ = [
  "Toshkent shahar", "Toshkent viloyati", "Samarqand",
  "Buxoro", "Farg'ona", "Andijon", "Namangan",
  "Xorazm", "Qashqadaryo", "Surxondaryo",
  "Jizzax", "Sirdaryo", "Navoiy", "Qoraqalpog'iston",
];

// ── Get telegramId ─────────────────────────────────────────────
function getTgId(): string | null {
  const id = (window as any).Telegram?.WebApp?.initDataUnsafe?.user?.id;
  if (id) return String(id);
  return localStorage.getItem("tg_user_id");
}

// ── Add address form ───────────────────────────────────────────
function AddressForm({ onSave, onClose }: { onSave: () => void; onClose: () => void }) {
  const [label, setLabel]     = useState("Uy");
  const [address, setAddress] = useState("");
  const [city, setCity]       = useState("");
  const [region, setRegion]   = useState("");
  const [isDefault, setDefault] = useState(false);
  const [saving, setSaving]   = useState(false);
  const [errors, setErrors]   = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!address.trim()) e.address = "Manzil kiritilishi shart";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    const tgId = getTgId();
    if (!tgId) { alert("Avval tizimga kiring"); return; }

    setSaving(true);
    hapticFeedback("impact");
    try {
      const r = await fetch("/api/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ telegramId: tgId, label, address: address.trim(), city: city.trim() || null, region: region || null, isDefault }),
      });
      if (!r.ok) throw new Error();
      hapticFeedback("success");
      onSave();
    } catch {
      alert("Xato yuz berdi, qaytadan urinib ko'ring");
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-border/40">
        <button onClick={onClose} className="w-9 h-9 rounded-2xl bg-muted flex items-center justify-center">
          <X className="w-4 h-4" />
        </button>
        <h2 className="font-display font-bold text-base">Yangi manzil</h2>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-1.5 bg-primary text-white px-4 h-9 rounded-2xl text-sm font-bold disabled:opacity-60 active:scale-95 transition-transform"
        >
          <Save className="w-3.5 h-3.5" />
          {saving ? "Saqlanmoqda..." : "Saqlash"}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-10">
        {/* Label selector */}
        <div>
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 block">Manzil turi</label>
          <div className="grid grid-cols-4 gap-2">
            {LABELS.map(({ key, icon: Icon, color }) => (
              <button
                key={key}
                onClick={() => { hapticFeedback("selection"); setLabel(key); }}
                className={cn(
                  "flex flex-col items-center gap-1.5 py-3 rounded-2xl border-2 transition-all",
                  label === key
                    ? "border-primary bg-primary/5"
                    : "border-border/60 bg-card active:bg-muted/50"
                )}
              >
                <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center", color)}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-semibold">{key}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Address input */}
        <div>
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 block">Ko'cha, uy raqami *</label>
          <textarea
            value={address}
            onChange={(e) => { setAddress(e.target.value); if (errors.address) setErrors({}); }}
            placeholder="Masalan: Navoiy ko'chasi 5-uy, 12-xonadon"
            rows={3}
            className={cn(
              "w-full px-4 py-3 bg-card border rounded-2xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30",
              errors.address ? "border-red-400" : "border-border/60"
            )}
          />
          {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
        </div>

        {/* City */}
        <div>
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 block">Shahar / Tuman</label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Masalan: Toshkent, Chilonzor tumani"
            className="w-full px-4 h-12 bg-card border border-border/60 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        {/* Region */}
        <div>
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 block">Viloyat</label>
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="w-full px-4 h-12 bg-card border border-border/60 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="">Viloyatni tanlang</option>
            {REGIONS_UZ.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        {/* Default toggle */}
        <button
          onClick={() => { hapticFeedback("selection"); setDefault(v => !v); }}
          className="w-full flex items-center gap-3 bg-card border border-border/60 rounded-2xl px-4 py-3.5 active:bg-muted/40"
        >
          <div className={cn(
            "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
            isDefault ? "border-primary bg-primary" : "border-border"
          )}>
            {isDefault && <CheckCircle2 className="w-3 h-3 text-white" />}
          </div>
          <span className="flex-1 text-left font-medium text-sm">Asosiy manzil sifatida belgilash</span>
        </button>
      </div>
    </div>
  );
}

// ── Address card ───────────────────────────────────────────────
function AddressCard({ addr, onDelete, onSetDefault }: {
  addr: Address;
  onDelete: () => void;
  onSetDefault: () => void;
}) {
  const meta = labelMeta(addr.label);
  const Icon = meta.icon;

  return (
    <div className={cn(
      "glass-card rounded-3xl p-4 shadow-ios-sm",
      addr.isDefault && "ring-2 ring-primary/40"
    )}>
      <div className="flex items-start gap-3">
        <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 mt-0.5", meta.color)}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-bold text-sm">{addr.label}</span>
            {addr.isDefault && (
              <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                <Star className="w-2.5 h-2.5" /> Asosiy
              </span>
            )}
          </div>
          <p className="text-sm text-foreground/80 leading-snug">{addr.address}</p>
          {(addr.city || addr.region) && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {[addr.city, addr.region].filter(Boolean).join(", ")}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/40">
        {!addr.isDefault && (
          <button
            onClick={onSetDefault}
            className="flex-1 h-8 text-xs font-semibold text-primary bg-primary/10 rounded-xl active:scale-95 transition-transform"
          >
            Asosiy qilish
          </button>
        )}
        <button
          onClick={onDelete}
          className="h-8 w-8 rounded-xl bg-red-50 text-red-500 flex items-center justify-center active:scale-95 transition-transform ml-auto"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────
export default function Addresses() {
  const [, navigate] = useLocation();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);

  const tgId = getTgId();

  const loadAddresses = async () => {
    if (!tgId) { setLoading(false); return; }
    try {
      const r = await fetch(`/api/addresses?telegramId=${tgId}`);
      if (r.ok) { const d = await r.json(); setAddresses(d.addresses ?? []); }
    } finally { setLoading(false); }
  };

  useEffect(() => { loadAddresses(); }, []);

  const handleDelete = async (id: string) => {
    hapticFeedback("impact");
    if (!confirm("Manzilni o'chirishni tasdiqlaysizmi?")) return;
    try {
      await fetch(`/api/addresses/${id}`, { method: "DELETE" });
      setAddresses(prev => prev.filter(a => a.id !== id));
      hapticFeedback("success");
    } catch { alert("Xato yuz berdi"); }
  };

  const handleSetDefault = async (id: string) => {
    if (!tgId) return;
    hapticFeedback("selection");
    try {
      const r = await fetch(`/api/addresses/${id}/default`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ telegramId: tgId }),
      });
      if (r.ok) {
        setAddresses(prev => prev.map(a => ({ ...a, isDefault: a.id === id })));
      }
    } catch { alert("Xato yuz berdi"); }
  };

  if (showForm) {
    return <AddressForm onSave={() => { setShowForm(false); loadAddresses(); }} onClose={() => setShowForm(false)} />;
  }

  return (
    <MobileLayout hideNav={false} title="Manzillarim">
      <div className="px-4 pt-4 pb-28">

        {/* Add button at the top */}
        <button
          onClick={() => { hapticFeedback("impact"); setShowForm(true); }}
          className="w-full flex items-center justify-center gap-2 h-12 bg-primary text-white rounded-2xl font-bold text-sm mb-5 shadow-ios-sm shadow-primary/30 active:scale-[0.98] transition-transform"
        >
          <Plus className="w-4 h-4" />
          Yangi manzil qo'shish
        </button>

        {/* Not logged in */}
        {!tgId && (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-3xl bg-muted flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="font-semibold text-base mb-1">Kirish talab qilinadi</p>
            <p className="text-sm text-muted-foreground">Manzillarni saqlash uchun tizimga kiring</p>
          </div>
        )}

        {/* Loading */}
        {loading && tgId && (
          <div className="space-y-3">
            {[1, 2].map(i => (
              <div key={i} className="glass-card rounded-3xl p-4 h-24 animate-pulse bg-muted/40" />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && tgId && addresses.length === 0 && (
          <div className="text-center py-12">
            <div className="w-20 h-20 rounded-[28px] bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-10 h-10 text-primary" />
            </div>
            <p className="font-display font-bold text-lg mb-2">Manzil yo'q</p>
            <p className="text-sm text-muted-foreground leading-relaxed px-4">
              Yetkazib berish uchun manzil qo'shing.<br />Tezkor buyurtma berishga yordam beradi.
            </p>
          </div>
        )}

        {/* Address list */}
        {!loading && addresses.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">
              {addresses.length} ta manzil saqlangan
            </p>
            {addresses.map(addr => (
              <AddressCard
                key={addr.id}
                addr={addr}
                onDelete={() => handleDelete(addr.id)}
                onSetDefault={() => handleSetDefault(addr.id)}
              />
            ))}
          </div>
        )}
      </div>
    </MobileLayout>
  );
}
