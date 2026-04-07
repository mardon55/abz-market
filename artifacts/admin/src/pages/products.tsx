import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Search, Plus, Edit2, Trash2, Eye, Star, X, Upload,
  ImageIcon, ChevronDown, Check, Package, RefreshCw, AlertCircle,
  CheckCircle, XCircle, Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

function fmt(n: number) { return n.toLocaleString("ru-RU") + " so'm"; }

// ── API types ─────────────────────────────────────────────────────────────────
interface ApiProduct {
  id: string;
  name: string;
  price: string;
  oldPrice: string | null;
  description: string | null;
  images: string[] | null;
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
}

interface ApiCategory { id: string; name: string; icon: string | null; }
interface ApiStore    { id: string; name: string; }

// ── Category config (for spec fields only) ────────────────────────────────────
interface FieldDef { key: string; label: string; type: "text" | "number" | "select" | "toggle"; options?: string[] }

const CATEGORIES: { name: string; emoji: string; fields: FieldDef[] }[] = [
  {
    name: "Shkaflar", emoji: "🚪",
    fields: [
      { key: "material",   label: "Material",          type: "select",  options: ["Eman","MDF","Sosna","Laminat","Kombinatsiya"] },
      { key: "color",      label: "Rangi",             type: "text" },
      { key: "width",      label: "Eni (sm)",          type: "number" },
      { key: "height",     label: "Balandligi (sm)",   type: "number" },
      { key: "depth",      label: "Chuqurligi (sm)",   type: "number" },
      { key: "doors",      label: "Eshiklar soni",     type: "select",  options: ["1","2","3","4","Slayder"] },
      { key: "drawers",    label: "Tortmachalar soni", type: "select",  options: ["0","1","2","3","4"] },
      { key: "mirror",     label: "Ko'zgu mavjud",     type: "toggle" },
    ],
  },
  {
    name: "Komodlar", emoji: "🪵",
    fields: [
      { key: "material",   label: "Material",          type: "select",  options: ["Eman","MDF","Sosna","Laminat"] },
      { key: "color",      label: "Rangi",             type: "text" },
      { key: "width",      label: "Eni (sm)",          type: "number" },
      { key: "height",     label: "Balandligi (sm)",   type: "number" },
      { key: "depth",      label: "Chuqurligi (sm)",   type: "number" },
      { key: "drawers",    label: "Tortmachalar soni", type: "select",  options: ["2","3","4","5","6"] },
      { key: "topGlass",   label: "Shisha ustlik",     type: "toggle" },
    ],
  },
  {
    name: "Oshxonalar", emoji: "🍳",
    fields: [
      { key: "material",   label: "Material",          type: "select",  options: ["MDF","Akril","Plastik","Eman frontal"] },
      { key: "color",      label: "Rangi",             type: "text" },
      { key: "shape",      label: "Shakli",            type: "select",  options: ["To'g'ri","L-shakl","U-shakl","P-shakl"] },
      { key: "totalLen",   label: "Umumiy uzunlik (sm)", type: "number" },
      { key: "countertop", label: "Ish yuzasi material", type: "select", options: ["Granit","Eman","Kompozit","Qoplamlangan DSP"] },
      { key: "appliances", label: "Texnika kiritilgan", type: "toggle" },
      { key: "sink",       label: "Lavabo bilan",      type: "toggle" },
    ],
  },
  {
    name: "Yotoqxona", emoji: "🛏",
    fields: [
      { key: "material",   label: "Material",          type: "select",  options: ["Eman","MDF","To'qilgan","Metal"] },
      { key: "color",      label: "Rangi",             type: "text" },
      { key: "size",       label: "O'lcham",           type: "select",  options: ["90x200 (bir kishi)","120x200","140x200","160x200","180x200 (king)","200x200"] },
      { key: "headboard",  label: "Bosh to'ri turi",   type: "select",  options: ["Yumshoq","Qattiq","Maxsus dizayn"] },
      { key: "storage",    label: "Qutilar bilan",     type: "toggle" },
      { key: "mattress",   label: "Matras bilan",      type: "toggle" },
    ],
  },
  {
    name: "Stollar", emoji: "🪑",
    fields: [
      { key: "material",   label: "Material",          type: "select",  options: ["Eman","MDF","Shisha","Metal+Yog'och","Mramor"] },
      { key: "color",      label: "Rangi",             type: "text" },
      { key: "width",      label: "Eni (sm)",          type: "number" },
      { key: "length",     label: "Uzunligi (sm)",     type: "number" },
      { key: "height",     label: "Balandligi (sm)",   type: "number" },
      { key: "shape",      label: "Shakli",            type: "select",  options: ["To'rtburchak","Doira","Oval"] },
      { key: "extendable", label: "Kengaytiriladigan", type: "toggle" },
      { key: "chairs",     label: "Stullar bilan",     type: "toggle" },
      { key: "chairCount", label: "Stullar soni",      type: "select",  options: ["2","4","6","8"] },
    ],
  },
  {
    name: "Stullar", emoji: "💺",
    fields: [
      { key: "material",   label: "Qoplamasi",         type: "select",  options: ["Teri","Mato","Velur","To'r"] },
      { key: "color",      label: "Rangi",             type: "text" },
      { key: "frame",      label: "Karkas",            type: "select",  options: ["Yog'och","Metal","Plastik"] },
      { key: "type",       label: "Turi",              type: "select",  options: ["Oshxona","Ofis","Bar","Dekorativ"] },
      { key: "armrests",   label: "Qo'ltiqchalar",     type: "toggle" },
      { key: "adjustable", label: "Balandligi sozlanadi", type: "toggle" },
      { key: "wheels",     label: "G'ildiraklar",      type: "toggle" },
    ],
  },
  {
    name: "Divonlar", emoji: "🛋",
    fields: [
      { key: "material",   label: "Qoplamasi",         type: "select",  options: ["Teri","Eko-teri","Mato","Velur","Mikrofiber"] },
      { key: "color",      label: "Rangi",             type: "text" },
      { key: "shape",      label: "Shakli",            type: "select",  options: ["To'g'ri","L-shakl","U-shakl","Modul"] },
      { key: "seats",      label: "O'tirish joylari",  type: "select",  options: ["2","3","4","5","6+"] },
      { key: "foldable",   label: "Yotiladigan",       type: "toggle" },
      { key: "storage",    label: "Qutilar bilan",     type: "toggle" },
      { key: "pillows",    label: "Yostiqlar bilan",   type: "toggle" },
    ],
  },
  {
    name: "Javonlar", emoji: "📚",
    fields: [
      { key: "material",   label: "Material",          type: "select",  options: ["Eman","MDF","Metal","Yog'och+Metal"] },
      { key: "color",      label: "Rangi",             type: "text" },
      { key: "width",      label: "Eni (sm)",          type: "number" },
      { key: "height",     label: "Balandligi (sm)",   type: "number" },
      { key: "depth",      label: "Chuqurligi (sm)",   type: "number" },
      { key: "shelves",    label: "Javonlar soni",     type: "select",  options: ["2","3","4","5","6","7","8"] },
      { key: "doors",      label: "Eshiklar bilan",    type: "toggle" },
      { key: "wallMount",  label: "Devorga o'rnatish", type: "toggle" },
    ],
  },
];

