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
import { CheckCircle2 } from "lucide-react";

const checkoutSchema = z.object({
  customerName: z.string().min(3, "Ism kamida 3ta harfdan iborat bo'lishi kerak"),
  customerPhone: z.string().min(9, "To'g'ri telefon raqam kiriting"),
  address: z.string().min(5, "Manzilni to'liq kiriting"),
  comment: z.string().optional(),
  paymentMethod: z.enum(["cash", "card", "installment"]),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

export default function Checkout() {
  const { items, getTotal, clearCart } = useCartStore();
  const createOrder = useSubmitOrder();
  const [, navigate] = useLocation();

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      paymentMethod: "cash"
    }
  });

  const paymentMethod = watch("paymentMethod");

  const onSubmit = async (data: CheckoutForm) => {
    if (items.length === 0) return;

    try {
      await createOrder.mutateAsync({
        ...data,
        items: items.map(i => ({
          productId: i.product.id,
          quantity: i.quantity,
          color: i.selectedColor
        }))
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
      <div className="p-4 pb-32">
        <form id="checkout-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          <div className="bg-card rounded-2xl p-4 border border-border shadow-sm space-y-4">
            <h3 className="font-semibold border-b border-border/50 pb-2">Shaxsiy ma'lumotlar</h3>
            
            <div className="space-y-1.5">
              <Label htmlFor="name">Ism va Familiya</Label>
              <Input id="name" {...register("customerName")} placeholder="Alisher Usmonov" className="rounded-xl h-12 bg-secondary/50 border-none" />
              {errors.customerName && <p className="text-xs text-destructive">{errors.customerName.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone">Telefon raqam</Label>
              <Input id="phone" type="tel" {...register("customerPhone")} placeholder="+998 90 123 45 67" className="rounded-xl h-12 bg-secondary/50 border-none" />
              {errors.customerPhone && <p className="text-xs text-destructive">{errors.customerPhone.message}</p>}
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="address">Yetkazib berish manzili</Label>
              <Textarea id="address" {...register("address")} placeholder="Toshkent sh., Yunusobod..." className="rounded-xl bg-secondary/50 border-none resize-none" rows={3} />
              {errors.address && <p className="text-xs text-destructive">{errors.address.message}</p>}
            </div>
          </div>

          <div className="bg-card rounded-2xl p-4 border border-border shadow-sm space-y-4">
            <h3 className="font-semibold border-b border-border/50 pb-2">To'lov usuli</h3>
            
            <div className="grid grid-cols-1 gap-2">
              {[
                { id: "cash", label: "Naqd pul" },
                { id: "card", label: "Karta orqali" },
                { id: "installment", label: "Bo'lib to'lash" }
              ].map(method => (
                <div 
                  key={method.id}
                  onClick={() => setValue("paymentMethod", method.id as any)}
                  className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all cursor-pointer ${
                    paymentMethod === method.id ? "border-primary bg-primary/5" : "border-transparent bg-secondary/50"
                  }`}
                >
                  <span className="font-medium text-sm">{method.label}</span>
                  {paymentMethod === method.id && <CheckCircle2 className="w-5 h-5 text-primary" />}
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-card rounded-2xl p-4 border border-border shadow-sm space-y-1.5">
             <Label htmlFor="comment">Qo'shimcha izoh (ixtiyoriy)</Label>
             <Input id="comment" {...register("comment")} placeholder="Masalan: Uyga kirish orqa tarafdan" className="rounded-xl h-12 bg-secondary/50 border-none" />
          </div>

        </form>
      </div>

      <div className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto bg-card border-t border-border p-4 pb-safe z-50">
        <div className="flex justify-between items-center mb-3">
          <span className="font-semibold">Jami to'lov:</span>
          <span className="font-display font-bold text-xl text-primary">{formatPrice(getTotal())}</span>
        </div>
        <Button 
          type="submit" 
          form="checkout-form"
          disabled={createOrder.isPending}
          className="w-full h-14 rounded-xl font-bold shadow-lg shadow-primary/25 text-base"
        >
          {createOrder.isPending ? "Buyurtma berilmoqda..." : "Buyurtmani tasdiqlash"}
        </Button>
      </div>
    </MobileLayout>
  );
}
