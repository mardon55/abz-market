import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { MobileLayout } from "@/components/layout/MobileLayout";
import {
  Search, SlidersHorizontal, ArrowLeft, X, ChevronRight,
  ArrowUpDown, Package, Grid3x3,
} from "lucide-react";
import { useProducts, useCategories } from "@/hooks/use-api";
import { ProductCard } from "@/components/ui/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { hapticFeedback } from "@/hooks/use-telegram";
import { cn } from "@/lib/utils";

// ── Gradient fallback ──────────────────────────────────────────────────────
const GRADIENTS = [
  "from-violet-500 to-purple-600",
  "from-amber-500 to-orange-500",
  "from-emerald-500 to-teal-600",
  "from-blue-500 to-indigo-600",
  "from-rose-500 to-pink-600",
  "from-cyan-500 to-sky-600",
  "from-fuchsia-500 to-violet-600",
  "from-lime-500 to-green-600",
];

function gradient(idx: number) { return GRADIENTS[idx % GRADIENTS.length]; }

// ── Types ─────────────────────────────────────────────────────────────────────
interface SubCategory {
  id: string;
  name: string;
  icon: string | null;
  image: string | null;
  productCount: number | null;
}
interface Category {
  id: string;
  name: string;
  icon: string | null;
  image: string | null;
  productCount: number | null;
  subcategories?: SubCategory[];
}

type SortKey = "default" | "price_asc" | "price_desc" | "rating";
const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "default",    label: "Standart" },
  { key: "price_asc",  label: "Arzon avval" },
  { key: "price_desc", label: "Qimmat avval" },
  { key: "rating",     label: "Eng yaxshi" },
];