// ── API helpers ───────────────────────────────────────────────────────────────
async function fetchProducts(): Promise<ApiProduct[]> {
  const r = await fetch("/api/products?status=all&limit=200");
  if (!r.ok) throw new Error("Mahsulotlar yuklanmadi");
  const data = await r.json();
  return data.products ?? [];
}

async function approveProduct(id: string): Promise<ApiProduct> {
  const r = await fetch(`/api/products/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "approve" }),
  });
  if (!r.ok) throw new Error("Tasdiqlashda xato");
  return r.json();
}

async function rejectProduct(id: string): Promise<ApiProduct> {
  const r = await fetch(`/api/products/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "reject" }),
  });
  if (!r.ok) throw new Error("Rad etishda xato");
  return r.json();
}

async function fetchCategories(): Promise<ApiCategory[]> {
  const r = await fetch("/api/categories");
  if (!r.ok) return [];
  const data = await r.json();
  return data.categories ?? [];
}

async function fetchStores(): Promise<ApiStore[]> {
  const r = await fetch("/api/stores");
  if (!r.ok) return [];
  const data = await r.json();
  return data.stores ?? [];
}

async function createProduct(body: Record<string, unknown>): Promise<ApiProduct> {
  const r = await fetch("/api/products", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) {
    const err = await r.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? "Xato yuz berdi");
  }
  return r.json();
}

