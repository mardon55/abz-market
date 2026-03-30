import { useState } from "react";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { Search, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import { useProducts, useCategories } from "@/hooks/use-api";
import { ProductCard } from "@/components/ui/ProductCard";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function Catalog() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  
  const { data: categories } = useCategories();
  const { data: productsData, isLoading } = useProducts({ 
    search: searchQuery || undefined,
    categoryId: activeCategory || undefined
  });

  return (
    <MobileLayout hideNav={false} title="Katalog" showBack>
      {/* Search and Filter Bar */}
      <div className="sticky top-14 z-40 bg-background/95 backdrop-blur-md px-4 py-3 border-b border-border/50">
        <div className="flex gap-2 mb-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Mahsulot qidirish..." 
              className="pl-9 bg-secondary/50 border-none h-11 rounded-xl focus-visible:ring-primary/20"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="h-11 w-11 rounded-xl bg-secondary/50 border-none shrink-0 text-foreground">
                <SlidersHorizontal className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[80vh] rounded-t-3xl sm:max-w-md mx-auto">
              <SheetHeader className="text-left pb-4 border-b border-border">
                <SheetTitle className="font-display font-bold">Filtrlash</SheetTitle>
              </SheetHeader>
              <div className="py-4 space-y-6 overflow-y-auto h-full pb-20">
                {/* Mock Filter Sections */}
                <div>
                  <h4 className="font-semibold mb-3">Narx</h4>
                  <div className="flex items-center gap-3">
                    <Input placeholder="Dan" type="number" className="rounded-xl" />
                    <span className="text-muted-foreground">-</span>
                    <Input placeholder="Gacha" type="number" className="rounded-xl" />
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3">Rang</h4>
                  <div className="flex flex-wrap gap-3">
                    {['#FFFFFF', '#000000', '#8B5A2B', '#1E293B', '#F59E0B'].map(color => (
                      <button 
                        key={color} 
                        className="w-8 h-8 rounded-full border-2 border-border/50 shadow-sm focus:ring-2 focus:ring-primary focus:ring-offset-2"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">O'lcham</h4>
                  <div className="flex flex-wrap gap-2">
                    {['Kichik', 'Standart', 'Katta', 'M', 'L', 'XL'].map(size => (
                      <Badge key={size} variant="outline" className="px-3 py-1.5 rounded-lg text-sm cursor-pointer hover:bg-secondary">
                        {size}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-background border-t border-border">
                <Button className="w-full rounded-xl py-6 font-semibold">Natijalarni ko'rish</Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Categories Horizontal Scroll */}
        <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-1 -mx-4 px-4">
          <button 
            onClick={() => setActiveCategory(null)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
              activeCategory === null 
                ? 'bg-primary text-primary-foreground border-primary' 
                : 'bg-background text-foreground border-border hover:bg-secondary'
            }`}
          >
            Barchasi
          </button>
          {categories?.categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                activeCategory === cat.id 
                  ? 'bg-primary text-primary-foreground border-primary' 
                  : 'bg-background text-foreground border-border hover:bg-secondary'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-muted-foreground font-medium">
            {productsData?.total || 0} ta mahsulot topildi
          </p>
          <Button variant="ghost" size="sm" className="h-8 text-xs font-medium px-2 text-muted-foreground">
            <ArrowUpDown className="w-3.5 h-3.5 mr-1" /> Arzonlari oldin
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-64 rounded-2xl" />)}
          </div>
        ) : productsData?.products.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg">Hech narsa topilmadi</h3>
            <p className="text-sm text-muted-foreground mt-1">Boshqa so'z bilan qidirib ko'ring</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {productsData?.products.map(product => (
              <div key={product.id}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </div>
    </MobileLayout>
  );
}

// Temporary internal Badge for Catalog
function Badge({ children, className, variant = "default" }: any) {
  const base = "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";
  const variants = {
    default: "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
    outline: "text-foreground",
  };
  return <div className={`${base} ${variants[variant as keyof typeof variants]} ${className}`}>{children}</div>;
}
