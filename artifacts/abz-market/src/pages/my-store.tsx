import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { MobileLayout } from "@/components/layout/MobileLayout";
import {
  Plus, Package, Clock, CheckCircle, XCircle,
  Trash2, X, ChevronDown, ImageIcon,
  AlertCircle, RefreshCw, Star, Send,
  Pencil, RotateCcw, Tag, Palette, Ruler,
} from "lucide-react";
import { hapticFeedback } from "@/hooks/use-telegram";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────
interface SellerInfo { storeId: string; storeName: string; }
interface StoreData {
  id: string; name: string; isVerified: boolean; type: string;
  phone: string | null; location: string | null; productCount: number;
}
interface Product {
  id: string; name: string; price: string; oldPrice: string | null;
  images: string[] | null; categoryId: string | null; categoryName: string | null;
  status: string; isFeatured: boolean; discount: number | null;
  description: string | null; rating: string; reviewCount: number;
  salesCount: number; rejectionReason: string | null;
  colors: string[] | null; sizes: string[] | null; dimensions: string | null;
}
interface Category { id: string; name: string; icon: string | null; }

function loadSeller(): SellerInfo | null {
  try { const r = localStorage.getItem("abz_seller"); return r ? JSON.parse(r) : null; }
  catch { return null; }
}
function formatPrice(n: number) { return n.toLocaleString("ru-RU") + " so'm"; }

const STATUS_MAP = {
  pending:  { label: "Kutilmoqda",   cls: "bg-amber-100 text-amber-700",    icon: Clock },
  approved: { label: "Tasdiqlangan", cls: "bg-emerald-100 text-emerald-700", icon: CheckCircle },
  rejected: { label: "Rad etilgan",  cls: "bg-red-100 text-red-600",        icon: XCircle },
};

