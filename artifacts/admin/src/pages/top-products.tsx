import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Crown, Search, TrendingUp, Plus, X,
  Package, Image as ImageIcon, CheckCircle2,
  Flame, Loader2, Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

const BASE = "/api";

interface ApiProduct {
  id: string;
  name: string;
  price: string;
  images: string[] | null;
  storeName: string | null;
  categoryName: string | null;
  rating: string;
  reviewCount: number;
  isFeatured: boolean;
  isTopSelling: boolean;
  discount: number | null;
  salesCount: number;
  status: string;
}

function fmt(n: number) { return n.toLocaleString("ru-RU") + " so'm"; }

// ── Modal: "Top mahsulotlarni belgilash" ──────────────────────────────────
function MarkModal({
  allProducts,
  mode,           // "featured" | "top"
  onClose,
  onSave,
  isSaving,
}: {
  allProducts: ApiProduct[];
  mode: "featured" | "top";
  onClose: () => void;
  onSave: (ids: string[]) => void;
  isSaving: boolean;
}) {
  const field = mode === "featured" ? "isFeatured" : "isTopSelling";
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(allProducts.filter((p) => p[field]).map((p) => p.id))
  );

  const visible = useMemo(
    () =>
      allProducts.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          (p.storeName?.toLowerCase().includes(search.toLowerCase()) ?? false)
      ),
    [allProducts, search]
  );

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const addedCount = [...selected].filter(
    (id) => !allProducts.find((p) => p.id === id)?.[field]
  ).length;
  const removedCount = allProducts.filter((p) => p[field] && !selected.has(p.id)).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b shrink-0">
          <div className="flex items-center gap-2">
            {mode === "featured" ? (
              <div className="w-8 h-8 bg-violet-600 rounded-xl flex items-center justify-center">
                <Crown className="w-4 h-4 text-white" />
              </div>
            ) : (
              <div className="w-8 h-8 bg-rose-500 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
            )}
            <div>
              <h2 className="font-bold text-gray-900">
                {mode === "featured" ? "Featured mahsulotlarni belgilash" : "TOP mahsulotlarni belgilash"}
              </h2>
              <p className="text-xs text-gray-500">
                {mode === "featured"
                  ? "Bosh sahifada ko'rsatiladigan mahsulotlar"
                  : "Mahsulot kartochkasida TOP badge ko'rinadigan mahsulotlar"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="px-6 py-3 border-b shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Mahsulot nomini qidirish..."
              className="w-full pl-9 pr-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
            />
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-gray-500">
              {selected.size} ta tanlangan · {visible.length} ta mahsulot
            </p>
            <div className="flex gap-2">
              {addedCount > 0 && (
                <span className="text-[11px] bg-emerald-50 text-emerald-600 border border-emerald-200 px-2 py-0.5 rounded-full font-medium">
                  +{addedCount} qo'shiladi
                </span>
              )}
              {removedCount > 0 && (
                <span className="text-[11px] bg-red-50 text-red-500 border border-red-200 px-2 py-0.5 rounded-full font-medium">
                  -{removedCount} o'chiriladi
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Product list */}
        <div className="flex-1 overflow-y-auto px-6 py-3 space-y-1.5">
          {visible.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">Mahsulot topilmadi</p>
            </div>
          ) : (
            visible.map((p) => {
              const isSelected = selected.has(p.id);
              return (
                <button
                  key={p.id}
                  onClick={() => toggle(p.id)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left",
                    isSelected
                      ? mode === "featured"
                        ? "bg-violet-50 border-violet-300 shadow-sm"
                        : "bg-rose-50 border-rose-300 shadow-sm"
                      : "bg-white border-gray-100 hover:border-gray-300"
                  )}
                >
                  {/* Checkbox */}
                  <div
                    className={cn(
                      "w-5 h-5 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all",
                      isSelected
                        ? mode === "featured"
                          ? "bg-violet-600 border-violet-600"
                          : "bg-rose-500 border-rose-500"
                        : "bg-white border-gray-300"
                    )}
                  >
                    {isSelected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                  </div>

                  {/* Image */}
                  <div className="w-11 h-11 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                    {p.images?.[0] ? (
                      <img src={p.images[0]} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-4 h-4 text-gray-300" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-900 line-clamp-1">{p.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs font-bold text-violet-600">{fmt(Number(p.price))}</span>
                      {p.storeName && (
                        <span className="text-[10px] text-gray-400">· {p.storeName}</span>
                      )}
                    </div>
                  </div>

                  {/* Already marked indicator */}
                  {p[field] && (
                    <span className="text-[10px] font-semibold text-gray-400 shrink-0">
                      belgilangan
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t flex gap-3 shrink-0">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Bekor qilish
          </button>
          <button
            onClick={() => onSave([...selected])}
            disabled={isSaving}
            className={cn(
              "flex-1 py-2.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-colors",
              mode === "featured"
                ? "bg-violet-600 hover:bg-violet-700 disabled:bg-violet-300"
                : "bg-rose-500 hover:bg-rose-600 disabled:bg-rose-300"
            )}
          >
            {isSaving ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Saqlanmoqda...</>
            ) : (
              <><Check className="w-4 h-4" /> Saqlash ({selected.size} ta)</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Marked product card ───────────────────────────────────────────────────
function MarkedCard({
  product,
  badge,
  onRemove,
}: {
  product: ApiProduct;
  badge: "featured" | "top";
  onRemove: () => void;
}) {
  return (
    <div className="relative bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
      <button
        onClick={onRemove}
        className="absolute top-2 right-2 z-10 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 active:scale-90 shadow opacity-0 group-hover:opacity-100 transition-opacity"
        title="Olib tashlash"
      >
        <X className="w-3 h-3" />
      </button>
      <div className="absolute top-2 left-2 z-10">
        {badge === "featured" ? (
          <span className="bg-violet-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
            <Crown className="w-2.5 h-2.5" /> Featured
          </span>
        ) : (
          <span className="bg-rose-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
            <TrendingUp className="w-2.5 h-2.5" /> TOP
          </span>
        )}
      </div>
      <div className="aspect-square bg-gray-50 overflow-hidden">
        {product.images?.[0] ? (
          <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="w-8 h-8 text-gray-300" />
          </div>
        )}
      </div>
      <div className="p-2.5">
        <p className="font-semibold text-xs text-gray-900 line-clamp-2 leading-tight mb-1">{product.name}</p>
        <p className="text-xs font-bold text-violet-600">{fmt(Number(product.price))}</p>
        {product.storeName && (
          <p className="text-[10px] text-gray-400 mt-0.5 truncate">{product.storeName}</p>
        )}
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────
export default function TopProductsPage() {
  const qc = useQueryClient();
  const [modal, setModal] = useState<"featured" | "top" | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);

  const showToast = (msg: string, type: "ok" | "err" = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const { data, isLoading } = useQuery<{ products: ApiProduct[] }>({
    queryKey: ["products-top-admin"],
    queryFn: () => fetch(`${BASE}/products?status=all&limit=500`).then((r) => r.json()),
    refetchInterval: 10_000,
  });

  const allProducts = data?.products ?? [];
  const featuredProducts = allProducts.filter((p) => p.isFeatured);
  const topOnlyProducts  = allProducts.filter((p) => p.isTopSelling && !p.isFeatured);
  const topAllProducts   = allProducts.filter((p) => p.isTopSelling);

  // Single toggle (remove one card)
  const removeMut = useMutation({
    mutationFn: async ({ id, field }: { id: string; field: "isFeatured" | "isTopSelling" }) => {
      const r = await fetch(`${BASE}/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: false }),
      });
      if (!r.ok) throw new Error("Xato");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products-top-admin"] });
      showToast("Olib tashlandi");
    },
    onError: () => showToast("Xato yuz berdi", "err"),
  });

  // Batch save from modal
  const batchMut = useMutation({
    mutationFn: async ({
      selectedIds,
      field,
    }: {
      selectedIds: string[];
      field: "isFeatured" | "isTopSelling";
    }) => {
      const current = new Set(
        allProducts.filter((p) => p[field]).map((p) => p.id)
      );
      const toAdd    = selectedIds.filter((id) => !current.has(id));
      const toRemove = [...current].filter((id) => !selectedIds.includes(id));

      await Promise.all([
        ...toAdd.map((id) =>
          fetch(`${BASE}/products/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ [field]: true }),
          })
        ),
        ...toRemove.map((id) =>
          fetch(`${BASE}/products/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ [field]: false }),
          })
        ),
      ]);
    },
    onSuccess: (_, { selectedIds, field }) => {
      qc.invalidateQueries({ queryKey: ["products-top-admin"] });
      setModal(null);
      const label = field === "isFeatured" ? "Featured" : "TOP";
      showToast(`${label} mahsulotlar saqlandi (${selectedIds.length} ta)`);
    },
    onError: () => showToast("Xato yuz berdi", "err"),
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Crown className="w-6 h-6 text-violet-600" /> Top Mahsulotlar
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Mijozlarga ko'rsatiladigan mahsulotlarni belgilang
          </p>
        </div>
      </div>

      {/* ── CTA buttons ── */}
      <div className="grid grid-cols-2 gap-3">
        {/* Featured belgilash */}
        <button
          onClick={() => setModal("featured")}
          className="flex items-center gap-3 bg-violet-600 hover:bg-violet-700 active:scale-[0.98] text-white rounded-2xl px-5 py-4 transition-all shadow-md shadow-violet-200"
        >
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
            <Crown className="w-5 h-5" />
          </div>
          <div className="text-left">
            <p className="font-bold text-sm leading-tight">Featured belgilash</p>
            <p className="text-white/70 text-xs mt-0.5">
              {featuredProducts.length} ta belgilangan
            </p>
          </div>
          <Plus className="w-5 h-5 ml-auto shrink-0" />
        </button>

        {/* TOP belgilash */}
        <button
          onClick={() => setModal("top")}
          className="flex items-center gap-3 bg-rose-500 hover:bg-rose-600 active:scale-[0.98] text-white rounded-2xl px-5 py-4 transition-all shadow-md shadow-rose-200"
        >
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
            <Flame className="w-5 h-5" />
          </div>
          <div className="text-left">
            <p className="font-bold text-sm leading-tight">TOP belgilash</p>
            <p className="text-white/70 text-xs mt-0.5">
              {topAllProducts.length} ta belgilangan
            </p>
          </div>
          <Plus className="w-5 h-5 ml-auto shrink-0" />
        </button>
      </div>

      {/* ── Featured section ── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 bg-violet-600 rounded-lg flex items-center justify-center">
            <Crown className="w-3.5 h-3.5 text-white" />
          </div>
          <h3 className="font-bold text-gray-800">Featured mahsulotlar</h3>
          <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-medium ml-1">
            {featuredProducts.length} ta
          </span>
          <button
            onClick={() => setModal("featured")}
            className="ml-auto text-xs text-violet-600 hover:text-violet-800 font-semibold flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Tahrirlash
          </button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-[3/4] bg-gray-100 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : featuredProducts.length === 0 ? (
          <div
            onClick={() => setModal("featured")}
            className="flex flex-col items-center justify-center py-10 bg-violet-50 rounded-2xl border-2 border-dashed border-violet-200 cursor-pointer hover:bg-violet-100 transition-colors"
          >
            <Crown className="w-8 h-8 text-violet-300 mb-2" />
            <p className="font-semibold text-violet-400 text-sm">Featured mahsulot yo'q</p>
            <p className="text-xs text-violet-300 mt-0.5">Belgilash uchun bosing</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {featuredProducts.map((p) => (
              <MarkedCard
                key={p.id}
                product={p}
                badge="featured"
                onRemove={() => removeMut.mutate({ id: p.id, field: "isFeatured" })}
              />
            ))}
            {/* Add more card */}
            <button
              onClick={() => setModal("featured")}
              className="aspect-[3/4] border-2 border-dashed border-violet-200 rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-violet-50 transition-colors text-violet-400"
            >
              <Plus className="w-6 h-6" />
              <span className="text-xs font-semibold">Qo'shish</span>
            </button>
          </div>
        )}
      </div>

      {/* ── TOP section ── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 bg-rose-500 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-3.5 h-3.5 text-white" />
          </div>
          <h3 className="font-bold text-gray-800">TOP badge mahsulotlar</h3>
          <span className="text-xs bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full font-medium ml-1">
            {topAllProducts.length} ta
          </span>
          <button
            onClick={() => setModal("top")}
            className="ml-auto text-xs text-rose-500 hover:text-rose-700 font-semibold flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Tahrirlash
          </button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="aspect-[3/4] bg-gray-100 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : topAllProducts.length === 0 ? (
          <div
            onClick={() => setModal("top")}
            className="flex flex-col items-center justify-center py-10 bg-rose-50 rounded-2xl border-2 border-dashed border-rose-200 cursor-pointer hover:bg-rose-100 transition-colors"
          >
            <Flame className="w-8 h-8 text-rose-300 mb-2" />
            <p className="font-semibold text-rose-400 text-sm">TOP mahsulot yo'q</p>
            <p className="text-xs text-rose-300 mt-0.5">Belgilash uchun bosing</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {topOnlyProducts.map((p) => (
              <MarkedCard
                key={p.id}
                product={p}
                badge="top"
                onRemove={() => removeMut.mutate({ id: p.id, field: "isTopSelling" })}
              />
            ))}
            {/* Both featured+top — show with featured badge */}
            {featuredProducts
              .filter((p) => p.isTopSelling)
              .map((p) => (
                <MarkedCard
                  key={p.id + "-top"}
                  product={p}
                  badge="top"
                  onRemove={() => removeMut.mutate({ id: p.id, field: "isTopSelling" })}
                />
              ))}
            <button
              onClick={() => setModal("top")}
              className="aspect-[3/4] border-2 border-dashed border-rose-200 rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-rose-50 transition-colors text-rose-400"
            >
              <Plus className="w-6 h-6" />
              <span className="text-xs font-semibold">Qo'shish</span>
            </button>
          </div>
        )}
      </div>

      {/* ── Modal ── */}
      {modal && (
        <MarkModal
          allProducts={allProducts}
          mode={modal}
          onClose={() => setModal(null)}
          isSaving={batchMut.isPending}
          onSave={(ids) =>
            batchMut.mutate({
              selectedIds: ids,
              field: modal === "featured" ? "isFeatured" : "isTopSelling",
            })
          }
        />
      )}

      {/* Toast */}
      {toast && (
        <div
          className={cn(
            "fixed bottom-6 right-6 px-4 py-3 rounded-2xl shadow-lg text-sm font-semibold flex items-center gap-2 z-[60] transition-all",
            toast.type === "ok"
              ? "bg-emerald-500 text-white"
              : "bg-red-500 text-white"
          )}
        >
          {toast.type === "ok" ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <X className="w-4 h-4" />
          )}
          {toast.msg}
        </div>
      )}
    </div>
  );
}
