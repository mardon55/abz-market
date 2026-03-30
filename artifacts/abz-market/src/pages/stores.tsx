import { MobileLayout } from "@/components/layout/MobileLayout";
import { useStores } from "@/hooks/use-api";
import { Store as StoreIcon, Star, ChevronRight } from "lucide-react";
import { Link } from "wouter";

export default function Stores() {
  const { data, isLoading } = useStores();

  return (
    <MobileLayout title="Do'konlar" showBack>
      <div className="p-4 space-y-4">
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          data?.stores.map(store => (
            <Link key={store.id} href={`/store/${store.id}`} className="block tap-highlight-transparent">
              <div className="bg-card border border-border/50 rounded-2xl p-4 shadow-sm active:scale-[0.98] transition-transform flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-secondary overflow-hidden shrink-0">
                  <img src={store.logo || `https://ui-avatars.com/api/?name=${store.name}&background=7C3AED&color=fff`} className="w-full h-full object-cover" alt="" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-bold text-base truncate mb-1">{store.name}</h3>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center text-warning font-medium">
                      <Star className="w-3.5 h-3.5 fill-warning mr-1" /> {store.rating}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-border" />
                    <span>{store.productCount} mahsulot</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </div>
            </Link>
          ))
        )}
      </div>
    </MobileLayout>
  );
}