// ── Image compression ─────────────────────────────────────────
async function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const MAX = 1200;
        let { width, height } = img;
        if (width > MAX || height > MAX) {
          if (width >= height) { height = Math.round((height * MAX) / width); width = MAX; }
          else { width = Math.round((width * MAX) / height); height = MAX; }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

// ── Auto-detect category ──────────────────────────────────────
const CATEGORY_KW: [string[], string][] = [
  [["divan", "sofa", "kupe divan", "uglovoy", "диван"], "divan"],
  [["kreslo", "armchair", "кресло"], "kreslo"],
  [["stul", "chair", "taburet", "стул"], "stul"],
  [["stol", "masa", "parta", "yozuv", "стол"], "stol"],
  [["shkaf", "javon", "komod", "kommod", "шкаф"], "shkaf"],
  [["karavot", "kravat", "yotoq", "кровать", "bed"], "karavot"],
  [["polka", "shelf", "стеллаж", "stellaj"], "polka"],
  [["deraza", "oyna", "window", "окно"], "deraza"],
  [["eshik", "door", "дверь"], "eshik"],
  [["vanna", "bathroom", "ванна"], "vanna"],
  [["gilamcha", "gilam", "carpet", "kovyor"], "gilamcha"],
  [["lampa", "chiroq", "svetilnik", "lamp"], "lampa"],
];

function detectCategory(name: string, cats: Category[]): string {
  if (!name.trim() || !cats.length) return "";
  const lower = name.toLowerCase();
  // 1. Direct substring match against category names
  for (const c of cats) {
    if (lower.includes(c.name.toLowerCase())) return c.id;
  }
  // 2. Keyword mapping
  for (const [words, pattern] of CATEGORY_KW) {
    if (words.some((w) => lower.includes(w))) {
      const found = cats.find((c) => c.name.toLowerCase().includes(pattern));
      if (found) return found.id;
    }
  }
  return "";
}

// ── Price % calculation ───────────────────────────────────────
function calcPctDiff(newPriceStr: string, oldPriceStr: string): number | null {
  const n = parseFloat(newPriceStr.replace(/[\s,]/g, ""));
  const o = parseFloat(oldPriceStr.replace(/[\s,]/g, ""));
  if (!n || !o || o === 0) return null;
  return Math.round(((n - o) / o) * 100);
}

// ── Preset options ────────────────────────────────────────────
const PRESET_COLORS = ["Oq", "Qora", "Kulrang", "Ko'k", "Yashil", "Qizil", "Sariq", "Jigarrang", "Bej", "Binafsha", "To'q sariq", "Pushti"];
const PRESET_SIZES  = ["S", "M", "L", "XL", "XXL", "XXXL"];

const MAX_IMAGES = 6;

// ── ChipInput ─────────────────────────────────────────────────
function ChipInput({
  label, icon: Icon, items, onAdd, onRemove, placeholder, presets,
}: {
  label: string; icon: React.ElementType; items: string[];
  onAdd: (v: string) => void; onRemove: (i: number) => void;
  placeholder: string; presets?: string[];
}) {
  const [val, setVal] = useState("");
  const add = () => {
    const t = val.trim();
    if (t && !items.includes(t)) onAdd(t);
    setVal("");
  };
  return (
    <div>
      <label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground mb-2">
        <Icon className="w-3.5 h-3.5" /> {label}
      </label>
      {/* Preset chips */}
      {presets && presets.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {presets.map((p) => {
            const active = items.includes(p);
            return (
              <button
                key={p} type="button"
                onClick={() => active ? onRemove(items.indexOf(p)) : onAdd(p)}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all",
                  active
                    ? "bg-primary text-white border-primary"
                    : "bg-muted/60 text-muted-foreground border-border/60 hover:border-primary/40"
                )}
              >{p}</button>
            );
          })}
        </div>
      )}
      {/* Selected chips */}
      {items.filter((i) => !presets?.includes(i)).length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {items.filter((i) => !presets?.includes(i)).map((chip, idx) => (
            <span key={idx} className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-1 bg-primary/10 text-primary rounded-lg text-xs font-semibold">
              {chip}
              <button type="button" onClick={() => onRemove(items.indexOf(chip))} className="hover:text-red-500">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
      {/* Free input */}
      <div className="flex gap-2">
        <input
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
          placeholder={placeholder}
          className="flex-1 h-9 px-3 bg-muted/50 border border-border/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        <button
          type="button" onClick={add} disabled={!val.trim()}
          className="h-9 px-3 bg-primary/10 text-primary rounded-xl text-sm font-bold disabled:opacity-40 hover:bg-primary/20 transition-colors"
        >+ Qo'sh</button>
      </div>
    </div>
  );
}

// ── Product Modal (add & edit) ────────────────────────────────
function ProductModal({
  storeId, categories, onClose, onSaved, editProduct,
}: {
  storeId: string; categories: Category[];
  onClose: () => void; onSaved: () => void;
  editProduct?: Product;
}) {
  const isEdit = !!editProduct;

  const [name, setName]         = useState(editProduct?.name ?? "");
  const [price, setPrice]       = useState(editProduct?.price ?? "");
  const [oldPrice, setOldPrice] = useState(editProduct?.oldPrice ?? "");
  const [desc, setDesc]         = useState(editProduct?.description ?? "");
  const [images, setImages]     = useState<string[]>(editProduct?.images ?? []);
  const [catId, setCatId]       = useState(editProduct?.categoryId ?? "");
  const [colors, setColors]     = useState<string[]>(editProduct?.colors ?? []);
  const [sizes, setSizes]       = useState<string[]>(editProduct?.sizes ?? []);
  const [saving, setSaving]     = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [error, setError]       = useState("");
  const [autoDetected, setAutoDetected] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-detect category when name changes (only if user hasn't manually set it)
  useEffect(() => {
    if (!name.trim() || catId) return;
    const detected = detectCategory(name, categories);
    if (detected) { setCatId(detected); setAutoDetected(true); }
    else setAutoDetected(false);
  }, [name]);

  // Clear auto-detected flag when user manually changes category
  const handleCatChange = (v: string) => { setCatId(v); setAutoDetected(false); };

  const pct = calcPctDiff(price, oldPrice);

  const handleImageFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const remaining = MAX_IMAGES - images.length;
    const toProcess = files.slice(0, remaining);
    setCompressing(true); setError("");
    try {
      const compressed = await Promise.all(
        toProcess.map(async (f) => {
          if (f.size > 15 * 1024 * 1024) throw new Error(`"${f.name}" 15MB dan katta`);
          return compressImage(f);
        })
      );
      setImages((prev) => [...prev, ...compressed].slice(0, MAX_IMAGES));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Rasm yuklanmadi");
    } finally {
      setCompressing(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeImage = (idx: number) => setImages((p) => p.filter((_, i) => i !== idx));

  const handleSubmit = async () => {
    if (!name.trim()) { setError("Mahsulot nomini kiriting"); return; }
    if (!price.trim()) { setError("Narxni kiriting"); return; }
    const priceNum = parseFloat(price.replace(/[\s,]/g, ""));
    if (isNaN(priceNum) || priceNum <= 0) { setError("Narx noto'g'ri"); return; }
    const oldPriceNum = oldPrice ? parseFloat(oldPrice.replace(/[\s,]/g, "")) : null;

    setSaving(true); setError("");
    try {
      let res: Response;
      if (isEdit && editProduct) {
        res = await fetch(`/api/products/${editProduct.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "resubmit",
            name: name.trim(),
            price: String(priceNum),
            oldPrice: oldPriceNum ? String(oldPriceNum) : null,
            description: desc.trim() || null,
            images,
            categoryId: catId || null,
            colors: colors.length ? colors : null,
            sizes: sizes.length ? sizes : null,
          }),
        });
      } else {
        res = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            price: String(priceNum),
            oldPrice: oldPriceNum ? String(oldPriceNum) : null,
            description: desc.trim() || null,
            images,
            categoryId: catId || null,
            storeId,
            colors: colors.length ? colors : null,
            sizes: sizes.length ? sizes : null,
            status: "pending",
          }),
        });
      }
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { error?: string })?.error ?? "Xato yuz berdi");
      }
      hapticFeedback("success");
      onSaved();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Xato yuz berdi, qayta urinib ko'ring");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal panel — flex column with max-height using svh to handle keyboard */}
      <div
        className="relative mt-auto bg-background rounded-t-3xl shadow-2xl flex flex-col"
        style={{ maxHeight: "92svh" }}
      >
        {/* ── Non-scrollable header ── */}
        <div className="shrink-0">
          <div className="w-10 h-1 bg-muted-foreground/30 rounded-full mx-auto mt-3" />
          <div className="flex items-center justify-between px-5 py-4 border-b border-border/60">
            <h2 className="font-display font-bold text-base">
              {isEdit ? "Mahsulotni tahrirlash" : "Mahsulot qo'shish"}
            </h2>
            <button type="button" onClick={onClose}
              className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Scrollable form fields ── */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 px-3 py-2.5 rounded-xl text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Edit mode notice */}
          {isEdit && (
            <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 text-blue-700 px-3 py-2.5 rounded-xl text-sm">
              <RotateCcw className="w-4 h-4 mt-0.5 shrink-0" />
              <span>Ma'lumotlarni to'g'rilang, keyin adminga qayta yuboring</span>
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
              Mahsulot nomi *
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="masalan: 3 eshikli shkaf"
              className="w-full h-11 px-4 bg-muted/50 border border-border/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
              Narxlar
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-[10px] text-muted-foreground mb-1">Yangi narx (so'm) *</div>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="1200000"
                  className="w-full h-11 px-4 bg-muted/50 border border-border/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground mb-1">Eski narx (so'm)</div>
                <input
                  type="number"
                  value={oldPrice}
                  onChange={(e) => setOldPrice(e.target.value)}
                  placeholder="1500000"
                  className="w-full h-11 px-4 bg-muted/50 border border-border/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>

            {/* % badge */}
            {pct !== null && (
              <div className={cn(
                "mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold border",
                pct < 0
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-orange-50 text-orange-700 border-orange-200"
              )}>
                <Tag className="w-3.5 h-3.5" />
                {pct < 0
                  ? `${Math.abs(pct)}% ga arzonlashgan`
                  : `${pct}% ga qimmatlashgan`}
                <span className="text-lg font-black ml-0.5">{pct < 0 ? "−" : "+"}{Math.abs(pct)}%</span>
              </div>
            )}
          </div>

          {/* Category */}
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Kategoriya</label>
              {autoDetected && catId && (
                <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-md font-semibold">
                  ✓ Avtomatik aniqlandi
                </span>
              )}
            </div>
            <div className="relative">
              <select
                value={catId}
                onChange={(e) => handleCatChange(e.target.value)}
                className="w-full h-11 px-4 pr-9 bg-muted/50 border border-border/60 rounded-xl text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="">Kategoriyasiz</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.icon ? c.icon + " " : ""}{c.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          {/* Multi-image picker */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-muted-foreground">
                Rasmlar ({images.length}/{MAX_IMAGES})
              </span>
              {images.length > 0 && (
                <span className="text-[10px] text-muted-foreground">Birinchi rasm — asosiy</span>
              )}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {images.map((src, idx) => (
                <div key={idx}
                  className="relative aspect-square rounded-2xl overflow-hidden bg-muted border-2 border-primary/30">
                  <img src={src} alt={`Rasm ${idx + 1}`} className="w-full h-full object-cover" />
                  {idx === 0 && (
                    <div className="absolute bottom-0 left-0 right-0 bg-primary/80 text-white text-[9px] font-bold text-center py-0.5">
                      Asosiy
                    </div>
                  )}
                  <button type="button" onClick={() => removeImage(idx)}
                    className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center">
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              ))}
              {images.length < MAX_IMAGES && (
                <label htmlFor="multi-img-input"
                  className={cn(
                    "aspect-square rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all",
                    compressing
                      ? "border-primary/40 bg-primary/5"
                      : "border-border active:bg-muted/60"
                  )}>
                  {compressing ? (
                    <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  ) : (
                    <>
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-1">
                        <ImageIcon className="w-5 h-5 text-primary" />
                      </div>
                      <span className="text-[10px] font-semibold text-primary text-center px-1">
                        {images.length === 0 ? "📷 Rasm qo'shish" : "+ Qo'shish"}
                      </span>
                    </>
                  )}
                  <input
                    id="multi-img-input" ref={fileInputRef}
                    type="file" accept="image/*" multiple
                    className="hidden" onChange={handleImageFiles}
                  />
                </label>
              )}
            </div>
            {images.length === 0 && (
              <p className="text-[11px] text-muted-foreground mt-2 text-center">
                Min 1 ta • Maks 6 ta rasm (avtomatik siqiladi)
              </p>
            )}
          </div>

          {/* Colors */}
          <ChipInput
            label="Ranglar" icon={Palette}
            items={colors}
            onAdd={(v) => setColors((p) => [...p, v])}
            onRemove={(i) => setColors((p) => p.filter((_, idx) => idx !== i))}
            placeholder="Rang kiriting (masalan: Ko'k)"
            presets={PRESET_COLORS}
          />

          {/* Sizes */}
          <ChipInput
            label="O'lchamlar (razmerlar)" icon={Ruler}
            items={sizes}
            onAdd={(v) => setSizes((p) => [...p, v])}
            onRemove={(i) => setSizes((p) => p.filter((_, idx) => idx !== i))}
            placeholder="O'lcham (masalan: 120x60x80 sm)"
            presets={PRESET_SIZES}
          />

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
              Tavsif (ixtiyoriy)
            </label>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              rows={3}
              placeholder="Mahsulot haqida qisqacha tavsif: material, xususiyat..."
              className="w-full px-4 py-3 bg-muted/50 border border-border/60 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          {/* Notice */}
          <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 text-sm text-amber-800">
            <Clock className="w-4 h-4 mt-0.5 text-amber-600 shrink-0" />
            <span>Admin tasdiqlashidan so'ng mijozlarga ko'rinadi</span>
          </div>
        </div>

        {/* ── Always-visible footer with submit button ── */}
        <div className="shrink-0 px-5 pt-3 pb-6 border-t border-border/60 bg-background">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving || compressing}
            className="w-full h-14 bg-gradient-to-r from-primary to-violet-500 text-white font-display font-bold text-base rounded-2xl flex items-center justify-center gap-2.5 disabled:opacity-60 shadow-lg shadow-primary/30 active:scale-[0.98] transition-transform"
          >
            {saving ? (
              <>
                <span className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Yuborilmoqda...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                {isEdit ? "Qayta tekshirishga yuborish" : "Adminga yuborish"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────
export default function MyStore() {
  const [, navigate] = useLocation();
  const seller = loadSeller();

  const [store, setStore]           = useState<StoreData | null>(null);
  const [products, setProducts]     = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading]       = useState(true);
  const [showAdd, setShowAdd]       = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [statusFilter, setFilter]   = useState<"all" | "pending" | "approved" | "rejected">("all");

  const loadData = async () => {
    if (!seller) return;
    setLoading(true);
    try {
      const [storeRes, productsRes, catRes] = await Promise.all([
        fetch(`/api/stores/${seller.storeId}`),
        fetch(`/api/products?storeId=${seller.storeId}&status=all`),
        fetch("/api/categories"),
      ]);
      if (storeRes.ok) setStore(await storeRes.json());
      if (productsRes.ok) {
        const d = await productsRes.json();
        setProducts(d.products ?? []);
      }
      if (catRes.ok) {
        const d = await catRes.json();
        setCategories(d.categories ?? d ?? []);
      }
    } finally { setLoading(false); }
  };

  useEffect(() => {
    if (!seller) { navigate("/register-store"); return; }
    loadData();
  }, []);

  // Quick resubmit without editing
  const handleQuickResubmit = async (p: Product) => {
    if (!confirm(`"${p.name}" ni qayta tekshirishga yuborishni tasdiqlaysizmi?`)) return;
    hapticFeedback("impact");
    try {
      const res = await fetch(`/api/products/${p.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "resubmit" }),
      });
      if (!res.ok) throw new Error("Xato");
      hapticFeedback("success");
      loadData();
    } catch {
      alert("Xato yuz berdi, qayta urinib ko'ring");
    }
  };

  if (!seller) return null;

  const filtered = products.filter((p) =>
    statusFilter === "all" ? true : p.status === statusFilter
  );
  const counts = {
    all:      products.length,
    pending:  products.filter((p) => p.status === "pending").length,
    approved: products.filter((p) => p.status === "approved").length,
    rejected: products.filter((p) => p.status === "rejected").length,
  };

  return (
    <MobileLayout hideNav={false} title="Do'konim">
      <div className="px-4 pt-4 pb-24">

        {/* Store header */}
        <div className="bg-gradient-to-br from-primary via-violet-600 to-purple-700 rounded-3xl p-4 mb-5 relative overflow-hidden shadow-ios-lg shadow-primary/30">
          <div className="absolute top-0 right-0 w-28 h-28 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-md" />
          <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-white/5 rounded-full" />
          <div className="relative flex items-center gap-4">
            <div className="w-14 h-14 rounded-[18px] bg-white/20 backdrop-blur-sm flex items-center justify-center font-display font-extrabold text-2xl text-white border border-white/30">
              {seller.storeName[0]}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-display font-bold text-white text-lg leading-tight truncate">{seller.storeName}</h2>
              {store && (
                <div className="flex items-center gap-1.5 mt-1">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full" />
                  <span className="text-white/80 text-xs font-semibold">Tasdiqlangan do'kon</span>
                </div>
              )}
              {store?.location && <p className="text-white/60 text-xs mt-0.5 truncate">{store.location}</p>}
            </div>
          </div>
          {store && (
            <div className="relative grid grid-cols-3 gap-2 mt-4">
              {[
                { label: "Mahsulot",     value: counts.all },
                { label: "Tasdiqlangan", value: counts.approved },
                { label: "Kutilmoqda",   value: counts.pending },
              ].map(({ label, value }) => (
                <div key={label} className="bg-white/15 rounded-2xl p-2.5 text-center backdrop-blur-sm">
                  <div className="font-display font-bold text-white text-lg">{value}</div>
                  <div className="text-white/70 text-[10px] font-medium">{label}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add button */}
        <button
          onClick={() => { hapticFeedback("impact"); setShowAdd(true); }}
          className="w-full h-12 bg-gradient-to-r from-primary to-violet-500 text-white font-display font-bold rounded-2xl flex items-center justify-center gap-2 shadow-ios-md shadow-primary/30 mb-5 press"
        >
          <Plus className="w-5 h-5" /> Mahsulot qo'shish
        </button>

        {/* Status tabs */}
        <div className="flex gap-2 overflow-x-auto pb-0.5 mb-4 scrollbar-none">
          {(["all", "pending", "approved", "rejected"] as const).map((s) => {
            const label = s === "all" ? "Barchasi" : STATUS_MAP[s].label;
            return (
              <button
                key={s} onClick={() => setFilter(s)}
                className={cn(
                  "flex-shrink-0 px-3.5 h-8 rounded-xl text-xs font-bold border transition-all",
                  statusFilter === s
                    ? "bg-primary text-white border-primary"
                    : "bg-card border-border/60 text-muted-foreground"
                )}
              >
                {label}{counts[s] > 0 && <span className="ml-0.5 opacity-70"> ({counts[s]})</span>}
              </button>
            );
          })}
        </div>

        {/* Products */}
        {loading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span className="text-sm">Yuklanmoqda...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Package className="w-12 h-12 mb-3 opacity-20" />
            <p className="text-sm font-medium">
              {statusFilter === "all" ? "Hali mahsulot qo'shilmagan" : STATUS_MAP[statusFilter].label + " mahsulotlar yo'q"}
            </p>
            {statusFilter === "all" && (
              <button onClick={() => { hapticFeedback("impact"); setShowAdd(true); }}
                className="mt-3 px-4 h-9 bg-primary text-white rounded-xl text-sm font-semibold flex items-center gap-1.5">
                <Plus className="w-4 h-4" /> Birinchi mahsulotni qo'shing
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((p) => {
              const st = (p.status as keyof typeof STATUS_MAP) in STATUS_MAP
                ? p.status as keyof typeof STATUS_MAP : "pending";
              const S = STATUS_MAP[st]; const Ic = S.icon;
              const imgs = (p.images ?? []).filter(Boolean);
              const mainImg = imgs[0];

              // Price % for card
              const cardPct = p.oldPrice
                ? calcPctDiff(p.price, p.oldPrice) : null;

              return (
                <div key={p.id} className="glass-card rounded-3xl p-3.5 shadow-ios-sm">
                  <div className="flex gap-3 items-start">
                    {/* Main image */}
                    <div className="w-16 h-16 rounded-2xl bg-muted overflow-hidden shrink-0">
                      {mainImg ? (
                        <img src={mainImg} alt={p.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="w-5 h-5 text-muted-foreground/40" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="font-display font-bold text-sm leading-tight line-clamp-2">{p.name}</div>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="font-bold text-sm text-primary">{formatPrice(Number(p.price))}</span>
                        {p.oldPrice && (
                          <span className="text-xs text-muted-foreground line-through">
                            {formatPrice(Number(p.oldPrice))}
                          </span>
                        )}
                        {cardPct !== null && cardPct < 0 && (
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                            −{Math.abs(cardPct)}%
                          </span>
                        )}
                        {cardPct !== null && cardPct > 0 && (
                          <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded-md">
                            +{cardPct}%
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold", S.cls)}>
                          <Ic className="w-3 h-3" /> {S.label}
                        </span>
                        {p.categoryName && (
                          <span className="text-[10px] text-muted-foreground truncate">{p.categoryName}</span>
                        )}
                      </div>
                      {/* Colors & Sizes */}
                      {((p.colors?.length ?? 0) > 0 || (p.sizes?.length ?? 0) > 0) && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {p.colors?.map((c) => (
                            <span key={c} className="text-[9px] px-1.5 py-0.5 bg-primary/8 text-primary rounded-md font-semibold">{c}</span>
                          ))}
                          {p.sizes?.map((s) => (
                            <span key={s} className="text-[9px] px-1.5 py-0.5 bg-muted text-muted-foreground rounded-md font-semibold">{s}</span>
                          ))}
                        </div>
                      )}
                      {st === "approved" && (
                        <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
                          <span className="flex items-center gap-0.5">
                            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                            {Number(p.rating) > 0 ? Number(p.rating).toFixed(1) : "—"}
                          </span>
                          <span>{p.salesCount} sotuv</span>
                        </div>
                      )}
                      {st === "pending" && (
                        <p className="text-[10px] text-amber-600 mt-1">⏳ Admin tasdiqlashini kutmoqda</p>
                      )}
                    </div>

                    {/* Delete */}
                    <button
                      onClick={async () => {
                        if (!confirm(`"${p.name}" mahsulotini o'chirishni tasdiqlaysizmi?`)) return;
                        await fetch(`/api/products/${p.id}`, { method: "DELETE" });
                        hapticFeedback("impact");
                        setProducts((prev) => prev.filter((x) => x.id !== p.id));
                      }}
                      className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center text-muted-foreground hover:bg-red-100 hover:text-red-500 transition-colors shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Extra thumbnails */}
                  {imgs.length > 1 && (
                    <div className="flex gap-2 mt-2.5 overflow-x-auto scrollbar-none">
                      {imgs.slice(1).map((src, i) => (
                        <div key={i} className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-muted">
                          <img src={src} alt="" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Rejection block */}
                  {st === "rejected" && (
                    <div className="mt-2.5">
                      <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2 mb-2">
                        <p className="text-[10px] font-bold text-red-600 mb-0.5">❌ Rad etildi — Sabab:</p>
                        <p className="text-[11px] text-red-500 leading-snug">
                          {p.rejectionReason ?? "Admin tomonidan rad etildi"}
                        </p>
                      </div>
                      {/* Edit & Resubmit buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => { hapticFeedback("impact"); setEditProduct(p); }}
                          className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold hover:bg-blue-100 transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" /> Tahrirlash
                        </button>
                        <button
                          onClick={() => handleQuickResubmit(p)}
                          className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold hover:bg-amber-100 transition-colors"
                        >
                          <RotateCcw className="w-3.5 h-3.5" /> Qayta yuborish
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add product modal */}
      {showAdd && seller && (
        <ProductModal
          storeId={seller.storeId}
          categories={categories}
          onClose={() => setShowAdd(false)}
          onSaved={() => { setShowAdd(false); hapticFeedback("success"); loadData(); }}
        />
      )}

      {/* Edit product modal */}
      {editProduct && seller && (
        <ProductModal
          storeId={seller.storeId}
          categories={categories}
          editProduct={editProduct}
          onClose={() => setEditProduct(null)}
          onSaved={() => { setEditProduct(null); hapticFeedback("success"); loadData(); }}
        />
      )}
    </MobileLayout>
  );
}
