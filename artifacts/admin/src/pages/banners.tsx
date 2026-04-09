import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus, Edit2, Trash2, Eye, EyeOff, Image as ImageIcon,
  GripVertical, X, Check, Loader2, AlertCircle, Palette, Tag,
} from "lucide-react";
import { cn } from "@/lib/utils";

const BASE = "/api";

// ── Types ──────────────────────────────────────────────────────────────────
interface Category {
  id: string;
  name: string;
  parentId: string | null;
}

interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  badge: string | null;
  image: string | null;
  gradient: string;
  link: string;
  categoryId: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
}

// ── Gradients ──────────────────────────────────────────────────────────────
const GRADIENTS = [
  { label: "Binafsha",  value: "from-violet-600 via-purple-600 to-fuchsia-500" },
  { label: "Qizil",    value: "from-rose-500 via-pink-500 to-red-400" },
  { label: "Ko'k",     value: "from-blue-600 via-indigo-500 to-violet-500" },
  { label: "Yashil",   value: "from-emerald-500 via-teal-500 to-green-400" },
  { label: "Qovoq",    value: "from-orange-500 via-amber-500 to-yellow-400" },
  { label: "Qora",     value: "from-slate-700 via-slate-600 to-zinc-500" },
];

// ── Image compressor ───────────────────────────────────────────────────────
async function compressImage(file: File, maxDim = 1200): Promise<string> {
  return new Promise((res) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width  = img.width  * scale;
      c.height = img.height * scale;
      c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      res(c.toDataURL("image/jpeg", 0.8));
    };
    img.src = url;
  });
}

// ── Empty form ─────────────────────────────────────────────────────────────
const emptyForm = () => ({
  title: "", subtitle: "", badge: "🔥 HOT",
  image: "", gradient: GRADIENTS[0].value,
  link: "/catalog", categoryId: "", isActive: true, sortOrder: 0,
});

