import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Search, Plus, Edit2, Trash2, Eye, Star, X,
  ImageIcon, ChevronDown, Check, Package, RefreshCw, AlertCircle,
  CheckCircle, XCircle, Clock, Palette, Ruler,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CATEGORIES, type CatSpec, type FieldDef } from "@/lib/category-specs";
import { serializeSpecs, parseSpecsFromDimensions, PRESET_COLORS, PRESET_SIZES } from "@/lib/specs-utils";
import { MultiImageUpload } from "@/components/MultiImageUpload";
import { SpecField } from "@/components/SpecField";


function fmt(n: number) { return n.toLocaleString("ru-RU") + " so'm"; }

// ── API helpers ───────────────────────────────────────────────────────────────
const API = "/api";

async function fetchProducts(): Promise<ApiProduct[]> {
  const r = await fetch(`${API}/products?status=all&limit=200`);
  if (!r.ok) throw new Error("Mahsulotlarni yuklashda xato");
  const data = await r.json();
  return data.products ?? data;
}

async function fetchStores(): Promise<ApiStore[]> {
  const r = await fetch(`${API}/stores?limit=200`);
  if (!r.ok) throw new Error("Do'konlarni yuklashda xato");
  const data = await r.json();
  return data.stores ?? data;
}

async function fetchCategoriesNested(): Promise<ApiCategory[]> {
  const r = await fetch(`${API}/categories?nested=true`);
  if (!r.ok) throw new Error("Kategoriyalarni yuklashda xato");
  const data = await r.json();
  return data.categories ?? data;
}

async function createProduct(body: Record<string, unknown>): Promise<ApiProduct> {
  const r = await fetch(`${API}/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...body, status: "approved" }),
  });
  if (!r.ok) throw new Error("Mahsulot qo'shishda xato");
  return r.json();
}

async function updateProduct(id: string, body: Record<string, unknown>): Promise<ApiProduct> {
  const r = await fetch(`${API}/products/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error("Mahsulotni yangilashda xato");
  return r.json();
}

async function approveProduct(id: string): Promise<void> {
  const r = await fetch(`${API}/products/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "approve" }),
  });
  if (!r.ok) throw new Error("Tasdiqlashda xato");
}

async function rejectProduct({ id, reason }: { id: string; reason: string }): Promise<void> {
  const r = await fetch(`${API}/products/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "reject", rejectionReason: reason }),
  });
  if (!r.ok) throw new Error("Rad etishda xato");
}

async function deleteProduct(id: string): Promise<void> {
  const r = await fetch(`${API}/products/${id}`, { method: "DELETE" });
  if (!r.ok) throw new Error("O'chirishda xato");
}

// ── API types ─────────────────────────────────────────────────────────────────
interface ApiProduct {
  id: string;
  name: string;
  price: string;
  oldPrice: string | null;
  description: string | null;
  images: string[] | null;
  colors: string[] | null;
  sizes: string[] | null;
  dimensions: string | null;
  categoryId: string | null;
  categoryName: string | null;
  storeId: string;
  storeName: string | null;
  rating: string;
  reviewCount: number;
  isFeatured: boolean;
  isTopSelling: boolean;
  discount: number | null;
  salesCount: number;
  status: string;
  rejectionReason: string | null;
  deliveryDays: number | null;
  quantity: number | null;
  createdAt: string | null;
}

interface ApiCategory { id: string; name: string; icon: string | null; subcategories?: ApiCategory[]; }
interface ApiStore    { id: string; name: string; }



// ── Product form modal ────────────────────────────────────────────────────────
interface ProductForm {
  name: string;
  category: string;    // display name only
  parentCatId: string; // parent category ID
  categoryId: string;  // subcategory ID
  price: string;
  oldPrice: string;
  storeId: string;
  isFeatured: boolean;
  description: string;
  specs: Record<string, string>;
  images: string[];
  colors: string[];
  sizes: string[];
}

function blankForm(): ProductForm {
  return {
    name: "", category: "", parentCatId: "", categoryId: "", price: "", oldPrice: "",
    storeId: "", isFeatured: true, description: "", specs: {}, images: [], colors: [], sizes: [],
  };
}

