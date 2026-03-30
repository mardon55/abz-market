import { MobileLayout } from "@/components/layout/MobileLayout";
import { useCartStore } from "@/store/cart-store";
import { formatPrice } from "@/lib/utils";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";

export default function Cart() {
  const { items, updateQuantity, removeItem, getTotal } = useCartStore();
  const [, navigate] = useLocation();
  const total = getTotal();

  if (items.length === 0) {
    return (
      <MobileLayout title="Savat" showBack>
        <div className="flex flex-col items-center justify-center h-[70vh] px-6 text-center">
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6">
            <ShoppingBag className="w-10 h-10 text-primary" />
          </div>
          <h2 className="font-display font-bold text-2xl mb-2">Savatingiz bo'sh</h2>
          <p className="text-muted-foreground mb-8">
            Hozircha savatga hech narsa qo'shmadingiz. Katalogdan mahsulotlarni tanlang.
          </p>
          <Link href="/catalog">
            <Button className="rounded-xl h-12 px-8 font-semibold shadow-lg shadow-primary/20">
              Katalogga o'tish
            </Button>
          </Link>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title="Savatcha" showBack hideNav>
      <div className="p-4 pb-40">
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="bg-card border border-border/50 rounded-2xl p-3 flex gap-4 shadow-sm">
              <div className="w-24 h-24 rounded-xl overflow-hidden bg-muted shrink-0">
                <img 
                  src={item.product.images?.[0] || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=200&q=80'} 
                  alt={item.product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 flex flex-col">
                <div className="flex justify-between items-start gap-2">
                  <h3 className="font-semibold text-sm leading-tight line-clamp-2">{item.product.name}</h3>
                  <button 
                    onClick={() => removeItem(item.id)}
                    className="p-1.5 text-muted-foreground hover:text-destructive transition-colors shrink-0 -mt-1 -mr-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="mt-1 flex gap-2">
                  {item.selectedColor && (
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full border border-border" style={{backgroundColor: item.selectedColor}} />
                      Rang
                    </span>
                  )}
                  {item.selectedSize && (
                    <span className="text-[10px] text-muted-foreground bg-secondary px-1.5 rounded">
                      {item.selectedSize}
                    </span>
                  )}
                </div>

                <div className="mt-auto flex items-center justify-between pt-2">
                  <span className="font-bold text-primary font-display">
                    {formatPrice(item.product.price)}
                  </span>
                  
                  <div className="flex items-center bg-secondary rounded-lg h-8">
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-full flex items-center justify-center text-foreground hover:text-primary active:scale-90"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-sm font-semibold w-6 text-center">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-full flex items-center justify-center text-foreground hover:text-primary active:scale-90"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Checkout Bottom Sheet */}
      <div className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto bg-card border-t border-border shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] rounded-t-3xl z-50">
        <div className="p-5 pb-safe">
          <div className="flex justify-between items-center mb-2">
            <span className="text-muted-foreground font-medium text-sm">Mahsulotlar soni:</span>
            <span className="font-semibold">{items.reduce((acc, i) => acc + i.quantity, 0)} ta</span>
          </div>
          <div className="flex justify-between items-center mb-5">
            <span className="text-foreground font-semibold">Jami summa:</span>
            <span className="font-display font-extrabold text-2xl text-primary">
              {formatPrice(total)}
            </span>
          </div>
          
          <Button 
            className="w-full h-14 rounded-xl font-bold text-base shadow-lg shadow-primary/25 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
            onClick={() => navigate("/checkout")}
          >
            Rasmiylashtirish
          </Button>
        </div>
      </div>
    </MobileLayout>
  );
}
