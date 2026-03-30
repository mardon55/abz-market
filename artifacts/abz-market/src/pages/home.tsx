import { useRef, useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { useCategories, useProducts } from "@/hooks/use-api";
import { ProductCard } from "@/components/ui/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Bell, ChevronRight, Search, Zap, Flame, Sparkles,
  Star, TruckIcon, ShieldCheck, RotateCcw, Percent,
  Store, LayoutGrid, Clock, ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTelegram } from "@/hooks/use-telegram";

// ────────────────────────────────────────────────────────────
// Banner data
// ────────────────────────────────────────────────────────────
const BANNERS = [
  {
    id: 1,
    title: "Yozgi chegirmalar",
    subtitle: "20% GACHA ARZONLASHDI",
    gradient: "from-purple-700 via-violet-600 to-fuchsia-500",
    img: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80",
    badge: "🔥 HOT",
  },
  {
    id: 2,
    title: "Yangi kolleksiya",
    subtitle: "PREMIUM OSHXONA MEBELLARI",
    gradient: "from-slate-800 via-gray-700 to-zinc-600",
    img: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80",
    badge: "✨ YANGI",
  },
  {
    id: 3,
    title: "Yotoqxona to'plami",
    subtitle: "BEPUL YETKAZIB BERISH",
    gradient: "from-rose-600 via-pink-600 to-red-500",
    img: "https://images.unsplash.com/photo-1505693314120-0d443867891c?w=600&q=80",
    badge: "🚚 BEPUL",
  },
];

// Category icons mapping
const CAT_ICONS: Record<string, string> = {
  Shkaflar:  "🚪",
  Komodlar:  "🪵",
  Oshxonalar:"🍳",
  Yotoqxona: "🛏",
  Stollar:   "🪑",
  Stullar:   "💺",
};

// Format price
function fmt(n: number) {
  return n.toLocaleString("ru-RU") + " so'm";
}

