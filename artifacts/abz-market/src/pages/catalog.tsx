import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { MobileLayout } from "@/components/layout/MobileLayout";
import {
  Search, SlidersHorizontal, ArrowLeft, X, ChevronRight,
  ArrowUpDown, Package,
} from "lucide-react";
import { useProducts, useCategories } from "@/hooks/use-api";
import { ProductCard } from "@/components/ui/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { hapticFeedback } from "@/hooks/use-telegram";
import { cn } from "@/lib/utils";

// ── Category emoji map ────────────────────────────────────────
const CAT_EMOJI: Record<string, string> = {
  Shkaflar:    "🚪",
  Komodlar:    "🪵",
  Oshxonalar:  "🍳",
  Yotoqxona:   "🛏",
  Stollar:     "🪑",
  Stullar:     "💺",
  Divonlar:    "🛋",
  Javonlar:    "📚",
};

const CAT_BG: Record<string, string> = {
  Shkaflar:    "from-violet-500 to-purple-600",
  Komodlar:    "from-amber-500 to-orange-500",
  Oshxonalar:  "from-emerald-500 to-teal-600",
  Yotoqxona:   "from-blue-500 to-indigo-600",
  Stollar:     "from-rose-500 to-pink-600",
  Stullar:     "from-cyan-500 to-sky-600",
  Divonlar:    "from-fuchsia-500 to-violet-600",
  Javonlar:    "from-lime-500 to-green-600",
};

function catEmoji(name: string) { return CAT_EMOJI[name] ?? "🪑"; }
function catBg(name: string)    { return CAT_BG[name] ?? "from-purple-500 to-violet-600"; }
function fmt(n: number)         { return n.toLocaleString("ru-RU") + " so'm"; }

type SortKey = "default" | "price_asc" | "price_desc" | "rating";
const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "default",    label: "Standart" },
  { key: "price_asc",  label: "Arzon avval" },
  { key: "price_desc", label: "Qimmat avval" },
  { key: "rating",     label: "Eng yaxshi" },
];

