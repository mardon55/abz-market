import { useState, useRef, useEffect } from "react";
import {
  Search, Plus, Edit2, Trash2, Eye, Star, X, Upload,
  ImageIcon, ChevronDown, Check, Package,
} from "lucide-react";
import { cn } from "@/lib/utils";

function fmt(n: number) { return n.toLocaleString("ru-RU") + " so'm"; }

// ── Types ────────────────────────────────────────────────────────────────────
interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  oldPrice: number | null;
  stock: number;
  rating: number;
  reviews: number;
  status: "faol" | "tugagan" | "kutilmoqda";
  img: string;
  store: string;
  description: string;
  specs: Record<string, string>;
}

// ── Category config ───────────────────────────────────────────────────────────
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

const CAT_NAMES = CATEGORIES.map((c) => c.name);

const STATUS_CLASS: Record<string, string> = {
  faol:       "badge badge-success",
  tugagan:    "badge badge-danger",
  kutilmoqda: "badge badge-warning",
};

// ── Default products (seeded once) ───────────────────────────────────────────
const SEED: Product[] = [
  { id: 1, name: "Zamonaviy Lusso Yotoq To'plami",   category: "Yotoqxona",  price: 12500000, oldPrice: 15000000, stock: 12, rating: 4.8, reviews: 124, status: "faol",      img: "https://images.unsplash.com/photo-1505693314120-0d443867891c?w=200&q=70", store: "Comfort Home", description: "Premium yotoq xona to'plami, zamona dizayni.", specs: { material: "Eman", size: "160x200", storage: "Ha", mattress: "Yo'q" } },
  { id: 2, name: "Premium Oshxona Mebellari To'plami", category: "Oshxonalar", price: 28000000, oldPrice: null,     stock: 5,  rating: 4.9, reviews: 89,  status: "faol",      img: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=200&q=70", store: "Kitchen Pro", description: "Zamonaviy oshxona garnituri, akril frontlar.", specs: { material: "Akril", shape: "L-shakl", countertop: "Granit", appliances: "Ha" } },
  { id: 3, name: "Zamonaviy Shkaf 2 qanotli Eman",   category: "Shkaflar",   price: 9980000,  oldPrice: 11500000, stock: 0,  rating: 4.6, reviews: 56,  status: "tugagan",   img: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=200&q=70", store: "Comfort Home", description: "Sifatli eman yog'ochidan yasalgan 2 qanotli shkaf.", specs: { material: "Eman", doors: "2", height: "220", width: "120", mirror: "Ha" } },
];

function loadProducts(): Product[] {
  try {
    const raw = localStorage.getItem("abz_admin_products");
    return raw ? JSON.parse(raw) : SEED;
  } catch { return SEED; }
}
function saveProducts(list: Product[]) {
  try { localStorage.setItem("abz_admin_products", JSON.stringify(list)); } catch {}
}

// ── Blank form ────────────────────────────────────────────────────────────────
function blankForm() {
  return {
    name: "",
    category: CATEGORIES[0].name,
    price: "",
    oldPrice: "",
    stock: "",
    store: "",
    status: "faol" as const,
    description: "",
    specs: {} as Record<string, string>,
    img: "",
  };
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
        <button
          type="button"
          onClick={() => onChange("")}
          className="mt-2 text-xs text-destructive hover:underline"
        >
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
          className={cn(
            "w-11 h-6 rounded-full transition-all relative",
            value === "Ha" ? "bg-primary" : "bg-border"
          )}
        >
          <span className={cn(
            "absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all",
            value === "Ha" ? "left-6" : "left-1"
          )} />
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
function ProductModal({
  product,
  onClose,
  onSave,
}: {
  product: Partial<Product> | null;
  onClose: () => void;
  onSave: (p: Product) => void;
}) {
  const isEdit = !!product?.id;
  const [form, setForm] = useState(() => product?.id ? {
    name:        product.name ?? "",
    category:    product.category ?? CATEGORIES[0].name,
    price:       String(product.price ?? ""),
    oldPrice:    String(product.oldPrice ?? ""),
    stock:       String(product.stock ?? ""),
    store:       product.store ?? "",
    status:      (product.status ?? "faol") as "faol" | "tugagan" | "kutilmoqda",
    description: product.description ?? "",
    specs:       product.specs ?? {},
    img:         product.img ?? "",
  } : blankForm());

  const [errors, setErrors] = useState<Record<string, string>>({});
  const catDef = CATEGORIES.find((c) => c.name === form.category)!;

  const setSpec = (key: string, val: string) => setForm((f) => ({ ...f, specs: { ...f.specs, [key]: val } }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim())     e.name  = "Mahsulot nomi kiritilsin";
    if (!form.price)           e.price = "Narx kiritilsin";
    if (!form.stock)           e.stock = "Ombordagi miqdor kiritilsin";
    if (!form.store.trim())    e.store = "Do'kon nomi kiritilsin";
    if (!form.img)             e.img   = "Rasm yuklash majburiy";
    return e;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const saved: Product = {
      id:          product?.id ?? Date.now(),
      name:        form.name.trim(),
      category:    form.category,
      price:       Number(form.price),
      oldPrice:    form.oldPrice ? Number(form.oldPrice) : null,
      stock:       Number(form.stock),
      store:       form.store.trim(),
      status:      form.status,
      description: form.description.trim(),
      specs:       form.specs,
      img:         form.img,
      rating:      product?.rating ?? 0,
      reviews:     product?.reviews ?? 0,
    };
    onSave(saved);
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
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

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <form id="product-form" onSubmit={handleSubmit} className="space-y-6">

            {/* Section: Kategoriya */}
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

            {/* Section: Rasm */}
            <div className="bg-card border border-border/60 rounded-2xl p-5">
              <h3 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-4">2. Rasm</h3>
              <ImageUpload value={form.img} onChange={(v) => { setForm((f) => ({ ...f, img: v })); setErrors((e) => ({ ...e, img: "" })); }} />
              {errors.img && <p className="text-destructive text-xs mt-1">{errors.img}</p>}
            </div>

            {/* Section: Asosiy ma'lumotlar */}
            <div className="bg-card border border-border/60 rounded-2xl p-5 space-y-4">
              <h3 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wide">3. Asosiy ma'lumotlar</h3>

              {/* Name */}
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

              {/* Price row */}
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

              {/* Stock + Store */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Ombordagi soni *</label>
                  <input
                    type="number"
                    value={form.stock}
                    onChange={(e) => { setForm((f) => ({ ...f, stock: e.target.value })); setErrors((er) => ({ ...er, stock: "" })); }}
                    placeholder="10"
                    className="w-full h-10 px-3 bg-muted/40 border border-border/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  {errors.stock && <p className="text-destructive text-xs mt-1">{errors.stock}</p>}
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Do'kon nomi *</label>
                  <input
                    type="text"
                    value={form.store}
                    onChange={(e) => { setForm((f) => ({ ...f, store: e.target.value })); setErrors((er) => ({ ...er, store: "" })); }}
                    placeholder="Comfort Home"
                    className="w-full h-10 px-3 bg-muted/40 border border-border/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  {errors.store && <p className="text-destructive text-xs mt-1">{errors.store}</p>}
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Holat</label>
                <div className="flex gap-2">
                  {(["faol","tugagan","kutilmoqda"] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, status: s }))}
                      className={cn(
                        "flex-1 h-9 rounded-xl text-xs font-semibold border transition-all capitalize",
                        form.status === s
                          ? s === "faol" ? "bg-emerald-500 text-white border-emerald-500"
                            : s === "tugagan" ? "bg-destructive text-white border-destructive"
                            : "bg-amber-500 text-white border-amber-500"
                          : "bg-muted border-border/60 text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {s === "faol" ? "Faol" : s === "tugagan" ? "Tugagan" : "Kutilmoqda"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Section: Description */}
            <div className="bg-card border border-border/60 rounded-2xl p-5 space-y-3">
              <h3 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wide">4. Tavsif</h3>
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={4}
                placeholder={`${catDef.name} haqida to'liq ma'lumot yozing: xususiyatlari, afzalliklari, ishlab chiqaruvchi...`}
                className="w-full px-3 py-2.5 bg-muted/40 border border-border/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              />
            </div>

            {/* Section: Category-specific specs */}
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
            className="flex-1 h-11 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors shadow-sm shadow-primary/30"
          >
            {isEdit ? "Saqlash" : "Mahsulot qo'shish"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── View modal ────────────────────────────────────────────────────────────────
function ViewModal({ product, onClose, onEdit }: { product: Product; onClose: () => void; onEdit: () => void }) {
  const catDef = CATEGORIES.find((c) => c.name === product.category);
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative ml-auto w-full max-w-lg h-full bg-background shadow-2xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/60 bg-card shrink-0">
          <h2 className="font-display font-bold text-base">Mahsulot ma'lumotlari</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center"><X className="w-4 h-4" /></button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {product.img && (
            <img src={product.img} alt={product.name} className="w-full h-52 object-cover" />
          )}
          <div className="p-5 space-y-4">
            <div>
              <span className="badge badge-primary">{product.category}</span>
              <h3 className="font-display font-bold text-xl mt-2">{product.name}</h3>
              <p className="text-muted-foreground text-sm mt-1">{product.store}</p>
            </div>
            <div className="flex items-center gap-4">
              <div>
                <div className="font-bold text-lg text-primary">{fmt(product.price)}</div>
                {product.oldPrice && <div className="text-xs text-muted-foreground line-through">{fmt(product.oldPrice)}</div>}
              </div>
              <span className={STATUS_CLASS[product.status]}>{product.status}</span>
              <div className="ml-auto flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span className="font-semibold text-sm">{product.rating}</span>
                <span className="text-muted-foreground text-xs">({product.reviews})</span>
              </div>
            </div>
            {product.description && (
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Tavsif</h4>
                <p className="text-sm leading-relaxed">{product.description}</p>
              </div>
            )}
            {catDef && Object.keys(product.specs).length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">{catDef.emoji} {product.category} xususiyatlari</h4>
                <div className="space-y-1.5">
                  {catDef.fields.filter(f => product.specs[f.key]).map((f) => (
                    <div key={f.key} className="flex items-center justify-between py-1.5 px-3 bg-muted/40 rounded-lg text-sm">
                      <span className="text-muted-foreground">{f.label}</span>
                      <span className="font-semibold">{product.specs[f.key]}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-muted/40 rounded-xl p-3 text-center">
                <div className="font-bold text-lg">{product.stock}</div>
                <div className="text-xs text-muted-foreground">Omborda</div>
              </div>
              <div className="bg-muted/40 rounded-xl p-3 text-center">
                <div className="font-bold text-lg">{product.reviews}</div>
                <div className="text-xs text-muted-foreground">Izohlar</div>
              </div>
            </div>
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
  const [products, setProducts] = useState<Product[]>(() => loadProducts());
  const [search, setSearch]     = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modal, setModal]       = useState<"add" | "edit" | "view" | null>(null);
  const [active, setActive]     = useState<Product | null>(null);

  const filtered = products.filter((p) => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat    = catFilter === "all" || p.category === catFilter;
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    return matchSearch && matchCat && matchStatus;
  });

  const handleSave = (p: Product) => {
    setProducts((prev) => {
      const next = prev.some((x) => x.id === p.id)
        ? prev.map((x) => x.id === p.id ? p : x)
        : [p, ...prev];
      saveProducts(next);
      return next;
    });
    setModal(null);
    setActive(null);
  };

  const handleDelete = (id: number) => {
    if (!confirm("Mahsulotni o'chirishni tasdiqlaysizmi?")) return;
    setProducts((prev) => { const next = prev.filter((p) => p.id !== id); saveProducts(next); return next; });
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl">Mahsulotlar</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{products.length} ta mahsulot</p>
        </div>
        <button
          onClick={() => { setActive(null); setModal("add"); }}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors self-start sm:self-auto shadow-sm shadow-primary/30"
        >
          <Plus className="w-4 h-4" /> Mahsulot qo'shish
        </button>
      </div>

      {/* Category quick-filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-3 hide-scrollbar">
        <button
          onClick={() => setCatFilter("all")}
          className={cn("px-3 py-1.5 rounded-xl text-xs font-semibold border shrink-0 transition-all",
            catFilter === "all" ? "bg-primary text-white border-primary" : "bg-card border-border/60 text-muted-foreground hover:text-foreground"
          )}
        >
          Barchasi ({products.length})
        </button>
        {CATEGORIES.map((c) => {
          const count = products.filter((p) => p.category === c.name).length;
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

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Mahsulot qidirish..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 h-9 bg-card border border-border/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-9 px-3 bg-card border border-border/60 rounded-xl text-sm focus:outline-none"
        >
          <option value="all">Barcha holat</option>
          <option value="faol">Faol</option>
          <option value="tugagan">Tugagan</option>
          <option value="kutilmoqda">Kutilmoqda</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-card border border-border/60 rounded-2xl overflow-hidden shadow-sm">
        {filtered.length === 0 ? (
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
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide hidden sm:table-cell">Ombor</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide hidden lg:table-cell">Reyting</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Holat</th>
                  <th className="text-right px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Amal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filtered.map((p) => {
                  const catEmoji = CATEGORIES.find((c) => c.name === p.category)?.emoji ?? "📦";
                  return (
                    <tr key={p.id} className="table-row-hover">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {p.img ? (
                            <img src={p.img} alt={p.name} className="w-10 h-10 rounded-xl object-cover bg-muted shrink-0" />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-xl shrink-0">{catEmoji}</div>
                          )}
                          <div>
                            <div className="font-semibold line-clamp-1 max-w-[200px]">{p.name}</div>
                            <div className="text-xs text-muted-foreground">{p.store}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="badge badge-primary">{catEmoji} {p.category}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold">{fmt(p.price)}</div>
                        {p.oldPrice && <div className="text-xs text-muted-foreground line-through">{fmt(p.oldPrice)}</div>}
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className={cn("font-semibold", p.stock === 0 ? "text-destructive" : p.stock < 5 ? "text-amber-600" : "text-foreground")}>
                          {p.stock} ta
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <div className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                          <span className="font-semibold">{p.rating || "—"}</span>
                          {p.reviews > 0 && <span className="text-muted-foreground text-xs">({p.reviews})</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={STATUS_CLASS[p.status]}>{p.status}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
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
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center hover:bg-red-100 hover:text-red-600 transition-colors"
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
          onClose={() => { setModal(null); setActive(null); }}
          onSave={handleSave}
        />
      )}
      {modal === "view" && active && (
        <ViewModal
          product={active}
          onClose={() => { setModal(null); setActive(null); }}
          onEdit={() => setModal("edit")}
        />
      )}
    </div>
  );
}
