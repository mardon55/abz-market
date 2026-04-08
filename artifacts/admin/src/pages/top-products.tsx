import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Crown, Search, Star, TrendingUp, Plus, X,
  Package, Image as ImageIcon, CheckCircle2, Flame,
} from "lucide-react";
import { cn } from "@/lib/utils";

const BASE = "/api";

interface ApiProduct {
  id: string;
  name: string;
  price: string;
  oldPrice: string | null;
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

function fmt(n: number) {
  return n.toLocaleString("ru-RU") + " so'm";
}

// ── Small product card in "belgilangan" grid ──────────────────────────────
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
    <div className="relative bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Remove button */}
      <button
        onClick={onRemove}
        className="absolute top-2 right-2 z-10 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 active:scale-90 shadow-sm"
        title="O'chirish"
      >
        <X className="w-3 h-3" />
      </button>

      {/* Badge */}
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

      {/* Image */}
      <div className="aspect-square bg-gray-50 overflow-hidden">
        {product.images?.[0] ? (
          <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="w-8 h-8 text-gray-300" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-2.5">
        <p className="font-semibold text-xs text-gray-900 line-clamp-2 leading-tight mb-1">
          {product.name}
        </p>
        <p className="text-xs font-bold text-violet-600">{fmt(Number(product.price))}</p>
        {product.storeName && (
          <p className="text-[10px] text-gray-400 mt-0.5 truncate">{product.storeName}</p>
        )}
      </div>
    </div>
  );
}

// ── Row in "add" list ─────────────────────────────────────────────────────
function ProductRow({
  product,
  onToggleFeatured,
  onToggleTop,
}: {
  product: ApiProduct;
  onToggleFeatured: () => void;
  onToggleTop: () => void;
}) {
  return (
    <div className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl px-3 py-2.5 hover:shadow-sm transition-shadow">
      {/* Image */}
      <div className="w-11 h-11 rounded-xl overflow-hidden bg-gray-100 shrink-0">
        {product.images?.[0] ? (
          <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="w-4 h-4 text-gray-300" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-gray-900 line-clamp-1">{product.name}</p>
        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
          <span className="text-xs font-bold text-violet-600">{fmt(Number(product.price))}</span>
          {product.storeName && (
            <span className="text-[10px] text-gray-400">· {product.storeName}</span>
          )}
          <div className="flex items-center gap-0.5 ml-auto">
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span className="text-[10px] text-gray-500">{product.rating}</span>
          </div>
        </div>
      </div>

      {/* Toggle buttons */}
      <div className="flex gap-1.5 shrink-0">
        <button
          onClick={onToggleFeatured}
          title={product.isFeatured ? "Featured dan olib tashlash" : "Featured qo'shish"}
          className={cn(
            "w-8 h-8 rounded-xl flex items-center justify-center transition-all border",
            product.isFeatured
              ? "bg-violet-600 text-white border-violet-600 shadow-sm"
              : "bg-gray-50 text-gray-400 border-gray-200 hover:border-violet-400 hover:text-violet-500"
          )}
        >
          <Crown className="w-4 h-4" />
        </button>
        <button
          onClick={onToggleTop}
          title={product.isTopSelling ? "TOP dan olib tashlash" : "TOP qo'shish"}
          className={cn(
            "w-8 h-8 rounded-xl flex items-center justify-center transition-all border",
            product.isTopSelling
              ? "bg-rose-500 text-white border-rose-500 shadow-sm"
              : "bg-gray-50 text-gray-400 border-gray-200 hover:border-rose-400 hover:text-rose-500"
          )}
        >
          <TrendingUp className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────
export default function TopProductsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"marked" | "all">("marked");

  const { data, isLoading } = useQuery<{ products: ApiProduct[] }>({
    queryKey: ["products-top-admin"],
    queryFn: () =>
      fetch(`${BASE}/products?status=all&limit=500`).then((r) => r.json()),
    refetchInterval: 10_000,
  });

  const updateMut = useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Record<string, boolean>;
    }) => {
      const r = await fetch(`${BASE}/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!r.ok) {
        const err = await r.json().catch(() => ({}));
        throw new Error((err as any).error || "Server xatosi");
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products-top-admin"] }),
  });

  const allProducts = data?.products ?? [];

  // Marked groups
  const featuredProducts  = allProducts.filter((p) => p.isFeatured);
  const topOnlyProducts   = allProducts.filter((p) => p.isTopSelling && !p.isFeatured);
  const anyMarked         = featuredProducts.length > 0 || topOnlyProducts.length > 0;

  // "All products" search
  const filtered = allProducts.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.storeName?.toLowerCase().includes(search.toLowerCase()) ?? false)
  );

  const toggle = (id: string, field: "isFeatured" | "isTopSelling", current: boolean) =>
    updateMut.mutate({ id, updates: { [field]: !current } });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Crown className="w-6 h-6 text-violet-600" /> Top Mahsulotlar
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Mijozlarga ko'rsatiladigan featured va TOP mahsulotlarni belgilang
        </p>
      </div>

      {/* Legend cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-violet-50 border border-violet-100 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-1.5">
            <Crown className="w-5 h-5 text-violet-600" />
            <p className="font-bold text-violet-900">Featured</p>
            <span className="ml-auto text-xs font-bold bg-violet-600 text-white px-2 py-0.5 rounded-full">
              {featuredProducts.length}
            </span>
          </div>
          <p className="text-xs text-violet-700">
            Bosh sahifada "Top mahsulotlar" bo'limida chiqadi
          </p>
        </div>
        <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-1.5">
            <Flame className="w-5 h-5 text-rose-500" />
            <p className="font-bold text-rose-900">TOP badge</p>
            <span className="ml-auto text-xs font-bold bg-rose-500 text-white px-2 py-0.5 rounded-full">
              {allProducts.filter((p) => p.isTopSelling).length}
            </span>
          </div>
          <p className="text-xs text-rose-700">
            Mahsulot kartochkasida qizil "TOP" badge ko'rsatiladi
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
        <button
          onClick={() => setTab("marked")}
          className={cn(
            "flex-1 py-2 rounded-lg text-sm font-semibold transition-all",
            tab === "marked"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          )}
        >
          Belgilangan ({featuredProducts.length + topOnlyProducts.length})
        </button>
        <button
          onClick={() => setTab("all")}
          className={cn(
            "flex-1 py-2 rounded-lg text-sm font-semibold transition-all",
            tab === "all"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          )}
        >
          <Plus className="w-4 h-4 inline mr-1" />
          Mahsulot qo'shish
        </button>
      </div>

      {/* TAB: Belgilangan */}
      {tab === "marked" && (
        <div className="space-y-5">
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-[3/4] bg-gray-100 animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : !anyMarked ? (
            <div className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
              <Crown className="w-10 h-10 text-gray-300 mb-3" />
              <p className="font-semibold text-gray-500 text-base">Hech narsa belgilanmagan</p>
              <p className="text-sm text-gray-400 mt-1 text-center max-w-xs">
                "Mahsulot qo'shish" bo'limiga o'tib, Featured yoki TOP belgilang
              </p>
              <button
                onClick={() => setTab("all")}
                className="mt-4 flex items-center gap-2 bg-violet-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-violet-700 transition-colors"
              >
                <Plus className="w-4 h-4" /> Mahsulot qo'shish
              </button>
            </div>
          ) : (
            <>
              {/* Featured */}
              {featuredProducts.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 bg-violet-600 rounded-lg flex items-center justify-center">
                      <Crown className="w-3.5 h-3.5 text-white" />
                    </div>
                    <h3 className="font-bold text-gray-800">Featured mahsulotlar</h3>
                    <span className="text-xs text-gray-500">{featuredProducts.length} ta</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {featuredProducts.map((p) => (
                      <MarkedCard
                        key={p.id}
                        product={p}
                        badge="featured"
                        onRemove={() => toggle(p.id, "isFeatured", true)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* TOP only */}
              {topOnlyProducts.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 bg-rose-500 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-3.5 h-3.5 text-white" />
                    </div>
                    <h3 className="font-bold text-gray-800">TOP badge mahsulotlar</h3>
                    <span className="text-xs text-gray-500">{topOnlyProducts.length} ta</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {topOnlyProducts.map((p) => (
                      <MarkedCard
                        key={p.id}
                        product={p}
                        badge="top"
                        onRemove={() => toggle(p.id, "isTopSelling", true)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* TAB: Add products */}
      {tab === "all" && (
        <div className="space-y-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Mahsulot nomini qidirish..."
              className="w-full pl-9 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
            />
          </div>

          {/* Legend */}
          <div className="flex items-center gap-3 text-xs text-gray-500 px-1">
            <div className="flex items-center gap-1">
              <div className="w-7 h-7 bg-violet-600 rounded-lg flex items-center justify-center">
                <Crown className="w-3.5 h-3.5 text-white" />
              </div>
              <span>= Featured (bosh sahifada)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-7 h-7 bg-rose-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-3.5 h-3.5 text-white" />
              </div>
              <span>= TOP badge</span>
            </div>
          </div>

          {/* Stat */}
          <p className="text-xs text-gray-400 px-1">
            {filtered.length} ta mahsulot
            {search ? ` • "${search}" uchun` : ""}
          </p>

          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 bg-gray-100 animate-pulse rounded-xl" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-2xl">
              <Package className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">Mahsulot topilmadi</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((p) => (
                <ProductRow
                  key={p.id}
                  product={p}
                  onToggleFeatured={() => toggle(p.id, "isFeatured", p.isFeatured)}
                  onToggleTop={() => toggle(p.id, "isTopSelling", p.isTopSelling)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Mutation error toast */}
      {updateMut.isError && (
        <div className="fixed bottom-6 right-6 bg-red-500 text-white px-4 py-3 rounded-2xl shadow-lg text-sm font-semibold">
          Xato: {(updateMut.error as Error).message}
        </div>
      )}

      {/* Success toast */}
      {updateMut.isSuccess && (
        <div className="fixed bottom-6 right-6 bg-emerald-500 text-white px-4 py-3 rounded-2xl shadow-lg text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> Saqlandi!
        </div>
      )}
    </div>
  );
}
