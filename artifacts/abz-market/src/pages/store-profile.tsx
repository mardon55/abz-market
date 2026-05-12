import { useRoute } from "wouter";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { useStoreProfile, useProducts } from "@/hooks/use-api";
import { MapPin, Phone, Star, Package } from "lucide-react";
import { ProductCard } from "@/components/ui/ProductCard";

export default function StoreProfile() {
  const [, params] = useRoute("/store/:id");
  const { data: store, isLoading } = useStoreProfile(params?.id || "");
  const { data: products } = useProducts({ storeId: params?.id, limit: 500 } as any);

  if (isLoading || !store) return <MobileLayout showBack><div className="p-4">Yuklanmoqda...</div></MobileLayout>;

  return (
    <MobileLayout showBack hideNav transparentHeader>
      {/* Cover Image */}
      <div className="h-48 bg-muted relative -mt-14 w-full">
        <img 
          src={store.coverImage || `${import.meta.env.BASE_URL}images/store-cover.png`} 
          className="w-full h-full object-cover" 
          alt="Store Cover" 
        />
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      <div className="bg-background rounded-t-3xl -mt-6 relative z-20 px-4 pt-0 pb-10">
        {/* Profile Info */}
        <div className="flex justify-between items-end mb-4 transform -translate-y-10">
          <div className="w-24 h-24 rounded-full border-4 border-background overflow-hidden bg-white shadow-md">
            <img src={store.logo || `https://ui-avatars.com/api/?name=${store.name}&background=7C3AED&color=fff`} className="w-full h-full object-cover" alt="" />
          </div>
          <div className="bg-primary/10 text-primary px-3 py-1.5 rounded-lg text-xs font-bold mb-2">
            {store.type === 'manufacturer' ? 'Ishlab chiqaruvchi' : 'Rasmiy diler'}
          </div>
        </div>

        <div className="-mt-8 mb-6">
          <h1 className="font-display font-bold text-2xl mb-1">{store.name}</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">{store.description}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          <div className="bg-secondary/50 rounded-xl p-3 text-center border border-border/50">
            <Star className="w-5 h-5 text-warning mx-auto mb-1 fill-warning" />
            <p className="font-bold">{store.rating}</p>
            <p className="text-[10px] text-muted-foreground">Baho</p>
          </div>
          <div className="bg-secondary/50 rounded-xl p-3 text-center border border-border/50">
            <Package className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="font-bold">{store.productCount}</p>
            <p className="text-[10px] text-muted-foreground">Mahsulot</p>
          </div>
          <div className="bg-secondary/50 rounded-xl p-3 text-center border border-border/50">
            <div className="font-bold text-lg leading-tight mb-1 text-primary">{store.deliveryRate}%</div>
            <p className="text-[10px] text-muted-foreground">Yetkazish</p>
          </div>
        </div>


        {/* Store Products */}
        <div>
          <h2 className="font-display font-bold text-xl mb-4">Mahsulotlar</h2>
          <div className="grid grid-cols-2 gap-3">
            {products?.products.map(product => (
              <div key={product.id}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}