export default function Catalog() {
  const [location] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("default");
  const [showSortSheet, setShowSortSheet] = useState(false);

  // Read ?category=X from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get("category");
    if (cat) setActiveCategory(cat);
  }, [location]);

  const { data: catData, isLoading: catLoading } = useCategories();
  const realCategoryId = activeCategory && activeCategory !== "__all__" ? activeCategory : undefined;

  const { data: productsData, isLoading: prodLoading } = useProducts({
    search: searchQuery || undefined,
    categoryId: realCategoryId,
  });

  const categories = catData?.categories ?? [];
  const products = productsData?.products ?? [];

  // Client-side sort
  const sorted = [...products].sort((a, b) => {
    if (sortKey === "price_asc")  return a.price - b.price;
    if (sortKey === "price_desc") return b.price - a.price;
    if (sortKey === "rating")     return (b.rating ?? 0) - (a.rating ?? 0);
    return 0;
  });

  // Derive category name directly from categories (no race condition)
  const activeCategoryName = activeCategory && activeCategory !== "__all__"
    ? (categories.find((c) => c.id === activeCategory)?.name ?? "")
    : "";

  const selectCategory = (id: string) => {
    hapticFeedback("selection");
    setActiveCategory(id);
    setSearchQuery("");
  };

  const clearCategory = () => {
    hapticFeedback("selection");
    setActiveCategory(null);
    setSearchQuery("");
  };

  const isSearching = searchQuery.length > 0;
  const showProducts = activeCategory !== null || isSearching;

  return (
    <MobileLayout hideNav={false} title="Katalog" showBack>

      {/* ── Search bar (scrolls with content) ── */}
      <div className="border-b border-white/30">
        {/* Search row */}
        <div className="flex items-center gap-2 px-4 pt-3 pb-2">
          {activeCategory && (
            <button
              onClick={clearCategory}
              className="w-9 h-9 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 press-sm"
            >
              <ArrowLeft className="w-4 h-4 text-primary" />
            </button>
          )}

          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              type="search"
              placeholder={activeCategory ? `${activeCategoryName}da qidirish...` : "Mahsulot qidirish..."}
              className="w-full pl-9 pr-9 h-10 glass-input rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all placeholder:text-muted-foreground"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
          </div>

          {showProducts && (
            <button
              onClick={() => { hapticFeedback("selection"); setShowSortSheet(true); }}
              className="w-9 h-9 rounded-2xl glass-card flex items-center justify-center shrink-0 press-sm shadow-ios-sm"
            >
              <SlidersHorizontal className="w-4 h-4 text-foreground/70" />
            </button>
          )}
        </div>

        {/* Category chips */}
        {showProducts && categories.length > 0 && (
          <div className="flex gap-2 overflow-x-auto hide-scrollbar px-4 pb-2.5">
            <button
              onClick={clearCategory}
              className={cn(
                "flex-none px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all",
                !activeCategory
                  ? "bg-primary text-white shadow-ios-sm shadow-primary/30"
                  : "glass-card text-foreground/70"
              )}
            >
              Barchasi
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => selectCategory(cat.id)}
                className={cn(
                  "flex-none px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap",
                  activeCategory === cat.id
                    ? "bg-primary text-white shadow-ios-sm shadow-primary/30"
                    : "glass-card text-foreground/70"
                )}
              >
                {catEmoji(cat.name)} {cat.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════
          MODE A — Category selection grid (default view)
         ══════════════════════════════════════════════════ */}
      {!showProducts && (
        <div className="px-4 pt-4 pb-8">
          {/* Hero label */}
          <div className="mb-5">
            <h2 className="font-display font-bold text-xl text-foreground">Kategoriyalar</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Qaysi bo'limni qidirmoqchisiz?</p>
          </div>

          {/* 2-column category cards */}
          {catLoading ? (
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="h-36 rounded-3xl" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => selectCategory(cat.id)}
                  className="relative overflow-hidden rounded-3xl aspect-[4/3] press shadow-ios"
                >
                  <div className={cn("absolute inset-0 bg-gradient-to-br", catBg(cat.name))} />
                  {/* shine overlay */}
                  <div className="absolute inset-0 bg-gradient-to-b from-white/15 to-transparent" />
                  {/* blobs */}
                  <div className="absolute -top-5 -right-5 w-24 h-24 bg-white/15 rounded-full blur-sm" />
                  <div className="absolute -bottom-5 -left-5 w-20 h-20 bg-white/10 rounded-full blur-sm" />
                  {/* content */}
                  <div className="relative z-10 flex flex-col justify-between h-full p-3.5">
                    <div className="text-4xl drop-shadow-md">{catEmoji(cat.name)}</div>
                    <div>
                      <div className="font-display font-bold text-white text-[15px] leading-tight drop-shadow">{cat.name}</div>
                      {cat.productCount && (
                        <div className="text-white/70 text-[11px] mt-0.5">{cat.productCount} ta mahsulot</div>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="absolute top-3 right-3 w-4 h-4 text-white/60" />
                </button>
              ))}
            </div>
          )}

          {/* Divider */}
          <div className="mt-6 mb-4 flex items-center gap-3">
            <div className="flex-1 h-px bg-border/60" />
            <span className="text-xs text-muted-foreground font-medium">yoki barcha mahsulotlar</span>
            <div className="flex-1 h-px bg-border/60" />
          </div>

          {/* "View all" CTA */}
          <button
            onClick={() => { hapticFeedback("selection"); setActiveCategory("__all__"); }}
            className="w-full flex items-center justify-between glass-card rounded-2xl px-4 py-3.5 press shadow-ios-sm"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center">
                <Package className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-sm">Barchasi</div>
                <div className="text-xs text-muted-foreground">{productsData?.total ?? 0} ta mahsulot</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          MODE B — Products list (category selected / search)
         ══════════════════════════════════════════════════ */}
      {showProducts && (
        <div className="px-4 pt-3 pb-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div>
              {activeCategory && activeCategory !== "__all__" ? (
                <h3 className="font-display font-bold text-lg">
                  {catEmoji(activeCategoryName)} {activeCategoryName}
                </h3>
              ) : isSearching ? (
                <h3 className="font-display font-bold text-lg">Qidiruv natijalari</h3>
              ) : (
                <h3 className="font-display font-bold text-lg">Barcha mahsulotlar</h3>
              )}
              <p className="text-xs text-muted-foreground mt-0.5">
                {prodLoading ? "Yuklanmoqda..." : `${sorted.length} ta mahsulot`}
              </p>
            </div>

            {/* Active sort badge */}
            {sortKey !== "default" && (
              <button
                onClick={() => setSortKey("default")}
                className="flex items-center gap-1 bg-primary/10 text-primary text-xs font-semibold px-2.5 py-1 rounded-full"
              >
                {SORT_OPTIONS.find((s) => s.key === sortKey)?.label}
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Loading */}
          {prodLoading && (
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-64 rounded-2xl" />)}
            </div>
          )}

          {/* Empty */}
          {!prodLoading && sorted.length === 0 && (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-9 h-9 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-base">Hech narsa topilmadi</h3>
              <p className="text-sm text-muted-foreground mt-1">Boshqa kategoriya yoki so'z sinab ko'ring</p>
              <button
                onClick={clearCategory}
                className="mt-4 px-6 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl active:scale-95 transition-transform"
              >
                Kategoriyalarga qaytish
              </button>
            </div>
          )}

          {/* Products grid */}
          {!prodLoading && sorted.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              {sorted.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Sort bottom sheet ── */}
      {showSortSheet && (
        <div
          className="fixed inset-0 z-50 flex flex-col justify-end"
          onClick={() => setShowSortSheet(false)}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-md" />
          <div
            className="relative glass rounded-t-[32px] px-4 pt-3 pb-10 max-w-[430px] w-full mx-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-foreground/20 rounded-full mx-auto mb-5" />
            <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
              <ArrowUpDown className="w-5 h-5 text-primary" /> Saralash
            </h3>
            <div className="space-y-2">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => {
                    hapticFeedback("selection");
                    setSortKey(opt.key);
                    setShowSortSheet(false);
                  }}
                  className={cn(
                    "w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all text-sm font-semibold press",
                    sortKey === opt.key
                      ? "bg-primary text-white shadow-ios-sm shadow-primary/40"
                      : "glass-card text-foreground"
                  )}
                >
                  {opt.label}
                  {sortKey === opt.key && (
                    <div className="w-4 h-4 rounded-full bg-white/30 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </MobileLayout>
  );
}
