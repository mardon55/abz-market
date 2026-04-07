import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { MobileLayout } from "@/components/layout/MobileLayout";
import {
  Store, Plus, Package, Clock, CheckCircle, XCircle,
  Trash2, X, ChevronDown, ImageIcon,
  AlertCircle, RefreshCw, Star, Upload,
} from "lucide-react";
import { hapticFeedback } from "@/hooks/use-telegram";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────
interface SellerInfo { storeId: string; storeName: string; }
interface StoreData { id: string; name: string; isVerified: boolean; type: string; phone: string | null; location: string | null; productCount: number; }
interface Product {
  id: string; name: string; price: string; oldPrice: string | null;
  images: string[] | null; categoryId: string | null; categoryName: string | null;
  status: string; isFeatured: boolean; discount: number | null; description: string | null;
  rating: string; reviewCount: number; salesCount: number;
  rejectionReason: string | null;
}
interface Category { id: string; name: string; icon: string | null; }

function loadSeller(): SellerInfo | null {
  try { const r = localStorage.getItem("abz_seller"); return r ? JSON.parse(r) : null; } catch { return null; }
}

function formatPrice(n: number) {
  return n.toLocaleString("ru-RU") + " so'm";
}

const STATUS_MAP = {
  pending:  { label: "Kutilmoqda",   cls: "bg-amber-100 text-amber-700",   icon: Clock },
  approved: { label: "Tasdiqlangan", cls: "bg-emerald-100 text-emerald-700", icon: CheckCircle },
  rejected: { label: "Rad etilgan",  cls: "bg-red-100 text-red-600",       icon: XCircle },
};

