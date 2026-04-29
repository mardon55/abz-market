import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { MobileLayout } from "@/components/layout/MobileLayout";
import {
  Plus, Package, Clock, CheckCircle, XCircle,
  Trash2, X, ChevronDown, ImageIcon,
  AlertCircle, RefreshCw, Star, Send,
  Pencil, RotateCcw, Tag,
  ToggleLeft, ToggleRight, Settings, Camera, Save,
  MapPin, Phone, Store,
} from "lucide-react";
import { hapticFeedback } from "@/hooks/use-telegram";
import { cn } from "@/lib/utils";

import { CATEGORY_SPECS, getSpecForCategory, detectCategory, type CategorySpec, type Category } from "@/lib/category-specs";
import { calcPctDiff, serializeSpecs, MAX_IMAGES } from "@/lib/specs-utils";
import { ChipInput } from "@/components/ChipInput";
import { SpecSection } from "@/components/SpecSection";

// ── Types ─────────────────────────────────────────────────────
interface SellerInfo { storeId: string; storeName: string; }
interface StoreData {
  id: string; name: string; isVerified: boolean; type: string;
  phone: string | null; location: string | null; productCount: number;
  logo: string | null; description: string | null;
}
interface Product {
  id: string; name: string; price: string; oldPrice: string | null;
  images: string[] | null; categoryId: string | null; categoryName: string | null;
  status: string; isFeatured: boolean; discount: number | null;
  description: string | null; rating: string; reviewCount: number;
  salesCount: number; rejectionReason: string | null;
  colors: string[] | null; sizes: string[] | null; dimensions: string | null;
  deliveryDays: number | null; quantity: number | null;
  warranty: string | null;
}


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

// ── Image compression + 3:4 ratio validation ──────────────────
// 3:4 = 0.75 | ±6% tolerance: [0.705, 0.795]
const TARGET_RATIO = 3 / 4;
const RATIO_TOLERANCE = 0.06;

async function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const ratio = img.naturalWidth / img.naturalHeight;
        if (Math.abs(ratio - TARGET_RATIO) > RATIO_TOLERANCE) {
          const pct = Math.round(ratio * 100);
          reject(new Error(
            `"${file.name}" 3:4 formatda emas (${img.naturalWidth}×${img.naturalHeight}). ` +
            `Iltimos 3:4 rasm yuklang (masalan: 900×1200).`
          ));
          return;
        }
        const MAX = 1200;
        let { naturalWidth: width, naturalHeight: height } = img;
        if (width > MAX || height > MAX) {
          if (width >= height) { height = Math.round((height * MAX) / width); width = MAX; }
          else { width = Math.round((width * MAX) / height); height = MAX; }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width; canvas.height = height;
        canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}