async function updateProduct(id: string, body: Record<string, unknown>): Promise<ApiProduct> {
  const r = await fetch(`/api/products/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error("Saqlashda xato yuz berdi");
  return r.json();
}

async function deleteProduct(id: string): Promise<void> {
  const r = await fetch(`/api/products/${id}`, { method: "DELETE" });
  if (!r.ok) throw new Error("O'chirishda xato");
}

// ── Image upload field ────────────────────────────────────────────────────────
function ImageUpload({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const ref = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => onChange(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Mahsulot rasmi *</label>
      <div
        onClick={() => ref.current?.click()}
        className={cn(
          "relative w-full h-48 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden",
          value ? "border-primary/40 bg-primary/5" : "border-border hover:border-primary/40 hover:bg-muted/50"
        )}
      >
        {value ? (
          <>
            <img src={value} alt="preview" className="absolute inset-0 w-full h-full object-cover rounded-2xl" />
            <div className="absolute inset-0 bg-black/40 rounded-2xl flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <Upload className="w-6 h-6 text-white mb-1" />
              <span className="text-white text-xs font-semibold">Rasmni almashtirish</span>
            </div>
          </>
        ) : (
          <>
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-3">
              <ImageIcon className="w-7 h-7 text-primary" />
            </div>
            <p className="text-sm font-semibold text-foreground">Rasm yuklash uchun bosing</p>
            <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WEBP • Maks 5MB</p>
          </>
        )}
        <input ref={ref} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </div>
      {value && (
        <button type="button" onClick={() => onChange("")} className="mt-2 text-xs text-destructive hover:underline">
          Rasmni o'chirish
        </button>
      )}
    </div>
  );
}

// ── Spec field renderer ───────────────────────────────────────────────────────
function SpecField({ field, value, onChange }: { field: FieldDef; value: string; onChange: (v: string) => void }) {
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

// ── Product form modal ────────────────────────────────────────────────────────
interface ProductForm {
  name: string;
  category: string;
  price: string;
  oldPrice: string;
  storeId: string;
  isFeatured: boolean;
  description: string;
  specs: Record<string, string>;
  img: string;
}

function blankForm(): ProductForm {
  return {
    name: "", category: CATEGORIES[0].name, price: "", oldPrice: "",
    storeId: "", isFeatured: true, description: "", specs: {}, img: "",
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
  const { data: apiCategories = [] } = useQuery({ queryKey: ["categories-list"], queryFn: fetchCategories });

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const [form, setForm] = useState<ProductForm>(() => {
    if (product) {
      const catName = CATEGORIES.find((c) => c.name === product.categoryName)?.name ?? CATEGORIES[0].name;
      return {
        name: product.name,
        category: catName,
        price: product.price,
        oldPrice: product.oldPrice ?? "",
        storeId: product.storeId ?? "",
        isFeatured: product.isFeatured,
        description: product.description ?? "",
        specs: {},
        img: product.images?.[0] ?? "",
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
  const catDef = CATEGORIES.find((c) => c.name === form.category)!;

  const setSpec = (key: string, val: string) =>
    setForm((f) => ({ ...f, specs: { ...f.specs, [key]: val } }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Mahsulot nomi kiritilsin";
    if (!form.price)       e.price = "Narx kiritilsin";
    if (!form.storeId)     e.storeId = "Do'kon tanlansin";
    if (!form.img)         e.img = "Rasm yuklash majburiy";
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    // Map category name → categoryId
    const matchedCat = apiCategories.find(
      (c) => c.name.toLowerCase() === form.category.toLowerCase()
    );

    // Build description with specs appended
    const specLines = Object.entries(form.specs)
      .filter(([, v]) => v)
      .map(([k, v]) => `${k}: ${v}`)
      .join(", ");
    const fullDesc = form.description.trim()
      ? form.description.trim() + (specLines ? `\n\nXususiyatlar: ${specLines}` : "")
      : specLines || null;

    const body: Record<string, unknown> = {
      name: form.name.trim(),
      price: form.price,
      oldPrice: form.oldPrice || null,
      description: fullDesc,
      images: form.img ? [form.img] : [],
      categoryId: matchedCat?.id ?? null,
      storeId: form.storeId,
      isFeatured: form.isFeatured,
      isTopSelling: false,
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
            <p className="text-muted-foreground text-xs mt-0.5">{form.category} kategoriyasi</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <form id="product-form" onSubmit={handleSubmit} className="space-y-6">

            {/* 1. Kategoriya */}
            <div className="bg-card border border-border/60 rounded-2xl p-5 space-y-4">
              <h3 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wide">1. Kategoriya</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.name}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, category: cat.name, specs: {} }))}
                    className={cn(
                      "flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all",
                      form.category === cat.name
                        ? "border-primary bg-primary/8 text-primary"
                        : "border-border/40 bg-muted/30 text-muted-foreground hover:border-primary/30"
                    )}
                  >
                    <span className="text-2xl">{cat.emoji}</span>
                    <span className="text-[11px] font-semibold leading-tight text-center">{cat.name}</span>
                    {form.category === cat.name && <Check className="w-3 h-3 text-primary" />}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Rasm */}
            <div className="bg-card border border-border/60 rounded-2xl p-5">
              <h3 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-4">2. Rasm</h3>
              <ImageUpload
                value={form.img}
                onChange={(v) => { setForm((f) => ({ ...f, img: v })); setErrors((e) => ({ ...e, img: "" })); }}
              />
              {errors.img && <p className="text-destructive text-xs mt-1">{errors.img}</p>}
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
                  placeholder={`Masalan: ${catDef.name} Premium dizayn`}
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
                placeholder={`${catDef.name} haqida to'liq ma'lumot yozing...`}
                className="w-full px-3 py-2.5 bg-muted/40 border border-border/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              />
            </div>

            {/* 5. Xususiyatlar */}
            <div className="bg-card border border-border/60 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">{catDef.emoji}</span>
                <div>
                  <h3 className="font-display font-semibold text-sm">{catDef.name} xususiyatlari</h3>
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
  const catDef = CATEGORIES.find((c) => c.name === product.categoryName);
  const img = product.images?.[0];
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative ml-auto w-full max-w-lg h-full bg-background shadow-2xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/60 bg-card shrink-0">
          <h2 className="font-display font-bold text-base">Mahsulot ma'lumotlari</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center"><X className="w-4 h-4" /></button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {img && <img src={img} alt={product.name} className="w-full h-52 object-cover" />}
          <div className="p-5 space-y-4">
            <div>
              {product.categoryName && <span className="badge badge-primary">{catDef?.emoji ?? "📦"} {product.categoryName}</span>}
              <h3 className="font-display font-bold text-xl mt-2">{product.name}</h3>
              <p className="text-muted-foreground text-sm mt-1">{product.storeName}</p>
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              <div>
                <div className="font-bold text-lg text-primary">{fmt(Number(product.price))}</div>
                {product.oldPrice && <div className="text-xs text-muted-foreground line-through">{fmt(Number(product.oldPrice))}</div>}
              </div>
              {product.isFeatured && <span className="badge badge-info">⭐ Tavsiya etilgan</span>}
              <div className="ml-auto flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span className="font-semibold text-sm">{Number(product.rating).toFixed(1)}</span>
                <span className="text-muted-foreground text-xs">({product.reviewCount})</span>
              </div>
            </div>
            {product.description && (
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Tavsif</h4>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{product.description}</p>
              </div>
            )}
          </div>
        </div>
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

  const { data: products = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["admin-products"],
    queryFn: fetchProducts,
    refetchInterval: 30_000,
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
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-products"] }),
  });

  const pendingProducts = products.filter((p) => p.status === "pending");

  const filtered = products.filter((p) => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || (p.storeName ?? "").toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === "all" || p.categoryName === catFilter;
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    return matchSearch && matchCat && matchStatus;
  });

  const handleDelete = (id: string) => {
    if (!confirm("Mahsulotni o'chirishni tasdiqlaysizmi?")) return;
    deleteMutation.mutate(id);
  };

  const closeModal = () => { setModal(null); setActive(null); };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h1 className="font-display font-bold text-2xl">Mahsulotlar</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{products.length} ta mahsulot</p>
        </div>
        <div className="flex gap-2 self-start sm:self-auto">
          <button
            onClick={() => refetch()}
            className="flex items-center gap-1.5 bg-muted border border-border/60 text-foreground px-3 py-2 rounded-xl text-sm font-semibold hover:bg-muted/80 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => { setActive(null); setModal("add"); }}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm shadow-primary/30"
          >
            <Plus className="w-4 h-4" /> Mahsulot qo'shish
          </button>
        </div>
      </div>

      {/* Pending approval banner */}
      {pendingProducts.length > 0 && statusFilter !== "pending" && (
        <div
          className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-4 cursor-pointer hover:bg-amber-100 transition-colors"
          onClick={() => setStatusFilter("pending")}
        >
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-amber-800 text-sm">{pendingProducts.length} ta mahsulot tasdiqlashni kutmoqda</p>
            <p className="text-xs text-amber-600 mt-0.5">Sotuvchilar tomonidan qo'shilgan — Ko'rish uchun bosing</p>
          </div>
          <CheckCircle className="w-5 h-5 text-amber-500" />
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
          const count = products.filter((p) => p.categoryName === c.name).length;
          if (count === 0) return null;
          return (
            <button
              key={c.name}
              onClick={() => setCatFilter(c.name)}
              className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border shrink-0 transition-all",
                catFilter === c.name ? "bg-primary text-white border-primary" : "bg-card border-border/60 text-muted-foreground hover:text-foreground"
              )}
            >
              {c.emoji} {c.name} ({count})
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
                  const catEmoji = CATEGORIES.find((c) => c.name === p.categoryName)?.emoji ?? "📦";
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
                                onClick={() => rejectMutation.mutate(p.id)}
                                disabled={rejectMutation.isPending || approveMutation.isPending}
                                title="Rad etish"
                                className="w-7 h-7 rounded-lg bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-200 transition-colors disabled:opacity-50"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => approveMutation.mutate(p.id)}
                                disabled={approveMutation.isPending || rejectMutation.isPending}
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
    </div>
  );
}