// ── Add Product Modal ─────────────────────────────────────────
function AddProductModal({
  storeId,
  categories,
  onClose,
  onAdded,
}: {
  storeId: string;
  categories: Category[];
  onClose: () => void;
  onAdded: () => void;
}) {
  const [name, setName]         = useState("");
  const [price, setPrice]       = useState("");
  const [oldPrice, setOldPrice] = useState("");
  const [desc, setDesc]         = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [catId, setCatId]       = useState("");
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState("");
  const fileInputRef            = useRef<HTMLInputElement>(null);

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError("Rasm 5MB dan kichik bo'lishi kerak"); return; }
    const reader = new FileReader();
    reader.onload = (ev) => setImageUrl(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price.trim()) { setError("Nomi va narxini kiriting"); return; }
    const priceNum = parseFloat(price.replace(/\s/g, "").replace(",", "."));
    if (isNaN(priceNum) || priceNum <= 0) { setError("Narx noto'g'ri"); return; }

    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          price: String(priceNum),
          oldPrice: oldPrice ? String(parseFloat(oldPrice.replace(/\s/g, ""))) : null,
          description: desc.trim() || null,
          images: imageUrl.trim() ? [imageUrl.trim()] : [],
          categoryId: catId || null,
          storeId,
          status: "pending",
        }),
      });
      if (!res.ok) throw new Error("Xato yuz berdi");
      hapticFeedback("success");
      onAdded();
    } catch {
      setError("Mahsulot qo'shilmadi, qayta urinib ko'ring");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative mt-auto bg-background rounded-t-3xl shadow-2xl max-h-[90vh] flex flex-col">
        {/* Handle */}
        <div className="w-10 h-1 bg-muted-foreground/30 rounded-full mx-auto mt-3 mb-0" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/60">
          <h2 className="font-display font-bold text-base">Mahsulot qo'shish</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-xl text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Mahsulot nomi *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="masalan: 3 eshikli shkaf"
              className="w-full h-11 px-4 bg-muted/50 border border-border/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          {/* Price */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Narx (so'm) *</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="1200000"
                className="w-full h-11 px-4 bg-muted/50 border border-border/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Eski narx</label>
              <input
                type="number"
                value={oldPrice}
                onChange={(e) => setOldPrice(e.target.value)}
                placeholder="1500000"
                className="w-full h-11 px-4 bg-muted/50 border border-border/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Kategoriya</label>
            <div className="relative">
              <select
                value={catId}
                onChange={(e) => setCatId(e.target.value)}
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

          {/* Image picker */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Mahsulot rasmi (ixtiyoriy)</label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "relative w-full h-44 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden",
                imageUrl
                  ? "border-primary/40 bg-primary/5"
                  : "border-border hover:border-primary/40 hover:bg-muted/50"
              )}
            >
              {imageUrl ? (
                <>
                  <img src={imageUrl} alt="preview" className="absolute inset-0 w-full h-full object-cover rounded-2xl" />
                  <div className="absolute inset-0 bg-black/40 rounded-2xl flex flex-col items-center justify-center opacity-0 active:opacity-100 transition-opacity">
                    <Upload className="w-6 h-6 text-white mb-1" />
                    <span className="text-white text-xs font-semibold">Rasmni almashtirish</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-3">
                    <ImageIcon className="w-7 h-7 text-primary" />
                  </div>
                  <p className="text-sm font-semibold text-foreground">Galereyadan rasm tanlang</p>
                  <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WEBP • Maks 5MB</p>
                </>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageFile}
            />
            {imageUrl && (
              <button
                type="button"
                onClick={() => { setImageUrl(""); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                className="mt-2 text-xs text-destructive hover:underline"
              >
                Rasmni o'chirish
              </button>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Tavsif (ixtiyoriy)</label>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              rows={3}
              placeholder="Mahsulot haqida qisqacha tavsif..."
              className="w-full px-4 py-3 bg-muted/50 border border-border/60 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          {/* Notice */}
          <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 text-sm text-amber-800">
            <Clock className="w-4 h-4 mt-0.5 text-amber-600 shrink-0" />
            <span>Mahsulot admin tasdiqlashidan so'ng botda ko'rinadi</span>
          </div>
        </form>

        {/* Footer */}
        <div className="px-5 pb-6 pt-3 border-t border-border/60">
          <button
            onClick={(e) => handleSubmit(e as any)}
            disabled={saving}
            className="w-full h-13 bg-gradient-to-r from-primary to-violet-500 text-white font-display font-bold text-base rounded-2xl flex items-center justify-center gap-2 disabled:opacity-60 shadow-lg shadow-primary/30"
          >
            {saving ? (
              <><span className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Yuklanmoqda...</>
            ) : (
              <><CheckCircle className="w-5 h-5" /> Adminga yuborish</>
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!seller) { navigate("/register-store"); return; }
    loadData();
  }, []);

  const handleProductAdded = () => {
    setShowAdd(false);
    hapticFeedback("success");
    loadData();
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`"${name}" mahsulotini o'chirishni tasdiqlaysizmi?`)) return;
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    hapticFeedback("impact");
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  if (!seller) return null;

  const filtered = products.filter((p) =>
    statusFilter === "all" ? true : p.status === statusFilter
  );

  const counts = {
    all: products.length,
    pending: products.filter((p) => p.status === "pending").length,
    approved: products.filter((p) => p.status === "approved").length,
    rejected: products.filter((p) => p.status === "rejected").length,
  };

  return (
    <MobileLayout hideNav={false} title="Do'konim">
      <div className="px-4 pt-4 pb-24">

        {/* Store header card */}
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
              {store?.location && (
                <p className="text-white/60 text-xs mt-0.5 truncate">{store.location}</p>
              )}
            </div>
          </div>

          {/* Mini stats */}
          {store && (
            <div className="relative grid grid-cols-3 gap-2 mt-4">
              {[
                { label: "Mahsulot", value: counts.all },
                { label: "Tasdiqlangan", value: counts.approved },
                { label: "Kutilmoqda", value: counts.pending },
              ].map(({ label, value }) => (
                <div key={label} className="bg-white/15 rounded-2xl p-2.5 text-center backdrop-blur-sm">
                  <div className="font-display font-bold text-white text-lg">{value}</div>
                  <div className="text-white/70 text-[10px] font-medium">{label}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add product button */}
        <button
          onClick={() => { hapticFeedback("impact"); setShowAdd(true); }}
          className="w-full h-12 bg-gradient-to-r from-primary to-violet-500 text-white font-display font-bold rounded-2xl flex items-center justify-center gap-2 shadow-ios-md shadow-primary/30 mb-5 press"
        >
          <Plus className="w-5 h-5" />
          Mahsulot qo'shish
        </button>

        {/* Status filter tabs */}
        <div className="flex gap-2 overflow-x-auto pb-0.5 mb-4 scrollbar-none">
          {(["all", "pending", "approved", "rejected"] as const).map((s) => {
            const label = s === "all" ? "Barchasi" : STATUS_MAP[s].label;
            const count = counts[s];
            return (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={cn(
                  "flex-shrink-0 px-3.5 h-8 rounded-xl text-xs font-bold border transition-all",
                  statusFilter === s
                    ? "bg-primary text-white border-primary"
                    : "bg-card border-border/60 text-muted-foreground hover:text-foreground"
                )}
              >
                {label} {count > 0 && <span className="ml-0.5 opacity-70">({count})</span>}
              </button>
            );
          })}
        </div>

        {/* Products list */}
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
              <button
                onClick={() => { hapticFeedback("impact"); setShowAdd(true); }}
                className="mt-3 px-4 h-9 bg-primary text-white rounded-xl text-sm font-semibold flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Birinchi mahsulotni qo'shing
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((p) => {
              const st = (p.status as keyof typeof STATUS_MAP) in STATUS_MAP ? p.status as keyof typeof STATUS_MAP : "pending";
              const S = STATUS_MAP[st];
              const Ic = S.icon;
              const img = p.images?.[0];
              return (
                <div key={p.id} className="glass-card rounded-3xl p-3.5 shadow-ios-sm flex gap-3 items-start">
                  {/* Image */}
                  <div className="w-16 h-16 rounded-2xl bg-muted overflow-hidden shrink-0">
                    {img ? (
                      <img src={img} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-5 h-5 text-muted-foreground/40" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="font-display font-bold text-sm leading-tight line-clamp-2">{p.name}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-bold text-sm text-primary">{formatPrice(Number(p.price))}</span>
                      {p.oldPrice && (
                        <span className="text-xs text-muted-foreground line-through">{formatPrice(Number(p.oldPrice))}</span>
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
                    {st === "approved" && (
                      <div className="flex items-center gap-3 mt-1.5 text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-0.5">
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                          {Number(p.rating) > 0 ? Number(p.rating).toFixed(1) : "—"}
                        </span>
                        <span>{p.salesCount} sotuv</span>
                      </div>
                    )}
                    {st === "rejected" && (
                      <div className="mt-1.5 bg-red-50 border border-red-200 rounded-lg px-2 py-1.5">
                        <p className="text-[10px] font-bold text-red-600 mb-0.5">Rad etildi</p>
                        {p.rejectionReason ? (
                          <p className="text-[10px] text-red-500 leading-tight">{p.rejectionReason}</p>
                        ) : (
                          <p className="text-[10px] text-red-400">Admin tomonidan rad etildi</p>
                        )}
                      </div>
                    )}
                    {st === "pending" && (
                      <p className="text-[10px] text-amber-600 mt-1">⏳ Admin tasdiqlashini kutmoqda</p>
                    )}
                  </div>

                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(p.id, p.name)}
                    className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center text-muted-foreground hover:bg-red-100 hover:text-red-500 transition-colors shrink-0 mt-0.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add product modal */}
      {showAdd && seller && (
        <AddProductModal
          storeId={seller.storeId}
          categories={categories}
          onClose={() => setShowAdd(false)}
          onAdded={handleProductAdded}
        />
      )}
    </MobileLayout>
  );
}
