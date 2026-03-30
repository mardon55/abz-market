import { MobileLayout } from "@/components/layout/MobileLayout";
import { Link } from "wouter";
import { Search, ChevronRight, Bell } from "lucide-react";
import useEmblaCarousel from 'embla-carousel-react';
import { useCategories, useProducts } from "@/hooks/use-api";
import { ProductCard } from "@/components/ui/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [emblaRef] = useEmblaCarousel({ loop: true });
  const { data: categoriesData, isLoading: catLoading } = useCategories();
  const { data: productsData, isLoading: prodLoading } = useProducts({ featured: true });

  const banners = [
    { id: 1, image: `${import.meta.env.BASE_URL}images/hero-banner-1.png`, title: "Yozgi chegirmalar", subtitle: "20% gacha arzonlashdi" },
    { id: 2, image: `${import.meta.env.BASE_URL}images/hero-banner-2.png`, title: "Yangi kolleksiya", subtitle: "Premium oshxona mebellari" },
  ];

  return (
    <MobileLayout hideNav={false}>
      {/* Custom App Header */}
      <div className="px-4 pt-4 pb-2 flex justify-between items-center sticky top-0 bg-background/90 backdrop-blur-md z-40">
        <div>
          <h1 className="font-display font-bold text-2xl text-primary tracking-tight">ABZ Market</h1>
          <p className="text-xs text-muted-foreground font-medium">Mebel bozori cho'ntagingizda</p>
        </div>
        <button className="w-10 h-10 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center active:scale-95 transition-transform relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-destructive rounded-full border border-background"></span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="px-4 py-3">
        <Link href="/catalog">
          <div className="bg-secondary/50 border border-border/50 text-muted-foreground rounded-xl px-4 py-3.5 flex items-center gap-3 active:scale-[0.98] transition-all">
            <Search className="w-5 h-5" />
            <span className="text-sm font-medium">Katalog bo'yicha qidirish...</span>
          </div>
        </Link>
      </div>

      {/* Banner Carousel */}
      <div className="px-4 mb-8">
        <div className="overflow-hidden rounded-2xl shadow-sm" ref={emblaRef}>
          <div className="flex touch-pan-y">
            {banners.map((banner) => (
              <div key={banner.id} className="flex-[0_0_100%] min-w-0 relative">
                <div className="aspect-[16/8] relative w-full overflow-hidden">
                  <img 
                    src={banner.image} 
                    alt={banner.title} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-5">
                    <span className="text-primary-foreground/80 text-xs font-semibold uppercase tracking-wider mb-1">
                      {banner.subtitle}
                    </span>
                    <h2 className="text-white font-display font-bold text-xl leading-tight">
                      {banner.title}
                    </h2>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="px-4 mb-8">
        <div className="flex justify-between items-end mb-4">
          <h2 className="font-display font-bold text-lg">Kategoriyalar</h2>
          <Link href="/catalog" className="text-primary text-sm font-medium flex items-center hover:underline">
            Barchasi <ChevronRight className="w-4 h-4 ml-0.5" />
          </Link>
        </div>
        
        {catLoading ? (
          <div className="grid grid-cols-3 gap-3">
            {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-24 rounded-2xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {categoriesData?.categories.slice(0, 6).map((cat) => (
              <Link key={cat.id} href={`/catalog?category=${cat.id}`} className="flex flex-col items-center gap-2 group tap-highlight-transparent">
                <div className="w-full aspect-square bg-secondary rounded-2xl flex items-center justify-center p-4 border border-transparent group-hover:border-primary/20 group-hover:bg-primary/5 transition-colors active:scale-95">
                  {/* Using generic placeholders since specific dynamic icons require complex setup */}
                  <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold font-display text-xs">
                    {cat.name.substring(0, 2)}
                  </div>
                </div>
                <span className="text-[11px] font-medium text-center leading-tight">{cat.name}</span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Top Products */}
      <div className="px-4 mb-6">
        <div className="flex justify-between items-end mb-4">
          <h2 className="font-display font-bold text-lg">Top Mahsulotlar</h2>
          <Link href="/catalog?featured=true" className="text-primary text-sm font-medium flex items-center hover:underline">
            Ko'proq <ChevronRight className="w-4 h-4 ml-0.5" />
          </Link>
        </div>

        {prodLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {[1,2].map(i => <Skeleton key={i} className="h-64 rounded-2xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {productsData?.products.slice(0, 4).map(product => (
              <div key={product.id}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Banner Strip */}
      <div className="px-4 mb-8">
        <div className="bg-gradient-to-r from-primary to-accent-foreground rounded-2xl p-5 text-white flex justify-between items-center overflow-hidden relative shadow-lg shadow-primary/20">
          <div className="absolute right-[-20%] top-[-50%] w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <div className="relative z-10">
            <h3 className="font-display font-bold text-lg mb-1">Hamkor bo'ling</h3>
            <p className="text-xs text-white/80 max-w-[200px] mb-3">Mebellaringizni biz bilan butun O'zbekistonga soting</p>
            <Link href="/register-store">
              <Button size="sm" variant="secondary" className="rounded-full font-semibold text-xs h-8">
                Ro'yxatdan o'tish
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}