// ── Product Modal ─────────────────────────────────────────────
function ProductModal({ storeId, categories, onClose, onSaved, editProduct }: {
  storeId: string; categories: Category[];
  onClose: () => void; onSaved: () => void;
  editProduct?: Product;
}) {
  const isEdit = !!editProduct;

  // Parse specs from dimensions string on edit
  const parseEditSpecs = (): Record<string, string> => {
    if (!editProduct?.dimensions) return {};
    const specs: Record<string, string> = {};
    editProduct.dimensions.split("|").forEach((part) => {
      const [k, ...rest] = part.split(":").map((s) => s.trim());
      if (k && rest.length) {
        // Reverse-lookup field key by label
        for (const cs of CATEGORY_SPECS) {
          const f = cs.fields.find((fd) => fd.label === k);
          if (f) { specs[f.key] = rest.join(":").trim().replace(/ (sm|W|kg)$/, ""); break; }
        }
      }
    });
    return specs;
  };

  const [name, setName]         = useState(editProduct?.name ?? "");
  const [price, setPrice]       = useState(editProduct?.price ?? "");
  const [oldPrice, setOldPrice] = useState(editProduct?.oldPrice ?? "");
  const [desc, setDesc]         = useState(editProduct?.description ?? "");
  const [images, setImages]     = useState<string[]>(editProduct?.images ?? []);
  // Find parent category id for a given sub-category id
  const findParentId = (subId: string): string => {
    for (const p of categories) {
      if (p.subcategories?.some((s) => s.id === subId)) return p.id;
      if (p.id === subId) return p.id;
    }
    return "";
  };

  const [parentCatId, setParentCatId] = useState(() =>
    editProduct?.categoryId ? findParentId(editProduct.categoryId) : ""
  );
  const [catId, setCatId]       = useState(editProduct?.categoryId ?? "");
  const [colors, setColors]     = useState<string[]>([]);
  const [sizes, setSizes]       = useState<string[]>([]);
  const [productColor, setProductColor] = useState<string>(editProduct?.colors?.[0] ?? "");
  const [productSize, setProductSize]   = useState<string>(editProduct?.sizes?.[0] ?? "");
  const [specs, setSpecs]       = useState<Record<string, string>>(parseEditSpecs);
  const [deliveryDays, setDeliveryDays] = useState<string>(
    editProduct?.deliveryDays ? String(editProduct.deliveryDays) : "3"
  );
  const [quantity, setQuantity] = useState<string>(
    editProduct?.quantity ? String(editProduct.quantity) : "1"
  );
  const [warranty, setWarranty] = useState<string>(
    editProduct?.warranty ?? "1 yil"
  );
  const [saving, setSaving]     = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [error, setError]       = useState("");
  const [autoDetected, setAutoDetected] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedParent = categories.find((p) => p.id === parentCatId);
  const subCats = selectedParent?.subcategories ?? [];

  // Auto-detect category
  useEffect(() => {
    if (!name.trim() || catId) return;
    const detected = detectCategory(name, categories);
    if (detected) {
      setCatId(detected);
      setParentCatId(findParentId(detected));
      setAutoDetected(true);
    } else setAutoDetected(false);
  }, [name]);

  const handleParentCatChange = (v: string) => {
    setParentCatId(v);
    setCatId(""); // reset subcategory
    setSpecs({});
    setAutoDetected(false);
  };
  const handleCatChange = (v: string) => { setCatId(v); setAutoDetected(false); setSpecs({}); };
  const updateSpec = (key: string, val: string) => setSpecs((p) => ({ ...p, [key]: val }));
  const pct = calcPctDiff(price, oldPrice);

  // Get current subcategory and spec def
  const currentCat = subCats.find((s) => s.id === catId)
    ?? (subCats.length === 0 ? selectedParent : null);
  const specDef = getSpecForCategory(currentCat?.name ?? null);

  // Rang + Razmer faqat kiyim, poyabzal, aksessuarlar uchun
  const COLOR_SIZE_CATS = [
    "Erkaklar kiyimlari","Ayollar kiyimlari","Bolalar kiyimlari","Sport kiyimlari","Ichki kiyim",
    "Erkaklar poyabzali","Ayollar poyabzali","Bolalar poyabzali","Sport poyabzali",
    "Sumkalar","Hamyonlar","Zargarlik va bijuteriya","Soatlar","Ko'zoynak","Kamarlar","Shlyapalar va qalpoqlar","Telefon aksessuarlari",
    "O'yinchoqlar",
  ];
  const showColorSize = COLOR_SIZE_CATS.some(n => n === currentCat?.name);

  const handleImageFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const toProcess = files.slice(0, MAX_IMAGES - images.length);
    setCompressing(true); setError("");
    try {
      const compressed = await Promise.all(toProcess.map(async (f) => {
        if (f.size > 15 * 1024 * 1024) throw new Error(`"${f.name}" 15MB dan katta`);
        return compressImage(f);
      }));
      setImages((p) => [...p, ...compressed].slice(0, MAX_IMAGES));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Rasm yuklanmadi");
    } finally {
      setCompressing(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) { setError("Mahsulot nomini kiriting"); return; }
    if (!price.trim()) { setError("Narxni kiriting"); return; }
    if (!parentCatId) { setError("Asosiy kategoriyani tanlang"); return; }
    if (subCats.length > 0 && !catId) { setError("Sub kategoriyani tanlang"); return; }
    const priceNum = parseFloat(price.replace(/[\s,]/g, ""));
    if (isNaN(priceNum) || priceNum <= 0) { setError("Narx noto'g'ri"); return; }
    const oldPriceNum = oldPrice ? parseFloat(oldPrice.replace(/[\s,]/g, "")) : null;
    const dimensionsStr = specDef ? serializeSpecs(specs, specDef) : null;

    // Use subcategory id if available, else parent category id
    const finalCatId = (subCats.length > 0 ? catId : parentCatId) || null;

    setSaving(true); setError("");
    try {
      const body: Record<string, unknown> = {
        name: name.trim(), price: String(priceNum),
        oldPrice: oldPriceNum ? String(oldPriceNum) : null,
        description: desc.trim() || null, images,
        categoryId: finalCatId, storeId,
        colors: productColor.trim() ? [productColor.trim()] : null,
        sizes: productSize.trim() ? [productSize.trim()] : null,
        dimensions: dimensionsStr || null,
        deliveryDays: parseInt(deliveryDays) || 3,
        quantity: parseInt(quantity) || 1,
        warranty: warranty || "1 yil",
      };

      let res: Response;
      if (isEdit && editProduct) {
        res = await fetch(`/api/products/${editProduct.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...body, action: "resubmit" }),
        });
      } else {
        res = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...body, status: "pending" }),
        });
      }
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        throw new Error((b as { error?: string }).error ?? "Xato yuz berdi");
      }
      hapticFeedback("success");
      onSaved();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Xato yuz berdi");
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative mt-auto bg-background rounded-t-3xl shadow-2xl flex flex-col" >

        {/* Header */}
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

        {/* Submit button — always visible at top */}
        <div className="shrink-0 px-5 pt-3 pb-3 border-b border-border/60 bg-background">
          <button type="button" onClick={handleSubmit} disabled={saving || compressing}
            className="w-full h-14 bg-gradient-to-r from-primary to-violet-500 text-white font-display font-bold text-base rounded-2xl flex items-center justify-center gap-2.5 disabled:opacity-60 shadow-lg shadow-primary/30 active:scale-[0.98] transition-transform"
          >
            {saving
              ? <><span className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />Yuborilmoqda...</>
              : <><Send className="w-5 h-5" />{isEdit ? "Qayta tekshirishga yuborish" : "Adminga yuborish"}</>}
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto px-5 py-4 pb-2 space-y-4 max-h-[55vh]">
          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 px-3 py-2.5 rounded-xl text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" /><span>{error}</span>
            </div>
          )}
          {isEdit && editProduct?.status === "approved" && (
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 text-amber-800 px-3 py-2.5 rounded-xl text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-amber-600" />
              <span>⚠️ Tasdiqlangan mahsulotni tahrirlasangiz, u admin qayta tasdiqlashiga yuboriladi va vaqtincha ko'rinmay qoladi.</span>
            </div>
          )}
          {isEdit && editProduct?.status !== "approved" && (
            <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 text-blue-700 px-3 py-2.5 rounded-xl text-sm">
              <RotateCcw className="w-4 h-4 mt-0.5 shrink-0" />
              <span>Ma'lumotlarni to'g'rilang — keyin adminga qayta yuboring</span>
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Mahsulot nomi *</label>
            <input value={name} onChange={(e) => setName(e.target.value)}
              placeholder="masalan: 3 eshikli kupe shkaf"
              className="w-full h-11 px-4 bg-muted/50 border border-border/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          {/* Category — 2 bosqichli tanlash */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-muted-foreground">Kategoriya *</label>
              {autoDetected && catId && (
                <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-md font-semibold">
                  ✓ Avtomatik aniqlandi
                </span>
              )}
            </div>

            {/* Step 1: Parent Category */}
            <div className="relative">
              <select
                value={parentCatId}
                onChange={(e) => handleParentCatChange(e.target.value)}
                className="w-full h-11 px-4 pr-9 bg-muted/50 border border-border/60 rounded-xl text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="">— Asosiy kategoriya tanlang —</option>
                {categories.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.icon ? p.icon + " " : ""}{p.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>

            {/* Step 2: Subcategory (only if parent has subcategories) */}
            {parentCatId && subCats.length > 0 && (
              <div className="relative">
                <select
                  value={catId}
                  onChange={(e) => handleCatChange(e.target.value)}
                  className="w-full h-11 px-4 pr-9 bg-primary/5 border border-primary/30 rounded-xl text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="">— Sub kategoriya tanlang —</option>
                  {subCats.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.icon ? sub.icon + " " : ""}{sub.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/60 pointer-events-none" />
              </div>
            )}

            {specDef && (
              <p className="text-[11px] text-primary font-semibold">
                {specDef.emoji} {specDef.names[0]} uchun qo'shimcha ma'lumotlar quyida so'raladi ↓
              </p>
            )}
          </div>

          {/* Category-specific spec fields */}
          {specDef && (
            <SpecSection specDef={specDef} specs={specs} onChange={updateSpec} />
          )}

          {/* Prices */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Narxlar</label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-[10px] text-muted-foreground mb-1">Joriy narx (so'm) *</div>
                <input type="number" value={price} onChange={(e) => setPrice(e.target.value)}
                  placeholder="1200000"
                  className="w-full h-11 px-4 bg-muted/50 border border-border/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground mb-1">Eski narx (chegirmadan avval)</div>
                <input type="number" value={oldPrice} onChange={(e) => setOldPrice(e.target.value)}
                  placeholder="1500000"
                  className="w-full h-11 px-4 bg-muted/50 border border-border/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>
            {pct !== null && (
              <div className={cn("mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold border",
                pct < 0
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-orange-50 text-orange-700 border-orange-200"
              )}>
                <Tag className="w-3.5 h-3.5" />
                {pct < 0
                  ? <><span className="text-lg font-black">−{Math.abs(pct)}%</span> ga arzonlashgan</>
                  : <><span className="text-lg font-black">+{pct}%</span> ga qimmatlashgan</>}
              </div>
            )}
          </div>

          {/* Images */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-muted-foreground">
                Rasmlar ({images.length}/{MAX_IMAGES})
              </span>
              {images.length > 0 && <span className="text-[10px] text-muted-foreground">Birinchi — asosiy rasm</span>}
            </div>
            {/* 3:4 format haqida xabar */}
            <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-xl px-3 py-2 mb-2">
              <span className="text-blue-600 text-base leading-none">📐</span>
              <span className="text-[10px] text-blue-700 font-medium">
                Faqat <b>3:4</b> formatdagi rasmlar qabul qilinadi (masalan: 900×1200, 600×800 px)
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {images.map((src, idx) => (
                <div key={idx} className="relative rounded-2xl overflow-hidden bg-muted border-2 border-primary/30" style={{aspectRatio: "3/4"}}>
                  <img src={src} alt="" className="w-full h-full object-cover" />
                  {idx === 0 && (
                    <div className="absolute bottom-0 inset-x-0 bg-primary/80 text-white text-[9px] font-bold text-center py-0.5">Asosiy</div>
                  )}
                  <button type="button" onClick={() => setImages((p) => p.filter((_, i) => i !== idx))}
                    className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center">
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              ))}
              {images.length < MAX_IMAGES && (
                <label htmlFor="mi-inp" className={cn(
                  "rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all",
                  compressing ? "border-primary/40 bg-primary/5" : "border-border active:bg-muted/60"
                )} style={{aspectRatio: "3/4"}}>
                  {compressing
                    ? <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                    : (
                      <>
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-1">
                          <ImageIcon className="w-5 h-5 text-primary" />
                        </div>
                        <span className="text-[10px] font-semibold text-primary text-center px-1">
                          {images.length === 0 ? "Rasm qo'shish" : "+ Qo'shish"}
                        </span>
                        <span className="text-[9px] text-muted-foreground text-center px-1 mt-0.5">3:4 format</span>
                      </>
                    )}
                  <input id="mi-inp" ref={fileInputRef} type="file" accept="image/*" multiple
                    className="hidden" onChange={handleImageFiles} />
                </label>
              )}
            </div>
            {images.length === 0 && (
              <p className="text-[11px] text-muted-foreground mt-2 text-center">1–6 ta rasm | maks 15MB | faqat 3:4</p>
            )}
          </div>

          {/* Rang + Razmer — faqat tegishli kategoriyalarda */}
          {showColorSize && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-muted-foreground mb-1">🎨 Rang</label>
                <input
                  value={productColor}
                  onChange={(e) => setProductColor(e.target.value)}
                  placeholder="Masalan: Qora"
                  className="w-full h-9 px-2.5 bg-muted/50 border border-border/60 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-muted-foreground mb-1">📐 Razmer</label>
                <input
                  value={productSize}
                  onChange={(e) => setProductSize(e.target.value)}
                  placeholder="Masalan: XL"
                  className="w-full h-9 px-2.5 bg-muted/50 border border-border/60 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>
          )}

          {/* Delivery days */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
              🚚 Yetkazib berish muddati *
            </label>
            <div className="relative">
              <select
                value={deliveryDays}
                onChange={(e) => setDeliveryDays(e.target.value)}
                className="w-full h-11 px-4 pr-9 bg-muted/50 border border-border/60 rounded-xl text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="1">1 kun ichida (ekpress)</option>
                <option value="2">2 kun ichida</option>
                <option value="3">3 kun ichida</option>
                <option value="5">3–5 kun ichida</option>
                <option value="7">5–7 kun ichida</option>
                <option value="14">7–14 kun ichida</option>
                <option value="30">14–30 kun ichida</option>
                <option value="0">Kelishiladi (aloqa orqali)</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          {/* Warranty */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
              🛡️ Kafolat muddati *
            </label>
            <div className="relative">
              <select
                value={warranty}
                onChange={(e) => setWarranty(e.target.value)}
                className="w-full h-11 px-4 pr-9 bg-muted/50 border border-border/60 rounded-xl text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="3 oy">3 oy</option>
                <option value="6 oy">6 oy</option>
                <option value="1 yil">1 yil</option>
                <option value="1.5 yil">1.5 yil</option>
                <option value="2 yil">2 yil</option>
                <option value="3 yil">3 yil</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
              📦 Ombordagi miqdor (dona) *
            </label>
            <input
              type="number"
              min="1"
              max="9999"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="1"
              className="w-full h-11 px-4 bg-muted/50 border border-border/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Qo'shimcha tavsif (ixtiyoriy)</label>
            <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={3}
              placeholder="Mahsulot haqida qo'shimcha ma'lumot: yig'ish, kafolat, maxsus xususiyatlar..."
              className="w-full px-4 py-3 bg-muted/50 border border-border/60 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 text-sm text-amber-800">
            <Clock className="w-4 h-4 mt-0.5 text-amber-600 shrink-0" />
            <span>Admin tasdiqlashidan so'ng 24 soat ichida mijozlarga ko'rinadi</span>
          </div>
        </div>

      </div>
    </div>
  );
}

// ── Edit Store Modal ──────────────────────────────────────────
function EditStoreModal({
  storeId, storeName: initialName, onClose, onSaved,
}: {
  storeId: string; storeName: string; onClose: () => void; onSaved: (name: string) => void;
}) {
  const [storeData, setStoreData] = useState<Record<string, string> | null>(null);
  const [name,        setName]        = useState(initialName);
  const [phone,       setPhone]       = useState("");
  const [location,    setLocation]    = useState("");
  const [description, setDescription] = useState("");
  const [logo,        setLogo]        = useState<string | undefined>();
  const [saving,      setSaving]      = useState(false);
  const [error,       setError]       = useState("");
  const [done,        setDone]        = useState(false);
  const logoRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch(`/api/stores/${storeId}`)
      .then((r) => r.ok ? r.json() : null)
      .then((s) => {
        if (!s) return;
        setStoreData(s);
        setName(s.name ?? initialName);
        setPhone(s.phone ?? "");
        setLocation(s.location ?? "");
        setDescription(s.description ?? "");
        setLogo(s.logo ?? undefined);
      }).catch(() => {});
  }, [storeId]);

  const handleLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try { setLogo(await compressImage(file)); setError(""); }
    catch { setError("Rasmni yuklab bo'lmadi"); }
  };

  const handleSave = async () => {
    if (!name.trim()) { setError("Do'kon nomi kiritilsin"); return; }
    setSaving(true); setError("");
    try {
      const body: Record<string, string | undefined> = { name: name.trim(), phone, location, description };
      if (logo !== undefined) body.logo = logo;
      await fetch(`/api/stores/${storeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      try {
        const raw = localStorage.getItem("abz_seller");
        if (raw) {
          const s = JSON.parse(raw);
          s.storeName = name.trim();
          localStorage.setItem("abz_seller", JSON.stringify(s));
        }
      } catch {}
      hapticFeedback("success");
      setDone(true);
      setTimeout(() => { onSaved(name.trim()); onClose(); }, 900);
    } catch {
      setError("Saqlashda xatolik");
      hapticFeedback("error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end max-w-[430px] mx-auto" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative bg-background rounded-t-3xl shadow-2xl flex flex-col"
        style={{ height: "80vh" }}
        onClick={(e) => e.stopPropagation()}>
        <div className="shrink-0">
          <div className="w-10 h-1 bg-muted-foreground/30 rounded-full mx-auto mt-3" />
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border/60">
            <button onClick={onClose} className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center shrink-0">
              <X className="w-4 h-4" />
            </button>
            <h2 className="font-display font-bold text-sm flex-1 text-center">Do'konni sozlash</h2>
            {!done && storeData !== null && (
              <button onClick={handleSave} disabled={saving}
                className="shrink-0 h-8 px-4 bg-primary text-white font-bold text-sm rounded-xl flex items-center gap-1.5 disabled:opacity-60 active:scale-95 transition-transform">
                {saving
                  ? <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  : <><Save className="w-3.5 h-3.5" /> Saqlash</>}
              </button>
            )}
          </div>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto px-5 py-5 pb-6 space-y-4">
          {done ? (
            <div className="flex flex-col items-center py-10 gap-4">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-primary" />
              </div>
              <p className="font-display font-bold text-lg">Saqlandi!</p>
            </div>
          ) : storeData === null ? (
            <div className="flex items-center justify-center py-10">
              <div className="w-6 h-6 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
            </div>
          ) : (
            <>
              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-3 py-2.5 rounded-xl text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" />{error}
                </div>
              )}
              {/* Logo */}
              <div className="flex flex-col items-center gap-3">
                <div className="relative">
                  <div className="w-24 h-24 rounded-[28px] bg-muted overflow-hidden flex items-center justify-center border-2 border-border/60">
                    {logo ? <img src={logo} alt="logo" className="w-full h-full object-cover" />
                           : <ImageIcon className="w-8 h-8 text-muted-foreground/40" />}
                  </div>
                  <button type="button" onClick={() => logoRef.current?.click()}
                    className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center shadow-lg">
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
                <button type="button" onClick={() => logoRef.current?.click()}
                  className="text-primary text-sm font-semibold">Logo yuklash</button>
                <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={handleLogo} />
              </div>
              {/* Name */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Do'kon nomi *</label>
                <input value={name} onChange={(e) => setName(e.target.value)}
                  className="w-full h-11 px-4 bg-muted/50 border border-border/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              {/* Phone */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Telefon</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" placeholder="+998 90 123 45 67"
                    className="w-full pl-10 pr-4 h-11 bg-muted/50 border border-border/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
              </div>
              {/* Location */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Manzil</label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Toshkent, Chilonzor tumani"
                    className="w-full pl-10 pr-4 h-11 bg-muted/50 border border-border/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
              </div>
              {/* Description */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Tavsif</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
                  placeholder="Do'kon haqida qisqacha ma'lumot..."
                  className="w-full px-4 py-3 bg-muted/50 border border-border/60 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
}

// ── Store switcher helpers ────────────────────────────────────
function loadAllStores(): SellerInfo[] {
  try {
    const raw = localStorage.getItem("abz_stores");
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

// ── Helpers ───────────────────────────────────────────────────
function getTelegramId(): string {
  try {
    const id = (window as any).Telegram?.WebApp?.initDataUnsafe?.user?.id;
    if (id) return String(id);
    return localStorage.getItem("tg_user_id") ?? "";
  } catch { return ""; }
}

// ── Main page ─────────────────────────────────────────────────
export default function MyStore() {
  const [, navigate] = useLocation();
  const [activeSeller, setActiveSeller] = useState<SellerInfo | null>(loadSeller);
  const [allStores, setAllStores]       = useState<SellerInfo[]>(loadAllStores);
  const [showSwitcher, setShowSwitcher] = useState(false);
  const [autoDetecting, setAutoDetecting] = useState(!loadSeller()); // true while resolving
  const [showTgIdInput, setShowTgIdInput] = useState(false);
  const [manualTgId, setManualTgId] = useState("");
  const [tgIdSearching, setTgIdSearching] = useState(false);

  const [store, setStore]             = useState<StoreData | null>(null);
  const [products, setProducts]       = useState<Product[]>([]);
  const [categories, setCategories]   = useState<Category[]>([]);
  const [loading, setLoading]         = useState(true);
  const [showAdd, setShowAdd]           = useState(false);
  const [editProduct, setEditProduct]   = useState<Product | null>(null);
  const [showStoreEdit, setShowStoreEdit] = useState(false);
  const [statusFilter, setFilter]       = useState<"all"|"pending"|"approved"|"rejected">("all");

  const seller = activeSeller;

  const loadData = async (sel = activeSeller) => {
    if (!sel) return;
    setLoading(true);
    setStore(null);
    setProducts([]);
    try {
      const [storeRes, prodsRes, catRes] = await Promise.all([
        fetch(`/api/stores/${sel.storeId}`),
        fetch(`/api/products?storeId=${sel.storeId}&status=all`),
        fetch("/api/categories"),
      ]);
      if (storeRes.ok) setStore(await storeRes.json());
      if (prodsRes.ok) { const d = await prodsRes.json(); setProducts(d.products ?? []); }
      if (catRes.ok)   { const d = await catRes.json(); setCategories(d.categories ?? d ?? []); }
    } finally { setLoading(false); }
  };

  useEffect(() => {
    if (activeSeller) {
      setAutoDetecting(false);
      loadData(activeSeller);
      return;
    }

    // No localStorage entry — try to find stores by Telegram ID
    const tgId = getTelegramId();
    if (!tgId) {
      // No Telegram context — show manual ID input instead of redirect
      setAutoDetecting(false);
      setShowTgIdInput(true);
      return;
    }

    fetch(`/api/stores?telegramId=${tgId}`)
      .then(r => r.json())
      .then(d => {
        const stores: any[] = d.stores ?? [];
        if (stores.length === 0) {
          navigate("/register-store");
          return;
        }
        // Build SellerInfo entries and persist to localStorage
        const entries: SellerInfo[] = stores.map(s => ({ storeId: s.id, storeName: s.name }));
        try { localStorage.setItem("abz_stores", JSON.stringify(entries)); } catch {}
        try { localStorage.setItem("abz_seller", JSON.stringify(entries[0])); } catch {}
        setAllStores(entries);
        setActiveSeller(entries[0]);
        setAutoDetecting(false);
      })
      .catch(() => {
        setAutoDetecting(false);
        setShowTgIdInput(true);
      });
  }, []);

  const handleManualTgIdSearch = async () => {
    const id = manualTgId.trim();
    if (!id) return;
    setTgIdSearching(true);
    try {
      const r = await fetch(`/api/stores?telegramId=${id}`);
      const d = await r.json();
      const stores: any[] = d.stores ?? [];
      if (stores.length === 0) {
        navigate("/register-store");
        return;
      }
      const entries: SellerInfo[] = stores.map(s => ({ storeId: s.id, storeName: s.name }));
      try { localStorage.setItem("tg_user_id", id); } catch {}
      try { localStorage.setItem("abz_stores", JSON.stringify(entries)); } catch {}
      try { localStorage.setItem("abz_seller", JSON.stringify(entries[0])); } catch {}
      setAllStores(entries);
      setActiveSeller(entries[0]);
      setShowTgIdInput(false);
      // loadData ni to'g'ridan-to'g'ri chaqiramiz (useEffect qayta ishga tushmasligi uchun)
      loadData(entries[0]);
    } catch {
      navigate("/register-store");
    } finally {
      setTgIdSearching(false);
    }
  };

  const switchStore = (s: SellerInfo) => {
    hapticFeedback("selection");
    try { localStorage.setItem("abz_seller", JSON.stringify(s)); } catch {}
    setActiveSeller(s);
    setShowSwitcher(false);
    setFilter("all");
  };

  const handleQuickResubmit = async (p: Product) => {
    if (!confirm(`"${p.name}" ni qayta tekshirishga yuborishni tasdiqlaysizmi?`)) return;
    hapticFeedback("impact");
    try {
      const res = await fetch(`/api/products/${p.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "resubmit" }),
      });
      if (!res.ok) throw new Error();
      hapticFeedback("success"); loadData();
    } catch { alert("Xato yuz berdi"); }
  };

  // While auto-detecting store from Telegram ID — show spinner
  if (autoDetecting) {
    return (
      <MobileLayout hideNav={false} title="Do'konim">
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          <p className="text-sm text-muted-foreground font-medium">Do'kon topilmoqda...</p>
        </div>
      </MobileLayout>
    );
  }

  // No Telegram context — let the seller identify themselves via ID
  if (showTgIdInput) {
    return (
      <MobileLayout hideNav={false} title="Do'konim">
        <div className="flex flex-col items-center justify-center px-6 py-20 gap-6">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div className="text-center">
            <h2 className="text-xl font-bold font-display text-foreground mb-1">Do'koningizga kirish</h2>
            <p className="text-sm text-muted-foreground">Telegram ID'ingizni kiriting, do'koningiz avtomatik topiladi</p>
          </div>

          <div className="w-full space-y-3">
            <input
              type="number"
              value={manualTgId}
              onChange={e => setManualTgId(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleManualTgIdSearch()}
              placeholder="Telegram ID (masalan: 123456789)"
              className="w-full h-12 px-4 rounded-2xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <button
              onClick={handleManualTgIdSearch}
              disabled={!manualTgId.trim() || tgIdSearching}
              className="w-full h-12 rounded-2xl bg-primary text-white font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {tgIdSearching ? (
                <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              ) : "Do'konni topish"}
            </button>
          </div>
        </div>
      </MobileLayout>
    );
  }

  if (!seller) return null;

  const filtered = products.filter((p) => statusFilter === "all" ? true : p.status === statusFilter);
  const counts = {
    all:      products.length,
    pending:  products.filter((p) => p.status === "pending").length,
    approved: products.filter((p) => p.status === "approved").length,
    rejected: products.filter((p) => p.status === "rejected").length,
  };

  return (
    <MobileLayout hideNav={false} title="Do'konim">
      <div className="px-4 pt-4 pb-24">

        {/* Store banner */}
        <div className="bg-gradient-to-br from-primary via-violet-600 to-purple-700 rounded-3xl p-4 mb-5 relative overflow-hidden shadow-ios-lg shadow-primary/30">
          <div className="absolute top-0 right-0 w-28 h-28 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-md" />
          <div className="relative flex items-center gap-4">
            <div className="w-14 h-14 rounded-[18px] bg-white/20 backdrop-blur-sm flex items-center justify-center font-display font-extrabold text-2xl text-white border border-white/30 overflow-hidden">
              {store?.logo
                ? <img src={store.logo} alt="logo" className="w-full h-full object-cover" />
                : seller.storeName[0]
              }
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-display font-bold text-white text-lg leading-tight truncate">{seller.storeName}</h2>
              {/* Dynamic status indicator */}
              {store ? (
                store.type === "partner" ? (
                  <div className="flex items-center gap-1.5 mt-1">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full" />
                    <span className="text-white/80 text-xs font-semibold">Tasdiqlangan ✓</span>
                  </div>
                ) : store.type === "rejected" ? (
                  <div className="flex items-center gap-1.5 mt-1">
                    <div className="w-2 h-2 bg-red-400 rounded-full" />
                    <span className="text-white/80 text-xs font-semibold">Rad etildi ✗</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 mt-1">
                    <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                    <span className="text-white/80 text-xs font-semibold">Ko'rib chiqilmoqda...</span>
                  </div>
                )
              ) : (
                <div className="flex items-center gap-1.5 mt-1">
                  <div className="w-2 h-2 bg-white/40 rounded-full animate-pulse" />
                  <span className="text-white/60 text-xs">Yuklanmoqda...</span>
                </div>
              )}
              {store?.location && <p className="text-white/60 text-xs mt-0.5 truncate">{store.location}</p>}
            </div>
            <button
              onClick={() => { hapticFeedback("selection"); setShowStoreEdit(true); }}
              className="w-9 h-9 bg-white/15 rounded-2xl flex items-center justify-center shrink-0"
              title="Do'konni sozlash"
            >
              <Settings className="w-4 h-4 text-white" />
            </button>
          </div>
          <div className="relative grid grid-cols-3 gap-2 mt-4">
            {[
              { label: "Jami",         value: counts.all },
              { label: "Tasdiqlangan", value: counts.approved },
              { label: "Kutilmoqda",   value: counts.pending },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white/15 rounded-2xl p-2.5 text-center backdrop-blur-sm">
                <div className="font-display font-bold text-white text-lg">{value}</div>
                <div className="text-white/70 text-[10px] font-medium">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Pending notice */}
        {store && store.type !== "partner" && store.type !== "rejected" && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-4 flex items-start gap-3">
            <div className="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="font-semibold text-amber-800 text-sm">Do'koningiz ko'rib chiqilmoqda</p>
              <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
                Admin tasdiqlashini kuting. Shu vaqt ichida mahsulotlar qo'shishingiz mumkin — ular ham tasdiqlangandan so'ng ko'rinadi.
              </p>
            </div>
          </div>
        )}

        {/* Rejected notice */}
        {store && store.type === "rejected" && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-4 flex items-start gap-3">
            <div className="w-9 h-9 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="font-semibold text-red-800 text-sm">Do'kon arizasi rad etildi</p>
              <p className="text-xs text-red-700 mt-0.5 leading-relaxed">
                Do'koningiz arizada muammo borligi sababli rad etildi. Batafsil ma'lumot uchun admin bilan bog'laning.
              </p>
            </div>
          </div>
        )}

        {/* Approved notice (shown only once — first approval) */}
        {store && store.type === "partner" && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-4 flex items-start gap-3">
            <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="font-semibold text-emerald-800 text-sm">Do'koningiz faoliyatda! 🎉</p>
              <p className="text-xs text-emerald-700 mt-0.5 leading-relaxed">
                Do'koningiz tasdiqlandi va xaridorlarga ko'rinmoqda. Mahsulot qo'shing va savdoni boshlang!
              </p>
            </div>
          </div>
        )}

        {/* Add button */}
        <button onClick={() => { hapticFeedback("impact"); setShowAdd(true); }}
          className="w-full h-12 bg-gradient-to-r from-primary to-violet-500 text-white font-display font-bold rounded-2xl flex items-center justify-center gap-2 shadow-ios-md shadow-primary/30 mb-5 press">
          <Plus className="w-5 h-5" /> Mahsulot qo'shish
        </button>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-0.5 mb-4 scrollbar-none">
          {(["all","pending","approved","rejected"] as const).map((s) => {
            const label = s === "all" ? "Barchasi" : STATUS_MAP[s].label;
            return (
              <button key={s} onClick={() => setFilter(s)}
                className={cn("flex-shrink-0 px-3.5 h-8 rounded-xl text-xs font-bold border transition-all",
                  statusFilter === s
                    ? "bg-primary text-white border-primary"
                    : "bg-card border-border/60 text-muted-foreground"
                )}>
                {label}{counts[s] > 0 && <span className="ml-0.5 opacity-70"> ({counts[s]})</span>}
              </button>
            );
          })}
        </div>

        {/* Product list */}
        {loading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
            <RefreshCw className="w-5 h-5 animate-spin" /><span className="text-sm">Yuklanmoqda...</span>
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
              const cardPct = p.oldPrice ? calcPctDiff(p.price, p.oldPrice) : null;

              return (
                <div key={p.id} className="glass-card rounded-3xl p-3.5 shadow-ios-sm">
                  <div className="flex gap-3 items-start">
                    <div className="w-16 h-16 rounded-2xl bg-muted overflow-hidden shrink-0">
                      {imgs[0]
                        ? <img src={imgs[0]} alt={p.name} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-5 h-5 text-muted-foreground/40" /></div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-display font-bold text-sm leading-tight line-clamp-2">{p.name}</div>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="font-bold text-sm text-primary">{formatPrice(Number(p.price))}</span>
                        {p.oldPrice && <span className="text-xs text-muted-foreground line-through">{formatPrice(Number(p.oldPrice))}</span>}
                        {cardPct !== null && cardPct < 0 && (
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">−{Math.abs(cardPct)}%</span>
                        )}
                        {cardPct !== null && cardPct > 0 && (
                          <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded-md">+{cardPct}%</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold", S.cls)}>
                          <Ic className="w-3 h-3" />{S.label}
                        </span>
                        {p.categoryName && <span className="text-[10px] text-muted-foreground truncate">{p.categoryName}</span>}
                      </div>
                      {/* Specs preview */}
                      {p.dimensions && (
                        <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2 leading-relaxed">{p.dimensions}</p>
                      )}
                      {((p.colors?.length ?? 0) > 0 || (p.sizes?.length ?? 0) > 0) && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {p.colors?.map((c) => <span key={c} className="text-[9px] px-1.5 py-0.5 bg-primary/10 text-primary rounded-md font-semibold">{c}</span>)}
                          {p.sizes?.map((s) => <span key={s} className="text-[9px] px-1.5 py-0.5 bg-muted text-muted-foreground rounded-md font-semibold">{s}</span>)}
                        </div>
                      )}
                      {st === "approved" && (
                        <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
                          <span className="flex items-center gap-0.5"><Star className="w-3 h-3 text-amber-400 fill-amber-400" />{Number(p.rating) > 0 ? Number(p.rating).toFixed(1) : "—"}</span>
                          <span>{p.salesCount} sotuv</span>
                        </div>
                      )}
                      {st === "pending" && <p className="text-[10px] text-amber-600 mt-1">⏳ Admin ko'rib chiqmoqda…</p>}
                    </div>
                    <div className="flex flex-col gap-1.5 shrink-0">
                      <button
                        onClick={() => { hapticFeedback("impact"); setEditProduct(p); }}
                        className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors"
                        title="Tahrirlash"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={async () => {
                          if (!confirm(`"${p.name}" o'chirilsinmi?`)) return;
                          await fetch(`/api/products/${p.id}`, { method: "DELETE" });
                          hapticFeedback("impact");
                          setProducts((prev) => prev.filter((x) => x.id !== p.id));
                        }}
                        className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center text-muted-foreground hover:bg-red-100 hover:text-red-500 transition-colors"
                        title="O'chirish"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {imgs.length > 1 && (
                    <div className="flex gap-2 mt-2.5 overflow-x-auto scrollbar-none">
                      {imgs.slice(1).map((src, i) => (
                        <div key={i} className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-muted">
                          <img src={src} alt="" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}

                  {st === "rejected" && (
                    <div className="mt-2.5">
                      <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2 mb-2">
                        <p className="text-[10px] font-bold text-red-600 mb-0.5">❌ Rad etildi — Sabab:</p>
                        <p className="text-[11px] text-red-500 leading-snug">
                          {p.rejectionReason ?? "Admin tomonidan rad etildi"}
                        </p>
                      </div>
                      <button onClick={() => handleQuickResubmit(p)}
                        className="w-full flex items-center justify-center gap-1.5 h-9 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold">
                        <RotateCcw className="w-3.5 h-3.5" /> O'zgartirmasdan qayta yuborish
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showAdd && seller && (
        <ProductModal storeId={seller.storeId} categories={categories}
          onClose={() => setShowAdd(false)}
          onSaved={() => { setShowAdd(false); hapticFeedback("success"); loadData(); }} />
      )}
      {editProduct && seller && (
        <ProductModal storeId={seller.storeId} categories={categories}
          editProduct={editProduct}
          onClose={() => setEditProduct(null)}
          onSaved={() => { setEditProduct(null); hapticFeedback("success"); loadData(); }} />
      )}
      {showStoreEdit && seller && (
        <EditStoreModal
          storeId={seller.storeId}
          storeName={seller.storeName}
          onClose={() => setShowStoreEdit(false)}
          onSaved={(newName) => {
            seller.storeName = newName;
            setShowStoreEdit(false);
            loadData();
          }}
        />
      )}
    </MobileLayout>
  );
}
