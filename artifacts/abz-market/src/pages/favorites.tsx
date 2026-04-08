import { useMemo } from "react";
import { useLocation } from "wouter";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { useFavoritesStore } from "@/store/favorites-store";
import { useProducts } from "@/hooks/use-api";
import { ProductCard } from "@/components/ui/ProductCard";
import { Heart, ShoppingBag } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { hapticFeedback } from "@/hooks/use-telegram";

export default function Favorites() {
  const [, navigate] = useLocation();
  const { favorites } = useFavoritesStore();
  const { data, isLoading } = useProducts({}, { enabled: favorites.length > 0 });

  const favoriteProducts = useMemo(() => {
    if (!data?.products) return [];
    return data.products.filter((p) => favorites.includes(p.id));
  }, [data?.products, favorites]);

  return (
    <MobileLayout title="Sevimlilar" showBack>
      {favorites.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-5">
            <Heart className="w-10 h-10 text-red-300" />
          </div>
          <h2 className="font-display font-bold text-xl mb-2">Sevimlilar bo'sh</h2>
          <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
            Yoqtirgan mahsulotlaringizni ❤️ bosib saqlang — bu yerda ko'rinadi
          </p>
          <button
            onClick={() => { hapticFeedback("selection"); navigate("/catalog"); }}
            className="flex items-center gap-2 bg-primary text-white font-bold px-6 py-3 rounded-2xl shadow-lg shadow-primary/25"
          >
            <ShoppingBag className="w-4 h-4" />
            Katalogga o'tish
          </button>
        </div>
      ) : (
        <div className="p-4">
          <p className="text-sm text-muted-foreground mb-4">
            {favorites.length} ta sevimli mahsulot
          </p>
          {isLoading ? (
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-64 rounded-2xl" />
              ))}
            </div>
          ) : favoriteProducts.length === 0 ? (
            <div className="space-y-3">
              {/* Products were deleted — show placeholder */}
              <p className="text-center text-muted-foreground py-8 text-sm">
                Saqlangan mahsulotlar topilmadi
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {favoriteProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      )}
    </MobileLayout>
  );
}