// ── Category thumbnail ────────────────────────────────────────────────────────
function CatImage({ src, alt, className }: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;
  return (
    <img
      src={src}
      alt={alt}
      className={cn("object-cover", className)}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function Catalog() {
  const [location] = useLocation();
  const [searchQuery, setSearchQuery]     = useState("");
  const [sortKey, setSortKey]             = useState<SortKey>("default");
  const [showSortSheet, setShowSortSheet] = useState(false);

  const [activeParent, setActiveParent] = useState<Category | null>(null);
  const [activeSub, setActiveSub]       = useState<SubCategory | null>(null);

  const filterCategoryId =
    activeSub?.id ??
    (activeParent && activeParent.id !== "__all__" ? activeParent.id : undefined);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get("category");
    if (cat) sessionStorage.setItem("catalog_pending_cat", cat);
  }, [location]);

  const { data: catData, isLoading: catLoading } = useCategories();
  const categories: Category[] = (catData?.categories ?? []) as Category[];

  useEffect(() => {
    const pending = sessionStorage.getItem("catalog_pending_cat");
    if (!pending || categories.length === 0) return;
    sessionStorage.removeItem("catalog_pending_cat");
    const parent = categories.find((c) => c.id === pending);
    if (parent) { setActiveParent(parent); return; }
    for (const c of categories) {
      const sub = c.subcategories?.find((s) => s.id === pending);
      if (sub) { setActiveParent(c); setActiveSub(sub); return; }
    }
  }, [categories]);

  const { data: productsData, isLoading: prodLoading } = useProducts({
    search: searchQuery || undefined,
    categoryId: filterCategoryId,
  });

  const products = productsData?.products ?? [];
  const sorted = [...products].sort((a, b) => {
    if (sortKey === "price_asc")  return a.price - b.price;
    if (sortKey === "price_desc") return b.price - a.price;
    if (sortKey === "rating")     return (b.rating ?? 0) - (a.rating ?? 0);
    return 0;
  });

  const goHome = () => {
    hapticFeedback("selection");
    setActiveParent(null); setActiveSub(null); setSearchQuery("");
  };

  const selectParent = (cat: Category) => {
    hapticFeedback("selection");
    setActiveParent(cat); setActiveSub(null); setSearchQuery("");
  };

  const selectSub = (sub: SubCategory) => {
    hapticFeedback("selection");
    setActiveSub(sub); setSearchQuery("");
  };

  const clearSub = () => { hapticFeedback("selection"); setActiveSub(null); };

  const isSearching = searchQuery.length > 0;
  const isInParent  = activeParent !== null && !isSearching;
  const showProducts = activeParent !== null || isSearching;
  const hasSubs = (activeParent?.subcategories?.length ?? 0) > 0;

  return (
    <MobileLayout hideNav={false} title="Katalog" showBack>

      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <div className="border-b border-white/30">

        {/* Search row */}
        <div className="flex items-center gap-2 px-4 pt-3 pb-2">
          {activeParent && (
            <button
              onClick={goHome}
              className="w-9 h-9 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 press-sm"
            >
              <ArrowLeft className="w-4 h-4 text-primary" />
            </button>
          )}

          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              type="search"
              placeholder={
                activeSub     ? `${activeSub.name}da qidirish...`
                : activeParent ? `${activeParent.name}da qidirish...`
                : "Mahsulot qidirish..."
              }
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

        {/* Breadcrumb */}
        {isInParent && (
          <div className="flex items-center gap-1 px-4 pb-1.5 text-xs text-muted-foreground overflow-x-auto hide-scrollbar">
            <button onClick={goHome} className="shrink-0 hover:text-primary transition-colors font-medium">
              Katalog
            </button>
            <ChevronRight className="w-3 h-3 shrink-0 opacity-50" />
            <span
              onClick={() => { if (activeSub) clearSub(); }}
              className={cn(
                "shrink-0 font-semibold transition-colors",
                activeSub ? "text-muted-foreground hover:text-primary cursor-pointer" : "text-foreground"
              )}
            >
              {activeParent!.id === "__all__" ? "Barcha mahsulotlar" : activeParent!.name}
            </span>
            {activeSub && (
              <>
                <ChevronRight className="w-3 h-3 shrink-0 opacity-50" />
                <span className="shrink-0 font-semibold text-foreground">{activeSub.name}</span>
              </>
            )}
          </div>
        )}

        {/* Subcategory chips with images (horizontal scroll) */}
        {isInParent && hasSubs && (
          <div className="flex gap-2 overflow-x-auto hide-scrollbar px-4 pb-2.5 pt-0.5">
            <button
              onClick={clearSub}
              className={cn(
                "flex-none px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap",
                !activeSub
                  ? "bg-primary text-white shadow-ios-sm shadow-primary/30"
                  : "glass-card text-foreground/70"
              )}
            >
              Barchasi
            </button>
            {activeParent!.subcategories!.map((sub) => (
              <button
                key={sub.id}
                onClick={() => selectSub(sub)}
                className={cn(
                  "flex-none flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap",
                  activeSub?.id === sub.id
                    ? "bg-primary text-white shadow-ios-sm shadow-primary/30"
                    : "glass-card text-foreground/70"
                )}
              >
                {/* Small image thumbnail in chip */}
                {sub.image && (
                  <div className="w-5 h-5 rounded-full overflow-hidden flex-shrink-0">
                    <img src={sub.image} alt={sub.name} className="w-full h-full object-cover" />
                  </div>
                )}
                {!sub.image && sub.icon && <span className="text-sm leading-none">{sub.icon}</span>}
                {sub.name}
                {sub.productCount ? (
                  <span className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded-full font-bold leading-none",
                    activeSub?.id === sub.id
                      ? "bg-white/25 text-white"
                      : "bg-primary/10 text-primary"
                  )}>
                    {sub.productCount}
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════
          MODE A — Category grid (default view)
         ══════════════════════════════════════════ */}
      {!showProducts && (
        <div className="px-4 pt-4 pb-8">
          <div className="mb-5">
            <h2 className="font-display font-bold text-xl text-foreground">Kategoriyalar</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Qaysi bo'limni qidirmoqchisiz?</p>
          </div>

          {catLoading ? (
            <div className="grid grid-cols-2 gap-3">
              {[1,2,3,4,5,6].map((i) => <Skeleton key={i} className="h-36 rounded-3xl" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {categories.map((cat, idx) => {
                const subCount = cat.subcategories?.length ?? 0;
                return (
                  <button
                    key={cat.id}
                    onClick={() => selectParent(cat)}
                    className="relative overflow-hidden rounded-3xl aspect-[4/3] press shadow-ios"
                  >
                    {/* Background — image or gradient */}
                    {cat.image ? (
                      <>
                        <CatImage src={cat.image} alt={cat.name} className="absolute inset-0 w-full h-full" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />
                        {/* Gradient fallback in case image fails */}
                        <div className={cn("absolute inset-0 -z-10 bg-gradient-to-br", gradient(idx))} />
                      </>
                    ) : (
                      <>
                        <div className={cn("absolute inset-0 bg-gradient-to-br", gradient(idx))} />
                        <div className="absolute inset-0 bg-gradient-to-b from-white/15 to-transparent" />
                        <div className="absolute -top-5 -right-5 w-24 h-24 bg-white/15 rounded-full blur-sm" />
                        <div className="absolute -bottom-5 -left-5 w-20 h-20 bg-white/10 rounded-full blur-sm" />
                      </>
                    )}

                    <div className="relative z-10 flex flex-col justify-end h-full p-3.5">
                      <div>
                        <div className="font-display font-bold text-white text-[15px] leading-tight drop-shadow">
                          {cat.name}
                        </div>
                        {subCount > 0 ? (
                          <div className="text-white/75 text-[11px] mt-0.5 flex items-center gap-1">
                            <Grid3x3 className="w-2.5 h-2.5" />
                            {subCount} ta bo'lim
                          </div>
                        ) : cat.productCount ? (
                          <div className="text-white/75 text-[11px] mt-0.5">{cat.productCount} ta mahsulot</div>
                        ) : null}
                      </div>
                    </div>

                    <ChevronRight className="absolute top-3 right-3 w-4 h-4 text-white/60" />
                  </button>
                );
              })}
            </div>
          )}

          <div className="mt-6 mb-4 flex items-center gap-3">
            <div className="flex-1 h-px bg-border/60" />
            <span className="text-xs text-muted-foreground font-medium">yoki barcha mahsulotlar</span>
            <div className="flex-1 h-px bg-border/60" />
          </div>

          <button
            onClick={() => {
              hapticFeedback("selection");
              setActiveParent({ id: "__all__", name: "Barcha mahsulotlar", icon: null, image: null, productCount: null });
            }}
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

      {/* ══════════════════════════════════════════
          MODE B — Products view
         ══════════════════════════════════════════ */}
      {showProducts && (
        <div className="px-4 pt-3 pb-8">

          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div>
              {isSearching ? (
                <h3 className="font-display font-bold text-lg">Qidiruv natijalari</h3>
              ) : activeSub ? (
                <h3 className="font-display font-bold text-lg flex items-center gap-2">
                  {activeSub.image && (
                    <div className="w-7 h-7 rounded-xl overflow-hidden">
                      <img src={activeSub.image} alt={activeSub.name} className="w-full h-full object-cover" />
                    </div>
                  )}
                  {!activeSub.image && activeSub.icon && <span className="text-xl">{activeSub.icon}</span>}
                  {activeSub.name}
                </h3>
              ) : activeParent?.id !== "__all__" && activeParent ? (
                <h3 className="font-display font-bold text-lg flex items-center gap-2">
                  {activeParent.image && (
                    <div className="w-7 h-7 rounded-xl overflow-hidden">
                      <img src={activeParent.image} alt={activeParent.name} className="w-full h-full object-cover" />
                    </div>
                  )}
                  {activeParent.name}
                </h3>
              ) : (
                <h3 className="font-display font-bold text-lg">Barcha mahsulotlar</h3>
              )}
              <p className="text-xs text-muted-foreground mt-0.5">
                {prodLoading ? "Yuklanmoqda..." : `${sorted.length} ta mahsulot`}
              </p>
            </div>

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

          {/* Subcategory cards grid — with images */}
          {isInParent && hasSubs && !activeSub && !isSearching && (
            <>
              <div className="grid grid-cols-3 gap-2.5 mb-4">
                {activeParent!.subcategories!.map((sub, idx) => (
                  <button
                    key={sub.id}
                    onClick={() => selectSub(sub)}
                    className="relative overflow-hidden rounded-2xl aspect-square press shadow-ios-sm"
                  >
                    {sub.image ? (
                      <>
                        <CatImage src={sub.image} alt={sub.name} className="absolute inset-0 w-full h-full" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
                        <div className={cn("absolute inset-0 -z-10 bg-gradient-to-br", gradient(idx))} />
                      </>
                    ) : (
                      <>
                        <div className={cn("absolute inset-0 bg-gradient-to-br", gradient(idx))} />
                        <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />
                      </>
                    )}
                    <div className="relative z-10 flex flex-col justify-end h-full p-2">
                      {!sub.image && <div className="text-2xl mb-1 text-center">{sub.icon ?? "📦"}</div>}
                      <div className="text-white text-[11px] font-bold leading-tight line-clamp-2 text-center">{sub.name}</div>
                      {sub.productCount ? (
                        <div className="text-white/70 text-[10px] mt-0.5 text-center">{sub.productCount} ta</div>
                      ) : null}
                    </div>
                  </button>
                ))}
              </div>

              {sorted.length > 0 && (
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex-1 h-px bg-border/50" />
                  <span className="text-[11px] text-muted-foreground font-medium">Barcha mahsulotlar</span>
                  <div className="flex-1 h-px bg-border/50" />
                </div>
              )}
            </>
          )}

          {prodLoading && (
            <div className="grid grid-cols-2 gap-3">
              {[1,2,3,4].map((i) => <Skeleton key={i} className="h-64 rounded-2xl" />)}
            </div>
          )}

          {!prodLoading && sorted.length === 0 && (isSearching || activeSub || !hasSubs) && (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-9 h-9 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-base">Hech narsa topilmadi</h3>
              <p className="text-sm text-muted-foreground mt-1">Boshqa kategoriya yoki so'z sinab ko'ring</p>
              <button
                onClick={goHome}
                className="mt-4 px-6 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl active:scale-95 transition-transform"
              >
                Kategoriyalarga qaytish
              </button>
            </div>
          )}

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
        <div className="fixed inset-0 z-50 flex flex-col justify-end" onClick={() => setShowSortSheet(false)}>
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
