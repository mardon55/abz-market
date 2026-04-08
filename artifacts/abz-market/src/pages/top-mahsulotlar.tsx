import { MobileLayout } from "@/components/layout/MobileLayout";
import { useProducts } from "@/hooks/use-api";
import { ProductCard } from "@/components/ui/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Flame, TrendingUp, Package, Crown } from "lucide-react";

export default function TopMahsulotlar() {
  const { data, isLoading } = useProducts({ limit: 200 });
  const products = data?.products ?? [];

  const featured   = products.filter((p) => p.isFeatured);
  const topSelling = products.filter((p) => p.isTopSelling && !p.isFeatured);

  return (
    <MobileLayout title="Top mahsulotlar" showBack>
      <div className="px-4 pb-6 space-y-5">

        {/* Hero */}
        <div className="flex items-center gap-3 bg-gradient-to-r from-rose-50 to-violet-50 dark:from-rose-950/30 dark:to-violet-950/30 rounded-2xl px-4 py-3 border border-rose-100/60 dark:border-rose-900/30">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-violet-600 flex items-center justify-center shrink-0">
            <Flame className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-sm text-foreground">Eng ommabop mahsulotlar</p>
            <p className="text-xs text-muted-foreground">Admin tavsiya etgan yetakchi mahsulotlar</p>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="aspect-square w-full rounded-2xl" />
                <Skeleton className="h-3 w-3/4 rounded" />
                <Skeleton className="h-3 w-1/2 rounded" />
              </div>
            ))}
          </div>
        ) : featured.length === 0 && topSelling.length === 0 ? (
          /* ── Empty state ── */
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center">
              <Package className="w-9 h-9 text-muted-foreground/40" />
            </div>
            <div className="text-center">
              <p className="font-bold text-lg text-foreground">Top mahsulotlar yo'q</p>
              <p className="text-sm text-muted-foreground mt-1.5 max-w-[240px] mx-auto">
                Hozircha admin birorta mahsulotni top sifatida belgilamagan
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Featured section */}
            {featured.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-violet-600 flex items-center justify-center">
                    <Crown className="w-3.5 h-3.5 text-white" />
                  </div>
                  <h2 className="font-bold text-base text-foreground">Featured</h2>
                  <span className="ml-auto text-xs text-muted-foreground">{featured.length} ta</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {featured.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              </div>
            )}

            {/* TOP selling section */}
            {topSelling.length > 0 && (
              <div className="space-y-3 mt-1">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-rose-500 flex items-center justify-center">
                    <TrendingUp className="w-3.5 h-3.5 text-white" />
                  </div>
                  <h2 className="font-bold text-base text-foreground">TOP — Ko'p sotilgan</h2>
                  <span className="ml-auto text-xs text-muted-foreground">{topSelling.length} ta</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {topSelling.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </MobileLayout>
  );
}