// ── Banner preview ─────────────────────────────────────────────────────────
function BannerPreview({ form }: { form: ReturnType<typeof emptyForm> }) {
  return (
    <div className={`relative aspect-[16/8] rounded-2xl overflow-hidden bg-gradient-to-br ${form.gradient}`}>
      {form.image && (
        <img src={form.image} alt="" className="absolute inset-0 w-full h-full object-cover opacity-35 mix-blend-overlay" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />
      {form.badge && (
        <span className="absolute top-3 left-3 text-white text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/20">
          {form.badge}
        </span>
      )}
      <div className="absolute bottom-0 left-0 right-0 p-3">
        {form.subtitle && <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest mb-1">{form.subtitle}</p>}
        <h2 className="text-white font-bold text-base leading-tight">{form.title || "Banner sarlavhasi"}</h2>
      </div>
    </div>
  );
}

// ── Modal ──────────────────────────────────────────────────────────────────
function BannerModal({
  banner, onClose,
}: { banner: Banner | null; onClose: () => void }) {
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState(() => banner ? {
    title:      banner.title,
    subtitle:   banner.subtitle  ?? "",
    badge:      banner.badge     ?? "",
    image:      banner.image     ?? "",
    gradient:   banner.gradient,
    link:       banner.link,
    categoryId: banner.categoryId ?? "",
    isActive:   banner.isActive,
    sortOrder:  banner.sortOrder,
  } : emptyForm());

  const set = (k: string, v: any) => setForm((p) => ({ ...p, [k]: v }));

  // Fetch categories for the selector
  const { data: catData } = useQuery<{ categories: Category[] }>({
    queryKey: ["categories-all"],
    queryFn: () => fetch(`${BASE}/categories`).then((r) => r.json()),
  });
  const allCategories = catData?.categories ?? [];
  const parentCats = allCategories.filter((c) => !c.parentId);
  const childCats  = allCategories.filter((c) =>  c.parentId);

  const mutation = useMutation({
    mutationFn: async () => {
      const url  = banner ? `${BASE}/banners/${banner.id}` : `${BASE}/banners`;
      const meth = banner ? "PUT" : "POST";
      const r = await fetch(url, {
        method: meth,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          subtitle:   form.subtitle   || null,
          badge:      form.badge      || null,
          image:      form.image      || null,
          categoryId: form.categoryId || null,
          sortOrder:  Number(form.sortOrder),
        }),
      });
      if (!r.ok) throw new Error((await r.json()).error || "Xato");
      return r.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["banners"] }); onClose(); },
  });

  const handleFile = async (files: FileList | null) => {
    if (!files?.[0]) return;
    const compressed = await compressImage(files[0]);
    set("image", compressed);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="font-bold text-lg">{banner ? "Bannerni tahrirlash" : "Yangi banner"}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Preview */}
          <BannerPreview form={form} />

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Sarlavha *</label>
            <input
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Yozgi chegirmalar"
              className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
            />
          </div>

          {/* Subtitle */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Kichik sarlavha</label>
            <input
              value={form.subtitle}
              onChange={(e) => set("subtitle", e.target.value)}
              placeholder="20% GACHA ARZONLASHDI"
              className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
            />
          </div>

          {/* Badge */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Badge matni</label>
            <input
              value={form.badge}
              onChange={(e) => set("badge", e.target.value)}
              placeholder="🔥 HOT"
              className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
            />
          </div>

          {/* Image */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Banner rasmi</label>
            <div className="flex gap-2">
              <input
                value={form.image.startsWith("data:") ? "[Yuklangan rasm]" : form.image}
                onChange={(e) => set("image", e.target.value)}
                placeholder="https://... yoki rasm yuklansin"
                className="flex-1 border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                readOnly={form.image.startsWith("data:")}
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-2.5 bg-violet-50 border border-violet-200 text-violet-700 rounded-xl text-sm font-medium hover:bg-violet-100 shrink-0"
              >
                <ImageIcon className="w-4 h-4" />
                Yuklash
              </button>
              {form.image && (
                <button type="button" onClick={() => set("image", "")} className="px-3 py-2.5 bg-red-50 border border-red-200 text-red-600 rounded-xl hover:bg-red-100">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files)} />
          </div>

          {/* Category selector — appears after image is set */}
          {form.image && (
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" />
                Reklama kategoriyasi
                <span className="font-normal text-gray-400">(ixtiyoriy)</span>
              </label>
              <select
                value={form.categoryId}
                onChange={(e) => set("categoryId", e.target.value)}
                className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white"
              >
                <option value="">— Kategoriya tanlanmagan —</option>
                {parentCats.length > 0 && (
                  <optgroup label="── Asosiy kategoriyalar ──">
                    {parentCats.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </optgroup>
                )}
                {childCats.length > 0 && (
                  <optgroup label="── Subkategoriyalar ──">
                    {childCats.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </optgroup>
                )}
              </select>
              {form.categoryId && (
                <p className="text-xs text-violet-600 mt-1 flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  "Ko'rish" tugmasi bosilganda shu kategoriyaga o'tiladi
                </p>
              )}
            </div>
          )}

          {/* Gradient */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2">
              <Palette className="w-3.5 h-3.5 inline mr-1" />Fon rangi
            </label>
            <div className="grid grid-cols-3 gap-2">
              {GRADIENTS.map((g) => (
                <button
                  key={g.value}
                  type="button"
                  onClick={() => set("gradient", g.value)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-xl border-2 text-xs font-medium transition-all",
                    form.gradient === g.value ? "border-violet-500 bg-violet-50" : "border-gray-200 hover:border-gray-300"
                  )}
                >
                  <div className={`w-5 h-5 rounded-lg bg-gradient-to-br ${g.value} shrink-0`} />
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          {/* Link */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Havola (link)</label>
            <input
              value={form.link}
              onChange={(e) => set("link", e.target.value)}
              placeholder="/catalog"
              className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
            />
          </div>

          {/* Sort + Active */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-600 mb-1">Tartib raqami</label>
              <input
                type="number"
                value={form.sortOrder}
                onChange={(e) => set("sortOrder", e.target.value)}
                className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-600 mb-1">Holati</label>
              <button
                type="button"
                onClick={() => set("isActive", !form.isActive)}
                className={cn(
                  "w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-colors",
                  form.isActive ? "bg-emerald-50 border-emerald-300 text-emerald-700" : "bg-gray-50 border-gray-300 text-gray-500"
                )}
              >
                {form.isActive ? <><Eye className="w-4 h-4" /> Aktiv</> : <><EyeOff className="w-4 h-4" /> Nofaol</>}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl border text-sm font-medium hover:bg-gray-50">
            Bekor
          </button>
          <button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || !form.title}
            className="px-5 py-2.5 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 disabled:opacity-60 flex items-center gap-2"
          >
            {mutation.isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Saqlanmoqda...</> : <><Check className="w-4 h-4" /> Saqlash</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function BannersPage() {
  const qc = useQueryClient();
  const [modalBanner, setModalBanner] = useState<Banner | null | "new">(null);

  const { data, isLoading } = useQuery<{ banners: Banner[] }>({
    queryKey: ["banners"],
    queryFn: () => fetch(`${BASE}/banners?all=true`).then((r) => r.json()),
    refetchInterval: 10_000,
  });
  const banners = data?.banners ?? [];

  const { data: catData } = useQuery<{ categories: Category[] }>({
    queryKey: ["categories-all"],
    queryFn: () => fetch(`${BASE}/categories`).then((r) => r.json()),
  });
  const categoryMap = Object.fromEntries(
    (catData?.categories ?? []).map((c) => [c.id, c.name])
  );

  const toggleActive = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      await fetch(`${BASE}/banners/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["banners"] }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) =>
      fetch(`${BASE}/banners/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["banners"] }),
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bannerlar</h1>
          <p className="text-gray-500 text-sm mt-1">Bosh sahifa slayder bannerlarini boshqaring</p>
        </div>
        <button
          onClick={() => setModalBanner("new")}
          className="flex items-center gap-2 bg-violet-600 text-white px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-violet-700 transition-colors shadow-lg shadow-violet-200"
        >
          <Plus className="w-4 h-4" /> Yangi banner
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Jami",    value: banners.length,                      color: "bg-violet-50 text-violet-700 border-violet-100" },
          { label: "Aktiv",   value: banners.filter((b) => b.isActive).length,  color: "bg-emerald-50 text-emerald-700 border-emerald-100" },
          { label: "Nofaol", value: banners.filter((b) => !b.isActive).length, color: "bg-gray-50 text-gray-500 border-gray-100" },
        ].map(({ label, value, color }) => (
          <div key={label} className={`border rounded-2xl px-4 py-3 ${color}`}>
            <div className="text-2xl font-bold">{value}</div>
            <div className="text-sm font-medium">{label}</div>
          </div>
        ))}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-24 bg-gray-100 animate-pulse rounded-2xl" />)}
        </div>
      ) : banners.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
          <ImageIcon className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="font-semibold text-gray-500">Hali banner yo'q</p>
          <p className="text-gray-400 text-sm mt-1">Birinchi bannerni yarating</p>
          <button
            onClick={() => setModalBanner("new")}
            className="mt-4 px-5 py-2 bg-violet-600 text-white rounded-xl text-sm font-semibold hover:bg-violet-700"
          >
            Banner yaratish
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {banners.map((banner) => (
            <div
              key={banner.id}
              className={cn(
                "bg-white border rounded-2xl overflow-hidden shadow-sm transition-all",
                !banner.isActive && "opacity-60"
              )}
            >
              <div className="flex items-stretch">
                {/* Preview */}
                <div className={`w-40 shrink-0 relative bg-gradient-to-br ${banner.gradient} min-h-[96px]`}>
                  {banner.image && (
                    <img src={banner.image} alt="" className="absolute inset-0 w-full h-full object-cover opacity-35 mix-blend-overlay" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-2 left-2 right-2">
                    <p className="text-white font-bold text-xs leading-tight line-clamp-2 drop-shadow">{banner.title}</p>
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-gray-900">{banner.title}</h3>
                        {banner.subtitle && <p className="text-xs text-gray-500 mt-0.5">{banner.subtitle}</p>}
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {banner.badge && (
                            <span className="text-[10px] font-bold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{banner.badge}</span>
                          )}
                          <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">Tartib: {banner.sortOrder}</span>
                          {banner.categoryId ? (
                            <span className="text-[10px] font-bold bg-violet-50 text-violet-600 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                              <Tag className="w-2.5 h-2.5" />
                              {categoryMap[banner.categoryId] ?? "Kategoriya"}
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full">→ {banner.link}</span>
                          )}
                        </div>
                      </div>
                      <span className={cn(
                        "shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full border",
                        banner.isActive
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-gray-50 text-gray-400 border-gray-200"
                      )}>
                        {banner.isActive ? "Aktiv" : "Nofaol"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={() => toggleActive.mutate({ id: banner.id, isActive: !banner.isActive })}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors",
                        banner.isActive
                          ? "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                          : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                      )}
                    >
                      {banner.isActive ? <><EyeOff className="w-3.5 h-3.5" /> O'chirish</> : <><Eye className="w-3.5 h-3.5" /> Yoqish</>}
                    </button>
                    <button
                      onClick={() => setModalBanner(banner)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" /> Tahrirlash
                    </button>
                    <button
                      onClick={() => { if (confirm("Bannerni o'chirasizmi?")) deleteMut.mutate(banner.id); }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition-colors ml-auto"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> O'chirish
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalBanner !== null && (
        <BannerModal
          banner={modalBanner === "new" ? null : modalBanner}
          onClose={() => setModalBanner(null)}
        />
      )}
    </div>
  );
}
