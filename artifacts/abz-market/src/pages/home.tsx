import { useRef, useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { useCategories, useProducts } from "@/hooks/use-api";
import { ProductCard } from "@/components/ui/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Bell, ChevronRight, Search, Flame, Sparkles, Store, Zap,
  Star, TruckIcon, ShieldCheck, RotateCcw, Percent,
  LayoutGrid, Clock, ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { hapticFeedback } from "@/hooks/use-telegram";

function fmt(n: number) {
  return n.toLocaleString("ru-RU") + " so'm";
}

// ── Static data ──────────────────────────────────────────────
const BANNERS = [
  {
    id: 1,
    title: "Yozgi chegirmalar",
    subtitle: "20% GACHA ARZONLASHDI",
    gradient: "from-violet-600 via-purple-600 to-fuchsia-500",
    img: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80",
    badge: "🔥 HOT",
    badge_bg: "bg-white/20",
  },
  {
    id: 2,
    title: "Yangi kolleksiya",
    subtitle: "PREMIUM OSHXONA MEBELLARI",
    gradient: "from-slate-700 via-slate-600 to-zinc-500",
    img: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80",
    badge: "✨ YANGI",
    badge_bg: "bg-white/20",
  },
  {
    id: 3,
    title: "Yotoqxona to'plami",
    subtitle: "BEPUL YETKAZIB BERISH",
    gradient: "from-rose-500 via-pink-500 to-red-400",
    img: "https://images.unsplash.com/photo-1505693314120-0d443867891c?w=600&q=80",
    badge: "🚚 BEPUL",
    badge_bg: "bg-white/20",
  },
];

const CAT_ICONS: Record<string, string> = {
  Shkaflar:   "/icons/shkaflar.png",
  Komodlar:   "/icons/komodlar.png",
  Oshxonalar: "/icons/oshxonalar.png",
  Yotoqxona:  "/icons/yotoqxona.png",
  Stollar:    "/icons/stollar.png",
  Stullar:    "/icons/stullar.png",
  Divonlar:   "/icons/divonlar.png",
  Javonlar:   "/icons/javonlar.png",
};

const QUICK_ACTIONS = [
  { img: "/icons/flash.png",    label: "Flash sale",   path: "/catalog",              bg: "from-amber-50 to-orange-50 dark:from-amber-950/60 dark:to-orange-950/40" },
  { img: "/icons/flame.png",    label: "Top mahsulot", path: "/catalog?featured=true",bg: "from-rose-50 to-pink-50 dark:from-rose-950/60 dark:to-pink-950/40" },
  { img: "/icons/yangilar.png", label: "Yangilar",     path: "/catalog",              bg: "from-violet-50 to-purple-50 dark:from-violet-950/60 dark:to-purple-950/40" },
  { img: "/icons/dokonlar.png", label: "Do'konlar",    path: "/stores",               bg: "from-emerald-50 to-teal-50 dark:from-emerald-950/60 dark:to-teal-950/40" },
];

const TRUST = [
  { icon: TruckIcon,   label: "Tez yetkazish", sub: "1–3 kun" },
  { icon: ShieldCheck, label: "Kafolat",        sub: "1–2 yil" },
  { icon: RotateCcw,   label: "Qaytarish",      sub: "14 kun" },
  { icon: Percent,     label: "Chegirmalar",    sub: "Har kuni" },
];

// ── Banner carousel ───────────────────────────────────────────
function BannerCarousel({ onNavigate }: { onNavigate: (p: string) => void }) {
  const [active, setActive] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    timerRef.current = setTimeout(() => setActive((p) => (p + 1) % BANNERS.length), 3500);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [active]);

  return (
    <div className="px-4 mb-5">
      <div className="relative overflow-hidden rounded-3xl shadow-ios-lg">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${active * 100}%)` }}
        >
          {BANNERS.map((b) => (
            <div key={b.id} className="flex-none w-full cursor-pointer" onClick={() => onNavigate("/catalog")}>
              <div className={cn("relative aspect-[16/8] overflow-hidden bg-gradient-to-br", b.gradient)}>
                <img src={b.img} alt={b.title} className="absolute inset-0 w-full h-full object-cover opacity-35 mix-blend-overlay" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />
                <span className={cn("absolute top-3 left-3 text-white text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm", b.badge_bg)}>
                  {b.badge}
                </span>
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-white/65 text-[10px] font-bold uppercase tracking-widest mb-1">{b.subtitle}</p>
                  <h2 className="text-white font-display font-bold text-xl leading-tight mb-3">{b.title}</h2>
                  <span className="inline-flex items-center gap-1.5 bg-white/90 backdrop-blur-sm text-primary text-xs font-bold px-4 py-1.5 rounded-full shadow-ios-sm">
                    Ko'rish <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* Dots */}
        <div className="absolute bottom-4 right-4 flex gap-1.5">
          {BANNERS.map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); setActive(i); }}
              className={cn("h-1.5 rounded-full transition-all duration-300", i === active ? "w-5 bg-white" : "w-1.5 bg-white/45")}
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
    <div className="mx-4 mb-5">
      <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-red-400 rounded-3xl px-4 py-3.5 flex items-center justify-between shadow-ios-lg shadow-rose-300/40">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-white/20 rounded-2xl flex items-center justify-center">
            <Zap className="w-5 h-5 text-yellow-200 fill-yellow-200" />
          </div>
          <div>
            <div className="text-white font-display font-bold text-sm">Flash Sale!</div>
            <div className="text-white/65 text-[10px]">Chegirma tugaydi</div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {[pad(h), pad(m), pad(s)].map((v, i) => (
            <div key={i} className="flex items-center gap-1">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl w-[34px] h-[34px] flex items-center justify-center">
                <span className="text-white font-display font-extrabold text-base tabular-nums">{v}</span>
              </div>
              {i < 2 && <span className="text-white/80 font-bold text-sm leading-none">:</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main home page ────────────────────────────────────────────
export default function Home() {
  const [, navigate] = useLocation();

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
      <div className="sticky top-0 z-40 glass border-b border-white/40 px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="font-display font-extrabold text-[22px] text-gradient tracking-tight leading-none">
            ABZ Market
          </h1>
          <p className="text-[11px] text-muted-foreground mt-0.5">Mebel bozori cho'ntagingizda</p>
        </div>
        <button
          onClick={() => hapticFeedback("impact")}
          className="w-9 h-9 rounded-2xl glass-card flex items-center justify-center relative press-sm shadow-ios-sm"
        >
          <Bell className="w-[17px] h-[17px] text-foreground/80" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full border-2 border-white dark:border-background" />
        </button>
      </div>

      {/* ── Search ── */}
      <div className="px-4 pt-3 pb-2">
        <button
          onClick={() => goTo("/catalog")}
          className="w-full glass-input rounded-2xl px-4 py-3 flex items-center gap-3 press text-left shadow-ios-sm"
        >
          <Search className="w-[17px] h-[17px] text-muted-foreground shrink-0" />
          <span className="text-sm text-muted-foreground">Mahsulot qidirish...</span>
        </button>
      </div>

      {/* ── Banner ── */}
      <div className="pt-2">
        <BannerCarousel onNavigate={(p) => goTo(p)} />
      </div>

      {/* ── Quick actions ── */}
      <div className="px-4 mb-6">
        <div className="grid grid-cols-4 gap-2">
          {QUICK_ACTIONS.map(({ img, label, path, bg }) => (
            <button
              key={label}
              onClick={() => goTo(path)}
              className="flex flex-col items-center gap-1.5 press"
            >
              <div className={cn(
                "w-full aspect-square rounded-[20px] flex items-center justify-center bg-gradient-to-br glass-card shadow-ios-sm overflow-hidden",
                bg
              )}>
                <img src={img} alt={label} className="w-11 h-11 object-contain drop-shadow-md" />
              </div>
              <span className="text-[10px] font-semibold text-center text-foreground/75 leading-tight">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Trust badges ── */}
      <div className="px-4 mb-6">
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
          {TRUST.map(({ icon: Icon, label, sub }) => (
            <div key={label} className="flex-none flex items-center gap-2 glass-card rounded-2xl px-3 py-2 shadow-ios-sm">
              <Icon className="w-4 h-4 text-primary shrink-0" />
              <div>
                <div className="text-[11px] font-semibold whitespace-nowrap">{label}</div>
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
          <Link href="/catalog" className="text-primary text-xs font-semibold flex items-center gap-0.5">
            Barchasi <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="flex gap-3 px-4 overflow-x-auto hide-scrollbar pb-1">
          {/* All */}
          <button onClick={() => goTo("/catalog")} className="flex-none flex flex-col items-center gap-1.5 press">
            <div className="w-[60px] h-[60px] rounded-[22px] bg-primary flex items-center justify-center shadow-ios overflow-hidden">
              <img src="/icons/barchasi.png" alt="Barchasi" className="w-11 h-11 object-contain" />
            </div>
            <span className="text-[11px] font-semibold w-[60px] text-center leading-tight">Barchasi</span>
          </button>
          {catLoading
            ? [1,2,3,4].map((i) => <Skeleton key={i} className="flex-none w-[60px] h-[90px] rounded-2xl" />)
            : cats.map((cat) => (
                <button key={cat.id} onClick={() => goTo(`/catalog?category=${cat.id}`)} className="flex-none flex flex-col items-center gap-1.5 press">
                  <div className="w-[60px] h-[60px] rounded-[22px] glass-card flex items-center justify-center shadow-ios-sm overflow-hidden">
                    {CAT_ICONS[cat.name]
                      ? <img src={CAT_ICONS[cat.name]} alt={cat.name} className="w-10 h-10 object-contain drop-shadow-sm" />
                      : <span className="text-2xl">🪑</span>
                    }
                  </div>
                  <span className="text-[11px] font-semibold w-[60px] text-center leading-tight line-clamp-2">{cat.name}</span>
                </button>
              ))}
        </div>
      </div>

      {/* ── Flash sale ── */}
      <FlashSaleTimer />

      {/* ── Featured products (horizontal) ── */}
      <div className="mb-6">
        <div className="flex items-center justify-between px-4 mb-3">
          <h2 className="font-display font-bold text-[17px] flex items-center gap-2">
            <Flame className="w-4 h-4 text-rose-500" /> Top mahsulotlar
          </h2>
          <Link href="/catalog?featured=true" className="text-primary text-xs font-semibold flex items-center gap-0.5">
            Ko'proq <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="flex gap-3 px-4 pb-2 overflow-x-auto hide-scrollbar">
          {featLoading
            ? [1,2,3].map((i) => <Skeleton key={i} className="flex-none w-44 h-60 rounded-3xl" />)
            : featured.slice(0, 6).map((p) => (
                <button
                  key={p.id}
                  onClick={() => goTo(`/product/${p.id}`)}
                  className="flex-none w-44 glass-card rounded-3xl overflow-hidden press shadow-ios-sm text-left"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-muted/50">
                    <img src={p.images?.[0]} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
                    {(p.discount ?? 0) > 0
                      ? <div className="absolute top-2 left-2 bg-destructive/90 backdrop-blur-sm text-white text-[9px] font-bold px-2 py-0.5 rounded-full">-{p.discount}%</div>
                      : p.isFeatured && <div className="absolute top-2 left-2 bg-primary/90 backdrop-blur-sm text-white text-[9px] font-bold px-2 py-0.5 rounded-full">TOP</div>
                    }
                  </div>
                  <div className="p-2.5">
                    <p className="text-[12px] font-semibold line-clamp-2 leading-tight mb-1">{p.name}</p>
                    <div className="flex items-center gap-1 mb-1.5">
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
          <Link href="/catalog" className="text-primary text-xs font-semibold flex items-center gap-0.5">
            Ko'proq <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="space-y-2.5 px-4">
          {allLoading
            ? [1,2,3].map((i) => <Skeleton key={i} className="h-[76px] rounded-2xl" />)
            : newArr.map((p) => (
                <button
                  key={p.id}
                  onClick={() => goTo(`/product/${p.id}`)}
                  className="w-full flex items-center gap-3 glass-card rounded-2xl p-2.5 press shadow-ios-sm text-left"
                >
                  <div className="w-[56px] h-[56px] rounded-xl overflow-hidden bg-muted/50 shrink-0">
                    <img src={p.images?.[0]} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[13px] line-clamp-1 mb-1">{p.name}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-primary font-bold text-[13px]">{fmt(p.price)}</span>
                      {p.oldPrice && <span className="text-muted-foreground text-[11px] line-through">{fmt(p.oldPrice)}</span>}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <div className="flex items-center gap-0.5">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      <span className="text-[11px] font-semibold">{p.rating}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground line-clamp-1 max-w-[64px] text-right">{p.storeName}</span>
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
          <Link href="/catalog" className="text-primary text-xs font-semibold flex items-center gap-0.5">
            Hammasi <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        {allLoading
          ? <div className="grid grid-cols-2 gap-3">{[1,2,3,4].map((i) => <Skeleton key={i} className="h-64 rounded-3xl" />)}</div>
          : <div className="grid grid-cols-2 gap-3">{all.slice(0, 6).map((p) => <ProductCard key={p.id} product={p} />)}</div>
        }
      </div>

      {/* ── Partner banner ── */}
      <div className="px-4 mb-8">
        <button
          onClick={() => goTo("/register-store")}
          className="w-full bg-gradient-to-br from-primary via-violet-600 to-purple-700 rounded-3xl p-5 relative overflow-hidden shadow-ios-lg shadow-primary/30 press text-left"
        >
          <div className="absolute top-0 right-0 w-36 h-36 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-sm" />
          <div className="absolute -bottom-6 -left-6 w-28 h-28 bg-white/5 rounded-full blur-sm" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2.5">
              <div className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <Store className="w-4.5 h-4.5 text-white" />
              </div>
              <span className="bg-white/20 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                HAMKOR BO'LING
              </span>
            </div>
            <h3 className="font-display font-extrabold text-white text-[18px] mb-1.5 leading-tight">
              O'z do'koningizni oching!
            </h3>
            <p className="text-white/70 text-xs mb-4 leading-relaxed">
              50 000+ xaridor bilan ulaning. Mahsulotlaringizni butun O'zbekistonga yetkazing.
            </p>
            <div className="inline-flex items-center gap-1.5 bg-white text-primary text-xs font-bold px-4 py-2 rounded-full shadow-ios-sm">
              Boshlash <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </button>
      </div>

    </MobileLayout>
  );
}
