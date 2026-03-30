import { MobileLayout } from "@/components/layout/MobileLayout";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Store, FileText, CheckCircle } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

const storeSchema = z.object({
  name: z.string().min(3, "Do'kon nomi kiritilishi shart"),
  activityType: z.string().min(3, "Faoliyat turi kerak"),
  stir: z.string().optional(),
  location: z.string().min(5, "Manzil kerak"),
  phone: z.string().min(9, "Telefon kerak"),
  description: z.string().optional()
});

type StoreForm = z.infer<typeof storeSchema>;

export default function RegisterStore() {
  const [step, setStep] = useState(1);
  const [, navigate] = useLocation();

  const { register, handleSubmit, formState: { errors, isValid } } = useForm<StoreForm>({
    resolver: zodResolver(storeSchema),
    mode: "onChange"
  });

  const onSubmit = async (_data: StoreForm) => {
    setStep(3);
  };

  const StepIndicator = () => (
    <div className="flex justify-center items-center gap-2 mb-8">
      <div className={`w-3 h-3 rounded-full ${step >= 1 ? 'bg-primary scale-125' : 'bg-border'}`} />
      <div className={`w-8 h-1 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-border'}`} />
      <div className={`w-3 h-3 rounded-full ${step >= 2 ? 'bg-primary scale-125' : 'bg-border'}`} />
      <div className={`w-8 h-1 rounded-full ${step >= 3 ? 'bg-primary' : 'bg-border'}`} />
      <div className={`w-3 h-3 rounded-full ${step >= 3 ? 'bg-primary scale-125' : 'bg-border'}`} />
    </div>
  );

  return (
    <MobileLayout title="Sotuvchi bo'lish" showBack hideNav>
      <div className="p-6">
        
        {step < 3 && (
          <div className="text-center mb-8">
            <h2 className="font-display font-bold text-2xl mb-2">Platformaga qo'shiling</h2>
            <p className="text-muted-foreground text-sm">O'z mahsulotlaringizni butun O'zbekiston bo'ylab soting</p>
          </div>
        )}

        <StepIndicator />

        {step === 1 && (
          <div className="space-y-5 animate-in slide-in-from-right-4">
            <div className="space-y-1.5">
              <Label>Do'kon yoki brend nomi</Label>
              <Input {...register("name")} placeholder="Masalan: Comfort Mebel" className="h-12 rounded-xl bg-secondary/50 border-none" />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Faoliyat turi</Label>
              <Input {...register("activityType")} placeholder="Ishlab chiqaruvchi, diler..." className="h-12 rounded-xl bg-secondary/50 border-none" />
            </div>
            <div className="space-y-1.5">
              <Label>STIR (ixtiyoriy)</Label>
              <Input {...register("stir")} placeholder="123456789" type="number" className="h-12 rounded-xl bg-secondary/50 border-none" />
            </div>
            
            <Button className="w-full h-14 rounded-xl text-base font-bold mt-4" onClick={() => setStep(2)}>
              Keyingi qadam
            </Button>
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 animate-in slide-in-from-right-4">
            <div className="space-y-1.5">
              <Label>Telefon raqam</Label>
              <Input {...register("phone")} placeholder="+998 90 000 00 00" type="tel" className="h-12 rounded-xl bg-secondary/50 border-none" />
              {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Asosiy manzil</Label>
              <Input {...register("location")} placeholder="Toshkent sh., ..." className="h-12 rounded-xl bg-secondary/50 border-none" />
            </div>
            <div className="space-y-1.5">
              <Label>Do'kon haqida qisqacha</Label>
              <Textarea {...register("description")} placeholder="Qanday mebellar sotasiz?" className="rounded-xl bg-secondary/50 border-none" rows={4} />
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="secondary" className="flex-1 h-14 rounded-xl font-bold" onClick={() => setStep(1)}>
                Orqaga
              </Button>
              <Button type="submit" disabled={!isValid || createStore.isPending} className="flex-1 h-14 rounded-xl font-bold">
                {createStore.isPending ? "Yuborilmoqda..." : "Yuborish"}
              </Button>
            </div>
          </form>
        )}

        {step === 3 && (
          <div className="text-center py-10 animate-in zoom-in-95 duration-500">
            <div className="w-24 h-24 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12" />
            </div>
            <h2 className="font-display font-bold text-2xl mb-3">Arizangiz qabul qilindi!</h2>
            <p className="text-muted-foreground mb-8">
              Tez orada menejerlarimiz siz bilan bog'lanib, akkauntingizni faollashtirishadi.
            </p>
            <Button className="w-full h-14 rounded-xl text-base font-bold" onClick={() => navigate("/")}>
              Bosh sahifaga qaytish
            </Button>
          </div>
        )}

      </div>
    </MobileLayout>
  );
}
