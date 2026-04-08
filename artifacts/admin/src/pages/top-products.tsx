import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Search, Star, TrendingUp, Package, Crown,
  Eye, EyeOff, ToggleLeft, ToggleRight, Filter,
  ChevronDown, Image as ImageIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const BASE = "/api";

// ── Types ──────────────────────────────────────────────────────────────────
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

function fmt(n: number) { return n.toLocaleString("ru-RU") + " so'm"; }

// ── Product row ────────────────────────────────────────────────────────────
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
    <div className="flex items-center gap-3 bg-white border border-gray-100 rounded-2xl px-4 py-3 hover:shadow-sm transition-shadow">
      {/* Image */}
      <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 shrink-0">
        {product.images?.[0] ? (
          <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="w-5 h-5 text-gray-300" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-gray-900 line-clamp-1">{product.name}</p>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span className="text-xs text-violet-600 font-bold">{fmt(Number(product.price))}</span>
          {product.storeName && <span className="text-[10px] text-gray-400">· {product.storeName}</span>}
          {product.categoryName && <span className="text-[10px] text-gray-400">· {product.categoryName}</span>}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <div className="flex items-center gap-0.5">
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span className="text-[10px] text-gray-500">{product.rating} ({product.reviewCount})</span>
          </div>
          {product.discount && (
            <span className="text-[10px] font-bold bg-red-50 text-red-500 border border-red-100 px-1.5 py-0.5 rounded-full">
              -{product.discount}%
            </span>
          )}
          <span className="text-[10px] text-gray-400">{product.salesCount} ta sotilgan</span>
        </div>
      </div>

      {/* Toggles */}
      <div className="flex flex-col gap-2 shrink-0">
        {/* isFeatured - "Top mahsulot" */}
        <button
          onClick={onToggleFeatured}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all",
            product.isFeatured
              ? "bg-violet-600 text-white border-violet-600 shadow-sm shadow-violet-200"
              : "bg-gray-50 text-gray-400 border-gray-200 hover:border-violet-300 hover:text-violet-500"
          )}
        >
          {product.isFeatured
            ? <><Crown className="w-3.5 h-3.5" /> Featured</>
            : <><Crown className="w-3.5 h-3.5" /> Featured</>}
        </button>

        {/* isTopSelling - "TOP badge" */}
        <button
          onClick={onToggleTop}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all",
            product.isTopSelling
              ? "bg-rose-500 text-white border-rose-500 shadow-sm shadow-rose-200"
              : "bg-gray-50 text-gray-400 border-gray-200 hover:border-rose-300 hover:text-rose-500"
          )}
        >
          <TrendingUp className="w-3.5 h-3.5" /> TOP
        </button>
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function TopProductsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "featured" | "top">("all");

  const { data, isLoading } = useQuery<{ products: ApiProduct[] }>({
    queryKey: ["products-top-admin"],
    queryFn: () => fetch(`${BASE}/products?status=approved&limit=200`).then((r) => r.json()),
    refetchInterval: 15_000,
  });

  const updateMut = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Record<string, boolean> }) => {
      const r = await fetch(`${BASE}/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!r.ok) throw new Error("Xato");
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products-top-admin"] }),
  });

  const allProducts = data?.products ?? [];

  const filtered = allProducts.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.storeName?.toLowerCase().includes(search.toLowerCase()) ?? false);
    const matchFilter =
      filter === "all" ? true :
      filter === "featured" ? p.isFeatured :
      filter === "top" ? p.isTopSelling : true;
    return matchSearch && matchFilter;
  });

  const featuredCount  = allProducts.filter((p) => p.isFeatured).length;
  const topCount       = allProducts.filter((p) => p.isTopSelling).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Crown className="w-6 h-6 text-violet-600" /> Top Mahsulotlar
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Bosh sahifada ko'rsatiladigan "Featured" va "TOP" mahsulotlarni belgilang
        </p>
      </div>

      {/* Explanation cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-violet-50 border border-violet-100 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-violet-600 rounded-xl flex items-center justify-center">
              <Crown className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-bold text-violet-900 text-sm">Featured</p>
              <p className="text-[10px] text-violet-500">{featuredCount} ta belgilangan</p>
            </div>
          </div>
          <p className="text-xs text-violet-700">
            "Top mahsulotlar" bo'limida ko'rsatiladi. Bosh sahifadagi gorizontal kartochkalar.
          </p>
        </div>
        <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-rose-500 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-bold text-rose-900 text-sm">TOP badge</p>
              <p className="text-[10px] text-rose-500">{topCount} ta belgilangan</p>
            </div>
          </div>
          <p className="text-xs text-rose-700">
            Mahsulot kartochkasida qizil "TOP" badge ko'rsatiladi. Eng ko'p sotilganlar.
          </p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Mahsulot nomini qidirish..."
            className="w-full pl-9 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
          />
        </div>
        <div className="flex gap-1.5">
          {(["all", "featured", "top"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-3 py-2.5 rounded-xl text-xs font-semibold border transition-colors whitespace-nowrap",
                filter === f
                  ? "bg-violet-600 text-white border-violet-600"
                  : "bg-white text-gray-600 border-gray-200 hover:border-violet-300"
              )}
            >
              {f === "all" ? "Barchasi" : f === "featured" ? "⭐ Featured" : "🔥 TOP"}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-sm text-gray-500">
        <span><strong className="text-gray-900">{filtered.length}</strong> ta mahsulot</span>
        <span>·</span>
        <span><strong className="text-violet-600">{featuredCount}</strong> featured</span>
        <span>·</span>
        <span><strong className="text-rose-500">{topCount}</strong> TOP</span>
      </div>

      {/* Product list */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-20 bg-gray-100 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
          <Package className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="font-semibold text-gray-500">Mahsulot topilmadi</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((p) => (
            <ProductRow
              key={p.id}
              product={p}
              onToggleFeatured={() => updateMut.mutate({ id: p.id, updates: { isFeatured: !p.isFeatured } })}
              onToggleTop={() => updateMut.mutate({ id: p.id, updates: { isTopSelling: !p.isTopSelling } })}
            />
          ))}
        </div>
      )}
    </div>
  );
}
