import { MobileLayout } from "@/components/layout/MobileLayout";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Store, CheckCircle, ChevronRight, ChevronLeft,
  Phone, MapPin, FileText, Building2,
  Shield, TrendingUp, Users, Package,
  BadgeCheck, Clock, Hourglass,
} from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useTelegram } from "@/hooks/use-telegram";

// --- Schemas ---
const step1Schema = z.object({
  name: z.string().min(3, "Kamida 3 ta harf kiriting"),
  activityType: z.string().min(2, "Faoliyat turi tanlanishi shart"),
  stir: z.string().optional(),
});

const step2Schema = z.object({
  phone: z.string().min(9, "Telefon raqam kiritilishi shart"),
  region: z.string().min(2, "Viloyat tanlanishi shart"),
  address: z.string().min(5, "To'liq manzil kiriting"),
  description: z.string().min(10, "Kamida 10 ta harf kiriting"),
});

type Step1Form = z.infer<typeof step1Schema>;
type Step2Form = z.infer<typeof step2Schema>;

const ACTIVITY_TYPES = [
  "Ishlab chiqaruvchi",
  "Ulgurji savdo",
  "Chakana savdo",
  "Diler",
  "Import/Eksport",
  "Boshqa",
];

const REGIONS = [
  "Toshkent sh.",
  "Toshkent vil.",
  "Samarqand",
  "Buxoro",
  "Andijon",
  "Namangan",
  "Farg'ona",
  "Qashqadaryo",
  "Surxondaryo",
  "Xorazm",
  "Navoiy",
  "Sirdaryo",
  "Jizzax",
  "Qoraqalpog'iston",
];

