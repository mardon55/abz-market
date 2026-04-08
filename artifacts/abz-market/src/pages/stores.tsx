import { MobileLayout } from "@/components/layout/MobileLayout";
import { useStores } from "@/hooks/use-api";
import { Store as StoreIcon, Star, ChevronRight, Package, BadgeCheck } from "lucide-react";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";

export default function Stores() {
  const { data, isLoading } = useStores();

  // Show only approved (partner) stores in public view
  const approvedStores = (data?.stores ?? []).filter(
    (s: any) => s.type === "partner" || s.isVerified === true
  );

  return (
    <MobileLayout title="Do'konlar" showBack>
      <div className="p-4 space-y-3">

        {/* Header */}
        <div className="mb-2">
          <p className="text-sm text-muted-foreground">
            Tasdiqlangan hamkor do'konlar
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24 rounded-2xl" />
            ))}
          </div>
        ) : approvedStores.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <StoreIcon className="w-9 h-9 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-base">Hali do'konlar yo'q</h3>
            <p className="text-sm text-muted-foreground mt-1">Tez orada hamkor do'konlar qo'shiladi</p>
          </div>
        ) : (
          approvedStores.map((store: any) => (
            <Link key={store.id} href={`/store/${store.id}`} className="block">
              <div className="glass-card rounded-2xl p-4 shadow-ios-sm active:scale-[0.98] transition-transform flex items-center gap-4">
                {/* Logo */}
                <div className="w-16 h-16 rounded-2xl bg-secondary overflow-hidden shrink-0 shadow-sm">
                  <img
                    src={store.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(store.name)}&background=7C3AED&color=fff&bold=true&size=128`}
                    className="w-full h-full object-cover"
                    alt={store.name}
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <h3 className="font-display font-bold text-base truncate">{store.name}</h3>
                    <BadgeCheck className="w-4 h-4 text-primary shrink-0" />
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    {store.rating && (
                      <>
                        <span className="flex items-center text-amber-500 font-semibold">
                          <Star className="w-3.5 h-3.5 fill-amber-500 mr-0.5" />
                          {Number(store.rating).toFixed(1)}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-border" />
                      </>
                    )}
                    <span className="flex items-center gap-1">
                      <Package className="w-3 h-3" />
                      {store.productCount ?? 0} ta mahsulot
                    </span>
                  </div>
                  {store.location && (
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{store.location}</p>
                  )}
                </div>

                <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
              </div>
            </Link>
          ))
        )}
      </div>
    </MobileLayout>
  );
}
