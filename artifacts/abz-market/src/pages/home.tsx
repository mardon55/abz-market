import { useRef, useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { useCategories, useProducts } from "@/hooks/use-api";
import { ProductCard } from "@/components/ui/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Bell, ChevronRight, Search, Zap, Flame, Sparkles,
  Star, TruckIcon, ShieldCheck, RotateCcw, Percent,
  Store, LayoutGrid, Clock, ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { hapticFeedback } from "@/hooks/use-telegram";

// ── helpers ──────────────────────────────────────────────────
function fmt(n: number) {
  return n.toLocaleString("ru-RU") + " so'm";
}

// ── data ─────────────────────────────────────────────────────
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

const CAT_ICONS: Record<string, string> = {
  Shkaflar: "🚪",
  Komodlar: "🪵",
  Oshxonalar: "🍳",
  Yotoqxona: "🛏",
  Stollar: "🪑",
  Stullar: "💺",
};

const QUICK_ACTIONS = [
  { icon: Zap,        label: "Flash sale",   path: "/catalog", color: "text-amber-500",   bg: "bg-amber-50 dark:bg-amber-950/40" },
  { icon: Flame,      label: "Top mahsulot", path: "/catalog?featured=true", color: "text-rose-500",    bg: "bg-rose-50 dark:bg-rose-950/40" },
  { icon: Sparkles,   label: "Yangilar",     path: "/catalog", color: "text-violet-500",  bg: "bg-violet-50 dark:bg-violet-950/40" },
  { icon: Store,      label: "Do'konlar",    path: "/stores",  color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/40" },
];

const TRUST = [
  { icon: TruckIcon,   label: "Tez yetkazish", sub: "1–3 kun ichida" },
  { icon: ShieldCheck, label: "Kafolat",        sub: "1–2 yil" },
  { icon: RotateCcw,   label: "Qaytarish",      sub: "14 kun" },
  { icon: Percent,     label: "Chegirmalar",    sub: "Har kuni" },
];

// ── Banner carousel ───────────────────────────────────────────
function BannerCarousel({ onNavigate }: { onNavigate: (p: string) => void }) {
  const [active, setActive] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      setActive((p) => (p + 1) % BANNERS.length);
    }, 3500);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [active]);

  return (
    <div className="px-4 mb-5">
      <div className="relative overflow-hidden rounded-2xl shadow-lg">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${active * 100}%)` }}
        >
          {BANNERS.map((b) => (
            <div
              key={b.id}
              className="flex-none w-full cursor-pointer"
              onClick={() => onNavigate("/catalog")}
            >
              <div className={cn("relative aspect-[16/8] overflow-hidden bg-gradient-to-br", b.gradient)}>
                <img
                  src={b.img}
                  alt={b.title}
                  className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <span className="absolute top-3 left-3 bg-white/20 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {b.badge}
                </span>
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

// ── Flash sale countdown ──────────────────────────────────────
function FlashSaleTimer() {
  const [secs, setSecs] = useState(5 * 3600 + 42 * 60 + 37);

  useEffect(() => {
    const t = setInterval(() => setSecs((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);

  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="mx-4 mb-4 bg-gradient-to-r from-rose-500 via-pink-500 to-red-500 rounded-2xl px-4 py-3 flex items-center justify-between shadow-md shadow-rose-200 dark:shadow-rose-950">
      <div className="flex items-center gap-2">
        <Zap className="w-5 h-5 text-yellow-300 fill-yellow-300" />
        <div>
          <div className="text-white font-display font-bold text-sm">Flash Sale!</div>
          <div className="text-white/70 text-[10px]">Chegirma tugaydi</div>
        </div>
      </div>
      <div className="flex items-center gap-1">
        {[pad(h), pad(m), pad(s)].map((v, i) => (
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

// ── Main Home page ────────────────────────────────────────────
export default function Home() {
  const [, navigate] = useLocation();

  // All data fetched in parent — single source of truth
  const { data: catData,  isLoading: catLoading  } = useCategories();
  const { data: featData, isLoading: featLoading } = useProducts({ featured: true });
  const { data: allData,  isLoading: allLoading  } = useProducts();

  const cats     = catData?.categories ?? [];
  const featured = featData?.products  ?? [];
  const all      = allData?.products   ?? [];
  const newArr   = all.slice(2, 5);

  const goTo = (path: string) => {
    hapticFeedback("selection");
    navigate(path);
  };

  return (
    <MobileLayout hideNav={false}>

      {/* ── Sticky header ── */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-border/40">
        <div>
          <h1 className="font-display font-bold text-xl text-primary tracking-tight leading-none">ABZ Market</h1>
          <p className="text-[11px] text-muted-foreground mt-0.5">Mebel bozori cho'ntagingizda</p>
        </div>
        <button
          onClick={() => hapticFeedback("impact")}
          className="w-9 h-9 rounded-full bg-muted flex items-center justify-center relative active:scale-90 transition-transform"
        >
          <Bell className="w-[18px] h-[18px] text-foreground" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full border-2 border-background" />
        </button>
      </div>

      {/* ── Search ── */}
      <div className="px-4 pt-3 pb-2">
        <button
          onClick={() => goTo("/catalog")}
          className="w-full bg-muted/60 border border-border/60 text-muted-foreground rounded-xl px-4 py-3 flex items-center gap-3 active:scale-[0.99] transition-all text-left"
        >
          <Search className="w-[18px] h-[18px] shrink-0" />
          <span className="text-sm">Mahsulot qidirish...</span>
        </button>
      </div>

      {/* ── Banner ── */}
      <div className="pt-2">
        <BannerCarousel onNavigate={(p) => goTo(p)} />
      </div>

      {/* ── Quick actions ── */}
      <div className="px-4 mb-6">
        <div className="grid grid-cols-4 gap-2.5">
          {QUICK_ACTIONS.map(({ icon: Icon, label, path, color, bg }) => (
            <button
              key={label}
              onClick={() => goTo(path)}
              className="flex flex-col items-center gap-1.5 active:scale-95 transition-transform"
            >
              <div className={cn("w-full aspect-square rounded-2xl flex items-center justify-center", bg)}>
                <Icon className={cn("w-6 h-6", color)} />
              </div>
              <span className="text-[10px] font-medium text-center text-foreground leading-tight">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Trust badges ── */}
      <div className="px-4 mb-6">
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
          {TRUST.map(({ icon: Icon, label, sub }) => (
            <div key={label} className="flex-none flex items-center gap-2 bg-muted/50 border border-border/50 rounded-xl px-3 py-2">
              <Icon className="w-4 h-4 text-primary shrink-0" />
              <div>
                <div className="text-[11px] font-semibold text-foreground whitespace-nowrap">{label}</div>
                <div className="text-[10px] text-muted-foreground whitespace-nowrap">{sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Categories ── */}
      <div className="mb-6">
        <div className="flex items-center justify-between px-4 mb-3">
          <h2 className="font-display font-bold text-[17px] flex items-center gap-2">
            <LayoutGrid className="w-4 h-4 text-primary" /> Kategoriyalar
          </h2>
          <Link href="/catalog" className="text-primary text-xs font-semibold flex items-center">
            Barchasi <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="flex gap-3 px-4 overflow-x-auto hide-scrollbar pb-1">
          <button onClick={() => goTo("/catalog")} className="flex-none flex flex-col items-center gap-1.5 active:scale-95 transition-transform">
            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center">
              <LayoutGrid className="w-7 h-7 text-white" />
            </div>
            <span className="text-[11px] font-medium w-16 text-center leading-tight">Barchasi</span>
          </button>
          {catLoading
            ? [1, 2, 3, 4].map((i) => <Skeleton key={i} className="flex-none w-16 h-24 rounded-2xl" />)
            : cats.map((cat) => (
                <button key={cat.id} onClick={() => goTo(`/catalog?category=${cat.id}`)} className="flex-none flex flex-col items-center gap-1.5 active:scale-95 transition-transform">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/10 flex items-center justify-center text-2xl">
                    {CAT_ICONS[cat.name] ?? "🪑"}
                  </div>
                  <span className="text-[11px] font-medium w-16 text-center leading-tight line-clamp-2">{cat.name}</span>
                </button>
              ))}
        </div>
      </div>

      {/* ── Flash sale timer ── */}
      <FlashSaleTimer />

      {/* ── Featured products (horizontal) ── */}
      <div className="mb-6">
        <div className="flex items-center justify-between px-4 mb-3">
          <h2 className="font-display font-bold text-[17px] flex items-center gap-2">
            <Flame className="w-4 h-4 text-rose-500" /> Top mahsulotlar
          </h2>
          <Link href="/catalog?featured=true" className="text-primary text-xs font-semibold flex items-center">
            Ko'proq <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="flex gap-3 px-4 pb-2 overflow-x-auto hide-scrollbar">
          {featLoading
            ? [1, 2, 3].map((i) => <Skeleton key={i} className="flex-none w-44 h-60 rounded-2xl" />)
            : featured.slice(0, 6).map((p) => (
                <button
                  key={p.id}
                  onClick={() => goTo(`/product/${p.id}`)}
                  className="flex-none w-44 bg-card border border-border/50 rounded-2xl overflow-hidden active:scale-[0.98] transition-transform shadow-sm text-left"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                    <img src={p.images?.[0]} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
                    {(p.discount ?? 0) > 0
                      ? <div className="absolute top-2 left-2 bg-destructive text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">-{p.discount}%</div>
                      : p.isFeatured && <div className="absolute top-2 left-2 bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">TOP</div>
                    }
                  </div>
                  <div className="p-2.5">
                    <p className="text-[12px] font-semibold line-clamp-2 leading-tight mb-1">{p.name}</p>
                    <div className="flex items-center gap-1 mb-1">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      <span className="text-[10px] text-muted-foreground">{p.rating} ({p.reviewCount})</span>
                    </div>
                    <div className="text-primary font-bold text-[13px]">{fmt(p.price)}</div>
                    {p.oldPrice && <div className="text-muted-foreground text-[11px] line-through">{fmt(p.oldPrice)}</div>}
                  </div>
                </button>
              ))}
        </div>
      </div>

      {/* ── New arrivals (list) ── */}
      <div className="mb-6">
        <div className="flex items-center justify-between px-4 mb-3">
          <h2 className="font-display font-bold text-[17px] flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-500" /> Yangi kelganlar
          </h2>
          <Link href="/catalog" className="text-primary text-xs font-semibold flex items-center">
            Ko'proq <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="space-y-2 px-4">
          {allLoading
            ? [1, 2, 3].map((i) => <Skeleton key={i} className="h-20 rounded-xl" />)
            : newArr.map((p) => (
                <button
                  key={p.id}
                  onClick={() => goTo(`/product/${p.id}`)}
                  className="w-full flex items-center gap-3 bg-card border border-border/50 rounded-xl p-2.5 active:scale-[0.99] transition-transform shadow-sm text-left"
                >
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-muted shrink-0">
                    <img src={p.images?.[0]} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[13px] line-clamp-2 leading-tight mb-1">{p.name}</p>
                    <div className="flex items-center gap-1.5">
                      <span className="text-primary font-bold text-[13px]">{fmt(p.price)}</span>
                      {p.oldPrice && <span className="text-muted-foreground text-[11px] line-through">{fmt(p.oldPrice)}</span>}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <div className="flex items-center gap-0.5">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      <span className="text-[11px] font-semibold">{p.rating}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">{p.storeName}</span>
                  </div>
                </button>
              ))}
        </div>
      </div>

      {/* ── All products grid ── */}
      <div className="px-4 mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-bold text-[17px] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-violet-500" /> Barcha mahsulotlar
          </h2>
          <Link href="/catalog" className="text-primary text-xs font-semibold flex items-center">
            Hammasi <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        {allLoading
          ? <div className="grid grid-cols-2 gap-3">{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-64 rounded-2xl" />)}</div>
          : <div className="grid grid-cols-2 gap-3">{all.slice(0, 6).map((p) => <ProductCard key={p.id} product={p} />)}</div>
        }
      </div>

      {/* ── Partner banner ── */}
      <div className="px-4 mb-8">
        <button
          onClick={() => goTo("/register-store")}
          className="w-full bg-gradient-to-r from-primary via-violet-600 to-purple-700 rounded-2xl p-5 relative overflow-hidden shadow-lg shadow-primary/25 active:scale-[0.99] transition-transform text-left"
        >
          <div className="absolute top-0 right-0 w-28 h-28 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-sm" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
                <Store className="w-4 h-4 text-white" />
              </div>
              <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">HAMKOR BO'LING</span>
            </div>
            <h3 className="font-display font-bold text-white text-lg mb-1 leading-tight">O'z do'koningizni oching!</h3>
            <p className="text-white/75 text-xs mb-4 leading-relaxed">50 000+ xaridor bilan ulaning. Mahsulotlaringizni butun O'zbekistonga yetkazing.</p>
            <div className="inline-flex items-center gap-1.5 bg-white text-primary text-xs font-bold px-4 py-2 rounded-full">
              Boshlash <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </button>
      </div>

    </MobileLayout>
  );
}