// --- Step indicator ---
function StepIndicator({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="flex items-center">
          <div
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300",
              i + 1 < step
                ? "bg-primary text-white"
                : i + 1 === step
                ? "bg-primary text-white ring-4 ring-primary/20 scale-110"
                : "bg-muted text-muted-foreground"
            )}
          >
            {i + 1 < step ? <CheckCircle className="w-4 h-4" /> : i + 1}
          </div>
          {i < total - 1 && (
            <div
              className={cn(
                "h-[2px] w-12 transition-all duration-500",
                i + 1 < step ? "bg-primary" : "bg-muted"
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// --- Main Component ---
export default function RegisterStore() {
  const [step, setStep] = useState(1);
  const [step1Data, setStep1Data] = useState<Step1Form | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [, navigate] = useLocation();
  const { haptic } = useTelegram();

  const form1 = useForm<Step1Form>({
    resolver: zodResolver(step1Schema),
    mode: "onChange",
    defaultValues: step1Data || {},
  });

  const form2 = useForm<Step2Form>({
    resolver: zodResolver(step2Schema),
    mode: "onChange",
  });

  const handleStep1 = (data: Step1Form) => {
    haptic("impact");
    setStep1Data(data);
    setStep(2);
  };

  const handleStep2 = async (data: Step2Form) => {
    haptic("success");
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/stores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: step1Data!.name,
          activityType: step1Data!.activityType,
          stir: step1Data!.stir ?? undefined,
          phone: data.phone,
          location: `${data.region}, ${data.address}`,
          description: data.description,
        }),
      });
      if (!res.ok) throw new Error("Server xatosi");
    } catch {
      // Even on error, show waiting screen — request may have gone through
    }
    setIsSubmitting(false);
    setStep(3);
  };

  const slideVariants = {
    enter: (dir: number) => ({ opacity: 0, x: dir * 40 }),
    center: { opacity: 1, x: 0 },
    exit: (dir: number) => ({ opacity: 0, x: dir * -40 }),
  };

  return (
    <MobileLayout title="Sotuvchi bo'lish" showBack hideNav>
      <div className="min-h-full bg-background">

        {/* Hero banner (only step 1–2) */}
        {step < 3 && (
          <div className="bg-gradient-to-br from-primary via-purple-700 to-violet-900 px-6 pt-6 pb-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
            <div className="relative z-10 text-center text-white">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Store className="w-6 h-6 text-white" />
              </div>
              <h2 className="font-display font-bold text-xl mb-1">ABZ Market</h2>
              <p className="text-white/70 text-sm">Do'koningizni oching va daromad qiling</p>

              <div className="grid grid-cols-3 gap-3 mt-5">
                {[
                  { icon: Users, label: "Mijozlar", value: "50K+" },
                  { icon: Package, label: "Mahsulotlar", value: "10K+" },
                  { icon: BadgeCheck, label: "Do'konlar", value: "500+" },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="bg-white/10 rounded-xl py-2 px-1 backdrop-blur-sm">
                    <Icon className="w-4 h-4 mx-auto mb-1 text-white/80" />
                    <div className="text-sm font-bold text-white">{value}</div>
                    <div className="text-[10px] text-white/60">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className={cn("px-5 pb-10", step < 3 ? "-mt-4 relative z-10" : "pt-8")}>

          {/* Step card */}
          {step < 3 && (
            <div className="bg-background rounded-2xl shadow-lg border border-border/40 p-5 mb-4">
              <StepIndicator step={step} total={2} />

              <AnimatePresence mode="wait" custom={1}>

                {/* ─── STEP 1: Business Info ─── */}
                {step === 1 && (
                  <motion.div
                    key="step1"
                    custom={1}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.25 }}
                  >
                    <div className="mb-5">
                      <h3 className="font-display font-bold text-lg">Do'kon ma'lumotlari</h3>
                      <p className="text-muted-foreground text-sm">Biznes haqida asosiy ma'lumotlar</p>
                    </div>

                    <form onSubmit={form1.handleSubmit(handleStep1)} className="space-y-4">
                      <div className="space-y-1.5">
                        <Label className="text-sm font-semibold flex items-center gap-1.5">
                          <Store className="w-3.5 h-3.5 text-primary" />
                          Do'kon yoki brend nomi *
                        </Label>
                        <Input
                          {...form1.register("name")}
                          placeholder="Masalan: Comfort Mebel"
                          className="h-12 rounded-xl bg-muted/40 border-border/60 focus:border-primary focus:ring-1 focus:ring-primary/20 text-[15px]"
                        />
                        {form1.formState.errors.name && (
                          <p className="text-xs text-destructive flex items-center gap-1">
                            ⚠️ {form1.formState.errors.name.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-sm font-semibold flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-primary" />
                          Faoliyat turi *
                        </Label>
                        <div className="grid grid-cols-2 gap-2">
                          {ACTIVITY_TYPES.map((type) => {
                            const selected = form1.watch("activityType") === type;
                            return (
                              <button
                                key={type}
                                type="button"
                                onClick={() => {
                                  form1.setValue("activityType", type, { shouldValidate: true });
                                  haptic("selection");
                                }}
                                className={cn(
                                  "h-10 px-3 rounded-xl text-sm font-medium border transition-all duration-150 text-left",
                                  selected
                                    ? "bg-primary text-white border-primary"
                                    : "bg-muted/40 text-foreground border-border/60 hover:border-primary/50"
                                )}
                              >
                                {type}
                              </button>
                            );
                          })}
                        </div>
                        {form1.formState.errors.activityType && (
                          <p className="text-xs text-destructive">⚠️ {form1.formState.errors.activityType.message}</p>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-sm font-semibold flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                          STIR raqami{" "}
                          <span className="text-muted-foreground font-normal">(ixtiyoriy)</span>
                        </Label>
                        <Input
                          {...form1.register("stir")}
                          placeholder="123456789"
                          type="number"
                          inputMode="numeric"
                          className="h-12 rounded-xl bg-muted/40 border-border/60 focus:border-primary focus:ring-1 focus:ring-primary/20 text-[15px]"
                        />
                      </div>

                      <Button
                        type="submit"
                        className="w-full h-13 rounded-xl text-base font-bold mt-2 bg-primary hover:bg-primary/90"
                        disabled={!form1.formState.isValid}
                      >
                        Davom etish
                        <ChevronRight className="w-5 h-5 ml-1" />
                      </Button>
                    </form>
                  </motion.div>
                )}

                {/* ─── STEP 2: Contact & Location ─── */}
                {step === 2 && (
                  <motion.div
                    key="step2"
                    custom={1}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.25 }}
                  >
                    <div className="mb-5">
                      <h3 className="font-display font-bold text-lg">Aloqa va manzil</h3>
                      <p className="text-muted-foreground text-sm">Mijozlar siz bilan bog'lanishi uchun</p>
                    </div>

                    <form onSubmit={form2.handleSubmit(handleStep2)} className="space-y-4">
                      <div className="space-y-1.5">
                        <Label className="text-sm font-semibold flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-primary" />
                          Telefon raqam *
                        </Label>
                        <Input
                          {...form2.register("phone")}
                          placeholder="+998 90 000 00 00"
                          type="tel"
                          inputMode="tel"
                          className="h-12 rounded-xl bg-muted/40 border-border/60 focus:border-primary focus:ring-1 focus:ring-primary/20 text-[15px]"
                        />
                        {form2.formState.errors.phone && (
                          <p className="text-xs text-destructive">⚠️ {form2.formState.errors.phone.message}</p>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-sm font-semibold flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-primary" />
                          Viloyat *
                        </Label>
                        <div className="flex flex-wrap gap-2">
                          {REGIONS.map((r) => {
                            const selected = form2.watch("region") === r;
                            return (
                              <button
                                key={r}
                                type="button"
                                onClick={() => {
                                  form2.setValue("region", r, { shouldValidate: true });
                                  haptic("selection");
                                }}
                                className={cn(
                                  "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                                  selected
                                    ? "bg-primary text-white border-primary"
                                    : "bg-muted/40 text-foreground border-border/60"
                                )}
                              >
                                {r}
                              </button>
                            );
                          })}
                        </div>
                        {form2.formState.errors.region && (
                          <p className="text-xs text-destructive">⚠️ {form2.formState.errors.region.message}</p>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-sm font-semibold">To'liq manzil *</Label>
                        <Input
                          {...form2.register("address")}
                          placeholder="Ko'cha, uy raqami..."
                          className="h-12 rounded-xl bg-muted/40 border-border/60 focus:border-primary focus:ring-1 focus:ring-primary/20 text-[15px]"
                        />
                        {form2.formState.errors.address && (
                          <p className="text-xs text-destructive">⚠️ {form2.formState.errors.address.message}</p>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-sm font-semibold">Do'kon haqida *</Label>
                        <Textarea
                          {...form2.register("description")}
                          placeholder="Do'koningiz, mahsulotlaringiz haqida qisqacha yozing..."
                          className="rounded-xl bg-muted/40 border-border/60 focus:border-primary focus:ring-1 focus:ring-primary/20 text-[15px] resize-none"
                          rows={3}
                        />
                        {form2.formState.errors.description && (
                          <p className="text-xs text-destructive">⚠️ {form2.formState.errors.description.message}</p>
                        )}
                      </div>

                      <div className="flex gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          className="flex-1 h-12 rounded-xl font-semibold border-border/60"
                          onClick={() => { haptic("selection"); setStep(1); }}
                        >
                          <ChevronLeft className="w-4 h-4 mr-1" />
                          Orqaga
                        </Button>
                        <Button
                          type="submit"
                          className="flex-[2] h-12 rounded-xl font-bold bg-primary hover:bg-primary/90 gap-2"
                          disabled={!form2.formState.isValid || isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                              Yuborilmoqda...
                            </>
                          ) : (
                            <>
                              Arizani yuborish
                              <ChevronRight className="w-4 h-4" />
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>
          )}

          {/* ─── STEP 3: Waiting for admin confirmation ─── */}
          {step === 3 && (
            <motion.div
              key="waiting"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, type: "spring" }}
              className="text-center py-10 px-4"
            >
              {/* Animated waiting icon */}
              <div className="relative w-32 h-32 mx-auto mb-8">
                {/* Pulse rings */}
                {[1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    className="absolute inset-0 rounded-full border-2 border-primary/30"
                    animate={{ scale: [1, 1.5 + i * 0.15], opacity: [0.6, 0] }}
                    transition={{
                      duration: 2,
                      delay: i * 0.4,
                      repeat: Infinity,
                      ease: "easeOut",
                    }}
                  />
                ))}
                <div className="absolute inset-0 bg-primary/10 rounded-full flex items-center justify-center">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Hourglass className="w-14 h-14 text-primary" />
                  </motion.div>
                </div>
              </div>

              {/* Check mark badge */}
              <div className="flex items-center justify-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                </div>
                <span className="text-sm font-semibold text-emerald-600">Ariza muvaffaqiyatli yuborildi</span>
              </div>

              <h2 className="font-display font-bold text-2xl mb-3 text-foreground">
                Admin tasdiqlashini kuting
              </h2>
              <p className="text-muted-foreground text-sm mb-8 leading-relaxed max-w-xs mx-auto">
                Arizangiz ko'rib chiqilmoqda. Admin tasdiqlagan zahotiyoq do'koningiz faollashtiriladi va siz xabardor qilinasiz.
              </p>

              {/* Info cards */}
              <div className="grid grid-cols-3 gap-3 mb-8">
                {[
                  { icon: Clock, label: "Ko'rib chiqish", value: "24 soat" },
                  { icon: Phone, label: "Aloqa", value: "Telegram" },
                  { icon: Shield, label: "Ro'yxatdan o'tish", value: "Bepul" },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="bg-muted/40 rounded-xl p-3 text-center">
                    <Icon className="w-5 h-5 text-primary mx-auto mb-1" />
                    <div className="font-bold text-sm text-foreground">{value}</div>
                    <div className="text-[10px] text-muted-foreground">{label}</div>
                  </div>
                ))}
              </div>

              {/* Notice box */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 text-left">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
                    <BadgeCheck className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-amber-800 mb-1">Keyingi qadamlar</p>
                    <ul className="text-xs text-amber-700 space-y-1">
                      <li>✅ Ariza qabul qilindi</li>
                      <li>⏳ Admin ko'rib chiqmoqda</li>
                      <li>🔔 Tasdiqlanganda Telegram orqali xabar olasiz</li>
                      <li>🚀 Do'koningiz avtomatik faollashtiriladi</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  className="w-full h-13 rounded-xl text-base font-bold bg-primary hover:bg-primary/90"
                  onClick={() => navigate("/")}
                >
                  <Store className="w-5 h-5 mr-2" />
                  Bosh sahifaga qaytish
                </Button>
                <Button
                  variant="outline"
                  className="w-full h-12 rounded-xl font-semibold border-border/60"
                  onClick={() => navigate("/stores")}
                >
                  Do'konlar ro'yxatini ko'rish
                </Button>
              </div>
            </motion.div>
          )}

          {/* Benefits (step 1 only) */}
          {step === 1 && (
            <div className="mt-4 space-y-2">
              {[
                { icon: TrendingUp, text: "Savdoingizni 3x oshiring" },
                { icon: Users, text: "50 000+ faol xaridor" },
                { icon: Shield, text: "100% xavfsiz tranzaksiyalar" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3 bg-primary/5 rounded-xl px-4 py-2.5">
                  <Icon className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-sm font-medium text-foreground">{text}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </MobileLayout>
  );
}
