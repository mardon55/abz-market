import { useState } from "react";
import { useRoute, Link, useLocation } from "wouter";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { useProduct } from "@/hooks/use-api";
import { Heart, Share2, Star, ChevronRight, Store, ShieldCheck, Truck } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import useEmblaCarousel from "embla-carousel-react";
import { useCartStore } from "@/store/cart-store";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

export default function ProductDetail() {
  const [, params] = useRoute("/product/:id");
  const { data: product, isLoading } = useProduct(params?.id || "");
  const [, navigate] = useLocation();
  
  const [emblaRef, emblaApi] = useEmblaCarousel();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string | undefined>();
  const [selectedSize, setSelectedSize] = useState<string | undefined>();
  
  const addItem = useCartStore(state => state.addItem);

  // Sync embla selection
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useState(() => {
    if (!emblaApi) return;
    emblaApi.on("select", () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    });
  });

  if (isLoading) {
    return <MobileLayout showBack><div className="p-4">Yuklanmoqda...</div></MobileLayout>;
  }

  if (!product) return <MobileLayout showBack><div className="p-4">Mahsulot topilmadi</div></MobileLayout>;

  // Initialize selections
  if (!selectedColor && product.colors?.length) setSelectedColor(product.colors[0]);
  if (!selectedSize && product.sizes?.length) setSelectedSize(product.sizes[0]);

  const handleAddToCart = () => {
    addItem(product, 1, selectedColor, selectedSize);
    toast({
      title: "Savatga qo'shildi",
      description: "Mahsulot muvaffaqiyatli savatga tushdi.",
    });
  };

  const handleFastOrder = () => {
    addItem(product, 1, selectedColor, selectedSize);
    navigate("/cart");
  };

  return (
    <MobileLayout hideNav transparentHeader showBack headerRight={
      <div className="flex gap-2">
        <button className="w-9 h-9 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center text-white active:scale-95">
          <Share2 className="w-4 h-4" />
        </button>
        <button className="w-9 h-9 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center text-white active:scale-95">
          <Heart className="w-4 h-4" />
        </button>
      </div>
    }>
      {/* Image Gallery */}
      <div className="bg-muted relative -mt-14 pt-0 aspect-[4/5] w-full">
        <div className="overflow-hidden h-full" ref={emblaRef}>
          <div className="flex h-full">
            {(product.images?.length ? product.images : ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80']).map((img, i) => (
              <div key={i} className="flex-[0_0_100%] min-w-0 h-full relative">
                <img src={img} alt="" className="w-full h-full object-cover" />
                {/* Gradient overlay for header visibility */}
                <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-black/40 to-transparent"></div>
              </div>
            ))}
          </div>
        </div>
        {/* Pagination Dots */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 z-10">
          {product.images?.map((_, i) => (
            <div 
              key={i} 
              className={`h-1.5 rounded-full transition-all duration-300 ${i === selectedIndex ? 'w-5 bg-primary' : 'w-1.5 bg-white/50'}`}
            />
          ))}
        </div>
      </div>

      <div className="bg-background rounded-t-3xl -mt-6 relative z-20 px-4 pt-6 pb-24">
        {/* Title & Price */}
        <div className="mb-6">
          <div className="flex justify-between items-start mb-2">
            <h1 className="font-display font-bold text-2xl leading-tight text-foreground pr-4">
              {product.name}
            </h1>
            <div className="flex items-center gap-1 bg-warning/10 text-warning px-2 py-1 rounded-lg shrink-0 mt-1">
              <Star className="w-4 h-4 fill-warning" />
              <span className="font-bold text-sm">{product.rating}</span>
            </div>
          </div>
          
          <div className="flex items-end gap-3 mt-4">
            <span className="font-display font-extrabold text-3xl text-primary">
              {formatPrice(product.price)}
            </span>
            {product.oldPrice && (
              <span className="text-muted-foreground line-through text-sm mb-1 font-medium">
                {formatPrice(product.oldPrice)}
              </span>
            )}
            {product.discount && (
              <span className="bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 rounded-md mb-1 ml-auto">
                -{product.discount}%
              </span>
            )}
          </div>
        </div>

        {/* Variants Selection */}
        <div className="space-y-5 mb-8 border-y border-border/50 py-5">
          {product.colors && product.colors.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-3">Rang:</h3>
              <div className="flex flex-wrap gap-3">
                {product.colors.map(color => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-10 h-10 rounded-full border-2 transition-all ${selectedColor === color ? 'border-primary scale-110 shadow-md' : 'border-border/50'}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          )}

          {product.sizes && product.sizes.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-3">O'lcham:</h3>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all border ${
                      selectedSize === size 
                        ? 'bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20' 
                        : 'bg-background text-foreground border-border hover:bg-secondary'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Store Info Mini Card */}
        <Link href={`/store/${product.storeId}`} className="block mb-6">
          <div className="bg-secondary/50 rounded-2xl p-4 flex items-center gap-3 active:scale-[0.98] transition-transform">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary shrink-0">
              <Store className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-sm">{product.storeName}</h4>
              <p className="text-xs text-muted-foreground mt-0.5">Rasmiy do'kon</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </div>
        </Link>

        {/* Features list */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          <div className="bg-secondary/30 border border-border/50 rounded-xl p-3 flex items-start gap-2">
            <ShieldCheck className="w-5 h-5 text-success shrink-0" />
            <div>
              <p className="text-[11px] text-muted-foreground font-medium mb-0.5">Kafolat</p>
              <p className="text-xs font-semibold">{product.warranty || "1 yil"}</p>
            </div>
          </div>
          <div className="bg-secondary/30 border border-border/50 rounded-xl p-3 flex items-start gap-2">
            <Truck className="w-5 h-5 text-primary shrink-0" />
            <div>
              <p className="text-[11px] text-muted-foreground font-medium mb-0.5">Yetkazish</p>
              <p className="text-xs font-semibold">{product.deliveryDays} kun ichida</p>
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <h3 className="font-display font-bold text-lg mb-3">Tavsif</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {product.description}
            <br/><br/>
            <strong>O'lchamlari:</strong> {product.dimensions}
          </p>
        </div>
      </div>

      {/* Fixed Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto bg-background/90 backdrop-blur-xl border-t border-border/50 p-4 pb-safe z-50">
        <div className="flex gap-3">
          <Button 
            variant="secondary" 
            className="flex-1 rounded-xl h-14 font-semibold text-sm bg-secondary text-foreground hover:bg-secondary/80"
            onClick={handleAddToCart}
          >
            Savatga qo'shish
          </Button>
          <Button 
            className="flex-1 rounded-xl h-14 font-semibold text-sm shadow-lg shadow-primary/25"
            onClick={handleFastOrder}
          >
            Tez buyurtma
          </Button>
        </div>
      </div>
    </MobileLayout>
  );
}
