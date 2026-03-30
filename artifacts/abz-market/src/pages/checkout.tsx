import { useState, useEffect } from "react";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { useCartStore } from "@/store/cart-store";
import { useSubmitOrder } from "@/hooks/use-api";
import { formatPrice } from "@/lib/utils";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckCircle2, CreditCard, Banknote, LayoutGrid, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────
interface PaymentCard {
  id: string;
  bankName: string;
  cardNumber: string;
  cardHolder: string;
  expiry: string;
  gradient: string;
  textColor: string;
  logo: string;
  isActive: boolean;
}

function loadAdminCards(): PaymentCard[] {
  try {
    const raw = localStorage.getItem("abz_payment_cards");
    const all: PaymentCard[] = raw ? JSON.parse(raw) : [];
    return all.filter((c) => c.isActive);
  } catch { return []; }
}

// ── Card visual ───────────────────────────────────────────────────────────────
function MiniCard({ card, selected, onClick }: { card: PaymentCard; selected: boolean; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "relative cursor-pointer rounded-2xl overflow-hidden transition-all border-2",
        selected ? "border-primary scale-[1.02] shadow-lg shadow-primary/20" : "border-transparent"
      )}
    >
      <div className={cn("bg-gradient-to-br p-4 h-32", card.gradient)}>
        {/* Decorative circles */}
        <div className="absolute -top-4 -right-4 w-16 h-16 bg-white/10 rounded-full" />
        <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-white/10 rounded-full" />

        <div className="relative h-full flex flex-col justify-between">
          {/* Bank name + logo */}
          <div className="flex items-center justify-between">
            <span className={cn("text-xs font-bold tracking-wide", card.textColor)}>{card.bankName}</span>
            <span className="text-base">{card.logo}</span>
          </div>

          {/* Full card number */}
          <div className={cn("font-mono text-[11px] font-bold tracking-widest", card.textColor)}>
            {card.cardNumber || "•••• •••• •••• ••••"}
          </div>

          {/* Cardholder + expiry */}
          <div className="flex items-end justify-between">
            <span className={cn("text-[10px] font-semibold uppercase tracking-wide truncate max-w-[60%]", card.textColor)}>
              {card.cardHolder}
            </span>
            <span className={cn("text-[10px] font-mono opacity-80", card.textColor)}>{card.expiry}</span>
          </div>
        </div>
      </div>

      {/* Selected checkmark */}
      {selected && (
        <div className="absolute top-2 right-2 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow">
          <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
        </div>
      )}
    </div>
  );
}

// ── Schema & form ─────────────────────────────────────────────────────────────
const checkoutSchema = z.object({
  customerName:  z.string().min(3, "Ism kamida 3ta harfdan iborat bo'lishi kerak"),
  customerPhone: z.string().min(9, "To'g'ri telefon raqam kiriting"),
  address:       z.string().min(5, "Manzilni to'liq kiriting"),
  comment:       z.string().optional(),
  paymentMethod: z.enum(["cash", "card", "installment"]),
});
type CheckoutForm = z.infer<typeof checkoutSchema>;

const PAYMENT_METHODS = [
  { id: "cash",        label: "Naqd pul",     icon: Banknote,    desc: "Yetkazib berishda to'lang" },
  { id: "card",        label: "Karta orqali", icon: CreditCard,  desc: "Bank kartasi bilan to'lash" },
  { id: "installment", label: "Bo'lib to'lash", icon: LayoutGrid, desc: "Oylik to'lovlarga bo'lish" },
];