// ────────────────────────────────────────────────────────────
// Auto-play banner carousel
// ────────────────────────────────────────────────────────────
function BannerCarousel() {
  const [active, setActive] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [, navigate] = useLocation();

  const startTimer = () => {
    timerRef.current = setTimeout(() => {
      setActive((p) => (p + 1) % BANNERS.length);
    }, 3500);
  };

  useEffect(() => {
    startTimer();
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  return (
    <div className="px-4 mb-5">
      <div className="relative overflow-hidden rounded-2xl shadow-lg">
        {/* Slides */}
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${active * 100}%)` }}
        >
          {BANNERS.map((b) => (
            <div
              key={b.id}
              className="flex-none w-full"
              onClick={() => navigate("/catalog")}
            >
              <div className={cn("relative aspect-[16/8] w-full overflow-hidden bg-gradient-to-br", b.gradient)}>
                <img
                  src={b.img}
                  alt={b.title}
                  className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute top-3 left-3">
                  <span className="bg-white/20 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {b.badge}
                  </span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest mb-1">
                    {b.subtitle}
                  </p>
                  <h2 className="text-white font-display font-bold text-xl leading-tight mb-3">
                    {b.title}
                  </h2>
                  <span className="inline-flex items-center gap-1 bg-white text-primary text-xs font-bold px-3 py-1.5 rounded-full">
                    Ko'rish <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Dots */}
        <div className="absolute bottom-3 right-3 flex gap-1.5">
          {BANNERS.map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); setActive(i); }}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                i === active ? "w-5 bg-white" : "w-1.5 bg-white/50"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Quick actions row
// ────────────────────────────────────────────────────────────
const QUICK_ACTIONS = [
  { icon: Zap,        label: "Flash sale",    path: "/catalog?sale=true",     color: "text-amber-500",   bg: "bg-amber-50 dark:bg-amber-950/40" },
  { icon: Flame,      label: "Top mahsulot",  path: "/catalog?featured=true", color: "text-rose-500",    bg: "bg-rose-50 dark:bg-rose-950/40" },
  { icon: Sparkles,   label: "Yangilar",      path: "/catalog",               color: "text-violet-500",  bg: "bg-violet-50 dark:bg-violet-950/40" },
  { icon: Store,      label: "Do'konlar",     path: "/stores",                color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/40" },
];

function QuickActions() {
  const [, navigate] = useLocation();
  const { haptic } = useTelegram();
  return (
    <div className="px-4 mb-6">
      <div className="grid grid-cols-4 gap-2.5">
        {QUICK_ACTIONS.map(({ icon: Icon, label, path, color, bg }) => (
          <button
            key={label}
            onClick={() => { haptic("selection"); navigate(path); }}
            className="flex flex-col items-center gap-1.5 group active:scale-95 transition-transform"
          >
            <div className={cn("w-full aspect-square rounded-2xl flex items-center justify-center", bg)}>
              <Icon className={cn("w-6 h-6", color)} />
            </div>
            <span className="text-[10px] font-medium text-center text-foreground leading-tight">
              {label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Trust badges
// ────────────────────────────────────────────────────────────
const TRUST = [
  { icon: TruckIcon,   label: "Tez yetkazish",  sub: "1-3 kun ichida" },
  { icon: ShieldCheck, label: "Kafolat",         sub: "1-2 yil" },
  { icon: RotateCcw,   label: "Qaytarish",       sub: "14 kun" },
  { icon: Percent,     label: "Chegirmalar",     sub: "Har kuni" },
];

function TrustBadges() {
  return (
    <div className="px-4 mb-6">
      <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
        {TRUST.map(({ icon: Icon, label, sub }) => (
          <div
            key={label}
            className="flex-none flex items-center gap-2 bg-muted/50 border border-border/50 rounded-xl px-3 py-2"
          >
            <Icon className="w-4 h-4 text-primary shrink-0" />
            <div>
              <div className="text-[11px] font-semibold text-foreground whitespace-nowrap">{label}</div>
              <div className="text-[10px] text-muted-foreground whitespace-nowrap">{sub}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Categories horizontal scroll
// ────────────────────────────────────────────────────────────
function CategoriesSection() {
  const { data, isLoading } = useCategories();
  const [, navigate] = useLocation();
  const { haptic } = useTelegram();
  const cats = data?.categories ?? [];

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between px-4 mb-3">
        <h2 className="font-display font-bold text-[17px] text-foreground flex items-center gap-2">
          <LayoutGrid className="w-4 h-4 text-primary" />
          Kategoriyalar
        </h2>
        <Link href="/catalog" className="text-primary text-xs font-semibold flex items-center gap-0.5">
          Barchasi <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {isLoading ? (
        <div className="flex gap-3 px-4 overflow-x-auto hide-scrollbar pb-1">
          {[1,2,3,4,5].map(i => (
            <Skeleton key={i} className="flex-none w-20 h-24 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="flex gap-3 px-4 overflow-x-auto hide-scrollbar pb-1">
          {/* All categories button */}
          <button
            onClick={() => { haptic("selection"); navigate("/catalog"); }}
            className="flex-none flex flex-col items-center gap-1.5 active:scale-95 transition-transform"
          >
            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center">
              <LayoutGrid className="w-7 h-7 text-white" />
            </div>
            <span className="text-[11px] font-medium text-center w-16 leading-tight text-foreground">
              Barchasi
            </span>
          </button>

          {cats.map((cat) => (
            <button
              key={cat.id}
              onClick={() => { haptic("selection"); navigate(`/catalog?category=${cat.id}`); }}
              className="flex-none flex flex-col items-center gap-1.5 active:scale-95 transition-transform"
            >
              <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/10 flex items-center justify-center text-2xl">
                {CAT_ICONS[cat.name] ?? "🪑"}
              </div>
              <span className="text-[11px] font-medium text-center w-16 leading-tight text-foreground line-clamp-2">
                {cat.name}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Flash sale countdown
// ────────────────────────────────────────────────────────────
function FlashSaleCountdown() {
  const [time, setTime] = useState({ h: 5, m: 42, s: 37 });

  useEffect(() => {
    const t = setInterval(() => {
      setTime((prev) => {
        let { h, m, s } = prev;
        s--;
        if (s < 0) { s = 59; m--; }
        if (m < 0) { m = 59; h--; }
        if (h < 0) { h = 5; m = 59; s = 59; }
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="mx-4 mb-4 bg-gradient-to-r from-rose-500 via-pink-500 to-red-500 rounded-2xl px-4 py-3 flex items-center justify-between shadow-md shadow-rose-200 dark:shadow-rose-950">
      <div className="flex items-center gap-2">
        <Zap className="w-5 h-5 text-yellow-300 fill-yellow-300" />
        <div>
          <div className="text-white font-display font-bold text-sm">Flash Sale!</div>
          <div className="text-white/70 text-[10px]">Maxsus chegirma tugaydi</div>
        </div>
      </div>
      <div className="flex items-center gap-1">
        {[pad(time.h), pad(time.m), pad(time.s)].map((v, i) => (
          <div key={i} className="flex items-center gap-1">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg w-9 h-9 flex items-center justify-center">
              <span className="text-white font-display font-bold text-base tabular-nums">{v}</span>
            </div>
            {i < 2 && <span className="text-white font-bold text-sm">:</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Featured products horizontal scroll
// ────────────────────────────────────────────────────────────
function FeaturedProducts() {
  const { data, isLoading } = useProducts({ featured: true });
  const [, navigate] = useLocation();
  const { haptic } = useTelegram();
  const products = data?.products ?? [];

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between px-4 mb-3">
        <h2 className="font-display font-bold text-[17px] text-foreground flex items-center gap-2">
          <Flame className="w-4 h-4 text-rose-500" />
          Top mahsulotlar
        </h2>
        <Link href="/catalog?featured=true" className="text-primary text-xs font-semibold flex items-center gap-0.5">
          Ko'proq <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {isLoading ? (
        <div className="flex gap-3 px-4 pb-2 overflow-x-auto hide-scrollbar">
          {[1,2,3].map(i => <Skeleton key={i} className="flex-none w-44 h-60 rounded-2xl" />)}
        </div>
      ) : (
        <div className="flex gap-3 px-4 pb-2 overflow-x-auto hide-scrollbar">
          {products.slice(0, 6).map((product) => (
            <button
              key={product.id}
              onClick={() => { haptic("selection"); navigate(`/product/${product.id}`); }}
              className="flex-none w-44 bg-card border border-border/50 rounded-2xl overflow-hidden active:scale-[0.98] transition-transform shadow-sm"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
                <img
                  src={product.images?.[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                {product.discount && product.discount > 0 ? (
                  <div className="absolute top-2 left-2 bg-destructive text-destructive-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                    -{product.discount}%
                  </div>
                ) : null}
                {product.isFeatured && !product.discount && (
                  <div className="absolute top-2 left-2 bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                    TOP
                  </div>
                )}
              </div>
              <div className="p-2.5">
                <p className="text-[12px] font-semibold text-foreground line-clamp-2 leading-tight mb-1">
                  {product.name}
                </p>
                <div className="flex items-center gap-1 mb-1.5">
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  <span className="text-[10px] text-muted-foreground font-medium">
                    {product.rating} ({product.reviewCount})
                  </span>
                </div>
                <div>
                  <div className="text-primary font-display font-bold text-[13px]">
                    {fmt(product.price)}
                  </div>
                  {product.oldPrice && (
                    <div className="text-muted-foreground text-[11px] line-through">
                      {fmt(product.oldPrice)}
                    </div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// All products grid
// ────────────────────────────────────────────────────────────
function ProductsGrid() {
  const { data, isLoading } = useProducts();
  const products = data?.products ?? [];

  return (
    <div className="px-4 mb-8">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display font-bold text-[17px] text-foreground flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-violet-500" />
          Barcha mahsulotlar
        </h2>
        <Link href="/catalog" className="text-primary text-xs font-semibold flex items-center gap-0.5">
          Hammasi <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-3">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-64 rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {products.slice(0, 6).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// New arrivals section
// ────────────────────────────────────────────────────────────
function NewArrivals() {
  const { data, isLoading } = useProducts();
  const [, navigate] = useLocation();
  const { haptic } = useTelegram();
  const products = data?.products.slice(2, 5) ?? [];

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between px-4 mb-3">
        <h2 className="font-display font-bold text-[17px] text-foreground flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-500" />
          Yangi kelganlar
        </h2>
        <Link href="/catalog" className="text-primary text-xs font-semibold flex items-center gap-0.5">
          Ko'proq <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3 px-4">
          {[1,2,3].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}
        </div>
      ) : (
        <div className="space-y-2 px-4">
          {products.map((product) => (
            <button
              key={product.id}
              onClick={() => { haptic("selection"); navigate(`/product/${product.id}`); }}
              className="w-full flex items-center gap-3 bg-card border border-border/50 rounded-xl p-2.5 active:scale-[0.99] transition-transform shadow-sm text-left"
            >
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-muted shrink-0">
                <img
                  src={product.images?.[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[13px] text-foreground line-clamp-2 leading-tight mb-1">
                  {product.name}
                </p>
                <div className="flex items-center gap-1.5">
                  <span className="text-primary font-display font-bold text-[13px]">
                    {fmt(product.price)}
                  </span>
                  {product.oldPrice && (
                    <span className="text-muted-foreground text-[11px] line-through">
                      {fmt(product.oldPrice)}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <div className="flex items-center gap-0.5">
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  <span className="text-[11px] font-semibold text-foreground">{product.rating}</span>
                </div>
                <span className="text-[10px] text-muted-foreground">{product.storeName}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Partner banner
// ────────────────────────────────────────────────────────────
function PartnerBanner() {
  const [, navigate] = useLocation();
  const { haptic } = useTelegram();
  return (
    <div className="px-4 mb-8">
      <button
        onClick={() => { haptic("impact"); navigate("/register-store"); }}
        className="w-full bg-gradient-to-r from-primary via-violet-600 to-purple-700 rounded-2xl p-5 relative overflow-hidden shadow-lg shadow-primary/25 active:scale-[0.99] transition-transform text-left"
      >
        <div className="absolute top-0 right-0 w-28 h-28 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-sm" />
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
              <Store className="w-4 h-4 text-white" />
            </div>
            <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              HAMKOR BO'LING
            </span>
          </div>
          <h3 className="font-display font-bold text-white text-lg mb-1 leading-tight">
            O'z do'koningizni oching!
          </h3>
          <p className="text-white/75 text-xs mb-4 leading-relaxed">
            50 000+ xaridor bilan ulaning. Mahsulotlaringizni butun O'zbekistonga yetkazing.
          </p>
          <div className="inline-flex items-center gap-1.5 bg-white text-primary text-xs font-bold px-4 py-2 rounded-full">
            Boshlash <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </button>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Main page
// ────────────────────────────────────────────────────────────
export default function Home() {
  const [, navigate] = useLocation();
  const { haptic } = useTelegram();

  return (
    <MobileLayout hideNav={false}>
      {/* ── Sticky Header ── */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-border/40">
        <div>
          <h1 className="font-display font-bold text-xl text-primary tracking-tight leading-none">
            ABZ Market
          </h1>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Mebel bozori cho'ntagingizda
          </p>
        </div>
        <button
          onClick={() => haptic("impact")}
          className="w-9 h-9 rounded-full bg-muted flex items-center justify-center relative active:scale-90 transition-transform"
        >
          <Bell className="w-4.5 h-4.5 text-foreground" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full border-2 border-background" />
        </button>
      </div>

      {/* ── Search Bar ── */}
      <div className="px-4 pt-3 pb-2">
        <button
          onClick={() => { haptic("selection"); navigate("/catalog"); }}
          className="w-full bg-muted/60 border border-border/60 text-muted-foreground rounded-xl px-4 py-3 flex items-center gap-3 active:scale-[0.99] transition-all text-left"
        >
          <Search className="w-4.5 h-4.5 shrink-0" />
          <span className="text-sm">Mahsulot qidirish...</span>
        </button>
      </div>

      {/* ── Banner Carousel ── */}
      <div className="pt-2">
        <BannerCarousel />
      </div>

      {/* ── Quick Actions ── */}
      <QuickActions />

      {/* ── Trust Badges ── */}
      <TrustBadges />

      {/* ── Categories ── */}
      <CategoriesSection />

      {/* ── Flash Sale ── */}
      <FlashSaleCountdown />

      {/* ── Featured Products (horizontal) ── */}
      <FeaturedProducts />

      {/* ── New Arrivals (list) ── */}
      <NewArrivals />

      {/* ── All Products Grid ── */}
      <ProductsGrid />

      {/* ── Partner Banner ── */}
      <PartnerBanner />
    </MobileLayout>
  );
}
