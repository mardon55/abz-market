import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { useProducts } from "@/hooks/use-api";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice, cn } from "@/lib/utils";
import { ArrowLeft, Clock, Package, RefreshCw } from "lucide-react";
import { format, isToday, isYesterday } from "date-fns";
import { uz } from "date-fns/locale";

const PAGE_SIZE = 20;

function timeAgo(dateStr: string) {
  const date = new Date(dateStr);
  const now  = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1)  return "Hozirgina";
  if (diffMin < 60) return `${diffMin} daqiqa oldin`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24)   return `${diffH} soat oldin`;
  return format(date, "d-MMM", { locale: uz });
}

export default function NewArrivalsPage() {
  const [, navigate] = useLocation();
  const [offset, setOffset]   = useState(0);
  const [allItems, setAllItems] = useState<any[]>([]);

  const { data, isLoading, isFetching, refetch } = useProducts({
    newOnly: true, sortBy: "createdAt", limit: PAGE_SIZE, offset,
  } as any);

  useEffect(() => {
    if (!data?.products) return;
    if (offset === 0) {
      setAllItems(data.products);
    } else {
      setAllItems((prev) => {
        const ids = new Set(prev.map((p) => p.id));
        return [...prev, ...data.products.filter((p: any) => !ids.has(p.id))];
      });
    }
  }, [data, offset]);

  const total   = data?.total ?? 0;
  const hasMore = allItems.length < total;

  // auto refresh every 5 min
  useEffect(() => {
    const id = setInterval(() => { setOffset(0); refetch(); }, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, [refetch]);

  const now = new Date();
  const dateLabel = format(now, "d-MMMM, yyyy", { locale: uz });

  return (
    <MobileLayout>
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/90 backdrop-blur-md border-b border-border/40 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate("/", { replace: true })} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center active:scale-95">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="font-display font-bold text-base leading-tight">Yangi kelganlar</h1>
          <p className="text-[11px] text-muted-foreground">{dateLabel} · {isLoading ? "..." : `${total} ta`}</p>
        </div>
        <button
          onClick={() => { setOffset(0); refetch(); }}
          disabled={isFetching}
          className="w-9 h-9 rounded-full bg-muted flex items-center justify-center active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={cn("w-4 h-4", isFetching && "animate-spin")} />
        </button>
      </div>

      {/* Info banner */}
      <div className="mx-4 mt-3 mb-2 flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/40 rounded-2xl px-4 py-3">
        <Clock className="w-4 h-4 text-blue-500 flex-shrink-0" />
        <p className="text-[11px] text-blue-700 dark:text-blue-300 leading-relaxed">
          Bu yerda <b>so'nggi 24 soat</b> ichida tasdiqlangan yangi mahsulotlar ko'rsatiladi. Har kuni yangilanib turadi.
        </p>
      </div>

      {/* Product list */}
      <div className="px-4 pb-8">
        {isLoading && offset === 0
          ? [1,2,3,4,5].map((i) => <Skeleton key={i} className="h-[80px] rounded-2xl mb-2.5" />)
          : allItems.length === 0
            ? (
              <div className="flex flex-col items-center py-16 gap-3">
                <div className="w-16 h-16 rounded-3xl bg-muted flex items-center justify-center">
                  <Package className="w-8 h-8 text-muted-foreground/50" />
                </div>
                <p className="font-semibold text-foreground">Bugun yangi mahsulot yo'q</p>
                <p className="text-sm text-muted-foreground text-center px-8">
                  Adminlar yangi mahsulot tasdiqlasa, bu yerda ko'rinadi
                </p>
              </div>
            )
            : (
              <div className="space-y-2.5 mt-1">
                {allItems.map((p) => (
                  <Link
                    key={p.id}
                    href={`/product/${p.id}`}
                    data-testid={`new-product-${p.id}`}
                    className="flex items-center gap-3 bg-card rounded-2xl p-3 border border-border/40 active:scale-[0.98] transition-transform shadow-ios-sm"
                  >
                    {/* Image */}
                    <div className="w-14 h-[74px] rounded-xl overflow-hidden bg-muted flex-shrink-0" style={{ aspectRatio: "3/4" }}>
                      {p.images?.[0]
                        ? <img src={p.images[0]} alt="" className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-muted-foreground/30"><Package className="w-6 h-6" /></div>
                      }
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm leading-tight line-clamp-2 mb-1">{p.name}</p>
                      <div className="flex items-center gap-2">
                        {p.oldPrice && Number(p.oldPrice) > 0 && (
                          <span className="text-[10px] text-muted-foreground line-through">{Number(p.oldPrice).toLocaleString()}</span>
                        )}
                        <span className="text-primary font-bold text-sm">{Number(p.price).toLocaleString()} so'm</span>
                      </div>
                      {p.categoryName && (
                        <span className="text-[10px] text-muted-foreground/70 mt-0.5 block truncate">{p.categoryName}</span>
                      )}
                    </div>

                    {/* Time badge */}
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span className="text-[9px] text-blue-500 bg-blue-50 dark:bg-blue-900/20 px-1.5 py-0.5 rounded-full font-semibold whitespace-nowrap">
                        {timeAgo(p.createdAt)}
                      </span>
                      {p.discount && p.discount > 0 && (
                        <span className="text-[9px] text-red-500 bg-red-50 dark:bg-red-900/20 px-1.5 py-0.5 rounded-full font-bold">
                          -{p.discount}%
                        </span>
                      )}
                    </div>
                  </Link>
                ))}

                {/* Load more */}
                {hasMore && (
                  <button
                    onClick={() => setOffset((o) => o + PAGE_SIZE)}
                    disabled={isFetching}
                    className="w-full mt-2 py-3 rounded-2xl bg-muted/60 text-sm font-semibold text-foreground active:bg-muted disabled:opacity-50 transition-colors"
                  >
                    {isFetching ? "Yuklanmoqda..." : `Ko'proq ko'rish (${total - allItems.length} ta)`}
                  </button>
                )}
              </div>
            )
        }
      </div>
    </MobileLayout>
  );
}