// ── Main component ────────────────────────────────────────────────────────────
export default function Checkout() {
  const { items, getTotal, clearCart } = useCartStore();
  const createOrder = useSubmitOrder();
  const [, navigate]    = useLocation();
  const [adminCards, setAdminCards] = useState<PaymentCard[]>([]);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  useEffect(() => {
    setAdminCards(loadAdminCards());
  }, []);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { paymentMethod: "cash" },
  });

  const paymentMethod = watch("paymentMethod");

  const onSubmit = async (data: CheckoutForm) => {
    if (items.length === 0) return;
    try {
      await createOrder.mutateAsync({
        ...data,
        items: items.map((i) => ({
          productId:    i.product.id,
          quantity:     i.quantity,
          color:        i.selectedColor,
        })),
      });
      clearCart();
      navigate("/orders");
    } catch (error) {
      console.error("Order error", error);
    }
  };

  if (items.length === 0 && !createOrder.isSuccess) {
    navigate("/cart");
    return null;
  }

  return (
    <MobileLayout title="Buyurtma berish" showBack hideNav>
      <div className="p-4 pb-36">
        <form id="checkout-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">

          {/* Personal info */}
          <div className="glass-card rounded-2xl p-4 shadow-ios-sm space-y-4">
            <h3 className="font-display font-semibold text-base border-b border-white/20 pb-2">Shaxsiy ma'lumotlar</h3>

            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-semibold text-muted-foreground">Ism va Familiya</Label>
              <Input
                id="name"
                {...register("customerName")}
                placeholder="Alisher Usmonov"
                className="rounded-xl h-11 bg-white/30 border-white/30 focus:border-primary/50"
              />
              {errors.customerName && <p className="text-xs text-destructive">{errors.customerName.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-xs font-semibold text-muted-foreground">Telefon raqam</Label>
              <Input
                id="phone"
                type="tel"
                {...register("customerPhone")}
                placeholder="+998 90 123 45 67"
                className="rounded-xl h-11 bg-white/30 border-white/30 focus:border-primary/50"
              />
              {errors.customerPhone && <p className="text-xs text-destructive">{errors.customerPhone.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="address" className="text-xs font-semibold text-muted-foreground">Yetkazib berish manzili</Label>
              <Textarea
                id="address"
                {...register("address")}
                placeholder="Toshkent sh., Yunusobod tumani..."
                className="rounded-xl bg-white/30 border-white/30 focus:border-primary/50 resize-none"
                rows={2}
              />
              {errors.address && <p className="text-xs text-destructive">{errors.address.message}</p>}
            </div>
          </div>

          {/* Payment method */}
          <div className="glass-card rounded-2xl p-4 shadow-ios-sm space-y-3">
            <h3 className="font-display font-semibold text-base border-b border-white/20 pb-2">To'lov usuli</h3>

            <div className="space-y-2">
              {PAYMENT_METHODS.map(({ id, label, icon: Icon, desc }) => (
                <div
                  key={id}
                  onClick={() => {
                    setValue("paymentMethod", id as any);
                    if (id !== "card") setSelectedCard(null);
                  }}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer",
                    paymentMethod === id
                      ? "border-primary bg-primary/8"
                      : "border-white/30 bg-white/10 hover:bg-white/20"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                    paymentMethod === id ? "bg-primary/15" : "bg-white/20"
                  )}>
                    <Icon className={cn("w-5 h-5", paymentMethod === id ? "text-primary" : "text-muted-foreground")} />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{label}</p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                  {paymentMethod === id && <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />}
                </div>
              ))}
            </div>

            {/* Admin cards — shown when "karta orqali" is selected */}
            {paymentMethod === "card" && adminCards.length > 0 && (
              <div className="mt-1 pt-3 border-t border-white/20">
                <p className="text-xs font-semibold text-muted-foreground mb-2.5">Kartani tanlang:</p>
                <div className="grid grid-cols-2 gap-2">
                  {adminCards.map((card) => (
                    <MiniCard
                      key={card.id}
                      card={card}
                      selected={selectedCard === card.id}
                      onClick={() => setSelectedCard(card.id)}
                    />
                  ))}
                </div>
                {!selectedCard && (
                  <p className="text-xs text-amber-600 mt-2 font-medium">⚠️ Karta tanlanmagan</p>
                )}
              </div>
            )}

            {/* No cards notice */}
            {paymentMethod === "card" && adminCards.length === 0 && (
              <div className="mt-1 pt-3 border-t border-white/20">
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-amber-600 shrink-0" />
                  <p className="text-xs text-amber-700">Hozircha karta to'lov usuli mavjud emas. Admin bilan bog'laning.</p>
                </div>
              </div>
            )}

            {/* Installment notice */}
            {paymentMethod === "installment" && (
              <div className="mt-1 pt-3 border-t border-white/20 bg-blue-50 border border-blue-200 rounded-xl p-3">
                <p className="text-xs text-blue-700 font-medium">📋 Qo'shimcha hujjatlar talab etiladi. Operatorimiz siz bilan bog'lanadi.</p>
              </div>
            )}
          </div>

          {/* Comment */}
          <div className="glass-card rounded-2xl p-4 shadow-ios-sm">
            <Label htmlFor="comment" className="text-xs font-semibold text-muted-foreground block mb-1.5">
              Qo'shimcha izoh (ixtiyoriy)
            </Label>
            <Input
              id="comment"
              {...register("comment")}
              placeholder="Masalan: Uyga kirish orqa tarafdan"
              className="rounded-xl h-11 bg-white/30 border-white/30 focus:border-primary/50"
            />
          </div>

          {/* Order summary */}
          <div className="glass-card rounded-2xl p-4 shadow-ios-sm space-y-2">
            <h3 className="font-display font-semibold text-sm text-muted-foreground border-b border-white/20 pb-2">Buyurtma xulosasi</h3>
            {items.map((item) => (
              <div key={item.product.id} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground truncate max-w-[60%]">{item.product.name} × {item.quantity}</span>
                <span className="font-semibold">{formatPrice(item.product.price * item.quantity)}</span>
              </div>
            ))}
            <div className="flex items-center justify-between pt-2 border-t border-white/20">
              <span className="font-bold">Jami:</span>
              <span className="font-display font-extrabold text-primary text-lg">{formatPrice(getTotal())}</span>
            </div>
          </div>

        </form>
      </div>

      {/* Fixed bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto glass border-t border-white/30 p-4 pb-safe z-50">
        <Button
          type="submit"
          form="checkout-form"
          disabled={createOrder.isPending || (paymentMethod === "card" && adminCards.length > 0 && !selectedCard)}
          className="w-full h-14 rounded-2xl font-bold shadow-lg shadow-primary/25 text-base"
        >
          {createOrder.isPending ? "Buyurtma berilmoqda..." : `✅ Buyurtmani tasdiqlash · ${formatPrice(getTotal())}`}
        </Button>
      </div>
    </MobileLayout>
  );
}
