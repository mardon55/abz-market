import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { ProductCard } from "@/components/ui/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Zap, Package, Clock } from "lucide-react";

interface FlashProduct {
  id: string; name: string; price: string; oldPrice: string | null;
  images: string[] | null; discount: number | null; isFeatured: boolean;
  isTopSelling: boolean; rating: string; reviewCount: number;
  storeName: string | null; categoryName: string | null; salesCount: number;
  colors: string[] | null; sizes: string[] | null; description: string | null;
  storeId: string; categoryId: string | null; status: string;
}
interface FlashSale {
  id: string; title: string; endsAt: string; isActive: boolean;
  products: FlashProduct[];
}

function pad(n: number) { return String(n).padStart(2, "0"); }

function Countdown({ endsAt }: { endsAt: string }) {
  const [diff, setDiff] = useState(() => Math.max(0, new Date(endsAt).getTime() - Date.now()));
  useEffect(() => {
    const t = setInterval(() => setDiff(Math.max(0, new Date(endsAt).getTime() - Date.now())), 1000);
    return () => clearInterval(t);
  }, [endsAt]);
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  if (diff === 0) return <span className="text-red-500 font-bold text-sm">Tugadi</span>;
  return (
    <div className="flex items-center gap-1.5">
      {[pad(h), pad(m), pad(s)].map((v, i) => (
        <span key={i} className="flex items-center gap-1">
          <span className="bg-white/20 backdrop-blur-sm px-2 py-1 rounded-lg font-mono font-bold text-base text-white">
            {v}
          </span>
          {i < 2 && <span className="text-white/80 font-bold">:</span>}
        </span>
      ))}
    </div>
  );
}

export default function FlashSalePage() {
  const { data, isLoading } = useQuery<{ flashSales: FlashSale[] }>({
    queryKey: ["/api/flash-sales"],
    queryFn: () => fetch("/api/flash-sales").then((r) => r.json()),
    staleTime: 5_000,
    refetchInterval: 15_000,
  });

  const now = new Date();
  const activeSale = (data?.flashSales ?? []).find(
    (s) => s.isActive && new Date(s.endsAt) > now
  ) ?? null;

  return (
    <MobileLayout title="Flash Sale" showBack>
      <div className="pb-6">
        {isLoading ? (
          <div className="px-4 space-y-4 mt-2">
            <Skeleton className="h-24 rounded-2xl w-full" />
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="aspect-square rounded-2xl" />
                  <Skeleton className="h-3 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              ))}
            </div>
          </div>
        ) : !activeSale ? (
          /* ── Empty state ── */
          <div className="flex flex-col items-center justify-center py-24 gap-4 px-4">
            <div className="w-20 h-20 rounded-full bg-orange-50 flex items-center justify-center">
              <Zap className="w-9 h-9 text-orange-300" />
            </div>
            <div className="text-center">
              <p className="font-bold text-lg text-foreground">Hozircha flash sale yo'q</p>
              <p className="text-sm text-muted-foreground mt-1.5 max-w-[240px] mx-auto">
                Admin yangi flash sale qo'shganda bu yerda paydo bo'ladi
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Header banner */}
            <div className="mx-4 mt-2 mb-4 bg-gradient-to-r from-orange-500 via-rose-500 to-red-500 rounded-2xl p-4 text-white shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 bg-white/20 rounded-xl flex items-center justify-center">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-base leading-none">{activeSale.title}</p>
                  <p className="text-xs text-white/70 mt-0.5">Chegirmali mahsulotlar</p>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <Clock className="w-4 h-4 text-white/70" />
                <span className="text-xs text-white/80 mr-1">Tugashiga:</span>
                <Countdown endsAt={activeSale.endsAt} />
              </div>
            </div>

            {/* Products */}
            {activeSale.products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3 px-4">
                <Package className="w-10 h-10 text-muted-foreground/30" />
                <p className="text-muted-foreground text-sm text-center">
                  Bu flash salega mahsulot qo'shilmagan
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 px-4">
                {activeSale.products.map((p) => (
                  <ProductCard key={p.id} product={p as any} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </MobileLayout>
  );
}