function ProductModal({
  product,
  onClose,
  onSaved,
}: {
  product: ApiProduct | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const qc = useQueryClient();
  const isEdit = !!product?.id;

  const { data: stores = [] } = useQuery({ queryKey: ["stores"], queryFn: fetchStores });
  const { data: nestedCategories = [] } = useQuery({ queryKey: ["categories-nested"], queryFn: fetchCategoriesNested });

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Helper: find parent id for a subcategory
  const findParentId = (subId: string): string => {
    for (const p of nestedCategories) {
      if (p.subcategories?.some((s) => s.id === subId)) return p.id;
      if (p.id === subId) return p.id;
    }
    return "";
  };

  const [form, setForm] = useState<ProductForm>(() => {
    if (product) {
      return {
        name: product.name,
        category: product.categoryName ?? "",
        parentCatId: product.categoryId ? findParentId(product.categoryId) : "",
        categoryId: product.categoryId ?? "",
        price: product.price,
        oldPrice: product.oldPrice ?? "",
        storeId: product.storeId ?? "",
        isFeatured: product.isFeatured,
        description: product.description ?? "",
        specs: parseSpecsFromDimensions(product.dimensions ?? ""),
        images: product.images ?? [],
        colors: product.colors ?? [],
        sizes: product.sizes ?? [],
      };
    }
    return blankForm();
  });

  // Auto-select first store if only one
  useEffect(() => {
    if (!form.storeId && stores.length === 1) {
      setForm((f) => ({ ...f, storeId: stores[0].id }));
    }
  }, [stores]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Get selected parent and its subcategories
  const selectedParent = nestedCategories.find((p) => p.id === form.parentCatId);
  const subCats = selectedParent?.subcategories ?? [];

  // Get current selected subcategory / parent (if no subs)
  const currentCat = subCats.find((s) => s.id === form.categoryId)
    ?? (subCats.length === 0 ? selectedParent : null);

  // Lookup spec def using names array
  const catDef = CATEGORIES.find((c) =>
    c.names.some((n) => n.toLowerCase() === (currentCat?.name ?? "").toLowerCase())
  ) ?? null;

  const setSpec = (key: string, val: string) =>
    setForm((f) => ({ ...f, specs: { ...f.specs, [key]: val } }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Mahsulot nomi kiritilsin";
    if (!form.price)       e.price = "Narx kiritilsin";
    if (!form.storeId)     e.storeId = "Do'kon tanlansin";
    if (form.images.length === 0) e.images = "Kamida 1 ta rasm yuklang";
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    // Use subcategoryId if available, else parentCatId
    const finalCategoryId = (subCats.length > 0 ? form.categoryId : form.parentCatId) || null;

    // Build dimensions string from specs
    const dimensionsStr = catDef ? serializeSpecs(form.specs, catDef) : null;

    const body: Record<string, unknown> = {
      name: form.name.trim(),
      price: form.price,
      oldPrice: form.oldPrice || null,
      description: form.description.trim() || null,
      images: form.images,
      categoryId: finalCategoryId,
      storeId: form.storeId,
      isFeatured: form.isFeatured,
      isTopSelling: false,
      dimensions: dimensionsStr || null,
      colors: form.colors.length ? form.colors : null,
      sizes: form.sizes.length ? form.sizes : null,
    };

    setSaving(true);
    setSaveError("");
    try {
      if (isEdit && product) {
        await updateProduct(product.id, body);
      } else {
        await createProduct(body);
      }
      await qc.invalidateQueries({ queryKey: ["admin-products"] });
      onSaved();
    } catch (err) {
      setSaveError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative ml-auto w-full max-w-2xl h-full bg-background shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/60 bg-card shrink-0">
          <div>
            <h2 className="font-display font-bold text-lg">{isEdit ? "Mahsulotni tahrirlash" : "Yangi mahsulot qo'shish"}</h2>
            <p className="text-muted-foreground text-xs mt-0.5">{form.category || "Kategoriya tanlanmagan"}</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <form id="product-form" onSubmit={handleSubmit} className="space-y-6">

            {/* 1. Kategoriya — 2 bosqichli */}
            <div className="bg-card border border-border/60 rounded-2xl p-5 space-y-3">
              <h3 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wide">1. Kategoriya</h3>

              {/* Step 1: Parent */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Asosiy kategoriya *</label>
                <div className="relative">
                  <select
                    value={form.parentCatId}
                    onChange={(e) => {
                      const id = e.target.value;
                      const found = nestedCategories.find((p) => p.id === id);
                      setForm((f) => ({ ...f, parentCatId: id, categoryId: "", category: found?.name ?? "", specs: {} }));
                    }}
                    className="w-full h-10 pl-3 pr-8 bg-muted/40 border border-border/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none"
                  >
                    <option value="">— Asosiy kategoriya tanlang —</option>
                    {nestedCategories.map((p) => (
                      <option key={p.id} value={p.id}>{p.icon ? p.icon + " " : ""}{p.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              {/* Step 2: Subcategory */}
              {form.parentCatId && subCats.length > 0 && (
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Sub kategoriya *</label>
                  <div className="relative">
                    <select
                      value={form.categoryId}
                      onChange={(e) => {
                        const id = e.target.value;
                        const found = subCats.find((s) => s.id === id);
                        setForm((f) => ({ ...f, categoryId: id, category: found?.name ?? f.category, specs: {} }));
                      }}
                      className="w-full h-10 pl-3 pr-8 bg-primary/5 border border-primary/30 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none"
                    >
                      <option value="">— Sub kategoriya tanlang —</option>
                      {subCats.map((sub) => (
                        <option key={sub.id} value={sub.id}>{sub.icon ? sub.icon + " " : ""}{sub.name}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-primary/60 pointer-events-none" />
                  </div>
                </div>
              )}

              {catDef && (
                <p className="text-[11px] text-primary font-semibold">
                  {catDef.emoji} {catDef.names[0]} uchun qo'shimcha spec maydonlari quyida ko'rinadi
                </p>
              )}
            </div>

            {/* 2. Rasmlar */}
            <div className="bg-card border border-border/60 rounded-2xl p-5">
              <h3 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-4">2. Rasmlar</h3>
              <MultiImageUpload
                images={form.images}
                onChange={(imgs) => { setForm((f) => ({ ...f, images: imgs })); setErrors((e) => ({ ...e, images: "" })); }}
              />
              {errors.images && <p className="text-destructive text-xs mt-1">{errors.images}</p>}
            </div>

            {/* 3. Asosiy ma'lumotlar */}
            <div className="bg-card border border-border/60 rounded-2xl p-5 space-y-4">
              <h3 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wide">3. Asosiy ma'lumotlar</h3>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Mahsulot nomi *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => { setForm((f) => ({ ...f, name: e.target.value })); setErrors((er) => ({ ...er, name: "" })); }}
                  placeholder={`Masalan: ${catDef?.names[0] ?? form.category} Premium dizayn`}
                  className="w-full h-10 px-3 bg-muted/40 border border-border/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                {errors.name && <p className="text-destructive text-xs mt-1">{errors.name}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Narx (so'm) *</label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => { setForm((f) => ({ ...f, price: e.target.value })); setErrors((er) => ({ ...er, price: "" })); }}
                    placeholder="12 500 000"
                    className="w-full h-10 px-3 bg-muted/40 border border-border/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  {errors.price && <p className="text-destructive text-xs mt-1">{errors.price}</p>}
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Eski narx (ixtiyoriy)</label>
                  <input
                    type="number"
                    value={form.oldPrice}
                    onChange={(e) => setForm((f) => ({ ...f, oldPrice: e.target.value }))}
                    placeholder="15 000 000"
                    className="w-full h-10 px-3 bg-muted/40 border border-border/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              {/* Store dropdown */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Do'kon *</label>
                {stores.length === 0 ? (
                  <div className="flex items-center gap-2 h-10 px-3 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-700">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    Do'konlar topilmadi. Avval "Do'konlar" bo'limida do'kon yarating.
                  </div>
                ) : (
                  <div className="relative">
                    <select
                      value={form.storeId}
                      onChange={(e) => { setForm((f) => ({ ...f, storeId: e.target.value })); setErrors((er) => ({ ...er, storeId: "" })); }}
                      className="w-full h-10 pl-3 pr-8 bg-muted/40 border border-border/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none"
                    >
                      <option value="">Do'konni tanlang...</option>
                      {stores.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                  </div>
                )}
                {errors.storeId && <p className="text-destructive text-xs mt-1">{errors.storeId}</p>}
              </div>

              {/* Featured toggle */}
              <div className="flex items-center justify-between py-2.5 px-3 bg-muted/40 rounded-xl">
                <div>
                  <span className="text-sm font-medium">Bosh sahifada ko'rsatish</span>
                  <p className="text-xs text-muted-foreground">Yoqilsa mahsulot bosh sahifada "Tavsiya etilgan" bo'limida chiqadi</p>
                </div>
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, isFeatured: !f.isFeatured }))}
                  className={cn("w-11 h-6 rounded-full transition-all relative shrink-0 ml-3", form.isFeatured ? "bg-primary" : "bg-border")}
                >
                  <span className={cn("absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all", form.isFeatured ? "left-6" : "left-1")} />
                </button>
              </div>
            </div>

            {/* 4. Tavsif */}
            <div className="bg-card border border-border/60 rounded-2xl p-5 space-y-3">
              <h3 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wide">4. Tavsif</h3>
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={4}
                placeholder={`${catDef?.names[0] ?? "Mahsulot"} haqida to'liq ma'lumot yozing...`}
                className="w-full px-3 py-2.5 bg-muted/40 border border-border/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              />
            </div>

            {/* 5. Rang va razmer variantlari */}
            <div className="bg-card border border-border/60 rounded-2xl p-5 space-y-4">
              <h3 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wide">5. Rang va razmer variantlari</h3>

              {/* Ranglar */}
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <Palette className="w-3.5 h-3.5 text-muted-foreground" />
                  <label className="text-xs font-semibold text-muted-foreground">Rang variantlari <span className="font-normal">(ixtiyoriy)</span></label>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {PRESET_COLORS.map((c) => {
                    const active = form.colors.includes(c);
                    return (
                      <button key={c} type="button"
                        onClick={() => setForm((f) => ({
                          ...f,
                          colors: active ? f.colors.filter((x) => x !== c) : [...f.colors, c],
                        }))}
                        className={cn("px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all",
                          active ? "bg-primary text-white border-primary" : "bg-muted/60 text-muted-foreground border-border/60"
                        )}
                      >{c}</button>
                    );
                  })}
                </div>
                <div className="flex gap-2">
                  <input
                    placeholder="Boshqa rang (masalan: Beige)"
                    className="flex-1 h-9 px-3 bg-muted/40 border border-border/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const val = (e.target as HTMLInputElement).value.trim();
                        if (val && !form.colors.includes(val)) setForm((f) => ({ ...f, colors: [...f.colors, val] }));
                        (e.target as HTMLInputElement).value = "";
                      }
                    }}
                  />
                  <button type="button"
                    onClick={(e) => {
                      const inp = (e.currentTarget.previousElementSibling as HTMLInputElement);
                      const val = inp.value.trim();
                      if (val && !form.colors.includes(val)) setForm((f) => ({ ...f, colors: [...f.colors, val] }));
                      inp.value = "";
                    }}
                    className="h-9 px-3 bg-primary/10 text-primary rounded-xl text-xs font-bold hover:bg-primary/20 transition-colors">+ Qo'sh</button>
                </div>
                {form.colors.filter((c) => !PRESET_COLORS.includes(c)).length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {form.colors.filter((c) => !PRESET_COLORS.includes(c)).map((c) => (
                      <span key={c} className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-1 bg-primary/10 text-primary rounded-lg text-xs font-semibold">
                        {c}
                        <button type="button" onClick={() => setForm((f) => ({ ...f, colors: f.colors.filter((x) => x !== c) }))} className="hover:text-red-500">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Razmerlar */}
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <Ruler className="w-3.5 h-3.5 text-muted-foreground" />
                  <label className="text-xs font-semibold text-muted-foreground">Razmer variantlari <span className="font-normal">(ixtiyoriy)</span></label>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {PRESET_SIZES.map((s) => {
                    const active = form.sizes.includes(s);
                    return (
                      <button key={s} type="button"
                        onClick={() => setForm((f) => ({
                          ...f,
                          sizes: active ? f.sizes.filter((x) => x !== s) : [...f.sizes, s],
                        }))}
                        className={cn("px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all",
                          active ? "bg-primary text-white border-primary" : "bg-muted/60 text-muted-foreground border-border/60"
                        )}
                      >{s}</button>
                    );
                  })}
                </div>
                <div className="flex gap-2">
                  <input
                    placeholder="Boshqa razmer (masalan: 170x210)"
                    className="flex-1 h-9 px-3 bg-muted/40 border border-border/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const val = (e.target as HTMLInputElement).value.trim();
                        if (val && !form.sizes.includes(val)) setForm((f) => ({ ...f, sizes: [...f.sizes, val] }));
                        (e.target as HTMLInputElement).value = "";
                      }
                    }}
                  />
                  <button type="button"
                    onClick={(e) => {
                      const inp = (e.currentTarget.previousElementSibling as HTMLInputElement);
                      const val = inp.value.trim();
                      if (val && !form.sizes.includes(val)) setForm((f) => ({ ...f, sizes: [...f.sizes, val] }));
                      inp.value = "";
                    }}
                    className="h-9 px-3 bg-primary/10 text-primary rounded-xl text-xs font-bold hover:bg-primary/20 transition-colors">+ Qo'sh</button>
                </div>
                {form.sizes.filter((s) => !PRESET_SIZES.includes(s)).length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {form.sizes.filter((s) => !PRESET_SIZES.includes(s)).map((s) => (
                      <span key={s} className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-1 bg-primary/10 text-primary rounded-lg text-xs font-semibold">
                        {s}
                        <button type="button" onClick={() => setForm((f) => ({ ...f, sizes: f.sizes.filter((x) => x !== s) }))} className="hover:text-red-500">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 6. Xususiyatlar (faqat catDef mavjud bo'lsa) */}
            {catDef && catDef.fields.length > 0 && (
              <div className="bg-card border border-border/60 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xl">{catDef.emoji}</span>
                  <div>
                  <h3 className="font-display font-semibold text-sm">{catDef.names[0]} xususiyatlari</h3>
                    <p className="text-xs text-muted-foreground">Bu kategoriyaga xos texnik ma'lumotlar</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {catDef.fields.map((field) => (
                    <SpecField
                      key={field.key}
                      field={field}
                      value={form.specs[field.key] ?? (field.type === "toggle" ? "Yo'q" : "")}
                      onChange={(v) => setSpec(field.key, v)}
                    />
                  ))}
                </div>
              </div>
            )}

            {saveError && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {saveError}
              </div>
            )}

          </form>
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-border/60 bg-card px-6 py-4 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-11 bg-muted border border-border/60 rounded-xl text-sm font-semibold hover:bg-muted/80 transition-colors"
          >
            Bekor qilish
          </button>
          <button
            type="submit"
            form="product-form"
            disabled={saving}
            className="flex-1 h-11 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors shadow-sm shadow-primary/30 disabled:opacity-60"
          >
            {saving ? "Saqlanmoqda..." : isEdit ? "Saqlash" : "Mahsulot qo'shish"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── View modal ────────────────────────────────────────────────────────────────
function ViewModal({ product, onClose, onEdit }: { product: ApiProduct; onClose: () => void; onEdit: () => void }) {
  const catDef = CATEGORIES.find((c) => c.names.some((n) => n.toLowerCase() === (product.categoryName ?? "").toLowerCase()));
  const images = product.images ?? [];
  const [imgIdx, setImgIdx] = useState(0);

  const statusBadge: Record<string, string> = {
    approved: "bg-emerald-100 text-emerald-700",
    pending: "bg-amber-100 text-amber-700",
    rejected: "bg-red-100 text-red-700",
  };
  const statusLabel: Record<string, string> = {
    approved: "✅ Tasdiqlangan",
    pending: "⏳ Kutilmoqda",
    rejected: "❌ Rad etilgan",
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative ml-auto w-full max-w-lg h-full bg-background shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/60 bg-card shrink-0">
          <h2 className="font-display font-bold text-base">Mahsulot ma'lumotlari</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center"><X className="w-4 h-4" /></button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Image gallery */}
          {images.length > 0 && (
            <div className="relative bg-gray-100">
              <img
                src={images[imgIdx]}
                alt={product.name}
                className="w-full h-56 object-contain"
              />
              {images.length > 1 && (
                <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setImgIdx(i)}
                      className={`w-2 h-2 rounded-full transition-all ${i === imgIdx ? "bg-primary scale-125" : "bg-white/70"}`}
                    />
                  ))}
                </div>
              )}
              {images.length > 1 && (
                <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full">
                  {imgIdx + 1}/{images.length}
                </div>
              )}
            </div>
          )}

          <div className="p-5 space-y-5">
            {/* Name + category + status */}
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                {product.categoryName && (
                  <span className="badge badge-primary">{catDef?.emoji ?? "📦"} {product.categoryName}</span>
                )}
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${statusBadge[product.status] ?? "bg-muted text-foreground"}`}>
                  {statusLabel[product.status] ?? product.status}
                </span>
              </div>
              <h3 className="font-display font-bold text-xl">{product.name}</h3>
              <p className="text-muted-foreground text-sm mt-0.5">🏪 {product.storeName}</p>
            </div>

            {/* Rejection reason */}
            {product.status === "rejected" && product.rejectionReason && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                <p className="text-xs font-semibold text-red-700 mb-1">❌ Rad etish sababi:</p>
                <p className="text-sm text-red-700">{product.rejectionReason}</p>
              </div>
            )}

            {/* Price */}
            <div className="flex items-center gap-4 flex-wrap bg-muted/40 rounded-xl p-3">
              <div>
                <div className="text-xs text-muted-foreground mb-0.5">Narx</div>
                <div className="font-bold text-lg text-primary">{fmt(Number(product.price))}</div>
                {product.oldPrice && (
                  <div className="text-xs text-muted-foreground line-through">{fmt(Number(product.oldPrice))}</div>
                )}
              </div>
              {product.discount && (
                <span className="badge badge-error">-{product.discount}%</span>
              )}
              <div className="ml-auto text-right">
                <div className="text-xs text-muted-foreground mb-0.5">Reyting</div>
                <div className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span className="font-semibold text-sm">{Number(product.rating || 0).toFixed(1)}</span>
                  <span className="text-muted-foreground text-xs">({product.reviewCount ?? 0})</span>
                </div>
              </div>
            </div>

            {/* Key info grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-muted/40 rounded-xl p-3">
                <div className="text-xs text-muted-foreground mb-1">📦 Ombor</div>
                <div className="font-semibold text-sm">{product.quantity ?? 1} dona</div>
              </div>
              <div className="bg-muted/40 rounded-xl p-3">
                <div className="text-xs text-muted-foreground mb-1">🚚 Yetkazish</div>
                <div className="font-semibold text-sm">
                  {product.deliveryDays === 0 ? "Kelishiladi" : `${product.deliveryDays ?? 3} kun`}
                </div>
              </div>
              {product.isFeatured && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                  <div className="font-semibold text-sm text-amber-700">⭐ Tavsiya etilgan</div>
                </div>
              )}
              {product.isTopSelling && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                  <div className="font-semibold text-sm text-emerald-700">🔥 Ko'p sotilgan</div>
                </div>
              )}
            </div>

            {/* Colors */}
            {product.colors && product.colors.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">🎨 Ranglar</h4>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((c) => (
                    <span key={c} className="px-3 py-1 bg-muted rounded-xl text-sm font-medium">{c}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">📐 O'lchamlar</h4>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((s) => (
                    <span key={s} className="px-3 py-1 bg-muted rounded-xl text-sm font-medium">{s}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Specs/dimensions */}
            {product.dimensions && (
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">📏 Texnik xususiyatlar</h4>
                <div className="bg-muted/40 rounded-xl p-3 space-y-1">
                  {product.dimensions.split("|").map((line, i) => {
                    const [label, ...rest] = line.split(":");
                    return (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{label?.trim()}</span>
                        <span className="font-medium">{rest.join(":").trim()}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Description */}
            {product.description && (
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">📝 Tavsif</h4>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{product.description}</p>
              </div>
            )}

            {/* All images */}
            {images.length > 1 && (
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">🖼️ Barcha rasmlar ({images.length})</h4>
                <div className="grid grid-cols-3 gap-2">
                  {images.map((src, i) => (
                    <button
                      key={i}
                      onClick={() => setImgIdx(i)}
                      className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${i === imgIdx ? "border-primary" : "border-transparent"}`}
                    >
                      <img src={src} alt={`Rasm ${i + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-border/60 bg-card px-5 py-4 flex gap-3">
          <button onClick={onClose} className="flex-1 h-10 bg-muted rounded-xl text-sm font-semibold">Yopish</button>
          <button onClick={onEdit} className="flex-1 h-10 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90">Tahrirlash</button>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function Products() {
  const qc = useQueryClient();
  const [search, setSearch]         = useState("");
  const [catFilter, setCatFilter]   = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "approved" | "pending" | "rejected">("all");
  const [modal, setModal]           = useState<"add" | "edit" | "view" | null>(null);
  const [active, setActive]         = useState<ApiProduct | null>(null);
  const [view, setView]             = useState<"list" | "new">("list");
  const [rejectModal, setRejectModal] = useState<ApiProduct | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const { data: products = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["admin-products"],
    queryFn: fetchProducts,
    refetchInterval: 15_000,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-products"] }),
  });

  const approveMutation = useMutation({
    mutationFn: approveProduct,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-products"] }),
  });

  const rejectMutation = useMutation({
    mutationFn: rejectProduct,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      setRejectModal(null);
      setRejectReason("");
    },
  });

  const pendingProducts = products.filter((p) => p.status === "pending");

  const filtered = products.filter((p) => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || (p.storeName ?? "").toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === "all" || CATEGORIES.find(c => c.names[0] === catFilter)?.names.some(n => n.toLowerCase() === (p.categoryName ?? "").toLowerCase()) || p.categoryName === catFilter;
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    return matchSearch && matchCat && matchStatus;
  });

  const handleDelete = (id: string) => {
    if (!confirm("Mahsulotni o'chirishni tasdiqlaysizmi?")) return;
    deleteMutation.mutate(id);
  };

  const closeModal = () => { setModal(null); setActive(null); };

  const handleRejectSubmit = () => {
    if (!rejectModal) return;
    if (!rejectReason.trim()) return;
    rejectMutation.mutate({ id: rejectModal.id, reason: rejectReason.trim() });
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h1 className="font-display font-bold text-2xl">Mahsulotlar</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{products.length} ta mahsulot</p>
        </div>
        <div className="flex gap-2 self-start sm:self-auto flex-wrap">
          <button
            onClick={() => refetch()}
            className="flex items-center gap-1.5 bg-muted border border-border/60 text-foreground px-3 py-2 rounded-xl text-sm font-semibold hover:bg-muted/80 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setView(view === "new" ? "list" : "new")}
            className={cn(
              "relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors",
              view === "new"
                ? "bg-amber-500 text-white hover:bg-amber-600"
                : "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100"
            )}
          >
            <Clock className="w-4 h-4" />
            Yangi mahsulotlar
            {pendingProducts.length > 0 && (
              <span className={cn(
                "ml-0.5 min-w-[18px] h-[18px] rounded-full text-[11px] font-bold flex items-center justify-center px-1",
                view === "new" ? "bg-white text-amber-600" : "bg-amber-500 text-white"
              )}>
                {pendingProducts.length}
              </span>
            )}
          </button>
          <button
            onClick={() => { setActive(null); setModal("add"); }}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm shadow-primary/30"
          >
            <Plus className="w-4 h-4" /> Mahsulot qo'shish
          </button>
        </div>
      </div>

      {/* ── Yangi mahsulotlar view ─────────────────────────────────────────────── */}
      {view === "new" && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-amber-600" />
            <h2 className="font-display font-bold text-lg">Yangi mahsulotlar</h2>
            <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full">{pendingProducts.length} ta kutilmoqda</span>
          </div>
          {pendingProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground bg-card border border-border/60 rounded-2xl">
              <CheckCircle className="w-12 h-12 mb-3 text-emerald-400 opacity-60" />
              <p className="font-semibold text-sm">Barcha mahsulotlar ko'rib chiqilgan</p>
              <p className="text-xs mt-1">Hozircha tasdiqlashni kutayotgan mahsulot yo'q</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {pendingProducts.map((p) => {
                const img = p.images?.[0];
                const catEmoji = CATEGORIES.find((c) => c.names.some((n) => n.toLowerCase() === (p.categoryName ?? "").toLowerCase()))?.emoji ?? "📦";
                return (
                  <div key={p.id} className="bg-card border border-amber-200 rounded-2xl overflow-hidden shadow-sm">
                    {/* Image */}
                    <div className="relative w-full h-48 bg-muted">
                      {img ? (
                        <img src={img} alt={p.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
                          <ImageIcon className="w-10 h-10 opacity-30 mb-2" />
                          <span className="text-xs">Rasm yuklanmagan</span>
                        </div>
                      )}
                      <div className="absolute top-3 left-3">
                        <span className="badge badge-warning flex items-center gap-1"><Clock className="w-3 h-3" /> Kutilmoqda</span>
                      </div>
                      {p.createdAt && (
                        <div className="absolute top-3 right-3 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded-lg">
                          {new Date(p.createdAt).toLocaleDateString("uz-UZ")}
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-display font-bold text-base leading-tight line-clamp-2">{p.name}</h3>
                        {p.categoryName && (
                          <span className="badge badge-primary shrink-0">{catEmoji} {p.categoryName}</span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-bold text-lg text-primary">{fmt(Number(p.price))}</span>
                        {p.oldPrice && (
                          <span className="text-sm text-muted-foreground line-through">{fmt(Number(p.oldPrice))}</span>
                        )}
                        {p.discount && (
                          <span className="badge badge-danger">-{p.discount}%</span>
                        )}
                      </div>

                      {p.storeName && (
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-2">
                          <Package className="w-3.5 h-3.5" />
                          <span className="font-semibold">{p.storeName}</span>
                        </div>
                      )}

                      {p.description && (
                        <p className="text-sm text-foreground/70 line-clamp-3 mb-3 bg-muted/40 rounded-xl px-3 py-2">{p.description}</p>
                      )}

                      {/* Action buttons */}
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => { setActive(p); setModal("view"); }}
                          className="w-10 flex items-center justify-center rounded-xl bg-muted border border-border/60 py-2.5 hover:bg-muted/80 transition-colors shrink-0"
                          title="Ko'rish"
                        >
                          <Eye className="w-4 h-4 text-foreground" />
                        </button>
                        <button
                          onClick={() => setRejectModal(p)}
                          disabled={approveMutation.isPending || rejectMutation.isPending}
                          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-50 text-red-600 font-semibold text-sm hover:bg-red-100 transition-colors border border-red-200 disabled:opacity-50"
                        >
                          <XCircle className="w-4 h-4" />
                          Rad etish
                        </button>
                        <button
                          onClick={() => approveMutation.mutate(p.id)}
                          disabled={approveMutation.isPending || rejectMutation.isPending}
                          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-500 text-white font-semibold text-sm hover:bg-emerald-600 transition-colors shadow-sm shadow-emerald-200 disabled:opacity-50"
                        >
                          <CheckCircle className="w-4 h-4" />
                          {approveMutation.isPending ? "Tasdiqlanmoqda..." : "Tasdiqlash"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <div className="border-t border-border/40 my-6" />
          <h2 className="font-display font-bold text-lg mb-4">Barcha mahsulotlar ro'yxati</h2>
        </div>
      )}

      {/* Status filter tabs */}
      <div className="flex gap-2 mb-3 overflow-x-auto pb-1 hide-scrollbar">
        {([
          { val: "all",      label: "Barchasi",     count: products.length },
          { val: "approved", label: "Tasdiqlangan", count: products.filter(p => p.status === "approved").length },
          { val: "pending",  label: "Kutilmoqda",   count: pendingProducts.length },
          { val: "rejected", label: "Rad etilgan",  count: products.filter(p => p.status === "rejected").length },
        ] as const).map(({ val, label, count }) => (
          <button
            key={val}
            onClick={() => setStatusFilter(val)}
            className={cn("shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all",
              statusFilter === val ? "bg-primary text-white border-primary" : "bg-card border-border/60 text-muted-foreground hover:text-foreground"
            )}
          >
            {label} <span className="opacity-70">({count})</span>
          </button>
        ))}
      </div>

      {/* Category quick-filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-3 hide-scrollbar">
        <button
          onClick={() => setCatFilter("all")}
          className={cn("px-3 py-1.5 rounded-xl text-xs font-semibold border shrink-0 transition-all",
            catFilter === "all" ? "bg-primary text-white border-primary" : "bg-card border-border/60 text-muted-foreground hover:text-foreground"
          )}
        >
          Barchasi
        </button>
        {CATEGORIES.map((c) => {
          const catName = c.names[0];
          const count = products.filter((p) => c.names.some((n) => n.toLowerCase() === (p.categoryName ?? "").toLowerCase())).length;
          if (count === 0) return null;
          return (
            <button
              key={catName}
              onClick={() => setCatFilter(catName)}
              className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border shrink-0 transition-all",
                catFilter === catName ? "bg-primary text-white border-primary" : "bg-card border-border/60 text-muted-foreground hover:text-foreground"
              )}
            >
              {c.emoji} {catName} ({count})
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="search"
          placeholder="Mahsulot, do'kon qidirish..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 h-9 bg-card border border-border/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* Table */}
      <div className="bg-card border border-border/60 rounded-2xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground gap-3">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span className="text-sm">Yuklanmoqda...</span>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <AlertCircle className="w-10 h-10 mb-3 opacity-30" />
            <p className="text-sm font-medium">Mahsulotlarni yuklashda xato</p>
            <button onClick={() => refetch()} className="mt-3 text-xs text-primary hover:underline">Qayta urinish</button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Package className="w-10 h-10 mb-3 opacity-30" />
            <p className="text-sm font-medium">Mahsulotlar topilmadi</p>
            <p className="text-xs mt-1">Yangi mahsulot qo'shing</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 border-b border-border/60">
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Mahsulot</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide hidden md:table-cell">Kategoriya</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Narx</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide hidden lg:table-cell">Reyting</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide hidden sm:table-cell">Ko'rinish</th>
                  <th className="text-right px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Amal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filtered.map((p) => {
                  const catEmoji = CATEGORIES.find((c) => c.names.some((n) => n.toLowerCase() === (p.categoryName ?? "").toLowerCase()))?.emoji ?? "📦";
                  const img = p.images?.[0];
                  return (
                    <tr key={p.id} className="table-row-hover">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {img ? (
                            <img src={img} alt={p.name} className="w-10 h-10 rounded-xl object-cover bg-muted shrink-0" />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-xl shrink-0">{catEmoji}</div>
                          )}
                          <div>
                            <div className="font-semibold line-clamp-1 max-w-[200px]">{p.name}</div>
                            <div className="text-xs text-muted-foreground">{p.storeName}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        {p.categoryName
                          ? <span className="badge badge-primary">{catEmoji} {p.categoryName}</span>
                          : <span className="text-muted-foreground text-xs">—</span>
                        }
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold">{fmt(Number(p.price))}</div>
                        {p.oldPrice && <div className="text-xs text-muted-foreground line-through">{fmt(Number(p.oldPrice))}</div>}
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <div className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                          <span className="font-semibold">{Number(p.rating).toFixed(1) || "—"}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        {p.status === "pending"
                          ? <span className="badge badge-warning"><Clock className="w-3 h-3" /> Kutilmoqda</span>
                          : p.status === "rejected"
                          ? <span className="badge badge-danger"><XCircle className="w-3 h-3" /> Rad etilgan</span>
                          : p.isFeatured
                          ? <span className="badge badge-info">⭐ Tavsiya</span>
                          : <span className="badge badge-success"><CheckCircle className="w-3 h-3" /> Tasdiqlangan</span>
                        }
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {p.status === "pending" ? (
                            <>
                              <button
                                onClick={() => setRejectModal(p)}
                                title="Rad etish"
                                className="w-7 h-7 rounded-lg bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-200 transition-colors"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => approveMutation.mutate(p.id)}
                                disabled={approveMutation.isPending}
                                title="Tasdiqlash"
                                className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center hover:bg-emerald-200 transition-colors disabled:opacity-50"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => { setActive(p); setModal("view"); }}
                                className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center hover:bg-violet-100 hover:text-violet-700 transition-colors"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => { setActive(p); setModal("edit"); }}
                                className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center hover:bg-blue-100 hover:text-blue-700 transition-colors"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleDelete(p.id)}
                            disabled={deleteMutation.isPending}
                            className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center hover:bg-red-100 hover:text-red-600 transition-colors disabled:opacity-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <div className="px-4 py-3 border-t border-border/40 text-xs text-muted-foreground">
          {filtered.length} ta natija
        </div>
      </div>

      {/* Modals */}
      {(modal === "add" || modal === "edit") && (
        <ProductModal
          product={modal === "edit" ? active : null}
          onClose={closeModal}
          onSaved={closeModal}
        />
      )}
      {modal === "view" && active && (
        <ViewModal
          product={active}
          onClose={closeModal}
          onEdit={() => setModal("edit")}
        />
      )}

      {/* Reject reason modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => { setRejectModal(null); setRejectReason(""); }} />
          <div className="relative bg-card rounded-2xl shadow-2xl w-full max-w-md p-6 border border-border/60">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-display font-bold text-base">Mahsulotni rad etish</h3>
                <p className="text-xs text-muted-foreground line-clamp-1">{rejectModal.name}</p>
              </div>
              <button onClick={() => { setRejectModal(null); setRejectReason(""); }} className="ml-auto w-8 h-8 rounded-xl bg-muted flex items-center justify-center hover:bg-muted/80">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Product preview */}
            {rejectModal.images?.[0] && (
              <div className="w-full h-32 rounded-xl overflow-hidden mb-4 bg-muted">
                <img src={rejectModal.images[0]} alt={rejectModal.name} className="w-full h-full object-cover" />
              </div>
            )}

            <label className="block text-sm font-semibold text-foreground mb-2">
              Rad etish sababi <span className="text-red-500">*</span>
            </label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Masalan: Rasm sifati yetarli emas, narx noto'g'ri ko'rsatilgan, tavsif to'liq emas..."
              rows={4}
              className="w-full px-4 py-3 bg-muted/50 border border-border/60 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-300 mb-4"
            />
            <p className="text-xs text-muted-foreground mb-4">Bu xabar sotuvchiga ko'rsatiladi</p>

            <div className="flex gap-3">
              <button
                onClick={() => { setRejectModal(null); setRejectReason(""); }}
                className="flex-1 h-10 rounded-xl bg-muted text-foreground text-sm font-semibold hover:bg-muted/80 transition-colors"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleRejectSubmit}
                disabled={!rejectReason.trim() || rejectMutation.isPending}
                className="flex-1 h-10 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                {rejectMutation.isPending ? "Rad etilmoqda..." : "Rad etish"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
