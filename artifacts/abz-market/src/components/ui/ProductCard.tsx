import { Link } from "wouter";
import { Heart, Star, ShoppingCart } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";
import type { Product } from "@workspace/api-client-react/src/generated/api.schemas";
import { toast } from "@/hooks/use-toast";
import { Badge } from "./badge";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1, product.colors?.[0], product.sizes?.[0]);
    toast({
      title: "Savatga qo'shildi",
      description: `${product.name} savatga tushdi.`,
      duration: 2000,
    });
  };

  return (
    <Link href={`/product/${product.id}`} className="group block h-full tap-highlight-transparent">
      <div className="bg-card border border-border/50 rounded-2xl overflow-hidden h-full flex flex-col hover:shadow-lg hover:border-primary/20 transition-all duration-300 active:scale-[0.98]">
        {/* Image Section */}
        <div className="relative aspect-square overflow-hidden bg-muted/30">
          <img 
            src={product.images?.[0] || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80'} 
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1.5">
            {product.isTopSelling && (
              <Badge className="bg-destructive/90 text-destructive-foreground hover:bg-destructive shadow-sm text-[10px] px-1.5 py-0 h-5">
                TOP
              </Badge>
            )}
            {product.discount ? (
              <Badge className="bg-primary/90 text-primary-foreground hover:bg-primary shadow-sm text-[10px] px-1.5 py-0 h-5">
                -{product.discount}%
              </Badge>
            ) : null}
          </div>

          <button className="absolute top-2 right-2 p-1.5 rounded-full bg-background/50 backdrop-blur-md text-foreground/70 hover:text-destructive hover:bg-background transition-colors shadow-sm">
            <Heart className="w-4 h-4" />
          </button>
        </div>

        {/* Content Section */}
        <div className="p-3 flex flex-col flex-1">
          <div className="flex items-center gap-1 mb-1">
            <Star className="w-3 h-3 fill-warning text-warning" />
            <span className="text-[11px] font-medium text-muted-foreground">{product.rating}</span>
            <span className="text-[10px] text-muted-foreground/60 ml-1">({product.reviewCount})</span>
          </div>
          
          <h3 className="text-sm font-medium leading-tight mb-2 line-clamp-2 group-hover:text-primary transition-colors text-foreground">
            {product.name}
          </h3>
          
          <div className="mt-auto pt-2">
            {product.oldPrice && (
              <p className="text-[11px] text-muted-foreground line-through mb-0.5">
                {formatPrice(product.oldPrice)}
              </p>
            )}
            <div className="flex items-center justify-between">
              <p className="text-base font-bold text-foreground font-display">
                {formatPrice(product.price)}
              </p>
              <button 
                onClick={handleAddToCart}
                className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-colors active:scale-90 shrink-0"
              >
                <ShoppingCart className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
